"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransferForTeam = getTransferForTeam;
exports.getPendingTransferForTeam = getPendingTransferForTeam;
exports.createTransfer = createTransfer;
exports.respondToTransfer = respondToTransfer;
exports.expirePendingTransfers = expirePendingTransfers;
const prisma_1 = require("../db/prisma");
const analytics_service_1 = require("./analytics.service");
const notification_service_1 = require("./notification.service");
const TRANSFER_TTL_MS = 48 * 60 * 60 * 1000;
function iso(d) {
    return d ? d.toISOString() : null;
}
async function getTransferForTeam(teamId, transferId) {
    const row = await prisma_1.prisma.coordinatorTransfer.findFirst({
        where: { id: transferId, teamId },
    });
    if (!row) {
        return null;
    }
    const [fromMember, toMember] = await Promise.all([
        prisma_1.prisma.teamMember.findUnique({ where: { id: row.fromMemberId }, include: { user: { select: { name: true } } } }),
        prisma_1.prisma.teamMember.findUnique({ where: { id: row.toMemberId }, include: { user: { select: { name: true } } } }),
    ]);
    return {
        id: row.id,
        teamId: row.teamId,
        fromMemberId: row.fromMemberId,
        fromMemberName: fromMember?.user.name ?? 'Member',
        toMemberId: row.toMemberId,
        toMemberName: toMember?.user.name ?? 'Member',
        status: row.status,
        initiatedAt: row.initiatedAt.toISOString(),
        respondedAt: iso(row.respondedAt),
        expiresAt: row.expiresAt.toISOString(),
    };
}
async function getPendingTransferForTeam(teamId) {
    const row = await prisma_1.prisma.coordinatorTransfer.findFirst({
        where: { teamId, status: 'pending' },
        orderBy: { initiatedAt: 'desc' },
    });
    if (!row) {
        return null;
    }
    return getTransferForTeam(teamId, row.id);
}
async function createTransfer(teamId, fromMemberId, toMemberId) {
    const [team, fromMember, toMember, pending] = await Promise.all([
        prisma_1.prisma.team.findUnique({ where: { id: teamId }, select: { id: true, name: true } }),
        prisma_1.prisma.teamMember.findUnique({
            where: { id: fromMemberId },
            include: { user: { select: { name: true } } },
        }),
        prisma_1.prisma.teamMember.findUnique({
            where: { id: toMemberId },
            include: { user: { select: { name: true, pushToken: true } } },
        }),
        prisma_1.prisma.coordinatorTransfer.findFirst({ where: { teamId, status: 'pending' }, select: { id: true } }),
    ]);
    if (!team || !fromMember || !toMember || fromMember.teamId !== teamId || toMember.teamId !== teamId) {
        return { ok: false, code: 'NOT_FOUND' };
    }
    if (fromMember.role !== 'coordinator') {
        return { ok: false, code: 'FORBIDDEN' };
    }
    if (toMember.onboardingState !== 'active' || toMember.removedAt !== null) {
        return { ok: false, code: 'TARGET_NOT_ACTIVE' };
    }
    if (pending) {
        return { ok: false, code: 'PENDING_EXISTS' };
    }
    const created = await prisma_1.prisma.coordinatorTransfer.create({
        data: {
            teamId,
            fromMemberId,
            toMemberId,
            status: 'pending',
            expiresAt: new Date(Date.now() + TRANSFER_TTL_MS),
        },
    });
    const token = toMember.user.pushToken;
    if (token) {
        await (0, notification_service_1.sendToMultiple)([token], {
            title: team.name,
            body: `${fromMember.user.name} is inviting you to become coordinator for ${team.name}`,
            data: {
                deepLink: `relay://transfers/${created.id}`,
                type: 'COORDINATOR_TRANSFER_REQUEST',
            },
        });
    }
    const view = await getTransferForTeam(teamId, created.id);
    if (!view) {
        return { ok: false, code: 'NOT_FOUND' };
    }
    return { ok: true, transfer: view };
}
async function respondToTransfer(input) {
    const { teamId, transferId, actingMemberId, action } = input;
    const row = await prisma_1.prisma.coordinatorTransfer.findFirst({ where: { id: transferId, teamId } });
    if (row?.toMemberId !== actingMemberId) {
        return { ok: false, code: 'FORBIDDEN' };
    }
    if (row.status !== 'pending' || row.expiresAt.getTime() <= Date.now()) {
        return { ok: false, code: 'NOT_VALID' };
    }
    if (action === 'decline') {
        const updated = await prisma_1.prisma.coordinatorTransfer.update({
            where: { id: row.id },
            data: { status: 'declined', respondedAt: new Date() },
        });
        const [team, fromMember] = await Promise.all([
            prisma_1.prisma.team.findUnique({ where: { id: teamId }, select: { name: true } }),
            prisma_1.prisma.teamMember.findUnique({
                where: { id: row.fromMemberId },
                include: { user: { select: { pushToken: true } } },
            }),
        ]);
        if (team && fromMember?.user.pushToken) {
            await (0, notification_service_1.sendToMultiple)([fromMember.user.pushToken], {
                title: team.name,
                body: "Transfer was declined. You're still the coordinator.",
                data: { deepLink: `relay://team/settings`, type: 'COORDINATOR_TRANSFER_DECLINED' },
            });
        }
        const view = await getTransferForTeam(teamId, updated.id);
        if (!view) {
            return { ok: false, code: 'FORBIDDEN' };
        }
        return { ok: true, transfer: view };
    }
    const accepted = await prisma_1.prisma.$transaction(async (tx) => {
        await tx.teamMember.update({
            where: { id: row.fromMemberId },
            data: { role: 'coach' },
        });
        await tx.teamMember.update({
            where: { id: row.toMemberId },
            data: { role: 'coordinator' },
        });
        return tx.coordinatorTransfer.update({
            where: { id: row.id },
            data: { status: 'accepted', respondedAt: new Date() },
        });
    });
    const [team, fromMember, toMember] = await Promise.all([
        prisma_1.prisma.team.findUnique({ where: { id: teamId }, select: { name: true } }),
        prisma_1.prisma.teamMember.findUnique({
            where: { id: row.fromMemberId },
            include: { user: { select: { pushToken: true } } },
        }),
        prisma_1.prisma.teamMember.findUnique({
            where: { id: row.toMemberId },
            include: { user: { select: { pushToken: true } } },
        }),
    ]);
    if (team) {
        if (toMember?.user.pushToken) {
            await (0, notification_service_1.sendToMultiple)([toMember.user.pushToken], {
                title: team.name,
                body: `You are now the coordinator for ${team.name}`,
                data: { deepLink: 'relay://home', type: 'COORDINATOR_TRANSFER_ACCEPTED' },
            });
        }
        if (fromMember?.user.pushToken) {
            await (0, notification_service_1.sendToMultiple)([fromMember.user.pushToken], {
                title: team.name,
                body: 'Coordinator role transferred to your teammate',
                data: { deepLink: 'relay://team/settings', type: 'COORDINATOR_TRANSFER_COMPLETED' },
            });
        }
    }
    const view = await getTransferForTeam(teamId, accepted.id);
    if (!view) {
        return { ok: false, code: 'FORBIDDEN' };
    }
    (0, analytics_service_1.trackServerEvent)('coordinator_handoff_completed', { teamId });
    return { ok: true, transfer: view };
}
async function expirePendingTransfers() {
    const now = new Date();
    const rows = await prisma_1.prisma.coordinatorTransfer.findMany({
        where: { status: 'pending', expiresAt: { lt: now } },
    });
    for (const row of rows) {
        await prisma_1.prisma.coordinatorTransfer.update({
            where: { id: row.id },
            data: { status: 'expired' },
        });
        const [team, fromMember] = await Promise.all([
            prisma_1.prisma.team.findUnique({ where: { id: row.teamId }, select: { name: true } }),
            prisma_1.prisma.teamMember.findUnique({
                where: { id: row.fromMemberId },
                include: { user: { select: { pushToken: true } } },
            }),
        ]);
        if (team && fromMember?.user.pushToken) {
            await (0, notification_service_1.sendToMultiple)([fromMember.user.pushToken], {
                title: team.name,
                body: 'Your coordinator transfer request has expired. You are still the coordinator.',
                data: { deepLink: 'relay://team/settings', type: 'COORDINATOR_TRANSFER_EXPIRED' },
            });
        }
    }
    return rows.length;
}
//# sourceMappingURL=transfers.service.js.map