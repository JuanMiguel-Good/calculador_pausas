/*
# Multi-tenant schema — pausas laborales platform (ordered by dependency)

Creates tables in dependency order, then applies all RLS policies after
all tables exist to avoid forward-reference errors.
*/

-- ── 1. companies (no FK deps) ──
CREATE TABLE IF NOT EXISTS companies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  ruc           text NOT NULL,
  contact_email text NOT NULL,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','suspended')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  approved_at   timestamptz,
  approved_by   uuid REFERENCES auth.users(id)
);
CREATE INDEX IF NOT EXISTS companies_status_idx ON companies(status);
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- ── 2. profiles (depends on companies) ──
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id  uuid REFERENCES companies(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('superadmin','admin','worker')),
  full_name   text NOT NULL DEFAULT '',
  dni         text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS profiles_company_idx ON profiles(company_id);
CREATE INDEX IF NOT EXISTS profiles_role_idx    ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_dni_idx     ON profiles(dni);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ── 3. job_positions (depends on companies + profiles) ──
CREATE TABLE IF NOT EXISTS job_positions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name        text NOT NULL,
  config      jsonb NOT NULL DEFAULT '{}',
  result      jsonb NOT NULL DEFAULT '{}',
  created_by  uuid REFERENCES profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS job_positions_company_idx ON job_positions(company_id);
ALTER TABLE job_positions ENABLE ROW LEVEL SECURITY;

-- ── 4. worker_assignments (depends on profiles + job_positions) ──
CREATE TABLE IF NOT EXISTS worker_assignments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_position_id uuid NOT NULL REFERENCES job_positions(id) ON DELETE CASCADE,
  assigned_by     uuid REFERENCES profiles(id),
  assigned_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wa_worker_idx   ON worker_assignments(worker_id);
CREATE INDEX IF NOT EXISTS wa_position_idx ON worker_assignments(job_position_id);
ALTER TABLE worker_assignments ENABLE ROW LEVEL SECURITY;

-- ── 5. break_events: add multi-tenant columns (nullable, no data loss) ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='break_events' AND column_name='worker_id') THEN
    ALTER TABLE break_events ADD COLUMN worker_id uuid REFERENCES profiles(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='break_events' AND column_name='company_id') THEN
    ALTER TABLE break_events ADD COLUMN company_id uuid REFERENCES companies(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='break_events' AND column_name='job_position_id') THEN
    ALTER TABLE break_events ADD COLUMN job_position_id uuid REFERENCES job_positions(id);
  END IF;
END $$;

-- ── 6. RLS policies — companies ──
DROP POLICY IF EXISTS "companies_public_read_active" ON companies;
CREATE POLICY "companies_public_read_active" ON companies FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS "companies_superadmin_select" ON companies;
CREATE POLICY "companies_superadmin_select" ON companies FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'));

DROP POLICY IF EXISTS "companies_superadmin_insert" ON companies;
CREATE POLICY "companies_superadmin_insert" ON companies FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'));

DROP POLICY IF EXISTS "companies_superadmin_update" ON companies;
CREATE POLICY "companies_superadmin_update" ON companies FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'));

DROP POLICY IF EXISTS "companies_superadmin_delete" ON companies;
CREATE POLICY "companies_superadmin_delete" ON companies FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'));

DROP POLICY IF EXISTS "companies_admin_read_own" ON companies;
CREATE POLICY "companies_admin_read_own" ON companies FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = companies.id));

-- Allow anon + admin to self-register (INSERT) — requires no auth yet
DROP POLICY IF EXISTS "companies_anon_insert" ON companies;
CREATE POLICY "companies_anon_insert" ON companies FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ── 7. RLS policies — profiles ──
DROP POLICY IF EXISTS "profiles_read_own" ON profiles;
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_read_company" ON profiles;
CREATE POLICY "profiles_admin_read_company" ON profiles FOR SELECT
  TO authenticated
  USING (
    company_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin','superadmin') AND (p.company_id = profiles.company_id OR p.role = 'superadmin')
    )
  );

DROP POLICY IF EXISTS "profiles_superadmin_insert" ON profiles;
CREATE POLICY "profiles_superadmin_insert" ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'superadmin'));

-- ── 8. RLS policies — job_positions ──
DROP POLICY IF EXISTS "jp_company_select" ON job_positions;
CREATE POLICY "jp_company_select" ON job_positions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (company_id = job_positions.company_id OR role = 'superadmin')));

DROP POLICY IF EXISTS "jp_admin_insert" ON job_positions;
CREATE POLICY "jp_admin_insert" ON job_positions FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin') AND (company_id = job_positions.company_id OR role = 'superadmin')));

DROP POLICY IF EXISTS "jp_admin_update" ON job_positions;
CREATE POLICY "jp_admin_update" ON job_positions FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin') AND (company_id = job_positions.company_id OR role = 'superadmin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin') AND (company_id = job_positions.company_id OR role = 'superadmin')));

DROP POLICY IF EXISTS "jp_admin_delete" ON job_positions;
CREATE POLICY "jp_admin_delete" ON job_positions FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','superadmin') AND (company_id = job_positions.company_id OR role = 'superadmin')));

-- ── 9. RLS policies — worker_assignments ──
DROP POLICY IF EXISTS "wa_select" ON worker_assignments;
CREATE POLICY "wa_select" ON worker_assignments FOR SELECT
  TO authenticated
  USING (
    worker_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p JOIN job_positions jp ON jp.id = worker_assignments.job_position_id
      WHERE p.id = auth.uid() AND p.role IN ('admin','superadmin') AND (p.company_id = jp.company_id OR p.role = 'superadmin')
    )
  );

DROP POLICY IF EXISTS "wa_admin_insert" ON worker_assignments;
CREATE POLICY "wa_admin_insert" ON worker_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p JOIN job_positions jp ON jp.id = worker_assignments.job_position_id
      WHERE p.id = auth.uid() AND p.role IN ('admin','superadmin') AND (p.company_id = jp.company_id OR p.role = 'superadmin')
    )
  );

DROP POLICY IF EXISTS "wa_admin_update" ON worker_assignments;
CREATE POLICY "wa_admin_update" ON worker_assignments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p JOIN job_positions jp ON jp.id = worker_assignments.job_position_id
      WHERE p.id = auth.uid() AND p.role IN ('admin','superadmin') AND (p.company_id = jp.company_id OR p.role = 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p JOIN job_positions jp ON jp.id = worker_assignments.job_position_id
      WHERE p.id = auth.uid() AND p.role IN ('admin','superadmin') AND (p.company_id = jp.company_id OR p.role = 'superadmin')
    )
  );

DROP POLICY IF EXISTS "wa_admin_delete" ON worker_assignments;
CREATE POLICY "wa_admin_delete" ON worker_assignments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p JOIN job_positions jp ON jp.id = worker_assignments.job_position_id
      WHERE p.id = auth.uid() AND p.role IN ('admin','superadmin') AND (p.company_id = jp.company_id OR p.role = 'superadmin')
    )
  );

-- ── 10. break_events: refresh insert policy ──
DROP POLICY IF EXISTS "anon_insert_break_events" ON break_events;
CREATE POLICY "anon_insert_break_events" ON break_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (session_id IS NOT NULL AND action IN ('completed','postponed','skipped'));

-- Allow authenticated workers to read only their own events; admins read company events
DROP POLICY IF EXISTS "anon_select_break_events" ON break_events;
CREATE POLICY "anon_select_break_events" ON break_events FOR SELECT
  TO anon, authenticated
  USING (
    worker_id IS NULL
    OR worker_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid()
        AND p.role IN ('admin','superadmin')
        AND (p.company_id = break_events.company_id OR p.role = 'superadmin')
    )
  );
