"use client";

import { useState, useEffect } from "react";
import { Camera, Scan, Brain, CheckCircle, Eye, Sparkles } from "lucide-react";

export default function CaraKerja() {
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Data untuk 4 langkah
  const steps = [
    {
      number: "01",
      icon: Camera,
      title: "AMBIL FOTO",
      description:
        "Foto makananmu dengan kamera. Sudut dan pencahayaan apapun bisa!",
      color: "bg-red-500",
      textColor: "text-red-500",
      borderColor: "border-red-500",
    },
    {
      number: "02",
      icon: Scan,
      title: "SCAN OTOMATIS",
      description:
        "AI kami memindai dan mengenali semua item makanan dalam foto secara real-time.",
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
      borderColor: "border-yellow-500",
    },
    {
      number: "03",
      icon: Brain,
      title: "ANALISIS AI",
      description:
        "Sistem menghitung kalori, protein, karbohidrat, dan nutrisi lainnya.",
      color: "bg-blue-500",
      textColor: "text-blue-500",
      borderColor: "border-blue-500",
    },
    {
      number: "04",
      icon: CheckCircle,
      title: "HASIL INSTAN",
      description:
        "Dapatkan laporan lengkap nutrisi dan saran personalisasi dalam detik.",
      color: "bg-green-500",
      textColor: "text-green-500",
      borderColor: "border-green-500",
    },
  ];

  // Efek untuk memicu animasi 'pop-in' saat komponen dimuat
  useEffect(() => {
    setMounted(true);
  }, []);

  // Efek untuk siklus animasi langkah (step)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    // [UPDATED] 'border-t-8 border-black' TELAH DIHAPUS dari div ini
    <div className="relative bg-white p-4 sm:p-6 lg:p-8 py-16 sm:py-24 lg:py-32 overflow-hidden">
      {/* Latar Belakang Grid Brutal */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Konten Utama (Layout Grid 2 Kolom) */}
      <div className="relative z-10 grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-center max-w-7xl mx-auto">
        {/* Kolom Kiri: Judul dan Deskripsi */}
        <div className="space-y-6 sm:space-y-8">
          <div
            className={`inline-block transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-5 sm:py-3 bg-black text-white border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-black tracking-[0.2em] sm:tracking-[0.3em]">
                BAGAIMANA CARA KERJA
              </span>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <h2
            className={`text-4xl sm:text-6xl lg:text-7xl font-black text-black leading-[0.9] transition-all duration-700 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            BEGINI CARA
            <br />
            <span className="inline-block bg-black text-white px-4 py-2 mt-2 sm:mt-3 border-2 sm:border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]">
              SI KALORI
            </span>
            <br />
            BEKERJA.
          </h2>

          <p
            className={`text-base sm:text-xl text-gray-700 font-bold max-w-lg leading-relaxed transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Teknologi AI canggih yang mengubah foto makananmu menjadi data
            nutrisi lengkap. Proses otomatis, hasil akurat, semua dalam
            genggaman.
          </p>
        </div>

        {/* Kolom Kanan: 4 Langkah Proses */}
        <div className="space-y-4 sm:space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;

            return (
              <div
                key={index}
                className={`relative bg-white border-2 sm:border-4 border-black p-4 sm:p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 ${
                  mounted
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-12"
                } ${
                  isActive
                    ? `ring-4 ${step.borderColor} scale-105`
                    : "scale-100"
                }`}
                style={{ transitionDelay: `${index * 100 + 300}ms` }}
              >
                {/* Latar belakang bar warna */}
                <div
                  className={`absolute inset-0 ${
                    step.color
                  } transition-all duration-300 ${
                    isActive ? "opacity-10" : "opacity-0"
                  }`}
                />

                <div className="relative flex items-center gap-4 sm:gap-5">
                  {/* Nomor Langkah */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center border-2 sm:border-4 border-black transition-all duration-300 ${
                      isActive
                        ? `${step.color} scale-110 rotate-12`
                        : "bg-black"
                    }`}
                  >
                    <span className="text-lg sm:text-xl font-black text-white">
                      {step.number}
                    </span>
                  </div>

                  {/* Teks Konten */}
                  <div className="flex-1">
                    <h3
                      className={`text-xl sm:text-2xl font-black text-black transition-colors duration-300 ${
                        isActive ? step.textColor : ""
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 font-bold leading-snug">
                      {step.description}
                    </p>
                  </div>

                  {/* Ikon di Kanan */}
                  <Icon
                    className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 transition-all duration-300 ${
                      isActive
                        ? `${step.textColor} opacity-100`
                        : "text-black opacity-20"
                    }`}
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
