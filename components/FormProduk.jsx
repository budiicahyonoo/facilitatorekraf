"use client";

import { useState, useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiAI } from "@/app/admin/actions";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09). Keduanya bonus di jalur offline.
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({
  produk = {},
  labelTombol,
  action,
  pesanError: propPesanError,
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const pesanError = propPesanError || state?.error;

  const [nama, setNama] = useState(produk.nama || "");
  const [kategori, setKategori] = useState(produk.kategori || "");
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");
  const [loadingAI, setLoadingAI] = useState(false);
  const [pesanAI, setPesanAI] = useState(null);

  async function handleBuatDeskripsiAI() {
    if (!nama.trim()) {
      setPesanAI({ error: true, text: "Silakan isi 'Nama produk' terlebih dahulu." });
      return;
    }

    setPesanAI(null);
    setLoadingAI(true);

    try {
      const res = await buatDeskripsiAI({
        nama: nama.trim(),
        kategori: kategori.trim(),
      });

      if (res?.error) {
        setPesanAI({ error: true, text: res.error });
      } else if (res?.deskripsi) {
        setDeskripsi(res.deskripsi);
        setPesanAI({ error: false, text: "Deskripsi berhasil dibuat dengan AI!" });
      }
    } catch (err) {
      setPesanAI({ error: true, text: err.message || "Gagal membuat deskripsi dengan AI." });
    } finally {
      setLoadingAI(false);
    }
  }

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {pesanError && (
        <div className="rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya">
          {pesanError}
        </div>
      )}
      {produk.id && <input type="hidden" name="id" defaultValue={produk.id} />}
      <Input
        label="Nama produk"
        name="nama"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        required
      />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />
      <Input
        label="Kategori"
        name="kategori"
        value={kategori}
        onChange={(e) => setKategori(e.target.value)}
      />
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="deskripsi" className="text-sm font-semibold">
            Deskripsi
          </label>
          <button
            type="button"
            onClick={handleBuatDeskripsiAI}
            disabled={loadingAI}
            className="inline-flex items-center gap-1 text-xs font-semibold text-utama hover:text-utama-gelap disabled:text-teks-lembut"
          >
            {loadingAI ? "⏳ Menghasilkan deskripsi..." : "✨ Buat deskripsi dengan AI"}
          </button>
        </div>

        {pesanAI && (
          <p
            className={`text-xs ${
              pesanAI.error ? "text-bahaya" : "font-medium text-utama"
            }`}
          >
            {pesanAI.text}
          </p>
        )}

        <textarea
          id="deskripsi"
          name="deskripsi"
          rows={4}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          placeholder="Jelaskan keunggulan dan detail produk..."
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
