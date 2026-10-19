Taruh video 10 detik di sini (portrait 9:16, mp4, boleh bersuara, di bawah ~5MB):
  konten.mp4     -> slot di kartu Konten
  publikasi.mp4  -> slot di kartu Publikasi
konten-cover.jpg & publikasi-cover.jpg = cover video (720x1280), tampil selama video dimuat dan setelah video selesai; ketuk cover buat putar lagi.
Kalau ganti video, kompres dulu biar enteng di HP, contoh:
  ffmpeg -i asli.mp4 -vf scale=720:1280 -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k -movflags +faststart konten.mp4
Selama file belum ada, website nampilin kotak placeholder.
