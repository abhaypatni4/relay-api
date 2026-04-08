"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startJobInfrastructure = startJobInfrastructure;
exports.stopJobInfrastructure = stopJobInfrastructure;
exports.enqueueTestJob = enqueueTestJob;
exports.enqueueEmergencyInfoReminder = enqueueEmergencyInfoReminder;
const emergencyInfoReminder_job_1 = require("./emergencyInfoReminder.job");
const overdueDetection_job_1 = require("./overdueDetection.job");
const queue_1 = require("./queue");
const transferExpiry_job_1 = require("./transferExpiry.job");
let workers = [];
let queues;
function startJobInfrastructure(env) {
    queues = (0, queue_1.createQueues)(env);
    workers = [
        (0, overdueDetection_job_1.startOverdueDetectionWorker)((0, queue_1.createRedisConnection)(env)),
        (0, transferExpiry_job_1.startTransferExpiryWorker)((0, queue_1.createRedisConnection)(env)),
        (0, emergencyInfoReminder_job_1.startEmergencyInfoReminderWorker)((0, queue_1.createRedisConnection)(env)),
    ];
    // Overdue detection runs every 30 minutes (BullMQ repeating job).
    // Safe on restarts via stable jobId.
    void queues.overdueDetection
        .add('overdueDetection.scan', { at: Date.now() }, {
        repeat: { every: 30 * 60 * 1000 },
        jobId: 'overdueDetection.scan',
        removeOnComplete: true,
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
    })
        .catch((err) => {
        console.error('Failed to schedule overdueDetection.scan', err);
    });
    void queues.transferExpiry
        .add('transferExpiry.scan', { at: Date.now() }, {
        repeat: { every: 60 * 60 * 1000 },
        jobId: 'transferExpiry.scan',
        removeOnComplete: true,
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
    })
        .catch((err) => {
        console.error('Failed to schedule transferExpiry.scan', err);
    });
}
function stopJobInfrastructure() {
    void Promise.all(workers.map((w) => w.close()));
    workers = [];
    void queues?.overdueDetection.close();
    void queues?.transferExpiry.close();
    void queues?.emergencyInfoReminder.close();
    queues = undefined;
}
async function enqueueTestJob() {
    if (!queues) {
        throw new Error('Queues not initialized');
    }
    await queues.overdueDetection.add('relay.test', { at: Date.now() }, { removeOnComplete: true, attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
}
const EMERGENCY_REMINDER_DELAY_MS = 24 * 60 * 60 * 1000;
async function enqueueEmergencyInfoReminder(userId) {
    if (!queues) {
        console.warn('Queues not initialized; skip emergency reminder scheduling');
        return;
    }
    await queues.emergencyInfoReminder.add('deferredUserReminder', { userId }, {
        delay: EMERGENCY_REMINDER_DELAY_MS,
        removeOnComplete: true,
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
    });
}
//# sourceMappingURL=index.js.map