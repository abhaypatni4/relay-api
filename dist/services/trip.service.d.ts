import type { TravelingStatus } from '@prisma/client';
import type { JsonObject } from '../serializers/base.serializer';
export interface ItineraryPatchInput {
    departureTime?: string | null;
    departureMeetingPoint?: string | null;
    transportationNotes?: string | null;
    accommodationName?: string | null;
    accommodationAddress?: string | null;
    accommodationCheckInTime?: string | null;
    matchEventTime?: string | null;
    matchEventLocation?: string | null;
    returnDepartureTime?: string | null;
    returnDeparturePoint?: string | null;
    additionalNotes?: string | null;
}
export declare function patchTripItineraryWithVersioning(eventId: string, patch: ItineraryPatchInput): Promise<{
    previousVersion: number | null;
}>;
export declare function dispatchItineraryCriticalFieldNotifications(tripWorkspaceId: string, eventName: string, previousVersion: number): Promise<void>;
export declare function getTripWorkspaceByEventId(eventId: string): Promise<({
    event: {
        type: import("@prisma/client").$Enums.EventType;
        date: Date;
        name: string;
        teamId: string;
        startTime: string;
        location: string | null;
        status: import("@prisma/client").$Enums.EventStatus;
    };
} & {
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
}) | null>;
export declare function listTripSquadWithMembers(tripWorkspaceId: string): Promise<({
    teamMember: {
        user: {
            name: string;
        };
    } & {
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
    };
} & {
    id: string;
    updatedAt: Date;
    teamMemberId: string;
    tripWorkspaceId: string;
    travelingStatus: import("@prisma/client").$Enums.TravelingStatus;
    acknowledgedItineraryVersion: number | null;
    assignedAt: Date;
})[]>;
export declare function bulkPatchTripSquad(tripWorkspaceId: string, teamId: string, assignments: {
    teamMemberId: string;
    travelingStatus: TravelingStatus;
}[]): Promise<void>;
export declare function publishTrip(eventId: string): Promise<{
    tripWorkspaceId: string;
    teamName: string;
    eventName: string;
}>;
export type AcknowledgeItineraryResult = {
    kind: 'ok';
} | {
    kind: 'conflict';
    currentVersion: number;
    current: JsonObject;
} | {
    kind: 'not_traveling';
} | {
    kind: 'not_found';
};
export declare function acknowledgeTripItinerary(eventId: string, teamMemberId: string, expectedVersion: number): Promise<AcknowledgeItineraryResult>;
//# sourceMappingURL=trip.service.d.ts.map