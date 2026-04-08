"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTeamMember = requireTeamMember;
const prisma_1 = require("../db/prisma");
/**
 * Requires :teamId route param. Attaches active team membership only (pending → 403).
 */
async function requireTeamMember(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const raw = req.params.teamId;
    const teamId = Array.isArray(raw) ? raw[0] : raw;
    if (!teamId) {
        res.status(400).json({ error: 'teamId required' });
        return;
    }
    const member = await prisma_1.prisma.teamMember.findFirst({
        where: {
            teamId,
            userId: req.user.userId,
            removedAt: null,
            onboardingState: 'active',
        },
    });
    if (!member) {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }
    req.member = {
        id: member.id,
        userId: member.userId,
        teamId: member.teamId,
        role: member.role,
        onboardingState: member.onboardingState,
    };
    next();
}
//# sourceMappingURL=requireTeamMember.js.map