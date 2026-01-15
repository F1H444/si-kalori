"use client";

import { useState, useEffect } from "react";
import { Camera, Scan, Brain, CheckCircle, Eye, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CaraKerja() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: "01",
      icon: Camera,
      title: "FOTO ATAU KETIK",
      description: "Jepret makananmu, upload dari galeri, atau ketik nama menu aja. Semudah itu!",
      color: "bg-red-500",
      textColor: "text-red-500",
      borderColor: "border-red-500",
    },
    {
      number: "02",
      icon: Scan,
      title: "PILIH WAKTU MAKAN",
      description: "Sarapan, makan siang, malam, atau cemilan? Tinggal pilih biar kita tracking.",
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
      borderColor: "border-yellow-500",
    },
    {
      number: "03",
      icon: Brain,
      title: "AI ANALISIS",
      description: "AI kita bakal hitung kalori, protein, karbo, lemak, sampai skor kesehatannya.",
      color: "bg-blue-500",
      textColor: "text-blue-500",
      borderColor: "border-blue-500",
    },
    {
      number: "04",
      icon: CheckCircle,
      title: "LIHAT HASILNYA",
      description: "Langsung dapet info nutrisi lengkap plus rekomendasi makanan yang lebih sehat!",
      color: "bg-green-500",
      textColor: "text-green-500",
      borderColor: "border-green-500",
    },
  ];

  // Auto-cycle steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [steps.length]);

  // Variasi Animasi Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
      },
    },
  };

  return (
    <section className="relative bg-white p-4 sm:p-6 lg:p-8 py-20 sm:py-32 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* KOLOM KIRI: TEKS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-5 py-3 bg-black text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <Eye className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-black tracking-[0.3em] uppercase">
                Cara Kerjanya
              </span>
            </div>

            {/* PERUBAHAN DI SINI: leading diubah ke [1.1] dan penambahan margin y pada span */}
            <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black text-black leading-[1.1] tracking-tighter">
              GAMPANG <br />
              <span className="inline-block bg-yellow-400 text-black px-4 py-2 my-3 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                BANGET
              </span>
              <br />KOK!
            </h2>

            <p className="text-xl text-gray-800 font-bold max-w-lg leading-relaxed border-l-8 border-black pl-6 italic">
              "Cuma butuh beberapa detik dari foto sampai tau semua nutrisi makananmu. Serius, sesimpel itu."
            </p>

            <div className="flex gap-4">
               {steps.map((_, i) => (
                 <div key={i} className={`h-2 transition-all duration-500 border-2 border-black ${activeStep === i ? "w-12 bg-black" : "w-4 bg-gray-200"}`} />
               ))}
            </div>
          </motion.div>

          {/* KOLOM KANAN: STEPS */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-6"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  onClick={() => setActiveStep(index)}
                  className={`group relative cursor-pointer bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${
                    isActive ? "scale-[1.03] -translate-x-2" : "hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                  }`}
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        layoutId="activeBar"
                        className={`absolute inset-0 ${step.color} opacity-10 z-0`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </AnimatePresence>

                  <div className="relative z-10 flex items-center gap-6">
                    <div className={`flex-shrink-0 w-16 h-16 flex items-center justify-center border-4 border-black transition-all duration-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                      isActive ? `${step.color} rotate-[12deg] -translate-y-2` : "bg-white group-hover:rotate-6"
                    }`}>
                      <span className={`text-2xl font-black ${isActive ? "text-white" : "text-black"}`}>
                        {step.number}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-2xl font-black uppercase tracking-tight transition-colors ${
                          isActive ? step.textColor : "text-black"
                        }`}>
                          {step.title}
                        </h3>
                        {isActive && (
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1] }} 
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <Sparkles className={`w-5 h-5 ${step.textColor}`} />
                          </motion.div>
                        )}
                      </div>
                      <p className="text-gray-700 font-bold leading-tight">
                        {step.description}
                      </p>
                    </div>

                    <div className={`transition-all duration-500 ${isActive ? "scale-125 rotate-0" : "opacity-20 -rotate-12 group-hover:opacity-40"}`}>
                      <Icon
                        className={`w-10 h-10 ${isActive ? step.textColor : "text-black"}`}
                        strokeWidth={3}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}