# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: web artifact static (single-file HTML/CSS/JS, client-side only, no backend) — chosen per the daily program's rule that web games ship as playable HTML5 artifacts in the browser; no framework, no build step, so the game runs instantly on a phone.

## Users

[Inferred] Orang Indonesia yang kangen main congklak — dimainkan di HP sambil santai, sendiri lawan AI atau berdua satu HP. Pemain utama: Junan dan siapa pun yang menerima link artifact-nya. Tidak ada akun, tidak ada login.

## Product Purpose

Menghidupkan kembali congklak — permainan tradisional Nusantara — sebagai game digital yang bisa dimainkan kapan saja: lawan AI dengan tiga tingkat kesulitan, atau lawan teman di satu layar. Sukses = satu permainan penuh selesai tanpa kebingungan, pemain langsung paham aturannya, dan mau main lagi.

## Positioning

Bukan sekadar papan mancala generik: aturan congklak Indonesia yang asli (jalan terus, tembak, giliran tambahan), papan kayu berbentuk perahu, biji kerang, dan AI minimax yang benar-benar menghitung — bukan lawan acak.

## Operating Context

Dimainkan di browser HP (sentuh) atau desktop (klik). Sesi 3–10 menit. Tanpa internet pun tetap jalan setelah halaman termuat (semua logika client-side). Skor dan rekor tersimpan di localStorage.

## Capabilities and Constraints

- Papan 7 lubang per sisi + 2 lumbung, 98 biji (7 per lubang).
- Aturan: tabur searah jarum jam dari sisi pemain; biji terakhir di lumbung sendiri = jalan lagi; biji terakhir di lubang kosong sisi sendiri = tembak (ambil biji itu + lubang seberang); biji terakhir di lubang berisi = jalan terus (raup lagi, lanjut tabur).
- Permainan berakhir saat satu sisi kosong; sisa biji sisi lawan masuk lumbung pemilik sisi itu. 50+ biji menang, 49–49 seri.
- Mode: lawan AI (Mudah/Sedang/Sulit) dan 2 pemain di satu layar.
- AI: minimax + alpha-beta pruning, kedalaman per tingkat kesulitan (divalidasi dengan simulasi).
- Suara WebAudio sederhana (bisa dimatikan). Animasi tabur biji per biji.
- Riwayat menang/kalah/seri tersimpan lokal; tombol ulang dan aturan selalu tersedia.
- [Inferred] Tidak ada mode online/multiplayer jaringan — di luar scope satu sesi build.

## Brand Commitments

Nama: CONGKLAK! — mengikuti pola penamaan game harian sebelumnya (JUKIR!, TAWAR!, OJOL!, TANI!). Copy Bahasa Indonesia natural, tanpa emoji di label UI. Aset visual original (papan dan biji digambar via CSS/SVG sendiri, bukan sprite berlisensi).

## Evidence on Hand

Aturan diverifikasi dari sumber web 2026-11-16: blinky.games (panduan aturan congklak), family.lazada.co.id (panduan lengkap), gamesrules.net (Congkak). Ketiganya sepakat: 7 lubang × 7 biji = 98, tembak saat jatuh di lubang kosong sendiri, jalan terus saat jatuh di lubang berisi, berakhir saat satu sisi kosong.

## Product Principles

1. Aturan asli dulu, kemudahan kemudian — jangan menyederhanakan congklak menjadi Kalah.
2. Setiap giliran harus terbaca: pemain selalu tahu kenapa giliran berpindah atau berlanjut.
3. AI harus terasa seperti lawan yang berpikir, bukan mesin acak — tingkat kesulitan yang jujur.
4. Satu layar, satu papan: tidak ada navigasi berlapis di tengah permainan.

## Accessibility & Inclusion

Target sentuh minimal 44×44px; papan harus bisa dimainkan penuh dengan keyboard (Tab + Enter); kontras teks ≥4,5:1; hormati prefers-reduced-motion (animasi tabur dipersingkat, bukan dihilangkan informasinya).
