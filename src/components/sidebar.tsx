"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Home,
  User as UserIcon,
  Camera,
  Fingerprint,
  History,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function Sidebar({
  forceShow = false,
}: {
  forceShow?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Hide sidebar on root admin page unless forced (for login screen clarity)
  if (pathname === "/admin" && !forceShow) {
    return null;
  }

  const isAdmin = pathname?.startsWith("/admin");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // REUSABLE NAV ITEM COMPONENT (Gaya Neo-Brutalism)
  const NavItem = ({
    href,
    icon,
    label,
    active,
    onClick,
  }: {
    href: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick?: () => void;
  }) => (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 p-4 font-black border-4 border-black transition-all uppercase tracking-tighter ${
        active
          ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1 translate-y-1 shadow-none"
          : `bg-white text-black hover:bg-yellow-300 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1`
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </Link>
  );

  return (
    <>
      {/* Tombol Menu Mobile */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden fixed top-6 right-6 z-50 bg-yellow-400 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Kontainer Sidebar */}
      <aside
        className={`
        fixed md:sticky top-0 inset-y-0 left-0 z-40 w-72 min-w-[288px] bg-white border-r-4 border-black flex flex-col h-screen transition-transform duration-300 ease-in-out shrink-0
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* HEADER */}
        <div className="p-6 border-b-4 border-black bg-black text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2 border-2 border-black">
              <Fingerprint className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tighter uppercase leading-none">
                SIKALORI
              </h2>
              <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mt-1">
                {isAdmin ? "Admin" : "Pengguna"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* NAVIGASI UTAMA */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto pt-8">
          {isAdmin ? (
            // MENU KHUSUS ADMIN
            <>
              <NavItem
                href="/admin?tab=overview"
                icon={<LayoutDashboard size={20} />}
                label="Dashboard"
                active={
                  searchParams.get("tab") === "overview" ||
                  searchParams.get("tab") === null
                }
                onClick={() => setIsMobileOpen(false)}
              />
              <NavItem
                href="/admin?tab=users"
                icon={<Users size={20} />}
                label="Pengguna"
                active={searchParams.get("tab") === "users"}
                onClick={() => setIsMobileOpen(false)}
              />
              <NavItem
                href="/admin?tab=analytics"
                icon={<BarChart3 size={20} />}
                label="Analitik"
                active={searchParams.get("tab") === "analytics"}
                onClick={() => setIsMobileOpen(false)}
              />
              <NavItem
                href="/admin?tab=settings"
                icon={<Settings size={20} />}
                label="Pengaturan"
                active={searchParams.get("tab") === "settings"}
                onClick={() => setIsMobileOpen(false)}
              />
            </>
          ) : (
            // MENU KHUSUS USER
            <>
              <NavItem
                href="/dashboard"
                icon={<Home size={20} />}
                label="Dashboard"
                active={pathname === "/dashboard"}
                onClick={() => setIsMobileOpen(false)}
              />
              <NavItem
                href="/scan"
                icon={<Camera size={20} />}
                label="Scan Menu"
                active={pathname === "/scan"}
                onClick={() => setIsMobileOpen(false)}
              />
              <NavItem
                href="/riwayat"
                icon={<History size={20} />}
                label="Riwayat"
                active={pathname === "/riwayat"}
                onClick={() => setIsMobileOpen(false)}
              />
            </>
          )}
        </nav>

        {/* FOOTER SIDEBAR */}
        <div className="p-4 border-t-4 border-black space-y-3 bg-gray-50">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-3 p-4 bg-yellow-400 text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:bg-yellow-500 transition-all uppercase tracking-tighter"
          >
            <ArrowLeft className="w-5 h-5" />
            Beranda
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-4 bg-red-500 text-white font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:bg-red-600 transition-all uppercase tracking-tighter"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Overlay Gelap untuk Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm cursor-pointer"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
