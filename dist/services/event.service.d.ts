import type { EventType } from '@prisma/client';
export interface CreateEventInput {
    type: EventType;
    name: string;
    date: Date;
    startTime: string;
    location?: string | null;
}
export interface PatchEventInput {
    name?: string;
    date?: Date;
    startTime?: string;
    location?: string | null;
}
export declare function createTeamEvent(teamId: string, createdByMemberId: string, input: CreateEventInput): Promise<{
    eventId: string;
    tripWorkspaceId: string | null;
}>;
export declare function listTeamEventsChronological(teamId: string): Promise<{
    type: import("@prisma/client").$Enums.EventType;
    date: Date;
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    teamId: string;
    startTime: string;
    location: string | null;
    status: import("@prisma/client").$Enums.EventStatus;
    cancelledAt: Date | null;
    postponedAt: Date | null;
    newDateAfterPostponement: Date | null;
    newTimeAfterPostponement: string | null;
    createdBy: string;
}[]>;
export declare function getEventByIdForTeam(teamId: string, eventId: string): Promise<({
    tripWorkspace: {
        id: string;
        eventId: string;
        departureTime: Date | null;
        departureMeetingPoint: string | null;
        transportationNotes: string | null;
        accommodationName: string | null;
        accommodationAddress: string | null;
        accommodationCheckInTime: Date | null;
        matchEventTime: Date | null;
        matchEventLocation: string | null;
        returnDepartureTime: Date | null;
        returnDeparturePoint: string | null;
        additionalNotes: string | null;
        itineraryVersion: number;
        isPublished: boolean;
        publishedAt: Date | null;
    } | null;
} & {
    type: import("@prisma/client").$Enums.EventType;
    date: Date;
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    teamId: string;
    startTime: string;
    location: string | null;
    status: import("@prisma/client").$Enums.EventStatus;
    cancelledAt: Date | null;
    postponedAt: Date | null;
    newDateAfterPostponement: Date | null;
    newTimeAfterPostponement: string | null;
    createdBy: string;
}) | null>;
export type CancelTripResult = 'ok' | 'EVENT_NOT_FOUND' | 'NOT_TRIP' | 'ALREADY_CANCELLED';
export type PostponeTripResult = {
    kind: 'ok';
    tripWorkspaceId: string;
    previousVersion: number | null;
} | {
    kind: 'EVENT_NOT_FOUND' | 'NOT_TRIP' | 'ALREADY_TERMINAL';
};
/**
 * Coordinator-only trip cancellation: irreversible; notifies all squad assignments (any traveling status).
 */
export declare function cancelTripEvent(eventId: string): Promise<CancelTripResult>;
export declare function patchTeamEvent(teamId: string, eventId: string, input: PatchEventInput): Promise<void>;
export declare function postponeTripEvent(eventId: string, newDate?: string, newTime?: string): Promise<PostponeTripResult>;
//# sourceMappingURL=event.service.d.ts.map