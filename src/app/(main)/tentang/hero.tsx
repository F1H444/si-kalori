"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { useLoading } from "@/context/LoadingContext";
import { ArrowRight, Apple, Beef, Coffee, Salad, Camera } from "lucide-react";
import { TextScramble } from "@/components/ui/text-scramble";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  const { isLoading: globalLoading } = useLoading();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
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

  const foodImages = [
    { 
      icon: <Salad className="w-10 h-10" />, 
      label: "Salad Segar", 
      color: "bg-green-400", 
      rotate: "-rotate-3",
      image: "/images/salad.webp"
    },
    { 
      icon: <Beef className="w-10 h-10" />, 
      label: "Makanan Berat", 
      color: "bg-red-400", 
      rotate: "rotate-6",
      image: "/images/makanan-berat.webp" 
    },
    { 
      icon: <Apple className="w-10 h-10" />, 
      label: "Buah-buahan", 
      color: "bg-yellow-400", 
      rotate: "-rotate-6",
      image: "/images/buah.webp" 
    },
    { 
      icon: <Coffee className="w-10 h-10" />, 
      label: "Minuman", 
      color: "bg-blue-400", 
      rotate: "rotate-3",
      image: "/images/minuman.webp" 
    },
  ];

  return (
    <section className="relative bg-white text-black overflow-hidden pt-32 sm:pt-40 md:pt-48 pb-20 px-4 sm:px-6 lg:px-20 min-h-[90svh] flex flex-col justify-center">
      
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={!globalLoading ? { opacity: 1, x: 0 } : {}}
           className="inline-flex items-center gap-3 bg-black text-white px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] mb-8 sm:mb-12"
        >
          <Camera className="w-4 h-4 text-green-400" />
          <span className="text-xs font-black uppercase tracking-[0.1em]">Tentang Kami</span>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={!globalLoading ? "visible" : "hidden"}
          className="grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-24 items-start"
        >
          <div className="space-y-4">
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-7xl lg:text-[7rem] font-black leading-[0.85] tracking-tighter"
            >
              <TextScramble text="TENTANG" delay={0.1} /> <br />
              <span className="inline-block bg-[#FFC700] text-black px-6 py-2 mt-4 border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] font-black italic">
                SI KALORI.
              </span>
            </motion.h1>
          </div>

          <div className="space-y-8 flex flex-col items-start lg:items-end">
            <motion.div variants={itemVariants} className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black uppercase lg:text-right text-black">Kenalan Lebih Dekat Sama Kami</h2>
              <p className="text-lg sm:text-xl font-bold text-black leading-relaxed lg:text-right max-w-lg border-l-8 lg:border-l-0 lg:border-r-8 border-green-500 pl-4 lg:pl-0 lg:pr-4">
                Sikalori hadir buat Anda yang pengen tetap sehat tapi nggak mau ribet. Kami gabungin teknologi AI dengan cara yang asik buat bantu Anda pantau nutrisi harian. Intinya, kami pengen jadi teman baik dalam perjalanan kesehatan Anda.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-start lg:justify-end w-full">
              <Link href="#fitur" className="flex-1 sm:flex-none bg-black text-white px-8 py-4 border-4 border-black font-black text-lg shadow-[6px_6px_0px_0px_rgba(34,197,94,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-center">
                CEK KEUNGGULAN
              </Link>
              <Link href="/kontak" className="flex-1 sm:flex-none flex items-center justify-center gap-2 font-black text-lg px-8 py-4 border-4 border-black bg-white hover:bg-black hover:text-white transition-all group">
                HUBUNGI KAMI <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={!globalLoading ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="relative mt-16 sm:mt-24 w-full"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-7xl mx-auto">
          {foodImages.map((item, idx) => (
            <div 
              key={idx} 
              className={`aspect-[4/5] ${item.color} border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform ${item.rotate}`}
            >
              {/* Image Layer */}
              {item.image && (
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={item.image} 
                    alt={item.label} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Overlay biar teks tetep kebaca kalo ada gambar */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                </div>
              )}

              <div className="z-10 bg-white border-2 border-black p-4 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:animate-bounce flex items-center justify-center text-black">
                {item.icon}
              </div>
              <span className="z-10 mt-4 font-black text-sm uppercase text-center tracking-tighter bg-white px-3 py-1 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}