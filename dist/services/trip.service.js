"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchTripItineraryWithVersioning = patchTripItineraryWithVersioning;
exports.dispatchItineraryCriticalFieldNotifications = dispatchItineraryCriticalFieldNotifications;
exports.getTripWorkspaceByEventId = getTripWorkspaceByEventId;
exports.listTripSquadWithMembers = listTripSquadWithMembers;
exports.bulkPatchTripSquad = bulkPatchTripSquad;
exports.publishTrip = publishTrip;
exports.acknowledgeTripItinerary = acknowledgeTripItinerary;
const prisma_1 = require("../db/prisma");
const event_serializer_1 = require("../serializers/event.serializer");
const notification_service_1 = require("./notification.service");
function departureTimeChanged(a, b) {
    const ta = a?.getTime() ?? null;
    const tb = b?.getTime() ?? null;
    return ta !== tb;
}
function meetingPointChanged(a, b) {
    const na = (a ?? '').trim();
    const nb = (b ?? '').trim();
    return na !== nb;
}
function parseIsoDate(s) {
    if (s === undefined || s === null || s === '') {
        return null;
    }
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
}
function mergeItineraryData(current, patch) {
    const data = {};
    if (patch.departureTime !== undefined) {
        data.departureTime = parseIsoDate(patch.departureTime);
    }
    if (patch.departureMeetingPoint !== undefined) {
        data.departureMeetingPoint =
            patch.departureMeetingPoint === null || patch.departureMeetingPoint === ''
                ? null
                : patch.departureMeetingPoint.trim();
    }
    if (patch.transportationNotes !== undefined) {
        data.transportationNotes =
            patch.transportationNotes === null || patch.transportationNotes === ''
                ? null
                : patch.transportationNotes.trim();
    }
    if (patch.accommodationName !== undefined) {
        data.accommodationName =
            patch.accommodationName === null || patch.accommodationName === ''
                ? null
                : patch.accommodationName.trim();
    }
    if (patch.accommodationAddress !== undefined) {
        data.accommodationAddress =
            patch.accommodationAddress === null || patch.accommodationAddress === ''
                ? null
                : patch.accommodationAddress.trim();
    }
    if (patch.accommodationCheckInTime !== undefined) {
        data.accommodationCheckInTime = parseIsoDate(patch.accommodationCheckInTime);
    }
    if (patch.matchEventTime !== undefined) {
        data.matchEventTime = parseIsoDate(patch.matchEventTime);
    }
    if (patch.matchEventLocation !== undefined) {
        data.matchEventLocation =
            patch.matchEventLocation === null || patch.matchEventLocation === ''
                ? null
                : patch.matchEventLocation.trim();
    }
    if (patch.returnDepartureTime !== undefined) {
        data.returnDepartureTime = parseIsoDate(patch.returnDepartureTime);
    }
    if (patch.returnDeparturePoint !== undefined) {
        data.returnDeparturePoint =
            patch.returnDeparturePoint === null || patch.returnDeparturePoint === ''
                ? null
                : patch.returnDeparturePoint.trim();
    }
    if (patch.additionalNotes !== undefined) {
        data.additionalNotes =
            patch.additionalNotes === null || patch.additionalNotes === ''
                ? null
                : patch.additionalNotes.trim();
    }
    return data;
}
function resolvedDepartureTime(current, patch) {
    if (patch.departureTime !== undefined) {
        return parseIsoDate(patch.departureTime);
    }
    return current;
}
function resolvedMeetingPoint(current, patch) {
    if (patch.departureMeetingPoint !== undefined) {
        if (patch.departureMeetingPoint === null || patch.departureMeetingPoint === '') {
            return null;
        }
        return patch.departureMeetingPoint.trim();
    }
    return current;
}
async function patchTripItineraryWithVersioning(eventId, patch) {
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const tw = await tx.tripWorkspace.findUnique({
            where: { eventId },
        });
        if (!tw) {
            throw new Error('TRIP_NOT_FOUND');
        }
        const newDep = resolvedDepartureTime(tw.departureTime, patch);
        const newMp = resolvedMeetingPoint(tw.departureMeetingPoint, patch);
        const criticalChanged = tw.isPublished &&
            (departureTimeChanged(tw.departureTime, newDep) || meetingPointChanged(tw.departureMeetingPoint, newMp));
        const prevVersion = tw.itineraryVersion;
        const data = mergeItineraryData(tw, patch);
        if (criticalChanged) {
            await tx.tripWorkspace.update({
                where: { eventId },
                data: {
                    ...data,
                    itineraryVersion: { increment: 1 },
                },
            });
            return { previousVersion: prevVersion };
        }
        await tx.tripWorkspace.update({
            where: { eventId },
            data,
        });
        return { previousVersion: null };
    });
    return result;
}
async function dispatchItineraryCriticalFieldNotifications(tripWorkspaceId, eventName, previousVersion) {
    const rows = await prisma_1.prisma.tripSquadAssignment.findMany({
        where: {
            tripWorkspaceId,
            travelingStatus: 'traveling',
            acknowledgedItineraryVersion: previousVersion,
            teamMember: {
                onboardingState: 'active',
                removedAt: null,
            },
        },
        include: {
            teamMember: {
                include: { user: { select: { pushToken: true } } },
            },
        },
    });
    const tokens = rows
        .map((r) => r.teamMember.user.pushToken)
        .filter((t) => Boolean(t && t.length > 0));
    if (tokens.length === 0) {
        return;
    }
    await (0, notification_service_1.sendToMultiple)(tokens, {
        title: eventName,
        body: 'Departure time has changed — tap to re-confirm',
        data: {
            deepLink: `relay://trips/${tripWorkspaceId}?section=itinerary`,
            type: 'ITINERARY_CRITICAL_FIELD_CHANGED',
        },
    });
}
async function getTripWorkspaceByEventId(eventId) {
    return prisma_1.prisma.tripWorkspace.findUnique({
        where: { eventId },
        include: {
            event: {
                select: {
                    teamId: true,
                    name: true,
                    type: true,
                    status: true,
                    date: true,
                    startTime: true,
                    location: true,
                },
            },
        },
    });
}
async function listTripSquadWithMembers(tripWorkspaceId) {
    return prisma_1.prisma.tripSquadAssignment.findMany({
        where: { tripWorkspaceId },
        include: {
            teamMember: {
                include: {
                    user: { select: { name: true } },
                },
            },
        },
        orderBy: { assignedAt: 'asc' },
    });
}
async function bulkPatchTripSquad(tripWorkspaceId, teamId, assignments) {
    const memberIds = assignments.map((a) => a.teamMemberId);
    const valid = await prisma_1.prisma.teamMember.findMany({
        where: { id: { in: memberIds }, teamId, removedAt: null },
        select: { id: true },
    });
    const validSet = new Set(valid.map((v) => v.id));
    for (const a of assignments) {
        if (!validSet.has(a.teamMemberId)) {
            throw new Error('INVALID_MEMBER');
        }
    }
    await prisma_1.prisma.$transaction(assignments.map((a) => prisma_1.prisma.tripSquadAssignment.updateMany({
        where: { tripWorkspaceId, teamMemberId: a.teamMemberId },
        data: { travelingStatus: a.travelingStatus },
    })));
}
async function publishTrip(eventId) {
    const tw = await prisma_1.prisma.tripWorkspace.findUnique({
        where: { eventId },
        include: {
            event: {
                include: { team: { select: { name: true } } },
            },
        },
    });
    if (!tw) {
        throw new Error('TRIP_NOT_FOUND');
    }
    if (tw.event.type !== 'trip') {
        throw new Error('NOT_TRIP');
    }
    if (tw.departureTime === null || tw.departureMeetingPoint === null || tw.departureMeetingPoint.trim() === '') {
        throw new Error('PUBLISH_VALIDATION');
    }
    await prisma_1.prisma.$transaction(async (tx) => {
        await tx.tripWorkspace.update({
            where: { eventId },
            data: {
                isPublished: true,
                publishedAt: new Date(),
            },
        });
        await tx.event.update({
            where: { id: eventId },
            data: {
                status: 'active',
            },
        });
    });
    const traveling = await prisma_1.prisma.tripSquadAssignment.findMany({
        where: {
            tripWorkspaceId: tw.id,
            travelingStatus: 'traveling',
            teamMember: {
                onboardingState: 'active',
                removedAt: null,
            },
        },
        include: {
            teamMember: {
                include: { user: { select: { pushToken: true } } },
            },
        },
    });
    const tokens = traveling
        .map((r) => r.teamMember.user.pushToken)
        .filter((t) => Boolean(t && t.length > 0));
    const teamName = tw.event.team.name;
    const eventName = tw.event.name;
    if (tokens.length > 0) {
        await (0, notification_service_1.sendToMultiple)(tokens, {
            title: teamName,
            body: `You're on the ${eventName} trip — tap to see details`,
            data: {
                deepLink: `relay://trips/${tw.id}`,
                type: 'TRIP_PUBLISHED',
            },
        });
    }
    return { tripWorkspaceId: tw.id, teamName, eventName };
}
async function acknowledgeTripItinerary(eventId, teamMemberId, expectedVersion) {
    const tw = await prisma_1.prisma.tripWorkspace.findUnique({
        where: { eventId },
    });
    if (!tw) {
        return { kind: 'not_found' };
    }
    const assignment = await prisma_1.prisma.tripSquadAssignment.findUnique({
        where: {
            tripWorkspaceId_teamMemberId: {
                tripWorkspaceId: tw.id,
                teamMemberId,
            },
        },
    });
    if (!assignment) {
        return { kind: 'not_found' };
    }
    if (assignment.travelingStatus !== 'traveling') {
        return { kind: 'not_traveling' };
    }
    if (expectedVersion !== tw.itineraryVersion) {
        const fresh = await prisma_1.prisma.tripWorkspace.findUnique({
            where: { eventId },
        });
        if (!fresh) {
            return { kind: 'not_found' };
        }
        return {
            kind: 'conflict',
            currentVersion: fresh.itineraryVersion,
            current: (0, event_serializer_1.serializeTripWorkspace)(fresh),
        };
    }
    await prisma_1.prisma.tripSquadAssignment.update({
        where: {
            tripWorkspaceId_teamMemberId: {
                tripWorkspaceId: tw.id,
                teamMemberId,
            },
        },
        data: { acknowledgedItineraryVersion: tw.itineraryVersion },
    });
    return { kind: 'ok' };
}
//# sourceMappingURL=trip.service.js.map