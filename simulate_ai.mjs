// simulate_ai.mjs — validasi tingkat kesulitan AI CONGKLAK!
// Aturan murni (sama persis dengan yang dipakai game) + minimax + simulasi.
// Jalankan: node simulate_ai.mjs
// Target (R9): vs pemain acak — Mudah 55-70%, Sedang 80-95%, Sulit >= 95%.
//            vs pemain serakah — Sedang 55-70%, Sulit >= 70%.
// Budget: langkah AI < 2 detik (diukur di sini).

const PITS = [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14];
export const STORE = [7, 15]; // store pemain 0 (bawah), pemain 1 (atas)
const OPP_STORE = [15, 7];
const OWN_PITS = [[0, 1, 2, 3, 4, 5, 6], [8, 9, 10, 11, 12, 13, 14]];

export function initialBoard() {
  const b = new Array(16).fill(0);
  for (const i of PITS) b[i] = 7;
  return b;
}

function opposite(pit) {
  return 14 - pit; // 0<->14, 1<->13, ..., 6<->8
}

export function legalMoves(board, player) {
  return OWN_PITS[player].filter((p) => board[p] > 0);
}

function sideEmpty(board, player) {
  return OWN_PITS[player].every((p) => board[p] === 0);
}

// Satu langkah penuh (termasuk rantai "jalan terus").
// Return { board, nextPlayer, events: [{type:'sow'|'extra'|'capture'|'pass', ...}] }
export function applyMove(boardIn, player, pit) {
  const board = boardIn.slice();
  const store = STORE[player];
  const oppStore = OPP_STORE[player];
  const events = [];
  let current = pit;
  let extraTurn = false;

  for (;;) {
    let seeds = board[current];
    board[current] = 0;
    let idx = current;
    // tabur satu per satu
    while (seeds > 0) {
      idx = (idx + 1) % 16;
      if (idx === oppStore) idx = (idx + 1) % 16; // lewati lumbung lawan
      board[idx] += 1;
      seeds -= 1;
    }
    const last = idx;
    if (last === store) {
      events.push({ type: 'extra' });
      extraTurn = true;
      break;
    }
    if (board[last] === 1) {
      // jatuh di lubang kosong
      const isOwn = OWN_PITS[player].includes(last);
      if (isOwn) {
        const opp = opposite(last);
        if (board[opp] > 0) {
          const captured = 1 + board[opp];
          board[store] += captured;
          board[last] = 0;
          board[opp] = 0;
          events.push({ type: 'capture', amount: captured });
        } else {
          events.push({ type: 'pass' });
        }
      } else {
        events.push({ type: 'pass' });
      }
      break;
    }
    // jatuh di lubang berisi -> jalan terus: raup lagi, lanjut tabur
    events.push({ type: 'chain', from: last });
    current = last;
  }

  let nextPlayer = extraTurn ? player : 1 - player;
  let over = false;
  if (sideEmpty(board, 0) || sideEmpty(board, 1)) {
    over = true;
    // sisa biji masuk lumbung pemilik sisi
    for (const p of [0, 1]) {
      for (const pitIdx of OWN_PITS[p]) {
        board[STORE[p]] += board[pitIdx];
        board[pitIdx] = 0;
      }
    }
    nextPlayer = -1;
  }
  return { board, nextPlayer, events, over };
}

export function evaluate(board, maxPlayer) {
  // selisih lumbung dominan + selisih biji di lubang sebagai tie-break
  const storeDiff = board[STORE[maxPlayer]] - board[STORE[1 - maxPlayer]];
  let pitDiff = 0;
  for (const p of OWN_PITS[maxPlayer]) pitDiff += board[p];
  for (const p of OWN_PITS[1 - maxPlayer]) pitDiff -= board[p];
  return storeDiff * 10 + pitDiff * 0.5;
}

export function minimax(board, player, depth, maxPlayer, alpha, beta) {
  if (sideEmpty(board, 0) || sideEmpty(board, 1)) {
    // finalisasi semu untuk evaluasi terminal
    const b = board.slice();
    for (const p of [0, 1]) {
      for (const pitIdx of OWN_PITS[p]) {
        b[STORE[p]] += b[pitIdx];
        b[pitIdx] = 0;
      }
    }
    return evaluate(b, maxPlayer);
  }
  if (depth === 0) return evaluate(board, maxPlayer);
  const moves = legalMoves(board, player);
  if (moves.length === 0) return evaluate(board, maxPlayer);

  // urutkan: langkah yang memberi giliran tambahan / tembak dulu (membantu alpha-beta)
  const scored = moves.map((m) => {
    const r = applyMove(board, player, m);
    let bonus = 0;
    if (r.events.some((e) => e.type === 'extra')) bonus += 5;
    if (r.events.some((e) => e.type === 'capture')) bonus += r.events.find((e) => e.type === 'capture').amount;
    return { m, r, bonus };
  });
  scored.sort((a, b) => b.bonus - a.bonus);

  if (player === maxPlayer) {
    let best = -Infinity;
    for (const { r } of scored) {
      const v = minimax(r.board, r.nextPlayer, depth - 1, maxPlayer, alpha, beta);
      best = Math.max(best, v);
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const { r } of scored) {
    const v = minimax(r.board, r.nextPlayer, depth - 1, maxPlayer, alpha, beta);
    best = Math.min(best, v);
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

export function chooseMove(board, player, depth, randomness = 0) {
  const moves = legalMoves(board, player);
  if (moves.length === 0) return null;
  if (Math.random() < randomness) {
    return moves[Math.floor(Math.random() * moves.length)];
  }
  let bestMove = moves[0];
  let bestVal = -Infinity;
  // urutan: coba capture/extra dulu
  const scored = moves.map((m) => {
    const r = applyMove(board, player, m);
    let bonus = 0;
    if (r.events.some((e) => e.type === 'extra')) bonus += 5;
    const cap = r.events.find((e) => e.type === 'capture');
    if (cap) bonus += cap.amount;
    return { m, r, bonus };
  });
  scored.sort((a, b) => b.bonus - a.bonus);
  for (const { m, r } of scored) {
    const v = minimax(r.board, r.nextPlayer, depth - 1, player, -Infinity, Infinity);
    if (v > bestVal) {
      bestVal = v;
      bestMove = m;
    }
  }
  return bestMove;
}

// --- pemain lawan untuk simulasi ---
function randomMove(board, player) {
  const moves = legalMoves(board, player);
  return moves[Math.floor(Math.random() * moves.length)];
}

function greedyMove(board, player) {
  // maksimalkan pertambahan lumbung langsung (termasuk tembak), lalu biji di sisi sendiri
  const moves = legalMoves(board, player);
  let best = moves[0];
  let bestScore = -Infinity;
  for (const m of moves) {
    const before = board[STORE[player]];
    const r = applyMove(board, player, m);
    const gain = r.board[STORE[player]] - before;
    const extra = r.events.some((e) => e.type === 'extra') ? 0.5 : 0;
    const score = gain + extra;
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return best;
}

function playGame(aiDepth, aiRandomness, opponentFn, aiFirst, timeStats) {
  let board = initialBoard();
  let player = aiFirst ? 1 : 0; // AI = pemain 1 (atas)
  for (;;) {
    const moves = legalMoves(board, player);
    if (moves.length === 0) break;
    let move;
    if (player === 1) {
      const t0 = performance.now();
      move = chooseMove(board, 1, aiDepth, aiRandomness);
      timeStats.push(performance.now() - t0);
    } else {
      move = opponentFn(board, 0);
    }
    const r = applyMove(board, player, move);
    board = r.board;
    if (r.over) break;
    player = r.nextPlayer;
  }
  const aiScore = board[STORE[1]];
  const oppScore = board[STORE[0]];
  return aiScore > oppScore ? 'ai' : aiScore < oppScore ? 'opp' : 'draw';
}

function runSeries(label, games, aiDepth, aiRandomness, opponentFn, opponentName) {
  const results = { ai: 0, opp: 0, draw: 0 };
  const times = [];
  for (let i = 0; i < games; i++) {
    const r = playGame(aiDepth, aiRandomness, opponentFn, i % 2 === 0, times);
    results[r] += 1;
  }
  times.sort((a, b) => a - b);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const p95 = times[Math.floor(times.length * 0.95)] || 0;
  const max = times[times.length - 1] || 0;
  console.log(
    `${label} vs ${opponentName} (${games} game): menang ${results.ai} (${((results.ai / games) * 100).toFixed(0)}%) | kalah ${results.opp} | seri ${results.draw} | waktu/langkah AI: rata-rata ${avg.toFixed(0)}ms, p95 ${p95.toFixed(0)}ms, maks ${max.toFixed(0)}ms`,
  );
  return results;
}

console.log('=== Simulasi AI CONGKLAK! ===');
console.log('Aturan: 7 lubang x 7 biji, jalan terus, tembak, giliran tambahan.\n');
runSeries('Mudah  (depth 2 + 25% acak)', 100, 2, 0.25, randomMove, 'acak');
runSeries('Sedang (depth 4)', 100, 4, 0, randomMove, 'acak');
runSeries('Sulit  (depth 6)', 100, 6, 0, randomMove, 'acak');
runSeries('Mudah  (depth 2 + 25% acak)', 100, 2, 0.25, greedyMove, 'serakah');
runSeries('Sedang (depth 4)', 100, 4, 0, greedyMove, 'serakah');
runSeries('Sulit  (depth 6)', 60, 6, 0, greedyMove, 'serakah');
console.log('\nTarget R9: vs acak — Mudah 55-70%, Sedang 80-95%, Sulit >=95%; vs serakah — Sedang 55-70%, Sulit >=70%.');
