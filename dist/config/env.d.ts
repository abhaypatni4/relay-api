import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        production: "production";
        test: "test";
    }>>;
    DATABASE_URL: z.ZodString;
    JWT_ACCESS_SECRET: z.ZodString;
    REDIS_URL: z.ZodString;
    SENTRY_DSN: z.ZodPipe<z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>, z.ZodOptional<z.ZodURL>>;
    FIREBASE_PROJECT_ID: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    FIREBASE_CLIENT_EMAIL: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    FIREBASE_PRIVATE_KEY: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
}, z.core.$strip>;
export type Env = z.infer<typeof envSchema>;
export declare function getEnv(): Env;
export declare function isFirebaseConfigured(env: Env): boolean;
export {};
//# sourceMappingURL=env.d.ts.map