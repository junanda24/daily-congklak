# Spec — congklak

## Konteks

Game congklak digital (web artifact static). Papan: 14 lubang kecil
(7 per sisi) + 2 lumbung, 98 biji (7 per lubang). Urutan tabur melingkar:
baris bawah kiri→kanan, lumbung kanan (pemain bawah), baris atas kanan→kiri,
lumbung kiri (pemain atas), kembali ke baris bawah. Lumbung lawan selalu
dilewati (tidak diisi).

## Requirements

### R1 — Papan awal

- SHALL: saat permainan baru dimulai, setiap lubang kecil berisi tepat 7
  biji dan kedua lumbung kosong (total 98 biji).
- WHEN permainan dimulai THEN papan menampilkan 14 lubang × 7 biji dan
  lumbung 0–0.

### R2 — Tabur

- SHALL: pemain memilih satu lubang berisi di sisinya sendiri; semua biji
  di lubang itu ditabur satu per satu ke lubang-lubang berikutnya mengikuti
  urutan melingkar, termasuk lumbung sendiri, melewati lumbung lawan.
- WHEN pemain mengetuk lubang berisi di sisinya THEN biji-biji bergerak
  satu per satu (animasi) ke lubang berikutnya sesuai urutan.
- WHEN pemain mengetuk lubang kosong atau lubang lawan atau saat bukan
  gilirannya THEN tidak terjadi apa-apa (dan ada umpan balik visual ringan
  bahwa lubang itu tidak bisa dipilih).

### R3 — Giliran tambahan

- SHALL: bila biji terakhir jatuh di lumbung sendiri, pemain yang sama jalan
  lagi.
- WHEN biji terakhir masuk lumbung sendiri THEN giliran tidak berpindah dan
  pesan "Jalan lagi!" tampil.

### R4 — Tembak

- SHALL: bila biji terakhir jatuh di lubang kosong di sisi sendiri DAN
  lubang tepat di seberangnya berisi, biji itu beserta seluruh isi lubang
  seberang masuk ke lumbung sendiri.
- WHEN kondisi itu terjadi THEN animasi tembak berjalan dan skor lumbung
  bertambah sejumlah biji yang dirampas + 1, dengan pesan "TEMBAK! +N".

### R5 — Jalan terus

- SHALL: bila biji terakhir jatuh di lubang berisi (sisi mana pun, bukan
  lumbung), pemain meraup seluruh isi lubang itu dan melanjutkan menabur
  dari lubang berikutnya.
- WHEN biji terakhir jatuh di lubang berisi THEN taburan berlanjut tanpa
  giliran berpindah.

### R6 — Giliran berpindah

- SHALL: bila biji terakhir jatuh di lubang kosong di sisi sendiri yang
  seberangnya kosong, atau di lubang kosong sisi lawan, giliran berpindah
  ke pemain lain.
- WHEN kondisi itu terjadi THEN indikator giliran berpindah dan log
  mencatat kejadiannya.

### R7 — Akhir permainan

- SHALL: permainan berakhir begitu satu sisi kosong di awal giliran pemain
  itu; seluruh sisa biji di sisi lawan masuk ke lumbung pemilik sisi itu;
  pemain dengan biji lumbung lebih banyak menang; 49–49 seri.
- WHEN satu sisi kosong THEN layar akhir menampilkan pemenang (atau seri),
  skor akhir kedua lumbung, dan tombol Main Lagi + Ganti Mode.
- WHEN permainan berakhir THEN total biji di kedua lumbung selalu 98.

### R8 — Mode permainan

- SHALL: tersedia mode Lawan AI (tingkat Mudah / Sedang / Sulit) dan mode
  2 Pemain di satu layar.
- WHEN mode 2 Pemain dipilih THEN kedua sisi bisa dimainkan manusia secara
  bergantian, tanpa AI.
- WHEN mode Lawan AI dipilih THEN AI bermain otomatis saat gilirannya,
  dengan jeda yang terbaca (tidak instan, tidak lebih dari ~2,5 detik per
  langkah pikir).

### R9 — AI minimax

- SHALL: AI memakai minimax dengan alpha-beta pruning atas aturan R2–R7;
  kedalaman per tingkat (dikunci simulasi 2026-11-16, lihat
  `BALANCE_AI_2026-11-16.md`): Mudah = depth 2 + 50% langkah acak,
  Sedang = depth 3 + 40% langkah acak, Sulit = depth 6 tanpa acak.
- WHEN AI berpikir THEN langkah yang dipilih adalah langkah legal terbaik
  menurut evaluasi kedalaman itu (untuk Mudah/Sedang, sebagian langkah
  dipilih acak dari langkah legal sesuai persentase).
- WHEN simulasi validasi dijalankan THEN tingkat kemenangan AI vs pemain
  serakah (proxy pemain kasual yang paham aturan): Mudah 54% (target
  40–55%), Sedang 70% (target 60–75%), Sulit 100% (target ≥ 85%);
  vs pemain minimax-3 (proxy pemain bagus): Sulit 50% — Sulit sulit
  tapi bisa dikalahkan pemain bagus.

### R10 — Animasi & suara

- SHALL: setiap biji yang ditabur terlihat bergerak lubang demi lubang
  (~120 ms per lompatan); lubang terakhir yang menerima biji disorot;
  suara klik per biji, bunyi khusus saat tembak, dan fanfare saat menang
  (WebAudio, tanpa file eksternal); ada tombol bisu.
- WHEN prefers-reduced-motion aktif THEN animasi dipersingkat (lompatan
  30 ms) tanpa menghilangkan informasi urutan.

### R11 — Skor, giliran & log

- SHALL: jumlah biji tiap lumbung selalu terlihat; indikator giliran
  menunjukkan siapa jalan; log menampilkan 3 kejadian terakhir
  ("Kamu menabur dari lubang 3", "AI TEMBAK +8", dst).
- WHEN giliran berubah THEN indikator dan log diperbarui sebelum input
  berikutnya diterima.

### R12 — Layar mulai & aturan

- SHALL: layar mulai menampilkan pilihan mode + tingkat kesulitan, tombol
  Cara Main (aturan lengkap R2–R7 dalam Bahasa Indonesia), dan rekor
  menang/kalah/seri vs AI per tingkat.
- WHEN pemain membuka Cara Main THEN aturan tampil lengkap dan bisa
  ditutup kembali ke layar mulai.

### R13 — Rekor & simpanan

- SHALL: hasil tiap permainan vs AI (menang/kalah/seri per tingkat) dan
  pengaturan (suara, mode & tingkat terakhir) tersimpan di localStorage
  dalam envelope berversi; data rusak/versi lama tidak merusak game
  (fallback ke default).
- WHEN permainan vs AI selesai THEN rekor diperbarui dan terlihat di layar
  mulai berikutnya.

### R14 — Responsif & aksesibel

- SHALL: papan muat penuh pada lebar 360 px tanpa scroll horizontal;
  target sentuh lubang ≥ 44×44 px; papan bisa dimainkan penuh dengan
  keyboard (Tab ke lubang, Enter/Space untuk menabur); kontras teks
  ≥ 4,5:1; tidak ada tombol mati; tidak ada teks placeholder.
- WHEN halaman dibuka di HP THEN seluruh kontrol terjangkau tanpa zoom.

### R15 — Tanpa backend

- SHALL: game berjalan penuh tanpa server, login, atau koneksi setelah
  halaman termuat (kecuali font web).
