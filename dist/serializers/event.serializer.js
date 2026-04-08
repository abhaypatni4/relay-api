"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeEventBase = serializeEventBase;
exports.serializeTripWorkspace = serializeTripWorkspace;
function serializeEventBase(e) {
    return {
        id: e.id,
        teamId: e.teamId,
        type: e.type,
        name: e.name,
        date: e.date.toISOString().slice(0, 10),
        startTime: e.startTime,
        location: e.location,
        status: e.status,
        cancelledAt: e.cancelledAt?.toISOString() ?? null,
        postponedAt: e.postponedAt?.toISOString() ?? null,
        newDateAfterPostponement: e.newDateAfterPostponement?.toISOString().slice(0, 10) ?? null,
        newTimeAfterPostponement: e.newTimeAfterPostponement,
        createdBy: e.createdBy,
        createdAt: e.createdAt.toISOString(),
    };
}
function serializeTripWorkspace(w) {
    return {
        id: w.id,
        eventId: w.eventId,
        departureTime: w.departureTime?.toISOString() ?? null,
        departureMeetingPoint: w.departureMeetingPoint,
        transportationNotes: w.transportationNotes,
        accommodationName: w.accommodationName,
        accommodationAddress: w.accommodationAddress,
        accommodationCheckInTime: w.accommodationCheckInTime?.toISOString() ?? null,
        matchEventTime: w.matchEventTime?.toISOString() ?? null,
        matchEventLocation: w.matchEventLocation,
        returnDepartureTime: w.returnDepartureTime?.toISOString() ?? null,
        returnDeparturePoint: w.returnDeparturePoint,
        additionalNotes: w.additionalNotes,
        itineraryVersion: w.itineraryVersion,
        isPublished: w.isPublished,
        publishedAt: w.publishedAt?.toISOString() ?? null,
    };
}
//# sourceMappingURL=event.serializer.js.map