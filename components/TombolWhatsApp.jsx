"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);
  const [varian, setVarian] = useState("");

  const totalHarga = produk.harga * jumlah;

  // Format pesan otomatis ke WhatsApp
  let pesan = `Halo, saya ingin memesan ${produk.nama} (${jumlah} pcs) seharga ${formatRupiah(totalHarga)}.`;
  if (varian.trim()) {
    pesan += ` Varian/Catatan: ${varian.trim()}.`;
  }

  const urlWhatsApp = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;

  return (
    <div className="flex flex-col gap-4 border-t border-garis pt-4">
      {/* Pemilihan Jumlah */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Jumlah</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setJumlah((prev) => Math.max(1, prev - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-garis bg-permukaan font-bold text-teks hover:border-utama"
            aria-label="Kurangi jumlah"
          >
            -
          </button>
          <span className="w-8 text-center font-bold text-sm">{jumlah}</span>
          <button
            type="button"
            onClick={() => setJumlah((prev) => prev + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-garis bg-permukaan font-bold text-teks hover:border-utama"
            aria-label="Tambah jumlah"
          >
            +
          </button>
        </div>
      </div>

      {/* Pemilihan Varian atau Catatan Tambahan */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="varian-produk" className="text-sm font-semibold">
          Varian / Catatan <span className="text-xs font-normal text-teks-lembut">(opsional)</span>
        </label>
        <input
          id="varian-produk"
          type="text"
          value={varian}
          onChange={(e) => setVarian(e.target.value)}
          placeholder="Contoh: Ukuran, rasa, warna, atau catatan khusus"
          className="rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
      </div>

      {/* Ringkasan Subtotal bila jumlah lebih dari 1 */}
      {jumlah > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-teks-lembut">Total ({jumlah} barang):</span>
          <span className="font-bold text-utama">{formatRupiah(totalHarga)}</span>
        </div>
      )}

      {/* Tombol Pesan via WhatsApp */}
      <a
        href={urlWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
      >
        Pesan via WhatsApp
      </a>
    </div>
  );
}
