"use client";

import React, { useState, useRef } from "react";
import { motion, Variants } from "framer-motion";
import emailjs from "@emailjs/browser";
import { useLoading } from "@/context/LoadingContext";
import { TextScramble } from "@/components/ui/text-scramble";
import { Mail, MessageCircle, Send, Sparkles, MapPin } from "lucide-react";

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
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
        damping: 15,
      },
    },
  };

  return (
    <section className="min-h-screen bg-white text-black pt-32 pb-20 md:pt-48 md:pb-32 px-4 sm:px-6 lg:px-20 overflow-hidden relative">
      
      {/* Decorative Blob (optional since the user wants it 'interesting') */}
      <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-5%] w-[300px] h-[300px] bg-yellow-400/10 rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={!globalLoading ? "visible" : "hidden"}
        className="max-w-7xl mx-auto relative z-10"
      >
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* LEFT COLUMN: Info & Message */}
          <div className="space-y-10">
            <motion.div variants={itemVariants} className="space-y-6">
                <div className="inline-block bg-black text-white px-4 py-1 font-black text-xs uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]">
                    Mari Ngobrol
                </div>
                <h1 className="text-5xl sm:text-7xl lg:text-[7rem] font-black leading-[0.85] tracking-tighter text-black uppercase">
                    Punya <br />
                    <span className="inline-block bg-[#FFC700] text-black px-6 py-2 mt-4 border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] italic text-4xl sm:text-6xl">
                      PERTANYAAN?
                    </span>
                </h1>
                <p className="text-xl font-bold text-black leading-relaxed max-w-lg border-l-8 border-green-500 pl-6 h-auto">
                    Tim Sikalori selalu siap dengerin masukan, pertanyaan, atau cuma sekedar say hi. Kami bakal balas pesan Anda secepat kilat!
                </p>
            </motion.div>

            {/* Quick Contact Cards */}
            <div className="grid sm:grid-cols-2 gap-6">
                <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5, rotate: -1 }}
                    className="bg-blue-50 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group"
                >
                    <Mail className="w-8 h-8 mb-4 text-blue-500 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-black uppercase mb-1">Email</h3>
                    <p className="font-bold text-gray-600">sikalori@gmail.com</p>
                </motion.div>

                <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5, rotate: 1 }}
                    className="bg-green-50 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group"
                >
                    <MessageCircle className="w-8 h-8 mb-4 text-green-500 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-black uppercase mb-1">WhatsApp</h3>
                    <p className="font-bold text-gray-600">0821-2857-3839</p>
                </motion.div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Form */}
          <motion.div 
            variants={itemVariants}
            className="relative"
          >
            <div className="absolute inset-0 bg-black translate-x-4 translate-y-4 -z-10 border-4 border-black" />
            <form
              ref={form}
              onSubmit={sendEmail}
              className="bg-white border-4 border-black p-8 sm:p-12 space-y-8"
            >
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-wider block">Nama Lengkap</label>
                <input
                  type="text"
                  name="user_name"
                  required
                  placeholder="Siapa nama Anda?"
                  className="w-full bg-transparent border-b-8 border-black p-0 py-4 text-xl font-bold focus:outline-none focus:border-yellow-400 placeholder:text-gray-300 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-wider block">Alamat Email</label>
                <input
                  type="email"
                  name="user_email"
                  required
                  placeholder="email@anda.com"
                  className="w-full bg-transparent border-b-8 border-black p-0 py-4 text-xl font-bold focus:outline-none focus:border-green-400 placeholder:text-gray-300 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-wider block">Pesan Anda</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Tulis pesan Anda di sini..."
                  className="w-full bg-transparent border-b-8 border-black p-0 py-4 text-xl font-bold focus:outline-none focus:border-purple-400 placeholder:text-gray-300 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending" || status === "success"}
                className="w-full bg-black text-white px-8 py-5 border-4 border-black font-black text-xl uppercase italic shadow-[8px_8px_0px_0px_rgba(250,204,21,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3"
              >
                {status === "sending"
                  ? ( <span className="animate-pulse">Mengirim...</span> )
                  : status === "success"
                    ? ( <>Terkirim <Sparkles className="w-6 h-6 text-yellow-400" /></> )
                    : ( <>Kirim Pesan <Send className="w-6 h-6" /></> )}
              </button>

              {/* Status Notifications */}
              {status === "error" && (
                <div className="bg-red-500 text-white p-4 border-4 border-black font-black uppercase text-center text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {errorMessage || "Oops! Gagal mengirim."}
                </div>
              )}
              {status === "success" && (
                <div className="bg-green-500 text-white p-4 border-4 border-black font-black uppercase text-center text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  Berhasil! Pesan Anda sudah kami terima.
                </div>
              )}
            </form>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}
