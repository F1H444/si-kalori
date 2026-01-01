"use client";

import React, { useState, useEffect } from "react";
import { Utensils, Search, TrendingUp, Sparkles } from "lucide-react";

export default function FeaturesSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Utensils,
      title: "DATABASE RAKSASA",
      description:
        "Dari Nasi Padang sampai Salad, semua datanya lengkap di sini.",
      color: "bg-red-500",
      rotate: "-rotate-1",
    },
    {
      icon: Search,
      title: "SCAN & SELESAI",
      description: "Malas ngetik? Foto aja makananmu, AI kami yang hitung.",
      color: "bg-blue-500",
      rotate: "rotate-1",
    },
    {
      icon: TrendingUp,
      title: "GAK PAKE BOHONG",
      description:
        "Laporan nutrisi jujur. Gula, garam, lemak—semua transparan.",
      color: "bg-green-500",
      rotate: "-rotate-1",
    },
    {
      icon: Sparkles,
      title: "PERSONAL TRAINER",
      description: "Rekomendasi porsi yang disesuaikan sama tujuan badanmu.",
      color: "bg-purple-500",
      rotate: "rotate-1",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 mb-20 sm:mb-32">
      <h2 className="text-4xl sm:text-5xl font-black text-center mb-12 uppercase">
        KENAPA SI KALORI?
      </h2>

      <div className="grid md:grid-cols-2 gap-8 sm:gap-10">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className={`group relative bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-300 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div
                className={`flex items-center gap-4 p-4 border-b-4 border-black ${feature.color}`}
              >
                <div className="w-12 h-12 bg-black flex items-center justify-center border-2 border-white">
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                  {feature.title}
                </h3>
              </div>
              <div className="p-6 bg-white">
                <p className="text-lg font-bold text-gray-800 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
