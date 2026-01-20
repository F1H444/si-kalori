# SIKALORI - Smart Nutrition Tracker

<div align="center">

![Screenshot_14-1-2026_232636_sikalori vercel app](https://github.com/user-attachments/assets/33297ee5-8195-4509-9671-843a64375d83)

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-blue?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**Pantau nutrisi harianmu dengan Presisi, Kecepatan, dan Gaya.**  
_Bukan sekadar tracker biasa. Ini adalah revolusi gaya hidup sehat._

[Demo Website](https://si-kalori.vercel.app) · [Laporkan Bug](https://github.com/F1H444/si-kalori/issues)

</div>

---

## 🚀 Mengapa Sikalori?

Sikalori tidak hanya mencatat kalori. Kami menggabungkan **Kecerdasan Buatan (AI)** dengan desain **Neo-Brutalist** yang berani untuk memberikan pengalaman pengguna yang tak terlupakan.

### ✨ Fitur Unggulan

- 🥗 **Analisis AI Instan**: Potret makananmu, biarkan AI kami menghitung kalori, protein, lemak, dan karbohidrat dalam hitungan detik.
- ⚡ **Navigasi Kilat**: Dibangun di atas Next.js 15 dengan komponen `<Link>`, perpindahan halaman terasa instan tanpa reload.
- 🔒 **Keamanan Tingkat Tinggi**: Data pengguna diamankan dengan Supabase Auth + Middleware Protection. Tak ada akses tanpa izin.
- 🎨 **Desain Premium**: Antarmuka modern, responsif, dan penuh karakter. Membosankan itu dilarang di sini.
- 📱 **Fully Responsive**: Tampil sempurna di Smartphone, Tablet, maupun Desktop.

---

## 🛠️ Teknologi di Balik Layar

Kami menggunakan tumpukan teknologi (Tech Stack) termutakhir untuk performa maksimal:

| Kategori      | Teknologi                   | Keunggulan                              |
| :------------ | :-------------------------- | :-------------------------------------- |
| **Framework** | **Next.js 16 (App Router)** | SSR, Server Actions, & SEO Optimization |
| **Database**  | **Supabase (PostgreSQL)**   | Real-time, Secure RLS, & Auth           |
| **Styling**   | **Tailwind CSS 4**          | Utility-first, Custom Design System     |
| **Bahasa**    | **TypeScript**              | Type Safety & Clean Code                |
| **AI Engine** | **Groq SDK (Llama)**        | Analisis citra makanan super cepat      |
| **Icons**     | **Lucide React**            | Ikon vektor ringan & modern             |

---

## 📂 Struktur Project

Berikut adalah gambaran umum struktur kode Sikalori untuk memudahkan Anda memahami alur aplikasi:

```bash
src/
├── app/                  # App Router: Inti dari routing Next.js
│   ├── (main)/           # Landing Page & Halaman Publik
│   │   ├── (beranda)/    # Hero section, fitur, dll
│   │   ├── tentang/      # Informasi project & tim
│   │   └── kontak/       # Form kontak
│   ├── (app)/            # Halaman Aplikasi (Perlu Login)
│   │   ├── dashboard/    # Ringkasan nutrisi harian
│   │   ├── scan/         # Fitur utama scan makanan AI
│   │   └── history/      # Riwayat konsumsi
│   ├── (minimal)/        # Halaman dengan Layout Minimal
│   │   ├── login/        # Halaman masuk (Google Auth)
│   │   └── onboarding/   # Pengumpulan data awal user
│   ├── actions/          # Server Actions (Backend Logic)
│   └── api/              # API Endpoints (Analyze Food, dll)
├── components/           # Komponen UI (Navbar, Sidebar, Button, dll)
├── lib/                  # Logika Bisnis & Utilitas
│   ├── supabase.ts       # Konfigurasi Client Database
│   └── ai-prompt.ts      # Prompt Engineering untuk AI
└── types/                # TypeScript Interfaces (Type Definitions)
```

---

## 🚀 Masuk ke Tahap Pengembangan

Ikuti langkah mudah ini untuk menjalankan Sikalori di komputer lokal Anda:

### 1. Clone Repository

Pastikan git sudah terinstall, lalu jalankan:

```bash
git clone https://github.com/F1H444/si-kalori.git
cd si-kalori
```

### 2. Install Dependencies

Download semua library yang dibutuhkan (Node.js required):

```bash
npm install
# atau jika menggunakan yarn:
yarn install
```

### 3. Konfigurasi Environment

Salin template konfigurasi `.env.example` ke file aktif `.env.local`:

```bash
cp .env.example .env.local
```

Lalu buka file `.env.local` dan isi dengan kredensial Supabase & Groq Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://proyek-anda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=key-anon-anda
GROQ_API_KEY=key-groq-anda
```

### 4. Jalankan Server Lokal

Nyalakan mesin Sikalori!

```bash
npm run dev
```

Buka browser favorit Anda dan akses: `http://localhost:3000`

---

## 🤝 Kontribusi & Pengembangan

Proyek ini bersifat **Open Source**. Kami sangat menghargai setiap kontribusi untuk membuat Sikalori lebih baik.

1.  **Fork** repository ini.
2.  Buat **Branch** fitur baru (`git checkout -b fitur-keren`).
3.  **Commit** perubahan Anda dengan pesan yang jelas (`git commit -m 'Menambah fitur dark mode'`).
4.  **Push** ke branch Anda (`git push origin fitur-keren`).
5.  Buat **Pull Request** di GitHub.

---



