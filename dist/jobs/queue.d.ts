import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import type { Env } from '../config/env';
/** BullMQ requires a dedicated connection per queue/worker; duplicate from a shared parent. */
export declare function createRedisConnection(env: Env): IORedis;
export declare const QUEUE_NAMES: {
    readonly overdueDetection: "overdueDetection";
    readonly transferExpiry: "transferExpiry";
    readonly emergencyInfoReminder: "emergencyInfoReminder";
};
export declare function createQueues(env: Env): {
    overdueDetection: Queue;
    transferExpiry: Queue;
    emergencyInfoReminder: Queue;
};
//# sourceMappingURL=queue.d.ts.map