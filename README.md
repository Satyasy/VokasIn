# VokasIn

Platform asisten analitik kurikulum berbasis Human-in-the-Loop yang membantu guru produktif dan ketua program keahlian (kaprogli) di SMK menerjemahkan Standar Kompetensi Kerja Nasional Indonesia (SKKNI) menjadi perangkat ajar operasional — jobsheet, rencana praktikum, dan rubrik penilaian.

## Dokumen

| File | Isi | Untuk siapa |
|---|---|---|
| [`PRD.md`](./PRD.md) | Masalah, tujuan, target pengguna, fitur, metrik keberhasilan | Tim produk, juri kompetisi |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Lapisan sistem, ERD, use case, alur aktivitas | Engineer, Claude Code |
| [`DESIGN.md`](./DESIGN.md) | Token warna, tipografi, ikon, ilustrasi, motion | Desainer, Claude Code |
| [`CLAUDE.md`](./CLAUDE.md) | Aturan main untuk agent — taruh di root repo | Claude Code |

## Prinsip inti (jangan dilanggar di dokumen turunan mana pun)

1. **SKKNI adalah rujukan primer.** Sinyal lowongan kerja legal hanyalah lapisan sekunder opsional — bukan pengganti.
2. **Skill di luar SKKNI ditandai sebagai gap, bukan ditolak.** Penolakan otomatis meniadakan nilai sumber sekunder.
3. **Guru dan kaprogli adalah pengguna, bukan siswa.** Siswa hanya penerima manfaat di hilir.
4. **Data nyata untuk validasi, data sintetis hanya untuk augmentasi.** Tidak pernah sebaliknya.
5. **Kepemilikan dokumen akhir ada di sekolah.** Ekspor tidak boleh disandera platform.
6. **Tidak ada klaim "menjamin akurasi mutlak".** NER tetap probabilistik; validasi berbasis rujukan hanya menyaring, bukan menyempurnakan.

Status: Semua isi berasal dari riset & kritik iteratif — sumber dan justifikasi ada di teks masing-masing dokumen.
