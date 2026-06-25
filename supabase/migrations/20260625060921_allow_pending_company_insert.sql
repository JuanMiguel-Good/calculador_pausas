-- Allow any authenticated user to insert a pending company during self-registration.
-- Companies start with status='pending' and require superadmin approval, so this is safe.
DROP POLICY IF EXISTS "companies_register_insert" ON companies;
CREATE POLICY "companies_register_insert" ON companies FOR INSERT
  TO authenticated
  WITH CHECK (status = 'pending');
