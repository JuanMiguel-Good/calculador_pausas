import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wfmuvdioqscurgvdzddu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmbXV2ZGlvcXNjdXJndmR6ZGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNTEzMTksImV4cCI6MjA5NzkyNzMxOX0.-F7hg34iIbYLVT4NTDNjFaNeYhN5YzjkxdiEqw1Tp5s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
