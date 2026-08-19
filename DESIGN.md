# DESIGN.md — VokasIn

**Versi:** 1.0 · **Tanggal:** 19 Agustus 2026
**Tujuan file ini:** menjadi rujukan tunggal desain visual, siap ditempel langsung ke kode — bukan deskripsi naratif yang harus ditafsirkan ulang.

---

## 1. Prinsip Desain

VokasIn melayani guru vokasi di tengah rutinitas kerja nyata — bukan aplikasi startup yang menjual mimpi. Bahasa visualnya harus terasa seperti alat kerja yang dipercaya: tegas, jujur soal keterbatasan (menampilkan tingkat keyakinan, bukan kepastian mutlak), dan mengambil metafora dari dunia bengkel/laboratorium SMK — bukan template SaaS generik.

### Larangan eksplisit (negative constraints)

Jangan gunakan salah satu pun dari daftar ini, dalam kondisi apa pun:
- Emoji dalam bentuk apa pun — di UI maupun di copy.
- Gradient ungu-ke-biru sebagai elemen dekoratif utama.
- Glassmorphism / neon glow berlebihan.
- Font Inter atau sans-serif default tanpa hierarki eksplisit.
- Grid tiga-kartu identik dengan drop-shadow generik ~8px di semua card.
- Layout serba center-aligned sebagai default.
- Copy hampa/umum ("Build the future of education", "Empower every teacher") — pakai bahasa spesifik domain SKKNI/SMK.
- Ilustrasi 3D generik ala Blender.
- Ikon dari lebih dari satu pustaka sekaligus (hanya Lucide).
- Klaim "akurat 100%", "menjamin", "sempurna" di UI mana pun.

---

## 2. Warna

Skala brand `slime-lime` (diberikan, wajib dipakai persis) + token pendukung yang diturunkan agar harmonis dan aksesibel.

```css
@theme {
  /* === Brand: slime-lime (WAJIB, jangan diubah) === */
  --color-slime-lime-50:  oklch(98.64% 0.035 122.62);
  --color-slime-lime-100: oklch(97.40% 0.069 123.47);
  --color-slime-lime-200: oklch(95.18% 0.134 124.74);
  --color-slime-lime-300: oklch(93.34% 0.189 126.26);
  --color-slime-lime-400: oklch(91.95% 0.227 128);
  --color-slime-lime-500: oklch(90.82% 0.246 130.54);
  --color-slime-lime-600: oklch(76.83% 0.208 130.31);
  --color-slime-lime-700: oklch(62.10% 0.168 130.20);
  --color-slime-lime-800: oklch(46.50% 0.124 129.59);
  --color-slime-lime-900: oklch(29.42% 0.077 127.95);
  --color-slime-lime-950: oklch(23.92% 0.062 127.07);

  /* === Neutral (hue diselaraskan dengan slime-lime ~125, chroma minim) === */
  --color-neutral-50:  oklch(98.5% 0.004 125);
  --color-neutral-100: oklch(96.8% 0.006 125);
  --color-neutral-200: oklch(92.5% 0.008 125);
  --color-neutral-300: oklch(87%   0.010 125);
  --color-neutral-400: oklch(70.5% 0.012 125);
  --color-neutral-500: oklch(55.5% 0.012 125);
  --color-neutral-600: oklch(44.5% 0.010 125);
  --color-neutral-700: oklch(37%   0.009 125);
  --color-neutral-800: oklch(27%   0.008 125);
  --color-neutral-900: oklch(21%   0.006 125);
  --color-neutral-950: oklch(14.5% 0.005 125);

  /* === Semantik === */
  --color-success:       oklch(72% 0.19 150);
  --color-success-fg:    oklch(52% 0.15 150);
  --color-warning:       oklch(80% 0.16 85);
  --color-error:         oklch(58% 0.22 27);
  --color-error-bg:      oklch(94% 0.03 27);
  --color-info:          oklch(62% 0.16 250);
  --color-info-bg:       oklch(95% 0.03 250);

  /* === Token semantik — light mode === */
  --color-background:          oklch(99% 0.004 125);
  --color-foreground:          oklch(21% 0.006 125);
  --color-card:                oklch(100% 0 0);
  --color-primary:             var(--color-slime-lime-600);
  --color-primary-foreground:  oklch(21% 0.02 130); /* near-black, BUKAN putih */
  --color-muted:                oklch(96.8% 0.006 125);
  --color-muted-foreground:     oklch(50% 0.012 125);
  --color-border:               oklch(90% 0.008 125);
  --color-ring:                 var(--color-slime-lime-600);

  /* === Tipografi === */
  --font-sans: var(--font-jakarta), system-ui, sans-serif;

  /* === Easing & durasi (untuk motion, lihat §6) === */
  --ease-fluid:   cubic-bezier(0.3, 0, 0, 1);
  --ease-snappy:  cubic-bezier(0.2, 0, 0, 1);
  --duration-micro: 150ms;
  --duration-ui:    250ms;
}

.dark {
  --color-background:         oklch(16% 0.01 125);
  --color-foreground:         oklch(96% 0.005 125);
  --color-card:                oklch(20% 0.01 125);
  --color-primary:             var(--color-slime-lime-500);
  --color-primary-foreground:  oklch(20% 0.02 130); /* tetap near-black */
  --color-muted:                oklch(26% 0.01 125);
  --color-muted-foreground:     oklch(70% 0.01 125);
  --color-border:               oklch(30% 0.01 125);
}
```

### Aturan pasangan teks-di-atas-brand (WAJIB dipatuhi, sudah diuji kontras WCAG)

Kanal hijau berbobot besar dalam formula luminansi — slime-lime shade terang **secara visual berperilaku seperti latar putih**, bukan warna "vivid" biasa.

| Shade dipakai sebagai latar | Warna teks di atasnya | Status kontras |
|---|---|---|
| 400 / 500 / 600 | **near-black** (`--color-primary-foreground`) | Aman (AAA) |
| 700 | near-black untuk teks normal; putih **hanya** untuk teks besar (≥18px bold/24px) | Batas — verifikasi ulang tiap pemakaian |
| 800 / 900 | **putih** | Aman (AA/AAA) |

**Jangan pernah** menaruh teks putih di atas shade 400–600. Ini kesalahan paling mudah terjadi dan paling merusak keterbacaan.

---

## 3. Tipografi

**Font:** Plus Jakarta Sans (variable font), termasuk untuk elemen `<p>` — tidak dipasangkan dengan font lain.

- Muat via `next/font/google`, subset `latin`, `display: 'swap'`, expose sebagai CSS variable `--font-jakarta`, lalu petakan ke `--font-sans` di `@theme` (lihat blok CSS di atas).
- Body text minimum **16px**, `line-height` 1.5–1.6, weight 400–500.
- Hindari weight ExtraLight (200)/Light (300) untuk teks kecil — kontras stroke turun di ukuran kecil.
- Skala heading: gunakan rasio tegas (mis. 1.25–1.333), bukan skala default seragam — hierarki harus terlihat jelas tanpa membaca warna/bold.

---

## 4. Ikon

**Hanya Lucide** (`lucide-react`) — tidak dicampur pustaka lain.

- Default `size=24`, `strokeWidth=2`; gunakan `strokeWidth=1.5` secara konsisten di seluruh aplikasi bila ingin kesan lebih halus (pilih satu, jangan campur).
- Ikon dekoratif + label teks → biarkan `aria-hidden` bawaan.
- Ikon tanpa label (icon-only button) → wajib `aria-label`.
- Di `next.config`, aktifkan `experimental.optimizePackageImports: ['lucide-react']` agar tidak memuat seluruh pustaka saat build.

---

## 5. Ilustrasi

Gaya **unDraw** — flat, satu warna utama, tanpa gradasi kompleks.

- Recolor semua aset ke `slime-lime-600` atau `700` (bukan warna biru default unDraw) via fitur color customization di unDraw.co sebelum diunduh.
- Konversi SVG ke komponen React (mis. via SVGR), ganti nilai fill jadi `currentColor` agar mewarisi warna dari konteks.
- Pakai unDraw **secara eksklusif** — jangan campur dengan ilustrasi dari sumber lain (proporsi/ketebalan garis akan terlihat tidak konsisten).
- Lisensi MIT, aman untuk kompetisi dan komersial, tanpa attribution wajib.

---

## 6. Motion

- Durasi: micro-interaction **< 150ms**, transisi UI umum **200–300ms**.
- Easing: `--ease-fluid`/`--ease-snappy` (lihat token di atas) untuk elemen masuk.
- Animasikan **hanya** `transform` dan `opacity` — jangan animasikan `width`/`height`/`box-shadow`/`top`/`left`.
- Wajib hormati `prefers-reduced-motion` — tulis versi tanpa motion sebagai base style, tambahkan animasi di dalam `@media (prefers-reduced-motion: no-preference)`.
- Pustaka: **Motion** (`motion/react`) untuk transisi komponen/layout; **CSS/tailwindcss-animate** untuk micro-interaction sederhana (hover, fade). Hindari GSAP kecuali benar-benar butuh koreografi scroll kompleks — tidak proporsional untuk lingkup kompetisi.

---

## 7. Checklist sebelum implementasi (Claude Code)

- [ ] Token warna di atas sudah ditempel ke `globals.css`/`@theme` sebelum komponen pertama dibuat.
- [ ] Font Plus Jakarta Sans sudah dimuat di root layout dan diverifikasi tidak ada CLS.
- [ ] `lucide-react` terpasang dengan `optimizePackageImports` aktif.
- [ ] Minimal 3 aset unDraw sudah di-recolor dan dikonversi jadi komponen sebelum halaman pertama dibangun.
- [ ] Setiap pasangan warna teks-latar brand diverifikasi manual sesuai tabel §2 — jangan asumsikan.
- [ ] Tidak ada satu pun string emoji di seluruh kode (cek dengan pencarian teks).
