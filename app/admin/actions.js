"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";

export async function loginAdmin(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const email = data?.get("email");
  const password = data?.get("password");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createAdminClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(email).trim(),
    password: String(password),
  });

  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return { error: "Email atau password salah. Silakan coba lagi." };
    }
    return { error: error.message || "Gagal masuk. Silakan coba lagi." };
  }

  redirect("/admin");
}

export async function keluarAdmin() {
  const supabase = await createAdminClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const passwordBaru = data?.get("password_baru");
  const konfirmasiPassword = data?.get("konfirmasi_password");

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password wajib diisi." };
  }

  if (String(passwordBaru).length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password harus sama dengan password baru." };
  }

  const supabase = await createAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Anda harus login terlebih dahulu untuk mengganti password." };
  }

  const { error } = await supabase.auth.updateUser({
    password: String(passwordBaru),
  });

  if (error) {
    return { error: error.message || "Gagal mengganti password." };
  }

  return { success: true, pesan: "Password berhasil diganti." };
}

export const gantiPasswordAdmin = gantiPassword;
