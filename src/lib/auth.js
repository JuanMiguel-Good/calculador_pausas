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

// Sign in supporting email or DNI (8 digits) with optional RUC for workers
export async function signIn(identifier, password, ruc = null) {
  let email = identifier;

  // If identifier is an 8-digit DNI and RUC is provided, construct internal email
  if (/^\d{8}$/.test(identifier) && ruc) {
    email = `dni_${identifier}@${ruc}.pausas.internal`;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

// Register a new company + admin user
export async function registerCompany({ companyName, ruc, contactEmail, adminName, adminDni, password }) {
  // Create auth user
  const adminEmail = contactEmail;
  const { data, error } = await supabase.auth.signUp({
    email: adminEmail,
    password,
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

// Get all active companies (for worker login dropdown)
export async function getActiveCompanies() {
  const { data } = await supabase
    .from('companies')
    .select('id, name, ruc')
    .eq('status', 'active')
    .order('name');
  return data || [];
}
