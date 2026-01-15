"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLoading } from "@/context/LoadingContext";

export default function MissionSection() {
  const { isLoading: globalLoading } = useLoading();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 12,
      },
    },
  };

  const scaleVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
      },
    },
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 mb-20 sm:mb-32">
      <motion.div
        variants={scaleVariants}
        initial="hidden"
        whileInView={!globalLoading ? "visible" : "hidden"}
        viewport={{ once: true, margin: "-100px" }}
        className="bg-yellow-400 border-4 border-black p-6 sm:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative z-10"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl font-black text-black mb-6 uppercase"
          >
            MISI KAMI
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl font-bold text-black leading-relaxed mb-6"
          >
            &quot;Membantu setiap orang memahami nutrisi makanan mereka dengan
            mudah dan akurat. Dengan teknologi AI, kami mengubah cara tracking
            kalori dari yang ribet menjadi semudah foto atau ketik nama
            menu.&quot;
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
            <span className="bg-black text-white px-3 py-1 font-black text-sm uppercase">
              Mudah & Cepat
            </span>
            <span className="bg-white text-black px-3 py-1 font-black text-sm uppercase border-2 border-black">
              Data Akurat
            </span>
            <span className="bg-black text-white px-3 py-1 font-black text-sm uppercase">
              AI-Powered
            </span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Vision Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={!globalLoading ? { opacity: 1, y: 0 } : {}}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
        className="mt-8 grid md:grid-cols-2 gap-6"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        >
          <h3 className="text-xl font-black uppercase mb-3 text-blue-600">
            Visi Kami
          </h3>
          <p className="font-bold text-gray-800 leading-relaxed">
            Menjadi platform analisis nutrisi terpercaya yang membantu
            masyarakat Indonesia hidup lebih sehat melalui pemahaman gizi yang
            tepat.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-black text-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(34,197,94,1)]"
        >
          <h3 className="text-xl font-black uppercase mb-3 text-yellow-400">
            Mengapa Si Kalori?
          </h3>
          <p className="font-bold leading-relaxed opacity-90">
            Karena tracking nutrisi seharusnya tidak ribet. Cukup foto atau
            ketik, AI kami yang analisis. Simpel.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
