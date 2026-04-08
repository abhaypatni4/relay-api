import type { EventStatus, EventType } from '@prisma/client';
import type { JsonObject } from './base.serializer';
export declare function serializeEventBase(e: {
    id: string;
    teamId: string;
    type: EventType;
    name: string;
    date: Date;
    startTime: string;
    location: string | null;
    status: EventStatus;
    cancelledAt: Date | null;
    postponedAt: Date | null;
    newDateAfterPostponement: Date | null;
    newTimeAfterPostponement: string | null;
    createdBy: string;
    createdAt: Date;
}): JsonObject;
export declare function serializeTripWorkspace(w: {
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
}): JsonObject;
//# sourceMappingURL=event.serializer.d.ts.map