"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Github, Twitter, Instagram, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check auth status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session?.user);
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const socials = [
    { icon: Github, href: "#", name: "GitHub" },
    { icon: Twitter, href: "#", name: "Twitter" },
    { icon: Instagram, href: "#", name: "Instagram" },
  ];

  const quickLinks = [
    { name: "Beranda", href: "/" },
    { name: "Tentang", href: "/tentang" },
    { name: "Kontak", href: "/kontak" },
    { name: "Premium", href: "/premium" },
    ...(isLoggedIn ? [{ name: "Dashboard", href: "/dashboard" }] : []),
  ];

  const helpLinks = [
    { name: "Kebijakan Privasi", href: "/privacy" },
    { name: "Syarat & Ketentuan", href: "/terms" },
  ];

  const marqueeText = " CEK KALORIMU SEKARANG • MAKAN ENAK TETEP SEHAT • HIDUP SEHAT MULAI DARI SINI • SCAN MAKANANMU DALAM SEKEJAP • SI KALORI TEMAN DIETMU • ";

  return (
    <footer className="relative bg-black border-t-8 border-black mt-20 sm:mt-32 overflow-hidden">
      
      {/* --- MARQUEE SECTION --- */}
      <div className="bg-yellow-400 border-b-4 border-black py-4 overflow-hidden select-none">
        <div className="flex whitespace-nowrap animate-marquee">
          <div className="flex gap-4 items-center">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="text-2xl sm:text-4xl font-black text-black">
                {marqueeText}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* --- ZONA 1: AKSI (KUNING POLOS) --- */}
      <div
        className={`relative bg-yellow-400 text-black p-8 sm:p-12 lg:p-16 transition-all duration-700 ease-out border-b-4 border-black ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-none text-black tracking-tighter">
              SIAP JADI VERSI
              <br />
              TERBAIKMU?
            </h2>

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
                <span>Mulai Sekarang, Gratis!</span>
                <ArrowRight
                  className="w-5 h-5 sm:w-7 sm:h-7 ml-3 sm:ml-4 group-hover:translate-x-2 transition-transform duration-200"
                  strokeWidth={4}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- ZONA 2: MAIN CONTENT (HITAM) --- */}
      <div className="bg-black text-white p-12 sm:p-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16">
          
          {/* Logo & Intro */}
          <div className="space-y-6 lg:col-span-1">
            <h3 className="text-4xl font-black tracking-tighter text-yellow-400">SI KALORI.</h3>
            <p className="text-gray-400 font-bold leading-relaxed">
              Kami percaya hidup sehat itu harusnya seru dan tidak kaku. Pantau nutrisimu dengan AI tercanggih, biarkan kami yang berhitung.
            </p>
            <div className="flex space-x-4">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="p-3 bg-white text-black border-2 border-white hover:bg-yellow-400 hover:border-black hover:translate-y-[-4px] transition-all duration-200"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigasi Cepat */}
          <div className="space-y-6">
            <h4 className="text-xl font-black uppercase tracking-widest text-white border-l-4 border-yellow-400 pl-4">Menu</h4>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-yellow-400 font-bold transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Bantuan */}
          <div className="space-y-6">
            <h4 className="text-xl font-black uppercase tracking-widest text-white border-l-4 border-yellow-400 pl-4">Dukungan</h4>
            <ul className="space-y-4">
              {helpLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-yellow-400 font-bold transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak Langsung */}
          <div className="space-y-6">
            <h4 className="text-xl font-black uppercase tracking-widest text-white border-l-4 border-yellow-400 pl-4">Hubungi Kami</h4>
            <p className="text-gray-400 font-bold text-sm">Ada pertanyaan atau butuh bantuan? Tim kami siap mendengarmu.</p>
            <div className="flex flex-col gap-4">
              <a 
                href="mailto:sikalori@gmail.com"
                className="group bg-zinc-900 border-2 border-zinc-700 p-6 flex flex-col gap-2 hover:border-yellow-400 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] hover:shadow-[4px_4px_0px_0px_rgba(250,204,21,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400 flex items-center justify-center border-2 border-black">
                    <Mail className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Email Support</div>
                    <div className="text-sm font-black group-hover:text-yellow-400 transition-colors">sikalori@gmail.com</div>
                  </div>
                </div>
              </a>
              <p className="text-[10px] text-zinc-500 font-bold italic">
                *Kami biasanya merespons dalam waktu 1x24 jam kerja.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION --- */}
      <div className="bg-zinc-950 border-t-2 border-zinc-900 p-6 sm:p-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-4">
          <p className="text-zinc-500 text-sm font-bold">
            © {new Date().getFullYear()} SI KALORI. All rights reserved.
          </p>
        </div>
      </div>

    </footer>
  );
}
