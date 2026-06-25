-- Helper functions with SECURITY DEFINER to read caller's own profile row
-- without triggering RLS, breaking infinite recursion in profile policies.

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_role()       TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_company_id() TO authenticated;

-- ── profiles: drop and recreate recursive policies ──

DROP POLICY IF EXISTS "profiles_admin_read_company" ON profiles;
CREATE POLICY "profiles_admin_read_company" ON profiles FOR SELECT
  TO authenticated
  USING (
    company_id IS NOT NULL AND
    get_my_role() IN ('admin','superadmin') AND
    (get_my_company_id() = company_id OR get_my_role() = 'superadmin')
  );

DROP POLICY IF EXISTS "profiles_superadmin_insert" ON profiles;
CREATE POLICY "profiles_superadmin_insert" ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (get_my_role() = 'superadmin');

-- ── job_positions: replace profiles subqueries ──

DROP POLICY IF EXISTS "jp_company_select" ON job_positions;
CREATE POLICY "jp_company_select" ON job_positions FOR SELECT
  TO authenticated
  USING (
    get_my_company_id() = company_id OR get_my_role() = 'superadmin'
  );

DROP POLICY IF EXISTS "jp_admin_insert" ON job_positions;
CREATE POLICY "jp_admin_insert" ON job_positions FOR INSERT
  TO authenticated
  WITH CHECK (
    get_my_role() IN ('admin','superadmin') AND
    (get_my_company_id() = company_id OR get_my_role() = 'superadmin')
  );

DROP POLICY IF EXISTS "jp_admin_update" ON job_positions;
CREATE POLICY "jp_admin_update" ON job_positions FOR UPDATE
  TO authenticated
  USING (
    get_my_role() IN ('admin','superadmin') AND
    (get_my_company_id() = company_id OR get_my_role() = 'superadmin')
  )
  WITH CHECK (
    get_my_role() IN ('admin','superadmin') AND
    (get_my_company_id() = company_id OR get_my_role() = 'superadmin')
  );

DROP POLICY IF EXISTS "jp_admin_delete" ON job_positions;
CREATE POLICY "jp_admin_delete" ON job_positions FOR DELETE
  TO authenticated
  USING (
    get_my_role() IN ('admin','superadmin') AND
    (get_my_company_id() = company_id OR get_my_role() = 'superadmin')
  );

-- ── worker_assignments: replace profiles subqueries ──

DROP POLICY IF EXISTS "wa_select" ON worker_assignments;
CREATE POLICY "wa_select" ON worker_assignments FOR SELECT
  TO authenticated
  USING (
    worker_id = auth.uid()
    OR (
      get_my_role() IN ('admin','superadmin') AND
      EXISTS (
        SELECT 1 FROM job_positions jp
        WHERE jp.id = worker_assignments.job_position_id
          AND (get_my_company_id() = jp.company_id OR get_my_role() = 'superadmin')
      )
    )
  );

DROP POLICY IF EXISTS "wa_admin_insert" ON worker_assignments;
CREATE POLICY "wa_admin_insert" ON worker_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    get_my_role() IN ('admin','superadmin') AND
    EXISTS (
      SELECT 1 FROM job_positions jp
      WHERE jp.id = worker_assignments.job_position_id
        AND (get_my_company_id() = jp.company_id OR get_my_role() = 'superadmin')
    )
  );

DROP POLICY IF EXISTS "wa_admin_update" ON worker_assignments;
CREATE POLICY "wa_admin_update" ON worker_assignments FOR UPDATE
  TO authenticated
  USING (
    get_my_role() IN ('admin','superadmin') AND
    EXISTS (
      SELECT 1 FROM job_positions jp
      WHERE jp.id = worker_assignments.job_position_id
        AND (get_my_company_id() = jp.company_id OR get_my_role() = 'superadmin')
    )
  )
  WITH CHECK (
    get_my_role() IN ('admin','superadmin') AND
    EXISTS (
      SELECT 1 FROM job_positions jp
      WHERE jp.id = worker_assignments.job_position_id
        AND (get_my_company_id() = jp.company_id OR get_my_role() = 'superadmin')
    )
  );

DROP POLICY IF EXISTS "wa_admin_delete" ON worker_assignments;
CREATE POLICY "wa_admin_delete" ON worker_assignments FOR DELETE
  TO authenticated
  USING (
    get_my_role() IN ('admin','superadmin') AND
    EXISTS (
      SELECT 1 FROM job_positions jp
      WHERE jp.id = worker_assignments.job_position_id
        AND (get_my_company_id() = jp.company_id OR get_my_role() = 'superadmin')
    )
  );

-- ── companies: replace profiles subqueries ──

DROP POLICY IF EXISTS "companies_superadmin_select" ON companies;
CREATE POLICY "companies_superadmin_select" ON companies FOR SELECT
  TO authenticated
  USING (get_my_role() = 'superadmin');

DROP POLICY IF EXISTS "companies_superadmin_insert" ON companies;
CREATE POLICY "companies_superadmin_insert" ON companies FOR INSERT
  TO authenticated
  WITH CHECK (get_my_role() = 'superadmin');

DROP POLICY IF EXISTS "companies_superadmin_update" ON companies;
CREATE POLICY "companies_superadmin_update" ON companies FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'superadmin')
  WITH CHECK (get_my_role() = 'superadmin');

DROP POLICY IF EXISTS "companies_superadmin_delete" ON companies;
CREATE POLICY "companies_superadmin_delete" ON companies FOR DELETE
  TO authenticated
  USING (get_my_role() = 'superadmin');

DROP POLICY IF EXISTS "companies_admin_read_own" ON companies;
CREATE POLICY "companies_admin_read_own" ON companies FOR SELECT
  TO authenticated
  USING (get_my_company_id() = id);
