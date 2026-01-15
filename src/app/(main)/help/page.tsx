"use client";

import { motion } from "framer-motion";
import { HelpCircle, Book, Shield, MessageCircle, ArrowRight } from "lucide-react";

export default function HelpPage() {
  const categories = [
    {
      icon: HelpCircle,
      title: "Memulai",
      description: "Cara mudah mendaftar, scan makanan pertama, dan setting profil kamu.",
      color: "bg-yellow-400"
    },
    {
      icon: Book,
      title: "Panduan Fitur",
      description: "Pelajari cara kerja AI Sikalori dan tips tracking nutrisi yang akurat.",
      color: "bg-red-400"
    },
    {
      icon: Shield,
      title: "Akun & Keamanan",
      description: "Kelola kata sandi, langganan premium, dan privasi data kamu.",
      color: "bg-blue-400"
    },
    {
      icon: MessageCircle,
      title: "Pertanyaan Umum",
      description: "Jawaban cepat untuk hal-hal yang sering ditanyakan oleh pengguna.",
      color: "bg-green-400"
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-black text-white px-6 py-2 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
            <span className="text-sm font-black uppercase tracking-widest">Pusat Bantuan</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-black leading-none tracking-tighter mb-6">
            ADA YANG BISA <br /> KAMI BANTU?
          </h1>
          <p className="text-xl text-gray-700 font-bold max-w-2xl mx-auto">
            Temukan panduan dan jawaban untuk pertanyaanmu seputar Sikalori di sini.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid sm:grid-cols-2 gap-8 mb-20">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer"
              >
                <div className={`w-16 h-16 ${cat.color} border-4 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 transition-transform`}>
                  <Icon className="w-8 h-8 text-black" strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black text-black mb-3 uppercase tracking-tight">{cat.title}</h3>
                <p className="text-gray-700 font-bold leading-tight mb-6">
                  {cat.description}
                </p>
                <div className="flex items-center gap-2 text-black font-black text-sm uppercase">
                  <span>Lihat Selengkapnya</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Support Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-black text-white p-10 sm:p-16 border-4 border-black shadow-[12px_12px_0px_0px_rgba(250,204,21,1)] text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-black mb-6 uppercase tracking-tight">MASIH BINGUNG?</h2>
          <p className="text-zinc-400 font-bold text-lg mb-10 max-w-xl mx-auto">
            Tim support kami siap membantu 24/7 untuk memastikan perjalanan sehatmu berjalan lancar.
          </p>
          <a 
            href="mailto:sikalori@gmail.com"
            className="inline-block bg-yellow-400 text-black px-10 py-5 font-black text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            HUBUNGI SUPPORT
          </a>
        </motion.div>
      </div>
    </div>
  );
}
