"use client";

import { useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Crown,
  LayoutDashboard,
  Settings,
  ChevronDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import NextImage from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  name: string;
  email: string;
  isPremium?: boolean;
}

interface NavLink {
  name: string;
  href: string;
}

interface NavbarProps {
  initialUser?: User | null;
}

export default function Navbar({ initialUser = null }: NavbarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(initialUser === null);
  const [scrolled, setScrolled] = useState(false);

  const baseLinks: NavLink[] = [
    { name: "Beranda", href: "/" },
    { name: "Tentang", href: "/tentang" },
    { name: "Kontak", href: "/kontak" },
  ];

  const navLinks = user
    ? [...baseLinks, { name: "Dashboard", href: "/dashboard" }]
    : baseLinks;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    let isSubscribed = true;

    const fetchProfile = async (userId: string, email?: string) => {
      try {
        const { data: profile, error } = await supabase
          .from("users")
          .select("full_name, email, is_premium")
          .eq("id", userId)
          .single();

        if (!isSubscribed) return;

        if (profile) {
          setUser({
            name: profile.full_name || email || "User",
            email: profile.email || email || "",
            isPremium: profile.is_premium || false,
          });
        } else {
          // If no profile found, still show name from auth
          setUser({
            name: email?.split("@")[0] || "User",
            email: email || "",
            isPremium: false,
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    const checkAuth = async () => {
      // If we already have initialUser, we don't need to check immediately
      // unless onAuthStateChange triggers. This speeds up first interaction.
      if (initialUser) {
        setLoading(false);
        // Set session flag even if initialUser is provided
        if (typeof window !== "undefined") {
          sessionStorage.setItem("sikalori_session_active", "true");
        }
        return;
      }

      // Check for session flag in sessionStorage to enforce auto-logout on new tab/browser
      if (typeof window !== "undefined") {
        const isSessionActive = sessionStorage.getItem("sikalori_session_active");
        
        if (!isSessionActive) {
          // If no flag, it's a new tab/browser session. Clear local auth.
          await supabase.auth.signOut({ scope: 'local' });
          setUser(null);
          setLoading(false);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!isSubscribed) return;

      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email);
        // Set flag if session is found
        sessionStorage.setItem("sikalori_session_active", "true");
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isSubscribed) return;

      if (session?.user) {
        // If it's a new login or session refresh, update profile
        await fetchProfile(session.user.id, session.user.email);
        
        // Also ensure flag is set on valid sign-in
        if (event === "SIGNED_IN") {
          sessionStorage.setItem("sikalori_session_active", "true");
        }
      } else {
        setUser(null);
        setLoading(false);
        // Clear flag on sign out
        sessionStorage.removeItem("sikalori_session_active");
      }
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [initialUser]);

  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      console.log("Logout triggered - Clearing session...");
      setIsDropdownOpen(false);
      
      // 1. Sign out from Supabase
      await supabase.auth.signOut();
      
      // 2. Clear all possible storage remnants
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear cookies related to supabase
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      }
      
      // 3. Reset local state immediately
      setUser(null);
      setLoading(false);
      
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      // 4. Force hard reload to home to clear server-side initialUser prop
      window.location.href = "/";
    }
  };

  // IMPORTANT: We still want to show a placeholder or nothing if not mounted to avoid hydration mismatch
  // but since we are passing initialUser, we can render the SHELL on the server.
  // However, the "mounted" check is used for Framer Motion and Scroll events.
  // Let's make it smarter: show nothing only if we don't have initialUser and not mounted.
  if (!mounted && !initialUser) return null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "pt-2 sm:pt-4" : "pt-4 sm:pt-8"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav
            className={`relative transition-all duration-500 border-[3px] border-black rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-visible ${
              scrolled
                ? "bg-white/80 backdrop-blur-xl py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                : "bg-white py-4"
            }`}
          >
            {/* GRID CONTAINER UNTUK MEMASTIKAN TENGAH PRESISI */}
            <div className="flex items-center justify-between px-6 sm:px-10 h-14 sm:h-16">
              {/* 1. BAGIAN KIRI: LOGO */}
              <div className="flex-1 flex justify-start">
                <Link
                  href="/"
                  className="group flex items-center px-5 py-2 bg-black text-white border-2 border-black rounded-full hover:bg-yellow-400 hover:text-black transition-all active:translate-y-1"
                >
                  <span className="text-xs sm:text-sm font-black tracking-tighter uppercase italic">
                    SI KALORI
                  </span>
                </Link>
              </div>

              {/* 2. BAGIAN TENGAH: NAV LINKS (Desktop Only) */}
              <div className="hidden lg:flex flex-none items-center justify-center">
                <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-full border-2 border-black/5">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                        pathname === link.href
                          ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(253,224,71,1)]"
                          : "hover:bg-black/5 text-gray-600"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* 3. BAGIAN KANAN: ACTIONS */}
              <div className="flex-1 flex items-center justify-end gap-3">
                {loading ? (
                  <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                ) : user ? (
                  <div className="flex items-center gap-2">
                    {user.isPremium && (
                      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-100 border-2 border-green-600 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <Crown size={12} strokeWidth={3} />
                        Premium
                      </div>
                    )}

                    <div className="relative">
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 p-1.5 bg-white border-2 border-black rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                      >
                        <div className="w-9 h-9 bg-yellow-400 border-2 border-black rounded-full overflow-hidden relative flex items-center justify-center">
                          <UserIcon className="p-2 w-full h-full" />
                        </div>
                        <span className="hidden sm:block text-xs font-black uppercase pr-2 pl-1">
                          {user.name.split(" ")[0]}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`hidden sm:block transition-transform duration-300 mr-2 ${isDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            className="absolute right-0 top-[calc(100%+20px)] w-72 bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-6 z-50"
                          >
                            {/* Header dengan Divider Brutal */}
                            <div className="flex flex-col items-center text-center pb-5 mb-5 border-b-4 border-black/10">
                              <p className="font-black text-xl uppercase tracking-tighter leading-tight text-black">
                                {user.name}
                              </p>
                              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md border border-black/5 leading-none">
                                {user.email}
                              </p>
                            </div>

                            <div className="space-y-3">
                              <DropdownItem
                                href="/dashboard"
                                icon={<LayoutDashboard size={20} />}
                                label="Dashboard"
                              />
                              <DropdownItem
                                href="/settings"
                                icon={<Settings size={20} />}
                                label="Pengaturan"
                              />

                              {/* Tombol Premium Brutal */}
                              <Link
                                href="/premium"
                                className={`flex items-center justify-between p-4 border-4 border-black rounded-2xl font-black text-sm uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all mt-6 ${
                                  user.isPremium
                                    ? "bg-green-400 text-black border-green-600"
                                    : "bg-yellow-400 text-black"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <Crown size={18} strokeWidth={3} />
                                  {user.isPremium
                                    ? "Premium Aktif"
                                    : "Upgrade"}
                                </span>
                              </Link>

                              {/* Logout dengan gaya elegan tapi brutal */}
                              <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 p-4 text-red-500 bg-red-50 hover:bg-black hover:text-white rounded-2xl transition-all font-black text-xs uppercase mt-3 border-2 border-transparent hover:border-black active:scale-95 cursor-pointer relative z-[60]"
                              >
                                <LogOut size={16} strokeWidth={3} /> Keluar
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : (
                  <Link href="/login">
                    <button className="px-6 py-2.5 bg-yellow-400 text-black font-black text-xs sm:text-sm border-2 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase tracking-widest active:scale-95">
                      Masuk
                    </button>
                  </Link>
                )}

                {/* MOBILE TOGGLE */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden w-11 h-11 flex items-center justify-center bg-black text-white rounded-full border-2 border-black transition-all active:scale-90"
                >
                  {isMobileMenuOpen ? (
                    <X size={20} strokeWidth={3} />
                  ) : (
                    <Menu size={20} strokeWidth={3} />
                  )}
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* FULLSCREEN MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-white p-6 lg:hidden flex flex-col"
          >
            <div className="flex justify-between items-center mb-10">
              <div className="px-5 py-2 bg-black text-white font-black italic rounded-full text-sm">
                SI KALORI
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-12 h-12 flex items-center justify-center bg-yellow-400 border-2 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-4xl font-black uppercase tracking-tighter transition-all hover:text-yellow-500 ${
                      pathname === link.href
                        ? "text-yellow-500 underline decoration-[6px] underline-offset-8"
                        : "text-black"
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto pb-10">
              {user ? (
                <div className="p-6 bg-gray-100 rounded-[2rem] border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-2 border-black overflow-hidden relative bg-white flex items-center justify-center">
                    <UserIcon className="p-3 w-full h-full" />
                  </div>
                  <div>
                    <p className="font-black text-lg leading-none uppercase">
                      {user.name}
                    </p>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-red-500 font-bold text-xs underline mt-1 cursor-pointer"
                    >
                      LOGOUT SEKARANG
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full py-5 bg-black text-white font-black text-xl rounded-full shadow-[8px_8px_0px_0px_rgba(253,224,71,1)]">
                    MULAI GRATIS
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DropdownItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 hover:bg-black hover:text-white rounded-2xl transition-all font-bold text-xs uppercase border-2 border-transparent hover:border-black group"
    >
      <span className="text-gray-400 group-hover:text-yellow-400">{icon}</span>
      {label}
    </Link>
  );
}
