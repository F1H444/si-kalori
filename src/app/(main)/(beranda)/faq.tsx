"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Plus, Minus, MessageCircle } from "lucide-react";

const faqData = [
  {
    question: "Apakah Sikalori gratis?",
    answer:
      "Yup! Kamu bisa pakai Si Kalori gratis dengan batas 10 scan per hari. Kalau butuh unlimited scan, tinggal upgrade ke Premium (langganan bulanan) dan scan sepuasnya tanpa batas!",
    color: "bg-[#FF5F5F]",
  },
  {
    question: "Gimana cara AI menganalisis makanan?",
    answer:
      "Cukup foto makananmu atau ketik nama menu, AI kami akan langsung menganalisis dan kasih info kalori, protein, karbohidrat, lemak, plus skor kesehatan. Prosesnya cuma beberapa detik!",
    color: "bg-[#4ade80]",
  },
  {
    question: "Mendukung makanan lokal Indonesia nggak?",
    answer:
      "Pastinya! AI kami bisa mengenali berbagai makanan Indonesia, dari Nasi Padang, Gado-Gado, Seblak, sampai minuman kekinian. Coba aja scan makanan favoritmu!",
    color: "bg-[#FFD95A]",
  },
  {
    question: "Bisa buat diet 'Bulking' atau nambah berat badan?",
    answer:
      "Bisa banget! Waktu daftar, kamu bisa pilih goal: turun badan, naik badan, atau maintain. Si Kalori bakal kasih target kalori harian yang sesuai sama goalmu.",
    color: "bg-[#A076FF]",
  },
];

export default function FaqSection() {
  const [mounted, setMounted] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!mounted) return null;

  return (
    <div className="relative bg-white z-0 px-4 sm:px-6 py-16 sm:py-24 lg:py-32 overflow-hidden pt-32">
      <motion.div
        className="relative z-10 max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {/* Header Section */}
        <div className="text-center mb-20 mt-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 mb-8 bg-black text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <HelpCircle className="w-5 h-5 text-[#FFD95A]" strokeWidth={3} />
            <span className="text-xs sm:text-sm font-black tracking-[0.2em]">
              FAQ - TANYA JAWAB
            </span>
          </motion.div>

          <motion.h2
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-black leading-tight uppercase italic"
          >
            Punya <br />
            <span className="bg-black text-white px-4 py-2 not-italic inline-block mt-2">
              Pertanyaan?
            </span>
          </motion.h2>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-6">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div
                  className={`border-4 border-black transition-all duration-300 transform
                    ${
                      isOpen
                        ? "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1 translate-y-1"
                        : "shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1"
                    }`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-center justify-between text-left p-6 sm:p-8 bg-white focus:outline-none"
                  >
                    <span className="text-lg sm:text-xl lg:text-2xl font-black text-black leading-tight pr-4">
                      {item.question}
                    </span>

                    {/* Brutalist Button Indicator */}
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center border-4 border-black transition-all duration-300
                        ${isOpen ? "bg-red-500 rotate-180" : "bg-black group-hover:bg-[#A076FF]"}`}
                    >
                      {isOpen ? (
                        <Minus className="w-6 h-6 text-white" strokeWidth={4} />
                      ) : (
                        <Plus className="w-6 h-6 text-white" strokeWidth={4} />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                        className="overflow-hidden bg-white"
                      >
                        <div className="px-6 pb-8 sm:px-8 sm:pb-10 border-t-4 border-black pt-6">
                          <div
                            className={`p-4 sm:p-6 border-4 border-black ${item.color} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
                          >
                            <p className="text-base sm:text-lg text-black font-bold leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
