# 🇮🇩 API Wilayah Indonesia

API RESTful yang cepat dan ringan untuk mendapatkan data wilayah administrasi di Indonesia mulai dari tingkat Provinsi, Kota/Kabupaten, Kecamatan, hingga Kelurahan/Desa. Proyek ini dibangun dengan performa tinggi menggunakan [Bun](https://bun.com) dan [ElysiaJS](https://elysiajs.com/).

---

## 📊 Sumber Data

Data wilayah yang digunakan bersumber dari **[SalzBytes/wilayah_indonesia](https://github.com/SalzBytes/wilayah_indonesia)**, yang mengacu pada data resmi **Badan Pusat Statistik (BPS) Republik Indonesia**.

| Level | Jumlah | Format Kode |
|-------|-------:|-------------|
| Provinsi | **38** | 2 digit (e.g., `11` = Aceh) |
| Kabupaten/Kota | **514** | 4 digit (e.g., `1101` = Kab. Simeulue) |
| Kecamatan | **7.289** | 7 digit (e.g., `1101010`) |
| Kelurahan/Desa | **84.308** | 10 digit (e.g., `1101010001`) |

---

## 🚀 Dokumentasi & Live API

Kamu bisa langsung mencoba endpoint API dan melihat dokumentasi lengkapnya secara interaktif (dibangun dengan Svelte):

👉 **[Dokumentasi API Wilayah Indonesia](https://api-wilayah-indonesia-v1.vercel.app/api/docs)**

---

## 🛠️ Teknologi yang Digunakan

- **Runtime:** [Bun](https://bun.com)
- **API Framework:** [ElysiaJS](https://elysiajs.com)
- **Frontend Docs:** Svelte + Tailwind CSS

---

## 📦 Menjalankan Secara Lokal (Local Development)

Tertarik untuk mencoba API ini di komputermu sendiri atau ingin berkontribusi? Ikuti langkah-langkah mudah berikut:

### Prasyarat
Pastikan kamu telah menginstal **Bun**. Jika belum, jalankan perintah berikut di terminal:
```bash
curl -fsSL https://bun.sh/install | bash
```

### Instalasi & Menjalankan Server
1. **Clone repository ini**
   ```bash
   git clone https://github.com/adityaibrar/api-wilayah-indonesia.git
   cd api-wilayah-indonesia
   ```

2. **Install dependensi**
   ```bash
   bun install
   ```

3. **Jalankan server mode *development* (Hot Reload)**
   ```bash
   bun run dev
   ```
   *Server akan berjalan di `http://localhost:3000`.*

---

## 📖 Ringkasan Endpoint

Berikut adalah daftar endpoint API yang tersedia. Seluruh *response* dikembalikan dalam format JSON.

| Endpoint | Method | Deskripsi | Query Parameter (Opsional) |
|----------|--------|-----------|----------------------------|
| `/api/provinces` | `GET` | Mendapatkan semua provinsi | `sort=name` |
| `/api/cities` | `GET` | Mendapatkan daftar kota/kabupaten | `province_code`, `sort=name` |
| `/api/districts` | `GET` | Mendapatkan daftar kecamatan | `city_code`, `sort=name` |
| `/api/villages` | `GET` | Mendapatkan daftar kelurahan/desa | `district_code`, `sort=name` |

> **Catatan:** Seluruh kode wilayah yang digunakan mengikuti standar kode BPS resmi.

---

## 🤝 Panduan Berkontribusi (Contributing)

Proyek ini sangat terbuka untuk *open-source*! Semua orang bisa ikut berkontribusi, baik itu memperbaiki *bug*, menambah fitur baru (seperti kodepos), atau sekadar merapikan dokumentasi.

Berikut cara untuk mulai berkontribusi:

1. **Fork** repository ini di pojok kanan atas halaman GitHub.
2. **Clone** hasil fork ke komputermu.
3. Buat **branch** baru untuk pengerjaanmu:
   ```bash
   git checkout -b feat/nama-fitur-baru
   # atau untuk perbaikan: git checkout -b fix/nama-bug
   ```
4. Lakukan perubahan kode. **Aturan penting:**
   - Gunakan gaya arsitektur yang sudah ada, buat kode tetap bersih (Clean Code), semantik, dan mudah di-debug (terapkan prinsip SOLID, DRY, dan KISS).
   - Jangan lupa untuk memberikan komentar pada blok kode yang cukup rumit.
5. **Commit** perubahanmu. Sesuai aturan standar kami, **pesan commit WAJIB menggunakan bahasa Inggris** dan mengikuti pola [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
   ```bash
   git commit -m "feat: add postal code search endpoint"
   ```
6. **Push** ke branch tersebut:
   ```bash
   git push origin feat/nama-fitur-baru
   ```
7. Buka halaman utama repository ini lalu ajukan **Pull Request (PR)**. Jelaskan dengan runtut perubahan yang kamu bawa.

---

## 📄 Lisensi

Proyek ini dilindungi oleh lisensi [MIT](LICENSE). Kamu bebas untuk menggunakan, memodifikasi, dan mendistribusikan ulang, namun harap tetap mencantumkan lisensi asli dari pembuat.
