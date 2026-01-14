"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Key,
  User,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Declare Google Sign-In types
declare global {
  interface Window {
    google: any;
  }
}

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();

  // --- Animation Variants ---
  const containerVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    initial: { y: 15, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  };

  const handleGoogleResponse = useCallback(
    async (response: any) => {
      setLoading(true);
      setError("");
      try {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.credential,
        });

        if (error) {
          setError(error.message);
          throw error;
        }

        if (data.user) {
          // Profile is auto-created by database trigger
          // Logout user to prevent auto-login after register
          await supabase.auth.signOut();

          // Redirect to login page
          router.replace("/login");
        }
      } catch (error: any) {
        setLoading(false);
      }
    },
    [router],
  );

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        // Profile is auto-created by database trigger
        // Logout user to prevent auto-login after register
        await supabase.auth.signOut();

        // Redirect to login page
        router.replace("/login");
      }
    } catch (err: any) {
      setError(err.message || "Gagal mendaftar. Coba lagi ya!");
      setLoading(false);
    }
  };

  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "947157028356-ijdk5tmms7acg41nqc2vtk1shtirmlk8.apps.googleusercontent.com";

    const loadGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
          ux_mode: "popup",
        });

        const container = document.getElementById("google-button-container");
        if (container) {
          // Clear any existing buttons to prevent duplicates
          container.innerHTML = "";

          window.google.accounts.id.renderButton(container, {
            theme: "filled_black",
            size: "large",
            width: container.offsetWidth, // Use actual container width
            text: "signup_with",
            shape: "square",
          });
        }
      }
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = loadGoogle;
    document.body.appendChild(script);

    return () => {
      const scriptTag = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]',
      );
      if (scriptTag) document.body.removeChild(scriptTag);
    };
  }, [handleGoogleResponse]);

  return (
    <div className="min-h-screen bg-[#FFDE59] flex items-center justify-center p-4 md:p-8 font-mono">
      <motion.div
        className="w-full max-w-4xl"
        initial="initial"
        animate="animate"
        variants={containerVariants}
      >
        {/* Tombol Back */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white border-4 border-black px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <ArrowLeft size={16} strokeWidth={3} /> Balik Lagi
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white border-[8px] border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row overflow-hidden relative min-h-[500px]">
          {/* Loading Overlay */}
          <AnimatePresence>
            {loading && (
              <motion.div
                className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Loader2
                  className="animate-spin text-black mb-4"
                  size={48}
                  strokeWidth={3}
                />
                <p className="font-black uppercase italic tracking-widest text-sm">
                  Sabar ya, lagi diproses...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sisi Kiri: Branding */}
          <div className="bg-black text-white p-8 md:p-12 flex flex-col justify-between md:w-[45%] border-b-8 md:border-b-0 md:border-r-8 border-black">
            <div>
              <div className="bg-yellow-400 text-black inline-flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase mb-8 border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                <ShieldCheck size={14} strokeWidth={3} /> Daftar Gratis
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black italic tracking-tighter leading-none mb-6">
                SIKALORI
              </h1>
              <p className="text-sm font-black uppercase leading-tight text-yellow-400 max-w-[220px]">
                Daftar sekarang dan mulai perjalanan hidup sehatmu!
              </p>
            </div>

            <div className="mt-12 hidden md:block">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                &copy; {currentYear} SIKALORI
              </p>
            </div>
          </div>

          {/* Sisi Kanan: Form */}
          <div className="p-8 md:p-12 md:w-[55%] flex flex-col justify-center bg-white">
            <form onSubmit={handleEmailRegister} className="space-y-5">
              <motion.div variants={itemVariants} className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest block">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                    size={18}
                    strokeWidth={3}
                  />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="masukkan nama lengkap"
                    className="w-full border-4 border-black p-4 pl-12 font-black focus:outline-none focus:bg-yellow-50 transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-sm placeholder:text-gray-400"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest block">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                    size={18}
                    strokeWidth={3}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="masukkan email"
                    className="w-full border-4 border-black p-4 pl-12 font-black focus:outline-none focus:bg-yellow-50 transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-sm placeholder:text-gray-400"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest block">
                  Password
                </label>
                <div className="relative">
                  <Key
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                    size={18}
                    strokeWidth={3}
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="buat password"
                    className="w-full border-4 border-black p-4 pl-12 font-black focus:outline-none focus:bg-yellow-50 transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-sm"
                  />
                </div>
              </motion.div>

              {error && (
                <motion.p
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-red-100 border-4 border-black p-3 text-xs font-black text-red-600 uppercase italic"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white p-5 font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(255,222,89,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3 group text-sm border-2 border-black"
              >
                DAFTAR SEKARANG{" "}
                <ArrowRight
                  className="group-hover:translate-x-2 transition-transform"
                  size={20}
                  strokeWidth={3}
                />
              </motion.button>
            </form>

            <motion.div
              variants={itemVariants}
              className="flex items-center gap-4 my-8"
            >
              <div className="h-1 flex-1 bg-black"></div>
              <span className="text-xs font-black uppercase italic">Atau</span>
              <div className="h-1 flex-1 bg-black"></div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <div className="w-full border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div
                  id="google-button-container"
                  className="w-full [&>div]:w-full [&>div>div]:w-full [&_iframe]:w-full"
                  style={{ minHeight: "44px" }}
                />
              </div>

              <p className="text-xs font-black uppercase text-center text-black tracking-tight">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 underline decoration-[3px] underline-offset-4 hover:bg-yellow-200 transition-colors px-1"
                >
                  Masuk di sini!
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
