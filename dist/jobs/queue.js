"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEUE_NAMES = void 0;
exports.createRedisConnection = createRedisConnection;
exports.createQueues = createQueues;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
let parentRedis;
function getParentRedis(env) {
    const redisUrl = process.env.REDIS_URL ?? env.REDIS_URL;
    parentRedis ??= new ioredis_1.default(redisUrl, { maxRetriesPerRequest: null });
    return parentRedis;
}
/** BullMQ requires a dedicated connection per queue/worker; duplicate from a shared parent. */
function createRedisConnection(env) {
    return getParentRedis(env).duplicate();
}
exports.QUEUE_NAMES = {
    overdueDetection: 'overdueDetection',
    transferExpiry: 'transferExpiry',
    emergencyInfoReminder: 'emergencyInfoReminder',
};
function createQueues(env) {
    return {
        overdueDetection: new bullmq_1.Queue(exports.QUEUE_NAMES.overdueDetection, {
            connection: createRedisConnection(env),
        }),
        transferExpiry: new bullmq_1.Queue(exports.QUEUE_NAMES.transferExpiry, {
            connection: createRedisConnection(env),
        }),
        emergencyInfoReminder: new bullmq_1.Queue(exports.QUEUE_NAMES.emergencyInfoReminder, {
            connection: createRedisConnection(env),
        }),
    };
}
//# sourceMappingURL=queue.js.map