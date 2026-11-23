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
function pluck(midi, when = 0, dur = 1.0) {
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
  g.gain.exponentialRampToValueAtTime(0.45, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.2, t + 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o1.connect(lp); o2.connect(sub); sub.connect(lp); lp.connect(g); g.connect(c.destination);
  o1.start(t); o2.start(t); o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
}
const playSeq = (ms, gap = 0.65) => ms.forEach((m, i) => pluck(m, i * gap));

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
];
const ROADMAP = [
  [3, '장음계와 조 (Key)'], [4, '코드 구성음 · 아르페지오'], [5, '다이아토닉 코드 · 로마숫자'],
  [6, '자주 쓰는 코드 진행'], [7, '베이스 라인 만들기'], [8, '모드 (도리안 · 믹솔리디안)'],
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
  </main>`;
  const t = $('#hideTip'); if (t) t.onclick = () => { S.hideInstall = true; save(); home(); };
}

function wireSounds(root) {
  $$('[data-seq]', root).forEach(b => b.onclick = () => playSeq(b.dataset.seq.split(',').map(Number)));
}

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
      ${c.sounds ? `<div class="sounds">${c.sounds.map(s => `<button class="snd" data-seq="${s.seq.join(',')}">▶ ${s.label}</button>`).join('')}</div>` : ''}
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
    const many = q.choices && q.choices.length > 6;
    app.innerHTML = `
    <header class="bar"><a href="#/" class="back">✕</a><div class="progress"><i style="width:${qn / N * 100}%"></i></div><span>${qn + 1}/${N}</span></header>
    <main class="quiz">
      <p class="qtitle">${title || QUIZ[q.qid].title}</p>
      <h2 class="prompt">${q.prompt}</h2>
      ${q.listen ? `<button class="listen">🔊 다시 듣기</button>` : ''}
      ${q.listen && !S.settings.sound ? `<p class="warn">설정에서 소리를 켜주세요.</p>` : ''}
      <div class="boardwrap">${q.board ? board(q.board) : ''}</div>
      <div class="feedback"></div>
      <div class="choices ${many ? 'grid12' : ''}">${(q.choices || []).map((c, i) => `<button class="choice" data-i="${i}">${c.label}</button>`).join('')}</div>
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
    if (q.tap && v.s !== q.tapString) return;
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
    if (q.tap && !ok) after = { ...after, marks: [...after.marks, { s: v.s, f: v.f, t: '✕', c: 'bad' }] };
    $('.boardwrap').innerHTML = board(after);
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
