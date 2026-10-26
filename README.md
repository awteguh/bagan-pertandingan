# 🏆 Bagan Pertandingan

Generator bagan pertandingan cup sistem online. Dibuat dengan Next.js 15, Prisma, SQLite, TailwindCSS.

## Fitur
- **Format Grup + Knockout**: Fase grup round-robin → babak gugur otomatis
- **Multi-olahraga**: Voli, sepak bola, futsal, basket, badminton, tenis meja
- **Tema visual**: Modern, 17 Agustus 🇮🇩, Lebaran 🌙, Sporty 🏆
- **Admin panel**: Kelola turnamen, tim, generate jadwal & bracket, input skor
- **Publik read-only**: Lihat klasemen, jadwal, dan bagan knockout
- **Print / Export PDF**: Cetak bagan langsung dari browser

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup database
npm run db:push    # Create SQLite database
npm run db:seed    # Create admin user (admin / admin123)

# 3. Jalankan development server
npm run dev

# 4. Buka browser
# Publik:  http://localhost:3000
# Admin:   http://localhost:3000/admin/login
#          Username: admin | Password: admin123
```

## Alur Penggunaan Admin

1. Login → `/admin/login`
2. Buat turnamen baru → pilih olahraga, tema, konfigurasi grup
3. Tambah tim (bisa bulk atau satu-satu)
4. **Generate Grup** → sistem acak assign tim ke grup + buat jadwal round-robin
5. **Input Skor** fase grup → klasemen otomatis diperbarui
6. **Generate Bracket Knockout** → tim terbaik per grup masuk bracket
7. **Input Skor** fase knockout → winner otomatis maju ke babak berikutnya
8. Turnamen selesai ✅

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run db:push      # Sync schema ke database
npm run db:seed      # Seed admin user
npm run db:studio    # Prisma Studio (GUI database)
```

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | SQLite (via Prisma 5) |
| Auth | NextAuth.js v5 (credentials) |
| Styling | TailwindCSS v4 + shadcn patterns |
| Validation | Zod v4 |
| Forms | React Hook Form |
