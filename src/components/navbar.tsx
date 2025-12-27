"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";

interface User {
  name: string;
  email: string;
  picture?: string;
  isPremium?: boolean;
}

interface NavLink {
  name: string;
  href: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // 1. Definisikan link dasar yang selalu muncul
  const baseLinks: NavLink[] = [
    { name: "Beranda", href: "/" },
    { name: "Tentang", href: "/tentang" },
    { name: "Kontak", href: "/kontak" },
  ];

  // 2. Logika Navigasi Dinamis
  // Jika user ada (login), tambahkan Scan. Jika tidak, pakai link dasar saja.
  const navLinks = user
    ? [...baseLinks, { name: "Scan", href: "/scan" }]
    : baseLinks;

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("user_session");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Invalid user session", e);
        localStorage.removeItem("user_session");
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <>
      <header
        className={`fixed top-0 z-40 w-full py-4 sm:py-6 transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0"
          }`}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative bg-white border-4 sm:border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl sm:rounded-2xl overflow-visible">
            {/* Grid Layout 3-Kolom (Desktop) */}
            <div className="hidden md:grid md:grid-cols-3 md:items-center w-full h-16 sm:h-20 px-6 sm:px-8">
              {/* Kolom 1: Logo */}
              <div className="flex justify-start">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 bg-black text-white border-2 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
                >
                  <div className="w-2 h-2 bg-white" />
                  <span className="text-xs sm:text-sm font-black tracking-[0.2em]">
                    SI KALORI
                  </span>
                </Link>
              </div>

              {/* Kolom 2: Navigasi (Dinamis) */}
              <nav className="flex items-center justify-center gap-8 lg:gap-12">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`font-black text-base lg:text-lg transition-colors duration-200 ${link.name === "Scan"
                      ? "text-black underline decoration-4 underline-offset-4 hover:text-yellow-600" // Styling khusus Scan biar beda dikit
                      : "text-black hover:text-yellow-500"
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Kolom 3: User Profile / CTA */}
              <div className="flex justify-end items-center gap-4 relative">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-400 border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
                    >
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name}
                          className="w-8 h-8 rounded-full border border-black"
                        />
                      ) : (
                        <UserIcon size={20} />
                      )}
                      <span className="text-sm truncate max-w-[100px]">
                        {user.name.split(" ")[0]}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 top-full mt-4 w-72 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 z-[60]">
                        {/* User Info */}
                        <div className="mb-4 pb-4 border-b-2 border-black">
                          <p className="font-black text-lg truncate">{user.name}</p>
                          <p className="text-xs text-gray-600 truncate">{user.email}</p>
                        </div>

                        {/* Status */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm">Status:</span>
                            {user.isPremium ? (
                              <span className="bg-black text-yellow-400 text-xs font-black px-2 py-1 flex items-center gap-1">
                                PREMIUM <span className="text-yellow-400">👑</span>
                              </span>
                            ) : (
                              <span className="bg-gray-200 text-gray-600 text-xs font-black px-2 py-1">
                                FREE
                              </span>
                            )}
                          </div>

                          {!user.isPremium && (
                            <Link
                              href="/payment"
                              className="block w-full text-center bg-[#FF0080] text-white font-black text-sm py-2 border-2 border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
                            >
                              UPGRADE SEKARANG ⚡
                            </Link>
                          )}
                        </div>

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-2 p-2 bg-red-500 text-white font-bold border-2 border-black hover:bg-red-600 transition-all"
                        >
                          <LogOut size={16} strokeWidth={3} />
                          KELUAR
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={"/login"}>
                    <button className="group relative px-6 py-3 sm:px-8 sm:py-4 bg-black text-white font-black text-sm sm:text-base border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all duration-150">
                      MULAI GRATIS
                    </button>
                  </Link>
                )}
              </div>
            </div>

            {/* Layout Mobile */}
            <div className="md:hidden flex items-center justify-between w-full h-16 sm:h-20 px-4 sm:px-6">
              <div className="flex-shrink-0">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 bg-black text-white border-2 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="w-2 h-2 bg-white" />
                  <span className="text-xs sm:text-sm font-black tracking-[0.2em]">
                    SI KALORI
                  </span>
                </Link>
              </div>

              <button
                onClick={toggleMobileMenu}
                className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-white border-2 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
              >
                <Menu
                  className="w-6 h-6 sm:w-8 sm:h-8 text-black"
                  strokeWidth={3}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay Mobile Menu */}
      <div
        className={`fixed inset-0 z-50 bg-black transition-all duration-500 ease-in-out ${isMobileMenuOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20 sm:h-24">
            <Link
              href="/"
              onClick={toggleMobileMenu}
              className="flex items-center gap-2 px-3 py-2 bg-white text-black border-2 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)]"
            >
              <div className="w-2 h-2 bg-black" />
              <span className="text-xs sm:text-sm font-black tracking-[0.2em]">
                SI KALORI
              </span>
            </Link>
            <button
              onClick={toggleMobileMenu}
              className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-black border-2 sm:border-4 border-white shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={3} />
            </button>
          </div>

          <nav className="flex flex-col items-center justify-center gap-8 mt-16 sm:mt-24">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={toggleMobileMenu}
                className={`text-4xl sm:text-6xl font-black text-white transition-colors duration-200 ${link.name === "Scan"
                  ? "text-yellow-400"
                  : "hover:text-yellow-400"
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <div className="flex flex-col items-center gap-4 mt-8">
                <div className="flex items-center gap-3 px-6 py-3 bg-yellow-400 border-4 border-white text-black font-black text-xl">
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span>Halo, {user.name.split(" ")[0]}</span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                  className="text-red-500 font-black text-xl underline decoration-4 underline-offset-4"
                >
                  KELUAR
                </button>
              </div>
            ) : (
              <button className="group relative mt-8 px-10 py-5 bg-white text-black font-black text-xl sm:text-2xl border-2 sm:border-4 border-black shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-[6px] active:translate-y-[6px] transition-all duration-150">
                <Link href={"/login"} onClick={toggleMobileMenu}>
                  MULAI GRATIS
                </Link>
              </button>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
