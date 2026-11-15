// dump_over.mjs — main penuh vs AI lalu dump struktur layar akhir
// (bagaimana skor ditampilkan) + semua elemen bernilai angka.
// Dijalankan: node dump_over.mjs

import fs from 'node:fs';
import { JSDOM, VirtualConsole } from '/home/hatch/workspace/tagihkandulu/node_modules/jsdom/lib/api.js';

const html = fs.readFileSync(new URL('./src/index.html', import.meta.url), 'utf8');
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', () => {});
virtualConsole.on('error', () => {});

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
    // PENTING: stub harus memicu onfinish — game merantai animasi lewat
    // onfinish. Stub polos (onfinish tidak pernah terpanggil) membuat game
    // macet di tengah animasi; stub ini memanggilnya via setter.
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
const buttons = () => [...document.querySelectorAll('button')];
const byText = (re) => buttons().find((b) => re.test(b.textContent || '') && !b.disabled && isVisible(b));
function seedCount(btn) {
  const m = (btn.textContent || '').trim().match(/^\d(\d+)$/);
  return m ? Number(m[1]) : null;
}
function playablePits() {
  return buttons().filter((b) => isVisible(b) && (b.className || '').toString().includes('bisa') && seedCount(b) > 0);
}

byText(/mulai main/i).click();
await sleep(600);
const t0 = Date.now();
let moves = 0;
let over = null;
while (Date.now() - t0 < 300000) {
  over = byText(/main lagi/i);
  if (over) break;
  const pits = playablePits();
  if (pits.length > 0) { pits[0].click(); moves += 1; await sleep(2600); }
  else await sleep(500);
}
console.log(`Game over setelah ${moves} langkah, ${(Date.now() - t0) / 1000 | 0} detik.`);
if (!over) { console.log('TIDAK MENCAPAI LAYAR AKHIR'); process.exit(1); }

// Naik dari tombol Main Lagi, cetak teks tiap leluhur.
let node = over;
let level = 0;
while (node && node !== document.body && level < 6) {
  const t = (node.innerText || node.textContent || '').replace(/\s+/g, ' ').trim();
  console.log(`\n--- leluhur level ${level} <${node.tagName.toLowerCase()} class="${(node.className || '').toString().slice(0, 80)}"> ---`);
  console.log(t.slice(0, 600));
  node = node.parentElement;
  level += 1;
}

// Semua elemen terlihat yang teksnya murni angka (calon lumbung).
console.log('\n--- elemen angka terlihat ---');
document.querySelectorAll('body *').forEach((el) => {
  if (el.children.length > 0) return;
  const t = (el.textContent || '').trim();
  if (!/^\d+$/.test(t)) return;
  if (!isVisible(el)) return;
  console.log(`<${el.tagName.toLowerCase()} class="${(el.className || '').toString().slice(0, 60)}" aria="${el.getAttribute('aria-label') || '-'}"> ${t}`);
});
process.exit(0);
