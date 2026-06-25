import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
// Service role key is needed for admin operations (createUser).
// Set VITE_SUPABASE_SERVICE_ROLE_KEY in your Netlify/Vercel env vars.
// Get it from: Supabase Dashboard → Project Settings → API → service_role key
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL');

// Regular client for normal authenticated operations
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin client with service role - bypasses RLS for admin operations like createUser
export const supabaseAdmin = (isSupabaseConfigured && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : supabase; // fallback to regular client if service key not set

if (!isSupabaseConfigured) {
  console.log("Supabase is not configured. Falling back to high-fidelity LocalStorage JSON Database.");
}
