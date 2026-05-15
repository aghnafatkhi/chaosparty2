# CHAOS PARTY

CHAOS PARTY adalah game multiplayer web ala Jackbox / Gartic Phone yang didesain khusus buat nongkrong dan seru-seruan bareng temen via HP/Laptop.
Dibangun menggunakan Next.js 14, Tailwind CSS, TypeScript, dan Pusher Channels.

## Fitur
- **Membuat/Masuk Room dengan 6 Huruf (tanpa login)**
- **Realtime Multiplayer dengan Pusher (max 8 player)**
- **3 Mini Games Super Seru:**
  - *Siapa Yang Paling...* (Pilih teman yang paling pas dengan deskripsi)
  - *Ketik Secepat Kilat* (Adu cepat ngetik frasa nyeleneh)
  - *Pilih Atau Menyesal* (Survei mayoritas dari dua pilihan konyol)
- **Animasi seru, font asik, warna mentereng (Cyberpunk-ish Party Vibe)**

## Cara Setup Local

1. Pastikan Node.js v18+ terinstall.
2. Clone repo ini dan install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables. Buka file `.env.example`, isikan kredensial di atas lalu rename menjadi `.env.local` atau `.env`
   - **Pusher Config:** Buat akun gratis di [pusher.com](https://pusher.com).
   - Buat aplikasi Channels.
   - Pilih cluster (e.g. `ap1`).
   - Copy parameter App ID, Key, dan Secret ke `PUSHER_APP_ID`, `NEXT_PUBLIC_PUSHER_KEY`, `PUSHER_SECRET`, dan set clusternya.

4. Run Local Server:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000`.

## Cara Deploy ke Vercel

1. Push code ke GitHub.
2. Buka dashboard Vercel -> Add New Project -> Import dari Repo.
3. Di tab Environment Variables, masukkan semua key Pusher:
   - `PUSHER_APP_ID`
   - `NEXT_PUBLIC_PUSHER_KEY`
   - `PUSHER_SECRET`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`
4. Deploy!

## Tech Stack
- Next.js 14 (App Router)
- Pusher (Server-side triggers & Client-side presences)
- framer-motion (Animasi)
- canvas-confetti (Pesta kemenangan)
- Tailwind CSS v4
