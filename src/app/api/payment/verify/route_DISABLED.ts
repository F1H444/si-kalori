import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return NextResponse.json({
    message: "Selamat! Semua fitur SiKalori sekarang gratis untuk semua pengguna.",
    free: true,
    premium: true,
    features: [
      "Unlimited Scan Makanan",
      "Analisis Nutrisi Detail",
      "Tracking Progress Mingguan",
      "Support 24/7",
      "Tanpa Iklan"
    ]
  }, { status: 200 });
}