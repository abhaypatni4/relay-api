"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openAvailabilityWindow = openAvailabilityWindow;
exports.loadSubmissionsForWindow = loadSubmissionsForWindow;
exports.toSubmissionRow = toSubmissionRow;
exports.submitAvailability = submitAvailability;
exports.patchOperationalStatus = patchOperationalStatus;
exports.lockAvailabilityWindow = lockAvailabilityWindow;
exports.sendSelectionNotifications = sendSelectionNotifications;
const prisma_1 = require("../db/prisma");
const notification_service_1 = require("./notification.service");
async function openAvailabilityWindow(eventId, openedByMemberId, eventName) {
    const event = await prisma_1.prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, teamId: true },
    });
    if (!event) {
        return { ok: false, code: 'EVENT_NOT_FOUND' };
    }
    const existing = await prisma_1.prisma.availabilityWindow.findUnique({ where: { eventId } });
    if (existing) {
        return { ok: false, code: 'WINDOW_EXISTS' };
    }
    const players = await prisma_1.prisma.teamMember.findMany({
        where: {
            teamId: event.teamId,
            role: 'player',
            removedAt: null,
            onboardingState: 'active',
        },
        select: {
            id: true,
            user: { select: { pushToken: true } },
        },
    });
    const window = await prisma_1.prisma.$transaction(async (tx) => {
        const w = await tx.availabilityWindow.create({
            data: { eventId, openedBy: openedByMemberId },
        });
        if (players.length > 0) {
            await tx.availabilitySubmission.createMany({
                data: players.map((p) => ({
                    availabilityWindowId: w.id,
                    teamMemberId: p.id,
                })),
            });
        }
        return w;
    });
    const tokens = players.map((p) => p.user.pushToken).filter((t) => Boolean(t && t.length > 0));
    if (tokens.length > 0) {
        await (0, notification_service_1.sendToMultiple)(tokens, {
            title: eventName,
            body: `Confirm your availability for ${eventName}`,
            data: {
                deepLink: `relay://events/${eventId}/availability`,
                type: 'AVAILABILITY_WINDOW_OPENED',
            },
        });
    }
    return { ok: true, windowId: window.id };
}
const submissionInclude = {
    teamMember: {
        select: {
            id: true,
            role: true,
            user: { select: { name: true } },
        },
    },
};
async function loadSubmissionsForWindow(windowId) {
    return prisma_1.prisma.availabilitySubmission.findMany({
        where: { availabilityWindowId: windowId },
        include: submissionInclude,
        orderBy: { teamMember: { user: { name: 'asc' } } },
    });
}
function toSubmissionRow(s) {
    return {
        id: s.id,
        teamMemberId: s.teamMemberId,
        memberName: s.teamMember.user.name,
        memberRole: s.teamMember.role,
        availabilityStatus: s.availabilityStatus,
        note: s.note,
        operationalStatus: s.operationalStatus,
        operationalStatusSetBy: s.operationalStatusSetBy,
        submittedAt: s.submittedAt,
        updatedAt: s.updatedAt,
        selectionNotificationSentAt: s.selectionNotificationSentAt,
    };
}
async function submitAvailability(eventId, teamMemberId, input) {
    const window = await prisma_1.prisma.availabilityWindow.findUnique({
        where: { eventId },
        include: {
            event: { select: { teamId: true } },
            submissions: { where: { teamMemberId } },
        },
    });
    if (!window) {
        return { ok: false, code: 'NO_WINDOW' };
    }
    if (window.isLocked) {
        return { ok: false, code: 'LOCKED' };
    }
    const member = await prisma_1.prisma.teamMember.findFirst({
        where: {
            id: teamMemberId,
            teamId: window.event.teamId,
            role: 'player',
            removedAt: null,
            onboardingState: 'active',
        },
    });
    if (!member) {
        return { ok: false, code: 'NOT_PLAYER_SUBMISSION' };
    }
    const existing = window.submissions[0];
    if (!existing) {
        await prisma_1.prisma.availabilitySubmission.create({
            data: {
                availabilityWindowId: window.id,
                teamMemberId,
                availabilityStatus: input.availabilityStatus,
                note: input.note,
                submittedAt: new Date(),
            },
        });
    }
    else {
        await prisma_1.prisma.availabilitySubmission.update({
            where: { id: existing.id },
            data: {
                availabilityStatus: input.availabilityStatus,
                note: input.note,
                submittedAt: new Date(),
            },
        });
    }
    return { ok: true };
}
const COACH_ALLOWED = ['selected', 'notSelected', 'traveling', 'unassigned'];
async function patchOperationalStatus(eventId, submissionId, actorRole, actorMemberId, operationalStatus) {
    const sub = await prisma_1.prisma.availabilitySubmission.findFirst({
        where: {
            id: submissionId,
            availabilityWindow: { eventId },
        },
        include: { teamMember: { select: { role: true } } },
    });
    if (!sub) {
        return { ok: false, code: 'NOT_FOUND' };
    }
    if (actorRole === 'player') {
        return { ok: false, code: 'FORBIDDEN_ROLE' };
    }
    if (actorRole === 'coach') {
        if (operationalStatus === 'medicallyRestricted') {
            return { ok: false, code: 'FORBIDDEN_STATUS' };
        }
        if (!COACH_ALLOWED.includes(operationalStatus)) {
            return { ok: false, code: 'FORBIDDEN_STATUS' };
        }
    }
    if (actorRole === 'staff') {
        if (operationalStatus !== 'medicallyRestricted') {
            return { ok: false, code: 'FORBIDDEN_STATUS' };
        }
    }
    if (actorRole === 'coach' &&
        sub.operationalStatus === 'medicallyRestricted' &&
        operationalStatus === 'selected') {
        console.info(JSON.stringify({
            audit: 'COACH_OVERRIDE_MEDICALLY_RESTRICTED',
            eventId,
            submissionId: sub.id,
            actorMemberId,
        }));
    }
    await prisma_1.prisma.availabilitySubmission.update({
        where: { id: sub.id },
        data: {
            operationalStatus,
            operationalStatusSetBy: actorMemberId,
        },
    });
    return { ok: true };
}
async function lockAvailabilityWindow(eventId, eventName) {
    const window = await prisma_1.prisma.availabilityWindow.findUnique({
        where: { eventId },
        include: {
            submissions: {
                where: { availabilityStatus: null },
                include: {
                    teamMember: {
                        select: {
                            role: true,
                            user: { select: { pushToken: true } },
                        },
                    },
                },
            },
        },
    });
    if (!window) {
        return { ok: false, code: 'NO_WINDOW' };
    }
    await prisma_1.prisma.availabilityWindow.update({
        where: { id: window.id },
        data: { isLocked: true, lockedAt: new Date() },
    });
    const tokens = window.submissions
        .filter((s) => s.teamMember.role === 'player')
        .map((s) => s.teamMember.user.pushToken)
        .filter((t) => Boolean(t && t.length > 0));
    if (tokens.length > 0) {
        await (0, notification_service_1.sendToMultiple)(tokens, {
            title: eventName,
            body: `Availability is now locked for ${eventName}`,
            data: {
                deepLink: `relay://events/${eventId}`,
                type: 'AVAILABILITY_LOCKED',
            },
        });
    }
    return { ok: true };
}
async function sendSelectionNotifications(eventId, eventName) {
    const window = await prisma_1.prisma.availabilityWindow.findUnique({
        where: { eventId },
        include: {
            submissions: {
                include: {
                    teamMember: {
                        select: {
                            role: true,
                            user: { select: { pushToken: true } },
                        },
                    },
                },
            },
        },
    });
    if (!window) {
        return { selected: 0, notSelected: 0, skipped: 0 };
    }
    let selected = 0;
    let notSelected = 0;
    let skipped = 0;
    for (const s of window.submissions) {
        if (s.teamMember.role !== 'player') {
            continue;
        }
        const token = s.teamMember.user.pushToken;
        const op = s.operationalStatus;
        if (op === 'unassigned') {
            skipped += 1;
            continue;
        }
        if (!token) {
            if (op === 'selected' || op === 'traveling') {
                selected += 1;
            }
            else {
                notSelected += 1;
            }
            continue;
        }
        if (op === 'selected' || op === 'traveling') {
            await (0, notification_service_1.sendToDevice)(token, {
                title: eventName,
                body: `${eventName}: You have been selected`,
                data: {
                    deepLink: `relay://events/${eventId}`,
                    type: 'SELECTION_SELECTED',
                },
            });
            selected += 1;
        }
        else {
            await (0, notification_service_1.sendToDevice)(token, {
                title: eventName,
                body: `${eventName}: You are not selected for this event`,
                data: {
                    deepLink: `relay://events/${eventId}`,
                    type: 'SELECTION_NOT_SELECTED',
                },
            });
            notSelected += 1;
        }
    }
    await prisma_1.prisma.availabilityWindow.update({
        where: { id: window.id },
        data: { selectionNotificationsSentAt: new Date() },
    });
    return { selected, notSelected, skipped };
}
//# sourceMappingURL=availability.service.js.map