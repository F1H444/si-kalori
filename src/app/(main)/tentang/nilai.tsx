"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { Heart, ShieldCheck, Zap } from "lucide-react";

export default function ValuesSection() {
  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Pake Hati",
      description:
        "Kita paham banget kalau jaga makan itu tantangan. Di sini kita pengen jadi support system Anda, bukan hakim.",
      color: "border-black",
      accent: "bg-red-400",
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Jujur & Akurat",
      description:
        "Akurasi data itu harga mati buat kita. Kami usahain kasih fakta nutrisi yang beneran bisa dipertanggungjawabkan.",
      color: "border-black",
      accent: "bg-blue-400",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Gak Berhenti Improvisasi",
      description:
        "Kami terus ulik teknologi AI biar pengalaman Anda nge-track makanan jadi makin gampang dan seru setiap harinya.",
      color: "border-black",
      accent: "bg-green-400",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="bg-white py-24 px-4 sm:px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-black leading-none">
              Prinsip Dasar <br />
              <span className="inline-block bg-[#FFC700] text-black px-6 py-2 mt-4 border-[6px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] italic text-3xl sm:text-5xl">
                SI KALORI.
              </span>
            </h2>
            <p className="text-black font-black uppercase tracking-widest text-sm">Gimana cara kita kerja buat Anda</p>
        </div>

        <motion.div
           variants={containerVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           className="grid md:grid-cols-3 gap-8"
        >
          {values.map((value, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className={`bg-white border-4 ${value.color} p-10 flex flex-col items-center text-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all`}
            >
              <div className={`${value.accent} text-black p-4 rounded-full border-4 border-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                {value.icon}
              </div>
              <h3 className="text-2xl font-black uppercase mb-4 tracking-tighter text-black">{value.title}</h3>
              <p className="font-bold text-black leading-relaxed italic">
                &quot;{value.description}&quot;
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}