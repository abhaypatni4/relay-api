import type { Role } from '@prisma/client';
export declare function createInvitationForTeam(teamId: string): Promise<{
    token: string;
    expiresAt: Date;
}>;
export type ValidateInviteResult = {
    ok: true;
    teamName: string;
    sport: string | null;
} | {
    ok: false;
    reason: 'not_found' | 'expired';
};
export declare function validateInvitationToken(rawToken: string): Promise<ValidateInviteResult>;
export declare function acceptInvitation(userId: string, rawToken: string, role?: Role): Promise<{
    teamId: string;
    teamMemberId: string;
    teamName: string;
}>;
//# sourceMappingURL=invitation.service.d.ts.map