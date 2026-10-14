"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

export async function tambahProduk(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const nama = data?.get("nama");
  const hargaRaw = data?.get("harga");
  const kategori = data?.get("kategori");
  const foto_url = data?.get("foto_url");
  const deskripsi = data?.get("deskripsi");

  if (!nama || !hargaRaw) {
    return { error: "Nama dan harga produk wajib diisi." };
  }

  const harga = parseInt(hargaRaw, 10);
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga produk harus berupa angka dan tidak boleh negatif." };
  }

  const supabase = await createAdminClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Anda harus login sebagai admin untuk menambah produk." };
  }

  const { error } = await supabase.from("produk").insert({
    nama: String(nama).trim(),
    harga,
    kategori: kategori ? String(kategori).trim() : null,
    foto_url: foto_url ? String(foto_url).trim() : null,
    deskripsi: deskripsi ? String(deskripsi).trim() : null,
  });

  if (error) {
    return { error: error.message || "Gagal menyimpan produk ke database." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function ubahProduk(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const id = data?.get("id");
  const nama = data?.get("nama");
  const hargaRaw = data?.get("harga");
  const kategori = data?.get("kategori");
  const foto_url = data?.get("foto_url");
  const deskripsi = data?.get("deskripsi");

  if (!id) {
    return { error: "ID produk tidak valid." };
  }

  if (!nama || !hargaRaw) {
    return { error: "Nama dan harga produk wajib diisi." };
  }

  const harga = parseInt(hargaRaw, 10);
  if (isNaN(harga) || harga < 0) {
    return { error: "Harga produk harus berupa angka dan tidak boleh negatif." };
  }

  const supabase = await createAdminClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Anda harus login sebagai admin untuk mengubah produk." };
  }

  const { error } = await supabase
    .from("produk")
    .update({
      nama: String(nama).trim(),
      harga,
      kategori: kategori ? String(kategori).trim() : null,
      foto_url: foto_url ? String(foto_url).trim() : null,
      deskripsi: deskripsi ? String(deskripsi).trim() : null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message || "Gagal mengubah produk di database." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);
  redirect("/admin");
}

export async function hapusProduk(formData) {
  const id = formData?.get("id");

  if (!id) {
    return { error: "ID produk tidak valid." };
  }

  const supabase = await createAdminClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Anda harus login sebagai admin untuk menghapus produk." };
  }

  const { error } = await supabase.from("produk").delete().eq("id", id);

  if (error) {
    return { error: error.message || "Gagal menghapus produk dari database." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function buatDeskripsiAI({ nama, kategori }) {
  const supabase = await createAdminClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Anda harus login sebagai admin untuk menggunakan fitur AI." };
  }

  if (!nama || !nama.trim()) {
    return { error: "Nama produk wajib diisi untuk membuat deskripsi AI." };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      error:
        "GEMINI_API_KEY belum diatur di file .env.local. Dapatkan API key gratis dari Google AI Studio (https://aistudio.google.com/) dan tambahkan ke .env.local.",
    };
  }

  const prompt = `Tugas: Buat satu deskripsi produk UMKM yang singkat dan menarik.
Nama Produk: ${nama}
Kategori: ${kategori || "Umum"}

Aturan yang WAJIB diikuti:
- Panjang maksimal 2-3 kalimat (sekitar 30-50 kata).
- Bahasa Indonesia yang ramah dan menggugah minat pembeli.
- HANYA tulis teks deskripsinya saja — tanpa nomor, tanpa judul, tanpa tanda kutip, tanpa pilihan, tanpa kata pengantar seperti "Berikut" atau "Tentu", dan tanpa kalimat penutup.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error:
          data?.error?.message ||
          "Gagal memanggil Gemini API. Periksa apakah GEMINI_API_KEY Anda valid.",
      };
    }

    const teks = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!teks) {
      return { error: "Tidak ada respons deskripsi dari AI." };
    }

    return { success: true, deskripsi: teks.trim() };
  } catch (err) {
    return { error: err.message || "Terjadi kesalahan saat menghubungi Gemini API." };
  }
}

export const gantiPasswordAdmin = gantiPassword;
