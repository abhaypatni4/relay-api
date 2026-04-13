"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializePost = serializePost;
exports.canViewDeliverySummary = canViewDeliverySummary;
function serializePost(row) {
    const o = {
        id: row.id,
        teamId: row.teamId,
        eventId: row.eventId,
        type: row.type,
        content: row.content,
        recipientGroup: row.recipientGroup,
        isUrgent: row.isUrgent,
        requiresAcknowledgment: row.requiresAcknowledgment,
        overdueThresholdHours: row.overdueThresholdHours,
        createdBy: row.createdBy,
        createdByName: row.createdByName,
        createdAt: row.createdAt.toISOString(),
        deletedAt: row.deletedAt?.toISOString() ?? null,
        currentUserDeliveryState: {
            state: row.currentUserDeliveryState.state,
            seenAt: row.currentUserDeliveryState.seenAt?.toISOString() ?? null,
            acknowledgedAt: row.currentUserDeliveryState.acknowledgedAt?.toISOString() ?? null,
        },
        currentUserSeenAt: row.currentUserSeenAt?.toISOString() ?? null,
        currentUserAcknowledgedAt: row.currentUserAcknowledgedAt?.toISOString() ?? null,
    };
    if (row.deliverySummary) {
        o.deliverySummary = {
            total: row.deliverySummary.total,
            notSeen: row.deliverySummary.notSeen,
            seen: row.deliverySummary.seen,
            acknowledged: row.deliverySummary.acknowledged,
            sentCount: row.deliverySummary.sentCount,
            seenCount: row.deliverySummary.seenCount,
            acknowledgedCount: row.deliverySummary.acknowledgedCount,
            overdueCount: row.deliverySummary.overdueCount,
            members: row.deliverySummary.members?.map((m) => ({
                memberId: m.memberId,
                memberName: m.memberName,
                state: m.state,
                seenAt: m.seenAt?.toISOString() ?? null,
            })),
            overdueMembers: row.deliverySummary.overdueMembers?.map((m) => ({
                teamMemberId: m.teamMemberId,
                memberName: m.memberName,
                lastNudgeSentAt: m.lastNudgeSentAt?.toISOString() ?? null,
                canNudge: m.canNudge,
            })),
        };
    }
    return o;
}
function canViewDeliverySummary(role) {
    return role === 'coordinator' || role === 'coach';
}
//# sourceMappingURL=post.serializer.js.map