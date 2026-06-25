CREATE OR REPLACE FUNCTION public.find_worker_company(p_dni text)
RETURNS TABLE(ruc text, role text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.ruc, p.role
  FROM profiles p
  JOIN companies c ON c.id = p.company_id
  WHERE p.dni = p_dni
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.find_worker_company(text) TO anon, authenticated;
