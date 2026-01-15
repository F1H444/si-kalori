"use client";

import React from "react";
import { motion } from "framer-motion";

export default function HeroSection() {
  // Animation Variants
  // Animation Variants
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 12,
      },
    },
  };

  return (
    <div className="relative bg-white overflow-hidden pt-44 pb-20 md:pt-52 px-4">


      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto text-center"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="inline-flex justify-center mb-8">
          <div className="bg-black text-white px-4 py-2 border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
            <span className="text-sm sm:text-base font-black tracking-widest uppercase">
              TENTANG SI KALORI
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="flex flex-col items-center justify-center gap-2 sm:gap-4 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-black leading-tight mb-8"
        >
          <span className="block">PAHAMI</span>

          <motion.span
            whileHover={{ scale: 1.02 }}
            className="relative inline-block bg-green-500 text-white px-4 sm:px-6 transform -rotate-1 border-4 border-green-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
          >
            MAKANANMU.
          </motion.span>

          <span className="block">
            UBAH{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-black to-gray-600">
              HIDUPMU.
            </span>
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl font-bold text-gray-700 max-w-3xl mx-auto leading-relaxed mb-10"
        >
          Si Kalori adalah sebuah website tracking nutrisi berbasis AI yang membantu kamu
          memahami kandungan gizi makanan dengan mudah. Cukup foto atau tulis nama menu,
          langsung dapat info kalori, protein, karbo, dan lemak secara akurat.
        </motion.p>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-4"
        >
          {[
            { label: "Analisis", value: "AI" },
            { label: "Data", value: "Akurat" },
            { label: "Riwayat", value: "Lengkap" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -4 }}
              className="bg-white border-4 border-black px-5 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <p className="text-xs font-black text-gray-500 uppercase">{stat.label}</p>
              <p className="text-xl font-black text-black">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
