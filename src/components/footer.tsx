"use client";

import { useState, useEffect } from "react";
// 1. Hapus 'Link' dari lucide-react
import { ArrowRight, Github, Twitter, Instagram } from "lucide-react";
import { supabase } from "@/lib/supabase";


export default function Footer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const socials = [
    { icon: Github, href: "#", name: "GitHub" },
    { icon: Twitter, href: "#", name: "Twitter" },
    { icon: Instagram, href: "#", name: "Instagram" },
  ];

  return (
    <footer className="relative bg-black border-t-8 border-black overflow-hidden">
      {/* --- ZONA 1: AKSI (KUNING) --- */}
      <div
        className={`relative bg-yellow-400 text-black p-8 sm:p-12 lg:p-16 transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
      >
        {/* Latar Belakang Grid (Hitam di atas Kuning) */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Teks Judul */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-none text-black">
              SIAP MENGUBAH
              <br />
              HIDUP SEHATMU?
            </h2>

            {/* Tombol Aksi */}
            <div className="flex-shrink-0">
              <button
                onClick={async () => {
                  const { data: { session } } = await supabase.auth.getSession();
                  window.location.href = session ? "/scan" : "/login";
                }}
                className="group relative inline-flex items-center justify-center 
                bg-black text-white 
                font-black text-lg sm:text-xl lg:text-2xl 
                px-8 py-4 sm:px-12 sm:py-6 
                border-4 border-black 
                shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] 
                hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                active:shadow-none 
                hover:translate-x-[4px] hover:translate-y-[4px] 
                active:translate-x-[8px] active:translate-y-[8px] 
                transition-all duration-150 w-full lg:w-auto"
              >
                <span>Mulai Sekarang</span>
                <ArrowRight
                  className="w-5 h-5 sm:w-7 sm:h-7 ml-3 sm:ml-4 group-hover:translate-x-2 transition-transform duration-200"
                  strokeWidth={4}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- ZONA 2: INFO (HITAM) --- */}
      <div
        className={`bg-black text-gray-400 p-8 sm:p-10 transition-all duration-700 delay-100 ease-out ${mounted ? "opacity-100" : "opacity-0"
          }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          {/* Hak Cipta */}
          <p className="text-sm sm:text-base font-black text-center sm:text-left">
            © {new Date().getFullYear()} SI KALORI.
          </p>

          {/* Sosial Media */}
          <div className="flex space-x-5 sm:space-x-6">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                >
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.5} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
