"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { Camera, Layers, History, Database, Sparkle } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Vision AI",
      description: "Tinggal foto makanannya, nanti AI kami yang bantu kenalin jenis menu Anda otomatis.",
      color: "bg-blue-400"
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: "Detail Nutrisi",
      description: "Langsung keluar info Karbo, Protein, sampe Lemaknya cuma dalam hitungan detik.",
      color: "bg-green-400"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Data Melimpah",
      description: "Kami punya database luas banget, mulai dari menu lokal sampe makanan luar negeri.",
      color: "bg-yellow-400"
    },
    {
      icon: <History className="w-8 h-8" />,
      title: "Riwayat Pintar",
      description: "Semua history makan Anda kesimpen rapi. Bisa dipantau lewat grafik yang gampang dibaca.",
      color: "bg-purple-400"
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  return (
    <section className="bg-white py-24 px-4 sm:px-6 lg:px-20 pb-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-4 max-w-2xl">
                <div className="inline-block bg-green-500 text-white px-4 py-1 font-black text-xs uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    Fitur Unggulan
                </div>skea
                <h2 className="text-5xl sm:text-7xl font-black uppercase leading-none tracking-tighter text-black">
                    Ngasih Solusi <br />
                    <span className="inline-block bg-[#FFC700] text-black px-6 py-2 mt-4 border-[6px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] italic text-4xl sm:text-6xl">
                      Buat Tiap Hari Anda.
                    </span>
                </h2>
            </div>
            <p className="text-xl font-bold text-black max-w-sm">
                Sikalori nyatuin teknologi canggih biar pengalaman hidup sehat Anda jadi lebih asik dan gak ngebosenin.
            </p>
        </div>

        <motion.div
           variants={containerVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ rotate: idx % 2 === 0 ? 1 : -1, y: -5 }}
              className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-start min-h-[250px] group transition-all"
            >
              <div className={`${feature.color} p-4 border-4 border-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:bg-black group-hover:text-white transition-colors text-black`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black uppercase mb-3 tracking-tighter text-black">{feature.title}</h3>
              <p className="font-bold text-black leading-snug">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24 relative overflow-hidden"
        >
            <div className="bg-green-500 border-8 border-black p-8 sm:p-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-white space-y-2">
                    <h3 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none text-white">Siap Mulai Hidup Lebih Baik?</h3>
                    <p className="text-black font-black uppercase tracking-wider text-sm opacity-100">Coba gratis 10 scan tiap harinya, spesial buat Anda!</p>
                </div>
                <button className="w-full md:w-auto bg-black text-white px-10 py-5 font-black text-xl uppercase border-4 border-white hover:bg-white hover:text-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                    Mulai Sekarang
                </button>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400 border-4 border-black -translate-y-12 translate-x-12 rotate-12" />
        </motion.div>
      </div>
    </section>
  );
}
