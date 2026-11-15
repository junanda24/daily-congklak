// diagnose_game.mjs — diagnosis runtime (bukan baca source):
// dump semua tombol di layar permainan + uji apakah satu klik benar-benar
// menggerakkan papan. Dijalankan: node diagnose_game.mjs

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
  },
});
const { window } = dom;
const { document } = window;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await new Promise((resolve) => {
  if (document.readyState === 'complete') resolve();
  else window.addEventListener('load', resolve);
});
await sleep(400);

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

const startBtn = [...document.querySelectorAll('button')].find(
  (b) => /mulai main/i.test(b.textContent || '') && isVisible(b),
);
startBtn.click();
await sleep(600);

const btns = [...document.querySelectorAll('button')].filter(isVisible);
console.log(`Tombol terlihat di layar permainan: ${btns.length}`);
btns.forEach((b, i) => {
  console.log(
    `  [${i}] teks=${JSON.stringify((b.textContent || '').trim().slice(0, 30))} disabled=${b.disabled} id=${b.id || '-'} class=${(b.className || '').toString().slice(0, 60)} aria=${b.getAttribute('aria-label') || '-'}`,
  );
});

// Uji: klik lubang pemain pertama (teks angka, bukan lumbung).
// Lumbung biasanya punya teks angka juga — bedakan lewat aria-label / class.
const numeric = btns.filter((b) => /^\d+$/.test((b.textContent || '').trim()) && !b.disabled);
console.log(`\nTombol angka aktif: ${numeric.length}`);
const before = numeric.map((b) => (b.textContent || '').trim()).join(',');
console.log(`Keadaan sebelum klik: ${before}`);

// Coba klik tombol angka pertama yang BUKAN lumbung (aria-label mengandung 'lubang' atau 'pit')
const pit = numeric.find((b) => /lubang|pit/i.test(`${b.getAttribute('aria-label') || ''} ${b.className || ''} ${b.id || ''}`))
  || numeric[0];
console.log(`Mengklik: teks=${JSON.stringify(pit.textContent.trim())} aria=${pit.getAttribute('aria-label') || '-'}`);
pit.click();
await sleep(2500);
const numericAfter = [...document.querySelectorAll('button')]
  .filter(isVisible)
  .filter((b) => /^\d+$/.test((b.textContent || '').trim()));
const after = numericAfter.map((b) => (b.textContent || '').trim()).join(',');
console.log(`Keadaan sesudah klik + 2,5 detik: ${after}`);
console.log(`Papan berubah: ${before !== after}`);
console.log(`Banner/log: ${JSON.stringify((document.body.innerText || '').split('\n').filter((l) => /giliran|jalan|tembak|pikir/i.test(l)).slice(0, 5))}`);
console.log(`Errors: ${errors.length ? errors.join(' | ') : 'tidak ada'}`);
process.exit(0);
