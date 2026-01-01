"use client";

import { useState, useEffect } from "react";
import {
  Dumbbell,
  Heart,
  Scale,
  Utensils,
  User,
  Users,
  CheckCircle2,
} from "lucide-react";



export default function TargetAudienceSection() {
  const [mounted, setMounted] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const audiences = [
    {
      icon: Dumbbell,
      title: "PECINTA FITNESS",
      subtitle: "Gym & Olahraga",
      description:
        "Kamu yang rutin nge-gym dan butuh tracking protein, karbohidrat, lemak untuk bulking atau cutting? Si Kalori bantu kamu hitung makro dengan akurat!",
      color: "bg-red-500",
      painPoint: "Bingung hitung makro manual?",
      solution: "Scan makanan → Tau semua nutrisi",
      stats: "85% pengguna gym aktif",
    },
    {
      icon: Scale,
      title: "PROGRAM DIET",
      subtitle: "Turun atau Naik BB",
      description:
        "Mau turunkan berat badan atau malah naikin? Apapun goalmu, tracking kalori harian adalah kunci. Si Kalori bikin prosesnya jadi gampang dan konsisten.",
      color: "bg-yellow-500",
      painPoint: "Diet sering gagal di tengah jalan?",
      solution: "Kontrol kalori jadi mudah & fun",
      stats: "Rata-rata turun 8kg dalam 3 bulan",
    },
    {
      icon: Heart,
      title: "HIDUP SEHAT",
      subtitle: "Diabetes, Kolesterol, Jantung",
      description:
        "Punya kondisi kesehatan khusus dan perlu kontrol asupan nutrisi ketat? Si Kalori membantu kamu monitor gula, sodium, dan nutrisi penting lainnya.",
      color: "bg-blue-500",
      painPoint: "Takut salah makan?",
      solution: "Cek nutrisi sebelum makan",
      stats: "Cocok untuk diet rendah gula & garam",
    },
    {
      icon: Utensils,
      title: "SIBUK KERJA",
      subtitle: "Professionals & Mahasiswa",
      description:
        "Ga ada waktu ribet hitung kalori manual? Cukup foto makanan kamu, Si Kalori langsung kasih info lengkap. Hemat waktu, tetap sehat!",
      color: "bg-green-500",
      painPoint: "Ga sempat tracking makan?",
      solution: "Scan cepat, 3 detik kelar",
      stats: "Hemat 15 menit per hari",
    },
  ];

  return (
    <div className="relative min-h-screen bg-white overflow-hidden py-12 sm:py-16 lg:py-24">
      {/* Brutal Grid Background */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Geometric Accents */}
      <div className="absolute top-20 left-0 w-2 h-32 sm:w-3 sm:h-48 lg:w-[6px] lg:h-64 bg-black" />
      <div className="absolute top-1/3 right-10 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-black opacity-[0.03]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 mb-6 sm:mb-8 bg-black text-white border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
            }`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
            <span className="text-xs sm:text-sm font-black tracking-[0.2em]">
              UNTUK SIAPA?
            </span>
          </div>

          <h2
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] mb-4 sm:mb-6 transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <span className="block text-black mb-2 sm:mb-3">SI KALORI</span>
            <span className="inline-block bg-black text-white px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 border-2 sm:border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]">
              UNTUK KAMU!
            </span>
          </h2>

          <p
            className={`text-base sm:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto font-bold leading-relaxed transition-all duration-700 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            Apapun goalmu, Si Kalori siap jadi partner terbaik untuk tracking
            nutrisi dan mencapai target kesehatanmu
          </p>
        </div>

        {/* Audience Cards Grid */}
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 mb-12 sm:mb-16">
          {audiences.map((audience, idx) => {
            const Icon = audience.icon;
            const isActive = activeCard === idx;

            return (
              <div
                key={idx}
                className={`relative transition-all duration-500 ${
                  mounted ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  transitionDelay: `${200 + idx * 100}ms`,
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                }}
              >
                <div
                  className={`bg-white border-2 sm:border-4 border-black p-6 sm:p-8 lg:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] sm:hover:translate-x-[4px] sm:hover:translate-y-[4px] transition-all cursor-pointer group h-full flex flex-col`}
                >
                  {/* Icon & Badge */}
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 ${audience.color} border-2 sm:border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex-shrink-0`}
                    >
                      <Icon
                        className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                    {isActive && (
                      <div className="px-3 py-1 bg-black text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] flex-shrink-0">
                        <span className="text-xs font-black tracking-wider">
                          COCOK!
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="mb-3 sm:mb-4">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight text-black mb-1">
                      {audience.title}
                    </h3>
                    <p className="text-sm sm:text-base font-black text-gray-600">
                      {audience.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-gray-700 font-bold leading-relaxed mb-4 sm:mb-6 flex-grow">
                    {audience.description}
                  </p>

                  {/* Pain Point & Solution */}
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4">
                      <p className="text-xs sm:text-sm font-black text-red-700">
                        ❌ {audience.painPoint}
                      </p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4">
                      <p className="text-xs sm:text-sm font-black text-green-700">
                        ✅ {audience.solution}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="border-t-2 sm:border-t-4 border-black pt-3 sm:pt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className="w-4 h-4 sm:w-5 sm:h-5 text-black"
                        strokeWidth={3}
                      />
                      <span className="text-xs sm:text-sm font-black text-black">
                        {audience.stats}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Universal Message */}
        <div
          className={`bg-black text-white border-2 sm:border-4 border-black p-6 sm:p-8 lg:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] mb-12 sm:mb-16 transition-all duration-700 delay-600 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white flex items-center justify-center border-2 sm:border-4 border-white flex-shrink-0">
              <User
                className="w-6 h-6 sm:w-8 sm:h-8 text-black"
                strokeWidth={3}
              />
            </div>
            <div className="flex-grow">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black mb-2 sm:mb-3">
                TIDAK MASUK KATEGORI DI ATAS?
              </h3>
              <p className="text-sm sm:text-base font-bold leading-relaxed">
                Ga masalah! Si Kalori cocok untuk{" "}
                <span className="bg-white text-black px-2 py-1 font-black">
                  SIAPA SAJA
                </span>{" "}
                yang ingin lebih aware dengan asupan makanan sehari-hari. Dari
                remaja sampai lansia, dari pemula sampai expert - semua bisa
                pakai Si Kalori dengan mudah!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* [DIHAPUS] Bottom Decorative Elements */}
      {/* <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-black opacity-[0.03]" /> */}
    </div>
  );
}
