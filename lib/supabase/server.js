import { createClient } from "@supabase/supabase-js";

function getCleanSupabaseUrl() {
  const url = process.env.SUPABASE_URL;
  if (!url) return "";
  // Bersihkan path /rest/v1 atau trailing slash jika ada
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

/**
 * Koneksi Supabase di server untuk pengunjung menggunakan SUPABASE_SECRET_KEY.
 * Digunakan untuk membaca data publik (katalog dan detail produk) tanpa perlu login.
 */
export function createServerClient() {
  const supabaseUrl = getCleanSupabaseUrl();
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY harus diatur di environment variable."
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const createVisitorClient = createServerClient;
export const createPublicClient = createServerClient;
export default createServerClient;

