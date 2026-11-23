'use strict';
/* 화성학 스터디 · 베이스 — 단일 파일 앱 (프레임워크 없음) */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const app = $('#app');
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];

/* ───────── 음악 기초 데이터 ───────── */
const SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const FLAT  = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const pcName = pc => SHARP[pc] === FLAT[pc] ? SHARP[pc] : `${SHARP[pc]}/${FLAT[pc]}`;
const NATURAL = pc => SHARP[pc].length === 1;

// 4현 베이스 표준 튜닝 (MIDI 번호) — s0 = 가장 굵은 E현
const STR = [{ n: 'E', m: 28 }, { n: 'A', m: 33 }, { n: 'D', m: 38 }, { n: 'G', m: 43 }];
const midiAt = (s, f) => STR[s].m + f;
const pcAt = (s, f) => midiAt(s, f) % 12;

const IV = {
  1: ['단2도', 'm2'], 2: ['장2도', 'M2'], 3: ['단3도', 'm3'], 4: ['장3도', 'M3'],
  5: ['완전4도', 'P4'], 6: ['트라이톤', 'TT'], 7: ['완전5도', 'P5'], 8: ['단6도', 'm6'],
  9: ['장6도', 'M6'], 10: ['단7도', 'm7'], 11: ['장7도', 'M7'], 12: ['옥타브', 'P8'],
};
const ivLabel = n => `${IV[n][0]} <small>${IV[n][1]}</small>`;

// 조에 맞는 철자 (D 메이저의 3음 = F♯, G♭ 아님)
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'], NATPC = [0, 2, 4, 5, 7, 9, 11];
const ACC = { 0: '', 1: '♯', 2: '𝄪', 11: '♭', 10: '𝄫' };
const ACCV = { '♯': 1, '♭': -1, '𝄪': 2, '𝄫': -2 };
const parsePc = nm => (NATPC[LETTERS.indexOf(nm[0])] + [...nm.slice(1)].reduce((a, c) => a + (ACCV[c] || 0), 0) + 12) % 12;
function spell(root, semis, steps) {
  const li = (LETTERS.indexOf(root[0]) + steps) % 7;
  const pc = (parsePc(root) + semis) % 12;
  return LETTERS[li] + ACC[(pc - NATPC[li] + 12) % 12];
}
const MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10];
const scaleOf = (root, f = MAJ) => f.map((s, i) => spell(root, s, i));
// [이름, 조표(+♯ / -♭)]
const KEYS = [['C', 0], ['G', 1], ['D', 2], ['A', 3], ['E', 4], ['B', 5], ['F♯', 6], ['F', -1], ['B♭', -2], ['E♭', -3], ['A♭', -4], ['D♭', -5]];
const keyByPc = pc => KEYS.find(k => parsePc(k[0]) === pc)[0];
const sigText = n => n === 0 ? '♯·♭ 없음' : n > 0 ? `♯ ${n}개` : `♭ ${-n}개`;
const sigNotes = n => n > 0 ? ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯'].slice(0, n) : ['B♭', 'E♭', 'A♭', 'D♭', 'G♭'].slice(0, -n);

// 7th 코드 4종: [반음, 알파벳 칸, 디그리]
const CH = {
  maj7: { sym: 'maj7', ko: '메이저7', t: [[0, 0, '1'], [4, 2, '3'], [7, 4, '5'], [11, 6, '7']], feel: '밝고 안정 · Ⅰ, Ⅳ' },
  dom: { sym: '7', ko: '도미넌트7', t: [[0, 0, '1'], [4, 2, '3'], [7, 4, '5'], [10, 6, '♭7']], feel: '긴장, 해결하고 싶음 · Ⅴ' },
  m7: { sym: 'm7', ko: '마이너7', t: [[0, 0, '1'], [3, 2, '♭3'], [7, 4, '5'], [10, 6, '♭7']], feel: '어둡고 부드러움 · ⅱ ⅲ ⅵ' },
  hd: { sym: 'm7♭5', ko: '하프디미니쉬', t: [[0, 0, '1'], [3, 2, '♭3'], [6, 4, '♭5'], [10, 6, '♭7']], feel: '불안하고 어두움 · ⅶ, 마이너 ⅱ' },
};
const chordNotes = (root, q) => CH[q].t.map(([s, st]) => spell(root, s, st));
// 코드 종류별로 철자가 깔끔한 루트 이름 (D♭m7♭5 같은 𝄫 피하기)
const M7ROOTS = ['A', 'D', 'E', 'B', 'G', 'C', 'F', 'F♯', 'C♯', 'G♯', 'B♭', 'E♭'];
const HDROOTS = ['B', 'E', 'A', 'D', 'G', 'C', 'F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'F'];
CH.maj7.roots = CH.dom.roots = KEYS.map(k => k[0]); CH.m7.roots = M7ROOTS; CH.hd.roots = HDROOTS;
const rootName = (pc, q) => CH[q].roots.find(n => parsePc(n) === pc);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// 정답 1개 + 오답(중복 없이) 섞기
function opts(ans, wrongs, n = 4) {
  const out = [ans];
  for (const w of shuffle([...wrongs])) { if (out.length >= n) break; if (!out.includes(w)) out.push(w); }
  return shuffle(out).map(v => ({ v, label: v }));
}

// 다이아토닉 코드 (메이저 키 / 마이너 키)
const DIA_Q = ['maj7', 'm7', 'm7', 'maj7', 'dom', 'm7', 'hd'];
const RN = ['Ⅰ', 'ⅱ', 'ⅲ', 'Ⅳ', 'Ⅴ', 'ⅵ', 'ⅶ'];
const RNQ = ['Ⅰmaj7', 'ⅱm7', 'ⅲm7', 'Ⅳmaj7', 'Ⅴ7', 'ⅵm7', 'ⅶm7♭5'];
const FUNC = ['토닉', '서브도미넌트', '토닉', '서브도미넌트', '도미넌트', '토닉', '도미넌트'];
const FUNC_DESC = { 토닉: '집, 안정', 서브도미넌트: '집을 떠나 출발', 도미넌트: '긴장, 집으로 돌아가려 함' };
const MIN_Q = ['m7', 'hd', 'maj7', 'm7', 'dom', 'maj7', 'dom'];
const MRN = ['ⅰm7', 'ⅱm7♭5', '♭Ⅲmaj7', 'ⅳm7', 'Ⅴ7', '♭Ⅵmaj7', '♭Ⅶ7'];
const MAJ_KEYS = ['C', 'G', 'D', 'A', 'E', 'F', 'B♭', 'E♭', 'A♭'];
const MIN_KEYS = ['A', 'E', 'B', 'D', 'G', 'C', 'F♯', 'F'];
const dia = (K, d) => scaleOf(K)[d - 1] + CH[DIA_Q[d - 1]].sym;
const minDia = (m, d) => scaleOf(m, MIN)[d - 1] + CH[MIN_Q[d - 1]].sym;
const PROGS = [
  { rn: 'Ⅰ – Ⅳ – Ⅴ – Ⅰ', d: [1, 4, 5, 1], note: '가장 기본. 록·팝·블루스' },
  { rn: 'ⅱ – Ⅴ – Ⅰ', d: [2, 5, 1], note: '재즈의 기본 단위' },
  { rn: 'Ⅰ – ⅵ – ⅱ – Ⅴ', d: [1, 6, 2, 5], note: '턴어라운드. 끝없이 반복되는 느낌' },
  { rn: 'Ⅰ – Ⅴ – ⅵ – Ⅳ', d: [1, 5, 6, 4], note: '팝 진행' },
];
const BLUES = [1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 5];
// 진행 재생: 베이스 루트 + 위에 코드
function playChords(list, beat = 1.25) { // list: [[루트 midi, 코드종류], ...]
  list.forEach(([r, q], i) => {
    const t = i * beat;
    pluck(r > 45 ? r - 12 : r, t, beat, 0.5);
    CH[q].t.slice(1).forEach(([n]) => pluck(r + 12 + n, t + 0.02, beat * 0.95, 0.16));
  });
}
// 키 + 로마숫자 디그리 → [[루트 midi, 코드종류], ...]
function progList(K, degs, qs = DIA_Q, sc = MAJ) {
  const base = 33 + (parsePc(K) - 9 + 12) % 12; // A1~G♯2
  return degs.map(d => [base + sc[d - 1], qs[d - 1]]);
}
const playProg = (K, degs, qs, sc, beat) => playChords(progList(K, degs, qs, sc), beat);

// 지판 박스: 루트(s,f)에서 3음씩 한 줄씩 쌓기
function boxMarks(s, f, semis, labels) {
  return semis.map((n, i) => {
    const k = Math.min(Math.floor(i / 3), 3 - s);
    return { s: s + k, f: f + n - 5 * k, t: labels[i], c: n % 12 === 0 ? 'root' : 'ok' };
  });
}
// 아르페지오 모양: 1 / 3·5는 한 줄 위 / 7은 두 줄 위
function chordMarks(s, f, q, labels, hl) {
  return CH[q].t.map(([n], i) => {
    const k = [0, 1, 1, 2][i];
    return { s: s + k, f: f + n - 5 * k, t: labels ? labels[i] : CH[q].t[i][2], c: i === 0 ? 'root' : hl == null || hl === i ? 'ok' : 'soft' };
  });
}
// 이 음을 루트로 아르페지오를 그릴 수 있는 위치 (E현 또는 A현, 2~9프렛)
function rootPos(pc, lo = 2, hi = 9) {
  for (const s of [0, 1]) {
    let f = (pc - STR[s].m % 12 + 12) % 12; if (f < lo) f += 12;
    if (f <= hi) return { s, f };
  }
}

// 음정을 베이스 지판 "모양"으로: k줄 위, diff프렛 이동
function ivShape(n) {
  const c = [];
  for (let k = 0; k <= 2; k++) {
    const d = n - 5 * k;
    if (d >= -3 && d <= 4) c.push({ k, d });
  }
  c.sort((a, b) => Math.abs(a.d) - Math.abs(b.d) || b.k - a.k);
  return c[0];
}
function shapeText({ k, d }) {
  const line = k === 0 ? '같은 줄' : `${k}줄 위`;
  const dir = d === 0 ? '같은 프렛' : d > 0 ? `${d}프렛 오른쪽` : `${-d}프렛 왼쪽`;
  return `${line}, ${dir}`;
}
// 모양에 맞게 루트 위치를 랜덤 선택
function placeInterval(n) {
  const sh = ivShape(n);
  const s = rnd(4 - sh.k);
  const lo = Math.max(1, 1 - sh.d), hi = Math.min(7, 12 - sh.d);
  const f = lo + rnd(hi - lo + 1);
  return { root: { s, f }, tgt: { s: s + sh.k, f: f + sh.d }, sh };
}

/* ───────── 소리 (Web Audio로 만든 베이스 톤) ───────── */
let actx;
function audio() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
  return actx;
}
function pluck(midi, when = 0, dur = 1.0, vol = 0.45) {
  if (!S.settings.sound) return;
  const c = audio();
  const t = c.currentTime + when + 0.03;
  const m = midi + (S.settings.octUp ? 12 : 0);
  const f = 440 * Math.pow(2, (m - 69) / 12);
  const o1 = c.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = f;
  const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = f;
  const sub = c.createGain(); sub.gain.value = 0.7;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 3;
  lp.frequency.setValueAtTime(Math.min(5000, f * 14), t);
  lp.frequency.exponentialRampToValueAtTime(Math.max(180, f * 2.2), t + 0.4);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(vol * 0.45, t + 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o1.connect(lp); o2.connect(sub); sub.connect(lp); lp.connect(g); g.connect(c.destination);
  o1.start(t); o2.start(t); o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
}
const playSeq = (ms, gap = 0.65) => ms.forEach((m, i) => pluck(m, i * gap));
// 코드: 아르페지오로 한 번, 이어서 동시에 한 번
function playChord(ms) {
  ms.forEach((m, i) => pluck(m, i * 0.38, 0.9));
  const t = ms.length * 0.38 + 0.35;
  ms.forEach(m => pluck(m, t, 1.8, 0.2));
}

/* ───────── 저장 (폰 안에만) ───────── */
const KEY = 'harmony-study-v1';
const S = Object.assign({ items: {}, lessons: {}, streak: { last: null, count: 0 }, hideInstall: false },
  JSON.parse(localStorage.getItem(KEY) || '{}'));
S.settings = Object.assign({ sound: true, octUp: true }, S.settings);
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
const dstr = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
function touchStreak() {
  const t = dstr(new Date());
  if (S.streak.last === t) return;
  const y = dstr(new Date(Date.now() - 864e5));
  S.streak.count = S.streak.last === y ? S.streak.count + 1 : 1;
  S.streak.last = t; save();
}
// 라이트너 박스 (0~4): 맞히면 +1, 틀리면 0으로. 낮은 박스일수록 자주 출제
function grade(key, ok) {
  const r = S.items[key] || { b: 0, r: 0, w: 0 };
  r.b = ok ? Math.min(4, r.b + 1) : 0;
  ok ? r.r++ : r.w++;
  S.items[key] = r; save();
}
const WEIGHT = [6, 4, 2.5, 1.5, 0.8];
function pickWeighted(keys, avoid) {
  const pool = keys.length > 1 ? keys.filter(k => k !== avoid) : keys;
  const w = pool.map(k => S.items[k] ? WEIGHT[S.items[k].b] : 3);
  let x = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { x -= w[i]; if (x <= 0) return pool[i]; }
  return pool[pool.length - 1];
}
const mastery = id => {
  const ks = QUIZ[id].items();
  return ks.reduce((a, k) => a + (S.items[k] ? S.items[k].b : 0), 0) / (ks.length * 4);
};

/* ───────── 지판 그리기 (SVG) ───────── */
function board(o = {}) {
  const to = o.to ?? 12, W = 680, H = 232, NUT = 76;
  const fw = (W - NUT - 10) / to;
  const X = f => f === 0 ? NUT - 26 : NUT + (f - 0.5) * fw;
  const Y = s => 34 + (3 - s) * 52;  // G현이 위, E현이 아래 (연주자 시점)
  let g = `<rect x="${NUT}" y="12" width="${W - NUT - 10}" height="${Y(0) - Y(3) + 44}" rx="4" class="fb-wood"/>`;
  const mid = (Y(1) + Y(2)) / 2;
  [3, 5, 7, 9].filter(f => f <= to).forEach(f => g += `<circle cx="${X(f)}" cy="${mid}" r="7" class="fb-inlay"/>`);
  if (to >= 12) g += `<circle cx="${X(12)}" cy="${(Y(2) + Y(3)) / 2}" r="7" class="fb-inlay"/><circle cx="${X(12)}" cy="${(Y(0) + Y(1)) / 2}" r="7" class="fb-inlay"/>`;
  for (let f = 1; f <= to; f++) g += `<line x1="${NUT + f * fw}" y1="12" x2="${NUT + f * fw}" y2="${Y(0) + 32}" class="fb-fret"/>`;
  g += `<rect x="${NUT - 3}" y="12" width="6" height="${Y(0) - Y(3) + 44}" class="fb-nut"/>`;
  for (let s = 0; s < 4; s++) {
    const on = o.str == null || o.str === s;
    g += `<line x1="${NUT - 50}" y1="${Y(s)}" x2="${W - 10}" y2="${Y(s)}" class="fb-str ${on ? '' : 'dim'}" stroke-width="${1.4 + (3 - s) * 0.9}"/>`;
    g += `<text x="8" y="${Y(s) + 5}" class="fb-sname ${o.str === s ? 'on' : ''}">${STR[s].n}</text>`;
  }
  for (let f = 1; f <= to; f++) g += `<text x="${X(f)}" y="${H - 6}" class="fb-num">${f}</text>`;
  (o.marks || []).forEach(m => {
    const r = (m.t || '').length > 2 ? 18 : 16;
    g += `<g class="fb-mark ${m.c || ''}"><circle cx="${X(m.f)}" cy="${Y(m.s)}" r="${r}"/><text x="${X(m.f)}" y="${Y(m.s) + 5}">${m.t ?? ''}</text></g>`;
  });
  if (o.tap) for (let s = 0; s < 4; s++) for (let f = 0; f <= to; f++) {
    const x = f === 0 ? 0 : NUT + (f - 1) * fw, w = f === 0 ? NUT : fw;
    g += `<rect x="${x}" y="${Y(s) - 26}" width="${w}" height="52" class="fb-hit" data-s="${s}" data-f="${f}"/>`;
  }
  return `<svg class="fb" viewBox="0 0 ${W} ${H}" role="img" aria-label="베이스 지판">${g}</svg>`;
}

/* ───────── 퀴즈 정의 ───────── */
const ALL12 = [...Array(12).keys()];
const noteChoices = () => ALL12.map(pc => ({ v: pc, label: pcName(pc) }));
const ivChoices = set => set.map(n => ({ v: n, label: ivLabel(n) }));
const BASIC = [3, 4, 5, 7, 12];
const ALLIV = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function f2n(maxF) {
  return {
    items() { const k = []; for (let s = 0; s < 4; s++) for (let f = 0; f <= maxF; f++) k.push(`f2n:${s}:${f}`); return k; },
    make(key) {
      const [, s, f] = key.split(':').map(Number), pc = pcAt(s, f);
      let hint = f === 0 ? '개방현이에요.' : f === 12 ? '12프렛 = 개방현과 같은 음 (옥타브).' :
        f === 5 && s < 3 ? `5프렛 = 다음 줄(${STR[s + 1].n}) 개방현과 같은 음.` :
        `개방현 ${STR[s].n}에서 반음 ${f}개 위.`;
      return {
        prompt: `<b>${STR[s].n}현 ${f}프렛</b>은 무슨 음?`,
        board: { to: maxF <= 5 ? 7 : 12, marks: [{ s, f, t: '?', c: 'ask' }] },
        after: { to: maxF <= 5 ? 7 : 12, marks: [{ s, f, t: SHARP[pc], c: 'ok' }] },
        choices: noteChoices(), correct: v => v === pc,
        explain: `${STR[s].n}현 ${f}프렛 = <b>${pcName(pc)}</b>. ${hint}`,
        play: () => pluck(midiAt(s, f)),
      };
    },
  };
}

const QUIZ = {
  f2n5: { stage: 1, title: '지판 → 음 이름 (0~5프렛)', ...f2n(5) },
  f2n12: { stage: 1, title: '지판 → 음 이름 (0~12프렛)', ...f2n(12) },
  n2f: {
    stage: 1, title: '음 이름 → 지판에서 찾기',
    items() { const k = []; for (let s = 0; s < 4; s++) ALL12.forEach(pc => k.push(`n2f:${s}:${pc}`)); return k; },
    make(key) {
      const [, s, pc] = key.split(':').map(Number);
      const pos = []; for (let f = 0; f <= 12; f++) if (pcAt(s, f) === pc) pos.push(f);
      return {
        prompt: `<b>${STR[s].n}현</b>에서 <b>${pcName(pc)}</b>를 눌러보세요`,
        board: { str: s, tap: true }, tap: true, tapString: s,
        after: { str: s, marks: pos.map(f => ({ s, f, t: SHARP[pc], c: 'ok' })) },
        correct: v => v.s === s && pcAt(v.s, v.f) === pc,
        explain: `${STR[s].n}현의 <b>${pcName(pc)}</b> = ${pos.join(', ')}프렛.`,
        play: () => pluck(midiAt(s, pos[0])),
      };
    },
  },
  steps: {
    stage: 1, title: '반음 · 온음 계산',
    items() { const k = []; ALL12.forEach(pc => [2, 1, -1, -2].forEach(d => k.push(`st:${pc}:${d}`))); return k; },
    make(key) {
      const [, pc, d] = key.split(':').map(Number), t = (pc + d + 12) % 12;
      const lab = { 2: '온음 위', 1: '반음 위', '-1': '반음 아래', '-2': '온음 아래' }[d];
      // 한 줄 위에서 두 음이 0~12프렛 안에 들어오게 (A현 우선)
      let S1 = 1, fa;
      for (const s of [1, 0, 2, 3]) {
        let f = (pc - STR[s].m % 12 + 12) % 12; if (f + d < 0) f += 12;
        if (f <= 12 && f + d >= 0 && f + d <= 12) { S1 = s; fa = f; break; }
      }
      const ft = fa + d;
      const path = []; for (let f = Math.min(fa, ft); f <= Math.max(fa, ft); f++) path.push(SHARP[pcAt(S1, f)]);
      const tricky = [[4, 5], [11, 0]].some(([a, b]) => path.includes(SHARP[a]) && path.includes(SHARP[b]));
      return {
        prompt: `<b>${pcName(pc)}</b>에서 <b>${lab}</b>는?`,
        board: { str: S1, marks: [{ s: S1, f: fa, t: SHARP[pc], c: 'root' }] },
        after: { str: S1, marks: [{ s: S1, f: fa, t: SHARP[pc], c: 'root' }, { s: S1, f: ft, t: SHARP[t], c: 'ok' }] },
        choices: noteChoices(), correct: v => v === t,
        explain: `${pcName(pc)} → ${lab} → <b>${pcName(t)}</b>. 프렛으로 ${Math.abs(d)}칸.` + (tricky ? ' <em>E–F, B–C 사이는 반음뿐!</em>' : ''),
        play: () => playSeq([midiAt(S1, fa), midiAt(S1, ft)]),
      };
    },
  },
  ivB: ivShapeQuiz(2, '음정 모양 (핵심 5개)', BASIC, 'ivB'),
  ivA: ivShapeQuiz(2, '음정 모양 (전체 12개)', ALLIV, 'ivA'),
  earB: earQuiz(2, '귀로 음정 맞히기 (핵심)', BASIC, 'earB'),
  earA: earQuiz(2, '귀로 음정 맞히기 (전체)', ALLIV, 'earA'),

  /* 3단계: 장음계와 조 */
  deg: {
    stage: 3, title: '키의 몇 번째 음? (이름)',
    items() { const k = []; KEYS.forEach((_, i) => [2, 3, 4, 5, 6, 7].forEach(d => k.push(`dg:${i}:${d}`))); return k; },
    make(key) {
      const [, i, d] = key.split(':').map(Number), K = KEYS[i][0], sc = scaleOf(K), ans = sc[d - 1];
      const p = rootPos(parsePc(K), 1, 8);
      const marks = boxMarks(p.s, p.f, [...MAJ, 12], [...sc, K]).map((m, j) => j === d - 1 ? { ...m, c: 'ok' } : { ...m, c: j === 0 || j === 7 ? 'root' : 'soft' });
      return {
        prompt: `<b>${K} 메이저</b>의 <b>${d}음</b>은?`,
        board: null, after: { marks },
        choices: noteChoices(), correct: v => v === parsePc(ans),
        explain: `${K} 메이저: ${sc.map((n, j) => j === d - 1 ? `<b>${n}</b>` : n).join(' ')} → ${d}음 = <b>${ans}</b>`,
        play: () => { const r = midiAt(p.s, p.f); playSeq([r, r + MAJ[d - 1]]); },
      };
    },
  },
  degTap: {
    stage: 3, title: '키의 몇 번째 음? (지판에서 짚기)',
    items: () => [2, 3, 4, 5, 6, 7].map(d => `dt:${d}`),
    make(key) {
      const d = +key.split(':')[1], s = rnd(2), f = 1 + rnd(7), K = keyByPc(pcAt(s, f));
      const sc = scaleOf(K), ans = sc[d - 1], ap = parsePc(ans);
      const marks = boxMarks(s, f, [...MAJ, 12], ['1', '2', '3', '4', '5', '6', '7', '1']).map((m, j) => j === d - 1 ? { ...m, t: ans, c: 'ok' } : { ...m, c: j === 0 || j === 7 ? 'root' : 'soft' });
      return {
        prompt: `R = <b>${K}</b>. ${K} 메이저의 <b>${d}음</b>을 짚어보세요`,
        board: { tap: true, marks: [{ s, f, t: 'R', c: 'root' }] }, tap: true,
        after: { marks },
        correct: v => pcAt(v.s, v.f) === ap,
        explain: `${K} 메이저의 ${d}음 = <b>${ans}</b>. 메이저 스케일 박스(3음씩 한 줄)에서 ${d}번째 자리.`,
        play: () => { const r = midiAt(s, f); playSeq([r, r + MAJ[d - 1]]); },
      };
    },
  },
  keysig: {
    stage: 3, title: '조표 (♯·♭ 개수)',
    items: () => KEYS.map((_, i) => `ks:${i}`),
    make(key) {
      const i = +key.split(':')[1], [K, n] = KEYS[i];
      const opts = [n]; while (opts.length < 4) { const o = pick(KEYS)[1]; if (!opts.includes(o)) opts.push(o); }
      opts.sort((a, b) => a - b);
      return {
        prompt: `<b>${K} 메이저</b>의 조표는?`,
        board: null, after: null,
        choices: opts.map(o => ({ v: o, label: sigText(o) })), correct: v => v === n,
        explain: `${K} 메이저: ${sigText(n)}${n ? ` (${sigNotes(n).join(' ')})` : ''}. 스케일: ${scaleOf(K).join(' ')}. ` +
          (n >= 0 ? '5도권에서 C부터 5도씩 올라갈 때마다 ♯ +1.' : 'C부터 4도씩 올라갈 때마다 ♭ +1.'),
        play: () => { const r = 36 + parsePc(K) % 12; playSeq([...MAJ, 12].map(x => r + x), 0.22); },
      };
    },
  },
  rel: {
    stage: 3, title: '나란한조 (메이저 ↔ 마이너)',
    items() { const k = []; KEYS.forEach((_, i) => [0, 1].forEach(d => k.push(`rl:${i}:${d}`))); return k; },
    make(key) {
      const [, i, dir] = key.split(':').map(Number), K = KEYS[i][0], m = spell(K, 9, 5);
      const ans = dir === 0 ? m : K;
      return {
        prompt: dir === 0 ? `<b>${K} 메이저</b>와 같은 음을 쓰는 마이너 키는?` : `<b>${m} 마이너</b>와 같은 음을 쓰는 메이저 키는?`,
        board: null, after: null,
        choices: noteChoices(), correct: v => v === parsePc(ans),
        explain: `${K} 메이저 = ${m} 마이너. 메이저의 6음(${m})에서 시작하면 마이너, 마이너의 ♭3음(${K})에서 시작하면 메이저. 지판으로는 단3도(1줄 위, 2프렛 왼쪽) 관계.`,
        play: () => { const r = 33 + (parsePc(m) - 9 + 12) % 12; playSeq([r, r + 3]); },
      };
    },
  },

  /* 4단계: 코드 구성음 */
  ctone: {
    stage: 4, title: '코드톤 이름 맞히기',
    items() { const k = []; Object.keys(CH).forEach(q => [1, 2, 3].forEach(j => k.push(`ct:${q}:${j}`))); return k; },
    make(key) {
      const [, q, js] = key.split(':'), j = +js, R = pick(CH[q].roots);
      const notes = chordNotes(R, q), ans = notes[j], lab = CH[q].t[j][2], p = rootPos(parsePc(R));
      return {
        prompt: `<b>${R}${CH[q].sym}</b>의 <b>${lab}음</b>은?`,
        board: null, after: { marks: chordMarks(p.s, p.f, q, notes, j) },
        choices: noteChoices(), correct: v => v === parsePc(ans),
        explain: `${R}${CH[q].sym} = ${notes.map((n, x) => x === j ? `<b>${n}</b>` : n).join(' ')} (${CH[q].t.map(t => t[2]).join(' ')}) → ${lab}음 = <b>${ans}</b>`,
        play: () => { const r = midiAt(p.s, p.f); playSeq(CH[q].t.map(t => r + t[0]), 0.35); },
      };
    },
  },
  cqual: {
    stage: 4, title: '아르페지오 모양 → 코드 종류',
    items: () => Object.keys(CH).map(q => `cq:${q}`),
    make(key) {
      const q = key.split(':')[1], s = rnd(2), f = 2 + rnd(7), R = rootName(pcAt(s, f), q);
      return {
        prompt: `R에서 시작하는 이 아르페지오는 무슨 코드?`,
        board: { marks: chordMarks(s, f, q, ['R', '', '', '']).map((m, i) => i ? { ...m, c: 'ask' } : m) },
        after: { marks: chordMarks(s, f, q) },
        choices: Object.keys(CH).map(k => ({ v: k, label: `${CH[k].ko} <small>${CH[k].sym}</small>` })), correct: v => v === q,
        explain: `<b>${R}${CH[q].sym}</b> = ${chordNotes(R, q).join(' ')} (${CH[q].t.map(t => t[2]).join(' ')}). ${CH[q].feel}.`,
        play: () => { const r = midiAt(s, f); playSeq(CH[q].t.map(t => r + t[0]), 0.35); },
      };
    },
  },
  earT: {
    stage: 4, title: '귀로 듣기: 메이저 vs 마이너', ear: true,
    items: () => ['et:maj', 'et:min'],
    make(key) {
      const t = key.split(':')[1], r = 40 + rnd(8), tri = t === 'maj' ? [0, 4, 7] : [0, 3, 7];
      const p = rootPos(r % 12), R = rootName(r % 12, t === 'maj' ? 'maj7' : 'm7');
      const play = () => playChord(tri.map(x => r + x));
      return {
        prompt: `이 코드는 밝아요, 어두워요? 🎧`, listen: true, autoplay: true, board: null,
        after: { marks: chordMarks(p.s, p.f, t === 'maj' ? 'maj7' : 'm7').slice(0, 3) },
        choices: [{ v: 'maj', label: '메이저 <small>밝음</small>' }, { v: 'min', label: '마이너 <small>어두움</small>' }], correct: v => v === t,
        explain: t === 'maj' ? `<b>메이저</b> (${R} ${spell(R, 4, 2)} ${spell(R, 7, 4)}). 3음이 장3도 → 밝은 소리.` : `<b>마이너</b> (${R} ${spell(R, 3, 2)} ${spell(R, 7, 4)}). 3음이 단3도 → 어두운 소리.`,
        play,
      };
    },
  },
  earQ: {
    stage: 4, title: '귀로 듣기: 7th 코드 4종', ear: true,
    items: () => Object.keys(CH).map(q => `eq:${q}`),
    make(key) {
      const q = key.split(':')[1], r = 40 + rnd(8), p = rootPos(r % 12), R = rootName(r % 12, q);
      const play = () => playChord(CH[q].t.map(t => r + t[0]));
      return {
        prompt: `무슨 코드일까요? 🎧`, listen: true, autoplay: true, board: null,
        after: { marks: chordMarks(p.s, p.f, q) },
        choices: Object.keys(CH).map(k => ({ v: k, label: `${CH[k].ko} <small>${CH[k].sym}</small>` })), correct: v => v === q,
        explain: `<b>${CH[q].ko} (${R}${CH[q].sym})</b>: ${CH[q].feel}. 구별 요령: 3음이 밝은가 어두운가 → 7음이 날카로운가(7) 부드러운가(♭7) → ♭5의 불안함.`,
        play,
      };
    },
  },

  /* 5단계: 다이아토닉 코드 · 로마숫자 */
  dia: {
    stage: 5, title: '로마숫자 → 코드 이름',
    items() { const k = []; MAJ_KEYS.forEach(K => [1, 2, 3, 4, 5, 6, 7].forEach(d => k.push(`dia:${K}:${d}`))); return k; },
    make(key) {
      const [, K, ds] = key.split(':'), d = +ds, ans = dia(K, d), root = scaleOf(K)[d - 1];
      const wrong = [...Object.keys(CH).map(q => root + CH[q].sym), ...[1, 2, 3, 4, 5, 6, 7].map(x => dia(K, x))];
      return {
        prompt: `<b>${K} 메이저</b> 키의 <b>${RNQ[d - 1]}</b>는?`, board: null, after: null,
        choices: opts(ans, wrong), correct: v => v === ans,
        explain: `${K} 키: ${[1, 2, 3, 4, 5, 6, 7].map(x => x === d ? `<b>${dia(K, x)}</b>` : dia(K, x)).join(' ')}. 순서는 늘 maj7 m7 m7 maj7 7 m7 m7♭5.`,
        play: () => playProg(K, [d]),
      };
    },
  },
  rn: {
    stage: 5, title: '코드 이름 → 로마숫자',
    items() { const k = []; MAJ_KEYS.forEach(K => [1, 2, 3, 4, 5, 6, 7].forEach(d => k.push(`rn:${K}:${d}`))); return k; },
    make(key) {
      const [, K, ds] = key.split(':'), d = +ds;
      return {
        prompt: `<b>${K} 메이저</b> 키에서 <b>${dia(K, d)}</b>는 몇 번 코드?`, board: null, after: null,
        choices: RNQ.map((r, i) => ({ v: i + 1, label: r })), correct: v => v === d,
        explain: `${dia(K, d)}의 루트 ${scaleOf(K)[d - 1]}는 ${K} 메이저의 ${d}음 → <b>${RNQ[d - 1]}</b>.`,
        play: () => playProg(K, [d]),
      };
    },
  },
  func: {
    stage: 5, title: '코드의 역할 (기능)',
    items() { const k = []; ['C', 'G', 'F', 'B♭'].forEach(K => [1, 2, 3, 4, 5, 6, 7].forEach(d => k.push(`fn:${K}:${d}`))); return k; },
    make(key) {
      const [, K, ds] = key.split(':'), d = +ds, f = FUNC[d - 1];
      return {
        prompt: `<b>${K}</b> 키의 <b>${dia(K, d)}</b> (${RNQ[d - 1]})는 어떤 역할?`, board: null, after: null,
        choices: ['토닉', '서브도미넌트', '도미넌트'].map(v => ({ v, label: `${v} <small>${FUNC_DESC[v]}</small>` })), correct: v => v === f,
        explain: `${RNQ[d - 1]} = <b>${f}</b>. 토닉 Ⅰ ⅲ ⅵ / 서브도미넌트 ⅱ Ⅳ / 도미넌트 Ⅴ ⅶ. 흐름은 보통 서브도미넌트 → 도미넌트 → 토닉.`,
        play: () => playProg(K, [d]),
      };
    },
  },
  findKey: {
    stage: 5, title: '진행 보고 키 찾기',
    items() { const k = []; [[2, 5, 1], [1, 6, 2, 5], [1, 4, 5, 1], [6, 2, 5, 1], [3, 6, 2, 5], [4, 5, 3, 6]].forEach((p, i) => k.push(`fk:${i}`)); return k; },
    make(key) {
      const P = [[2, 5, 1], [1, 6, 2, 5], [1, 4, 5, 1], [6, 2, 5, 1], [3, 6, 2, 5], [4, 5, 3, 6]][+key.split(':')[1]];
      const K = pick(MAJ_KEYS), up4 = spell(K, 5, 3), up5 = spell(K, 7, 4);
      const V = scaleOf(K)[4];
      return {
        prompt: `이 진행의 키는?<div class="chart">${P.map(d => `<span>${dia(K, d)}</span>`).join('')}</div>`, board: null, after: null,
        choices: opts(K, [up4, up5, ...MAJ_KEYS.filter(x => x !== K)]).map(c => ({ ...c, label: `${c.v} 메이저` })), correct: v => v === K,
        explain: `<b>${K} 메이저</b>: ${P.map(d => `${dia(K, d)}=${RNQ[d - 1]}`).join(', ')}. 요령: <b>7 코드(${V}7)</b>를 찾으면 그게 Ⅴ, 그 4도 위(${K})가 Ⅰ.`,
        play: () => playProg(K, P),
      };
    },
  },

  /* 6단계: 코드 진행 읽기 */
  iivi: {
    stage: 6, title: 'ⅱ–Ⅴ–Ⅰ 만들기 (메이저/마이너)',
    items() { return [...MAJ_KEYS.map(K => `iv:${K}:M`), ...MIN_KEYS.map(m => `iv:${m}:m`)]; },
    make(key) {
      const [, K, t] = key.split(':');
      const majIIVI = k => `${dia(k, 2)} – ${dia(k, 5)} – ${dia(k, 1)}`;
      const minIIVI = m => `${minDia(m, 2)} – ${minDia(m, 5)} – ${minDia(m, 1)}`;
      let ans, wrong, label, explain, play;
      if (t === 'M') {
        ans = majIIVI(K); label = `${K} 메이저`;
        wrong = [majIIVI(spell(K, 5, 3)), majIIVI(spell(K, 7, 4)), `${scaleOf(K)[1]}maj7 – ${scaleOf(K)[4]}7 – ${K}m7`, `${scaleOf(K)[1]}m7 – ${scaleOf(K)[4]}maj7 – ${K}maj7`];
        explain = `<b>${ans}</b>. ⅱm7 → Ⅴ7 → Ⅰmaj7. 루트가 4도 위로 두 번 이동 (베이스: 한 줄 위 같은 프렛).`;
        play = () => playProg(K, [2, 5, 1]);
      } else {
        ans = minIIVI(K); label = `${K} 마이너`;
        wrong = [minIIVI(spell(K, 5, 3)), `${scaleOf(K, MIN)[1]}m7 – ${scaleOf(K, MIN)[4]}7 – ${K}maj7`, `${scaleOf(K, MIN)[1]}m7♭5 – ${scaleOf(K, MIN)[4]}m7 – ${K}m7`];
        explain = `<b>${ans}</b>. ⅱm7♭5 → Ⅴ7 → ⅰm7. Ⅴ7의 3음(${spell(K, 11, 6)})은 단음계에 없는 음. 이 긴장이 ⅰ로 끌어당겨요.`;
        play = () => playProg(K, [2, 5, 1], MIN_Q, [0, 2, 3, 5, 7, 8, 10]);
      }
      return {
        prompt: `<b>${label}</b>의 ⅱ–Ⅴ–${t === 'M' ? 'Ⅰ' : 'ⅰ'}는?`, board: null, after: null,
        choices: opts(ans, wrong), correct: v => v === ans, explain, play,
      };
    },
  },
  next: {
    stage: 6, title: '다음 코드 예측하기',
    items: () => ['nx:iiV', 'nx:V', 'nx:miiV', 'nx:sec', 'nx:cyc'],
    make(key) {
      const t = key.split(':')[1];
      let K, given, ans, wrong, why, play;
      if (t === 'miiV') {
        K = pick(MIN_KEYS); given = [minDia(K, 2), minDia(K, 5)]; ans = minDia(K, 1);
        wrong = [K + 'maj7', K + '7', minDia(K, 4), minDia(K, 6)];
        why = `마이너 ⅱ–Ⅴ는 ⅰm7으로 해결.`;
        play = () => playProg(K, [2, 5, 1], MIN_Q, MIN);
      } else {
        K = pick(MAJ_KEYS);
        const sc = scaleOf(K);
        if (t === 'iiV') { given = [dia(K, 2), dia(K, 5)]; ans = dia(K, 1); why = 'ⅱ–Ⅴ 다음은 Ⅰ. 가장 흔한 해결.'; play = () => playProg(K, [2, 5, 1]); }
        if (t === 'V') { given = [dia(K, 5)]; ans = dia(K, 1); why = 'Ⅴ7은 4도 위(Ⅰ)로 가려고 해요.'; play = () => playProg(K, [5, 1]); }
        if (t === 'sec') {
          const sec = spell(sc[1], 7, 4) + '7'; given = [dia(K, 1), sec]; ans = dia(K, 2);
          why = `${sec}는 ${K} 키에 없는 코드(3음 ${spell(sc[1], 11, 6)}가 키 밖). ${sc[1]}m7의 Ⅴ7 역할 = <b>세컨더리 도미넌트</b>. 그래서 4도 위 ${ans}로 가요.`;
          play = () => { playProg(K, [1, 6], ['maj7', 'm7', 'm7', 'maj7', 'dom', 'dom', 'hd']); setTimeout(() => playProg(K, [2]), 2500); };
        }
        if (t === 'cyc') { given = [dia(K, 1), dia(K, 4), dia(K, 7), sc[2] + '7']; ans = dia(K, 6); why = `다이아토닉 5도권 순환: 루트가 계속 4도 위로. ${sc[2]}7은 ${sc[5]}m7로 가는 세컨더리 도미넌트.`; play = () => playProg(K, [1, 4, 7, 3, 6], ['maj7', 'm7', 'dom', 'maj7', 'dom', 'm7', 'hd']); }
        wrong = [1, 2, 3, 4, 5, 6, 7].map(x => dia(K, x)).concat([sc[0] + 'm7', sc[5] + 'maj7', sc[1] + '7']);
      }
      return {
        prompt: `다음에 올 가능성이 가장 높은 코드는?<div class="chart">${given.map(c => `<span>${c}</span>`).join('')}<span class="q">?</span></div>`, board: null, after: null,
        choices: opts(ans, wrong), correct: v => v === ans,
        explain: `<b>${ans}</b>. ${why}`, play,
      };
    },
  },
  blues: {
    stage: 6, title: '12마디 블루스 외우기',
    items: () => BLUES.map((_, i) => `bl:${i + 1}`),
    make(key) {
      const n = +key.split(':')[1], K = pick(['F', 'B♭', 'C', 'G', 'A', 'E']), sc = scaleOf(K);
      const nm = d => sc[d - 1] + '7', ans = nm(BLUES[n - 1]);
      const grid = BLUES.map((d, i) => i + 1 === n ? `<b>${nm(d)}</b>` : nm(d));
      return {
        prompt: `<b>${K} 블루스</b>의 <b>${n}번째 마디</b> 코드는?`, board: null, after: null,
        choices: [1, 4, 5].map(d => ({ v: nm(d), label: `${nm(d)} <small>${['', 'Ⅰ7', '', '', 'Ⅳ7', 'Ⅴ7'][d]}</small>` })), correct: v => v === ans,
        explain: `${grid.slice(0, 4).join(' ')} | ${grid.slice(4, 8).join(' ')} | ${grid.slice(8).join(' ')}. 블루스는 모든 코드가 도미넌트7.`,
        play: () => playProg(K, [BLUES[n - 1]], ['dom', 'dom', 'dom', 'dom', 'dom', 'dom', 'dom']),
      };
    },
  },
  earProg: {
    stage: 6, title: '귀로 듣기: 코드 진행', ear: true,
    items: () => PROGS.map((_, i) => `ep:${i}`),
    make(key) {
      const P = PROGS[+key.split(':')[1]], K = pick(['C', 'F', 'G', 'D', 'B♭']);
      return {
        prompt: `어떤 진행일까요? 🎧`, listen: true, autoplay: true, board: null, after: null,
        choices: PROGS.map(p => ({ v: p.rn, label: p.rn })), correct: v => v === P.rn,
        explain: `<b>${P.rn}</b> (${K} 키: ${P.d.map(d => dia(K, d)).join(' – ')}). ${P.note}. 요령: 베이스(루트)의 움직임을 따라 들어요.`,
        play: () => playProg(K, P.d),
      };
    },
  },
};

function ivShapeQuiz(stage, title, set, p) {
  return {
    stage, title,
    items: () => set.map(n => `${p}:${n}`),
    make(key) {
      const n = +key.split(':')[1], { root, tgt, sh } = placeInterval(n);
      const rp = pcAt(root.s, root.f), tp = pcAt(tgt.s, tgt.f);
      return {
        prompt: `<b>R</b>(루트)에서 <b>?</b>까지의 음정은?`,
        board: { marks: [{ ...root, t: 'R', c: 'root' }, { ...tgt, t: '?', c: 'ask' }] },
        after: { marks: [{ ...root, t: SHARP[rp], c: 'root' }, { ...tgt, t: SHARP[tp], c: 'ok' }] },
        choices: ivChoices(set), correct: v => v === n,
        explain: `<b>${IV[n][0]} (${IV[n][1]})</b> · 반음 ${n}개 · 모양: ${shapeText(sh)}. (${SHARP[rp]} → ${SHARP[tp]})`,
        play: () => playSeq([midiAt(root.s, root.f), midiAt(tgt.s, tgt.f)]),
      };
    },
  };
}
function earQuiz(stage, title, set, p) {
  return {
    stage, title, ear: true,
    items: () => set.map(n => `${p}:${n}`),
    make(key) {
      const n = +key.split(':')[1], { root, tgt, sh } = placeInterval(n);
      const play = () => playSeq([midiAt(root.s, root.f), midiAt(tgt.s, tgt.f)], 0.8);
      return {
        prompt: `두 음 사이의 음정은? 🎧`, listen: true, autoplay: true,
        board: null,
        after: { marks: [{ ...root, t: SHARP[pcAt(root.s, root.f)], c: 'root' }, { ...tgt, t: SHARP[pcAt(tgt.s, tgt.f)], c: 'ok' }] },
        choices: ivChoices(set), correct: v => v === n,
        explain: `<b>${IV[n][0]} (${IV[n][1]})</b> · 지판 모양: ${shapeText(sh)}.`,
        play,
      };
    },
  };
}

/* ───────── 레슨 내용 ───────── */
const LESSONS = [
  {
    id: 'l1', stage: 1, title: '음 이름과 지판', quizzes: ['f2n5', 'n2f', 'steps', 'f2n12'],
    cards: [
      { h: '음 이름은 알파벳 7개', b: `<p>도레미 대신 <b>C D E F G A B</b>를 씁니다.</p><p class="big">C=도 · D=레 · E=미 · F=파 · G=솔 · A=라 · B=시</p><p>B 다음은 다시 C. 코드 이름(Am, G7…)이 전부 이 알파벳이라, 이걸로 생각하는 게 훨씬 빨라요.</p>` },
      { h: '사이사이 반음 5개 → 총 12음', b: `<p>C와 D 사이에는 음이 하나 더 있어요: <b>C♯</b>(=D♭).</p><p><b>♯ 샵</b> = 반음 올림, <b>♭ 플랫</b> = 반음 내림. 같은 음에 이름이 두 개인 것뿐이에요.</p><p><b>단, B–C와 E–F 사이엔 없어요.</b> 그래서 7 + 5 = 12음.</p>`,
        board: { str: 1, marks: [...Array(13).keys()].map(f => ({ s: 1, f, t: SHARP[pcAt(1, f)], c: NATURAL(pcAt(1, f)) ? 'ok' : 'soft' })) },
        cap: 'A현 0~12프렛: 12음이 순서대로 지나가요' },
      { h: '1프렛 = 반음, 2프렛 = 온음', b: `<p>베이스는 <b>한 프렛이 반음</b>. 반음 두 개가 <b>온음</b>이에요.</p><p>E현에서: E → F는 1프렛(반음), F → G는 2프렛(온음).</p>`,
        board: { str: 0, to: 5, marks: [{ s: 0, f: 0, t: 'E', c: 'ok' }, { s: 0, f: 1, t: 'F', c: 'ok' }, { s: 0, f: 3, t: 'G', c: 'ok' }, { s: 0, f: 5, t: 'A', c: 'ok' }] },
        sounds: [{ label: 'E → F (반음)', seq: [28, 29] }, { label: 'F → G (온음)', seq: [29, 31] }] },
      { h: '개방현: E A D G', b: `<p>굵은 줄부터 <b>E – A – D – G</b>. 그림에선 연주할 때 내려다보는 것처럼 E현이 맨 아래예요.</p>`,
        board: { to: 5, marks: [0, 1, 2, 3].map(s => ({ s, f: 0, t: STR[s].n, c: 'root' })) },
        sounds: [{ label: '개방현 E A D G', seq: [28, 33, 38, 43] }] },
      { h: '5프렛 = 다음 줄 개방현', b: `<p>E현 5프렛 = <b>A</b> = A현 개방. 튜닝할 때 쓰는 그 원리예요.</p><p>모든 줄이 <b>완전4도(반음 5개)</b> 간격이라 그래요. 이건 2단계에서 다시 나옵니다.</p>`,
        board: { to: 5, marks: [{ s: 0, f: 5, t: 'A', c: 'ok' }, { s: 1, f: 0, t: 'A', c: 'ok' }, { s: 1, f: 5, t: 'D', c: 'soft' }, { s: 2, f: 0, t: 'D', c: 'soft' }, { s: 2, f: 5, t: 'G', c: 'ok' }, { s: 3, f: 0, t: 'G', c: 'ok' }] } },
      { h: '12프렛 = 옥타브', b: `<p>12프렛(점 두 개)에서 개방현과 <b>같은 이름</b>이 다시 시작돼요. 한 옥타브 높을 뿐.</p><p>→ 결국 <b>0~11프렛만 외우면</b> 지판 전체를 아는 셈.</p>`,
        board: { marks: [0, 1, 2, 3].flatMap(s => [{ s, f: 0, t: STR[s].n, c: 'root' }, { s, f: 12, t: STR[s].n, c: 'root' }]) } },
      { h: '옥타브 모양: 두 줄 위, 2프렛 오른쪽', b: `<p>E현 3프렛 G → D현 5프렛도 G. 베이스 라인에서 정말 많이 쓰는 모양이에요 (디스코·펑크 옥타브 주법).</p>`,
        board: { to: 7, marks: [{ s: 0, f: 3, t: 'G', c: 'root' }, { s: 2, f: 5, t: 'G', c: 'ok' }, { s: 1, f: 3, t: 'C', c: 'root' }, { s: 3, f: 5, t: 'C', c: 'ok' }] },
        sounds: [{ label: 'G 옥타브', seq: [31, 43] }, { label: 'C 옥타브', seq: [36, 48] }] },
      { h: '외우는 요령', b: `<p>처음부터 다 외우지 말고 <b>E현·A현 0~5프렛의 자연음</b>부터.</p><p class="big">E현: E F · G · A<br>A현: A · B C · D</p><p>루트는 대부분 E현·A현에서 잡으니까, 여기만 알아도 코드 차트 보고 바로 루트를 짚을 수 있어요. 이제 퀴즈로!</p>`,
        board: { to: 5, marks: [[0, 0], [0, 1], [0, 3], [0, 5], [1, 0], [1, 2], [1, 3], [1, 5]].map(([s, f]) => ({ s, f, t: SHARP[pcAt(s, f)], c: 'ok' })) } },
    ],
  },
  {
    id: 'l2', stage: 2, title: '음정 (Interval)', quizzes: ['ivB', 'earB', 'ivA', 'earA'],
    cards: [
      { h: '음정 = 두 음 사이의 거리', b: `<p>두 음이 <b>반음 몇 개</b> 떨어져 있나. 그게 음정이에요.</p><p>베이스는 프렛 = 반음이라, 사실 <b>프렛 수를 세면 끝</b>. 이름만 붙이면 됩니다.</p>` },
      { h: '"3도"의 숫자 = 알파벳 개수', b: `<p>C → E: <b>C D E</b> 세 글자를 지나니까 <b>3도</b>.</p><p>같은 3도라도 반음 4개면 <b>장3도(M3)</b>, 3개면 <b>단3도(m3)</b>. 장(Major)=밝음, 단(minor)=어두움.</p><p>4도·5도·옥타브는 장/단 대신 <b>완전(P)</b>이라고 불러요.</p>` },
      { h: '베이스 핵심 음정 5개', b: `<p>코드의 뼈대가 전부 이걸로 만들어져요.</p>
        <table class="tbl"><tr><th>이름</th><th>반음</th><th>지판 모양</th><th></th></tr>
        ${BASIC.map(n => `<tr><td>${ivLabel(n)}</td><td>${n}</td><td>${shapeText(ivShape(n))}</td><td><button class="mini" data-seq="36,${36 + n}">▶</button></td></tr>`).join('')}</table>` },
      { h: '완전5도: 한 줄 위, 2프렛 오른쪽', b: `<p>루트 + 5도 = 베이스의 기본 중 기본 (컨트리·록 "루트-파이브").</p><p>A현 3프렛 C → D현 5프렛 G.</p>`,
        board: { to: 7, marks: [{ s: 1, f: 3, t: 'C', c: 'root' }, { s: 2, f: 5, t: 'G', c: 'ok' }] },
        sounds: [{ label: 'C → G (P5)', seq: [36, 43] }] },
      { h: '장3도 vs 단3도', b: `<p><b>장3도</b>: 한 줄 위, 1프렛 왼쪽 → 밝은 소리 (메이저 코드)</p><p><b>단3도</b>: 한 줄 위, 2프렛 왼쪽 → 어두운 소리 (마이너 코드)</p><p>코드가 C인지 Cm인지는 <b>이 한 음</b>이 결정해요.</p>`,
        board: { to: 7, marks: [{ s: 1, f: 3, t: 'C', c: 'root' }, { s: 2, f: 2, t: 'E', c: 'ok' }, { s: 2, f: 1, t: 'E♭', c: 'soft' }] },
        sounds: [{ label: 'C → E (M3)', seq: [36, 40] }, { label: 'C → E♭ (m3)', seq: [36, 39] }] },
      { h: '완전4도: 한 줄 위, 같은 프렛', b: `<p>줄과 줄 사이가 원래 완전4도라서, 바로 위 줄 같은 프렛이에요.</p><p>A현 3프렛 C → D현 3프렛 F.</p>`,
        board: { to: 7, marks: [{ s: 1, f: 3, t: 'C', c: 'root' }, { s: 2, f: 3, t: 'F', c: 'ok' }] },
        sounds: [{ label: 'C → F (P4)', seq: [36, 41] }] },
      { h: '전체 12음정 표', b: `<table class="tbl"><tr><th>이름</th><th>반음</th><th>지판 모양</th><th></th></tr>
        ${ALLIV.map(n => `<tr><td>${ivLabel(n)}</td><td>${n}</td><td>${shapeText(ivShape(n))}</td><td><button class="mini" data-seq="36,${36 + n}">▶</button></td></tr>`).join('')}</table>
        <p class="note">트라이톤(반음 6개) = 증4도 = 감5도. 긴장감 있는 소리.</p>` },
      { h: '소리로 외우기: 노래 첫 두 음', b: `<p>귀 훈련 퀴즈 전에 연상 하나씩 걸어두면 쉬워요.</p>
        <ul class="songs"><li><b>완전4도</b> — 결혼행진곡(바그너) 시작</li><li><b>완전5도</b> — 스타워즈 메인 테마 시작</li><li><b>옥타브</b> — Somewhere Over the Rainbow 시작</li><li><b>장3도</b> — When the Saints Go Marching In 시작</li><li><b>장6도</b> — My Bonnie 시작</li></ul>`,
        sounds: [{ label: 'P4', seq: [36, 41] }, { label: 'P5', seq: [36, 43] }, { label: 'P8', seq: [36, 48] }, { label: 'M3', seq: [36, 40] }, { label: 'M6', seq: [36, 45] }] },
    ],
  },
  {
    id: 'l3', stage: 3, title: '장음계 · 단음계 · 조', quizzes: ['deg', 'degTap', 'keysig', 'rel'],
    cards: [
      { h: '스케일 = 규칙대로 고른 음 7개', b: `<p>12음 중 7개를 골라 쓰는 <b>팔레트</b>예요. 가장 기본이 <b>장음계(메이저 스케일)</b>.</p><p class="big">온 · 온 · 반 · 온 · 온 · 온 · 반</p><p>이 공식만 알면 <b>어느 음에서 시작해도</b> 메이저 스케일을 만들 수 있어요. 베이스에선 온=2프렛, 반=1프렛.</p>` },
      { h: 'C 메이저 = C D E F G A B', b: `<p>♯·♭이 하나도 없는 유일한 메이저. A현 3프렛(C)에서 시작하는 <b>3음씩 한 줄</b> 박스 모양을 손에 익혀요.</p>`,
        board: { to: 9, marks: boxMarks(1, 3, [...MAJ, 12], [...scaleOf('C'), 'C']) },
        sounds: [{ label: 'C 메이저 스케일', seq: [...MAJ, 12].map(x => 36 + x) }] },
      { h: '이 모양은 어디로든 옮길 수 있다', b: `<p>똑같은 모양을 E현 3프렛(G)에서 시작하면 <b>G 메이저</b>. 키가 바뀌어도 <b>모양은 그대로</b>, 위치만 이동. 베이스의 큰 장점이에요.</p><p>그래서 음 이름보다 <b>번호(1~7)</b>로 외워두면 모든 키에서 써먹을 수 있어요.</p>`,
        board: { to: 9, marks: boxMarks(0, 3, [...MAJ, 12], ['1', '2', '3', '4', '5', '6', '7', '1']) },
        sounds: [{ label: 'G 메이저 스케일', seq: [...MAJ, 12].map(x => 31 + x) }] },
      { h: '음 번호 = 디그리', b: `<p>스케일 음에 번호를 붙여요. C 메이저면 C=1, D=2, E=3 … B=7.</p><p>코드도 솔로도 <b>전부 번호로 말해요</b>: "메이저 코드 = 1·3·5", "3음에 착지", "♭7". 키가 바뀌어도 번호의 <b>역할과 소리 느낌</b>은 같아요.</p><p class="note">귀 훈련 팁: 1은 집, 7은 1로 가고 싶어 안달, 4는 3으로 내려가고 싶어함.</p>`,
        sounds: [{ label: '7 → 1 (해결)', seq: [47, 48] }, { label: '4 → 3', seq: [41, 40] }, { label: '1-3-5', seq: [36, 40, 43] }] },
      { h: '조(Key) = 곡의 중심', b: `<p>"이 곡 키가 G야" = <b>G가 집(중심)</b>이고 G 메이저 스케일 음을 주로 쓴다는 뜻.</p><p>G 메이저 = G A B C D E <b>F♯</b> → ♯가 1개. 이렇게 키마다 붙는 ♯·♭을 <b>조표</b>라고 해요.</p><p class="note">철자 규칙: 스케일엔 알파벳이 한 번씩만 나와요. 그래서 G 메이저의 7음은 G♭이 아니라 F♯.</p>` },
      { h: '5도권: 키들의 지도', b: `<p>C에서 <b>5도씩 올라가면</b> ♯가 하나씩 늘어요.</p><p class="big">C → G → D → A → E → B → F♯</p><p><b>4도씩 올라가면</b>(=5도 아래) ♭가 하나씩.</p><p class="big">C → F → B♭ → E♭ → A♭ → D♭</p><p><b>재즈 코드 진행은 이 4도 방향으로 많이 움직여요</b> (6단계). 베이스에서 4도 위 = 한 줄 위 같은 프렛이라 손이 쉽게 따라가요.</p>`,
        sounds: [{ label: '4도씩: C F B♭ E♭', seq: [36, 41, 46, 51] }] },
      { h: '나란한조: C 메이저 = A 마이너', b: `<p>C 메이저의 <b>6음(A)</b>에서 시작하면 A 자연단음계. 음은 똑같고 중심만 달라요.</p><p class="big">1 2 ♭3 4 5 ♭6 ♭7</p><p>메이저 공식과 비교해 3·6·7음이 반음 낮아요 → 어두운 소리. 그림은 E현 5프렛(A)에서 시작하는 마이너 박스.</p>`,
        board: { to: 9, marks: boxMarks(0, 5, [...MIN, 12], ['1', '2', '♭3', '4', '5', '♭6', '♭7', '1']) },
        sounds: [{ label: 'A 마이너 스케일', seq: [...MIN, 12].map(x => 33 + x) }, { label: 'C 메이저 (같은 음)', seq: [...MAJ, 12].map(x => 36 + x) }] },
      { h: '솔로에서는?', b: `<p>곡의 키 스케일 7음 = 일단 <b>크게 틀리지 않는 음</b>.</p><p>그런데 7음의 무게가 다 같지는 않아요. <b>지금 울리는 코드의 구성음</b>이 가장 강하게 맞아요. 그게 다음 단계(코드톤)예요.</p><p class="note">🎸 집 연습: 키 하나를 정하고 박스 안의 음만으로 4마디 흥얼거리듯 쳐보기. 끝은 항상 1음으로.</p>` },
    ],
  },
  {
    id: 'l4', stage: 4, title: '코드 구성음 (코드톤)', quizzes: ['ctone', 'cqual', 'earT', 'earQ'],
    cards: [
      { h: '코드 = 3도씩 쌓은 음', b: `<p>스케일에서 <b>한 칸씩 건너뛰며</b> 쌓아요: 1 · 3 · 5 = <b>트라이어드</b>(3화음).</p><p>그 위에 7을 하나 더 얹으면 <b>7th 코드</b>(4화음). 재즈 차트는 거의 전부 7th 코드예요.</p><p>이 음들을 <b>코드톤</b>이라고 불러요.</p>` },
      { h: '메이저 vs 마이너: 3음 하나 차이', b: `<p><b>메이저</b> 1 · 3 · 5 → 밝음<br><b>마이너</b> 1 · ♭3 · 5 → 어두움</p><p>2단계에서 본 장3도/단3도가 바로 이거예요. 지판에선 3음이 <b>한 프렛</b> 차이.</p>`,
        board: { to: 7, marks: [{ s: 1, f: 3, t: 'C', c: 'root' }, { s: 2, f: 2, t: '3', c: 'ok' }, { s: 2, f: 1, t: '♭3', c: 'soft' }, { s: 2, f: 5, t: '5', c: 'ok' }] },
        sounds: [{ label: 'C 메이저', seq: [36, 40, 43] }, { label: 'C 마이너', seq: [36, 39, 43] }] },
      { h: '7th 코드 4종 (C 기준)', b: `<table class="tbl"><tr><th>기호</th><th>구성</th><th>C 예시</th><th></th></tr>
        ${Object.keys(CH).map(q => `<tr><td><b>C${CH[q].sym}</b><br><small>${CH[q].ko}</small></td><td>${CH[q].t.map(t => t[2]).join(' ')}</td><td>${chordNotes('C', q).join(' ')}</td><td><button class="mini" data-seq="${CH[q].t.map(t => 36 + t[0]).join(',')}">▶</button></td></tr>`).join('')}</table>
        <p class="note">다른 표기: Cmaj7 = CΔ7, Cm7 = C-7, Cm7♭5 = Cø</p>` },
      { h: 'maj7: 밝고 안정', b: `<p>1 · 3 · 5 · <b>7</b>. 7음이 루트 바로 반음 아래라 살짝 몽환적. 주로 <b>Ⅰ, Ⅳ</b> 자리.</p><p>모양: 3은 한 줄 위 1프렛 왼쪽, 5는 한 줄 위 2프렛 오른쪽, 7은 두 줄 위 1프렛 오른쪽.</p>`,
        board: { to: 7, marks: chordMarks(1, 3, 'maj7') }, sounds: [{ label: 'Cmaj7', seq: [36, 40, 43, 47] }] },
      { h: '7 (도미넌트): 긴장', b: `<p>1 · 3 · 5 · <b>♭7</b>. 3음과 ♭7음 사이가 <b>트라이톤</b> → 불안정 → 다음 코드로 풀리고 싶어해요.</p><p><b>Ⅴ7 → Ⅰ</b>(G7 → C)이 화성의 엔진이에요. 솔로에서 이 "풀림"을 들려주는 게 핵심.</p>`,
        board: { to: 7, marks: chordMarks(1, 3, 'dom') }, sounds: [{ label: 'C7', seq: [36, 40, 43, 46] }, { label: 'G7 → C (해결)', seq: [31, 35, 38, 41, 36] }] },
      { h: 'm7: 어둡고 부드러움', b: `<p>1 · <b>♭3</b> · 5 · <b>♭7</b>. 재즈에서 가장 흔한 코드 중 하나. 주로 <b>ⅱ, ⅲ, ⅵ</b> 자리.</p>`,
        board: { to: 7, marks: chordMarks(1, 3, 'm7') }, sounds: [{ label: 'Cm7', seq: [36, 39, 43, 46] }] },
      { h: 'm7♭5: 불안하고 어두움', b: `<p>1 · ♭3 · <b>♭5</b> · ♭7. 5음까지 반음 내려가 불안한 소리. 메이저 키의 <b>ⅶ</b>, 그리고 <b>마이너 키의 ⅱ</b>(마이너 ⅱ–Ⅴ–ⅰ)에서 나와요.</p>`,
        board: { to: 7, marks: chordMarks(1, 3, 'hd') }, sounds: [{ label: 'Cm7♭5', seq: [36, 39, 42, 46] }] },
      { h: '솔로에서: 코드톤 = 착지점', b: `<p>코드가 바뀌는 순간 <b>그 코드의 코드톤에 착지</b>하면 반주 없이도 진행이 들려요. 이게 "진행을 따라가는 솔로"의 기본.</p><p>특히 <b>3음과 7음</b>(가이드톤)이 코드 성격을 결정해요 → 8단계.</p><p class="note">🎸 집 연습: 코드 하나 정해 아르페지오를 위아래로 → 순서를 섞어서 → 리듬을 넣어 즉흥. 각 2분.</p>` },
    ],
  },
  {
    id: 'l5', stage: 5, title: '다이아토닉 코드 · 로마숫자', quizzes: ['dia', 'rn', 'func', 'findKey'],
    cards: [
      { h: '다이아토닉 코드 = 키 안의 코드 7개', b: `<p>스케일 각 음 위에 <b>그 스케일 음만으로</b> 3도씩 쌓으면 코드가 7개 생겨요. 이게 그 키의 <b>가족</b>이에요.</p><p>대부분의 곡은 이 7개 위주로 굴러가요. 그래서 이걸 알면 차트의 70%는 "아는 코드"가 돼요.</p>` },
      { h: 'C 메이저 키의 7개 코드', b: `<table class="tbl"><tr><th>번호</th><th>코드</th><th>구성</th><th></th></tr>
        ${[1, 2, 3, 4, 5, 6, 7].map(d => `<tr><td><b>${RNQ[d - 1]}</b></td><td>${dia('C', d)}</td><td>${chordNotes(scaleOf('C')[d - 1], DIA_Q[d - 1]).join(' ')}</td><td><button class="mini" data-chords='${JSON.stringify(progList('C', [d]))}'>▶</button></td></tr>`).join('')}</table>
        <p class="big">외울 건 순서 하나:<br>maj7 · m7 · m7 · maj7 · 7 · m7 · m7♭5</p><p class="note">어느 메이저 키든 이 순서는 똑같아요.</p>` },
      { h: '로마숫자: 키가 바뀌어도 같은 이름', b: `<p><b>대문자</b>(Ⅰ Ⅳ Ⅴ) = 3음이 장3도인 코드, <b>소문자</b>(ⅱ ⅲ ⅵ ⅶ) = 3음이 단3도인 코드.</p>
        <table class="tbl"><tr><th></th>${RN.map(r => `<th>${r}</th>`).join('')}</tr>${['C', 'G', 'F', 'B♭'].map(K => `<tr><td><b>${K}</b></td>${[1, 2, 3, 4, 5, 6, 7].map(d => `<td><small style="color:var(--text)">${dia(K, d).replace(/maj7|m7♭5|m7|7/, x => `<br>${x}`)}</small></td>`).join('')}</tr>`).join('')}</table>
        <p>"ⅱ–Ⅴ–Ⅰ"이라고 하면 <b>모든 키에서</b> 통하는 말이 돼요.</p>` },
      { h: '기능: 집 · 출발 · 긴장', b: `<p><b>토닉</b> (Ⅰ ⅲ ⅵ): 집, 안정<br><b>서브도미넌트</b> (ⅱ Ⅳ): 집을 떠나 출발<br><b>도미넌트</b> (Ⅴ ⅶ): 긴장, 집으로 돌아가고 싶음</p><p>대부분의 진행은 <b>토닉 → 서브도미넌트 → 도미넌트 → 토닉</b>으로 숨을 쉬어요.</p>`,
        sounds: [{ label: 'Ⅰ – Ⅳ – Ⅴ – Ⅰ', chords: progList('C', [1, 4, 5, 1]) }, { label: 'Ⅰ – ⅱ – Ⅴ – Ⅰ', chords: progList('C', [1, 2, 5, 1]) }] },
      { h: '7 코드는 키에 딱 하나', b: `<p>7개 중 <b>도미넌트7(그냥 "7")은 Ⅴ 하나뿐</b>이에요.</p><p>그래서 차트에서 7 코드를 찾으면 키가 보여요: <b>그 코드의 4도 위가 Ⅰ</b>.</p><p class="big">D7이 보이면 → G 키 후보<br>B♭7이 보이면 → E♭ 키 후보</p><p class="note">예외: 블루스(전부 7 코드)와 세컨더리 도미넌트 → 6단계.</p>` },
      { h: '지판에서: ⅱ → Ⅴ → Ⅰ은 한 줄씩 위로', b: `<p>ⅱ → Ⅴ → Ⅰ은 루트가 <b>4도씩 위로</b> 두 번 이동해요. 베이스에선 <b>한 줄 위 같은 프렛</b>을 두 번.</p><p>C 키: D(A현 5) → G(D현 5) → C(G현 5).</p>`,
        board: { to: 7, marks: [{ s: 1, f: 5, t: 'ⅱ', c: 'soft' }, { s: 2, f: 5, t: 'Ⅴ', c: 'ok' }, { s: 3, f: 5, t: 'Ⅰ', c: 'root' }] },
        sounds: [{ label: 'Dm7 – G7 – Cmaj7', chords: progList('C', [2, 5, 1]) }] },
      { h: '마이너 키의 다이아토닉', b: `<table class="tbl"><tr><th>번호</th><th>A 마이너</th></tr>${[1, 2, 3, 4, 5, 6, 7].map(d => `<tr><td><b>${MRN[d - 1]}</b></td><td>${minDia('A', d)}</td></tr>`).join('')}</table>
        <p><b>Ⅴ7 주의</b>: 자연단음계대로면 Em7인데, 7음 G를 반음 올려 <b>G♯</b>로 만든 <b>E7</b>을 써요. 그래야 ⅰ로 끌려가는 긴장이 생기거든요 (하모닉 마이너).</p>`,
        sounds: [{ label: 'Am7 – Dm7 – E7 – Am7', chords: progList('A', [1, 4, 5, 1], MIN_Q, MIN) }] },
      { h: '솔로에서: 번호로 생각하기', b: `<p>차트를 로마숫자로 바꿔 읽으면, 한 키에서 연습한 프레이즈를 <b>다른 키로 그대로 옮길 수</b> 있어요. 베이스는 모양이 같으니 더 쉽고요.</p><p class="note">📱 폰 연습: 좋아하는 곡의 코드 차트를 찾아 로마숫자로 바꿔보기.<br>🎸 집 연습: ⅱ–Ⅴ–Ⅰ 루트를 C → F → B♭ → E♭ 키로 이동하며 치기.</p>` },
    ],
  },
  {
    id: 'l6', stage: 6, title: '코드 진행 읽기', quizzes: ['iivi', 'next', 'blues', 'earProg'],
    cards: [
      { h: '진행은 덩어리로 읽는다', b: `<p>코드를 하나씩 읽지 말고 <b>단어처럼 묶어서</b> 읽어요. 자주 나오는 덩어리 몇 개만 알면 대부분의 차트가 읽혀요.</p><p class="big">Ⅴ–Ⅰ · ⅱ–Ⅴ–Ⅰ · 마이너 ⅱ–Ⅴ–ⅰ<br>Ⅰ–ⅵ–ⅱ–Ⅴ · 세컨더리 도미넌트 · 블루스</p>` },
      { h: 'Ⅴ7 → Ⅰ: 가장 강한 움직임', b: `<p>루트가 4도 위(=5도 아래)로. G7 → Cmaj7.</p><p>G7의 <b>3음 B는 반음 위 C로</b>, <b>♭7음 F는 반음 아래 E로</b> 풀려요. 이 반음 움직임이 "해결"되는 느낌의 정체예요. 솔로에서 이 두 음을 짚으면 진행이 들려요.</p>`,
        sounds: [{ label: 'G7 → Cmaj7', chords: progList('C', [5, 1]) }, { label: 'B → C, F → E', seq: [47, 48, 41, 40] }] },
      { h: 'ⅱ–Ⅴ–Ⅰ: 재즈의 기본 단위', b: `<p>Dm7 – G7 – Cmaj7. 차트에서 <b>"m7 다음에 4도 위 7 코드"</b>가 보이면 ⅱ–Ⅴ예요. 괄호로 묶어 읽어요.</p><p>곡 중간에 다른 키의 ⅱ–Ⅴ가 나오면 <b>잠깐 그 키로 간다</b>는 신호예요.</p>`,
        board: { to: 7, marks: [{ s: 1, f: 5, t: 'D', c: 'soft' }, { s: 2, f: 5, t: 'G', c: 'ok' }, { s: 3, f: 5, t: 'C', c: 'root' }] },
        sounds: [{ label: 'C 키', chords: progList('C', [2, 5, 1]) }, { label: 'F 키', chords: progList('F', [2, 5, 1]) }, { label: 'B♭ 키', chords: progList('B♭', [2, 5, 1]) }] },
      { h: '마이너 ⅱ–Ⅴ–ⅰ', b: `<p>Bm7♭5 – E7 – Am7. <b>m7♭5 다음에 7 코드</b>가 오면 마이너로 해결한다는 신호.</p><p>메이저 ⅱ–Ⅴ보다 어둡고 극적이에요.</p>`,
        sounds: [{ label: 'A 마이너', chords: progList('A', [2, 5, 1], MIN_Q, MIN) }, { label: 'D 마이너', chords: progList('D', [2, 5, 1], MIN_Q, MIN) }] },
      { h: '5도권 순환 진행', b: `<p class="big">Cmaj7 → Fmaj7 → Bm7♭5 → E7 → Am7 → Dm7 → G7 → Cmaj7</p><p>루트가 <b>계속 4도 위로</b> 이동해요 (F → B만 증4도). 수많은 스탠더드의 뼈대예요.</p><p>베이스로는 한 줄씩 위로 올라가다 줄이 끝나면 옥타브 아래로 돌아와 다시.</p>`,
        sounds: [{ label: '순환 진행 (C 키)', chords: progList('C', [1, 4, 7, 3, 6, 2, 5, 1], ['maj7', 'm7', 'dom', 'maj7', 'dom', 'm7', 'hd']), beat: 1.1 }] },
      { h: 'Ⅰ–ⅵ–ⅱ–Ⅴ와 팝 진행', b: `<p><b>Ⅰ–ⅵ–ⅱ–Ⅴ</b>: 턴어라운드. 끝나지 않고 계속 도는 느낌이라 곡 끝이나 반복 구간에 많아요.</p><p><b>Ⅰ–Ⅴ–ⅵ–Ⅳ</b>: 팝에서 가장 흔한 진행.</p>`,
        sounds: [{ label: 'Ⅰ–ⅵ–ⅱ–Ⅴ', chords: progList('C', [1, 6, 2, 5]) }, { label: 'Ⅰ–Ⅴ–ⅵ–Ⅳ', chords: progList('C', [1, 5, 6, 4]) }] },
      { h: '세컨더리 도미넌트', b: `<p>키에 없는 7 코드가 나오면: <b>다음 코드의 Ⅴ7</b>인지 확인해요.</p><table class="tbl"><tr><th>C 키에서</th><th>향하는 곳</th><th>키 밖 음</th></tr><tr><td>A7</td><td>→ Dm7 (ⅱ)</td><td>C♯</td></tr><tr><td>E7</td><td>→ Am7 (ⅵ)</td><td>G♯</td></tr><tr><td>D7</td><td>→ G7 (Ⅴ)</td><td>F♯</td></tr></table><p>솔로에서 <b>그 코드에서만</b> 키 밖 음(A7의 C♯)을 짚으면 진행이 확 살아나요.</p>`,
        sounds: [{ label: 'Cmaj7 – A7 – Dm7 – G7', chords: [[36, 'maj7'], [45, 'dom'], [38, 'm7'], [43, 'dom'], [36, 'maj7']] }] },
      { h: '12마디 블루스', b: `<p>모든 코드가 <b>도미넌트7</b>인 예외적인 형식. F 블루스:</p>
        <div class="grid12b">${BLUES.map(d => `<span class="${d === 4 ? 'iv' : d === 5 ? 'v' : ''}">${scaleOf('F')[d - 1]}7</span>`).join('')}</div>
        <p>Ⅰ7 ×4 | Ⅳ7 ×2, Ⅰ7 ×2 | Ⅴ7 Ⅳ7 Ⅰ7 Ⅴ7. 잼 세션의 공용어라 꼭 외워둬요. 솔로 입구는 7단계 펜타토닉.</p>`,
        sounds: [{ label: 'F 블루스 12마디', chords: progList('F', BLUES, Array(7).fill('dom')), beat: 0.9 }] },
      { h: '차트 분석 루틴', b: `<ol class="songs"><li><b>키 찾기</b>: 7 코드의 4도 위, maj7 코드</li><li><b>ⅱ–Ⅴ 괄호 치기</b>: m7(또는 m7♭5) → 4도 위 7</li><li><b>키 밖 7 코드</b> → 세컨더리 도미넌트인지</li><li><b>키가 바뀌는 곳</b> 표시</li></ol>
        <p>예시:</p><div class="chart"><span>Am7</span><span>Dm7</span><span>G7</span><span>Cmaj7</span><span>Fmaj7</span><span>Bm7♭5</span><span>E7</span><span>Am7</span></div>
        <p>C 키(=A 마이너): ⅵ [ⅱ Ⅴ] Ⅰ Ⅳ [ⅱø Ⅴ7 → ⅰ]. 앞은 메이저 ⅱ–Ⅴ–Ⅰ, 뒤는 A 마이너 ⅱ–Ⅴ–ⅰ. 8개 코드가 <b>덩어리 2개</b>로 보여요.</p>` },
    ],
  },
];
const ROADMAP = [
  [7, '펜타토닉 · 블루스 스케일 (첫 즉흥)'], [8, '코드톤 솔로 · 가이드톤'], [9, '접근음 · 크로매틱 연결'],
  [10, '코드-스케일 (도리안 · 믹솔리디안 · 하모닉 마이너)'], [11, '리듬 · 프레이징'], ['🎯', '곡 적용: 차트 보고 솔로'],
];
const EAR_TRACK = [
  ['E1', '음정 듣기', true], ['E2', '코드 성질 듣기', true], ['E3', '스케일 디그리 듣기 (키 위에서 몇 음?)', false],
  ['E4', '코드 진행 듣기', true], ['E5', '프레이즈 받아치기', false],
];

/* ───────── 화면들 ───────── */
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;

function home() {
  const started = Object.keys(S.items).length > 0;
  app.innerHTML = `
  <header class="top"><div><h1>화성학 스터디</h1><p class="sub">베이스로 배우는 화성학 · ABC 표기</p></div>
    <div class="streak">${S.streak.count ? `🔥 ${S.streak.count}일` : ''}</div></header>
  <main class="home">
    <a class="cta" href="#/daily">${started ? '오늘의 5분 복습' : '시작하기 (5분)'}<span>틀렸던 것 위주로 10문제</span></a>
    ${!isStandalone() && !S.hideInstall ? `<div class="tip"><b>앱처럼 쓰기:</b> iPhone은 공유 → "홈 화면에 추가", Android는 ⋮ → "홈 화면에 추가". 오프라인에서도 돼요.<button class="x" id="hideTip">✕</button></div>` : ''}
    ${LESSONS.map(L => `
      <section class="stage"><h2><span class="num">${L.stage}</span>${L.title}</h2>
        <a class="row lesson" href="#/lesson/${L.id}">📖 개념 카드 ${L.cards.length}장 ${S.lessons[L.id] ? '<span class="done">✓ 읽음</span>' : '<span class="new">먼저 읽기</span>'}</a>
        ${L.quizzes.map(q => { const m = mastery(q); return `<a class="row" href="#/quiz/${q}"><span>${QUIZ[q].ear ? '🎧' : '✏️'} ${QUIZ[q].title}</span><span class="meter"><i style="width:${Math.round(m * 100)}%"></i></span><span class="pct">${Math.round(m * 100)}%</span></a>`; }).join('')}
      </section>`).join('')}
    <section class="stage"><h2>도구</h2>
      <a class="row" href="#/ref">🎸 지판 전체 보기 · 음정 표</a>
      <a class="row" href="#/settings">⚙️ 설정</a></section>
    <section class="stage soon"><h2>다음 단계 (준비 중)</h2>
      ${ROADMAP.map(([n, t]) => `<div class="row"><span><span class="num sm">${n}</span>${t}</span></div>`).join('')}</section>
    <section class="stage soon"><h2>🎧 귀 훈련 트랙</h2>
      ${EAR_TRACK.map(([n, t, ok]) => `<div class="row ${ok ? 'have' : ''}"><span><span class="num sm">${n}</span>${t}</span><span class="pct">${ok ? '✓ 있음' : '준비 중'}</span></div>`).join('')}</section>
  </main>`;
  const t = $('#hideTip'); if (t) t.onclick = () => { S.hideInstall = true; save(); home(); };
}

function wireSounds(root) {
  $$('[data-seq]', root).forEach(b => b.onclick = () => playSeq(b.dataset.seq.split(',').map(Number)));
  $$('[data-chords]', root).forEach(b => b.onclick = () => playChords(JSON.parse(b.dataset.chords), +(b.dataset.beat || 1.25)));
}
const soundBtn = s => s.chords
  ? `<button class="snd" data-chords='${JSON.stringify(s.chords)}' ${s.beat ? `data-beat="${s.beat}"` : ''}>▶ ${s.label}</button>`
  : `<button class="snd" data-seq="${s.seq.join(',')}">▶ ${s.label}</button>`;

function lesson(id) {
  const L = LESSONS.find(l => l.id === id); if (!L) return go('#/');
  let i = 0;
  const draw = () => {
    const c = L.cards[i], last = i === L.cards.length - 1;
    if (last) { S.lessons[id] = true; save(); }
    app.innerHTML = `
    <header class="bar"><a href="#/" class="back">✕</a><div class="progress"><i style="width:${(i + 1) / L.cards.length * 100}%"></i></div><span>${i + 1}/${L.cards.length}</span></header>
    <main class="card">
      <p class="qtitle">${L.stage}단계 · ${L.title}</p>
      <h2>${c.h}</h2>
      <div class="body">${c.b}</div>
      ${c.board ? `<div class="boardwrap">${board(c.board)}</div>${c.cap ? `<p class="cap">${c.cap}</p>` : ''}` : ''}
      ${c.sounds ? `<div class="sounds">${c.sounds.map(soundBtn).join('')}</div>` : ''}
      ${last ? `<div class="after"><p>이제 퀴즈로 익혀요:</p>${L.quizzes.map(q => `<a class="row" href="#/quiz/${q}">${QUIZ[q].ear ? '🎧' : '✏️'} ${QUIZ[q].title}</a>`).join('')}</div>` : ''}
    </main>
    <nav class="pager"><button id="prev" ${i === 0 ? 'disabled' : ''}>← 이전</button><button id="nextc" class="primary">${last ? '홈으로' : '다음 →'}</button></nav>`;
    wireSounds(app);
    $('#prev').onclick = () => { if (i > 0) { i--; draw(); } };
    $('#nextc').onclick = () => { if (last) go('#/'); else { i++; draw(); } };
  };
  draw();
  swipe(() => { if (i < L.cards.length - 1) { i++; draw(); } }, () => { if (i > 0) { i--; draw(); } });
}

function swipe(onLeft, onRight) {
  let x0 = null, y0 = null;
  app.ontouchstart = e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; };
  app.ontouchend = e => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? onLeft : onRight)();
    x0 = null;
  };
}

function availableForDaily() {
  const ids = Object.keys(QUIZ).filter(id => {
    if (QUIZ[id].ear && !S.settings.sound) return false;
    const L = LESSONS.find(l => l.quizzes.includes(id));
    return S.lessons[L.id] || QUIZ[id].items().some(k => S.items[k]);
  });
  return ids.length ? ids : ['f2n5'];
}

function runQuiz(ids, title) {
  audio(); // 사용자 탭 직후에 오디오 켜기 (모바일 정책)
  const N = 10;
  let qn = 0, score = 0, prevKey = null, q, answered, timer;
  const wrongs = [];
  const next = () => {
    clearTimeout(timer);
    if (qn >= N) return result();
    const id = pick(ids), Q = QUIZ[id];
    const key = pickWeighted(Q.items(), prevKey); prevKey = key;
    q = Q.make(key); q.key = key; q.qid = id; answered = false;
    render();
  };
  const render = () => {
    const many = q.choices && q.choices.length > 7;
    const wide = q.choices && q.choices.some(c => c.label.replace(/<[^>]+>/g, '').length > 11);
    app.innerHTML = `
    <header class="bar"><a href="#/" class="back">✕</a><div class="progress"><i style="width:${qn / N * 100}%"></i></div><span>${qn + 1}/${N}</span></header>
    <main class="quiz">
      <p class="qtitle">${title || QUIZ[q.qid].title}</p>
      <h2 class="prompt">${q.prompt}</h2>
      ${q.listen ? `<button class="listen">🔊 다시 듣기</button>` : ''}
      ${q.listen && !S.settings.sound ? `<p class="warn">설정에서 소리를 켜주세요.</p>` : ''}
      <div class="boardwrap">${q.board ? board(q.board) : ''}</div>
      <div class="feedback"></div>
      <div class="choices ${many ? 'grid12' : wide ? 'wide' : ''}">${(q.choices || []).map((c, i) => `<button class="choice" data-i="${i}">${c.label}</button>`).join('')}</div>
      <button class="next hidden primary">다음 →</button>
    </main>`;
    $$('.choice').forEach(b => b.onclick = () => answer(q.choices[+b.dataset.i].v, b));
    $$('.fb-hit').forEach(r => r.onclick = () => answer({ s: +r.dataset.s, f: +r.dataset.f }));
    const l = $('.listen'); if (l) l.onclick = q.play;
    $('.next').onclick = () => { qn++; next(); };
    if (q.autoplay) setTimeout(q.play, 150);
  };
  const answer = (v, btn) => {
    if (answered) return;
    if (q.tap && q.tapString != null && v.s !== q.tapString) return;
    answered = true;
    const ok = q.correct(v);
    grade(q.key, ok);
    if (ok) score++; else wrongs.push(q);
    $$('.choice').forEach(b => {
      const c = q.choices[+b.dataset.i];
      if (q.correct(c.v)) b.classList.add('right'); else if (b === btn) b.classList.add('wrong');
      b.disabled = true;
    });
    let after = q.after;
    if (after && q.tap && !ok) after = { ...after, marks: [...after.marks, { s: v.s, f: v.f, t: '✕', c: 'bad' }] };
    $('.boardwrap').innerHTML = after ? board(after) : '';
    $('.feedback').innerHTML = `<p class="${ok ? 'ok' : 'no'}"><b>${ok ? '정답!' : '아쉬워요'}</b> ${q.explain}</p>`;
    if (!q.listen) q.play(); else if (!ok) setTimeout(q.play, 300);
    const nb = $('.next'); nb.classList.remove('hidden');
    if (ok) timer = setTimeout(() => { if (document.body.contains(nb)) { qn++; next(); } }, 1600);
    else navigator.vibrate?.(60);
  };
  const result = () => {
    touchStreak();
    const msg = score === N ? '완벽해요! 🎉' : score >= 7 ? '좋아요! 👍' : score >= 4 ? '익숙해지는 중' : '처음엔 다 이래요';
    app.innerHTML = `
    <main class="result">
      <p class="qtitle">${title || QUIZ[ids[0]].title}</p>
      <div class="score">${score}<span>/${N}</span></div>
      <p class="msg">${msg}</p>
      ${wrongs.length ? `<div class="wrongs"><h3>틀린 문제 (다음에 더 자주 나와요)</h3>${wrongs.map(w => `<p>• ${w.explain}</p>`).join('')}</div>` : ''}
      <nav class="pager"><a class="btn" href="#/">홈</a><button class="primary" id="again">한 번 더</button></nav>
    </main>`;
    $('#again').onclick = () => runQuiz(ids, title);
  };
  next();
}

function reference() {
  let mode = 'nat';
  const draw = () => {
    const marks = [];
    for (let s = 0; s < 4; s++) for (let f = 0; f <= 12; f++) {
      const pc = pcAt(s, f);
      if (mode === 'all' || NATURAL(pc)) marks.push({ s, f, t: SHARP[pc], c: NATURAL(pc) ? (f === 0 || f === 12 ? 'root' : 'ok') : 'soft' });
    }
    app.innerHTML = `
    <header class="bar"><a href="#/" class="back">←</a><b>지판 · 음정 표</b><span></span></header>
    <main class="card">
      <div class="seg"><button data-m="nat" class="${mode === 'nat' ? 'on' : ''}">자연음만</button><button data-m="all" class="${mode === 'all' ? 'on' : ''}">12음 전부</button></div>
      <div class="boardwrap">${board({ marks, tap: true })}</div>
      <p class="cap">음을 누르면 소리가 나요</p>
      <h3>음정 표 (C 기준)</h3>
      <table class="tbl"><tr><th>이름</th><th>반음</th><th>모양</th><th></th></tr>
      ${ALLIV.map(n => `<tr><td>${ivLabel(n)}</td><td>${n}</td><td>${shapeText(ivShape(n))}</td><td><button class="mini" data-seq="36,${36 + n}">▶</button></td></tr>`).join('')}</table>
    </main>`;
    $$('.seg button').forEach(b => b.onclick = () => { mode = b.dataset.m; draw(); });
    $$('.fb-hit').forEach(r => r.onclick = () => pluck(midiAt(+r.dataset.s, +r.dataset.f)));
    wireSounds(app);
  };
  draw();
}

function settings() {
  const draw = () => {
    app.innerHTML = `
    <header class="bar"><a href="#/" class="back">←</a><b>설정</b><span></span></header>
    <main class="card">
      <label class="tog"><span>소리 켜기</span><input type="checkbox" id="snd" ${S.settings.sound ? 'checked' : ''}></label>
      <label class="tog"><span>한 옥타브 위로 재생<small>폰 스피커·작은 이어폰에서 더 잘 들려요</small></span><input type="checkbox" id="oct" ${S.settings.octUp ? 'checked' : ''}></label>
      <button class="snd" id="test">▶ 소리 테스트 (E A D G)</button>
      <p class="note">iPhone은 무음 스위치가 켜져 있으면 소리가 안 날 수 있어요.</p>
      <hr>
      <button class="danger" id="reset">진도 초기화</button>
      <p class="note">진도는 이 폰의 브라우저 안에만 저장돼요.</p>
    </main>`;
    $('#snd').onchange = e => { S.settings.sound = e.target.checked; save(); };
    $('#oct').onchange = e => { S.settings.octUp = e.target.checked; save(); };
    $('#test').onclick = () => playSeq([28, 33, 38, 43]);
    $('#reset').onclick = () => { if (confirm('진도를 모두 지울까요?')) { S.items = {}; S.lessons = {}; S.streak = { last: null, count: 0 }; save(); draw(); } };
  };
  draw();
}

/* ───────── 라우터 ───────── */
function go(h) { location.hash = h; }
function route() {
  app.ontouchstart = app.ontouchend = null;
  window.scrollTo(0, 0);
  const [, page, arg] = (location.hash || '#/').split('/');
  if (page === 'lesson') lesson(arg);
  else if (page === 'quiz' && QUIZ[arg]) runQuiz([arg]);
  else if (page === 'daily') runQuiz(availableForDaily(), '오늘의 5분');
  else if (page === 'ref') reference();
  else if (page === 'settings') settings();
  else home();
}
window.addEventListener('hashchange', route);
route();
