// components/ConditionalNavbar.tsx

"use client"; // Menandakan ini adalah Client Component

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar"; // Impor Navbar Anda yang sudah ada

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Tentukan halaman mana yang tidak boleh menampilkan navbar
  const pathsWithoutNavbar = ["/admin"];

  // Jika pathname saat ini ada di dalam array, jangan render apa-apa (return null)
  if (pathsWithoutNavbar.includes(pathname)) {
    return null;
  }

  // Jika tidak, render Navbar seperti biasa
  return <Navbar />;
}
