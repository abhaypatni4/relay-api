"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma_1 = require("../db/prisma");
const user_profile_service_1 = require("../services/user-profile.service");
const pushTokenBody = zod_1.z.object({
    pushToken: zod_1.z.string().trim().min(1),
});
const patchMeBody = zod_1.z.object({
    name: zod_1.z.string().trim().min(1).optional(),
    role: zod_1.z.enum(client_1.Role).optional(),
    customRoleLabel: zod_1.z.string().trim().optional().nullable(),
    jerseyNumber: zod_1.z.string().trim().optional().nullable(),
    teamId: zod_1.z.string().trim().optional(),
});
const emergencyBody = zod_1.z.object({
    contactName: zod_1.z.unknown(),
    contactPhone: zod_1.z.unknown(),
    allergyAlert: zod_1.z.unknown(),
    staffNote: zod_1.z.unknown().optional(),
});
const notificationPrefsBody = zod_1.z.object({
    tripUpdates: zod_1.z.boolean(),
    itineraryChanges: zod_1.z.boolean(),
    availability: zod_1.z.boolean(),
    selectionNotifications: zod_1.z.boolean(),
    feedPostsRequired: zod_1.z.boolean(),
    feedPostsGeneral: zod_1.z.boolean(),
    reminders: zod_1.z.boolean(),
    nudges: zod_1.z.boolean(),
    urgentAlerts: zod_1.z.boolean(),
});
const defaultPrefs = {
    tripUpdates: true,
    itineraryChanges: true,
    availability: true,
    selectionNotifications: true,
    feedPostsRequired: true,
    feedPostsGeneral: true,
    reminders: true,
    nudges: true,
    urgentAlerts: true,
};
exports.usersController = {
    getMe: async (req, res) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const profile = await (0, user_profile_service_1.getCurrentUserProfile)(req.user.userId);
        res.json({
            user: {
                ...profile.user,
                emergencyInfoUpdatedAt: profile.user.emergencyInfoUpdatedAt?.toISOString() ?? null,
            },
            memberships: profile.memberships.map((m) => ({
                ...m,
            })),
        });
    },
    patchMe: async (req, res) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const parsed = patchMeBody.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid body' });
            return;
        }
        try {
            await (0, user_profile_service_1.patchCurrentUser)(req.user.userId, parsed.data);
            const profile = await (0, user_profile_service_1.getCurrentUserProfile)(req.user.userId);
            res.json({
                user: {
                    ...profile.user,
                    emergencyInfoUpdatedAt: profile.user.emergencyInfoUpdatedAt?.toISOString() ?? null,
                },
                memberships: profile.memberships,
            });
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : '';
            if (msg === 'TEAM_NOT_FOUND') {
                res.status(404).json({ error: 'Team not found' });
                return;
            }
            if (msg === 'TEAM_ID_REQUIRED') {
                res.status(400).json({ error: 'teamId is required when updating role for multiple memberships' });
                return;
            }
            throw e;
        }
    },
    patchEmergencyInfo: async (req, res) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const parsed = emergencyBody.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid body' });
            return;
        }
        const v = (0, user_profile_service_1.validateEmergencyPayload)(parsed.data);
        if (!v.ok) {
            res.status(400).json({ error: 'Validation failed', fields: v.fields });
            return;
        }
        await (0, user_profile_service_1.patchEmergencyInfo)(req.user.userId, v.data);
        const profile = await (0, user_profile_service_1.getCurrentUserProfile)(req.user.userId);
        res.json({
            user: {
                ...profile.user,
                emergencyInfoUpdatedAt: profile.user.emergencyInfoUpdatedAt?.toISOString() ?? null,
            },
            memberships: profile.memberships,
        });
    },
    deferEmergencyReminder: async (req, res) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        await (0, user_profile_service_1.deferEmergencyInfoReminder)(req.user.userId);
        res.status(204).send();
    },
    patchPushToken: async (req, res) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const parsed = pushTokenBody.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid body' });
            return;
        }
        await prisma_1.prisma.user.update({
            where: { id: req.user.userId },
            data: { pushToken: parsed.data.pushToken },
        });
        res.status(204).send();
    },
    getNotificationPreferences: async (req, res) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { notificationPreferences: true },
        });
        const prefs = user?.notificationPreferences && typeof user.notificationPreferences === 'object'
            ? { ...defaultPrefs, ...user.notificationPreferences }
            : defaultPrefs;
        res.status(200).json(prefs);
    },
    patchNotificationPreferences: async (req, res) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const parsed = notificationPrefsBody.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid body' });
            return;
        }
        const data = {
            ...parsed.data,
            urgentAlerts: true,
        };
        await prisma_1.prisma.user.update({
            where: { id: req.user.userId },
            data: { notificationPreferences: data },
        });
        res.status(200).json(data);
    },
    deleteMe: async (req, res) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const now = new Date();
        const anonymizedEmail = `deleted+${req.user.userId}@relay.invalid`;
        const anonymizedPhone = `deleted-${req.user.userId}`;
        await prisma_1.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: req.user.userId },
                data: {
                    deletionRequestedAt: now,
                    name: 'Deleted User',
                    email: anonymizedEmail,
                    phone: anonymizedPhone,
                    emergencyContactName: null,
                    emergencyContactPhone: null,
                    emergencyAllergyAlert: null,
                    emergencyStaffNote: null,
                    emergencyInfoUpdatedAt: null,
                    pushToken: null,
                },
            });
            await tx.refreshToken.updateMany({
                where: { userId: req.user.userId, revokedAt: null },
                data: { revokedAt: now },
            });
        });
        const dueAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        console.info(`[account-deletion] user=${req.user.userId} requestedAt=${now.toISOString()} dueAt=${dueAt.toISOString()}`);
        res.status(200).json({ message: 'Your account has been scheduled for deletion' });
    },
};
//# sourceMappingURL=users.controller.js.map