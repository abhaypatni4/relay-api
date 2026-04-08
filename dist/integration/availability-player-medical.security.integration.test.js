"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const supertest_1 = __importDefault(require("supertest"));
const vitest_1 = require("vitest");
const app_1 = require("../app");
const env_1 = require("../config/env");
const prisma_1 = require("../db/prisma");
const jwt_1 = require("../utils/jwt");
/**
 * Security: operationalStatus / medicallyRestricted must never appear in Player-role
 * GET /events/:eventId/availability responses (see M5 requirements).
 */
let envForTest = null;
try {
    envForTest = (0, env_1.getEnv)();
}
catch {
    envForTest = null;
}
(envForTest ? vitest_1.describe : vitest_1.describe.skip)('availability player medical security (integration)', () => {
    let app;
    let env;
    let teamId = '';
    let eventId = '';
    let coordUserId = '';
    let playerUserId = '';
    let player2UserId = '';
    let playerMemberId = '';
    (0, vitest_1.beforeAll)(async () => {
        if (!envForTest) {
            throw new Error('Missing env'); // should be skipped; defensive
        }
        env = envForTest;
        app = (0, app_1.createApp)(env);
        const suffix = `${String(Date.now())}_${Math.random().toString(36).slice(2, 9)}`;
        const passHash = await bcrypt_1.default.hash('Password123456!', 12);
        const coordUser = await prisma_1.prisma.user.create({
            data: {
                name: 'Coord',
                email: `coord_${suffix}@test.relay`,
                passwordHash: passHash,
            },
        });
        const playerUser = await prisma_1.prisma.user.create({
            data: {
                name: 'Player One',
                email: `p1_${suffix}@test.relay`,
                passwordHash: passHash,
            },
        });
        const player2User = await prisma_1.prisma.user.create({
            data: {
                name: 'Player Two',
                email: `p2_${suffix}@test.relay`,
                passwordHash: passHash,
            },
        });
        coordUserId = coordUser.id;
        playerUserId = playerUser.id;
        player2UserId = player2User.id;
        const team = await prisma_1.prisma.team.create({
            data: { name: `Team ${suffix}` },
        });
        teamId = team.id;
        const coordMember = await prisma_1.prisma.teamMember.create({
            data: {
                userId: coordUser.id,
                teamId: team.id,
                role: 'coordinator',
                onboardingState: 'active',
                joinedAt: new Date(),
            },
        });
        const p1 = await prisma_1.prisma.teamMember.create({
            data: {
                userId: playerUser.id,
                teamId: team.id,
                role: 'player',
                onboardingState: 'active',
                joinedAt: new Date(),
            },
        });
        await prisma_1.prisma.teamMember.create({
            data: {
                userId: player2User.id,
                teamId: team.id,
                role: 'player',
                onboardingState: 'active',
                joinedAt: new Date(),
            },
        });
        playerMemberId = p1.id;
        const event = await prisma_1.prisma.event.create({
            data: {
                teamId: team.id,
                type: 'match',
                name: 'Security Test Match',
                date: new Date('2026-07-15T12:00:00.000Z'),
                startTime: '19:00',
                status: 'active',
                createdBy: coordMember.id,
            },
        });
        eventId = event.id;
    }, 120_000);
    (0, vitest_1.afterAll)(async () => {
        try {
            if (eventId && teamId) {
                await prisma_1.prisma.availabilitySubmission.deleteMany({
                    where: { availabilityWindow: { eventId } },
                });
                await prisma_1.prisma.availabilityWindow.deleteMany({ where: { eventId } });
            }
            if (teamId) {
                await prisma_1.prisma.event.deleteMany({ where: { teamId } });
                await prisma_1.prisma.teamMember.deleteMany({ where: { teamId } });
                await prisma_1.prisma.team.deleteMany({ where: { id: teamId } });
            }
            const userIds = [coordUserId, playerUserId, player2UserId].filter((id) => id.length > 0);
            if (userIds.length > 0) {
                await prisma_1.prisma.user.deleteMany({ where: { id: { in: userIds } } });
            }
        }
        finally {
            await prisma_1.prisma.$disconnect();
        }
    });
    (0, vitest_1.it)('player GET /availability omits operational fields and never includes medicallyRestricted', async () => {
        const coordToken = (0, jwt_1.signAccessToken)(env, {
            userId: coordUserId,
            email: `coord@test.relay`,
        });
        const playerToken = (0, jwt_1.signAccessToken)(env, {
            userId: playerUserId,
            email: `p1@test.relay`,
        });
        const player2Token = (0, jwt_1.signAccessToken)(env, {
            userId: player2UserId,
            email: `p2@test.relay`,
        });
        await (0, supertest_1.default)(app)
            .post(`/events/${eventId}/availability/open`)
            .set('Authorization', `Bearer ${coordToken}`)
            .expect(201);
        await (0, supertest_1.default)(app)
            .post(`/events/${eventId}/availability/submit`)
            .set('Authorization', `Bearer ${playerToken}`)
            .send({ availabilityStatus: 'available' })
            .expect(200);
        await (0, supertest_1.default)(app)
            .post(`/events/${eventId}/availability/submit`)
            .set('Authorization', `Bearer ${player2Token}`)
            .send({ availabilityStatus: 'limited' })
            .expect(200);
        const rosterRes = await (0, supertest_1.default)(app)
            .get(`/events/${eventId}/availability`)
            .set('Authorization', `Bearer ${coordToken}`)
            .expect(200);
        const rosterBody = rosterRes.body;
        const p1Row = rosterBody.submissions.find((s) => s.teamMemberId === playerMemberId);
        if (!p1Row) {
            throw new Error('expected player submission row');
        }
        const submissionId = p1Row.id;
        await (0, supertest_1.default)(app)
            .patch(`/events/${eventId}/availability/${submissionId}/operational`)
            .set('Authorization', `Bearer ${coordToken}`)
            .send({ operationalStatus: 'medicallyRestricted' })
            .expect(200);
        const playerGet = await (0, supertest_1.default)(app)
            .get(`/events/${eventId}/availability`)
            .set('Authorization', `Bearer ${playerToken}`)
            .expect(200);
        const playerBody = playerGet.body;
        (0, vitest_1.expect)(playerGet.status).toBe(200);
        (0, vitest_1.expect)(Array.isArray(playerBody.submissions)).toBe(true);
        (0, vitest_1.expect)(playerBody.submissions.length).toBe(1);
        const playerSub = playerBody.submissions[0];
        if (!playerSub) {
            throw new Error('expected one submission for player');
        }
        (0, vitest_1.expect)(playerSub.teamMemberId).toBe(playerMemberId);
        (0, vitest_1.expect)(playerSub).not.toHaveProperty('operationalStatus');
        (0, vitest_1.expect)(playerSub).not.toHaveProperty('operationalStatusSetBy');
        const raw = JSON.stringify(playerBody);
        (0, vitest_1.expect)(raw).not.toContain('medicallyRestricted');
        console.log('SECURITY TEST PASSED');
    });
});
//# sourceMappingURL=availability-player-medical.security.integration.test.js.map