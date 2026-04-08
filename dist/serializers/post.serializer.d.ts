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
    currentUserDeliveryState: DeliveryState;
    currentUserAcknowledgedAt: Date | null;
    deliverySummary?: {
        sentCount: number;
        seenCount: number;
        acknowledgedCount: number;
        overdueCount: number;
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