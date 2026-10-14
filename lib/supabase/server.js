import { createClient } from "@supabase/supabase-js";
import { createServerClient as createSSRServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

/**
 * Koneksi Supabase di server untuk sesi admin menggunakan SUPABASE_PUBLISHABLE_KEY dan cookie.
 * Digunakan untuk login, keluar, ganti password, dan aksi kelola produk.
 */
export async function createAdminClient() {
  const cookieStore = await cookies();
  const supabaseUrl = getCleanSupabaseUrl();
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY harus diatur di environment variable."
    );
  }

  return createSSRServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Mengabaikan error bila dipanggil dari Server Component
        }
      },
    },
  });
}

export const createVisitorClient = createServerClient;
export const createPublicClient = createServerClient;
export const createAdminSessionClient = createAdminClient;
export default createServerClient;
