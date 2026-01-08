// components/ConditionalFooter.tsx

"use client"; // Menandakan ini adalah Client Component

import { usePathname } from "next/navigation";
import Footer from "@/components/footer"; // Impor Footer Anda yang sudah ada

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Tentukan halaman mana yang tidak boleh menampilkan footer
  const pathsWithoutFooter = ["/login"];

  // Jika pathname saat ini ada di dalam array, jangan render apa-apa (return null)
  if (pathsWithoutFooter.includes(pathname)) {
    return null;
  }

  // Jika tidak, render Footer seperti biasa
  return <Footer />;
}
