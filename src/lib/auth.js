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

// Sign in a worker directly when the RUC is already known (from the company link)
export async function signInWithRuc(dni, ruc) {
  const email = `dni_${dni}@${ruc}.pausas.internal`;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: dni });
  if (error) throw error;
  return data;
}

// Register a new company + admin user via Edge Function (uses service role to bypass RLS).
export async function registerCompany({ companyName, ruc, contactEmail, adminName, adminDni }) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wfmuvdioqscurgvdzddu.supabase.co';
  const res = await fetch(`${supabaseUrl}/functions/v1/company-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyName, ruc, contactEmail, adminName, adminDni }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Error al registrar la empresa');
  return json;
}
