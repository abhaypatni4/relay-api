"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeTeamMember = serializeTeamMember;
exports.serializeRosterMember = serializeRosterMember;
const base_serializer_1 = require("./base.serializer");
/**
 * TeamMember + joined user display fields. Strips emergencyInfo entirely for Player viewers.
 */
function serializeTeamMember(viewerRole, row) {
    const base = {
        id: row.id,
        userId: row.userId,
        teamId: row.teamId,
        role: row.role,
        onboardingState: row.onboardingState,
        jerseyNumber: row.jerseyNumber,
        customRoleLabel: row.customRoleLabel,
        invitedAt: row.invitedAt.toISOString(),
        joinedAt: row.joinedAt?.toISOString() ?? null,
        name: row.name,
        email: row.email,
        phone: row.phone,
    };
    if ((0, base_serializer_1.isPlayerViewer)(viewerRole)) {
        return base;
    }
    const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const isStale = row.emergencyInfoUpdatedAt === null || row.emergencyInfoUpdatedAt < cutoff;
    base.emergencyInfo = {
        contactName: row.emergencyContactName,
        contactPhone: row.emergencyContactPhone,
        allergyAlert: row.emergencyAllergyAlert,
        staffNote: row.emergencyStaffNote,
        updatedAt: row.emergencyInfoUpdatedAt?.toISOString() ?? null,
        isStale,
    };
    return base;
}
/**
 * Roster list: coordinator sees full operational detail; coach/staff/player see names and roles only.
 */
function serializeRosterMember(viewerRole, row) {
    if (viewerRole === 'coordinator') {
        return serializeTeamMember('coach', row);
    }
    const o = {
        id: row.id,
        name: row.name,
        role: row.role,
    };
    if (row.customRoleLabel) {
        o.customRoleLabel = row.customRoleLabel;
    }
    return o;
}
//# sourceMappingURL=member.serializer.js.map