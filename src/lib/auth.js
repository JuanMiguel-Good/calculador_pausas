import { supabase } from './supabase.js';

export async function getProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('*, company:companies(id,name,ruc,status)')
    .eq('id', userId)
    .maybeSingle();
  return data;
}

export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Look up which company a DNI belongs to (anon-callable via SECURITY DEFINER RPC)
export async function lookupDniCompany(dni) {
  const { data, error } = await supabase.rpc('find_worker_company', { p_dni: dni });
  if (error) throw error;
  return data?.[0] || null; // { ruc, role } or null
}

// Sign in: identifier = email or 8-digit DNI; password is always the user's DNI
export async function signIn(identifier, password) {
  let email = identifier;

  if (/^\d{8}$/.test(identifier)) {
    const match = await lookupDniCompany(identifier);
    if (!match) throw new Error('No se encontró un usuario con ese DNI.');
    email = `dni_${identifier}@${match.ruc}.pausas.internal`;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

// Register a new company + admin user. Password is always the admin's DNI.
export async function registerCompany({ companyName, ruc, contactEmail, adminName, adminDni }) {
  const { data, error } = await supabase.auth.signUp({
    email: contactEmail,
    password: adminDni,
  });
  if (error) throw error;

  const userId = data.user?.id;
  if (!userId) throw new Error('No se pudo crear el usuario');

  // Insert company (pending status)
  const { data: company, error: companyErr } = await supabase
    .from('companies')
    .insert({ name: companyName, ruc, contact_email: contactEmail, status: 'pending' })
    .select()
    .maybeSingle();
  if (companyErr) throw companyErr;

  // Insert profile
  const { error: profileErr } = await supabase.from('profiles').insert({
    id: userId,
    company_id: company.id,
    role: 'admin',
    full_name: adminName,
    dni: adminDni,
  });
  if (profileErr) throw profileErr;

  // Sign out after registration — they must wait for approval
  await supabase.auth.signOut();
  return { company };
}
