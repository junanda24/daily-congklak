# Balance — AI CONGKLAK! — 2026-11-16

**Intent (GDD):** "AI harus terasa seperti lawan yang berpikir, bukan mesin
acak — tingkat kesulitan yang jujur."
**Target (terukur):** vs pemain serakah (proxy pemain kasual yang paham
aturan): Mudah 40–55%, Sedang 60–75%, Sulit ≥ 85%. Waktu pikir AI < 2 detik
per langkah.

## Formulas

| Parameter | Formula | Konstanta | Kenapa bentuk ini |
|---|---|---|---|
| Evaluasi posisi | `storeDiff * 10 + pitDiff * 0.5` | 10 / 0.5 | Lumbung adalah skor akhir; biji di lubang hanya potensi |
| Mudah | minimax depth 2, 50% langkah acak | depth 2, p=0.5 | Sering blunder, tapi kadang menemukan tembak |
| Sedang | minimax depth 3, 40% langkah acak | depth 3, p=0.4 | Melihat satu langkah lebih dalam dari Mudah, blunder lebih jarang |
| Sulit | minimax depth 6, tanpa acak | depth 6, p=0 | Bermain nyaris optimal; hanya bisa dikalahkan pemain bagus |

## Simulation

Script: `simulate_ai.mjs` (ronde 1) + `simulate_round2.mjs` +
`simulate_round3.mjs` | 100 game per seri (60 untuk Sulit vs serakah,
30 untuk depth 8) | pemain pertama digilir tiap game.

| Seri | Hasil |
|---|---|
| Ronde 1 — Mudah (depth 2 + 25% acak) vs acak | 97% menang — GAGAL (target 55–70%): pemain acak ternyata jauh lebih lemah dari perkiraan |
| Ronde 1 — Sedang (depth 4) vs serakah | 100% — GAGAL (target 55–70%) |
| Ronde 2 — depth 1 + 50% acak vs serakah | 24% — terlalu lemah |
| Ronde 2 — depth 2 + 50% acak vs serakah | 54% — PASS (target Mudah 40–55%) |
| Ronde 2 — depth 2 + 40% acak vs serakah | 63% |
| Ronde 2 — depth 3 + 25% acak vs serakah | 84% — terlalu kuat untuk Sedang |
| Ronde 3 — depth 2 + 30% acak vs serakah | 74% |
| Ronde 3 — depth 2 + 35% acak vs serakah | 70% |
| Ronde 3 — depth 3 + 40% acak vs serakah | 70% — PASS (target Sedang 60–75%), dipilih: berpikir lebih dalam saat tidak blunder |
| Ronde 2 — depth 6 vs serakah | 100% — PASS (target Sulit ≥ 85%) |
| Ronde 2 — depth 6 vs minimax-3 (pemain bagus) | 50% — Sulit bisa dikalahkan pemain bagus, bukan mustahil |
| Ronde 2 — depth 8 vs serakah | 100%, rata-rata 13 ms/langkah — tidak ada manfaat vs depth 6, tidak dipakai |

Waktu pikir AI: depth 6 rata-rata 2 ms, maks 21 ms (target < 2 detik: PASS
dengan margin besar). Depth 8 maks 85 ms — tetap cepat, tapi tidak menambah
kemenangan, jadi Sulit tetap depth 6.

## Tuning log

- Ronde 1: target awal (vs acak) salah — pemain acak terlalu lemah sebagai
  proxy manusia. Ganti proxy ke "serakah" (maksimalkan lumbung langsung).
- Ronde 2: petakan kurva acak-vs-kedalaman; depth ≥ 3 tanpa acak sudah
  100% vs serakah. Mudah ketemu di depth 2 + 50% acak.
- Ronde 3: kunci Sedang di depth 3 + 40% acak (70%).

## Keputusan akhir (dikunci ke CONFIG game)

- Mudah = depth 2, acak 50% — 54% vs serakah; 0% vs pemain minimax-2.
- Sedang = depth 3, acak 40% — 70% vs serakah.
- Sulit = depth 6, acak 0% — 100% vs serakah; 50% vs pemain minimax-3.
