// simulate_round3.mjs — tuning round 3 (terakhir): kunci tingkat Sedang.
// Kandidat Sedang (target 60-75% vs serakah): depth 2 + acak 30/35%,
// depth 3 + acak 40/50%.

import {
  initialBoard, legalMoves, applyMove, chooseMove, STORE,
} from './simulate_ai.mjs';

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

function playGame(aiDepth, aiRand, aiFirst, times) {
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
      move = greedyMove(board, 0);
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

function series(label, games, aiDepth, aiRand) {
  const res = { ai: 0, opp: 0, draw: 0 };
  const times = [];
  for (let i = 0; i < games; i++) {
    res[playGame(aiDepth, aiRand, i % 2 === 0, times)] += 1;
  }
  console.log(`${label} vs serakah (${games}): menang ${res.ai} (${((res.ai / games) * 100).toFixed(0)}%) | kalah ${res.opp} | seri ${res.draw}`);
}

console.log('=== Tuning round 3 (Sedang) ===\n');
series('depth 2, acak 30%', 100, 2, 0.3);
series('depth 2, acak 35%', 100, 2, 0.35);
series('depth 3, acak 40%', 100, 3, 0.4);
series('depth 3, acak 50%', 100, 3, 0.5);
