"use client";

import React, { useState, useEffect } from "react";
import { Target } from "lucide-react";

export default function MissionSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 mb-20 sm:mb-32">
      <div
        className={`bg-yellow-400 border-4 border-black p-6 sm:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-700 ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Icon Box */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Target
                className="w-10 h-10 sm:w-12 sm:h-12 text-black"
                strokeWidth={2.5}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h2 className="text-3xl sm:text-4xl font-black text-black mb-4 uppercase">
              MISI KITA SIMPEL:
            </h2>
            <p className="text-lg sm:text-xl font-bold text-black leading-relaxed">
              "Kami ingin menghancurkan mitos diet yang menyesatkan. Kamu berhak
              tahu apa yang sebenarnya masuk ke tubuhmu. Bukan tebak-tebakan,
              bukan 'katanya', tapi fakta nutrisi yang jelas.{" "}
              <span className="bg-black text-white px-1">
                Your Body, Your Data.
              </span>
              "
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
