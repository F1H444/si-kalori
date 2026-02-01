import type { Metadata } from "next";
import { Lexend, Geist_Mono } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SI KALORI",
  description: "Website Cek Kalori",
  icons: {
    icon: "/favicon.ico",
  },
};

import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import { LoadingProvider } from "@/context/LoadingContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${lexend.variable} ${geistMono.variable} antialiased font-sans bg-white text-black`}
      >
        <LoadingProvider>
          <Preloader />
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </LoadingProvider>
      </body>
    </html>
  );
}
