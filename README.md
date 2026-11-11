# Remova — Free Automatic Background Remover

> **"Remove Background. Reveal Creativity."**  
> Hapus background gambar secara instan dan otomatis. Mudah, canggih, dan 100% gratis untuk semua orang.

Remova adalah platform web modern untuk menghapus background gambar secara otomatis, 100% gratis, cepat, tanpa watermark, dan tanpa memerlukan API key berbayar. Pemrosesan gambar dieksekusi secara lokal langsung di browser pengguna (*in-browser processing*) menggunakan WebAssembly dan Web Workers berkat teknologi pintar `@imgly/background-removal`.

---

## 🌟 Fitur Utama

1. **Penghapusan Background Otomatis** — Pemisahan subjek foto presisi berbasis neural network ONNX lokal langsung di browser.
2. **100% Client-Side & Privasi Terjaga** — Gambar Anda tidak pernah diunggah ke server eksternal mana pun.
3. **Tanpa Watermark & 100% Gratis** — Unduh gambar bersih tanpa watermark atau biaya berlangganan.
4. **Sistem Unggah Fleksibel** — Mendukung format JPG, JPEG, PNG, dan WebP hingga ukuran 15MB dengan validasi otomatis dan clipboard paste (`Ctrl + V`).
5. **Interactive Comparison Slider** — Slider interaktif dual-clipping yang memotong sisi sebelum dan sesudah secara independen untuk mencegah kebocoran background asli.
6. **3 Opsi Pratinjau Latar Bersih** — Pratinjau transparan (motif *checkerboard*), putih bersih, dan hitam kontras.
7. **Unduh PNG Transparan Sekali Klik** — Mengunduh file PNG transparan beresolusi tinggi (`remova-[nama-file].png`).
8. **Modern Light Design System** — Tipografi *Plus Jakarta Sans* / *Inter*, Lucide Icons, soft shadow, dan antarmuka responsif ramah mobile.

---

## 📁 Struktur Proyek

```
remova/
├── .gitignore                # Pengecualian node_modules, dist, dan file log dari git
├── dist/                     # Hasil kompilasi siap produksi (Vite production build)
├── public/
│   └── assets/               # Gambar sampel (sneaker, portrait, camera) & demo SVG
├── src/
│   ├── css/
│   │   └── style.css         # Design system, light theme, komponen UI, & responsive queries
│   ├── js/
│   │   ├── app.js            # Orkestrasi event & aplikasi utama (Bahasa Indonesia)
│   │   ├── backgroundRemoval.js # Engine pemrosesan gambar lokal (@imgly/background-removal)
│   │   └── ui.js             # Slider controller, Toast notification, validasi file
│   └── main.js               # Entry point modul Vite
├── index.html                # Markup semantik landing page Remova (Bahasa Indonesia)
├── package.json              # Dependency & scripts
├── vite.config.js            # Konfigurasi build Vite & resolusi modul ESM
└── vercel.json               # Konfigurasi deployment Vercel (WASM / COOP / COEP / Caching)
```

---

## 🚀 Panduan Menjalankan Secara Lokal (Development)

Jalankan perintah ini hanya jika Anda ingin mengembangkan atau menguji website di komputer lokal:

```bash
# 1. Masuk ke direktori proyek
cd c:\xampp\htdocs\Remova

# 2. Instalasi dependency (jika belum terpasang)
npm install

# 3. Jalankan development server
npm run dev
```

Buka URL: **`http://localhost:3000`** di browser Anda.

---

## ☁️ Panduan Deployment ke GitHub & Vercel (Online Permanen)

Project ini telah dikonfigurasi agar dapat langsung di-deploy ke **Vercel** dan berjalan online secara mandiri tanpa membutuhkan komputer lokal Anda menyala.

### Langkah 1: Hubungkan ke GitHub

Buka terminal di folder project (`c:\xampp\htdocs\Remova`) dan jalankan:

```bash
# Inisialisasi repository git
git init

# Tambahkan seluruh file ke staging (node_modules dan dist otomatis diabaikan berkat .gitignore)
git add .

# Buat commit perdana
git commit -m "feat: initial commit remova production ready"

# Buat repository baru di https://github.com/new (misal: "remova")
# Hubungkan repository lokal ke GitHub (ganti USERNAME dan REPO dengan milik Anda):
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

### Langkah 2: Deploy di Vercel

1. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan login dengan akun GitHub Anda.
2. Klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Pilih repository GitHub **`remova`** yang baru saja Anda push, lalu klik **"Import"**.
4. Di bagian **Configure Project**:
   - **Framework Preset**: Pilih **`Vite`** (Vercel biasanya mendeteksi ini secara otomatis).
   - **Root Directory**: Biarkan `./`.
   - **Build Command**: `npm run build` (sudah otomatis sesuai `vercel.json`).
   - **Output Directory**: `dist` (sudah otomatis sesuai `vercel.json`).
   - **Install Command**: `npm install`.
5. Klik **"Deploy"**.

Tunggu sekitar 1–2 menit hingga proses build selesai. Vercel akan memberikan domain publik gratis (contoh: `https://remova.vercel.app`) yang dapat diakses oleh siapa saja di seluruh dunia tanpa perlu server lokal.

---

## 🧪 Hasil Pengujian Kualitas (Testing & Quality Control)

- [x] **Zero Localhost Dependency:** Tidak ada URL localhost di dalam kode sumber aplikasi.
- [x] **Format Gambar JPG/JPEG:** Berhasil diunggah dan divalidasi.
- [x] **Format Gambar PNG:** Berhasil diproses dengan transparansi alpha murni.
- [x] **Format Gambar WebP:** Berhasil diunggah dan diproses.
- [x] **Drag & Drop & Clipboard Paste:** Berfungsi mulus dari sistem file dan tombol keyboard `Ctrl + V`.
- [x] **Pemrosesan Lokal:** Berjalan di Web Worker dan menghasilkan Blob PNG transparan tanpa kebocoran background.
- [x] **Interactive Comparison Slider:** Berfungsi mulus di desktop (mouse) dan mobile (touch) dengan pemotongan dua sisi.
- [x] **Download PNG:** Mengunduh file PNG berlatar belakang transparan dengan nama terformat rapi.
- [x] **Mobile Responsiveness:** Navigasi hamburger menu, penyesuaian tata letak kartu, dan nol horizontal overflow.
- [x] **Vite Production Build:** Berhasil dikompilasi tanpa error (`npm run build`).

---

&copy; 2026 Remova. Hak cipta dilindungi undang-undang.
