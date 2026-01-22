"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { useLoading } from "@/context/LoadingContext";
import { TextScramble } from "@/components/ui/text-scramble";
import { Sparkles, ArrowRight, Zap, Target, History, Users } from "lucide-react";

export default function HeroSection() {
  const { isLoading: globalLoading } = useLoading();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.3 } 
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 200, damping: 15 } 
    },
  };

  const stats = [
    { label: "ANALISIS", value: "SMART AI", color: "bg-green-400", icon: Zap },
    { label: "AKURASI", value: "TINGGI", color: "bg-yellow-400", icon: Target },
    { label: "RIWAYAT", value: "LENGKAP", color: "bg-blue-400", icon: History },
    { label: "KOMUNITAS", value: "CERDAS", color: "bg-purple-400", icon: Users },
  ];

  return (
    <section className="relative bg-white overflow-hidden pt-44 pb-20 md:pt-48 px-4 sm:px-6 lg:px-8 min-h-[90svh] flex items-center">
      
      {/* Background Elements removed for a cleaner look */}

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={!globalLoading ? "visible" : "hidden"}
          className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center"
        >
          {/* LEFT COLUMN: BRAND STORY */}
          <div className="space-y-10">
            <motion.div 
              variants={itemVariants} 
              className="inline-flex items-center gap-3 bg-black text-white px-5 py-3 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-black tracking-[0.3em] uppercase">
                MISI & CERITA KAMI
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl sm:text-7xl lg:text-8xl font-black text-black leading-[1.05] tracking-tighter"
            >
              <TextScramble text="PAHAMI" delay={0.1} /> <br />
              <span className="inline-block bg-green-500 text-white px-4 py-2 my-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                MAKANAN
              </span>
              <br />
              <span className="flex items-center gap-4 flex-wrap">
                <TextScramble text="UBAH" delay={0.4} />
                <span className="bg-black text-white px-5 py-1 rotate-2 border-4 border-black shadow-[6px_6px_0px_0px_rgba(234,179,8,1)]">
                  HIDUP.
                </span>
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl font-bold text-gray-800 max-w-xl leading-relaxed border-l-8 border-black pl-6 italic"
            >
              "Si Kalori lahir dari kegelisahan sulitnya pantau nutrisi. Kami gabungkan kecanggihan AI dengan kemudahan yang bikin hidup lebih santai."
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-5">
              <button className="group relative bg-yellow-400 px-8 py-4 border-4 border-black text-black font-black text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-3">
                MULAI ANALISIS <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: DYNAMIC STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                  className={`${stat.color} border-4 border-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-[180px] group transition-all`}
                >
                  <div className="flex justify-between items-start">
                    <div className="text-xs font-black text-black/60 uppercase tracking-widest leading-none">
                      {stat.label}
                    </div>
                    <Icon className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-4xl font-black text-black uppercase leading-tight mt-4">
                    {stat.value}
                  </div>
                  {/* Decorative line inside box */}
                  <div className="w-full h-1.5 bg-black mt-4 opacity-20" />
                </motion.div>
              );
            })}
            
            {/* Background Decoration to match 'how.tsx' layout depth */}
            <div className="absolute -z-10 -bottom-8 -left-8 w-full h-full border-4 border-dashed border-black/10 rounded-lg translate-x-4 translate-y-4" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}