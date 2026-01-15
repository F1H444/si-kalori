"use client";

import { motion } from "framer-motion";
import { Shield, Eye, Lock, Share2, UserCheck, Bell } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      icon: Eye,
      title: "Informasi yang Kami Kumpulkan",
      content: "Kami mengumpulkan data yang Anda berikan secara sukarela, termasuk nama, alamat email, dan informasi profil saat pendaftaran. Selain itu, kami memproses data visual berupa foto makanan atau minuman yang Anda unggah untuk keperluan analisis nutrisi oleh teknologi AI kami."
    },
    {
      icon: Shield,
      title: "Dasar Hukum Pemrosesan",
      content: "Kami memproses data Anda berdasarkan persetujuan eksplisit Anda saat menggunakan layanan kami. Pemrosesan ini diperlukan untuk memenuhi fungsionalitas utama aplikasi Sikalori dalam menghitung estimasi nutrisi secara personal."
    },
    {
      icon: Lock,
      title: "Keamanan & Penyimpanan",
      content: "Data Anda disimpan secara aman menggunakan enkripsi tingkat tinggi di infrastruktur cloud kami. Kami menerapkan prosedur teknis dan organisasi yang ketat untuk mencegah akses, perubahan, atau penghapusan data secara tidak sah."
    },
    {
      icon: Share2,
      title: "Berbagi Informasi",
      content: "Sikalori tidak menjual data pribadi Anda kepada pihak ketiga. Kami hanya membagikan data dengan mitra layanan pihak ketiga (seperti penyedia infrastruktur cloud) yang terikat kontrak kerahasiaan untuk menunjang operasional aplikasi kami."
    },
    {
      icon: UserCheck,
      title: "Hak-Hak Anda",
      content: "Sebagai pengguna, Anda memiliki hak penuh untuk mengakses, memperbaiki, atau meminta penghapusan data pribadi Anda kapan saja melalui pengaturan akun atau dengan menghubungi tim support kami."
    },
    {
      icon: Bell,
      title: "Perubahan Kebijakan",
      content: "Kami dapat memperbarui kebijakan privasi ini secara berkala. Perubahan material akan diinformasikan melalui notifikasi dalam aplikasi atau email terdaftar untuk memastikan Anda tetap terinformasi."
    }
  ];

  return (
    <div className="bg-zinc-50 min-h-screen pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black text-white p-12 mb-16 border-8 border-black shadow-[16px_16px_0px_0px_rgba(250,204,21,1)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 -translate-y-16 translate-x-16 rotate-45 opacity-20" />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-1 font-black uppercase text-xs mb-6"
          >
            <Shield className="w-4 h-4" />
            Legal Document
          </motion.div>
          <h1 className="text-6xl sm:text-8xl font-black leading-none tracking-tighter mb-4">
            KEBIJAKAN <br /> <span className="text-yellow-400">PRIVASI</span>
          </h1>
          <p className="text-zinc-400 font-bold max-w-xl text-lg italic">
            "Kami menghargai privasi Anda sama seperti kami menghargai kesehatan Anda."
          </p>
        </motion.div>

        {/* Content Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-50 transition-colors"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-black text-white flex items-center justify-center border-2 border-black group">
                    <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-black mb-3 uppercase tracking-tight">
                      {section.title}
                    </h2>
                    <p className="text-gray-700 font-bold leading-relaxed text-sm">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Contact Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="mt-16 bg-white border-4 border-black p-8 text-center"
        >
          <p className="text-lg font-black text-black mb-4">Punya pertanyaan lebih lanjut mengenai data Anda?</p>
          <a 
            href="mailto:sikalori@gmail.com"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 font-black uppercase hover:bg-yellow-400 hover:text-black transition-all border-4 border-black shadow-[6px_6px_0px_0px_rgba(250,204,21,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            Hubungi Tim Privasi Kami
          </a>
        </motion.div>
      </div>
    </div>
  );
}
