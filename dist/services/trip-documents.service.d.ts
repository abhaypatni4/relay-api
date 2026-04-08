import type { DocumentApplicability, OnboardingState, Role } from '@prisma/client';
export declare function addChecklistItem(eventId: string, actorMemberId: string, input: {
    name: string;
    applicability: DocumentApplicability;
    specificMemberIds: string[];
}): Promise<{
    ok: true;
    itemId: string;
} | {
    ok: false;
    code: 'NOT_FOUND' | 'FORBIDDEN';
}>;
export declare function listChecklistItems(eventId: string, viewer: {
    id: string;
    role: Role;
    onboardingState: OnboardingState;
}): Promise<{
    ok: true;
    body: Record<string, unknown>;
} | {
    ok: false;
}>;
export declare function confirmChecklistItem(eventId: string, itemId: string, memberId: string): Promise<{
    ok: true;
} | {
    ok: false;
    code: 'NOT_FOUND' | 'NOT_APPLICABLE' | 'FORBIDDEN';
}>;
export declare function deleteChecklistItem(eventId: string, actorRole: Role, itemId: string): Promise<{
    ok: true;
} | {
    ok: false;
    code: 'NOT_FOUND' | 'FORBIDDEN';
}>;
export declare function remindOutstandingMembers(eventId: string, eventName: string): Promise<{
    ok: true;
    remindedCount: number;
} | {
    ok: false;
}>;
//# sourceMappingURL=trip-documents.service.d.ts.map