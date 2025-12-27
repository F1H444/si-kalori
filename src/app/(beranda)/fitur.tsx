"use client";

import { useState, useEffect } from "react";
import { Database, PieChart, Target, ScanBarcode } from "lucide-react";
import React from "react";

// Tipe untuk item fitur
interface FeatureItem {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

// Data fitur yang dipetakan
const featureItems: FeatureItem[] = [
  {
    icon: Database,
    title: "Database Lengkap",
    description:
      "Akses 1 Juta+ item, termasuk masakan lokal Indonesia dan produk kemasan.",
    color: "bg-blue-500", // Warna baru untuk variasi
  },
  {
    icon: PieChart,
    title: "Rincian Gizi Detail",
    description: "Lacak Protein, Karbo, Lemak, dan vitamin. Bukan cuma kalori.",
    color: "bg-green-500",
  },
  {
    icon: Target,
    title: "Target Harian Kustom",
    description:
      "Atur target (defisit, surplus, atau maintenance) dan pantau kemajuan Anda.",
    color: "bg-yellow-500",
  },
  {
    icon: ScanBarcode,
    title: "Scan Barcode Cepat",
    description:
      "Scan barcode pada kemasan makanan untuk data nutrisi instan dan akurat.",
    color: "bg-red-500",
  },
];

export default function Features() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    // [UPDATED] 'border-t-2 border-black' telah dihapus dari div ini
    <div className="relative bg-white z-0 px-4 sm:px-6 py-16 sm:py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Judul Bagian - Lebih Ditekankan */}
        <div className="text-left mb-12 sm:mb-16 lg:mb-20 max-w-2xl">
          <h2
            className={`text-4xl sm:text-5xl lg:text-6xl font-black text-black leading-tight transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            FITUR INTI KAMI.
          </h2>
          <p
            className={`text-lg sm:text-xl text-gray-700 mt-4 transition-all duration-700 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Lihat lebih detail <span className="font-bold text-black">apa</span>{" "}
            yang bisa SIKALORI lakukan untuk Anda. Setiap fitur dirancang untuk
            akurasi dan kemudahan.
          </p>
        </div>

        {/* Grid Fitur (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
          {featureItems.map((item, idx) => {
            const Icon = item.icon;
            // Delay animasi berurutan (staggered)
            const delay = 100 * (idx + 3); // Mulai setelah judul (300ms)

            return (
              <div
                key={item.title}
                className={`border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 ${
                  mounted
                    ? "opacity-100 scale-100" // Animasi 'Pop-in'
                    : "opacity-0 scale-95"
                }`}
                style={{ transitionDelay: `${delay}ms` }}
              >
                {/* Header Kartu - Desain Baru */}
                <div
                  className={`flex items-center gap-4 sm:gap-5 p-5 sm:p-6 ${item.color} border-b-4 border-black`}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white flex items-center justify-center border-2 border-black flex-shrink-0">
                    <Icon
                      className="w-6 h-6 sm:w-7 sm:h-7 text-black" // Ikon hitam di dalam kotak putih
                      strokeWidth={2.5}
                    />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {item.title}
                  </h3>
                </div>

                {/* Badan Kartu */}
                <div className="bg-white p-5 sm:p-6">
                  <p className="text-base sm:text-lg text-gray-800 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
