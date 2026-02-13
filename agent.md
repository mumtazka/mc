# Agent Guide — TJKT 2 Minecraft Server Website

---

## 1. Project Overview

### Deskripsi

Website showcase untuk server Minecraft kelas TJKT 2. Menampilkan landing page dengan scroll-driven frame animation (video-style), profil pemain, dan halaman admin untuk mengelola data pemain & foto.

### Problem yang Diselesaikan

- Kelas TJKT 2 butuh satu tempat digital untuk memperkenalkan server Minecraft mereka.
- Perlu cara mudah buat admin menambah/mengedit data pemain dan foto tanpa sentuh kode.

### Solution Approach

- **Single-page scroll experience** — canvas frame-by-frame animation dikontrol GSAP ScrollTrigger.
- **Supabase backend** — database + storage untuk player data & foto, tanpa perlu deploy backend sendiri.
- **Admin panel** — halaman `/munas` (hidden) untuk CRUD pemain dan upload foto.

---

## 2. Agent Role & Responsibilities

### Peran Utama

Kamu adalah **pair-programmer** untuk proyek ini. Bantu develop fitur baru, fix bug, refactor, dan jaga kualitas kode.

### Scope

- Frontend React (komponen, styling, animasi).
- Integrasi Supabase (query, storage, RLS policy).
- Performa scroll animation.
- Admin panel CRUD.
- Deployment readiness.

### Batasan

- **JANGAN** pernah expose atau commit Supabase credentials yang sebenarnya. File `.env` sudah ada di repo tapi keys di dalamnya bersifat publik (anon key); tetap perlakukan dengan hati-hati.
- **JANGAN** mengubah frame images di `public/frames/` — file-file ini besar dan di-gitignore.
- **JANGAN** menambahkan library baru tanpa konfirmasi user terlebih dahulu.
- Semua teks UI dalam **Bahasa Indonesia** kecuali kode internal dan komentar (English OK).

---

## 3. Development Workflow

### Setup Awal

```bash
# Clone & install
git clone <repo-url>
cd mc
npm install

# Isi .env
VITE_SUPABASE_URL=<url>
VITE_SUPABASE_ANON_KEY=<anon_key>

# Jalankan dev server
npm run dev
# Buka http://localhost:5173
```

### Workflow Harian

1. **Pahami request** — baca requirements sampai jelas.
2. **Riset codebase** — cek file yang relevan sebelum edit.
3. **Implement** — edit file yang tepat. Jangan bikin file baru kalau bisa extend yang ada.
4. **Test manual** — jalankan `npm run dev`, buka browser, cek hasilnya.
5. **Lint** — `npm run lint` harus clean.
6. **Build check** — `npm run build` harus sukses tanpa error.

### Git Conventions

- Commit message: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`
- Contoh: `feat: add player search filter`
- Branch: `feature/<nama>`, `fix/<nama>`

---

## 4. Tech Stack & Architecture

### Tech Stack

| Layer       | Technology                  | Version    |
| ----------- | --------------------------- | ---------- |
| Runtime     | Node.js                     | 18+        |
| Bundler     | Vite                        | ^7.2.4     |
| Framework   | React                       | ^19.2.0    |
| Routing     | react-router-dom            | ^7.13.0    |
| Animation   | GSAP + ScrollTrigger        | ^3.14.2    |
| Backend     | Supabase (DB + Storage)     | ^2.95.3    |
| Linting     | ESLint (flat config)        | ^9.39.1    |
| Language    | JavaScript (JSX)            | ES2020+    |
| Font        | Minecraft (CDN cdnfonts)    | —          |

### Struktur Folder

```
mc/
├── public/
│   ├── frames/              # 1368 JPG frames untuk scroll animation (gitignored)
│   ├── mojang-animation/    # 12 sprite sheet PNG untuk loading screen
│   ├── assets/              # Static assets lainnya
│   └── vite.svg             # Favicon
├── src/
│   ├── assets/              # React assets (react.svg)
│   ├── components/          # Reusable UI components
│   │   ├── Hero.jsx         # Landing hero section
│   │   ├── History.jsx      # Server history section
│   │   ├── Menu.jsx         # Fixed navigation bar
│   │   ├── MojangLoader.jsx # Animated loading screen (sprite sheet)
│   │   └── PlayerProfiles.jsx # Player cards + photo carousel
│   ├── lib/
│   │   └── supabaseClient.js # Supabase client singleton
│   ├── pages/
│   │   ├── AdminPage.jsx    # Admin CRUD panel
│   │   └── AdminPage.css    # Admin-specific styles
│   ├── App.jsx              # Main app: canvas animation + scroll sections
│   ├── App.css              # Global + component styles
│   ├── index.css            # CSS reset + base styles
│   └── main.jsx             # Entry point + Router setup
├── .env                     # Supabase credentials
├── database-schema.sql      # SQL schema untuk setup Supabase
├── package.json
├── vite.config.js
└── eslint.config.js
```

### Routing

| Path     | Component   | Deskripsi             |
| -------- | ----------- | --------------------- |
| `/`      | `App`       | Main landing page     |
| `/munas` | `AdminPage` | Admin panel (hidden)  |

### Design Patterns

- **Component-based architecture** — setiap section adalah komponen sendiri.
- **Canvas rendering** — frame animation via `<canvas>` 2D context, bukan `<img>` atau `<video>`.
- **Chunked image preloading** — frames di-load 50 per batch untuk tidak blocking main thread.
- **Sprite sheet animation** — Mojang loader pakai 12 sprite sheet files, masing-masing 4 sub-frames.

---

## 5. Coding Guidelines

### Naming Conventions

| Entitas          | Convention          | Contoh                     |
| ---------------- | ------------------- | -------------------------- |
| Component file   | PascalCase `.jsx`   | `PlayerProfiles.jsx`       |
| CSS file         | Sama dengan komponen | `AdminPage.css`           |
| CSS class        | kebab-case          | `.player-card`, `.hero-title` |
| JS variable      | camelCase           | `frameIndexRef`, `loadedCount` |
| JS constant      | UPPER_SNAKE         | `FRAME_COUNT`, `BG_COLOR`  |
| Supabase table   | snake_case          | `player_photos`            |
| Environment var  | VITE_ prefix        | `VITE_SUPABASE_URL`        |

### Code Style

- **Indentation**: 2 atau 4 spaces (konsisten per file; proyek ini mayoritas 4 spaces di JSX, 2 di config).
- **Semicolons**: Opsional (proyek ini mix, tapi cenderung pakai semicolons di JSX).
- **Quotes**: Single quotes untuk JS, double quotes untuk JSX attributes.
- **Comments**: English untuk code comments. Bahasa Indonesia untuk UI text.
- **Imports**: React hooks dulu, lalu libraries, lalu local components, lalu CSS.

```jsx
// Urutan import yang benar
import { useState, useEffect } from 'react';       // React
import { gsap } from 'gsap';                        // Libraries
import { supabase } from '../lib/supabaseClient';   // Local libs
import Hero from './components/Hero';                // Components
import './App.css';                                  // Styles
```

### Error Handling

- Supabase queries: selalu `try/catch`, tampilkan error ke console + `alert()` di admin page.
- Image loading: pakai `onload` + `onerror` callback, hitung keduanya sebagai "loaded" supaya progress bar tidak stuck.
- Jangan pernah silently fail — minimal `console.error()`.

```jsx
// Pattern untuk Supabase query
try {
    const { data, error } = await supabase.from('players').select('*');
    if (error) throw error;
    // Process data
} catch (error) {
    console.error('Error fetching players:', error);
    alert('Error: ' + error.message); // Hanya di admin page
}
```

### Testing

- Belum ada test framework yang di-setup. Untuk sekarang, testing dilakukan manual via browser.
- Sebelum push, pastikan: `npm run build` sukses, `npm run lint` clean.

---

## 6. Common Tasks & How To Handle

### Menambah Section Baru di Landing Page

1. Buat komponen baru di `src/components/NamaSection.jsx`
2. Import di `App.jsx`
3. Tambahkan di dalam `<div className="content-layer">` sesuai urutan yang diinginkan
4. Tambahkan anchor link di `Menu.jsx` jika perlu
5. Style di `App.css` (section styles) atau file CSS terpisah

```jsx
// src/components/NamaSection.jsx
function NamaSection() {
    return (
        <section id="nama" className="nama-section">
            <h2 className="nama-title">Judul Section</h2>
            {/* Content */}
        </section>
    );
}
export default NamaSection;
```

### Menambah Tabel Supabase Baru

1. Tulis SQL di `database-schema.sql` (append, jangan overwrite).
2. Jalankan SQL di Supabase SQL Editor.
3. Tambahkan RLS policy (minimal public read).
4. Query via `supabase` client dari `src/lib/supabaseClient.js`.

### Mengubah Kecepatan Scroll Animation

Di `App.jsx`, ubah parameter berikut:
- `scrub: 5` — semakin besar, semakin smooth/lambat. Range: 1-10.
- `.scroll-spacer { height: 2500vh }` di `App.css` — semakin tinggi, scroll semakin panjang.

### Mengganti Frame Animation

1. Replace files di `public/frames/` (gitignored, harus manual copy).
2. Update `FRAME_COUNT` di `App.jsx`.
3. Update `getFramePath()` jika naming convention berubah.

### Upload Foto Pemain (User Flow)

1. Buka `/munas` (admin panel).
2. Tambah pemain baru via form.
3. Klik tombol `+` di section foto.
4. Pilih file gambar.
5. Foto ter-upload ke Supabase Storage bucket `player-photos` dan URL disimpan di tabel `player_photos`.

---

## 7. Tools & Resources

### Development Tools

| Tool           | Purpose                         |
| -------------- | ------------------------------- |
| Vite           | Dev server + bundler            |
| ESLint         | Code linting                    |
| Browser DevTools | Debug, network, console       |
| Supabase Dashboard | Database & storage management |

### External Services

| Service        | URL                                     | Purpose                    |
| -------------- | --------------------------------------- | -------------------------- |
| Supabase       | https://supabase.com/dashboard          | Database, Auth, Storage    |
| cdnfonts       | https://fonts.cdnfonts.com/css/minecraft-4 | Minecraft font CDN      |
| Google Fonts   | https://fonts.googleapis.com            | Inter font (index.css)     |

### Environment Variables

| Variable                 | Description              | Wajib |
| ------------------------ | ------------------------ | ----- |
| `VITE_SUPABASE_URL`      | Supabase project URL     | Ya    |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key   | Ya    |

### Database Schema

**Tabel `players`:**
| Column       | Type        | Note                    |
| ------------ | ----------- | ----------------------- |
| id           | UUID (PK)   | Auto-generated          |
| name         | TEXT        | NOT NULL                |
| description  | TEXT        | Nullable                |
| order_index  | INTEGER     | Untuk sorting, default 0 |
| created_at   | TIMESTAMPTZ | Auto-generated          |

**Tabel `player_photos`:**
| Column       | Type        | Note                              |
| ------------ | ----------- | --------------------------------- |
| id           | UUID (PK)   | Auto-generated                    |
| player_id    | UUID (FK)   | References players.id, CASCADE    |
| photo_url    | TEXT        | NOT NULL, URL dari storage        |
| is_primary   | BOOLEAN     | Default false                     |
| created_at   | TIMESTAMPTZ | Auto-generated                    |

**Storage Bucket:** `player-photos` (public)

---

## 8. Do's and Don'ts

### DO ✅

- **DO** gunakan Bahasa Indonesia untuk semua teks yang user-facing.
- **DO** test scroll animation di berbagai ukuran layar sebelum push.
- **DO** keep komponen kecil dan focused — satu komponen = satu tanggung jawab.
- **DO** pakai CSS class names yang deskriptif dan kebab-case.
- **DO** handle loading state untuk semua data fetching.
- **DO** pakai `try/catch` untuk setiap Supabase operation.
- **DO** maintain `database-schema.sql` sebagai source of truth untuk schema.
- **DO** test admin panel di `/munas` setelah ada perubahan data layer.

### DON'T ❌

- **DON'T** commit `node_modules/`, `dist/`, atau `public/frames/`.
- **DON'T** hardcode Supabase URL/key — selalu pakai `import.meta.env`.
- **DON'T** pakai inline styles kecuali untuk dynamic values (contoh: foto placeholder di `PlayerProfiles.jsx` boleh karena conditional).
- **DON'T** tambah dependency baru tanpa konfirmasi user-nya dulu.
- **DON'T** ubah `public/frames/` via kode — ini asset berat yang di-manage manual.
- **DON'T** pakai emoji di teks UI (sudah dihapus, jangan tambahkan lagi).
- **DON'T** bikin halaman admin bisa diakses dari menu/navigasi publik — path `/munas` bersifat hidden.
- **DON'T** disable atau bypass Supabase RLS tanpa alasan yang jelas.

### Security Considerations

- Admin page (`/munas`) **tidak punya autentikasi** — siapa saja yang tahu URL bisa akses. Ini adalah area yang perlu improvement ke depan.
- RLS policy saat ini **fully open** (public read + public write). Untuk production, restrict INSERT/UPDATE/DELETE hanya untuk authenticated users.
- Supabase anon key bersifat public by design (row-level security yang melindungi data), tapi tetap jangan expose service_role key.

### Performance Considerations

- **Frame preloading** — 1368 frames di-load chunked (50 per tick) agar tidak freeze UI. Jangan ubah ke synchronous loading.
- **Canvas rendering** — pakai `requestAnimationFrame` loop; bukan re-render React. Ini by design untuk performa.
- **Scroll spacer** — `2500vh` spacer memberikan scroll distance. Jangan kurangi drastis karena akan mempercepat animasi.
- **Sprite sheets** — Mojang loader pakai sprite sheets bukan individual frames. Lebih efisien.

---

## 9. Quality Checklist

### Sebelum Commit

- [ ] `npm run lint` — zero errors
- [ ] `npm run build` — build sukses tanpa error/warning
- [ ] Test di browser: halaman utama scrollable, animasi jalan smooth
- [ ] Test di browser: admin panel (`/munas`) bisa add/edit/delete player
- [ ] Test di browser: foto bisa di-upload dan muncul di main page
- [ ] Tidak ada `console.log` debugging yang tertinggal (hanya `console.error` yang production-worthy)
- [ ] Tidak ada hardcoded credentials
- [ ] CSS class names konsisten kebab-case
- [ ] Teks UI dalam Bahasa Indonesia

### Review Criteria

- Apakah perubahan ini break scroll animation?
- Apakah responsive? Test di viewport 375px dan 1920px minimal.
- Apakah loading state di-handle? (skeleton/spinner/text)
- Apakah error state di-handle? (try/catch, user feedback)

---

## 10. Project-Specific Context

### Domain Knowledge

- **TJKT 2** = Teknik Jaringan Komputer dan Telekomunikasi, kelas 2. Ini program studi SMK di Indonesia.
- **Server Minecraft** = Java/Bedrock server yang dimainkan bersama oleh siswa.
- Website ini bersifat **showcase/portfolio** server, bukan tool untuk manage server Minecraft itu sendiri.

### Business Rules

- Pemain ditampilkan **berurutan** berdasarkan `order_index`.
- Layout player card **alternating** (kanan-kiri) berdasarkan index genap/ganjil.
- Foto pertama yang di-upload otomatis menjadi foto utama yang ditampilkan.
- Jika pemain punya banyak foto, muncul **carousel dots** untuk navigasi.
- Jika pemain tidak punya foto, tampilkan placeholder berupa huruf pertama nama pemain.

### User Flow Utama

```
Landing Page:
  1. Mojang Loading Animation (sprite sheet, 3 detik)
  2. Tunggu frames selesai preload (loading bar)
  3. Fade out loader
  4. Main page tampil: Canvas animation + overlay + content sections
  5. User scroll → frame animation bergerak sesuai scroll position
  6. Sections appear: Hero → History → Player Profiles

Admin Panel (/munas):
  1. Form "Add New Player" — isi nama + deskripsi
  2. Player list — card per pemain dengan Edit/Delete
  3. Per player — grid foto kecil + tombol upload (+)
  4. Klik foto untuk delete (hover → button ×)
```

### Edge Cases

- **Frames gagal load** — `onerror` tetap dihitung sebagai loaded, progress bar tetap maju. Canvas akan skip frame yang gagal (blank frame).
- **Supabase down atau credentials salah** — player section akan stuck di "Memuat data pemain..." . Console error akan muncul.
- **Browser tidak support canvas** — tidak ada fallback saat ini. Target browser: Chrome/Edge/Firefox modern.
- **Mobile scroll** — touch scroll bekerja tapi sensation bisa berbeda karena scrub value. Test di device asli jika mungkin.
- **Multiple rapid photo uploads** — `uploading` state mencegah double-upload, tapi race condition bisa terjadi jika user sangat cepat.
- **Player tanpa foto** — fallback ke placeholder gradient + initial huruf. Ini intentional, bukan bug.

---

## Appendix: File Quick Reference

| Mau ubah apa?                    | Edit file ini                  |
| -------------------------------- | ------------------------------ |
| Teks hero / headline             | `src/components/Hero.jsx`      |
| Teks sejarah server              | `src/components/History.jsx`   |
| Navigasi menu                    | `src/components/Menu.jsx`      |
| Loading screen animation         | `src/components/MojangLoader.jsx` |
| Player cards / foto carousel     | `src/components/PlayerProfiles.jsx` |
| Scroll animation config          | `src/App.jsx`                  |
| Admin CRUD                       | `src/pages/AdminPage.jsx`      |
| Global styles / section styles   | `src/App.css`                  |
| Admin styles                     | `src/pages/AdminPage.css`      |
| Base CSS reset                   | `src/index.css`                |
| Routing                          | `src/main.jsx`                 |
| Supabase client                  | `src/lib/supabaseClient.js`    |
| Database schema                  | `database-schema.sql`          |
| Environment variables            | `.env`                         |
