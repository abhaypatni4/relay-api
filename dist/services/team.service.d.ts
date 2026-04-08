import type { Prisma } from '@prisma/client';
export declare function createTeamForUser(userId: string, input: {
    name: string;
    sport?: string | null;
    homeLocation?: string | null;
}): Promise<{
    teamId: string;
    memberId: string;
}>;
export declare function getTeamById(teamId: string): Promise<Prisma.TeamGetPayload<object> | null>;
export declare function updateTeam(teamId: string, data: {
    name?: string;
    sport?: string | null;
    homeLocation?: string | null;
}): Promise<void>;
export interface MemberWithUserRow {
    id: string;
    userId: string;
    teamId: string;
    role: import('@prisma/client').Role;
    onboardingState: import('@prisma/client').OnboardingState;
    jerseyNumber: string | null;
    customRoleLabel: string | null;
    invitedAt: Date;
    joinedAt: Date | null;
    user: {
        name: string;
        email: string | null;
        phone: string | null;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        emergencyAllergyAlert: string | null;
        emergencyStaffNote: string | null;
        emergencyInfoUpdatedAt: Date | null;
    };
}
export declare function listTeamMembersWithUsers(teamId: string): Promise<MemberWithUserRow[]>;
export declare function getTeamMemberById(teamId: string, memberId: string): Promise<{
    id: string;
    userId: string;
    teamId: string;
    role: import("@prisma/client").$Enums.Role;
    onboardingState: import("@prisma/client").$Enums.OnboardingState;
    jerseyNumber: string | null;
    customRoleLabel: string | null;
    invitedAt: Date;
    joinedAt: Date | null;
    removedAt: Date | null;
} | null>;
export declare function softRemoveTeamMember(teamId: string, memberId: string): Promise<void>;
export declare function toTeamMemberWithUser(row: MemberWithUserRow): import('../serializers/member.serializer').TeamMemberWithUser;
export declare function sortMembersForRoster<T extends {
    onboardingState: string;
    user: {
        name: string;
    };
}>(rows: T[]): T[];
//# sourceMappingURL=team.service.d.ts.map