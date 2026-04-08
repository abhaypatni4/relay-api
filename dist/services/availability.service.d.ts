import type { OperationalStatus, Prisma, Role } from '@prisma/client';
export type OpenWindowResult = {
    ok: true;
    windowId: string;
} | {
    ok: false;
    code: 'EVENT_NOT_FOUND' | 'WINDOW_EXISTS';
};
export declare function openAvailabilityWindow(eventId: string, openedByMemberId: string, eventName: string): Promise<OpenWindowResult>;
declare const submissionInclude: {
    teamMember: {
        select: {
            id: true;
            role: true;
            user: {
                select: {
                    name: true;
                };
            };
        };
    };
};
export type SubmissionWithMember = Prisma.AvailabilitySubmissionGetPayload<{
    include: typeof submissionInclude;
}>;
export declare function loadSubmissionsForWindow(windowId: string): Promise<SubmissionWithMember[]>;
export declare function toSubmissionRow(s: SubmissionWithMember): {
    id: string;
    teamMemberId: string;
    memberName: string;
    memberRole: import("@prisma/client").$Enums.Role;
    availabilityStatus: import("@prisma/client").$Enums.AvailabilityStatus | null;
    note: string | null;
    operationalStatus: import("@prisma/client").$Enums.OperationalStatus;
    operationalStatusSetBy: string | null;
    submittedAt: Date | null;
    updatedAt: Date;
    selectionNotificationSentAt: Date | null;
};
export type SubmitResult = {
    ok: true;
} | {
    ok: false;
    code: 'NO_WINDOW' | 'LOCKED' | 'NOT_PLAYER_SUBMISSION';
};
export declare function submitAvailability(eventId: string, teamMemberId: string, input: {
    availabilityStatus: 'available' | 'limited' | 'unavailable';
    note: string | null;
}): Promise<SubmitResult>;
export type PatchOperationalResult = {
    ok: true;
} | {
    ok: false;
    code: 'NOT_FOUND' | 'FORBIDDEN_STATUS' | 'FORBIDDEN_ROLE';
};
export declare function patchOperationalStatus(eventId: string, submissionId: string, actorRole: Role, actorMemberId: string, operationalStatus: OperationalStatus): Promise<PatchOperationalResult>;
export type LockResult = {
    ok: true;
} | {
    ok: false;
    code: 'NO_WINDOW';
};
export declare function lockAvailabilityWindow(eventId: string, eventName: string): Promise<LockResult>;
export declare function sendSelectionNotifications(eventId: string, eventName: string): Promise<{
    selected: number;
    notSelected: number;
    skipped: number;
}>;
export {};
//# sourceMappingURL=availability.service.d.ts.map