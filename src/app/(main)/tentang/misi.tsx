"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { useLoading } from "@/context/LoadingContext";
import { Target, Eye, ShieldCheck } from "lucide-react";

export default function MissionSection() {
  const { isLoading: globalLoading } = useLoading();
  
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      },
    },
  };

  return (
    <section className="bg-white py-24 sm:py-32 px-4 sm:px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
                initial="hidden"
                whileInView={!globalLoading ? "visible" : "hidden"}
                viewport={{ once: true }}
                variants={cardVariants}
                className="space-y-8"
            >
                <div className="inline-block bg-green-500 text-white px-4 py-1 font-black text-xs uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    Apa Target Kami?
                </div>
                <h2 className="text-4xl sm:text-6xl font-black uppercase leading-none tracking-tighter text-black">
                    Cara Baru <br />
                    <span className="inline-block bg-[#FFC700] text-black px-5 py-2 mt-4 border-[6px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] italic text-3xl sm:text-5xl">
                      Liat Makanan Anda.
                    </span>
                </h2>
                <p className="text-xl font-bold text-black leading-relaxed max-w-xl">
                    Sikalori pengen banget setiap orang bisa dapet info nutrisi dengan gampang tanpa perlu ribet baca label belakang kemasan yang pusing. Kami bantu Anda paham apa yang masuk ke tubuh Anda lewat cara yang lebih simpel.
                </p>
                <div className="h-2 w-24 bg-black" />
            </motion.div>

            <div className="space-y-6">
                <motion.div
                    initial="hidden"
                    whileInView={!globalLoading ? "visible" : "hidden"}
                    viewport={{ once: true }}
                    variants={cardVariants}
                    className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative group"
                >
                    <div className="absolute top-4 right-4 text-black/5 font-black text-6xl select-none group-hover:text-green-500 transition-colors">01</div>
                    <Target className="w-10 h-10 mb-4 text-green-500" />
                    <h3 className="text-2xl font-black uppercase mb-2 text-black">Gampang Aksesnya</h3>
                    <p className="font-bold text-black italic">Bikin platform yang bisa dipake siapa aja, kapan aja, tinggal jepret doang langsung muncul infonya.</p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView={!globalLoading ? "visible" : "hidden"}
                    viewport={{ once: true }}
                    variants={cardVariants}
                    transition={{ delay: 0.1 }}
                    className="bg-black text-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(34,197,94,1)] relative group"
                >
                    <div className="absolute top-4 right-4 text-white/5 font-black text-6xl select-none group-hover:text-yellow-400 transition-colors">02</div>
                    <Eye className="w-10 h-10 mb-4 text-yellow-400" />
                    <h3 className="text-2xl font-black uppercase mb-2">Data Apa Adanya</h3>
                    <p className="font-bold text-white italic">Kasih info nutrisi yang beneran akurat pake teknologi AI terbaru tapi tetep sesuai sama data sains yang ada.</p>
                </motion.div>
            </div>
        </div>
      </div>
    </section>
  );
}
