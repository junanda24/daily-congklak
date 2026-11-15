# Proposal — CONGKLAK! (2026-11-16)

## Apa & kenapa

**CONGKLAK!** — permainan congklak tradisional Indonesia yang bisa dimainkan
langsung di browser HP: lawan AI (3 tingkat kesulitan) atau lawan teman di
satu layar yang sama.

Kenapa ide ini mengejutkan:

- **Nostalgia yang belum pernah dibuat di program ini.** 31 project harian
  sudah ada — kuis, tycoon, kalkulator, paket npm — tapi belum satu pun
  permainan papan tradisional. Congklak adalah game yang hampir semua orang
  Indonesia pernah mainkan di teras rumah, tapi hampir tidak ada versi
  digitalnya yang bagus dan jujur aturannya.
- **Aturannya beda dari mancala Barat.** Kebanyakan game "mancala" di toko
  aplikasi memakai aturan Kalah yang disederhanakan (giliran selesai begitu
  biji habis). Congklak asli punya *jalan terus* (biji terakhir jatuh di
  lubang berisi = raup lagi, lanjut tabur) dan *tembak* (jatuh di lubang
  kosong sendiri = rampas lubang seberang). Itu yang bikin congklak terasa
  hidup — dan itu yang kami implementasikan, diverifikasi dari tiga sumber
  aturan (blinky.games, family.lazada.co.id, gamesrules.net, dicek
  2026-11-16).
- **AI yang benar-benar berpikir.** Lawan memakai minimax + alpha-beta
  pruning, bukan gerak acak. Tiga tingkat kesulitan divalidasi dengan
  simulasi (lihat `simulate_ai.mjs`): Mudah, Sedang, Sulit punya tingkat
  kemenangan yang terukur, bukan sekadar label.
- **Papan berbentuk perahu.** Papan congklak tradisional memang berbentuk
  perahu — dan itu jadi dunia visualnya: laut, kayu, tali, kerang.

## Bentuk output: game web (artifact static)

Dipilih karena game harus bisa langsung dimainkan Junan di HP begitu link
dibuka — tanpa install, tanpa login. Frontend-only cukup: semua logika
(aturan, AI, animasi, suara, simpanan rekor) jalan client-side. **Tanpa
backend** — backend tidak menambah apa-apa di sini; skor disimpan di
localStorage.

## GDD ringkas (game-designer)

**Pitch:** Congklak Nusantara digital — tabur biji, tembak lawan, rebut
lumbung. Lawan AI yang menghitung atau teman satu HP.

**Tiga pilar:**

1. **Aturan asli dulu** — congklak, bukan Kalah. Jalan terus + tembak + giliran tambahan.
2. **Setiap langkah terbaca** — animasi tabur biji per biji + narasi giliran, pemain selalu tahu kenapa giliran berpindah.
3. **Lawan yang berpikir** — AI minimax jujur per tingkat kesulitan.

**Core loop (30 detik):** pilih lubang → saksikan biji ditabur satu per satu
→ dapat giliran lagi / tembak / giliran pindah → biji masuk lumbung.
**(5 menit):** satu permainan penuh, kejar 50 biji. **(Sesi):** kalahkan
tingkat Sulit, perbaiki rekor menang/kalah.

**Lose-loop:** kalah = skor akhir + satu tips strategi singkat (mis.
"akhiri taburan di lumbung sendiri supaya jalan lagi") + tombol Main Lagi
langsung. Kalah itu pelajaran, bukan hukuman.

**Vertical slice:** papan playable penuh + AI Mudah + animasi tabur + skor +
layar akhir + ulang. Tes terima: pemain baru menyelesaikan satu permainan
penuh tanpa bantuan dalam < 10 menit.

## Uji standar TERCENGANG

"Kalau Junan lihat jam 5 pagi, dia senyum kaget atau cuma 'oh'?"
Jawab: senyum kaget — "wah, congklak! bisa main lawan AI pula."
Bukan utilitas satu fungsi, bukan klon generik. Lolos bar scope.

## Anti-AI-slop

Copy Bahasa Indonesia natural, pakai istilah asli (lumbung, tembak, jalan
terus, raup). Tidak ada lorem ipsum, tidak ada teks placeholder.

## IP check

Semua aset visual original: papan dan biji digambar dengan CSS/SVG sendiri.
Tidak ada sprite/karakter berlisensi. Congklak adalah permainan tradisional
(domain publik secara budaya); tidak ada klaim merek pihak ketiga.

## Kepatuhan

Mengikuti `CODE_STANDARDS.md` + `ARCHITECTURE.md` (bagian 1 static + bagian 5
game). Skill yang dipakai — lihat ledger di laporan akhir.
