import * as Sentry from '@sentry/node';
import { createApp } from './app';
import { getEnv } from './config/env';
import { enqueueTestJob, startJobInfrastructure, stopJobInfrastructure } from './jobs';
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
