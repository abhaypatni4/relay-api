"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireEventTeamMember = requireEventTeamMember;
const prisma_1 = require("../db/prisma");
/**
 * Requires :eventId. Loads event and verifies active team membership on event.teamId.
 */
async function requireEventTeamMember(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const raw = req.params.eventId;
    const eventId = Array.isArray(raw) ? raw[0] : raw;
    if (!eventId) {
        res.status(400).json({ error: 'eventId required' });
        return;
    }
    const event = await prisma_1.prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, teamId: true, type: true, status: true, name: true },
    });
    if (!event) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    const member = await prisma_1.prisma.teamMember.findFirst({
        where: {
            teamId: event.teamId,
            userId: req.user.userId,
            removedAt: null,
            onboardingState: 'active',
        },
    });
    if (!member) {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }
    req.eventRow = event;
    req.member = {
        id: member.id,
        userId: member.userId,
        teamId: member.teamId,
        role: member.role,
        onboardingState: member.onboardingState,
    };
    next();
}
//# sourceMappingURL=requireEventTeamMember.js.map