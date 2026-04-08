"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamsController = void 0;
const zod_1 = require("zod");
const member_serializer_1 = require("../serializers/member.serializer");
const team_service_1 = require("../services/team.service");
const createBody = zod_1.z.object({
    name: zod_1.z.string().trim().min(1),
    sport: zod_1.z.string().trim().optional().nullable(),
    homeLocation: zod_1.z.string().trim().optional().nullable(),
});
const patchBody = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).optional(),
    sport: zod_1.z.string().trim().optional().nullable(),
    homeLocation: zod_1.z.string().trim().optional().nullable(),
});
exports.teamsController = {
    create: async (req, res) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const parsed = createBody.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid body' });
            return;
        }
        const { teamId, memberId } = await (0, team_service_1.createTeamForUser)(req.user.userId, parsed.data);
        const team = await (0, team_service_1.getTeamById)(teamId);
        res.status(201).json({
            team: team
                ? {
                    id: team.id,
                    name: team.name,
                    sport: team.sport,
                    homeLocation: team.homeLocation,
                    createdAt: team.createdAt.toISOString(),
                }
                : null,
            teamMemberId: memberId,
        });
    },
    getById: async (req, res) => {
        const teamId = req.params.teamId;
        const id = Array.isArray(teamId) ? teamId[0] : teamId;
        if (!id) {
            res.status(400).json({ error: 'teamId required' });
            return;
        }
        const team = await (0, team_service_1.getTeamById)(id);
        if (!team) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json({
            id: team.id,
            name: team.name,
            sport: team.sport,
            homeLocation: team.homeLocation,
            createdAt: team.createdAt.toISOString(),
        });
    },
    listMembers: async (req, res) => {
        if (!req.member) {
            res.status(500).json({ error: 'Missing member' });
            return;
        }
        const teamId = req.params.teamId;
        const id = Array.isArray(teamId) ? teamId[0] : teamId;
        if (!id) {
            res.status(400).json({ error: 'teamId required' });
            return;
        }
        const rows = (0, team_service_1.sortMembersForRoster)(await (0, team_service_1.listTeamMembersWithUsers)(id));
        const viewerRole = req.member.role;
        const members = rows.map((r) => (0, member_serializer_1.serializeRosterMember)(viewerRole, (0, team_service_1.toTeamMemberWithUser)(r)));
        res.json({ members });
    },
    patch: async (req, res) => {
        const teamId = req.params.teamId;
        const id = Array.isArray(teamId) ? teamId[0] : teamId;
        if (!id) {
            res.status(400).json({ error: 'teamId required' });
            return;
        }
        const parsed = patchBody.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid body' });
            return;
        }
        if (Object.keys(parsed.data).length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }
        await (0, team_service_1.updateTeam)(id, parsed.data);
        const team = await (0, team_service_1.getTeamById)(id);
        if (!team) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json({
            id: team.id,
            name: team.name,
            sport: team.sport,
            homeLocation: team.homeLocation,
            createdAt: team.createdAt.toISOString(),
        });
    },
    removeMember: async (req, res) => {
        const teamId = req.params.teamId;
        const memberId = req.params.memberId;
        const safeTeamId = Array.isArray(teamId) ? teamId[0] : teamId;
        const safeMemberId = Array.isArray(memberId) ? memberId[0] : memberId;
        if (!safeTeamId || !safeMemberId) {
            res.status(400).json({ error: 'teamId and memberId required' });
            return;
        }
        const member = await (0, team_service_1.getTeamMemberById)(safeTeamId, safeMemberId);
        if (!member) {
            res.status(404).json({ error: 'Member not found' });
            return;
        }
        if (member.role === 'coordinator') {
            res.status(400).json({ error: 'Cannot remove the coordinator. Transfer the role first.' });
            return;
        }
        await (0, team_service_1.softRemoveTeamMember)(safeTeamId, safeMemberId);
        res.status(204).send();
    },
};
//# sourceMappingURL=teams.controller.js.map