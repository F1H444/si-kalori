# SIKALORI - Smart Nutrition Tracker

Sikalori adalah aplikasi pemantau nutrisi harian berbasis web yang dirancang untuk kecepatan, keamanan, dan kemudahan penggunaan. Dibangun dengan teknologi modern Next.js 15 dan Supabase.

## Fitur Unggulan

- **Analisis AI Secepat Kilat**: Dapatkan wawasan nutrisi instan.
- **Navigasi Super Cepat**: Perpindahan halaman instan tanpa reload.
- **Keamanan Terjamin**: Terintegrasi dengan Google Auth dan Middleware proteksi rute.
- **Desain Premium**: Antarmuka Neo-Brutalist yang unik dan responsif.

## Teknologi

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **Icons**: Lucide React
- **Deployment**: Vercel (Recommended)

## Persiapan Instalasi

Pastikan Anda telah menginstal Node.js versi terbaru.

1.  **Clone Repository**

    ```bash
    git clone https://github.com/username/sikalori.git
    cd sikalori
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    # atau
    yarn install
    # atau
    pnpm install
    ```

3.  **Konfigurasi Environment**
    Salin file `.env.example` menjadi `.env.local` dan isi kredensial yang diperlukan.

    ```bash
    cp .env.example .env.local
    ```

4.  **Jalankan Development Server**
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## Struktur Project

```
src/
├── app/              # App Router (Pages & Layouts)
│   ├── (app)/        # Protected Routes (Dashboard, Scan, History)
│   ├── (minimal)/    # Minimal Routes (Login, Onboarding)
│   └── actions/      # Server Actions
├── components/       # Reusable UI Components
├── lib/              # Utilities & Libraries (Supabase, Helpers)
└── types/            # TypeScript Definitions
```

## Kontribusi

Silakan buat _Pull Request_ untuk berkontribusi pada pengembangan Sikalori.

## Lisensi

[MIT](LICENSE)
