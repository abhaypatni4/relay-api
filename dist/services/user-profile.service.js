"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUserProfile = getCurrentUserProfile;
exports.patchCurrentUser = patchCurrentUser;
exports.validateEmergencyPayload = validateEmergencyPayload;
exports.patchEmergencyInfo = patchEmergencyInfo;
exports.deferEmergencyInfoReminder = deferEmergencyInfoReminder;
const prisma_1 = require("../db/prisma");
const jobs_1 = require("../jobs");
async function getCurrentUserProfile(userId) {
    const user = await prisma_1.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            emergencyContactName: true,
            emergencyContactPhone: true,
            emergencyAllergyAlert: true,
            emergencyStaffNote: true,
            emergencyInfoUpdatedAt: true,
        },
    });
    const members = await prisma_1.prisma.teamMember.findMany({
        where: { userId, removedAt: null },
        include: { team: { select: { name: true, sport: true } } },
    });
    return {
        user,
        memberships: members.map((m) => ({
            teamId: m.teamId,
            teamMemberId: m.id,
            role: m.role,
            onboardingState: m.onboardingState,
            teamName: m.team.name,
            sport: m.team.sport,
        })),
    };
}
async function patchCurrentUser(userId, input) {
    const memberships = await prisma_1.prisma.teamMember.findMany({
        where: { userId, removedAt: null },
    });
    const needsMemberUpdate = input.role !== undefined ||
        input.customRoleLabel !== undefined ||
        input.jerseyNumber !== undefined;
    let target = input.teamId ? memberships.find((m) => m.teamId === input.teamId) : undefined;
    if (input.teamId && !target) {
        throw new Error('TEAM_NOT_FOUND');
    }
    if (!input.teamId && memberships.length === 1) {
        target = memberships[0];
    }
    if (needsMemberUpdate && !target) {
        throw new Error('TEAM_ID_REQUIRED');
    }
    await prisma_1.prisma.$transaction(async (tx) => {
        if (input.name !== undefined) {
            await tx.user.update({
                where: { id: userId },
                data: { name: input.name.trim() },
            });
            await tx.teamMember.updateMany({
                where: { userId, onboardingState: 'invited' },
                data: { onboardingState: 'profileIncomplete' },
            });
        }
        if (target && needsMemberUpdate) {
            await tx.teamMember.update({
                where: { id: target.id },
                data: {
                    ...(input.role !== undefined ? { role: input.role } : {}),
                    ...(input.customRoleLabel !== undefined
                        ? { customRoleLabel: input.customRoleLabel?.trim() ?? null }
                        : {}),
                    ...(input.jerseyNumber !== undefined
                        ? { jerseyNumber: input.jerseyNumber?.trim() ?? null }
                        : {}),
                },
            });
        }
    });
}
function validateEmergencyPayload(input) {
    const fields = {};
    if (typeof input.contactName !== 'string' || !input.contactName.trim()) {
        fields.contactName = ['Required'];
    }
    if (typeof input.contactPhone !== 'string' || !input.contactPhone.trim()) {
        fields.contactPhone = ['Required'];
    }
    if (typeof input.allergyAlert !== 'string' || !input.allergyAlert.trim()) {
        fields.allergyAlert = ['Required'];
    }
    const staffNote = typeof input.staffNote === 'string' && input.staffNote.trim() ? input.staffNote.trim() : null;
    if (Object.keys(fields).length > 0) {
        return { ok: false, fields };
    }
    return {
        ok: true,
        data: {
            contactName: input.contactName.trim(),
            contactPhone: input.contactPhone.trim(),
            allergyAlert: input.allergyAlert.trim(),
            staffNote,
        },
    };
}
async function patchEmergencyInfo(userId, data) {
    const now = new Date();
    await prisma_1.prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: userId },
            data: {
                emergencyContactName: data.contactName,
                emergencyContactPhone: data.contactPhone,
                emergencyAllergyAlert: data.allergyAlert,
                emergencyStaffNote: data.staffNote,
                emergencyInfoUpdatedAt: now,
            },
        });
        await tx.teamMember.updateMany({
            where: {
                userId,
                removedAt: null,
                onboardingState: { in: ['invited', 'profileIncomplete'] },
            },
            data: { onboardingState: 'active', joinedAt: now },
        });
    });
}
async function deferEmergencyInfoReminder(userId) {
    await (0, jobs_1.enqueueEmergencyInfoReminder)(userId);
}
//# sourceMappingURL=user-profile.service.js.map