"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ValuesSection() {
  const values = [
    {
      number: "01",
      title: "KESEIMBANGAN",
      description:
        "Makan enak dan hidup sehat bisa jalan bareng. Fokus ke progres, bukan penyiksaan. Track nutrisi tanpa stress.",
      color: "bg-pink-500",
    },
    {
      number: "02",
      title: "DATA AKURAT",
      description:
        "Semua analisis berbasis data nutrisi yang valid dari AI. No guessing, just facts. Biar targetmu tercapai.",
      color: "bg-blue-500",
    },
    {
      number: "03",
      title: "UNTUK SEMUA",
      description:
        "Apapun goalmu—turun BB, bulk, atau maintain—Si Kalori siap bantu. Dari pemula sampai pro, semua bisa mulai.",
      color: "bg-green-500",
    },
  ];

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

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
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

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
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
    <div className="max-w-7xl mx-auto px-4 mb-20 sm:mb-32">
      {/* Section Title */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-16"
      >
        <motion.h2
          variants={titleVariants}
          className="text-4xl sm:text-5xl font-black text-center uppercase italic tracking-tighter"
        >
          PRINSIP{" "}
          <span className="inline-block bg-yellow-400 px-4 py-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            SI KALORI
          </span>
        </motion.h2>
      </motion.div>

      {/* Values Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid md:grid-cols-3 gap-8 sm:gap-10"
      >
        {values.map((value, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{
              y: -8,
              transition: { type: "spring", stiffness: 400, damping: 17 },
            }}
            className="group relative bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300"
          >
            {/* Header */}
            <div className={`p-5 border-b-4 border-black ${value.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  {value.title}
                </h3>
                <span className="text-3xl font-black text-white/30">
                  {value.number}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 bg-white">
              <p className="text-lg font-bold text-black leading-relaxed">
                {value.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}