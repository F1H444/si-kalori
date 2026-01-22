"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  Mail,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

export default function ForgotPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const containerVariants: Variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim permintaan reset password.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFDE59] flex flex-col items-center justify-center p-4 font-mono relative overflow-hidden">
      {/* Back Button */}
      <div className="w-full max-w-md mb-6 relative z-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-white border-4 border-black px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          <ArrowLeft size={16} strokeWidth={3} /> Kembali ke Login
        </Link>
      </div>

      <motion.div
        className="w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10"
        initial="initial"
        animate="animate"
        variants={containerVariants}
      >
        <AnimatePresence>
          {loading && (
            <motion.div
              className="absolute inset-0 z-50 bg-white/90 backdrop-blur-[2px] flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="animate-spin text-black mb-3" size={40} strokeWidth={3} />
              <p className="font-black uppercase text-xs tracking-widest">
                Mengirim Link...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Section */}
        <div className="bg-black text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <div className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 uppercase border border-white">
              Recovery
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter leading-none mb-4">
            LUPA PASSWORD?
          </h1>

          <p className="text-sm font-bold text-gray-400 uppercase tracking-wide leading-tight mx-auto max-w-xs">
            Jangan panik. Masukkan emailmu dan kami akan kirim link reset.
          </p>
        </div>

        {/* Form Section */}
        <div className="p-6 sm:p-8 space-y-6">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto border-4 border-black box-content">
                <CheckCircle2 className="text-green-600" size={32} strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase">Email Terkirim!</h3>
                <p className="text-sm font-bold text-gray-500 mt-2">
                  Cek inbox (atau folder spam) email <br />
                  <span className="text-black underline">{email}</span>
                </p>
              </div>
              <div className="pt-4">
                 <p className="text-xs text-gray-400 mb-4">Link akan kedaluwarsa dalam 1 jam.</p>
                 <Link
                    href="/login"
                     className="w-full block bg-black text-white p-4 font-black uppercase tracking-widest hover:bg-gray-900 focus:ring-4 focus:ring-yellow-400 transition-all text-center text-sm sm:text-base border-2 border-transparent hover:border-black"
                 >
                    Kembali Login
                 </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-4">
              <motion.div variants={itemVariants} className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest block pl-1">
                  Email Terdaftar
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50 group-focus-within:text-black transition-colors"
                    size={20}
                    strokeWidth={2.5}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-gray-50 border-2 border-black p-4 pl-12 font-bold focus:outline-none focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 rounded-none text-sm sm:text-base"
                  />
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-100 border-2 border-red-500 text-red-600 text-xs font-bold text-center uppercase"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white p-4 font-black uppercase tracking-widest hover:bg-gray-900 focus:ring-4 focus:ring-yellow-400 transition-all flex items-center justify-center gap-2 group text-sm sm:text-base"
              >
                Kirim Link Reset
                <ArrowRight
                  className="group-hover:translate-x-1 transition-transform"
                  size={20}
                  strokeWidth={3}
                />
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
