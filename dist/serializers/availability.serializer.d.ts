import type { AvailabilityStatus, OperationalStatus, Role } from '@prisma/client';
import type { JsonObject } from './base.serializer';
export interface AvailabilitySubmissionRow {
    id: string;
    teamMemberId: string;
    memberName: string;
    /** Included for coach/coordinator/staff roster filtering; never sent to players. */
    memberRole?: Role;
    availabilityStatus: AvailabilityStatus | null;
    note: string | null;
    operationalStatus: OperationalStatus;
    operationalStatusSetBy: string | null;
    submittedAt: Date | null;
    updatedAt: Date;
    selectionNotificationSentAt: Date | null;
}
export interface AvailabilityWindowRow {
    id: string;
    eventId: string;
    openedAt: Date;
    lockedAt: Date | null;
    isLocked: boolean;
    selectionNotificationsSentAt: Date | null;
}
export declare function serializeAvailabilityWindow(row: AvailabilityWindowRow): JsonObject;
export type PlayerSelectionOutcome = 'selected' | 'notSelected' | 'pending';
export interface SerializeAvailabilityOptions {
    /** When true, coach/coordinator has sent selection notifications for this window. */
    selectionNotificationsSent?: boolean;
}
export declare function serializeAvailabilitySubmission(viewerRole: Role, row: AvailabilitySubmissionRow, options?: SerializeAvailabilityOptions): JsonObject;
//# sourceMappingURL=availability.serializer.d.ts.map