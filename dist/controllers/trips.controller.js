"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripsController = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const event_service_1 = require("../services/event.service");
const event_service_2 = require("../services/event.service");
const event_serializer_1 = require("../serializers/event.serializer");
const trip_service_1 = require("../services/trip.service");
const itineraryPatchBody = zod_1.z
    .object({
    departureTime: zod_1.z.string().optional().nullable(),
    departureMeetingPoint: zod_1.z.string().optional().nullable(),
    transportationNotes: zod_1.z.string().optional().nullable(),
    accommodationName: zod_1.z.string().optional().nullable(),
    accommodationAddress: zod_1.z.string().optional().nullable(),
    accommodationCheckInTime: zod_1.z.string().optional().nullable(),
    matchEventTime: zod_1.z.string().optional().nullable(),
    matchEventLocation: zod_1.z.string().optional().nullable(),
    returnDepartureTime: zod_1.z.string().optional().nullable(),
    returnDeparturePoint: zod_1.z.string().optional().nullable(),
    additionalNotes: zod_1.z.string().optional().nullable(),
})
    .strict();
const squadPatchBody = zod_1.z.object({
    assignments: zod_1.z.array(zod_1.z.object({
        teamMemberId: zod_1.z.string().trim().min(1),
        travelingStatus: zod_1.z.enum(client_1.TravelingStatus),
    })),
});
const acknowledgeBody = zod_1.z
    .object({
    expectedVersion: zod_1.z.number().int(),
})
    .strict();
const postponeBody = zod_1.z
    .object({
    newDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    newTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/).optional(),
})
    .strict();
exports.tripsController = {
    cancelTrip: async (req, res) => {
        const eventId = req.params.eventId;
        const eid = Array.isArray(eventId) ? eventId[0] : eventId;
        if (!eid || !req.eventRow) {
            res.status(400).json({ error: 'eventId required' });
            return;
        }
        const result = await (0, event_service_1.cancelTripEvent)(eid);
        if (result === 'ok') {
            res.status(200).json({ cancelled: true });
            return;
        }
        if (result === 'ALREADY_CANCELLED') {
            res.status(409).json({ error: 'Event is already cancelled' });
            return;
        }
        if (result === 'NOT_TRIP') {
            res.status(400).json({ error: 'Only trip events can be cancelled with this action' });
            return;
        }
        res.status(404).json({ error: 'Not found' });
    },
    getTrip: async (req, res) => {
        const eventId = req.params.eventId;
        const eid = Array.isArray(eventId) ? eventId[0] : eventId;
        if (!eid || !req.eventRow) {
            res.status(400).json({ error: 'eventId required' });
            return;
        }
        if (req.eventRow.type !== 'trip') {
            res.status(400).json({ error: 'Not a trip event' });
            return;
        }
        const tw = await (0, trip_service_1.getTripWorkspaceByEventId)(eid);
        if (!tw) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json((0, event_serializer_1.serializeTripWorkspace)(tw));
    },
    patchItinerary: async (req, res) => {
        const eventId = req.params.eventId;
        const eid = Array.isArray(eventId) ? eventId[0] : eventId;
        if (!eid || !req.eventRow) {
            res.status(400).json({ error: 'eventId required' });
            return;
        }
        if (req.eventRow.type !== 'trip') {
            res.status(400).json({ error: 'Not a trip event' });
            return;
        }
        const parsed = itineraryPatchBody.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid body' });
            return;
        }
        const patch = parsed.data;
        if (Object.keys(patch).length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }
        try {
            const { previousVersion } = await (0, trip_service_1.patchTripItineraryWithVersioning)(eid, patch);
            const tw = await (0, trip_service_1.getTripWorkspaceByEventId)(eid);
            if (!tw) {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            if (previousVersion !== null) {
                await (0, trip_service_1.dispatchItineraryCriticalFieldNotifications)(tw.id, req.eventRow.name, previousVersion);
            }
            res.json((0, event_serializer_1.serializeTripWorkspace)(tw));
        }
        catch (e) {
            if (e instanceof Error && e.message === 'TRIP_NOT_FOUND') {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            throw e;
        }
    },
    getSquad: async (req, res) => {
        const eventId = req.params.eventId;
        const eid = Array.isArray(eventId) ? eventId[0] : eventId;
        if (!eid || !req.eventRow) {
            res.status(400).json({ error: 'eventId required' });
            return;
        }
        if (req.eventRow.type !== 'trip') {
            res.status(400).json({ error: 'Not a trip event' });
            return;
        }
        const tw = await (0, trip_service_1.getTripWorkspaceByEventId)(eid);
        if (!tw) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        const rows = await (0, trip_service_1.listTripSquadWithMembers)(tw.id);
        res.json({
            assignments: rows.map((r) => ({
                id: r.id,
                tripWorkspaceId: r.tripWorkspaceId,
                teamMemberId: r.teamMemberId,
                travelingStatus: r.travelingStatus,
                acknowledgedItineraryVersion: r.acknowledgedItineraryVersion,
                memberName: r.teamMember.user.name,
                memberRole: r.teamMember.role,
                onboardingState: r.teamMember.onboardingState,
            })),
        });
    },
    patchSquad: async (req, res) => {
        const eventId = req.params.eventId;
        const eid = Array.isArray(eventId) ? eventId[0] : eventId;
        if (!eid || !req.eventRow) {
            res.status(400).json({ error: 'eventId required' });
            return;
        }
        if (req.eventRow.type !== 'trip') {
            res.status(400).json({ error: 'Not a trip event' });
            return;
        }
        const parsed = squadPatchBody.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid body' });
            return;
        }
        const tw = await (0, trip_service_1.getTripWorkspaceByEventId)(eid);
        if (!tw) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        try {
            await (0, trip_service_1.bulkPatchTripSquad)(tw.id, req.eventRow.teamId, parsed.data.assignments);
        }
        catch (e) {
            if (e instanceof Error && e.message === 'INVALID_MEMBER') {
                res.status(400).json({ error: 'Invalid team member in squad list' });
                return;
            }
            throw e;
        }
        const rows = await (0, trip_service_1.listTripSquadWithMembers)(tw.id);
        res.json({
            assignments: rows.map((r) => ({
                id: r.id,
                tripWorkspaceId: r.tripWorkspaceId,
                teamMemberId: r.teamMemberId,
                travelingStatus: r.travelingStatus,
                acknowledgedItineraryVersion: r.acknowledgedItineraryVersion,
                memberName: r.teamMember.user.name,
                memberRole: r.teamMember.role,
                onboardingState: r.teamMember.onboardingState,
            })),
        });
    },
    acknowledgeItinerary: async (req, res) => {
        const eventId = req.params.eventId;
        const eid = Array.isArray(eventId) ? eventId[0] : eventId;
        if (!eid || !req.member) {
            res.status(400).json({ error: 'eventId required' });
            return;
        }
        if (req.eventRow?.type !== 'trip') {
            res.status(400).json({ error: 'Not a trip event' });
            return;
        }
        const parsed = acknowledgeBody.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid body' });
            return;
        }
        const result = await (0, trip_service_1.acknowledgeTripItinerary)(eid, req.member.id, parsed.data.expectedVersion);
        if (result.kind === 'ok') {
            res.status(200).end();
            return;
        }
        if (result.kind === 'conflict') {
            res.status(409).json({
                currentVersion: result.currentVersion,
                current: result.current,
            });
            return;
        }
        if (result.kind === 'not_traveling') {
            res.status(400).json({ error: 'Not a traveling squad member' });
            return;
        }
        res.status(404).json({ error: 'Not found' });
    },
    publish: async (req, res) => {
        const eventId = req.params.eventId;
        const eid = Array.isArray(eventId) ? eventId[0] : eventId;
        console.log('[publish] called for eventId:', eid);
        if (!eid || !req.eventRow) {
            res.status(400).json({ error: 'eventId required' });
            return;
        }
        if (req.eventRow.type !== 'trip') {
            res.status(400).json({ error: 'Not a trip event' });
            return;
        }
        try {
            const out = await (0, trip_service_1.publishTrip)(eid);
            console.log('[publish] result:', out);
            res.status(200).json({
                tripWorkspaceId: out.tripWorkspaceId,
                published: true,
            });
        }
        catch (e) {
            const code = e instanceof Error ? e.message : '';
            if (code === 'TRIP_NOT_FOUND' || code === 'NOT_TRIP') {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            if (code === 'PUBLISH_VALIDATION') {
                res.status(400).json({
                    error: 'Departure time and departure meeting point are required before publishing',
                });
                return;
            }
            throw e;
        }
    },
    postpone: async (req, res) => {
        const eventId = req.params.eventId;
        const eid = Array.isArray(eventId) ? eventId[0] : eventId;
        if (!eid || !req.eventRow) {
            res.status(400).json({ error: 'eventId required' });
            return;
        }
        const parsed = postponeBody.safeParse(req.body ?? {});
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid body' });
            return;
        }
        const out = await (0, event_service_2.postponeTripEvent)(eid, parsed.data.newDate, parsed.data.newTime);
        if (out.kind === 'ok') {
            res.status(200).json({ postponed: true, tripWorkspaceId: out.tripWorkspaceId });
            return;
        }
        if (out.kind === 'ALREADY_TERMINAL') {
            res.status(409).json({ error: 'Event is already postponed or cancelled' });
            return;
        }
        if (out.kind === 'NOT_TRIP') {
            res.status(400).json({ error: 'Only trip events can be postponed with this action' });
            return;
        }
        res.status(404).json({ error: 'Not found' });
    },
};
//# sourceMappingURL=trips.controller.js.map