import type { DeliveryState, PostType, RecipientGroup, Role } from '@prisma/client';
import type { JsonObject } from './base.serializer';

export interface PostForResponse {
  id: string;
  teamId: string;
  eventId: string | null;
  type: PostType;
  content: string;
  recipientGroup: RecipientGroup;
  isUrgent: boolean;
  requiresAcknowledgment: boolean;
  overdueThresholdHours: number;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  deletedAt: Date | null;
  currentUserDeliveryState: {
    state: DeliveryState;
    seenAt: Date | null;
    acknowledgedAt: Date | null;
  };
  currentUserSeenAt: Date | null;
  currentUserAcknowledgedAt: Date | null;
  deliverySummary?: {
    total: number;
    notSeen: number;
    seen: number;
    acknowledged: number;
    sentCount: number;
    seenCount: number;
    acknowledgedCount: number;
    overdueCount: number;
    members?: {
      memberId: string;
      memberName: string;
      state: DeliveryState;
      seenAt: Date | null;
    }[];
    overdueMembers?: {
      teamMemberId: string;
      memberName: string;
      lastNudgeSentAt: Date | null;
      canNudge: boolean;
    }[];
  };
}

export function serializePost(row: PostForResponse): JsonObject {
  const o: JsonObject = {
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

export function canViewDeliverySummary(role: Role): boolean {
  return role === 'coordinator' || role === 'coach';
}

