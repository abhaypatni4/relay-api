"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invitationsController = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const invitation_service_1 = require("../services/invitation.service");
const acceptBody = zod_1.z.object({
    role: zod_1.z.enum(client_1.Role).optional(),
});
exports.invitationsController = {
    validatePublic: async (req, res) => {
        const raw = req.params.token;
        const token = Array.isArray(raw) ? raw[0] : raw;
        if (!token) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        const result = await (0, invitation_service_1.validateInvitationToken)(token);
        if (!result.ok) {
            if (result.reason === 'expired') {
                res.status(410).json({ error: 'expired', valid: false });
                return;
            }
            res.status(404).json({ error: 'Not found', valid: false });
            return;
        }
        res.json({ teamName: result.teamName, sport: result.sport, valid: true });
    },
    accept: async (req, res) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const raw = req.params.token;
        const token = Array.isArray(raw) ? raw[0] : raw;
        if (!token) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        const parsed = acceptBody.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid body' });
            return;
        }
        try {
            const role = parsed.data.role ?? 'player';
            const out = await (0, invitation_service_1.acceptInvitation)(req.user.userId, token, role);
            res.status(201).json({
                teamId: out.teamId,
                teamMemberId: out.teamMemberId,
                teamName: out.teamName,
            });
        }
        catch (e) {
            const code = e instanceof Error ? e.message : '';
            if (code === 'ALREADY_MEMBER') {
                res.status(409).json({ error: 'Already a member of this team' });
                return;
            }
            if (code === 'INVITE_EXPIRED') {
                res.status(410).json({ error: 'expired' });
                return;
            }
            if (code === 'INVITE_NOT_FOUND') {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            throw e;
        }
    },
    createForTeam: async (req, res) => {
        const teamId = req.params.teamId;
        const id = Array.isArray(teamId) ? teamId[0] : teamId;
        if (!id) {
            res.status(400).json({ error: 'teamId required' });
            return;
        }
        const { token, expiresAt } = await (0, invitation_service_1.createInvitationForTeam)(id);
        res.status(201).json({
            token,
            expiresAt: expiresAt.toISOString(),
            deepLink: `relay://invite/${token}`,
        });
    },
};
//# sourceMappingURL=invitations.controller.js.map