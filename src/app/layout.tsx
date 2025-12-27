// app/layout.tsx

import type { Metadata } from "next";
import { Lexend, Geist_Mono } from "next/font/google";
import "./globals.css";
// Impor komponen kondisional yang baru
import ConditionalFooter from "@/components/ConditionalFooter";
import ConditionalNavbar from "@/components/ConditionalNavbar";


const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SI KALORI",
  description: "Website Cek Kalori",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lexend.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <ConditionalNavbar />
        {children}
        {/* Ganti baris ini */}
        {/* <Footer /> */}
        {/* Menjadi ini */}
        <ConditionalFooter />
      </body>
    </html>
  );
}
