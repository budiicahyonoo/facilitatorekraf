"use client";

import { useState, useMemo } from "react";
import KartuProduk from "@/components/KartuProduk";

export default function KatalogFilter({
  daftarProduk = [],
  initialKategori = "",
  initialCari = "",
}) {
  const [kataKunci, setKataKunci] = useState(initialCari);
  const [kategoriDipilih, setKategoriDipilih] = useState(initialKategori);

  // Ambil daftar kategori unik dari data produk
  const semuaKategori = useMemo(() => {
    const kategoriSet = new Set();
    daftarProduk.forEach((p) => {
      if (p.kategori && p.kategori.trim()) {
        kategoriSet.add(p.kategori.trim());
      }
    });
    return Array.from(kategoriSet);
  }, [daftarProduk]);

  // Saring produk berdasarkan kategori dan pencarian nama
  const produkTampil = useMemo(() => {
    return daftarProduk.filter((produk) => {
      const cocokKategori =
        !kategoriDipilih ||
        (produk.kategori && produk.kategori.toLowerCase() === kategoriDipilih.toLowerCase());

      const cocokCari =
        !kataKunci.trim() ||
        produk.nama.toLowerCase().includes(kataKunci.toLowerCase().trim());

      return cocokKategori && cocokCari;
    });
  }, [daftarProduk, kategoriDipilih, kataKunci]);

  return (
    <div className="flex flex-col gap-5">
      {/* Kolom pencarian & filter kategori */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            placeholder="Cari nama produk..."
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          {kataKunci && (
            <button
              type="button"
              onClick={() => setKataKunci("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-teks-lembut hover:text-teks"
              aria-label="Hapus pencarian"
            >
              ✕
            </button>
          )}
        </div>

        {semuaKategori.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setKategoriDipilih("")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                !kategoriDipilih
                  ? "bg-utama text-white"
                  : "border border-garis bg-permukaan text-teks-lembut hover:text-teks"
              }`}
            >
              Semua
            </button>
            {semuaKategori.map((kat) => (
              <button
                key={kat}
                type="button"
                onClick={() =>
                  setKategoriDipilih(kategoriDipilih === kat ? "" : kat)
                }
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  kategoriDipilih === kat
                    ? "bg-utama text-white"
                    : "border border-garis bg-permukaan text-teks-lembut hover:text-teks"
                }`}
              >
                {kat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid Produk atau Status Kosong */}
      {produkTampil.length === 0 ? (
        <div className="rounded-xl border border-dashed border-garis bg-permukaan p-8 text-center text-teks-lembut">
          <p>Tidak ada produk yang sesuai dengan pencarian.</p>
          {(kataKunci || kategoriDipilih) && (
            <button
              type="button"
              onClick={() => {
                setKataKunci("");
                setKategoriDipilih("");
              }}
              className="mt-2 text-xs font-semibold text-utama underline underline-offset-4"
            >
              Reset pencarian & filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {produkTampil.map((produk) => (
            <KartuProduk key={produk.id} produk={produk} />
          ))}
        </div>
      )}
    </div>
  );
}

