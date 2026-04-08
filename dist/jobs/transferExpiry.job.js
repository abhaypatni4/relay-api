"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTransferExpiryWorker = startTransferExpiryWorker;
const bullmq_1 = require("bullmq");
const transfers_service_1 = require("../services/transfers.service");
const queue_1 = require("./queue");
function startTransferExpiryWorker(connection) {
    return new bullmq_1.Worker(queue_1.QUEUE_NAMES.transferExpiry, async (job) => {
        if (job.name !== 'transferExpiry.scan') {
            return;
        }
        await (0, transfers_service_1.expirePendingTransfers)();
    }, { connection, concurrency: 1 });
}
//# sourceMappingURL=transferExpiry.job.js.map