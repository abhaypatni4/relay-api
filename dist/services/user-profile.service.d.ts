import type { OnboardingState, Role } from '@prisma/client';
export declare function getCurrentUserProfile(userId: string): Promise<{
    user: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        emergencyAllergyAlert: string | null;
        emergencyStaffNote: string | null;
        emergencyInfoUpdatedAt: Date | null;
    };
    memberships: {
        teamId: string;
        teamMemberId: string;
        role: Role;
        onboardingState: OnboardingState;
        teamName: string;
        sport: string | null;
    }[];
}>;
export declare function patchCurrentUser(userId: string, input: {
    name?: string;
    role?: Role;
    customRoleLabel?: string | null;
    jerseyNumber?: string | null;
    teamId?: string;
}): Promise<void>;
export type EmergencyFieldErrors = Partial<Record<'contactName' | 'contactPhone' | 'allergyAlert' | 'staffNote', string[]>>;
export declare function validateEmergencyPayload(input: {
    contactName?: unknown;
    contactPhone?: unknown;
    allergyAlert?: unknown;
    staffNote?: unknown;
}): {
    ok: true;
    data: {
        contactName: string;
        contactPhone: string;
        allergyAlert: string;
        staffNote: string | null;
    };
} | {
    ok: false;
    fields: EmergencyFieldErrors;
};
export declare function patchEmergencyInfo(userId: string, data: {
    contactName: string;
    contactPhone: string;
    allergyAlert: string;
    staffNote: string | null;
}): Promise<void>;
export declare function deferEmergencyInfoReminder(userId: string): Promise<void>;
//# sourceMappingURL=user-profile.service.d.ts.map