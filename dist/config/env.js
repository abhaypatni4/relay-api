"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = getEnv;
exports.isFirebaseConfigured = isFirebaseConfigured;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
(0, dotenv_1.config)();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: zod_1.z.string().trim().min(1, 'DATABASE_URL is required'),
    JWT_ACCESS_SECRET: zod_1.z.string().trim().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
    REDIS_URL: zod_1.z.string().trim().min(1, 'REDIS_URL is required'),
    SENTRY_DSN: zod_1.z
        .string()
        .trim()
        .optional()
        .transform((v) => (v === '' || v === undefined ? undefined : v))
        .pipe(zod_1.z.url().optional()),
    /** Firebase Admin — optional; push sends are no-ops when unset. */
    FIREBASE_PROJECT_ID: zod_1.z
        .string()
        .trim()
        .optional()
        .transform((v) => (v === '' || v === undefined ? undefined : v)),
    FIREBASE_CLIENT_EMAIL: zod_1.z
        .string()
        .trim()
        .optional()
        .transform((v) => (v === '' || v === undefined ? undefined : v)),
    FIREBASE_PRIVATE_KEY: zod_1.z
        .string()
        .trim()
        .optional()
        .transform((v) => (v === '' || v === undefined ? undefined : v)),
});
let cached;
function getEnv() {
    if (cached) {
        return cached;
    }
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
        const message = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
        throw new Error(`Invalid environment: ${message}`);
    }
    cached = parsed.data;
    return cached;
}
function isFirebaseConfigured(env) {
    return Boolean(env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY);
}
//# sourceMappingURL=env.js.map