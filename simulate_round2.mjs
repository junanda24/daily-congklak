// simulate_round2.mjs — tuning round 2 (balance-designer).
// Round 1: AI terlalu kuat — bahkan depth 2 + 25% acak menang 97% vs acak
// dan 78% vs serakah. Target baru (vs proxy "serakah" ≈ pemain kasual yang
// paham aturan): Mudah 40-55%, Sedang 60-75%, Sulit >= 85%.
// Lawan proxy tambahan: depth-2 minimax ("pemain lumayan").

import {
  initialBoard, legalMoves, applyMove, chooseMove, STORE,
} from './simulate_ai.mjs';

function randomMove(board, player) {
  const moves = legalMoves(board, player);
  return moves[Math.floor(Math.random() * moves.length)];
}

function greedyMove(board, player) {
  const moves = legalMoves(board, player);
  let best = moves[0];
  let bestScore = -Infinity;
  for (const m of moves) {
    const before = board[STORE[player]];
    const r = applyMove(board, player, m);
    const gain = r.board[STORE[player]] - before;
    const extra = r.events.some((e) => e.type === 'extra') ? 0.5 : 0;
    if (gain + extra > bestScore) { bestScore = gain + extra; best = m; }
  }
  return best;
}

function depthMove(depth) {
  return (board, player) => chooseMove(board, player, depth, 0);
}

function playGame(aiDepth, aiRand, opponentFn, aiFirst, times) {
  let board = initialBoard();
  let player = aiFirst ? 1 : 0;
  for (;;) {
    const moves = legalMoves(board, player);
    if (moves.length === 0) break;
    let move;
    if (player === 1) {
      const t0 = performance.now();
      move = chooseMove(board, 1, aiDepth, aiRand);
      times.push(performance.now() - t0);
    } else {
      move = opponentFn(board, 0);
    }
    const r = applyMove(board, player, move);
    board = r.board;
    if (r.over) break;
    player = r.nextPlayer;
  }
  const ai = board[STORE[1]];
  const opp = board[STORE[0]];
  return ai > opp ? 'ai' : ai < opp ? 'opp' : 'draw';
}

function series(label, games, aiDepth, aiRand, oppFn, oppName) {
  const res = { ai: 0, opp: 0, draw: 0 };
  const times = [];
  for (let i = 0; i < games; i++) {
    res[playGame(aiDepth, aiRand, oppFn, i % 2 === 0, times)] += 1;
  }
  times.sort((a, b) => a - b);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`${label} vs ${oppName} (${games}): menang ${res.ai} (${((res.ai / games) * 100).toFixed(0)}%) | kalah ${res.opp} | seri ${res.draw} | waktu rata-rata ${avg.toFixed(1)}ms, maks ${times[times.length - 1].toFixed(0)}ms`);
}

console.log('=== Tuning round 2 ===\n');
series('depth 1, acak 50%', 100, 1, 0.5, greedyMove, 'serakah');
series('depth 1, acak 25%', 100, 1, 0.25, greedyMove, 'serakah');
series('depth 2, acak 50%', 100, 2, 0.5, greedyMove, 'serakah');
series('depth 2, acak 40%', 100, 2, 0.4, greedyMove, 'serakah');
series('depth 3, acak 0%', 100, 3, 0, greedyMove, 'serakah');
series('depth 3, acak 25%', 100, 3, 0.25, greedyMove, 'serakah');
series('depth 4, acak 0%', 100, 4, 0, greedyMove, 'serakah');
series('depth 6, acak 0%', 60, 6, 0, greedyMove, 'serakah');
series('depth 8, acak 0%', 30, 8, 0, greedyMove, 'serakah');
console.log('');
series('depth 1, acak 50%', 100, 1, 0.5, depthMove(2), 'minimax-2 (pemain lumayan)');
series('depth 3, acak 0%', 100, 3, 0, depthMove(2), 'minimax-2 (pemain lumayan)');
series('depth 6, acak 0%', 60, 6, 0, depthMove(3), 'minimax-3 (pemain bagus)');
series('depth 8, acak 0%', 30, 8, 0, depthMove(3), 'minimax-3 (pemain bagus)');
