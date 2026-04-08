export declare function getTransferForTeam(teamId: string, transferId: string): Promise<{
    id: string;
    teamId: string;
    fromMemberId: string;
    fromMemberName: string;
    toMemberId: string;
    toMemberName: string;
    status: import("@prisma/client").$Enums.TransferStatus;
    initiatedAt: string;
    respondedAt: string | null;
    expiresAt: string;
} | null>;
export declare function getPendingTransferForTeam(teamId: string): Promise<{
    id: string;
    teamId: string;
    fromMemberId: string;
    fromMemberName: string;
    toMemberId: string;
    toMemberName: string;
    status: import("@prisma/client").$Enums.TransferStatus;
    initiatedAt: string;
    respondedAt: string | null;
    expiresAt: string;
} | null>;
export declare function createTransfer(teamId: string, fromMemberId: string, toMemberId: string): Promise<{
    ok: false;
    code: "NOT_FOUND";
    transfer?: undefined;
} | {
    ok: false;
    code: "FORBIDDEN";
    transfer?: undefined;
} | {
    ok: false;
    code: "TARGET_NOT_ACTIVE";
    transfer?: undefined;
} | {
    ok: false;
    code: "PENDING_EXISTS";
    transfer?: undefined;
} | {
    ok: true;
    transfer: {
        id: string;
        teamId: string;
        fromMemberId: string;
        fromMemberName: string;
        toMemberId: string;
        toMemberName: string;
        status: import("@prisma/client").$Enums.TransferStatus;
        initiatedAt: string;
        respondedAt: string | null;
        expiresAt: string;
    };
    code?: undefined;
}>;
export declare function respondToTransfer(input: {
    teamId: string;
    transferId: string;
    actingMemberId: string;
    action: 'accept' | 'decline';
}): Promise<{
    ok: false;
    code: "FORBIDDEN";
    transfer?: undefined;
} | {
    ok: false;
    code: "NOT_VALID";
    transfer?: undefined;
} | {
    ok: true;
    transfer: {
        id: string;
        teamId: string;
        fromMemberId: string;
        fromMemberName: string;
        toMemberId: string;
        toMemberName: string;
        status: import("@prisma/client").$Enums.TransferStatus;
        initiatedAt: string;
        respondedAt: string | null;
        expiresAt: string;
    };
    code?: undefined;
}>;
export declare function expirePendingTransfers(): Promise<number>;
//# sourceMappingURL=transfers.service.d.ts.map