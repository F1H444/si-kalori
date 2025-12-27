"use client";

import React, { useState, useEffect } from "react";
import { Zap } from "lucide-react";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    // UPDATE: pt-32 diubah menjadi pt-44 (mobile) dan md:pt-52 (desktop)
    // agar turun ke bawah dan tidak tertutup navbar
    <div className="relative bg-white overflow-hidden pt-44 pb-20 md:pt-52 px-4">
      {/* Brutal Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div
          className={`inline-flex justify-center mb-8 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          }`}
        >
          <div className="bg-black text-white px-4 py-2 border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm sm:text-base font-black tracking-widest uppercase">
              REVOLUSI DIET KAMU
            </span>
          </div>
        </div>

        {/* Headline - UPDATE STRUKTUR */}
        {/* Menggunakan flex-col agar teks tersusun rapi 3 tingkat ke bawah */}
        <h1
          className={`flex flex-col items-center justify-center gap-2 sm:gap-4 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-black leading-tight mb-8 transition-all duration-700 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Baris 1 */}
          <span className="block">JANGAN ASAL</span>

          {/* Baris 2 (Highlight Hijau) */}
          {/* Ditambahkan padding yang pas dan border transparan agar layout stabil */}
          <span className="relative inline-block bg-green-500 text-white px-4 sm:px-6 transform -rotate-1 border-4 border-green-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            MAKAN.
          </span>

          {/* Baris 3 */}
          <span className="block">
            MULAI{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-black to-gray-600">
              PAHAMI.
            </span>
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className={`text-lg sm:text-xl font-bold text-gray-700 max-w-3xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Berhenti menyiksa diri dengan diet yang salah. Si Kalori memberimu
          data akurat biar kamu bisa makan enak, tetap sehat, dan mencapai
          target tanpa rasa bersalah.
        </p>
      </div>
    </div>
  );
}
