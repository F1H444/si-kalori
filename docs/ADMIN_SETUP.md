# Cara Menambahkan Admin di SI KALORI

## Opsi 1: Via Email admin@sikalori.com (TERCEPAT)

1. **Buka** `/register` di browser
2. **Daftar** dengan kredensial:
   - Email: `admin@sikalori.com`
   - Password: (pilih password yang aman)
3. **Login** ke `/admin` dengan kredensial tersebut
4. ✅ Otomatis terdeteksi sebagai admin!

---

## Opsi 2: Tambah User Existing ke Tabel Admins

### A. Via Supabase Dashboard (RECOMMENDED)

1. **Buka** [Supabase Dashboard](https://supabase.com/dashboard)
2. **Login** dan pilih project: `qmgobostpmrhxcqfsohp`
3. **Klik** Table Editor → Tabel `admins`
4. **Klik** "Insert" → "Insert row"
5. **Isi data:**
   - `user_id`: [Copy User ID dari tabel `users` atau `auth.users`]
   - `role`: `super_admin`
   - `created_at`: (auto-fill)
6. **Klik** "Save"
7. ✅ Done! User sekarang bisa login ke `/admin`

### B. Via SQL Editor

1. **Buka** Supabase Dashboard → SQL Editor
2. **Cari User ID** dulu:
   ```sql
   SELECT id, email, created_at
   FROM auth.users
   WHERE email = 'YOUR_EMAIL@gmail.com';
   ```
3. **Copy** User ID dari hasil query
4. **Jalankan** query ini (ganti USER_ID):
   ```sql
   INSERT INTO admins (user_id, role, created_at)
   VALUES ('USER_ID_DARI_STEP_3', 'super_admin', NOW());
   ```
5. ✅ Done!

---

## Troubleshooting

### Error: "Akses ditolak. Not in admin list"

- ✅ **Solusi**: Email bukan `admin@sikalori.com` DAN tidak ada di tabel `admins`
- **Action**: Gunakan Opsi 1 atau tambahkan ke tabel `admins` via Opsi 2

### Error: "Foreign key constraint violation"

- ✅ **Solusi**: User ID tidak ada di tabel `users`
- **Action**: Pastikan user sudah register dulu sebelum ditambahkan ke `admins`

### Lupa Email Yang Digunakan?

Cek di Supabase Dashboard → Authentication → Users

---

## Cek Status Admin

Setelah menambahkan admin, verifikasi dengan:

1. **Login** ke `/admin`
2. **Cek** browser console (F12) - lihat log:
   ```
   🔍 [Navbar] Admin Check: { isAdmin: true }
   ```
3. **Dropdown** di navbar seharusnya hanya ada "Dashboard" dan "Keluar"

---

## Info Tambahan

### Struktur Tabel `admins`

```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Role yang Tersedia

- `super_admin`: Full access
- `admin`: Standard admin access
- (custom roles bisa ditambahkan sesuai kebutuhan)
