/*
# Add Web Push notification columns to profiles

## Purpose
Enables persistent Web Push notifications — workers activate once and
receive OS-level break reminders every day without opening the app.

## Changes to existing tables

### profiles
- `alerts_enabled` (boolean, default false): whether the worker has
  opted in to daily push notifications. The backend cron job reads
  this flag to decide who to notify.
- `push_subscription` (jsonb, nullable): the browser's PushSubscription
  object (endpoint + p256dh key + auth key) serialized via
  subscription.toJSON(). Saved when the worker clicks "Activar alertas"
  and cleared when they deactivate.

## Security
No new policies needed. The existing `profiles_update_own` policy
already allows workers to update their own row (auth.uid() = id).
The service role key used by the edge function bypasses RLS.

## Notes
1. Both columns are nullable/have defaults so existing rows are unaffected.
2. `push_subscription` is intentionally jsonb (not a structured type)
   because the PushSubscription format can vary by browser.
3. The edge function (send-break-notifications) runs every minute via
   pg_cron and queries profiles WHERE alerts_enabled = true.
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'alerts_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN alerts_enabled boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'push_subscription'
  ) THEN
    ALTER TABLE profiles ADD COLUMN push_subscription jsonb;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS profiles_alerts_enabled_idx ON profiles(alerts_enabled)
  WHERE alerts_enabled = true;
