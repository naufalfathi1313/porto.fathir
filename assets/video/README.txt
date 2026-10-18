Taruh video 10 detik di sini (portrait 9:16, mp4, boleh bersuara, di bawah ~5MB):
  konten.mp4     -> slot di kartu Konten
  publikasi.mp4  -> slot di kartu Publikasi
konten.jpg & publikasi.jpg = frame pertama video, tampil duluan selama video dimuat.
Kalau ganti video, kompres dulu biar enteng di HP, contoh:
  ffmpeg -i asli.mp4 -vf scale=720:1280 -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k -movflags +faststart konten.mp4
  ffmpeg -i konten.mp4 -frames:v 1 -q:v 4 konten.jpg
Selama file belum ada, website nampilin kotak placeholder.
