"use client";

import { useState, useEffect } from "react";
import { Camera, Zap, TrendingUp, Check, Play } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Ganti nama komponen menjadi HomePage agar sesuai dengan app/page.tsx
export default function BrutalHero() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session?.user);
      setIsLoading(false);
    };
    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const benefits = [
    { icon: Camera, text: "Scan Cerdas", color: "bg-red-500" },
    { icon: Zap, text: "Analisis Instan", color: "bg-yellow-500" },
    { icon: TrendingUp, text: "Progress Harian", color: "bg-green-500" },
  ];

  const stats = [
    { num: "1Jt+", label: "Menu & Produk" },
    { num: "98%", label: "Akurasi AI" },
  ];

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.215, 0.61, 0.355, 1.0] as const,
      },
    },
  };

  const rightColVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
        delay: 0.1,
      },
    },
  };

  const handleCTAClick = () => {
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    // Fragment untuk membungkus Navbar dan Hero
    <>
      {/* Konten Hero Section */}
      <div className="relative bg-white overflow-hidden">
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

        {/* [UPDATED] Padding atas ditambah lagi (pt-40 sm:pt-48)
            agar kontennya lebih ke bawah dari navbar.
        */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-24 sm:pb-32 lg:pb-32">
          {/* Layout 2-kolom */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* --- KOLOM KIRI: Teks & Stats --- */}
            <motion.div
              className="space-y-8 sm:space-y-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Main Headline */}
              <motion.h1 variants={itemVariants}>
                <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.85] text-black mb-3 sm:mb-4">
                  KELOLA
                </span>
                <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.85] text-black mb-4 sm:mb-6">
                  KALORI
                </span>
                <div className="inline-block bg-black text-white px-4 py-3 sm:px-6 sm:py-3 lg:px-8 lg:py-4 border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
                  <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black">
                    DENGAN CERDAS
                  </span>
                </div>
              </motion.h1>

              {/* Paragraf */}
              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-xl"
              >
                Scan makanan & minumanmu. AI kami langsung hitung kalori dan
                nutrisinya. Yuk, capai target sehatmu bareng Sikalori!
              </motion.p>

              {/* Tombol CTAs */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <button
                  onClick={handleCTAClick}
                  disabled={isLoading}
                  className="group relative px-8 py-4 sm:px-10 sm:py-5 bg-black text-white font-black text-sm sm:text-base border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] sm:hover:translate-x-[3px] sm:hover:translate-y-[3px] active:translate-x-[4px] active:translate-y-[4px] sm:active:translate-x-[6px] sm:active:translate-y-[6px] transition-all duration-150 disabled:opacity-50"
                >
                  {isLoading
                    ? "MEMUAT..."
                    : isLoggedIn
                      ? "KE DASHBOARD"
                      : "SCAN SEKARANG"}
                </button>
                <button className="group px-8 py-4 sm:px-10 sm:py-5 bg-white text-black font-black text-sm sm:text-base border-2 sm:border-4 border-black hover:bg-black hover:text-white transition-all duration-200">
                  <span className="flex items-center justify-center gap-2">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                    LIHAT CARA KERJA
                  </span>
                </button>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 gap-4 sm:gap-8 pt-6 sm:pt-8"
              >
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="border-l-4 border-black pl-4 sm:pl-6"
                  >
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-black leading-none mb-1 sm:mb-2">
                      {stat.num}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-gray-600 uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* --- KOLOM KANAN: Visual & Fitur --- */}
            <motion.div
              className="space-y-6"
              variants={rightColVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Kartu Fitur Utama */}
              <div className="bg-white border-2 sm:border-4 border-black p-6 sm:p-8 lg:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-black flex items-center justify-center">
                    <Camera
                      className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="px-3 py-1 sm:px-4 sm:py-2 bg-green-500 border-2 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-xs sm:text-sm font-black tracking-wider text-white">
                      ACTIVE
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 sm:mb-3 leading-tight text-black">
                  SCAN APA SAJA
                </h3>
                <p className="text-black font-bold text-base sm:text-lg leading-relaxed mb-4">
                  Ambil foto makanan atau minuman, dapatkan info gizi lengkap
                  dalam hitungan detik.
                </p>

                <div className="space-y-2 sm:space-y-3 pt-4 border-t-2 border-gray-200">
                  {[
                    "Hitung Kalori Instan",
                    "Rincian Gizi Lengkap",
                    "Deteksi Porsi Akurat",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-black flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-sm sm:text-base font-black text-black">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid 3 Kartu Benefit Kecil */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {benefits.map((benefit, idx) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={benefit.text}
                      variants={itemVariants}
                      className={`${
                        benefit.color
                      } border-2 sm:border-4 border-black p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-200`}
                    >
                      <Icon
                        className="w-8 h-8 sm:w-10 sm:h-10 text-white mb-3"
                        strokeWidth={2.5}
                      />
                      <h4 className="text-lg sm:text-xl font-black text-white leading-tight">
                        {benefit.text}
                      </h4>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
