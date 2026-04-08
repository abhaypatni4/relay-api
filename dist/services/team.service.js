"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTeamForUser = createTeamForUser;
exports.getTeamById = getTeamById;
exports.updateTeam = updateTeam;
exports.listTeamMembersWithUsers = listTeamMembersWithUsers;
exports.getTeamMemberById = getTeamMemberById;
exports.softRemoveTeamMember = softRemoveTeamMember;
exports.toTeamMemberWithUser = toTeamMemberWithUser;
exports.sortMembersForRoster = sortMembersForRoster;
const prisma_1 = require("../db/prisma");
async function createTeamForUser(userId, input) {
    return prisma_1.prisma.$transaction(async (tx) => {
        const team = await tx.team.create({
            data: {
                name: input.name.trim(),
                sport: input.sport?.trim() ?? null,
                homeLocation: input.homeLocation?.trim() ?? null,
            },
        });
        const member = await tx.teamMember.create({
            data: {
                userId,
                teamId: team.id,
                role: 'coordinator',
                onboardingState: 'active',
                joinedAt: new Date(),
            },
        });
        return { teamId: team.id, memberId: member.id };
    });
}
async function getTeamById(teamId) {
    return prisma_1.prisma.team.findUnique({ where: { id: teamId } });
}
async function updateTeam(teamId, data) {
    await prisma_1.prisma.team.update({
        where: { id: teamId },
        data: {
            ...(data.name !== undefined ? { name: data.name.trim() } : {}),
            ...(data.sport !== undefined ? { sport: data.sport?.trim() ?? null } : {}),
            ...(data.homeLocation !== undefined
                ? { homeLocation: data.homeLocation?.trim() ?? null }
                : {}),
        },
    });
}
async function listTeamMembersWithUsers(teamId) {
    const rows = await prisma_1.prisma.teamMember.findMany({
        where: { teamId, removedAt: null },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    phone: true,
                    emergencyContactName: true,
                    emergencyContactPhone: true,
                    emergencyAllergyAlert: true,
                    emergencyStaffNote: true,
                    emergencyInfoUpdatedAt: true,
                },
            },
        },
        orderBy: { invitedAt: 'asc' },
    });
    return rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        teamId: r.teamId,
        role: r.role,
        onboardingState: r.onboardingState,
        jerseyNumber: r.jerseyNumber,
        customRoleLabel: r.customRoleLabel,
        invitedAt: r.invitedAt,
        joinedAt: r.joinedAt,
        user: r.user,
    }));
}
async function getTeamMemberById(teamId, memberId) {
    return prisma_1.prisma.teamMember.findFirst({
        where: { id: memberId, teamId, removedAt: null },
    });
}
async function softRemoveTeamMember(teamId, memberId) {
    await prisma_1.prisma.teamMember.updateMany({
        where: { id: memberId, teamId, removedAt: null },
        data: { removedAt: new Date() },
    });
}
function toTeamMemberWithUser(row) {
    return {
        id: row.id,
        userId: row.userId,
        teamId: row.teamId,
        role: row.role,
        onboardingState: row.onboardingState,
        jerseyNumber: row.jerseyNumber,
        customRoleLabel: row.customRoleLabel,
        invitedAt: row.invitedAt,
        joinedAt: row.joinedAt,
        name: row.user.name,
        email: row.user.email,
        phone: row.user.phone,
        emergencyContactName: row.user.emergencyContactName,
        emergencyContactPhone: row.user.emergencyContactPhone,
        emergencyAllergyAlert: row.user.emergencyAllergyAlert,
        emergencyStaffNote: row.user.emergencyStaffNote,
        emergencyInfoUpdatedAt: row.user.emergencyInfoUpdatedAt,
    };
}
function sortMembersForRoster(rows) {
    const pending = new Set(['invited', 'profileIncomplete']);
    return [...rows].sort((a, b) => {
        const ap = pending.has(a.onboardingState) ? 0 : 1;
        const bp = pending.has(b.onboardingState) ? 0 : 1;
        if (ap !== bp)
            return ap - bp;
        return a.user.name.localeCompare(b.user.name);
    });
}
//# sourceMappingURL=team.service.js.map