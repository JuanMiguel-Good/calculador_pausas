/*
# Enable pg_cron + pg_net and schedule break notification delivery

## Purpose
Creates a background job that fires every minute and calls the
`send-break-notifications` Edge Function. That function checks which
workers have a break scheduled for the current minute and sends them
an OS-level push notification via the Web Push protocol.

## Changes
- Enables `pg_cron` extension (scheduled jobs inside Postgres)
- Enables `pg_net` extension (async HTTP calls from Postgres)
- Creates cron job `send-break-notifications` — runs `* * * * *`
  (every minute) and POSTs to the Edge Function URL.

## Notes
1. The edge function is deployed with verify_jwt=false because it is
   called server-side (not by a browser client).
2. The function itself uses the SUPABASE_SERVICE_ROLE_KEY env var
   (auto-injected by Supabase) to query profiles.
3. If a push subscription returns HTTP 410/404 (expired/unregistered),
   the function automatically clears that worker's subscription and sets
   alerts_enabled=false to stop future delivery attempts.
*/

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net  WITH SCHEMA extensions;

SELECT cron.unschedule('send-break-notifications') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'send-break-notifications'
);

SELECT cron.schedule(
  'send-break-notifications',
  '* * * * *',
  $$
  SELECT extensions.http_post(
    'https://wfmuvdioqscurgvdzddu.supabase.co/functions/v1/send-break-notifications',
    '{}',
    'application/json'
  )
  $$
);
