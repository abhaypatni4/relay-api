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
export declare function serializePost(row: PostForResponse): JsonObject;
export declare function canViewDeliverySummary(role: Role): boolean;
//# sourceMappingURL=post.serializer.d.ts.map