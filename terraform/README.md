# Panduan Infrastruktur AWS EC2 & Supabase untuk VokasIn

Dokumen ini menjelaskan arsitektur infrastruktur, konfigurasi Terraform, dan automasi CI/CD GitHub Actions untuk menjalankan aplikasi VokasIn secara mandiri dan optimal.

---

## 1. Mengapa AWS EC2 `t4g.small` + Supabase?

1. **Model Semantik Lokal (`@huggingface/transformers` ONNX Runtime)**
   - VokasIn menggunakan model embedding lokal untuk pencocokan semantik SKKNI secara *offline/on-premise*.
   - Platform *serverless* seperti Vercel memiliki batasan durasi eksekusi (5-15 detik) dan *ephemeral memory/filesystem* yang menyebabkan model gagal di-cache atau mengalami OOM (*Out Of Memory*).
   - EC2 `t4g.small` berbasis prosesor **AWS Graviton2 (ARM64)** dengan 2 vCPU dan 2 GB RAM memberikan eksekusi inferensi ONNX yang sangat cepat, efisien energi, dan hemat biaya (~$12–$14/bulan).

2. **Database Postgres Supabase**
   - Menggunakan Supabase dengan ekstensi `pgvector` untuk penyimpanan vektor dan pencarian *hybrid* (`to_tsquery` + cosine distance).
   - Mempertahankan integritas data tanpa perlu mengelola *database clustering* manual di server EC2.

---

## 2. Arsitektur Infrastruktur

```
[ Pengguna / Browser ]
         │
         ▼
[ AWS Elastic IP ] ─── (Port 80 / 443)
         │
         ▼
[ Nginx Reverse Proxy ]
         │
         ▼ (Port 3000)
[ PM2 Process Manager ] ───► [ Next.js 16 + Local Embedding Engine ]
                                            │
                                            ▼ (Port 6543 / SSL)
                             [ Supabase Managed PostgreSQL (pgvector) ]
```

---

## 3. Langkah-Langkah Deployment

### Langkah 1: Siapkan Terraform & AWS CLI
1. Pastikan Anda memiliki AWS CLI yang sudah terkonfigurasi (`aws configure`).
2. Buat atau pilih AWS Key Pair (misal `vokasin-ec2-key`) di AWS Console.

### Langkah 2: Konfigurasi Variabel
1. Masuk ke direktori `terraform/`:
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   ```
2. Isi nilai `key_name` dan `database_url` (dari Supabase Dashboard -> Settings -> Database -> Connection String).

### Langkah 3: Eksekusi Terraform
```bash
terraform init
terraform plan
terraform apply
```
Setelah proses selesai, Terraform akan mencetak `public_ip` (Elastic IP) dan perintah koneksi SSH.

---

## 4. Konfigurasi CI/CD GitHub Actions

Agar server otomatis diperbarui setiap kali Anda melakukan `git push` ke GitHub, tambahkan rahasia berikut di **GitHub Repository -> Settings -> Secrets and variables -> Actions -> New repository secret**:

| Nama Secret | Nilai |
| :--- | :--- |
| `EC2_HOST` | Nilai `public_ip` dari output Terraform |
| `EC2_USERNAME` | `ubuntu` |
| `EC2_SSH_KEY` | Isi seluruh berkas *private key* SSH (`.pem`) Anda |
| `DATABASE_URL` | *Connection string* Supabase PostgreSQL Anda |

Setelah rahasia di atas disimpan, setiap *commit* baru pada *branch* `main` atau `master` akan:
1. Memvalidasi *build* Next.js di lingkungan GitHub Runner.
2. Terhubung secara aman via SSH ke EC2 `t4g.small`.
3. Menjalankan *git pull*, instalasi dependensi, *build*, dan memuat ulang PM2 (*zero-downtime reload*).

---

## 5. Menambahkan Sertifikat SSL Gratis (HTTPS)

Setelah domain Anda (misal `vokasin.id`) diarahkan ke `public_ip` server, jalankan perintah ini via SSH:

```bash
ssh -i vokasin-ec2-key.pem ubuntu@<IP_SERVER>
sudo certbot --nginx -d vokasin.id -d www.vokasin.id
```
Certbot akan otomatis memperbarui konfigurasi Nginx dan memperpanjang sertifikat secara otomatis.
