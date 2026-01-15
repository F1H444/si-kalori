"use client";

import { Brain, PieChart, Target, History } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";

// Tipe untuk item fitur
interface FeatureItem {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  shadowColor: string;
}

// Data fitur yang sesuai dengan fitur website
const featureItems: FeatureItem[] = [
  {
    icon: Brain,
    title: "Analisa AI Cerdas",
    description:
      "Foto makanan atau tulis nama menu, AI kami akan menganalisis nutrisinya secara instan dan akurat.",
    color: "bg-blue-500",
    shadowColor: "rgba(59, 130, 246, 1)",
  },
  {
    icon: PieChart,
    title: "Rincian Gizi Detail",
    description:
      "Lacak Protein, Karbo, Lemak, Kalori, dan Skor Kesehatan. Data lengkap dalam satu scan.",
    color: "bg-green-500",
    shadowColor: "rgba(34, 197, 94, 1)",
  },
  {
    icon: Target,
    title: "Target Harian Kustom",
    description:
      "Atur target (defisit, surplus, atau maintenance) sesuai goal kamu dan pantau kemajuannya.",
    color: "bg-yellow-500",
    shadowColor: "rgba(234, 179, 8, 1)",
  },
  {
    icon: History,
    title: "Riwayat Lengkap",
    description:
      "Semua scan makanan tersimpan rapi. Lihat pola makan dan track progress harianmu.",
    color: "bg-purple-500",
    shadowColor: "rgba(168, 85, 247, 1)",
  },
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
      duration: 0.4,
    },
  },
};

const titleVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 150,
      damping: 15,
    },
  },
};

const subtitleVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 150,
      damping: 15,
      delay: 0.05,
    },
  },
};

export default function Features() {
  return (
    <div className="relative bg-white z-0 px-4 sm:px-6 py-16 sm:py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Judul Bagian */}
        <div className="text-left mb-12 sm:mb-16 lg:mb-20 max-w-2xl">
          <motion.h2
            variants={titleVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-black leading-tight"
          >
            FITUR INTI KAMI.
          </motion.h2>
          <motion.p
            variants={subtitleVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-lg sm:text-xl text-gray-700 mt-4"
          >
            Lihat lebih detail <span className="font-bold text-black">apa</span>{" "}
            yang bisa SIKALORI lakukan untuk Anda. Setiap fitur dirancang untuk
            akurasi dan kemudahan.
          </motion.p>
        </div>

        {/* Grid Fitur (2x2) with Stagger Animation */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {featureItems.map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  y: -8,
                  transition: { type: "spring", stiffness: 400, damping: 17 },
                }}
                className="group relative border-4 border-black bg-white cursor-pointer"
                style={{
                  boxShadow: `8px 8px 0px 0px rgba(0,0,0,1)`,
                }}
              >
                {/* Colored accent line on top */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${item.color}`}
                />

                {/* Header Kartu */}
                <div
                  className={`flex items-center gap-4 sm:gap-5 p-5 sm:p-6 ${item.color} border-b-4 border-black transition-all duration-300`}
                >
                  <motion.div
                    className="w-14 h-14 sm:w-16 sm:h-16 bg-white flex items-center justify-center border-3 border-black flex-shrink-0"
                    style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
                    whileHover={{
                      rotate: [0, -10, 10, 0],
                      transition: { duration: 0.5 },
                    }}
                  >
                    <Icon
                      className="w-7 h-7 sm:w-8 sm:h-8 text-black"
                      strokeWidth={2.5}
                    />
                  </motion.div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    {item.title}
                  </h3>
                </div>

                {/* Badan Kartu */}
                <div className="bg-white p-5 sm:p-6 relative overflow-hidden">
                  {/* Hover background effect */}
                  <div
                    className={`absolute inset-0 ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />
                  <p className="text-base sm:text-lg text-gray-800 leading-relaxed relative z-10">
                    {item.description}
                  </p>
                </div>

                {/* Corner decoration */}
                <div
                  className={`absolute -bottom-2 -right-2 w-6 h-6 ${item.color} border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
