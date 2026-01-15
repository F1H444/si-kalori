"use client";

import React, { useState, useRef } from "react";
import { motion, Variants } from "framer-motion";
import emailjs from "@emailjs/browser";
import { useLoading } from "@/context/LoadingContext";
import { TextScramble } from "@/components/ui/text-scramble";

export default function ContactPage() {
  const { isLoading: globalLoading } = useLoading();
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

    if (!form.current) return;

    emailjs
      .sendForm(serviceId, templateId, form.current, {
        publicKey: publicKey,
      })
      .then(
        () => {
          setStatus("success");
          if (form.current) form.current.reset();
          setTimeout(() => setStatus("idle"), 5000);
        },
        (error) => {
          setStatus("error");
          setErrorMessage(error.text || "Gagal mengirim pesan");
          setTimeout(() => setStatus("idle"), 5000);
        },
      );
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    /* PERUBAHAN DI SINI:
           - pt-32 (mobile) dan md:pt-48 (desktop) memberikan ruang yang sangat cukup untuk Navbar.
           - min-h-screen memastikan halaman minimal setinggi layar.
        */
    <section className="min-h-screen bg-white text-black font-mono selection:bg-black selection:text-white pt-32 pb-20 md:pt-48 md:pb-32">
      <motion.div
        initial="hidden"
        animate={!globalLoading ? "visible" : "hidden"}
        viewport={{ once: true }}
        variants={containerVariants}
        className="w-full max-w-4xl mx-auto px-4 md:px-8 relative z-10"
      >
        {/* Header Section */}
        <motion.header
          variants={itemVariants}
          className="mb-12 md:mb-16 text-center"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="inline-block border-4 border-black bg-white p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(250,204,21,1)] transition-all duration-300 relative overflow-hidden group"
          >
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={!globalLoading ? { scaleX: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.8, ease: "circOut" }}
              className="absolute inset-0 bg-yellow-400 -z-10 origin-left"
            />
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none relative z-10">
              <TextScramble text="Kontak" delay={0.1} /> <br className="md:hidden" />
              <span className="inline-block md:ml-4 group-hover:text-white transition-colors">Kami</span>
            </h1>
          </motion.div>
          <motion.p
            variants={itemVariants}
            className="mt-8 text-lg md:text-xl font-bold text-gray-700 max-w-md mx-auto leading-relaxed"
          >
            Punya pertanyaan atau saran? Kirim pesan dan kami akan membalas
            secepatnya.
          </motion.p>
        </motion.header>

        {/* Contact Form Container */}
        <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
          <motion.form
            ref={form}
            onSubmit={sendEmail}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="border-4 border-black bg-white p-6 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative"
          >
            <div className="space-y-6">
              <motion.div variants={itemVariants}>
                <label className="block text-lg font-black uppercase mb-2">
                  Nama
                </label>
                <input
                  type="text"
                  name="user_name"
                  required
                  className="w-full bg-gray-50 border-4 border-black p-4 font-bold focus:outline-none focus:bg-yellow-50 focus:border-yellow-500 transition-all placeholder:text-gray-400"
                  placeholder="Nama anda"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-lg font-black uppercase mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="user_email"
                  required
                  className="w-full bg-gray-50 border-4 border-black p-4 font-bold focus:outline-none focus:bg-yellow-50 focus:border-yellow-500 transition-all placeholder:text-gray-400"
                  placeholder="email@anda.com"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-lg font-black uppercase mb-2">
                  Pesan
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="w-full bg-gray-50 border-4 border-black p-4 font-bold focus:outline-none focus:bg-yellow-50 focus:border-yellow-500 transition-all placeholder:text-gray-400 resize-none"
                  placeholder="Tulis pesan anda..."
                />
              </motion.div>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={status === "sending" || status === "success"}
                className="w-full bg-black text-white border-4 border-black p-5 text-xl font-black uppercase tracking-widest hover:bg-green-500 hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "sending"
                  ? "MENGIRIM..."
                  : status === "success"
                    ? "✓ TERKIRIM"
                    : "KIRIM PESAN →"}
              </motion.button>

              {/* Status Messages */}
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-100 border-4 border-red-600 text-red-600 p-4 font-black text-center"
                >
                  ✕ {errorMessage}
                </motion.div>
              )}
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-100 border-4 border-green-600 text-green-600 p-4 font-black text-center"
                >
                  ✓ PESAN BERHASIL DIKIRIM!
                </motion.div>
              )}
            </div>
          </motion.form>
        </motion.div>
      </motion.div>
    </section>
  );
}
