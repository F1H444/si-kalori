"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Heart,
  Scale,
  Utensils,
  User,
  Users,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function TargetAudienceSection() {
  const [mounted, setMounted] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const audiences = [
    {
      icon: Dumbbell,
      title: "PECINTA FITNESS",
      subtitle: "Gym & Olahraga",
      description:
        "Kamu yang rutin nge-gym dan butuh tracking protein, karbohidrat, lemak untuk bulking atau cutting? Si Kalori bantu kamu hitung makro dengan akurat!",
      color: "bg-[#FF5F5F]",
      painPoint: "Bingung hitung makro manual?",
      solution: "Scan makanan → Langsung tau semua nutrisinya",
      stats: "Tracking protein, karbo, lemak",
    },
    {
      icon: Scale,
      title: "PROGRAM DIET",
      subtitle: "Turun atau Naik BB",
      description:
        "Mau turunkan berat badan atau malah naikin? Apapun goalmu, tracking kalori harian adalah kunci. Si Kalori bikin prosesnya jadi gampang dan konsisten.",
      color: "bg-[#FFD95A]",
      painPoint: "Diet sering gagal di tengah jalan?",
      solution: "Target kalori personal sesuai goal",
      stats: "Defisit, surplus, atau maintain",
    },
    {
      icon: Heart,
      title: "HIDUP SEHAT",
      subtitle: "Aware Nutrisi",
      description:
        "Pengen lebih aware sama apa yang kamu makan sehari-hari? Si Kalori kasih info nutrisi lengkap dan skor kesehatan buat setiap makananmu.",
      color: "bg-[#569AFF]",
      painPoint: "Ga tau makanan sehat atau nggak?",
      solution: "Health score di setiap scan",
      stats: "Kalori + Protein + Karbo + Lemak",
    },
    {
      icon: Utensils,
      title: "SIBUK KERJA",
      subtitle: "Professionals & Mahasiswa",
      description:
        "Ga ada waktu ribet hitung kalori manual? Cukup foto makanan kamu, Si Kalori langsung kasih info lengkap. Hemat waktu, tetap sehat!",
      color: "bg-[#4ade80]",
      painPoint: "Ga sempat tracking makan?",
      solution: "Foto → Langsung dapat hasilnya",
      stats: "Analisis dalam hitungan detik",
    },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 12,
      },
    },
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-white overflow-hidden py-12 sm:py-16 lg:py-24">
      {/* Background & Geometric Accents di bawah ini telah dihapus sesuai permintaan */}

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-black text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Users className="w-4 h-4" strokeWidth={3} />
            <span className="text-xs font-black tracking-[0.2em]">
              UNTUK SIAPA?
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-8xl font-black leading-[0.85] mb-6"
          >
            <span className="block text-black">SI KALORI</span>
            <span className="inline-block bg-black text-white px-4 py-2 mt-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)]">
              UNTUK KAMU!
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto font-bold mt-8"
          >
            Apapun goalmu, Si Kalori siap jadi partner terbaik untuk tracking
            nutrisi dan mencapai target kesehatanmu.
          </motion.p>
        </div>

        {/* Audience Cards Grid */}
        <motion.div
          className="grid sm:grid-cols-2 gap-8 lg:gap-10 mb-16"
          variants={containerVariants}
        >
          {audiences.map((audience, idx) => {
            const Icon = audience.icon;
            const isActive = activeCard === idx;

            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="relative group"
              >
                <div
                  className={`relative h-full bg-white border-4 border-black p-6 sm:p-10 transition-all duration-300
                    ${
                      isActive
                        ? "shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] -translate-x-1 -translate-y-1"
                        : "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                    }
                    group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-x-1 group-hover:-translate-y-1`}
                >
                  {/* Icon Box */}
                  <div className="flex items-start justify-between mb-8">
                    <div
                      className={`${audience.color} w-16 h-16 sm:w-20 sm:h-20 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center`}
                    >
                      <Icon
                        className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                        strokeWidth={2.5}
                      />
                    </div>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="px-4 py-1 bg-black text-white border-2 border-black font-black text-xs tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                        >
                          TARGET AUDIENCE
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Content */}
                  <div className="mb-6">
                    <h3 className="text-2xl sm:text-3xl font-black text-black mb-1 italic uppercase">
                      {audience.title}
                    </h3>
                    <p className="text-sm font-black text-gray-500 uppercase tracking-widest">
                      {audience.subtitle}
                    </p>
                  </div>

                  <p className="text-gray-800 font-bold leading-snug mb-8 text-base sm:text-lg">
                    {audience.description}
                  </p>

                  {/* Pain Points Section */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 bg-red-50 border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <span className="text-lg">❌</span>
                      <p className="text-xs sm:text-sm font-black text-black leading-tight">
                        {audience.painPoint}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-green-50 border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <span className="text-lg">✅</span>
                      <p className="text-xs sm:text-sm font-black text-black leading-tight">
                        {audience.solution}
                      </p>
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between pt-6 border-t-4 border-black mt-auto">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className="w-5 h-5 text-black"
                        strokeWidth={3}
                      />
                      <span className="text-xs sm:text-sm font-black uppercase tracking-tight">
                        {audience.stats}
                      </span>
                    </div>
                    <ArrowRight
                      className={`w-6 h-6 transition-all duration-300 ${
                        isActive
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-4 opacity-0"
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Universal Message */}
        <motion.div
          variants={itemVariants}
          whileInView={{
            scale: [0.98, 1.02, 1],
            transition: { duration: 0.5 },
          }}
          className="bg-yellow-400 text-black border-4 border-black p-8 sm:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center flex-shrink-0 -rotate-3">
              <User className="w-10 h-10 text-black" strokeWidth={3} />
            </div>

            <div className="text-center md:text-left">
              <h3 className="text-3xl sm:text-4xl font-black mb-4 leading-none">
                TIDAK MASUK KATEGORI DI ATAS?
              </h3>
              <p className="text-lg font-bold leading-tight opacity-95 max-w-2xl">
                Tenang! Si Kalori didesain untuk{" "}
                <span className="bg-white text-black px-2 py-0.5 mx-1 inline-block rotate-1 border-2 border-black">
                  SIAPA SAJA
                </span>{" "}
                yang peduli dengan kesehatan. Dari pemula hingga pro, semua bisa
                mulai hidup lebih sadar nutrisi hari ini!
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
