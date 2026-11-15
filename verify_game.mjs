// verify_game.mjs — verifikasi mandiri game CONGKLAK! (artifact export).
// Memuat src/index.html di jsdom, memainkan SATU permainan penuh vs AI
// (Mudah) sampai layar akhir, lalu uji mode 2 Pemain + modal Aturan.
// Pelajaran dari run sebelumnya: teks lubang = nomor lubang + jumlah biji
// ("17" = lubang 1 berisi 7); lubang kosong/tidak bisa dimainkan TIDAK
// disabled, tapi ditandai class "mati" — lubang yang bisa dimainkan punya
// class "bisa". Tes ini memakai class "bisa" + jumlah biji > 0.
// Jalankan: node verify_game.mjs

import fs from 'node:fs';
import { JSDOM, VirtualConsole } from '/home/hatch/workspace/tagihkandulu/node_modules/jsdom/lib/api.js';

const html = fs.readFileSync(new URL('./src/index.html', import.meta.url), 'utf8');
const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', (e) => errors.push(`jsdomError: ${e.message}`));
virtualConsole.on('error', (...a) => errors.push(`console.error: ${a.join(' ')}`));

function audioStub() {
  const node = () => ({
    connect() {}, disconnect() {}, start() {}, stop() {},
    frequency: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} },
    gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} },
  });
  return {
    createOscillator: node, createGain: node, createBufferSource: node,
    createBiquadFilter: node, createAnalyser: node,
    decodeAudioData: async () => ({}), resume: async () => {}, suspend: async () => {},
    destination: {}, currentTime: 0, state: 'running', sampleRate: 44100,
  };
}

const dom = new JSDOM(html, {
  url: 'https://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    window.AudioContext = function () { return audioStub(); };
    window.webkitAudioContext = window.AudioContext;
    // jsdom tidak punya Web Animations API; tiru Element.animate (ada di browser asli).
    // Stub harus memicu onfinish (game merantai animasi lewat onfinish);
    // stub polos membuat game macet di tengah animasi.
    window.Element.prototype.animate = function () {
      const anim = { cancel() {}, finished: Promise.resolve(), play() {}, pause() {} };
      let handler = null;
      Object.defineProperty(anim, 'onfinish', {
        get() { return handler; },
        set(fn) { handler = fn; if (fn) setTimeout(() => fn.call(anim), 10); },
      });
      return anim;
    };
  },
});
const { window } = dom;
const { document } = window;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await new Promise((resolve) => {
  if (document.readyState === 'complete') resolve();
  else window.addEventListener('load', resolve);
});
await sleep(500);

const text = () => document.body.innerText || document.body.textContent;
const buttons = () => [...document.querySelectorAll('button')];

function isVisible(el) {
  let node = el;
  while (node && node !== document.documentElement) {
    if (node.hidden) return false;
    if (node.style && node.style.display === 'none') return false;
    const cs = window.getComputedStyle(node);
    if (cs && (cs.display === 'none' || cs.visibility === 'hidden')) return false;
    node = node.parentElement;
  }
  return true;
}
const byText = (re) => buttons().find((b) => re.test(b.textContent || '') && !b.disabled && isVisible(b));

// Jumlah biji di lubang = teks tombol tanpa digit pertama (nomor lubang 1-7).
function seedCount(btn) {
  const t = (btn.textContent || '').trim();
  const m = t.match(/^\d(\d+)$/);
  return m ? Number(m[1]) : null;
}
// Lubang yang bisa dimainkan: class "bisa", terlihat, berisi biji.
function playablePits() {
  return buttons().filter((b) => {
    if (!isVisible(b)) return false;
    const cls = (b.className || '').toString();
    if (!cls.includes('bisa')) return false;
    const n = seedCount(b);
    return n !== null && n > 0;
  });
}
function allPits() {
  return buttons().filter((b) => {
    if (!isVisible(b)) return false;
    return (b.className || '').toString().includes('lubang') && seedCount(b) !== null;
  });
}

let failures = 0;
function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures += 1;
}

// ---------- 1. Layar mulai ----------
check('judul CONGKLAK! tampil', /CONGKLAK/i.test(text()));
check('tombol Mulai Main ada', !!byText(/mulai main/i));
check('pilihan mode Lawan AI / 2 Pemain ada', /lawan ai/i.test(text()) && /2 pemain/i.test(text()));
check('pilihan kesulitan Mudah/Sedang/Sulit ada', /mudah/i.test(text()) && /sedang/i.test(text()) && /sulit/i.test(text()));

// ---------- 2. Modal Cara Main ----------
const rulesBtn = byText(/cara main/i);
if (rulesBtn) {
  rulesBtn.click();
  await sleep(300);
  check('modal Cara Main terbuka (aturan tembak/jalan terus tampil)',
    /tembak/i.test(text()) && /jalan terus/i.test(text()));
  const closeBtn = byText(/tutup/i) || byText(/mengerti/i) || byText(/kembali/i);
  if (closeBtn) { closeBtn.click(); await sleep(300); }
  check('modal Cara Main bisa ditutup', !!byText(/mulai main/i));
} else {
  check('tombol Cara Main ada', false);
}

// ---------- 3. Main penuh vs AI (Mudah) ----------
const startBtn = byText(/mulai main/i);
if (!startBtn) { console.log('FATAL: tidak ada tombol Mulai Main'); process.exit(1); }
startBtn.click();
await sleep(600);
check('permainan dimulai (7 lubang pemain bisa dimainkan)', playablePits().length === 7,
  `lubang bisa dimainkan: ${playablePits().length}`);
check('total 14 lubang tampil', allPits().length === 14);
check('semua lubang berisi 7 di awal', allPits().every((b) => seedCount(b) === 7));

const t0 = Date.now();
let moves = 0;
let gameOver = false;
while (Date.now() - t0 < 300000) {
  if (byText(/main lagi/i)) { gameOver = true; break; }
  const pits = playablePits();
  if (pits.length > 0) {
    pits[0].click();
    moves += 1;
    await sleep(2600); // animasi tabur + giliran AI
  } else {
    await sleep(500);
  }
}
check('permainan berakhir (layar akhir muncul)', gameOver,
  `langkah pemain: ${moves}, durasi: ${((Date.now() - t0) / 1000).toFixed(0)} detik`);
if (gameOver) {
  // Skor akhir tampil sebagai dua elemen .nilai ("55 Lumbungmu – 43
  // Lumbung AI"): bukan pola "NN - NN", jadi baca kedua elemen .nilai
  // yang terlihat dan jumlahkan.
  const nilaiEls = [...document.querySelectorAll('.nilai')].filter(isVisible);
  const nums = nilaiEls
    .map((el) => Number((el.textContent || '').trim()))
    .filter((n) => Number.isFinite(n));
  check('skor akhir kedua lumbung berjumlah 98',
    nums.length === 2 && nums[0] + nums[1] === 98, `skor ${nums.join(' - ')}`);
  check('tombol Main Lagi + Ganti Mode ada', !!byText(/main lagi/i) && !!byText(/ganti mode/i));
  const stored = window.localStorage.getItem('congklak-v1');
  check('rekor tersimpan di localStorage congklak-v1', !!stored, stored ? stored.slice(0, 140) : 'kosong');
  byText(/main lagi/i).click();
  await sleep(700);
  const pits = allPits();
  check('Main Lagi mereset papan (14 lubang x 7 biji)',
    pits.length === 14 && pits.every((b) => seedCount(b) === 7),
    `lubang: ${pits.length}`);
  const menuBtn = byText(/menu/i);
  if (menuBtn) { menuBtn.click(); await sleep(400); }
  check('kembali ke layar mulai', !!byText(/mulai main/i));
}

// ---------- 4. Mode 2 Pemain ----------
const pvpBtn = byText(/2 pemain/i);
if (pvpBtn) {
  pvpBtn.click();
  await sleep(300);
  const start2 = byText(/mulai main/i);
  if (start2) {
    start2.click();
    await sleep(600);
    const sideBefore = playablePits().map((b) => b.getAttribute('aria-label')).join('|');
    const pits = playablePits();
    if (pits.length > 0) {
      pits[0].click();
      await sleep(2600);
      const sideAfter = playablePits().map((b) => b.getAttribute('aria-label')).join('|');
      check('mode 2 Pemain: giliran berpindah ke sisi lain setelah langkah',
        sideBefore !== sideAfter, `${sideBefore.split('|')[0]} -> ${sideAfter.split('|')[0] || 'tidak ada lubang bisa dimainkan'}`);
    } else {
      check('mode 2 Pemain: lubang bisa dimainkan tampil', false);
    }
  } else {
    check('mode 2 Pemain: tombol Mulai Main ada', false);
  }
} else {
  check('mode 2 Pemain bisa dipilih dari menu', false, 'tombol 2 Pemain tidak ditemukan');
}

// ---------- 5. Toggle suara ----------
const soundBtn = byText(/suara/i);
if (soundBtn) {
  const labelBefore = soundBtn.textContent;
  soundBtn.click();
  await sleep(200);
  check('toggle Suara mengubah label', soundBtn.textContent !== labelBefore,
    `${labelBefore.trim()} -> ${soundBtn.textContent.trim()}`);
} else {
  check('tombol Suara ada', false);
}

check('tanpa console error / jsdomError selama permainan', errors.length === 0,
  errors.slice(0, 3).join(' | '));

console.log(`\n${failures === 0 ? 'SEMUA CEK LOLOS' : `${failures} CEK GAGAL`}`);
process.exit(failures === 0 ? 0 : 1);
