import * as Sentry from '@sentry/node';
import { createApp } from './app';
import { getEnv } from './config/env';
import { enqueueTestJob, startJobInfrastructure, stopJobInfrastructure } from './jobs';
import { prisma } from './db/prisma';
import { initFirebaseIfConfigured } from './services/notification.service';

const env = getEnv();
const PORT = process.env.PORT || 3000;

initFirebaseIfConfigured(env);

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: 0,
    integrations: [Sentry.expressIntegration()],
  });
}

startJobInfrastructure(env);

const app = createApp(env);

void prisma
  .$connect()
  .then(() => console.log('[DB] Connected successfully'))
  .catch((e: unknown) => {
    const message = e instanceof Error ? e.message : String(e);
    console.log('[DB] Connection failed', message);
  });

void prisma.user
  .count()
  .then((count) => console.log('[DB] User table exists, count:', count))
  .catch((e: unknown) => {
    const message = e instanceof Error ? e.message : String(e);
    console.log('[DB] User table missing or error:', message);
  });

if (!process.env.DATABASE_URL?.includes('sslmode=require')) {
  console.log('[DB] Warning: DATABASE_URL is missing sslmode=require (required for Neon)');
}

const server = app.listen(PORT, () => {
  console.log(`relay-api listening on port ${String(PORT)}`);
  void enqueueTestJob().catch((err: unknown) => {
    console.error('Test job enqueue failed', err);
  });
});

const shutdown = (): void => {
  stopJobInfrastructure();
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
