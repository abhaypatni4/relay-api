"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTeamEvent = createTeamEvent;
exports.listTeamEventsChronological = listTeamEventsChronological;
exports.getEventByIdForTeam = getEventByIdForTeam;
exports.cancelTripEvent = cancelTripEvent;
exports.patchTeamEvent = patchTeamEvent;
exports.postponeTripEvent = postponeTripEvent;
const prisma_1 = require("../db/prisma");
const notification_service_1 = require("./notification.service");
const trip_service_1 = require("./trip.service");
async function createTeamEvent(teamId, createdByMemberId, input) {
    const created = await prisma_1.prisma.$transaction(async (tx) => {
        const autoActive = input.type === 'match' || input.type === 'training';
        const event = await tx.event.create({
            data: {
                teamId,
                type: input.type,
                name: input.name.trim(),
                date: input.date,
                startTime: input.startTime.trim(),
                location: input.location?.trim() ?? null,
                status: autoActive ? 'active' : 'draft',
                createdBy: createdByMemberId,
            },
        });
        if (input.type === 'trip') {
            const tw = await tx.tripWorkspace.create({
                data: { eventId: event.id },
            });
            const members = await tx.teamMember.findMany({
                where: { teamId, removedAt: null },
                select: { id: true },
            });
            if (members.length > 0) {
                await tx.tripSquadAssignment.createMany({
                    data: members.map((m) => ({
                        tripWorkspaceId: tw.id,
                        teamMemberId: m.id,
                        travelingStatus: 'unassigned',
                    })),
                });
            }
            return { eventId: event.id, tripWorkspaceId: tw.id };
        }
        if (input.type === 'match' || input.type === 'training') {
            const players = await tx.teamMember.findMany({
                where: {
                    teamId,
                    role: 'player',
                    removedAt: null,
                },
                select: { id: true },
            });
            const window = await tx.availabilityWindow.create({
                data: {
                    eventId: event.id,
                    openedBy: createdByMemberId,
                    isLocked: false,
                    openedAt: new Date(),
                },
            });
            if (players.length > 0) {
                await tx.availabilitySubmission.createMany({
                    data: players.map((p) => ({
                        availabilityWindowId: window.id,
                        teamMemberId: p.id,
                        availabilityStatus: null,
                    })),
                    skipDuplicates: true,
                });
            }
        }
        return { eventId: event.id, tripWorkspaceId: null };
    });
    if (input.type === 'match' || input.type === 'training') {
        const recipients = await prisma_1.prisma.teamMember.findMany({
            where: {
                teamId,
                removedAt: null,
                onboardingState: 'active',
            },
            include: { user: { select: { pushToken: true } } },
        });
        const tokens = recipients
            .map((r) => r.user.pushToken)
            .filter((t) => Boolean(t && t.length > 0));
        if (tokens.length > 0) {
            const eventKind = input.type === 'match' ? 'Match' : 'Training';
            const dateLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(input.date);
            await (0, notification_service_1.sendToMultiple)(tokens, {
                title: `New ${eventKind} scheduled`,
                body: `${input.name.trim()} on ${dateLabel}`,
                data: {
                    deepLink: `relay://events/${created.eventId}`,
                    type: 'EVENT_SCHEDULED',
                },
            });
        }
    }
    return created;
}
async function listTeamEventsChronological(teamId) {
    return prisma_1.prisma.event.findMany({
        where: { teamId },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
}
async function getEventByIdForTeam(teamId, eventId) {
    return prisma_1.prisma.event.findFirst({
        where: { id: eventId, teamId },
        include: { tripWorkspace: true },
    });
}
/**
 * Coordinator-only trip cancellation: irreversible; notifies all squad assignments (any traveling status).
 */
async function cancelTripEvent(eventId) {
    const event = await prisma_1.prisma.event.findUnique({
        where: { id: eventId },
        include: { tripWorkspace: true },
    });
    if (!event) {
        return 'EVENT_NOT_FOUND';
    }
    if (event.type !== 'trip') {
        return 'NOT_TRIP';
    }
    if (event.status === 'cancelled') {
        return 'ALREADY_CANCELLED';
    }
    await prisma_1.prisma.event.update({
        where: { id: eventId },
        data: { status: 'cancelled', cancelledAt: new Date() },
    });
    const tw = event.tripWorkspace;
    if (tw) {
        const rows = await prisma_1.prisma.tripSquadAssignment.findMany({
            where: { tripWorkspaceId: tw.id },
            include: {
                teamMember: {
                    include: { user: { select: { pushToken: true } } },
                },
            },
        });
        const tokens = rows
            .map((r) => r.teamMember.user.pushToken)
            .filter((t) => Boolean(t && t.length > 0));
        if (tokens.length > 0) {
            await (0, notification_service_1.sendToMultiple)(tokens, {
                title: event.name,
                body: `${event.name} has been cancelled`,
                data: {
                    deepLink: `relay://events/${eventId}`,
                    type: 'TRIP_CANCELLED',
                },
            });
        }
    }
    return 'ok';
}
async function patchTeamEvent(teamId, eventId, input) {
    const existing = await prisma_1.prisma.event.findFirst({
        where: { id: eventId, teamId },
        select: { id: true },
    });
    if (!existing) {
        throw new Error('EVENT_NOT_FOUND');
    }
    await prisma_1.prisma.event.update({
        where: { id: eventId },
        data: {
            ...(input.name !== undefined ? { name: input.name.trim() } : {}),
            ...(input.date !== undefined ? { date: input.date } : {}),
            ...(input.startTime !== undefined ? { startTime: input.startTime.trim() } : {}),
            ...(input.location !== undefined ? { location: input.location?.trim() ?? null } : {}),
        },
    });
}
function parseIsoDateOnly(s) {
    return new Date(`${s}T00:00:00.000Z`);
}
function parseNewDeparture(newDate, newTime) {
    if (!newDate && !newTime) {
        return null;
    }
    const date = newDate ?? new Date().toISOString().slice(0, 10);
    const time = newTime ?? '09:00';
    const out = new Date(`${date}T${time}:00.000Z`);
    if (Number.isNaN(out.getTime())) {
        throw new Error('BAD_DATETIME');
    }
    return out;
}
async function postponeTripEvent(eventId, newDate, newTime) {
    const event = await prisma_1.prisma.event.findUnique({
        where: { id: eventId },
        include: { tripWorkspace: true },
    });
    if (!event) {
        return { kind: 'EVENT_NOT_FOUND' };
    }
    if (event.type !== 'trip' || !event.tripWorkspace) {
        return { kind: 'NOT_TRIP' };
    }
    if (event.status === 'cancelled' || event.status === 'postponed') {
        return { kind: 'ALREADY_TERMINAL' };
    }
    const hasNew = newDate != null || newTime != null;
    const nextDeparture = hasNew ? parseNewDeparture(newDate, newTime) : null;
    const tripWorkspaceId = event.tripWorkspace.id;
    const currentItineraryVersion = event.tripWorkspace.itineraryVersion;
    const txOut = await prisma_1.prisma.$transaction(async (tx) => {
        await tx.event.update({
            where: { id: event.id },
            data: {
                status: 'postponed',
                postponedAt: new Date(),
                ...(newDate ? { newDateAfterPostponement: parseIsoDateOnly(newDate) } : {}),
                ...(newTime ? { newTimeAfterPostponement: newTime } : {}),
            },
        });
        let previousVersion = null;
        if (hasNew && nextDeparture) {
            previousVersion = currentItineraryVersion;
            await tx.tripWorkspace.update({
                where: { id: tripWorkspaceId },
                data: {
                    departureTime: nextDeparture,
                    itineraryVersion: { increment: 1 },
                },
            });
        }
        return { previousVersion };
    });
    const rows = await prisma_1.prisma.tripSquadAssignment.findMany({
        where: { tripWorkspaceId },
        include: { teamMember: { include: { user: { select: { pushToken: true } } } } },
    });
    const tokens = rows.map((r) => r.teamMember.user.pushToken).filter((t) => Boolean(t));
    if (tokens.length > 0) {
        await (0, notification_service_1.sendToMultiple)(tokens, {
            title: event.name,
            body: hasNew
                ? `${event.name} has been postponed — tap to see updated details and re-confirm`
                : `${event.name} has been postponed — details will be updated soon`,
            data: { deepLink: `relay://trips/${tripWorkspaceId}`, type: 'TRIP_POSTPONED' },
        });
    }
    if (txOut.previousVersion !== null) {
        await (0, trip_service_1.dispatchItineraryCriticalFieldNotifications)(tripWorkspaceId, event.name, txOut.previousVersion);
    }
    return { kind: 'ok', tripWorkspaceId, previousVersion: txOut.previousVersion };
}
//# sourceMappingURL=event.service.js.map