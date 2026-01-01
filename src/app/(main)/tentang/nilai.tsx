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
      title: "BALANCE, BUKAN SIKSA",
      description:
        "Kami percaya makan enak dan hidup sehat bisa jalan bareng. Fokus ke progres, bukan penderitaan.",
      color: "bg-pink-500",
    },
    {
      icon: Shield,
      title: "ANGKA TIDAK BOHONG",
      description:
        "Lupakan mitos diet 'ajaib'. Semua berbasis data nutrisi yang akurat supaya targetmu gak cuma mimpi.",
      color: "bg-blue-500",
    },
    {
      icon: Users,
      title: "GAS BARENG-BARENG",
      description:
        "Apapun targetmu—turun berat badan atau bentuk otot—kita sediakan alatnya, kamu yang eksekusi.",
      color: "bg-green-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 mb-20 sm:mb-32">
      <h2 className="text-4xl sm:text-5xl font-black text-center mb-16 uppercase italic tracking-tighter">
        PRINSIP KITA
      </h2>

      <div className="grid md:grid-cols-3 gap-8 sm:gap-10">
        {values.map((value, index) => {
          const Icon = value.icon;
          return (
            <div
              key={index}
              className={`group relative bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-300 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div
                className={`flex items-center gap-4 p-4 border-b-4 border-black ${value.color}`}
              >
                <div className="w-12 h-12 bg-black flex items-center justify-center border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  <Icon className="w-6 h-6 text-white" strokeWidth={3} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  {value.title}
                </h3>
              </div>

              <div className="p-6 bg-white">
                <p className="text-lg font-bold text-black leading-relaxed">
                  {value.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}