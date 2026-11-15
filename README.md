# CONGKLAK! — Main Congklak Lawan AI

Permainan congklak tradisional Indonesia yang bisa dimainkan langsung di
browser HP: lawan AI (3 tingkat kesulitan) atau lawan teman di satu layar.
Aturannya congklak asli — jalan terus, tembak, giliran tambahan — bukan
aturan Kalah Barat yang disederhanakan. Papan berbentuk perahu kayu jati di
atas laut teal, biji kerang, animasi tabur biji demi biji, suara WebAudio,
dan rekor yang tersimpan di HP.

Rilis: **2026-11-16** · Program "1 Hari 1 Project" · Repo:
https://github.com/junanda24/daily-congklak · Game: artifact `congklak`
(di Library Muse — buka lewat kartu artifact).

## Kenapa ide ini dipilih

Hampir semua orang Indonesia pernah main congklak di teras rumah, tapi
hampir tidak ada versi digitalnya yang bagus dan jujur aturannya. Kebanyakan
game "mancala" di toko aplikasi memakai aturan Kalah yang disederhanakan
(giliran selesai begitu biji habis). Congklak asli justru hidup karena dua
aturannya yang khas: **jalan terus** (biji terakhir jatuh di lubang berisi =
raup lagi, lanjut tabur) dan **tembak** (jatuh di lubang kosong sendiri =
rampas lubang seberang). Itu yang bikin satu giliran bisa berantai panjang
dan menegangkan — dan itu yang diimplementasikan di sini, diverifikasi dari
tiga sumber aturan (blinky.games, family.lazada.co.id, gamesrules.net).

Efek kejutnya: nostalgia + lawan AI yang benar-benar menghitung (minimax),
bukan gerak acak.

## Fitur

- Papan congklak lengkap: 14 lubang (7 per sisi) + 2 lumbung, 98 biji
  (7 per lubang), sesuai aturan tradisional.
- Aturan asli: tabur melingkar, jalan terus, tembak, giliran tambahan dari
  lumbung, akhir permainan saat satu sisi kosong (sisa biji masuk lumbung
  pemilik sisi; 49–49 = seri).
- Mode Lawan AI (3 tingkat: Mudah, Sedang, Sulit) dan mode 2 Pemain di
  satu layar.
- AI minimax + alpha-beta pruning. Tingkat kesulitan dikunci lewat simulasi
  (lihat `BALANCE_AI_2026-11-16.md`): Mudah = depth 2 + 50% langkah acak
  (menang 54% vs pemain serakah), Sedang = depth 3 + 40% acak (70%),
  Sulit = depth 6 tanpa acak (100% vs serakah, 50% vs pemain minimax-3 —
  sulit tapi bisa dikalahkan pemain bagus). Waktu pikir AI maks 21 ms.
- Animasi tabur biji demi biji (~120 ms per lompatan), sorot lubang
  terakhir, pesan "Jalan lagi!" dan "TEMBAK! +N", confetti saat menang.
- Suara WebAudio murni (klik per biji, bunyi tembak, fanfare menang),
  tombol bisu yang tersimpan.
- Log 3 kejadian terakhir + penanda giliran yang selalu jelas.
- Modal Cara Main berisi aturan lengkap Bahasa Indonesia.
- Layar akhir: pemenang/seri, skor akhir, satu tips strategi, tombol
  Main Lagi + Ganti Mode.
- Rekor menang/kalah/seri vs AI per tingkat + pengaturan tersimpan di
  localStorage (`congklak-v1`, envelope berversi, fallback aman bila data
  rusak).
- Aksesibel: lubang adalah tombol asli — bisa dimainkan penuh dengan
  keyboard (Tab + Enter/Space), target sentuh ≥ 44 px, kontras ≥ 4,5:1,
  hormat `prefers-reduced-motion`.

## Cara main

1. Buka gamenya, pilih mode **Lawan AI** atau **2 Pemain**.
2. Kalau lawan AI, pilih tingkat kesulitan (Mudah / Sedang / Sulit).
3. Ketuk **Mulai Main**.
4. Di giliranmu, ketuk salah satu lubang di barismu (baris bawah). Semua
   biji di lubang itu ditabur satu per satu mengelilingi papan.
   - Biji terakhir jatuh di lumbungmu sendiri → **jalan lagi**.
   - Biji terakhir jatuh di lubang kosong di sisimu dan seberangnya ada
     isi → **TEMBAK!** Kamu rampas semua biji itu ke lumbungmu.
   - Biji terakhir jatuh di lubang berisi → **jalan terus**: raup lagi,
     lanjut tabur.
5. Kumpulkan biji ke lumbungmu sebanyak-banyaknya. Permainan berakhir saat
   satu sisi kosong. **50 biji atau lebih = menang.**

## Cara menjalankan dari source

Tidak ada build step. Buka `src/index.html` langsung di browser (klik dua
kali, atau sajikan dengan server statis apa pun, mis. `python3 -m http.server`
dari folder project lalu buka `http://localhost:8000/src/`).

## Tech stack

- HTML + CSS + JavaScript murni (single-file, tanpa framework, tanpa
  build step, tanpa backend, tanpa login).
- Font: Baloo 2 + Nunito (Google Fonts, dengan fallback sistem).
- Suara: WebAudio API (tanpa file audio).
- Simpanan: localStorage.
- AI: minimax + alpha-beta pruning (implementasi di dalam file game).

## Struktur folder

```
2026-11-16-congklak/
├── README.md                    # dokumen ini
├── PRODUCT.md                   # konteks produk (impeccable init)
├── SURFACE_BRIEF.md             # direction contract "Perahu & Laut"
├── BALANCE_AI_2026-11-16.md    # laporan tuning AI (3 ronde simulasi)
├── simulate_ai.mjs              # mesin aturan + minimax + simulasi ronde 1
├── simulate_round2.mjs          # tuning ronde 2
├── simulate_round3.mjs          # tuning ronde 3 (kunci Sedang)
├── verify_game.mjs              # verifikasi mandiri: main penuh di jsdom
├── src/
│   └── index.html               # game lengkap (export artifact)
└── openspec/
    └── changes/
        ├── 2026-11-16-congklak/
        │   ├── proposal.md
        │   ├── design.md
        │   ├── tasks.md
        │   └── specs/congklak/spec.md
        └── archive/             # arsip change setelah selesai
```

## Verifikasi

- **Aturan + AI (Node):** `simulate_ai.mjs` + ronde 2–3 — 760+ permainan
  simulasi; total biji selalu 98; tingkat kesulitan dikunci dari angka
  (lihat `BALANCE_AI_2026-11-16.md`).
- **Main penuh (jsdom, `verify_game.mjs`):** 18/18 cek LOLOS — memuat
  `src/index.html`, memainkan satu permainan penuh vs AI (default Sedang)
  sampai layar akhir (16 langkah, 66 detik; skor akhir 35–63, jumlah
  98), Main Lagi mereset papan 14×7, rekor tersimpan di localStorage
  (`congklak-v1`, envelope berversi), mode 2 Pemain giliran berpindah,
  modal Cara Main, toggle suara — tanpa console error. Satu ronde
  verifikasi lain berakhir 55–43 (menang), membuktikan hasil permainan
  bervariasi, bukan skrip.
- **Audit builder:** tanpa console error, tanpa overflow horizontal di
  390 px, tanpa kontrol tak terjangkau; TEMBAK +9 sungguhan terpicu di
  probe mode 2 Pemain; bunyi WebAudio tidak bisa didengar audit (jalur
  kode terpicu tanpa error); layar akhir tidak dimainkan ujung-ke-ujung
  di browser oleh builder — ditutup oleh verifikasi jsdom di atas.

## Catatan / keputusan saat build

- **DOM, bukan canvas.** Papan dibangun dari tombol `<button>` asli, bukan
  canvas, supaya R14 (main penuh dengan keyboard) terpenuhi dengan jujur.
  Animasi tetap halus karena game berbasis giliran (bukan 60 fps).
- **Tanpa backend.** Semua logika client-side; skor tersimpan lokal.
  Multiplayer online sengaja tidak dibuat (di luar scope satu sesi).
- **Arah visual "Perahu & Laut"** (seed e72f069f, kandidat 5 dari 7):
  papan congklak memang berbentuk perahu, jadi perahu itu yang jadi
  dunia visualnya — bukan tempelan. Roll concept-seed berjalan degraded
  (service tidak terjangkau, tanpa challenger/board); arah diambil dari
  daftar grounded sendiri.
- **Build code-led** (tanpa ronde comp): jalur comp-led dengan measured-diff
  gates melampaui anggaran satu sesi; ambisi hidup di direction contract
  (`SURFACE_BRIEF.md`).
- **ui-ux-pro-max design-system search** mengembalikan pola "Trust &
  Authority" (fintech) yang tidak cocok untuk game papan tradisional —
  tidak dipakai; yang dipakai adalah tabel prioritas skill itu
  (aksesibilitas, sentuh 44 px, mobile-first, tanpa scroll horizontal,
  reduced-motion) + arah visual sendiri.
- **Satu-satunya RNG** adalah langkah acak tingkat Mudah/Sedang dan
  tie-break AI; aturan murni deterministik.
