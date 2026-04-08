"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startEmergencyInfoReminderWorker = startEmergencyInfoReminderWorker;
const bullmq_1 = require("bullmq");
const prisma_1 = require("../db/prisma");
const notification_service_1 = require("../services/notification.service");
const queue_1 = require("./queue");
function startEmergencyInfoReminderWorker(connection) {
    return new bullmq_1.Worker(queue_1.QUEUE_NAMES.emergencyInfoReminder, async (job) => {
        if (job.name !== 'deferredUserReminder') {
            await Promise.resolve();
            return;
        }
        const payload = job.data;
        const userId = payload.userId;
        if (userId === undefined || userId === '') {
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { pushToken: true, name: true },
        });
        const token = user?.pushToken;
        if (!token) {
            return;
        }
        const team = await prisma_1.prisma.teamMember.findFirst({
            where: { userId, removedAt: null },
            include: { team: { select: { name: true } } },
        });
        const teamName = team?.team.name ?? 'Your team';
        await (0, notification_service_1.sendToDevice)(token, {
            title: teamName,
            body: 'Complete your emergency info before your next trip',
            data: {
                deepLink: 'relay://profile/emergency',
                type: 'emergencyInfoReminder',
            },
        });
    }, { connection, concurrency: 1 });
}
//# sourceMappingURL=emergencyInfoReminder.job.js.map