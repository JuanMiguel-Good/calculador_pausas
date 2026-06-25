/*
# Tighten RLS on break_events (append-only audit log)

## Problem
Three policies had USING/WITH CHECK clauses that were always true, effectively
bypassing RLS for anon and authenticated roles on DELETE, UPDATE, and INSERT.

## Changes

### Removed policies
- `anon_delete_break_events` — deleted entirely.
  break_events is an audit log; rows must never be removed from the browser client.
  With no DELETE policy, RLS denies all delete attempts by default.

- `anon_update_break_events` — deleted entirely.
  Audit events are immutable. No policy = no updates allowed.

### Updated policy
- `anon_insert_break_events` — replaced WITH CHECK (true) with a meaningful
  predicate: action must be one of the three valid values AND session_id must
  not be null. The DB CHECK constraint already enforces the action enum, but
  expressing it in the policy makes the clause non-trivially true and documents
  the intent.

### Unchanged
- `anon_select_break_events` — intentionally USING (true). This is a
  single-tenant app with no sign-in; all break events are shared operational
  data and must be readable by the anon client.
*/

-- Remove unrestricted DELETE access (audit log rows are permanent)
DROP POLICY IF EXISTS "anon_delete_break_events" ON break_events;

-- Remove unrestricted UPDATE access (audit log rows are immutable)
DROP POLICY IF EXISTS "anon_update_break_events" ON break_events;

-- Replace always-true INSERT with a meaningful predicate
DROP POLICY IF EXISTS "anon_insert_break_events" ON break_events;
CREATE POLICY "anon_insert_break_events" ON break_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    session_id IS NOT NULL
    AND action IN ('completed', 'postponed', 'skipped')
  );
