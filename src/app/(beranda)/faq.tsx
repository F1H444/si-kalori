"use client";

import { useState, useEffect } from "react";
import { HelpCircle, Plus, Minus } from "lucide-react";

// 1. Data untuk FAQ
const faqData = [
  {
    question: "Apakah aplikasi SI KALORI benar-benar gratis?",
    answer:
      "Ya! Fitur inti kami, termasuk food scanner, tracking kalori, dan database makanan, 100% gratis. Kami mungkin akan menawarkan fitur premium opsional di masa depan.",
  },
  {
    question: "Seberapa akurat deteksi AI dari foto?",
    answer:
      "Akurasi kami saat ini mencapai 98% untuk makanan umum. Akurasi ini terus meningkat setiap hari seiring AI kami mempelajari lebih banyak data gambar yang dimasukkan oleh pengguna.",
  },
  {
    question: "Apakah database-nya mendukung makanan lokal Indonesia?",
    answer:
      "Tentu saja. Ini adalah fokus utama kami. Database kami berisi lebih dari 1 Juta item, termasuk ribuan masakan lokal seperti Nasi Padang, Gado-Gado, Soto, dan berbagai jajanan pasar.",
  },
  {
    question: "Saya bisa pakai ini untuk diet 'Bulking' (surplus kalori)?",
    answer:
      "Pasti. SI KALORI tidak hanya untuk defisit kalori (menurunkan berat badan). Anda bisa mengatur target kalori harian Anda, baik itu untuk maintenance, surplus (bulking), atau defisit (cutting).",
  },
];

export default function FaqSection() {
  const [mounted, setMounted] = useState(false);
  // State untuk melacak item mana yang terbuka
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fungsi untuk toggle FAQ
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative bg-white z-0 px-4 sm:px-6 py-16 sm:py-24 lg:py-32 overflow-hidden">
      {/* Latar Belakang Grid */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Aksen Geometris */}
      <div className="absolute top-1/4 left-0 w-2 h-24 sm:w-3 sm:h-40 bg-black" />
      <div className="absolute bottom-1/4 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-black opacity-[0.03]" />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Judul Bagian */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 mb-6 sm:mb-8 bg-black text-white border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
            }`}
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
            <span className="text-xs sm:text-sm font-black tracking-[0.2em]">
              MASIH RAGU?
            </span>
          </div>

          <h2
            className={`text-4xl sm:text-5xl lg:text-6xl font-black text-black leading-tight transition-all duration-700 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            PERTANYAAN UMUM
          </h2>
        </div>

        {/* Daftar Akordeon FAQ */}
        <div className="space-y-6 sm:space-y-8">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`border-2 sm:border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-700 ${
                  mounted
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${100 * (index + 2)}ms` }}
              >
                {/* Tombol Pertanyaan */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between text-left p-4 sm:p-6 bg-white"
                >
                  <span className="text-base sm:text-lg lg:text-xl font-black text-black">
                    {item.question}
                  </span>
                  {/* Ikon Brutalist Kotak */}
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center border-2 sm:border-4 border-black transition-all duration-300 ${
                      isOpen ? "bg-red-500" : "bg-black group-hover:bg-gray-700"
                    }`}
                  >
                    {isOpen ? (
                      <Minus
                        className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                        strokeWidth={4}
                      />
                    ) : (
                      <Plus
                        className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                        strokeWidth={4}
                      />
                    )}
                  </div>
                </button>

                {/* Konten Jawaban (Animasi dengan grid-rows) */}
                <div
                  className={`grid overflow-hidden transition-all duration-500 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="bg-gray-50 p-4 sm:p-6 border-t-2 sm:border-t-4 border-black">
                      <p className="text-sm sm:text-base text-gray-700 font-bold leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
