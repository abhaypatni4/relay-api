"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const Sentry = __importStar(require("@sentry/node"));
const app_1 = require("./app");
const env_1 = require("./config/env");
const jobs_1 = require("./jobs");
const prisma_1 = require("./db/prisma");
const notification_service_1 = require("./services/notification.service");
const env = (0, env_1.getEnv)();
const PORT = process.env.PORT || 3000;
(0, notification_service_1.initFirebaseIfConfigured)(env);
if (env.SENTRY_DSN) {
    Sentry.init({
        dsn: env.SENTRY_DSN,
        environment: env.NODE_ENV,
        tracesSampleRate: 0,
        integrations: [Sentry.expressIntegration()],
    });
}
(0, jobs_1.startJobInfrastructure)(env);
const app = (0, app_1.createApp)(env);
void prisma_1.prisma
    .$connect()
    .then(() => console.log('[DB] Connected successfully'))
    .catch((e) => {
    const message = e instanceof Error ? e.message : String(e);
    console.log('[DB] Connection failed', message);
});
void prisma_1.prisma.user
    .count()
    .then((count) => console.log('[DB] User table exists, count:', count))
    .catch((e) => {
    const message = e instanceof Error ? e.message : String(e);
    console.log('[DB] User table missing or error:', message);
});
if (!process.env.DATABASE_URL?.includes('sslmode=require')) {
    console.log('[DB] Warning: DATABASE_URL is missing sslmode=require (required for Neon)');
}
const server = app.listen(PORT, () => {
    console.log(`relay-api listening on port ${String(PORT)}`);
    void (0, jobs_1.enqueueTestJob)().catch((err) => {
        console.error('Test job enqueue failed', err);
    });
});
const shutdown = () => {
    (0, jobs_1.stopJobInfrastructure)();
    server.close(() => {
        process.exit(0);
    });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
//# sourceMappingURL=server.js.map