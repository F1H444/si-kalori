"use client";

import React from "react";
import { motion } from "framer-motion";

export default function FeaturesSection() {
  const features = [
    {
      number: "01",
      title: "ANALISIS AI",
      description:
        "Foto makanan atau ketik nama menu, AI menganalisis nutrisi dalam hitungan detik.",
      color: "bg-blue-500",
    },
    {
      number: "02",
      title: "MULTI INPUT",
      description:
        "3 cara input: kamera langsung, upload dari galeri, atau ketik manual.",
      color: "bg-red-500",
    },
    {
      number: "03",
      title: "DATA LENGKAP",
      description:
        "Kalori, Protein, Karbohidrat, Lemak, sampai Health Score dalam satu tampilan.",
      color: "bg-green-500",
    },
    {
      number: "04",
      title: "RIWAYAT",
      description:
        "Semua scan tersimpan rapi berdasarkan waktu makan: pagi, siang, malam, snack.",
      color: "bg-purple-500",
    },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mb-20 sm:mb-32">
      {/* Section Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mb-12 sm:mb-16"
      >
        <motion.h2
          variants={titleVariants}
          className="text-4xl sm:text-5xl lg:text-6xl font-black text-black leading-tight mb-4"
        >
          FITUR{" "}
          <span className="inline-block bg-green-500 text-white px-4 py-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            UTAMA
          </span>
        </motion.h2>

        <motion.p
          variants={titleVariants}
          className="text-lg sm:text-xl text-gray-700 max-w-2xl"
        >
          Fitur lengkap untuk tracking nutrisi harianmu. Dari analisis AI sampai
          riwayat makanan.
        </motion.p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid md:grid-cols-2 gap-8 sm:gap-10"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{
              y: -8,
              transition: { type: "spring", stiffness: 400, damping: 17 },
            }}
            className="group bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300"
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-5 border-b-4 border-black ${feature.color}`}>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                {feature.title}
              </h3>
              <span className="text-4xl font-black text-white/30">
                {feature.number}
              </span>
            </div>

            {/* Body */}
            <div className="p-6 bg-white">
              <p className="text-base sm:text-lg font-bold text-gray-800 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, type: "spring", stiffness: 80 }}
        className="mt-12 bg-black text-white border-4 border-black p-8 sm:p-10 shadow-[8px_8px_0px_0px_rgba(34,197,94,1)]"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase mb-2">
              Siap Mulai Tracking?
            </h3>
            <p className="font-bold opacity-80">
              Login dan mulai analisis makananmu dengan AI.
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-500 text-white px-8 py-4 font-black text-xl uppercase border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] cursor-pointer"
          >
            SCAN SEKARANG
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
