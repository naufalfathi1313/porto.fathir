# Website Portofolio Fathir

Buka `index.html` di browser buat lihat hasilnya. Semua file harus tetap di folder yang sama.

## Isi folder

| File | Isinya |
|---|---|
| `index.html` | Semua teks dan urutan section (About, Thinking Proses, Result, Proses, Organisasi, Pendidikan, Skills, Kontak) |
| `css/style.css` | Tampilan: warna, ukuran font, layout, animasi |
| `js/main.js` | Animasi scroll, angka yang ngitung naik, nav, zoom kalender, urutan prioritas, dan video |
| `assets/fonts/` | Font Uncut Sans |
| `assets/img/` | Foto profil dan screenshot kalender |
| `assets/video/` | Video 10 detik buat kartu Konten dan Publikasi (lihat `README.txt` di dalamnya) |

## Yang paling sering diedit

- **Ganti teks:** buka `index.html`, cari kalimatnya (Ctrl/Cmd + F), terus ganti.
- **Ganti warna kuning:** di `css/style.css`, ubah `--accent` di bagian `:root`.
- **Ganti foto:** timpa `assets/img/foto-fathir.jpg` pakai foto baru dengan nama yang sama.
- **Tambah entri timeline:** di `index.html`, copy satu baris `<div class="ti">…</div>` di section Proses. Kalau mau di-highlight, pakai `class="ti hl"` dan tambahin `<span class="badge">Featured</span>`.
- **Video 10 detik:** taruh `konten.mp4` dan `publikasi.mp4` (portrait 9:16, tanpa suara) di `assets/video/`. Otomatis muncul dan muter pas kelihatan; sebelum ada file-nya, yang tampil kotak placeholder.
- **Angka yang ngitung naik:** atur lewat atribut `data-count` (misalnya `data-count="350"`).

## Upload ke internet

Upload isi folder ini apa adanya ke hosting statis (misalnya GitHub Pages, Netlify, atau Vercel). `index.html` otomatis jadi halaman utama.
