# CLAUDE.md — VokasIn

Baca `PRD.md`, `ARCHITECTURE.md`, dan `DESIGN.md` sebelum menulis kode apa pun. File ini hanya aturan main, bukan pengganti ketiganya.

## Proyek dalam satu kalimat

Alat bagi guru produktif SMK dan kaprogli untuk menerjemahkan SKKNI menjadi perangkat ajar, dengan Human-in-the-Loop yang sungguhan berfriksi — bukan tombol setuju.

## Stack

- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS v4.
- Font: Plus Jakarta Sans via `next/font/google`, satu-satunya font di seluruh aplikasi.
- Ikon: `lucide-react` eksklusif.
- Ilustrasi: unDraw (di-recolor ke brand), sebagai komponen React.
- Motion: `motion/react` untuk transisi komponen, CSS untuk micro-interaction.
- Basis data: relasional (PostgreSQL). **Jangan** menambah graph database/QuadStore.

## Urutan kerja — jangan lompat tahap

1. Tempel token dari `DESIGN.md` ke `globals.css`/`@theme` dulu.
2. Bangun komponen primitif (Button, Input, Card, Badge, dialog, empty state) dengan semua state (default/hover/focus/disabled/loading/error/empty).
3. Rakit komposisi/layout dari primitif tersebut.
4. Baru bangun halaman.

Jangan membangun halaman sebelum primitif punya semua state di atas.

## Larangan keras (bukan saran, larangan)

- Emoji dalam bentuk apa pun.
- Gradient ungu-biru, glassmorphism, neon glow.
- Font selain Plus Jakarta Sans.
- Ikon dari pustaka selain Lucide.
- Grid tiga-kartu identik dengan drop-shadow generik.
- Copy generik ("empower", "seamless", "next-generation") — pakai istilah domain nyata: unit kompetensi, KUK, kaprogli, jobsheet.
- Teks putih di atas `slime-lime-400/500/600` (lihat tabel kontras di `DESIGN.md` §2).
- Klaim "akurat", "menjamin", "sempurna" di UI atau microcopy.
- Web scraping dalam bentuk apa pun untuk sumber data kompetensi.
- Knowledge Graph/QuadStore/Ontology RAG untuk struktur SKKNI — cukup tabel relasional.
- Auto-reject skill yang tidak match SKKNI — harus ditandai gap, bukan dibuang (lihat `ARCHITECTURE.md` §5).

## Prinsip data (tidak bisa dinegosiasikan)

- Validasi masalah dan evaluasi performa model **wajib** data nyata.
- Data sintetis **hanya** untuk augmentasi pelatihan/uji beban — tidak pernah untuk klaim dampak atau akurasi.
- Jangan pernah men-generate unit kompetensi/KUK sintetis dan memperlakukannya sebagai rujukan asli.

## Data contoh (bukan Lorem Ipsum)

Pakai contoh nyata saat membangun UI: nama unit kompetensi SKKNI sungguhan, jurusan SMK sungguhan (TKJ, RPL, Perhotelan, dsb.), nama kaprogli/guru fiktif tapi realistis. Copy yang dibangun dari Lorem Ipsum akan terasa templated di setiap layar.

## Aksesibilitas & kualitas minimum (non-negotiable)

- Kontras WCAG AA di semua pasangan teks-latar.
- Fokus keyboard terlihat di semua elemen interaktif.
- `prefers-reduced-motion` dihormati — bukan dihapus totalnya, cukup dikurangi.
- Responsif sampai lebar mobile (360px).

## Sebelum menganggap fitur selesai

- [ ] Apakah ada rujukan tertelusur ke sumber (SKKNI/dokumen asli) untuk setiap output yang diklaim "berbasis standar"?
- [ ] Apakah keputusan AI butuh konfirmasi eksplisit manusia sebelum berdampak (bukan default-accept)?
- [ ] Apakah state kosong/error/loading sudah dirancang, bukan dibiarkan default browser?
- [ ] Apakah teks di atas warna brand sudah dicek manual terhadap tabel kontras di `DESIGN.md`?

## Konteks tambahan

Proyek ini melewati banyak iterasi kritik (uji duplikasi pasar, uji legal, uji klaim teknis) sebelum sampai ke bentuk ini — lihat riwayat keputusan di `PRD.md` §14 (Risiko) bila ragu kenapa sebuah batasan ada.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
