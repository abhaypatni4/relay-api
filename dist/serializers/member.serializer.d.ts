import type { OnboardingState, Role } from '@prisma/client';
import type { JsonObject } from './base.serializer';
export interface TeamMemberWithUser {
    id: string;
    userId: string;
    teamId: string;
    role: Role;
    onboardingState: OnboardingState;
    jerseyNumber: string | null;
    customRoleLabel: string | null;
    invitedAt: Date;
    joinedAt: Date | null;
    name: string;
    email: string | null;
    phone: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    emergencyAllergyAlert: string | null;
    emergencyStaffNote: string | null;
    emergencyInfoUpdatedAt: Date | null;
}
/**
 * TeamMember + joined user display fields. Strips emergencyInfo entirely for Player viewers.
 */
export declare function serializeTeamMember(viewerRole: Role, row: TeamMemberWithUser): JsonObject;
/**
 * Roster list: coordinator sees full operational detail; coach/staff/player see names and roles only.
 */
export declare function serializeRosterMember(viewerRole: Role, row: TeamMemberWithUser): JsonObject;
//# sourceMappingURL=member.serializer.d.ts.map