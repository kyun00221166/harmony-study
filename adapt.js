'use strict';
/* 난이도 조절 · 시작 진단 · 내 기록. 전부 폰 안에서 계산하고 어디로도 보내지 않는다. */

S.qs = S.qs || {};      // 퀴즈별 최근 20개 결과: 'f' 빠른 정답, 's' 느린 정답, 'w' 오답
S.log = S.log || [];    // 최근 답 600개: [시각, 문제 키, 결과, ms, 퀴즈]
S.start = S.start || 0; // 진단으로 정한 시작 단계 (0 = 아직 안 함)

const allQuiz = () => LESSONS.flatMap(l => l.quizzes);
const lessonOf = id => LESSONS.find(l => l.quizzes.includes(id));
const stageOf = id => lessonOf(id).stage;

// 즉흥에서 쓸 수 있을 만큼 빠른가(ms). 귀 훈련은 소리가 끝나는 시간을 더했다
const LIMIT = {
  f2n5: 5, f2n12: 6, n2f: 6, steps: 5, ivB: 6, ivA: 7, earB: 7, earA: 8, deg: 6, degTap: 8, keysig: 6, rel: 7, minType: 12, degEarA: 9, degEarB: 10,
  ctone: 7, cqual: 8, earT: 9, earQ: 10, cext: 9, tension: 8, dia: 8, rn: 7, func: 8, findKey: 12, subst: 12, avoid: 15,
  iivi: 12, next: 12, blues: 7, earProg: 12, cls: 12, tritone: 8, keychg: 10, pentaTap: 7, pentaNot: 10, pentaOver: 9, degEarP: 10, gt: 8, gtNext: 10, gtTap: 8, earCT: 9,
};
const limitOf = id => (LIMIT[id] || 10) * 1000 * (S.settings.pace || 1);
// 이 퀴즈가 안 되면 먼저 봐야 할 퀴즈
const PRE = {
  n2f: ['f2n5'], f2n12: ['f2n5'], ivA: ['ivB'], earA: ['earB'], deg: ['steps'], degTap: ['ivB', 'deg'], keysig: ['deg'], rel: ['deg'], minType: ['deg'], degEarB: ['degEarA'],
  ctone: ['deg'], cqual: ['ivB'], earQ: ['earT'], cext: ['ctone'], tension: ['ctone'], dia: ['ctone', 'deg'], rn: ['dia'], func: ['rn'], findKey: ['dia'], subst: ['func'], avoid: ['tension'],
  iivi: ['dia'], next: ['iivi'], blues: ['dia'], earProg: ['earT'], cls: ['iivi', 'rn'], tritone: ['ctone'], keychg: ['iivi'],
  pentaTap: ['ivB'], pentaNot: ['deg'], pentaOver: ['ctone'], degEarP: ['degEarA'], gt: ['ctone'], gtNext: ['gt'], gtTap: ['cqual', 'gt'], earCT: ['earQ', 'degEarA'],
};
const preOf = id => PRE[id] || [];
const audible = id => S.settings.sound || !QUIZ[id].ear;

function logAnswer(id, key, res, ms, now) {
  const a = S.qs[id] || (S.qs[id] = []); a.push(res[0]); if (a.length > 20) a.shift();
  S.log.push([now, key, res[0], ms, id]); if (S.log.length > 600) S.log.splice(0, S.log.length - 600);
}

/* ───────── 실력 판단 ───────── */
function stat(id) {
  const n = (S.qs[id] || []).length, l = n ? QUIZ[id].items().map(k => S.items[k]).filter(r => r && r.p != null) : [];
  const avg = f => l.length ? l.reduce((s, r) => s + r[f], 0) / l.length : 0;
  return { n, acc: avg('p'), fast: avg('f') };
}
// new: 자료 부족, weak: 정답률 낮음, slow: 맞히지만 느림, mid: 연습 중, good: 빠르고 정확
function status(id) {
  const s = stat(id);
  if (s.n < 8) return 'new';
  if (s.acc < 0.6) return 'weak';
  if (s.acc >= 0.8 && s.fast < 0.5) return 'slow';
  return s.acc >= 0.85 && s.fast >= 0.6 ? 'good' : 'mid';
}
// 다음으로 넘어가도 되는가: 최근 정답률 75% 이상이고 절반은 빠르게. 자료가 적으면 진단 결과를 따른다.
// 진단에는 소리 문제가 없으니 귀 훈련은 실제로 푼 기록이 있어야 통과
function passed(id) {
  const s = stat(id);
  // 느려도 아주 정확하면 넘어간다 (속도는 '느림' 표시로 따로 연습). 한곳에 갇히지 않게
  if (s.n >= 8) return s.acc >= 0.75 && (s.fast >= 0.5 || (s.n >= 15 && s.acc >= 0.88));
  return !QUIZ[id].ear && stageOf(id) < S.start;
}
function stageShare(stage) {
  const q = LESSONS.find(l => l.stage === stage).quizzes.filter(audible);
  return q.filter(passed).length / q.length;
}
const maxStage = () => Math.max(...LESSONS.map(l => l.stage));
const isBase = new Set(Object.values(PRE).flat());
function curStage() {
  // 시작 단계보다 아래라도 바탕이 되는 퀴즈가 무너졌으면 거기로 내려간다
  for (let s = 1; s < S.start; s++) if (LESSONS.find(l => l.stage === s).quizzes.some(id => isBase.has(id) && !QUIZ[id].ear && status(id) === 'weak')) return s;
  for (let s = Math.max(1, S.start); s <= maxStage(); s++) if (stageShare(s) < 0.7) return s;
  return maxStage();
}
// 새로 배울 차례인 퀴즈: 앞 퀴즈를 통과했고 카드를 읽은 단계
function frontier() {
  const cur = curStage();
  const ok = allQuiz().filter(id => audible(id) && !passed(id) && stageOf(id) <= cur && preOf(id).every(p => passed(p) || !audible(p)));
  const read = ok.filter(id => S.lessons[lessonOf(id).id] || stageOf(id) < S.start);
  return read.length ? read : ok.filter(id => stageOf(id) === cur);
}
const seen = id => (S.qs[id] || []).length > 0 || QUIZ[id].items().some(k => S.items[k]);
const dueCount = id => QUIZ[id].items().filter(k => S.items[k] && isDue(S.items[k])).length;
function weakness(id) {
  const s = stat(id); if (s.n < 3) return 0.25;
  return 0.05 + (1 - s.acc) * 1.4 + (s.acc - s.fast) * 0.5;
}
const pickBy = (list, w) => { let x = Math.random() * list.reduce((a, i) => a + w(i), 0); for (const i of list) { x -= w(i); if (x <= 0) return i; } return list[list.length - 1]; };

// 새로 배울 것 중 하나: 귀 훈련은 세 번에 한 번꼴, 나머지는 앞 단계부터
function pickFrontier(fr) {
  const ear = fr.filter(i => QUIZ[i].ear), eye = fr.filter(i => !QUIZ[i].ear), l = !eye.length || (ear.length && Math.random() < 0.35) ? ear : eye;
  return pickBy(l, i => 1 / (1 + l.indexOf(i)));
}

/* ───────── 오늘의 5분: 문제 고르기 ───────── */
function pickDaily({ hist, prevKey }) {
  const ids = allQuiz().filter(audible), last = hist.slice(-3), prev = hist[hist.length - 1];
  const cold = last.length === 3 && last.every(h => h.res === 'wrong');
  const hot = hist.length >= 4 && hist.slice(-4).every(h => h.res === 'fast');
  // 같은 퀴즈 3연속, 귀 훈련 3연속은 피한다
  const last2 = hist.slice(-2), fresh = id => !(last2.length === 2 && (last2.every(h => h.id === id) || (QUIZ[id].ear && last2.every(h => QUIZ[h.id].ear))));
  const started = ids.filter(id => seen(id) && fresh(id)), fr = frontier().filter(fresh);
  const due = started.filter(id => dueCount(id) > 0);
  const roll = Math.random();
  let id, why;
  if (cold && prev) { // 연달아 막히면 바탕이 되는 문제로
    const base = preOf(prev.id).filter(p => audible(p));
    const sure = started.filter(i => stat(i).n >= 5 && stat(i).acc >= 0.75);
    if (base.length) { id = pick(base); why = '기초 다시'; } else if (sure.length) { id = pick(sure); why = '몸풀기'; }
  }
  if (!id && hot && fr.length) { id = pickFrontier(fr); why = '한 단계 위'; }
  if (!id && roll < 0.45 && started.length) {
    id = pickBy(started, weakness); why = '약점';
    const s = stat(id), base = preOf(id).filter(p => audible(p) && !passed(p));
    if (s.n >= 8 && s.acc < 0.6 && base.length && Math.random() < 0.5) { id = pick(base); why = '기초 다시'; }
    else if (s.n >= 8 && s.acc >= 0.8 && s.fast < 0.6) why = '속도 올리기';
    else if (s.n < 8 || s.acc >= 0.8) why = '복습';
  }
  if (!id && roll < 0.8 && fr.length) { id = pickFrontier(fr); why = seen(id) ? '지금 단계' : '새 문제'; }
  if (!id && due.length) { id = pickBy(due, dueCount); why = '잊을 때쯤 복습'; }
  if (!id) { id = pick(fr.length ? fr : started.length ? started : ['f2n5']); why = '지금 단계'; }
  return { id, why, key: pickWeighted(QUIZ[id].items(), prevKey) };
}
function daily() {
  if (!S.start && S.log.length < 10) return go('#/diag');
  const before = Object.fromEntries(allQuiz().map(id => [id, status(id)])), stage0 = curStage();
  runQuiz([], '오늘의 5분', {
    pick: pickDaily,
    finish: ({ score, n, hist, wrongs }) => {
      const rank = { new: 0, weak: 1, mid: 2, slow: 3, good: 4 };
      const ch = allQuiz().filter(id => status(id) !== before[id] && before[id] !== 'new');
      const stage1 = curStage();
      app.innerHTML = `<main class="result"><p class="qtitle">오늘의 5분</p><div class="score">${score}<span>/${n}</span></div>${speedLine(hist)}
        ${stage1 > stage0 ? `<p class="msg">🎉 ${stage1}단계로 올라갔어요</p>` : ''}
        ${ch.length ? `<div class="wrongs"><h3>달라진 점</h3>${ch.map(id => `<p>${rank[status(id)] > rank[before[id]] ? '▲' : '▼'} ${QUIZ[id].title}: ${LAB[before[id]]} → <b>${LAB[status(id)]}</b></p>`).join('')}</div>` : ''}
        ${wrongs.length ? `<div class="wrongs" style="margin-top:10px"><h3>틀린 문제</h3>${wrongs.map(w => `<p>• ${w.explain}</p>`).join('')}</div>` : ''}
        <div style="text-align:left;margin-top:14px">${recHtml()}</div>
        <nav class="pager"><a class="btn" href="#/">홈</a><button class="primary" id="again">한 번 더</button></nav></main>`;
      $('#again').onclick = daily;
    },
  });
}
function speedLine(hist) {
  const t = hist.map(h => h.ms).filter(x => x != null); if (!t.length) return '';
  const slow = hist.filter(h => h.res === 'slow').length;
  return `<p class="note">평균 ${(t.reduce((a, b) => a + b, 0) / t.length / 1000).toFixed(1)}초${slow ? ` · 느린 정답 ${slow}개` : ''}</p>`;
}

/* ───────── 시작 진단: 단계마다 3문제, 통과하면 위로 ───────── */
const DIAG = { 1: ['f2n12', 'n2f', 'steps'], 2: ['ivA'], 3: ['deg', 'keysig', 'rel'], 4: ['ctone', 'cqual', 'ctone'], 5: ['dia', 'rn', 'findKey'], 6: ['iivi', 'cls', 'iivi'], 7: ['pentaOver', 'pentaNot', 'pentaOver'], 8: ['gt', 'gtNext', 'gtTap'] };
const diagScore = list => list.reduce((a, h) => a + (h.res === 'fast' ? 1 : h.res === 'slow' ? 0.5 : 0), 0);
// 지금까지의 답으로 다음에 볼 단계를 정한다. done이면 stage가 시작 단계
function diagNext(hist) {
  let stage = 2, tested = {};
  for (let i = 0; i + 3 <= hist.length; i += 3) {
    const pass = diagScore(hist.slice(i, i + 3)) >= 2; tested[stage] = pass;
    const nx = pass ? stage + 1 : stage - 1;
    if (!pass && (stage === 1 || tested[stage - 1] !== undefined)) return { done: true, stage };
    if (pass && tested[stage + 1] === false) return { done: true, stage: stage + 1 };
    if (nx > maxStage()) return { done: true, stage: maxStage() };
    if (i + 3 >= 18) return { done: true, stage: pass ? nx : stage };
    stage = nx;
  }
  return { done: false, stage };
}
function diagnose() {
  app.innerHTML = `<header class="bar"><a href="#/" class="back">✕</a><b>시작 진단</b><span></span></header>
  <main class="card"><h2>어디서 시작할지 정해요</h2><div class="body"><p>단계마다 3문제. 통과하면 위로 올라가고, 막히면 거기가 시작점이에요. 6~18문제예요.</p><p><b>모르면 찍지 말고 아무거나 눌러도 돼요.</b> 빨리 맞힌 것과 느리게 맞힌 것을 구별해요. 소리 문제는 없어요.</p><p class="note">지금 시작 단계: ${S.start ? `${S.start}단계` : '아직 없음'}. 결과는 나중에 바꿀 수 있어요.</p></div><button class="primary" id="go" style="width:100%">시작</button></main>`;
  $('#go').onclick = () => runQuiz([], '시작 진단', {
    N: 18,
    pick: ({ hist, prevKey }) => {
      const d = diagNext(hist); if (d.done) return null;
      const id = DIAG[d.stage][hist.length % 3 % DIAG[d.stage].length], used = hist.map(h => h.key);
      const left = QUIZ[id].items().filter(k => !used.includes(k));
      return { id, why: `${d.stage}단계`, key: pick(left.length ? left : QUIZ[id].items()) };
    },
    finish: ({ hist }) => {
      const d = diagNext(hist); S.start = d.stage; save();
      const L = LESSONS.find(l => l.stage === S.start);
      app.innerHTML = `<main class="result"><p class="qtitle">시작 진단 결과</p><div class="score">${S.start}<span>단계부터</span></div><p class="msg">${L.title}</p>${speedLine(hist)}
        <div style="text-align:left">${recHtml()}</div>
        <p class="note">문제 수가 적어서 대략의 위치예요. 앞으로 푸는 결과에 따라 계속 조정돼요. 안 맞으면 "내 기록"에서 바꾸세요.</p>
        <nav class="pager"><a class="btn" href="#/">홈</a><a class="btn primary" href="#/lesson/${L.id}">카드 보기</a></nav></main>`;
    },
  });
}

/* ───────── 추천 · 홈 표시 ───────── */
const LAB = { new: '자료 부족', weak: '약함', slow: '느림', mid: '연습 중', good: '익힘' };
const chip = id => { const s = status(id); return s === 'new' ? '' : `<span class="chip ${s}">${LAB[s]}</span>`; };
function stageBadge(L) {
  const q = L.quizzes.filter(audible), p = q.filter(passed).length, w = L.quizzes.filter(id => status(id) === 'weak').length;
  return ` <span class="badge">${p}/${q.length} 통과${w ? ` · 약함 ${w}` : ''}</span>`;
}
function recommend() {
  const L = LESSONS.find(l => l.stage === curStage());
  const main = recMain(), card = { t: `${L.stage}단계 카드 읽기: ${L.title}`, d: S.lessons[L.id] ? '새로 추가된 카드가 있어요' : '지금 단계의 개념부터', h: `#/lesson/${L.id}` };
  return S.start && S.lessons[L.id] !== L.cards.length ? [main, card] : [main];
}
function recMain() {
  if (!S.start) return { t: '시작 진단 하기', d: '6~18문제로 시작 단계를 정해요', h: '#/diag' };
  const weak = allQuiz().filter(id => audible(id) && status(id) === 'weak').sort((a, b) => stat(a).acc - stat(b).acc)[0];
  if (weak) {
    const base = preOf(weak).find(p => audible(p) && !passed(p));
    const pc = Math.round(stat(weak).acc * 100);
    return base ? { t: `먼저 "${QUIZ[base].title}"`, d: `"${QUIZ[weak].title}"이(가) ${pc}%예요. 바탕이 되는 이 문제부터 다지는 게 빨라요.`, h: `#/quiz/${base}` }
      : { t: `약점 연습: ${QUIZ[weak].title}`, d: `최근 정답률 ${pc}%. ${stageOf(weak)}단계 카드를 다시 보고 풀면 좋아요.`, h: `#/quiz/${weak}` };
  }
  const slow = allQuiz().find(id => audible(id) && status(id) === 'slow');
  if (slow) return { t: `속도 올리기: ${QUIZ[slow].title}`, d: '정확하지만 느려요. 즉흥에서 쓰려면 바로 나와야 해요.', h: `#/quiz/${slow}` };
  const f = frontier()[0];
  return f ? { t: `다음 퀴즈: ${QUIZ[f].title}`, d: `${stageOf(f)}단계`, h: `#/quiz/${f}` } : { t: '전부 통과했어요', d: '오늘의 5분으로 유지하고 반주에서 솔로를 쳐 보세요', h: '#/daily' };
}
const recHtml = () => recommend().map((r, i) => `<a class="rec" href="${r.h}"><b>${i ? '📖' : '👉'} ${r.t}</b><span>${r.d}</span></a>`).join('');
function homeTop() {
  const due = allQuiz().filter(audible).reduce((a, id) => a + dueCount(id), 0);
  const cta = !S.start && S.log.length < 10
    ? `<a class="cta" href="#/diag">시작 진단<span>6~18문제로 시작 단계 정하기</span></a>`
    : `<a class="cta" href="#/daily">오늘의 5분<span>${curStage()}단계 중심 · 복습할 문제 ${due}개 · 실력에 맞춰 10문제</span></a>`;
  return cta + (S.start || S.log.length >= 10 ? recHtml() : '');
}

/* ───────── 내 기록 ───────── */
const strip = h => h.replace(/<small>.*?<\/small>/g, '').replace(/<[^>]+>/g, ' ').replace(/🎧/g, '').replace(/\s+/g, ' ').trim();
// 문제 키를 사람이 읽을 말로. 매번 루트가 바뀌는 문제는 유형으로 적는다
function itemLabel(key, id) {
  const p = key.split(':'), c = q => (CHX[q].sym || '메이저');
  switch (p[0]) {
    case 'dt': return `메이저 ${p[1]}음 짚기`;
    case 'ivB': case 'ivA': return `${IV[p[1]][0]} 모양`;
    case 'earB': case 'earA': return `${IV[p[1]][0]} 듣기`;
    case 'e3a': case 'e3b': return `메이저 키에서 ${DEG[p[1]]}음 듣기`;
    case 'e3p': return `블루스에서 ${DEG[p[1]]}음 듣기`;
    case 'ct': return `${c(p[1])} 코드의 ${CH[p[1]].t[p[2]][2]}음`;
    case 'cq': return `${c(p[1])} 아르페지오 모양`;
    case 'et': return p[1] === 'maj' ? '메이저 코드 듣기' : '마이너 코드 듣기';
    case 'eq': return `${c(p[1])} 코드 듣기`;
    case 'cx': return `${c(p[1])} 코드 구성`;
    case 'tn': return `${c(p[1])} 코드의 ${p[2]}음`;
    case 'fk': return '진행 보고 키 찾기';
    case 'nx': return { iiV: 'ⅱ–Ⅴ 다음 코드', V: 'Ⅴ7 다음 코드', miiV: '마이너 ⅱ–Ⅴ 다음 코드', sec: '세컨더리 도미넌트 다음', cyc: '5도권 순환 다음' }[p[1]];
    case 'bl': return `블루스 ${p[1]}번째 마디`;
    case 'ep': return `${PROGS[p[1]].rn} 듣기`;
    case 'kc': return '전조 도착 키';
    case 'pt': return `펜타토닉 ${DEG[p[1]]}음 짚기`;
    case 'po': return `블루스 ${{ 0: 'Ⅰ7', 5: 'Ⅳ7', 7: 'Ⅴ7' }[p[2]]} 위의 ${DEG[p[1]]}`;
    case 'gn': return `${gtPairs[p[1]][0]} 가이드톤 잇기 (${+p[2] === 1 ? '3음' : '7음'}에서)`;
    case 'gp': return `${c(p[1])} 가이드톤 ${CH[p[1]].t[p[2]][2]} 짚기`;
    case 'ec': return `${c(p[1])} 위의 ${CH[p[1]].t[p[2]][2]}음 듣기`;
    default: return strip(QUIZ[id].make(key).prompt);
  }
}
// 여러 퀴즈를 가로지르는 개념 꼬리표
function tagsOf(key) {
  const p = key.split(':'), sym = q => `${CH[q].sym} 코드`, lab = (q, j) => `${CH[q].t[j][2]}음(코드톤)`;
  switch (p[0]) {
    case 'f2n': return [`${STR[p[1]].n}현`, +p[2] <= 5 ? '0–5프렛' : '6–12프렛'];
    case 'n2f': return [`${STR[p[1]].n}현`];
    case 'ivB': case 'ivA': return [`${IV[p[1]][0]}(모양)`];
    case 'earB': case 'earA': return [`${IV[p[1]][0]}(듣기)`];
    case 'dg': return [`메이저 ${p[2]}음`, `${KEYS[p[1]][0]} 키`];
    case 'dt': return [`메이저 ${p[1]}음`];
    case 'ks': case 'rl': return [`${KEYS[p[1]][0]} 키`];
    case 'e3a': case 'e3b': case 'e3p': return [`${DEG[p[1]]}음(키 위에서 듣기)`];
    case 'ct': case 'gp': return [sym(p[1]), lab(p[1], p[2])];
    case 'ec': return [sym(p[1]), `${lab(p[1], p[2])} 듣기`];
    case 'gt': case 'cq': case 'eq': return [sym(p[1])];
    case 'dia': case 'rn': return [`${p[1]} 키`, `${RNQ[p[2] - 1]}`];
    case 'iv': return [p[2] === 'M' ? '메이저 ⅱ–Ⅴ–Ⅰ' : '마이너 ⅱ–Ⅴ–ⅰ'];
    case 'cl': return [{ d: '다이아토닉 구별', s: '세컨더리 도미넌트', m: '모달 인터체인지', t: '트라이톤 대리' }[p[2][0]]];
    case 'gn': return [`${gtPairs[p[1]][0]} 가이드톤`];
    default: return [];
  }
}
const DAYS7 = 7 * 864e5;
function report() {
  const now = Date.now(), L = S.log, wk = L.filter(x => now - x[0] < DAYS7), okN = l => l.filter(x => x[2] !== 'w').length;
  const times = wk.map(x => x[3]).filter(x => x != null), tags = {}, items = {};
  L.slice(-300).forEach(x => {
    if (!QUIZ[x[4]]) return;
    tagsOf(x[1]).forEach(t => { (tags[t] = tags[t] || []).push(x[2]); });
    (items[x[1]] = items[x[1]] || { id: x[4], a: [] }).a.push(x[2]);
  });
  const acc = a => a.filter(r => r !== 'w').length / a.length;
  return {
    n: wk.length, acc: wk.length ? okN(wk) / wk.length : null, sec: times.length ? times.reduce((a, b) => a + b, 0) / times.length / 1000 : null,
    days: new Set(wk.map(x => dstr(new Date(x[0])))).size,
    tags: Object.entries(tags).filter(([, a]) => a.length >= 6 && acc(a) < 0.7).sort((a, b) => acc(a[1]) - acc(b[1])).slice(0, 6).map(([t, a]) => [t, Math.round(acc(a) * 100), a.length]),
    miss: Object.entries(items).filter(([, v]) => v.a.filter(r => r === 'w').length >= 2).sort((a, b) => b[1].a.filter(r => r === 'w').length - a[1].a.filter(r => r === 'w').length).slice(0, 6).map(([k, v]) => [itemLabel(k, v.id), v.a.filter(r => r === 'w').length, v.a.length]),
    quiz: allQuiz().filter(id => stat(id).n >= 5).map(id => ({ id, st: status(id), ...stat(id) })),
  };
}
function reportText() {
  const r = report(), pc = x => `${Math.round(x * 100)}%`, by = s => r.quiz.filter(q => q.st === s).map(q => `${QUIZ[q.id].title}(${pc(q.acc)}, 빠른 정답 ${pc(q.fast)}, ${q.n}문제)`).join(', ') || '없음';
  return [`[화성학 스터디 기록] ${dstr(new Date())}`,
    `- 지금 단계: ${curStage()}단계 (시작 ${S.start ? `${S.start}단계` : '미정'}), 카드 읽음: ${LESSONS.filter(l => S.lessons[l.id]).map(l => l.stage).join('·') || '없음'}`,
    `- 최근 7일: ${r.n}문제, ${r.days}일 공부, 정답률 ${r.acc == null ? '-' : pc(r.acc)}, 평균 ${r.sec == null ? '-' : r.sec.toFixed(1) + '초'}`,
    `- 약함: ${by('weak')}`, `- 느림: ${by('slow')}`, `- 연습 중: ${by('mid')}`, `- 익힘: ${by('good')}`,
    `- 약한 개념: ${r.tags.map(([t, a, n]) => `${t} ${a}%(${n}문제)`).join(', ') || '아직 뚜렷하지 않음'}`,
    `- 자주 틀린 문제: ${r.miss.map(([t, w, n]) => `${t} ${w}/${n}번 틀림`).join(', ') || '없음'}`,
    '', '이 기록을 보고 ① 가장 먼저 고칠 약점 1~2개와 이유, ② 출퇴근용(폰) 연습, ③ 집에서 베이스로 할 연습을 알려줘.'].join('\n');
}
async function copyText(txt, btn) {
  let ok = true;
  try { await navigator.clipboard.writeText(txt); } catch {
    const a = document.createElement('textarea'); a.value = txt; document.body.append(a); a.select(); ok = document.execCommand('copy'); a.remove();
  }
  const old = btn.textContent; btn.textContent = ok ? '✓ 복사됨' : '복사 실패: 아래 글을 길게 눌러 복사';
  setTimeout(() => { btn.textContent = old; }, 2000);
}

/* ───────── 백업 · 복원 ───────── */
const BK = KEY + '-before';
const keepBackup = () => localStorage.setItem(BK, JSON.stringify(S));
const backupText = () => JSON.stringify({ app: 'harmony-study', v: 1, at: Date.now(), data: S });
// 붙여넣은 값은 그대로 믿지 않고, 아는 모양의 숫자·문자만 골라 담는다
function cleanBackup(txt) {
  const j = JSON.parse(txt); if (j.app !== 'harmony-study' || !j.data || typeof j.data !== 'object') throw new Error('백업 형식이 아니에요');
  const d = j.data, num = (x, lo, hi) => { const n = Number(x); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo; };
  const keys = new Set(allQuiz().flatMap(id => QUIZ[id].items())), ids = new Set(allQuiz()), big = 1e15, out = { items: {}, lessons: {}, pos: {}, qs: {}, log: [] };
  for (const [k, v] of Object.entries(d.items || {})) if (keys.has(k) && v) { out.items[k] = { b: num(v.b, 0, 4), r: num(v.r, 0, 1e6), w: num(v.w, 0, 1e6) }; if (v.p != null) { out.items[k].p = num(v.p, 0, 1); out.items[k].f = num(v.f, 0, 1); } if (v.d) out.items[k].d = num(v.d, 0, big); if (v.t) out.items[k].t = num(v.t, 0, big); }
  for (const l of LESSONS) { if (d.lessons?.[l.id]) out.lessons[l.id] = d.lessons[l.id] === true ? true : num(d.lessons[l.id], 1, 999); if (d.pos?.[l.id]) out.pos[l.id] = num(d.pos[l.id], 0, 999); }
  for (const [k, v] of Object.entries(d.qs || {})) if (ids.has(k) && Array.isArray(v)) out.qs[k] = v.filter(x => ['f', 's', 'w'].includes(x)).slice(-20);
  if (Array.isArray(d.log)) out.log = d.log.filter(x => Array.isArray(x) && keys.has(x[1]) && ['f', 's', 'w'].includes(x[2]) && ids.has(x[4])).map(x => [num(x[0], 0, big), x[1], x[2], x[3] == null ? null : num(x[3], 0, 1e5), x[4]]).slice(-600);
  out.start = Math.round(num(d.start, 0, maxStage()));
  out.streak = { last: /^\d{4}-\d{1,2}-\d{1,2}$/.test(d.streak?.last) ? d.streak.last : null, count: num(d.streak?.count, 0, 1e5) };
  return out;
}

function me() {
  const r = report(), pc = x => x == null ? '–' : `${Math.round(x * 100)}%`;
  app.innerHTML = `<header class="bar"><a href="#/" class="back">←</a><b>내 기록</b><span></span></header>
  <main class="card">
    <p class="qtitle">최근 7일</p>
    <div class="kpi"><div><b>${r.n}</b>문제</div><div><b>${pc(r.acc)}</b>정답률</div><div><b>${r.sec == null ? '–' : r.sec.toFixed(1)}</b>평균 초</div></div>
    ${recHtml()}
    <h3>약한 개념</h3><div class="plain">${r.tags.length ? `<ul>${r.tags.map(([t, a, n]) => `<li><b>${t}</b> ${a}% <small>(${n}문제)</small></li>`).join('')}</ul>` : '<p>아직 뚜렷하지 않아요. 개념마다 6문제 이상 풀면 나와요.</p>'}</div>
    <h3>자주 틀린 문제</h3><div class="plain">${r.miss.length ? `<ul>${r.miss.map(([t, w, n]) => `<li>${t} <small>${n}번 중 ${w}번 틀림</small></li>`).join('')}</ul>` : '<p>없어요.</p>'}</div>
    <h3>퀴즈별 상태</h3><div class="plain">${r.quiz.length ? r.quiz.map(q => `<a class="row" href="#/quiz/${q.id}"><span>${QUIZ[q.id].title}</span><span class="chip ${q.st}">${LAB[q.st]}</span><span class="pct">${pc(q.acc)}</span></a>`).join('') : '<p>퀴즈를 5문제 이상 풀면 나와요.</p>'}</div>
    <hr><h3>Claude에게 보여주기</h3>
    <p class="note">복사해서 Claude 앱의 "베이스 화성학" 프로젝트에 붙여넣으세요.</p>
    <button class="primary" id="cp" style="width:100%">기록 복사</button>
    <p></p><textarea readonly id="rt"></textarea>
    <hr><h3>시작 단계</h3>
    <label class="tog"><span>내 시작 단계<small>이보다 낮은 단계는 아는 것으로 봐요</small></span><select id="st">${[0, ...LESSONS.map(l => l.stage)].map(s => `<option value="${s}" ${s === S.start ? 'selected' : ''}>${s ? `${s}단계` : '미정'}</option>`).join('')}</select></label>
    <label class="tog"><span>속도 기준<small>이보다 느린 정답은 "느림"으로 봐요</small></span><select id="pc">${[[1.6, '여유'], [1, '보통'], [0.75, '빠르게']].map(([v, n]) => `<option value="${v}" ${(S.settings.pace || 1) === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
    <a class="row" href="#/diag">🧭 시작 진단 다시 하기</a>
    <hr><h3>백업과 복원</h3>
    <p class="note">기록은 이 폰에만 있어요. 가끔 백업해 두면 폰을 바꾸거나 데이터가 지워져도 되돌릴 수 있어요.</p>
    <div class="btnrow"><button class="snd" id="bk">백업 복사</button><button class="snd" id="bf">파일로 저장</button></div>
    <textarea id="rs" placeholder="복원하려면 백업 내용을 여기에 붙여넣으세요"></textarea>
    <div class="btnrow"><button class="snd" id="rf">파일 고르기</button><button class="danger" id="rb">복원</button></div>
    <input type="file" id="fi" accept=".json,application/json" hidden>
    ${localStorage.getItem(BK) ? '<button class="snd" id="un">복원·초기화 전으로 되돌리기</button>' : ''}
  </main>`;
  $('#rt').value = reportText();
  $('#cp').onclick = e => copyText(reportText(), e.target);
  $('#bk').onclick = e => copyText(backupText(), e.target);
  $('#bf').onclick = () => { const u = URL.createObjectURL(new Blob([backupText()], { type: 'application/json' })), a = document.createElement('a'); a.href = u; a.download = `harmony-study-${dstr(new Date())}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(u), 5000); };
  $('#rf').onclick = () => $('#fi').click();
  $('#fi').onchange = async e => { if (e.target.files[0]) $('#rs').value = await e.target.files[0].text(); };
  $('#rb').onclick = () => {
    let d; try { d = cleanBackup($('#rs').value.trim()); } catch (x) { alert('복원할 수 없어요: 백업 내용을 처음부터 끝까지 붙여넣었는지 확인해 주세요.'); return; }
    if (!confirm(`지금 기록을 백업(${Object.keys(d.items).length}문제 기록)으로 바꿀까요?`)) return;
    keepBackup(); Object.assign(S, d); save(); me();
  };
  const un = $('#un'); if (un) un.onclick = () => { if (!confirm('복원이나 초기화를 하기 전 기록으로 되돌릴까요?')) return; const old = JSON.parse(localStorage.getItem(BK)); keepBackup(); Object.assign(S, { items: {}, lessons: {}, pos: {}, qs: {}, log: [], start: 0 }, old); save(); me(); };
  $('#pc').onchange = e => { S.settings.pace = +e.target.value; save(); };
  $('#st').onchange = e => { S.start = +e.target.value; save(); me(); };
}
// 브라우저가 저장 공간을 정리할 때 이 기록을 지우지 말아 달라고 요청 (거절될 수 있음)
navigator.storage?.persist?.().catch(() => {});
