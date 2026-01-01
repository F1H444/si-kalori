"use client";

import React, { useState, useEffect } from "react";
import { Heart, Shield, Users } from "lucide-react";

export default function ValuesSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const values = [
    {
      icon: Heart,
      title: "SEHAT ITU WARAS",
      description:
        "Diet bukan berarti menderita. Kesehatan mentalmu sama pentingnya dengan fisikmu.",
      bg: "bg-white",
    },
    {
      icon: Shield,
      title: "DATA > MITOS",
      description:
        "Kami bicara berdasarkan sains dan angka, bukan tren diet viral yang menyesatkan.",
      bg: "bg-white",
    },
    {
      icon: Users,
      title: "NO JUDGMENT",
      description:
        "Mau bulking atau cutting, semua proses dihargai di sini. Kita berjuang bareng.",
      bg: "bg-white",
    },
  ];

  return (
    <div className="relative bg-black text-white py-20 px-4 mb-20 sm:mb-32 overflow-hidden">
      {/* White Grid on Black Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-black text-center mb-16 uppercase text-white">
          PRINSIP KAMI
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className={`bg-white text-black border-4 border-white p-8 shadow-[8px_8px_0px_0px_#22c55e] transition-all duration-500 hover:-translate-y-2 ${
                  mounted
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-6 border-4 border-black">
                  <Icon className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black mb-4 uppercase">
                  {value.title}
                </h3>
                <p className="text-base font-bold text-gray-800 leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
