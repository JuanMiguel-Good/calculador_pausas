/*
# Create break_events table (single-tenant, no auth)

## Purpose
Tracks every break alert interaction so workers and SST areas can
monitor real compliance with RM 546-2026-MINSA pause requirements.

## New Tables

### break_events
Stores one row per break interaction. No authentication required —
the anon key is used from the browser, making it accessible to all
workers without login.

Columns:
- id              uuid, primary key, auto-generated
- session_id      uuid — client-generated daily session identifier
                  (changes each day or each new calculation)
- worker_name     text — name/position entered in step 1 of the calculator
- break_index     int  — which break in the day (0-based)
- scheduled_time  timestamptz — exact clock time the break was scheduled for
- duration_min    int  — break duration in minutes
- action          text — 'completed' | 'postponed' | 'skipped'
- created_at      timestamptz — when this event was recorded

## Security
- RLS enabled on break_events.
- Four separate anon+authenticated policies (one per verb).
- USING (true) / WITH CHECK (true) is intentional: this is a
  single-tenant app with no sign-in. All data is shared/operational.
*/

CREATE TABLE IF NOT EXISTS break_events (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     uuid NOT NULL,
  worker_name    text NOT NULL DEFAULT '',
  break_index    int  NOT NULL,
  scheduled_time timestamptz NOT NULL,
  duration_min   int  NOT NULL,
  action         text NOT NULL CHECK (action IN ('completed','postponed','skipped')),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS break_events_session_idx ON break_events(session_id);
CREATE INDEX IF NOT EXISTS break_events_created_idx ON break_events(created_at);

ALTER TABLE break_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_break_events" ON break_events;
CREATE POLICY "anon_select_break_events" ON break_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_break_events" ON break_events;
CREATE POLICY "anon_insert_break_events" ON break_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_break_events" ON break_events;
CREATE POLICY "anon_update_break_events" ON break_events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_break_events" ON break_events;
CREATE POLICY "anon_delete_break_events" ON break_events FOR DELETE
  TO anon, authenticated USING (true);
