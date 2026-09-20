import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let publicClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

function getUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL.");
  }

  return url;
}

export function getPublicSupabase() {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key) {
    throw new Error("Falta la clave pública de Supabase.");
  }

  if (!publicClient) {
    publicClient = createClient(getUrl(), key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return publicClient;
}

export function getAdminSupabase() {
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("Falta la clave privada de Supabase.");
  }

  if (!adminClient) {
    adminClient = createClient(getUrl(), key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return adminClient;
}
