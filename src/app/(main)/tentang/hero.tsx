"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { useLoading } from "@/context/LoadingContext";
import { TextScramble } from "@/components/ui/text-scramble";

export default function HeroSection() {
  const { isLoading: globalLoading } = useLoading();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Variasi untuk animasi melayang (floating)
  const floatingAnimation = (delay: number = 0) => ({
    initial: { y: 0, rotate: 0 },
    animate: {
      y: [0, -15, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut" as const,
        delay: delay,
      },
    },
  });

  return (
    <div className="relative bg-white overflow-hidden pt-44 pb-20 md:pt-48 px-4 sm:px-6 lg:px-8 min-h-[85svh] flex items-center">
      
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          {...floatingAnimation(0)}
          className="absolute top-1/4 -left-10 w-40 h-40 bg-yellow-400 opacity-20 border-4 border-black rotate-12" 
        />
        <motion.div 
          {...floatingAnimation(1)}
          className="absolute bottom-1/4 -right-10 w-32 h-32 bg-green-500 opacity-20 border-4 border-black -rotate-12 rounded-full" 
        />
        <motion.div 
          {...floatingAnimation(2)}
          className="absolute top-20 right-1/4 w-12 h-12 bg-blue-500 opacity-20 border-4 border-black rotate-45" 
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={!globalLoading ? "visible" : "hidden"}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* Left Column: Teks Utama */}
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="inline-block bg-black text-white px-5 py-2 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
              <span className="text-sm font-black tracking-[0.3em] uppercase">
                MISI & CERITA KAMI
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl sm:text-7xl lg:text-8xl font-black text-black leading-[0.9] tracking-tighter"
            >
              <span className="block border-b-8 border-yellow-400 w-fit mb-2">
                <TextScramble text="PAHAMI" delay={0.1} />
              </span>
              <span className="block text-green-500">
                <TextScramble text="MAKANAN" delay={0.3} />
              </span>
              <span className="block">
                <TextScramble text="UBAH" delay={0.5} />{" "}
                <span className="bg-black text-white px-4 inline-block">HIDUP.</span>
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl font-bold text-gray-700 max-w-xl leading-relaxed border-l-8 border-black pl-6"
            >
              Si Kalori lahir dari kegelisahan akan sulitnya memantau asupan nutrisi secara harian. Kami menggabungkan kecanggihan AI dengan kemudahan penggunaan untuk semua orang.
            </motion.p>
          </div>

          {/* Right Column: Dynamic Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            {[
              { label: "Analisis", value: "AI", color: "bg-green-500", delay: 0 },
              { label: "Data", value: "Akurat", color: "bg-yellow-400", delay: 1 },
              { label: "Riwayat", value: "Lengkap", color: "bg-blue-400", delay: 2 },
              { label: "Pengguna", value: "Cerdas", color: "bg-purple-400", delay: 0.5 },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 1 : -1 }}
                className={`${stat.color} border-4 border-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-[160px]`}
              >
                <div className="text-xs font-black text-black/60 uppercase tracking-widest">{stat.label}</div>
                <div className="text-4xl font-black text-black uppercase">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
