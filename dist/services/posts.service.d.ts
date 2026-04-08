import type { DeliveryState, PostType, RecipientGroup, Role } from '@prisma/client';
export declare function createPost(teamId: string, creatorMemberId: string, input: {
    type: PostType;
    content: string;
    recipientGroup: RecipientGroup;
    eventId?: string | null;
    isUrgent?: boolean;
    isDraft?: boolean;
}): Promise<{
    postId: string;
}>;
export declare function listPostsForMember(teamId: string, member: {
    id: string;
    role: Role;
}): Promise<({
    id: string;
    teamId: string;
    eventId: string | null;
    type: import("@prisma/client").$Enums.PostType;
    content: string;
    recipientGroup: import("@prisma/client").$Enums.RecipientGroup;
    isUrgent: boolean;
    requiresAcknowledgment: boolean;
    overdueThresholdHours: number;
    createdBy: string;
    createdByName: string;
    createdAt: Date;
    deletedAt: Date | null;
    currentUserDeliveryState: import("@prisma/client").$Enums.DeliveryState;
    currentUserAcknowledgedAt: Date | null;
} | {
    deliverySummary: {
        sentCount: number;
        seenCount: number;
        acknowledgedCount: number;
        overdueCount: number;
    };
    id: string;
    teamId: string;
    eventId: string | null;
    type: import("@prisma/client").$Enums.PostType;
    content: string;
    recipientGroup: import("@prisma/client").$Enums.RecipientGroup;
    isUrgent: boolean;
    requiresAcknowledgment: boolean;
    overdueThresholdHours: number;
    createdBy: string;
    createdByName: string;
    createdAt: Date;
    deletedAt: Date | null;
    currentUserDeliveryState: import("@prisma/client").$Enums.DeliveryState;
    currentUserAcknowledgedAt: Date | null;
})[]>;
export declare function getPostForMember(teamId: string, postId: string, member: {
    id: string;
    role: Role;
}): Promise<{
    kind: 'not_found';
} | {
    kind: 'forbidden';
} | {
    kind: 'ok';
    post: {
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
    };
}>;
export declare function acknowledgePost(teamId: string, postId: string, memberId: string): Promise<{
    kind: 'not_found';
} | {
    kind: 'forbidden';
} | {
    kind: 'not_required';
} | {
    kind: 'ok';
}>;
export declare function sendNudge(teamId: string, postId: string, actorRole: Role): Promise<{
    kind: 'not_found';
} | {
    kind: 'forbidden';
} | {
    kind: 'not_required';
} | {
    kind: 'ok';
    nudgedCount: number;
}>;
export declare function deletePost(teamId: string, postId: string, member: {
    id: string;
    role: Role;
}): Promise<{
    kind: 'not_found';
} | {
    kind: 'forbidden';
} | {
    kind: 'ok';
    notified: boolean;
}>;
//# sourceMappingURL=posts.service.d.ts.map