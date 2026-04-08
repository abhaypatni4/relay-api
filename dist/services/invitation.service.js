"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvitationForTeam = createInvitationForTeam;
exports.validateInvitationToken = validateInvitationToken;
exports.acceptInvitation = acceptInvitation;
const node_crypto_1 = require("node:crypto");
const prisma_1 = require("../db/prisma");
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
function generateToken() {
    return (0, node_crypto_1.randomBytes)(32).toString('base64url');
}
async function createInvitationForTeam(teamId) {
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
    const token = generateToken();
    await prisma_1.prisma.invitationLink.updateMany({
        where: { teamId, isRevoked: false },
        data: { isRevoked: true },
    });
    await prisma_1.prisma.invitationLink.create({
        data: {
            teamId,
            token,
            expiresAt,
        },
    });
    return { token, expiresAt };
}
async function validateInvitationToken(rawToken) {
    const link = await prisma_1.prisma.invitationLink.findUnique({
        where: { token: rawToken },
        include: { team: true },
    });
    if (!link || link.isRevoked) {
        return { ok: false, reason: 'not_found' };
    }
    if (link.expiresAt < new Date()) {
        return { ok: false, reason: 'expired' };
    }
    return { ok: true, teamName: link.team.name, sport: link.team.sport };
}
async function acceptInvitation(userId, rawToken, role = 'player') {
    const link = await prisma_1.prisma.invitationLink.findUnique({
        where: { token: rawToken },
        include: { team: true },
    });
    if (!link || link.isRevoked) {
        throw new Error('INVITE_NOT_FOUND');
    }
    if (link.expiresAt < new Date()) {
        throw new Error('INVITE_EXPIRED');
    }
    const existing = await prisma_1.prisma.teamMember.findUnique({
        where: { userId_teamId: { userId, teamId: link.teamId } },
    });
    if (existing && !existing.removedAt) {
        throw new Error('ALREADY_MEMBER');
    }
    const member = await prisma_1.prisma.teamMember.create({
        data: {
            userId,
            teamId: link.teamId,
            role,
            onboardingState: 'invited',
        },
    });
    return {
        teamId: link.teamId,
        teamMemberId: member.id,
        teamName: link.team.name,
    };
}
//# sourceMappingURL=invitation.service.js.map