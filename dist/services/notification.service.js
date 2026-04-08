"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canSendNotification = canSendNotification;
exports.initFirebaseIfConfigured = initFirebaseIfConfigured;
exports.sendToDevice = sendToDevice;
exports.sendToMultiple = sendToMultiple;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const env_1 = require("../config/env");
const prisma_1 = require("../db/prisma");
const EXCLUDED_CAP_TYPES = new Set([
    'ACKNOWLEDGMENT_NUDGE',
    'urgentAlert',
    'TRIP_CANCELLED',
    'TRIP_POSTPONED',
    'COORDINATOR_TRANSFER_REQUEST',
]);
async function canSendNotification(userId, notificationType) {
    if (EXCLUDED_CAP_TYPES.has(notificationType)) {
        return true;
    }
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await prisma_1.prisma.notificationLog.count({
        where: {
            userId,
            sentAt: { gte: since },
            type: { notIn: Array.from(EXCLUDED_CAP_TYPES) },
        },
    });
    return count < 3;
}
function initFirebaseIfConfigured(env) {
    if (!(0, env_1.isFirebaseConfigured)(env)) {
        return;
    }
    if (firebase_admin_1.default.apps.length > 0) {
        return;
    }
    const projectId = env.FIREBASE_PROJECT_ID;
    const clientEmail = env.FIREBASE_CLIENT_EMAIL;
    const privateKeyRaw = env.FIREBASE_PRIVATE_KEY;
    if (!projectId || !clientEmail || !privateKeyRaw) {
        return;
    }
    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
}
async function sendToDevice(pushToken, notification) {
    if (firebase_admin_1.default.apps.length === 0) {
        console.warn('Firebase Admin not configured; sendToDevice skipped');
        return;
    }
    const data = {};
    for (const [k, v] of Object.entries(notification.data)) {
        data[k] = typeof v === 'string' ? v : String(v);
    }
    await firebase_admin_1.default.messaging().send({
        token: pushToken,
        notification: { title: notification.title, body: notification.body },
        data,
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
    });
}
async function sendToMultiple(pushTokens, notification) {
    const notificationType = notification.data.type ?? 'unknown';
    const tokens = pushTokens.filter((t) => t.length > 0);
    await Promise.all(tokens.map(async (t) => {
        const user = await prisma_1.prisma.user.findFirst({
            where: { pushToken: t },
            select: { id: true },
        });
        if (user) {
            const allowed = await canSendNotification(user.id, notificationType);
            if (!allowed) {
                console.info(`[notifications] skipped due to daily cap user=${user.id} type=${notificationType}`);
                return;
            }
        }
        await sendToDevice(t, notification).catch((err) => {
            console.error('sendToDevice failed', err);
        });
        if (user) {
            await prisma_1.prisma.notificationLog.create({
                data: {
                    userId: user.id,
                    type: notificationType,
                },
            });
        }
    }));
}
//# sourceMappingURL=notification.service.js.map