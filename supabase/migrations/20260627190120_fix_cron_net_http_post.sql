/*
# Fix cron job to use correct pg_net function signature

Replaces the cron job body with the correct `net.http_post` call
(pg_net extension lives in the `net` schema, not `extensions`).
*/

SELECT cron.unschedule('send-break-notifications');

SELECT cron.schedule(
  'send-break-notifications',
  '* * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://wfmuvdioqscurgvdzddu.supabase.co/functions/v1/send-break-notifications',
    body    := '{}'::jsonb,
    headers := '{"Content-Type":"application/json"}'::jsonb
  )
  $$
);
