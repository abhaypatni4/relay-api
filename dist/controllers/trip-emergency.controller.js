"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripEmergencyController = void 0;
const prisma_1 = require("../db/prisma");
function isAllEmergencyInfoNull(user) {
    return (user.emergencyContactName === null &&
        user.emergencyContactPhone === null &&
        user.emergencyAllergyAlert === null &&
        user.emergencyStaffNote === null &&
        user.emergencyInfoUpdatedAt === null);
}
exports.tripEmergencyController = {
    getEmergencyInfo: async (req, res) => {
        if (!req.member || !req.eventRow) {
            res.status(500).json({ error: 'Missing context' });
            return;
        }
        if (!(req.member.role === 'coordinator' || req.member.role === 'coach' || req.member.role === 'staff')) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        if (req.eventRow.type !== 'trip') {
            res.status(400).json({ error: 'Not a trip event' });
            return;
        }
        const raw = req.params.memberId;
        const memberId = Array.isArray(raw) ? raw[0] : raw;
        if (!memberId) {
            res.status(400).json({ error: 'memberId required' });
            return;
        }
        const tw = await prisma_1.prisma.tripWorkspace.findUnique({
            where: { eventId: req.eventRow.id },
            select: { id: true },
        });
        if (!tw) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        // Must be a traveling squad member for this trip workspace.
        const assignment = await prisma_1.prisma.tripSquadAssignment.findUnique({
            where: {
                tripWorkspaceId_teamMemberId: {
                    tripWorkspaceId: tw.id,
                    teamMemberId: memberId,
                },
            },
            include: {
                teamMember: {
                    select: {
                        id: true,
                        userId: true,
                        user: {
                            select: {
                                emergencyContactName: true,
                                emergencyContactPhone: true,
                                emergencyAllergyAlert: true,
                                emergencyStaffNote: true,
                                emergencyInfoUpdatedAt: true,
                            },
                        },
                    },
                },
            },
        });
        if (assignment?.travelingStatus !== 'traveling') {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        const targetUserId = assignment.teamMember.userId;
        const u = assignment.teamMember.user;
        if (isAllEmergencyInfoNull(u)) {
            res.status(404).json({ message: 'Emergency info not on file for this member.' });
            return;
        }
        // Compliance: ALWAYS log on successful response.
        await prisma_1.prisma.emergencyInfoAccessLog.create({
            data: {
                accessedById: req.member.id,
                accessedForId: targetUserId,
                tripWorkspaceId: tw.id,
                accessedAt: new Date(),
            },
        });
        const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        const updatedAt = u.emergencyInfoUpdatedAt;
        const isStale = updatedAt === null || updatedAt < cutoff;
        res.status(200).json({
            contactName: u.emergencyContactName,
            contactPhone: u.emergencyContactPhone,
            allergyAlert: u.emergencyAllergyAlert,
            staffNote: u.emergencyStaffNote,
            updatedAt: updatedAt?.toISOString() ?? null,
            isStale,
        });
    },
};
//# sourceMappingURL=trip-emergency.controller.js.map