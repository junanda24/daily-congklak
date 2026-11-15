# Design — CONGKLAK!

## Stack

- Web artifact static (single-file): `index.html` (struktur) +
  `<style>` (design token → komponen → responsif) + `<script>` (state →
  render → events). Tanpa framework, tanpa build step — sesuai
  `ARCHITECTURE.md` §1 (static) dan §5 (game).
- Font: Baloo 2 (display, 700/800) + Nunito (body, 400/600/700) via
  Google Fonts, dengan fallback sistem. Dipilih karena berkarakter bulat
  dan ramah (game), dan bukan dari daftar wajah default yang dilarang
  skill impeccable tanpa alasan (Fraunces/Playfair/Syne/Space Grotesk/
  IBM Plex/Inter/DM Sans/Outfit/Plus Jakarta Sans/Instrument Sans).
- Suara: WebAudio API murni (oscillator + noise), tanpa file audio.
- Penyimpanan: localStorage, satu modul `store` (envelope berversi
  `{v:1, records, settings}` + migrasi + try/catch).

## Arsitektur (ARCHITECTURE.md)

- **Satu game loop implisit:** bukan canvas 60fps — game berbasis giliran
  (turn-based). Animasi tabur memakai rantai `setTimeout` per lompatan
  (±120 ms); tidak ada alokasi per-frame di hot path.
- **State machine eksplisit:** `MENU → PLAYING → SOWING → AI_THINKING →
  GAME_OVER`. Input diabaikan di luar `PLAYING` (input buffering: ketukan
  saat animasi/AI diabaikan, bukan diantre).
- **Satu objek state:** `state = { board:[16], turn, mode, difficulty,
  phase, scores, log[], muted, ... }`. Board = array 16 slot
  (0–6 lubang pemain bawah, 7 lumbung pemain, 8–14 lubang lawan,
  15 lumbung lawan). Fungsi murni: `legalMoves(board, player)`,
  `applyMove(board, player, pit)` → `{board, nextTurn, events[]}`,
  `isGameOver(board)`, `finalize(board)`.
- **AI terpisah dari UI:** `ai.js`-logic di dalam file yang sama tapi
  sebagai modul fungsi murni `chooseMove(board, depth, randomness)` —
  minimax + alpha-beta, evaluasi = selisih lumbung + bonus lubang.
  Tunable di `CONFIG`: Mudah = depth 2 + 50% acak, Sedang = depth 3 +
  40% acak, Sulit = depth 6 + 0% acak (dikunci simulasi, lihat
  `BALANCE_AI_2026-11-16.md`).
- **Render murni:** `render()` membaca state → update DOM. Tidak ada
  logika bisnis di event handler; handler tipis (baca input → update
  state → render).
- **Determinisme:** aturan murni deterministik; satu-satunya RNG adalah
  pilihan acak tingkat Mudah + tie-break AI. Dicatat di TECH_NOTES
  (bagian bawah file ini).
- **Pemisahan file (repo):** `src/index.html` (hasil export artifact),
  `simulate_ai.mjs` (simulasi validasi AI, Node), `README.md`,
  `openspec/` (arsip change). Tidak ada import antar-fitur (single-file).

## State: lima keranjang (ARCHITECTURE.md §2)

1. **Lokal:** seluruh state permainan (`useState`-setara: satu objek
   `state` + `render()`).
2. **URL:** tidak ada (permainan bukan state shareable).
3. **Server state:** tidak ada (tanpa backend).
4. **Global client UI:** hanya `muted` + mode/difficulty terakhir
   (disimpan via `store`).
5. **Form:** tidak ada form.

## Dunia visual — "Perahu & Laut" (direction seed e72f069f, kandidat 5/7)

Papan congklak tradisional berbentuk perahu — dunia visualnya adalah
perahu itu sendiri, bukan sekadar "papan kayu di atas krem":

- **Ground:** laut dalam (teal gelap `#0B3B3E` → `#0E4A4F`), bukan krem.
  Permukaan air digambar sebagai garis-garis ombak halus (SVG, bukan
  gradien dekoratif).
- **Papan:** lambung kayu jati (`#8A5A2B`, serat kayu via pola SVG halus),
  berbentuk perahu dengan ujung meruncing; lubang = kompartemen lambung;
  lumbung = palka kargo di kedua ujung.
- **Biji:** kerang/batu putih gading (`#F5EFE0`) dengan bayangan teal;
  jumlah biji ditampilkan sebagai angka di dalam lubang (bukan puluhan
  elemen DOM per biji — angka + 3–5 butir visual representatif).
- **Aksen:** kuningan/emas redup (`#C9A227`) untuk skor dan tombol utama;
  merah bata (`#B4432F`) hanya untuk pesan TEMBAK.
- **Tipografi:** Baloo 2 untuk judul & angka besar; Nunito untuk teks.
- **Momen delight:** biji "berlayar" lubang demi lubang (animasi hop +
  skala), efek TEMBAK (biji lawan "diserap" ke lumbung + getar halus),
  fanfare menang (confetti kerang sederhana), ombak bergerak pelan di
  latar saat giliran AI berpikir.
- **Kandidat lain yang dikalahkan (roll degraded, tanpa challenger):**
  1 papan jati literal, 2 batik mega mendung, 3 warung kopi sore,
  4 wayang kulit, 6 gerabah, 7 anyaman bambu. Perahu & laut dipilih
  karena bentuk papan itu sendiri yang jadi dunia — bukan tempelan.

## Interaksi & animasi

- Ketuk lubang → biji meraup (lubang menyusut sesaat) → hop per lubang
  (translate + scale, 120 ms, ease-out eksponensial) → sorot lubang
  terakhir → pesan giliran (pennant "Jalan lagi!" / "TEMBAK! +N").
- Giliran AI: indikator "AI sedang berpikir…" + ombak latar bergerak;
  langkah AI dianimasikan sama seperti langkah pemain (terbaca, bukan
  instan).
- Layar akhir: skor besar, pemenang, satu tips strategi, tombol
  Main Lagi (primer) + Ganti Mode.

## TECH_NOTES (gameplay-engineer)

- **Timestep:** turn-based; animasi via rantai timeout, bukan rAF loop.
  Kecepatan logika tidak terikat FPS render.
- **Frame budget:** animasi tabur ≤ 1 elemen bergerak per langkah;
  tidak ada alokasi per-frame (angka biji dihitung sekali per render).
- **Determinisme:** sim murni deterministik kecuali RNG Mudah/tie-break.
  Replay: simpan urutan langkah (move list) di state — cukup untuk
  memutar ulang permainan dari papan awal.
- **AI tick budget:** minimax depth 6, alpha-beta, branching ≤ 7 —
  diukur di simulasi (`simulate_ai.mjs`); target < 2 detik per langkah
  di mesin build. Bila melebihi, turun ke depth 5 (dicatat di verify).
