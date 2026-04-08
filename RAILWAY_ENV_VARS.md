# Railway Environment Variables

Set these variables in Railway for `relay-api` (do not commit real values):

- `DATABASE_URL` — PostgreSQL connection string (Railway provides this).
- `JWT_SECRET` — random secret string for signing tokens.
- `JWT_REFRESH_SECRET` — separate random secret for refresh tokens.
- `REDIS_URL` — Redis connection string (Railway provides this).
- `NODE_ENV` — set to `production`.
- `PORT` — set automatically by Railway; do not set manually.
- `SENTRY_DSN` — optional; leave blank if not set up.
- `ONESIGNAL_APP_ID` — push notification app ID.
- `ONESIGNAL_API_KEY` — push notification API key.
