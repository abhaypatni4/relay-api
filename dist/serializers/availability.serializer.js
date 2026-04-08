"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeAvailabilityWindow = serializeAvailabilityWindow;
exports.serializeAvailabilitySubmission = serializeAvailabilitySubmission;
const base_serializer_1 = require("./base.serializer");
function serializeAvailabilityWindow(row) {
    return {
        id: row.id,
        eventId: row.eventId,
        openedAt: row.openedAt.toISOString(),
        lockedAt: row.lockedAt?.toISOString() ?? null,
        isLocked: row.isLocked,
        selectionNotificationsSentAt: row.selectionNotificationsSentAt?.toISOString() ?? null,
    };
}
function playerSelectionOutcome(row, selectionNotificationsSent) {
    if (!selectionNotificationsSent) {
        return 'pending';
    }
    if (row.operationalStatus === 'selected' || row.operationalStatus === 'traveling') {
        return 'selected';
    }
    if (row.operationalStatus === 'notSelected' || row.operationalStatus === 'medicallyRestricted') {
        return 'notSelected';
    }
    return 'pending';
}
function serializeAvailabilitySubmission(viewerRole, row, options) {
    const base = {
        id: row.id,
        teamMemberId: row.teamMemberId,
        memberName: row.memberName,
        availabilityStatus: row.availabilityStatus,
        note: row.note,
        submittedAt: row.submittedAt?.toISOString() ?? null,
        updatedAt: row.updatedAt.toISOString(),
        selectionNotificationSentAt: row.selectionNotificationSentAt?.toISOString() ?? null,
    };
    if ((0, base_serializer_1.isPlayerViewer)(viewerRole)) {
        const sent = Boolean(options?.selectionNotificationsSent);
        base.selectionOutcome = playerSelectionOutcome(row, sent);
        return base;
    }
    if (row.memberRole !== undefined) {
        base.memberRole = row.memberRole;
    }
    base.operationalStatus = row.operationalStatus;
    base.operationalStatusSetBy = row.operationalStatusSetBy;
    return base;
}
//# sourceMappingURL=availability.serializer.js.map