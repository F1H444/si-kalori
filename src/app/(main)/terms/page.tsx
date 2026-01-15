"use client";

import { motion } from "framer-motion";
import { FileText, CreditCard, AlertTriangle, Scale, CheckCircle2, XCircle } from "lucide-react";

export default function TermsPage() {
  const terms = [
    {
      icon: CheckCircle2,
      title: "Penerimaan Ketentuan",
      content: "Dengan mengakses atau menggunakan layanan Sikalori, Anda secara sah setuju untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak setuju, mohon untuk tidak melanjutkan penggunaan layanan kami."
    },
    {
      icon: CreditCard,
      title: "Langganan & Pembayaran",
      content: "Fitur Premium Sikalori memerlukan pembayaran berlangganan. Semua transaksi bersifat final dan tidak dapat dikembalikan (non-refundable), kecuali ditentukan lain oleh hukum yang berlaku atau kebijakan internal kami."
    },
    {
      icon: AlertTriangle,
      title: "Penafian Medis",
      content: "Sikalori adalah alat bantu tracking nutrisi berbasis AI, bukan pengganti saran medis profesional. Hasil analisis nutrisi adalah estimasi dan tidak boleh digunakan untuk mendiagnosis atau mengobati kondisi medis apapun."
    },
    {
      icon: XCircle,
      title: "Aktivitas Terlarang",
      content: "Pengguna dilarang keras melakukan rekayasa balik (reverse engineering), menggunakan bot untuk scraping data, atau mengunggah konten yang melanggar hak kekayaan intelektual orang lain ke platform kami."
    },
    {
      icon: Scale,
      title: "Batasan Tanggung Jawab",
      content: "Sikalori tidak bertanggung jawab atas kerugian tidak langsung atau konsekuensial yang timbul dari ketidakakuratan data AI atau gangguan teknis layanan di luar kendali wajar kami."
    },
    {
      icon: FileText,
      title: "Pengakhiran Akun",
      content: "Kami berhak untuk menangguhkan atau menghapus akun Anda tanpa pemberitahuan jika ditemukan pelanggaran serius terhadap syarat dan ketentuan ini demi menjaga keamanan komunitas Sikalori."
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black text-white p-12 mb-16 border-8 border-black shadow-[16px_16px_0px_0px_rgba(239,68,68,1)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-red-500 -translate-y-16 -translate-x-16 rotate-45 opacity-20" />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-1 font-black uppercase text-xs mb-6"
          >
            <FileText className="w-4 h-4" />
            User Agreement
          </motion.div>
          <h1 className="text-6xl sm:text-8xl font-black leading-none tracking-tighter mb-4">
            SYARAT & <br /> <span className="text-red-500">KETENTUAN</span>
          </h1>
          <p className="text-zinc-400 font-bold max-w-xl text-lg italic">
            "Aturan main yang adil untuk kenyamanan perjalanan sehat Anda."
          </p>
          <div className="mt-8 pt-8 border-t border-zinc-800 text-xs text-zinc-500 font-black">
            VERSI 2.0 • TERAKHIR DIPERBARUI: 15 JANUARI 2026
          </div>
        </motion.div>

        {/* Terms Grid */}
        <div className="space-y-8">
          {terms.map((term, idx) => {
            const Icon = term.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group flex flex-col md:flex-row gap-8 bg-zinc-50 border-4 border-black p-8 hover:bg-white transition-all hover:-translate-y-1"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <Icon className="w-8 h-8" strokeWidth={3} />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-black mb-4 uppercase tracking-tight">
                    {term.title}
                  </h2>
                  <p className="text-xl text-gray-700 font-bold leading-relaxed">
                    {term.content}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Important Disclaimer Card */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 p-10 bg-red-500 text-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="flex items-center gap-4 mb-6">
            <AlertTriangle className="w-10 h-10" strokeWidth={3} />
            <h3 className="text-4xl font-black uppercase tracking-tight">PENTING!</h3>
          </div>
          <p className="text-2xl font-black leading-tight mb-8">
            PENGGUNAAN LAYANAN KAMI BERARTI ANDA MENYETUJUI SELURUH PASAL DI ATAS TANPA TERKECUALI.
          </p>
          <p className="font-bold opacity-90 leading-relaxed italic">
            Sikalori berhak melakukan tindakan hukum yang diperlukan terhadap segala bentuk penyalahgunaan platform yang merugikan perusahaan atau pengguna lainnya.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
