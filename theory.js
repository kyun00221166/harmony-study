'use strict';
/* 이론 보강 카드(3~6단계), 7·8단계, 귀 훈련 E3.
   app.js 다음에 로드되고, LESSONS와 QUIZ에 내용을 더한다.
   TAB은 [줄, 프렛, 8분음표 개수]만 적고 음 이름·디그리는 app.js가 계산한다. */

/* ───────── 도우미 ───────── */
function addCards(id, afterH, cards) {
  const L = LESSONS.find(l => l.id === id), i = L.cards.findIndex(c => c.h.startsWith(afterH));
  if (i < 0) throw new Error(`카드 없음: ${id} ${afterH}`);
  L.cards.splice(i + 1, 0, ...cards.map(c => ({ add: true, ...c })));
}
const addQuiz = (id, qs) => { Object.assign(QUIZ, qs); LESSONS.find(l => l.id === id).quizzes.push(...Object.keys(qs)); };
const table = (head, rows) => `<table class="tbl"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
const miniSeq = seq => `<button class="mini" data-seq="${seq.join(',')}">▶</button>`;
const miniCh = list => `<button class="mini" data-chords='${JSON.stringify(list)}'>▶</button>`;
// 프렛 구간 안에 있는 스케일/코드 음을 전부 표시
function posMarks(root, semis, lo, hi, sLo = 0, lab = n => DEG[n]) {
  const out = [];
  for (let s = sLo; s < 4; s++) for (let f = lo; f <= hi; f++) {
    const n = degOf(pcAt(s, f), root);
    if (semis.includes(n)) out.push({ s, f, t: lab(n, pcAt(s, f)), c: n === 0 ? 'root' : 'ok' });
  }
  return out;
}
const byName = root => (n, pc) => nameOver(pc, root);
const TNAME = ['1', '♭9', '9', '♯9', '3', '11', '♯11', '5', '♭13', '13', '♭7', '7'];
const HARM = [0, 2, 3, 5, 7, 8, 11], MELO = [0, 2, 3, 5, 7, 9, 11];
const MPENTA = [0, 3, 5, 7, 10], JPENTA = [0, 2, 4, 7, 9], BLUE = [0, 3, 5, 6, 7, 10];
// 블루스에서는 ♭5까지 쓰므로 E♭ 대신 D♯으로 불러 겹내림표를 피한다
const bluesRoot = pc => { const n = rootName(pc, 'm7'); return n === 'E♭' ? 'D♯' : n; };
const clean = s => !/𝄪|𝄫/.test(s);
const chartHtml = (list, hl) => `<div class="chart">${list.map((c, i) => `<span class="${c === '?' ? 'q' : ''}" ${hl === i ? 'style="background:var(--panel2)"' : ''}>${c}</span>`).join('')}</div>`;

/* ═════════ 3단계 보강 ═════════ */
addCards('l3', '이 모양은 어디로든', [
  { h: '왜 하필 온온반온온온반일까', b: `<p>반음은 딱 두 군데, <b>3–4</b>와 <b>7–1</b> 사이에 있어요. 이 두 반음이 스케일에 <b>방향</b>을 만들어요.</p>
    <p><b>7 → 1</b>: 반음 아래에서 1을 잡아당겨요. 그래서 7을 <b>이끎음</b>이라 불러요.<br><b>4 → 3</b>: 반음 위에서 3으로 내려앉아요.</p>
    <p>모든 음이 온음으로만 되어 있으면 어디가 집인지 알 수 없어요. 반음 두 개가 "여기가 집"이라고 가리키는 거예요.</p>
    <p class="note">4와 7 사이 거리는 트라이톤(반음 6개). 5단계의 "긴장"이 여기서 나와요.</p>`,
    sounds: [{ label: '7에서 멈추기 (불안)', seq: [36, 38, 40, 41, 43, 45, 47] }, { label: '1까지 가기 (해결)', seq: [36, 38, 40, 41, 43, 45, 47, 48] }, { label: '온음만으로 (집이 없음)', seq: [36, 38, 40, 42, 44, 46, 48] }] },
]);
addCards('l3', '음 번호 = 디그리', [
  { h: '일곱 음의 성격', b: `<p>같은 음도 <b>키 안에서 몇 번이냐</b>에 따라 느낌이 달라요. 즉흥은 이 느낌을 알고 고르는 일이에요.</p>
    ${table(['음', '성격', '가고 싶은 곳', ''], [
      ['1', '집. 완전히 쉼', '그대로', miniSeq([36, 43, 36])],
      ['2', '떠 있음', '1 또는 3', miniSeq([36, 43, 38, 36])],
      ['3', '밝음을 정함. 안정', '그대로', miniSeq([36, 43, 40])],
      ['4', '살짝 눌린 느낌', '3 (반음)', miniSeq([36, 43, 41, 40])],
      ['5', '열려 있는 안정', '그대로 또는 1', miniSeq([36, 40, 43])],
      ['6', '부드럽고 따뜻함', '5', miniSeq([36, 43, 45, 43])],
      ['7', '강하게 당겨짐', '1 (반음)', miniSeq([36, 43, 47, 48])],
    ])}
    <p><b>안정음 1·3·5</b>에서 쉬고, <b>불안정음 2·4·6·7</b>로 움직임을 만들어요. 솔로 프레이즈의 끝음을 고를 때 바로 쓰는 기준이에요.</p>
    <p class="note">📱 이 느낌을 귀로 맞히는 게 아래 퀴즈 "키 위에서 몇 음?"(E3)이에요.</p>` },
]);
addCards('l3', '나란한조', [
  { h: '하모닉 마이너: 왜 7음을 올렸나', b: `<p>자연단음계는 7음이 <b>♭7</b>이라 1까지 온음이에요. 그래서 1로 당기는 힘이 약해요.</p>
    <p>그 힘을 얻으려고 <b>7음만 반음 올린 것</b>이 하모닉 마이너예요.</p><p class="big">1 2 ♭3 4 5 ♭6 <span style="color:var(--accent)">7</span></p>
    <p>대신 ♭6과 7 사이가 반음 3개로 벌어져요. 이 간격이 특유의 이국적인 소리를 만들어요.</p>`,
    board: { to: 9, marks: boxMarks(0, 5, [...HARM, 12], ['1', '2', '♭3', '4', '5', '♭6', '7', '1'], MIN_KS) },
    tabs: [{ t: 'A 하모닉 마이너 (E현 5프렛, 검지로 시작)', bpm: 90, key: 'A', allow: HARM, bars: [{ c: ['A', 'min'], n: [[0, 5, 1], [0, 7, 1], [0, 8, 1], [1, 5, 1], [1, 7, 1], [1, 8, 1], [2, 6, 1], [2, 7, 1]] }] }],
    b2: `<p><b>솔로에서</b>: 마이너 키의 <b>Ⅴ7</b> 위에서 써요. A 마이너 키의 E7에서 G♯을 치는 게 바로 이 음이에요.</p>` },
  { h: '멜로딕 마이너: 벌어진 간격 메우기', b: `<p>하모닉 마이너의 벌어진 간격이 노래하기 어색해서, <b>6음도 반음 올린</b> 것이 멜로딕 마이너예요.</p><p class="big">1 2 ♭3 4 5 <span style="color:var(--accent)">6 7</span></p>
    <p>메이저 스케일에서 <b>3음만 ♭</b>한 것과 같아요. 클래식에서는 내려올 때 자연단음계로 바꾸지만, 재즈에서는 올라갈 때와 내려올 때를 똑같이 써요.</p>`,
    board: { to: 9, marks: boxMarks(0, 5, [...MELO, 12], ['1', '2', '♭3', '4', '5', '6', '7', '1'], [0, 0, 0, 1, 1, 2, 2, 2]) },
    tabs: [{ t: 'A 멜로딕 마이너 (D현에서 검지를 4프렛으로 한 칸 당김)', bpm: 90, key: 'A', allow: MELO, bars: [{ c: ['A', 'min'], n: [[0, 5, 1], [0, 7, 1], [0, 8, 1], [1, 5, 1], [1, 7, 1], [2, 4, 1], [2, 6, 1], [2, 7, 1]] }] }] },
  { h: '세 마이너 비교', b: `${table(['', '6음', '7음', '주로 쓰는 곳', ''], [
      ['자연', '♭6', '♭7', 'ⅰm7, 마이너 곡 전반', miniSeq([...MIN, 12].map(x => 33 + x))],
      ['하모닉', '♭6', '7', '마이너 키의 Ⅴ7', miniSeq([...HARM, 12].map(x => 33 + x))],
      ['멜로딕', '6', '7', 'ⅰm6, ⅰm(maj7)', miniSeq([...MELO, 12].map(x => 33 + x))],
    ])}<p><b>1 2 ♭3 4 5는 셋 다 똑같아요.</b> 다른 건 6과 7뿐. 그래서 마이너 솔로는 앞의 다섯 음을 뼈대로 두고, 코드에 맞춰 6과 7만 바꾸면 돼요.</p>` },
  { h: '포지션 연결: 지판을 넓게 쓰기', b: `<p>한 포지션은 <b>한 옥타브 조금 넘는 창문</b>이에요. 같은 스케일이 지판 전체에 퍼져 있고, 포지션은 그중 손이 닿는 부분일 뿐이에요.</p><p>넘어가는 요령은 <b>한 줄에서 두 음을 미끄러지듯 이어 치면서</b> 손을 옮기는 거예요.</p>`,
    boards: [{ marks: posMarks('C', MAJ, 0, 12), cap: 'C 메이저의 음이 있는 자리 전부' }],
    tabs: [{ t: 'G현에서 위쪽 포지션으로 넘어가기 (5 → 7프렛에서 손 이동)', bpm: 90, key: 'C', allow: MAJ, wide: true, bars: [
      { c: ['C', 'maj7'], n: [[1, 3, 1], [1, 5, 1], [2, 2, 1], [2, 3, 1], [2, 5, 1], [3, 2, 1], [3, 4, 1], [3, 5, 1]] },
      { c: ['C', 'maj7'], n: [[3, 7, 1], [3, 9, 1], [3, 10, 1], [3, 12, 5]] }] }] },
  { h: '3도 패턴: 스케일을 멜로디로', b: `<p>스케일을 순서대로만 오르내리면 연습처럼 들려요. <b>한 음씩 건너뛰면</b>(3도) 바로 멜로디가 돼요. 게다가 3도는 코드를 쌓는 간격이라, 이 패턴이 4단계 코드톤의 준비 운동이에요.</p>`,
    tabs: [{ t: '3도 패턴: 1-3, 2-4, 3-5, 4-6 …', bpm: 85, key: 'C', allow: MAJ, bars: [
      { c: ['C', 'maj7'], n: [[1, 3, 1], [2, 2, 1], [1, 5, 1], [2, 3, 1], [2, 2, 1], [2, 5, 1], [2, 3, 1], [3, 2, 1]] },
      { c: ['C', 'maj7'], n: [[2, 5, 1], [3, 4, 1], [3, 2, 1], [3, 5, 5]] }] }],
    b2: `<p class="note">🎸 연습: 60 BPM에서 시작해 막힘없이 되면 5씩 올리기. 되면 G, F, B♭ 키로 옮겨요(모양은 같아요).</p>` },
]);

// 귀 훈련 E3: 종지로 키를 깔고, 한 음이 몇 번째 음인지
const FEEL = {
  M: { 0: '집. 완전히 쉬는 소리', 2: '떠 있다가 1로 내려가고 싶은 소리', 4: '밝고 안정된 소리', 5: '3으로 반음 내려앉고 싶은 소리', 7: '열려 있지만 안정된 소리', 9: '부드럽고 따뜻한 소리', 11: '1로 강하게 당겨지는 소리' },
  m: { 0: '집. 완전히 쉬는 소리', 3: '어두움을 정하는 소리', 5: '♭3이나 5로 움직이고 싶은 소리', 6: '블루노트. 가장 거친 소리', 7: '열려 있지만 안정된 소리', 10: '1로 온음 올라가거나 5로 내려가는 소리' },
};
function degEar(stage, title, p, mode, set) {
  return {
    stage, title, ear: true, items: () => set.map(n => `${p}:${n}`),
    make(key) {
      const n = +key.split(':')[1], r = 36 + rnd(6), K = mode === 'M' ? keyByPc(r % 12) : bluesRoot(r % 12);
      const cad = mode === 'M' ? [[0, 'maj'], [5, 'maj'], [7, 'dom'], [0, 'maj']] : [[0, 'min'], [5, 'min'], [7, 'dom'], [0, 'min']];
      const play = () => {
        cad.forEach(([x, q], i) => { comp((r + x) % 12, q, i * 0.55, i === 3 ? 0.9 : 0.5, 0.1); pluck(x === 7 ? r - 5 : r + x, i * 0.55, 0.5, 0.3); });
        pluck(r + n, 2.75, 1.5, 0.5);
      };
      const full = mode === 'M' ? MAJ : set;
      const path = n === 0 ? [0] : n >= 7 ? [...full.filter(x => x >= n), 12] : full.filter(x => x <= n).slice().reverse();
      const f = r - 33, sh = n ? ivShape(n) : { k: 0, d: 0 };
      const marks = [{ s: 1, f, t: '1', c: 'root' }]; if (n) marks.push({ s: 1 + sh.k, f: f + sh.d, t: DEG[n], c: 'ok' });
      return {
        prompt: `마지막에 들린 베이스 음은 <b>키의 몇 음</b>? 🎧`, listen: true, autoplay: true, board: null, after: { marks },
        choices: set.map(x => ({ v: x, label: DEG[x] })), correct: v => v === n,
        explain: `<b>${DEG[n]}음</b>: ${FEEL[mode][n]}. ${K} ${mode === 'M' ? '메이저' : '마이너'}에서 ${nameOver((r + n) % 12, K)}.${n ? ` 집까지 가는 길: ${path.map(x => DEG[x % 12]).join(' → ')}` : ''}`,
        play, playAfter: () => playSeq(path.map(x => r + x), 0.45), wait: 1500 + path.length * 450,
      };
    },
  };
}
addQuiz('l3', {
  minType: {
    stage: 3, title: '자연 · 하모닉 · 멜로딕 구별',
    items() { const k = []; ['A', 'E', 'D', 'G', 'C', 'B'].forEach(K => ['n', 'h', 'm'].forEach(t => k.push(`mt:${K}:${t}`))); return k; },
    make(key) {
      const [, K, t] = key.split(':'), sc = { n: MIN, h: HARM, m: MELO }[t], notes = scaleOf(K, sc);
      const nm = { n: '자연단음계', h: '하모닉 마이너', m: '멜로딕 마이너' };
      return {
        prompt: `${notes.join(' ')}<br>무슨 마이너 스케일?`, board: null, after: null,
        choices: ['n', 'h', 'm'].map(v => ({ v, label: nm[v] })), correct: v => v === t,
        explain: `<b>${K} ${nm[t]}</b>. 6음 ${notes[5]}(${DEG[sc[5]]}), 7음 ${notes[6]}(${DEG[sc[6]]})을 보면 구별돼요.`,
        play: () => { const r = 33 + (parsePc(K) - 9 + 12) % 12; playSeq([...sc, 12].map(x => r + x), 0.25); }, wait: 2600,
      };
    },
  },
  degEarA: degEar(3, '키 위에서 몇 음? (1·3·5)', 'e3a', 'M', [0, 4, 7]),
  degEarB: degEar(3, '키 위에서 몇 음? (메이저 7음)', 'e3b', 'M', MAJ),
});

/* ═════════ 4단계 보강 ═════════ */
addCards('l4', '코드 = 3도씩', [
  { h: '왜 3도로 쌓을까', b: `<p><b>2도</b>로 쌓으면 음이 붙어서 부딪혀요. <b>4도·5도</b>로 쌓으면 텅 비고, 밝은지 어두운지 정해지지 않아요.</p><p><b>3도</b>만이 장3도와 단3도 두 종류가 있어서 <b>밝고 어두움을 정해 줘요</b>. 그래서 코드의 성격은 3음이 결정하고, 5음은 대체로 코드를 두툼하게 할 뿐이에요.</p>
    <p class="note">그래서 즉흥에서도 <b>3음이 5음보다 훨씬 중요</b>해요. 8단계 가이드톤의 이유가 이거예요.</p>`,
    sounds: [{ label: '2도로 (C D E)', seq: [36, 38, 40] }, { label: '3도로 (C E G)', seq: [36, 40, 43] }, { label: '4도로 (C F B♭)', seq: [36, 41, 46] }] },
]);
addCards('l4', 'm7♭5: 불안하고', [
  { h: '차트에 나오는 나머지 코드', b: `<p>7th 4종 말고도 이런 기호가 나와요. 외우는 게 아니라 <b>어디가 바뀌었는지</b>만 보면 돼요.</p>
    ${table(['기호', '구성', 'C 예시', ''], ['six', 'm6', 'sus', 'sus7', 'dim', 'dim7', 'aug', 'mM7'].map(q => [`<b>${cname('C', q)}</b>`, CHX[q].t.map(t => t[2]).join(' '), CHX[q].t.map(([s, st]) => spell('C', s, st)).join(' '), miniSeq(CHX[q].t.map(t => 36 + t[0]))]))}
    <p><b>sus4</b>: 3음 대신 4음. 밝지도 어둡지도 않게 떠 있다가 3으로 내려와요.<br><b>6</b>: maj7 대신 쓰는 더 편안한 끝. C6과 Am7은 구성음이 같아요.<br><b>dim7</b>: 모든 간격이 단3도라, 네 음 중 어느 것을 루트로 봐도 같은 코드예요.</p>
    <p class="note">Cdim7의 ♭♭7은 이론상 B♭♭이지만 읽기 쉽게 A로 적었어요.</p>` },
  { h: '자리바꿈과 슬래시 코드', b: `<p><b>C/E</b>는 "C 코드인데 베이스는 E". 코드톤 중 무엇을 맨 아래에 둘지는 <b>베이시스트가 정해요</b>. 같은 코드도 루트 대신 3음을 치면 느낌이 가벼워지고, 다음 코드로 부드럽게 이어져요.</p>
    ${table(['이름', '맨 아래 음', '느낌'], [['기본 위치', '1', '가장 단단함'], ['첫째 자리바꿈 C/E', '3', '가볍고 움직이려 함'], ['둘째 자리바꿈 C/G', '5', '붕 떠 있음'], ['셋째 자리바꿈 C/B', '7', '다음 코드로 흘러감']])}`,
    tabs: [{ t: 'Cmaj7을 3·5·7음에서 시작하기', bpm: 100, allow: [0, 4, 7, 11], bars: [
      { c: ['C', 'maj7'], n: [[2, 2, 2], [2, 5, 2], [3, 4, 2], [3, 5, 2]] },
      { c: ['C', 'maj7'], n: [[1, 10, 2], [2, 9, 2], [2, 10, 2], [3, 9, 2]] },
      { c: ['C', 'maj7'], n: [[2, 9, 2], [2, 10, 2], [3, 9, 2], [3, 12, 2]] },
      { c: ['C', 'maj7'], n: [[3, 5, 8]] }] }],
    b2: `<p><b>솔로에서</b>: 아르페지오를 항상 루트부터 시작하면 뻔하게 들려요. <b>3음에서 시작</b>하는 습관이 가장 효과가 커요.</p>` },
  { h: '아르페지오를 지판 전체로', b: `<p>Cmaj7의 음(C E G B)은 지판 전체에 있어요. 한 모양만 알면 거기에 갇히니, 두 옥타브로 이어 보세요.</p>`,
    boards: [{ marks: posMarks('C', [0, 4, 7, 11], 0, 12), cap: 'Cmaj7의 코드톤 전부' }],
    tabs: [{ t: 'E현 8프렛에서 두 옥타브로 올라가기', bpm: 85, allow: [0, 4, 7, 11], wide: true, bars: [{ c: ['C', 'maj7'], n: [[0, 8, 1], [1, 7, 1], [1, 10, 1], [2, 9, 1], [2, 10, 1], [3, 9, 1], [3, 12, 2]] }] }] },
  { h: '한 포지션 안에서 코드 바꾸기', b: `<p>코드가 바뀔 때마다 손을 옮기면 빠른 진행을 못 따라가요. <b>손은 2~5프렛에 두고</b> 코드톤만 바꿔 짚어 보세요.</p>`,
    boards: [['D', 'm7'], ['G', 'dom'], ['C', 'maj7']].map(([r, q]) => ({ to: 7, marks: posMarks(r, CH[q].t.map(t => t[0]), 2, 5), cap: `${cname(r, q)} (2~5프렛)` })),
    b2: `<p>세 그림에서 <b>겹치거나 한 프렛만 움직이는 자리</b>를 찾아보세요. 그게 8단계에서 쓸 길이에요.</p>` },
  { h: '텐션: 9 · 11 · 13', b: `<p>3도를 계속 쌓으면 7 다음에 <b>9, 11, 13</b>이 나와요. 한 옥타브 위의 <b>2, 4, 6</b>과 같은 음이에요.</p><p class="big">9 = 2 · 11 = 4 · 13 = 6</p>
    <p>코드톤이 집의 기둥이라면 텐션은 색칠이에요. 코드를 바꾸지 않으면서 소리를 풍부하게 해요.</p>
    ${table(['코드', '쓸 수 있는 텐션', '조심할 음'], [['maj7', '9, ♯11, 13', '11 (3음과 부딪힘)'], ['m7', '9, 11, 13*', '♭13'], ['7', '9, 13 (♭9, ♯9, ♯11, ♭13도)', '11'], ['m7♭5', '11, ♭13, 9*', '♭9']])}
    <p><b>왜 조심하나</b>: 코드톤의 <b>반음 위</b>에 있는 음은 그 코드톤과 부딪혀 코드를 흐려요. Cmaj7의 F(11)는 E(3)의 반음 위예요. 반대로 <b>온음 위</b>면 대체로 편하게 들려요.</p>
    <p class="note">* 는 곡의 키와 상황에 따라 달라요. 5단계에서 이어져요.</p>`,
    sounds: [{ label: 'Cmaj7 위의 9 (D)', seq: [36, 40, 43, 47, 50] }, { label: 'Cmaj7 위의 11 (F)', seq: [36, 40, 43, 47, 53] }] },
  { h: '텐션을 쉽게 쓰는 법: 위쪽 아르페지오', b: `<p>텐션을 하나씩 생각할 필요 없이, 코드의 <b>3음에서 시작하는 7th 아르페지오</b>를 치면 3·5·7·9가 나와요.</p>
    ${table(['이 코드 위에서', '이 아르페지오', '나오는 음'], [['Dm7', 'Fmaj7', 'F A C E = ♭3 5 ♭7 9'], ['G7', 'Bm7♭5', 'B D F A = 3 5 ♭7 9'], ['Cmaj7', 'Em7', 'E G B D = 3 5 7 9']])}`,
    tabs: [{ t: 'Dm7 위에서 Fmaj7 아르페지오 (TAB 아래 2 = 9음)', bpm: 90, allow: [0, 2, 3, 7, 10], bars: [{ c: ['D', 'm7'], n: [[0, 1, 2], [0, 5, 2], [1, 3, 2], [2, 2, 2]] }, { c: ['D', 'm7'], n: [[2, 3, 2], [2, 2, 2], [1, 3, 4]] }] }],
    loop: { t: 'Dm7 한 코드 위에서 해보기', bpm: 90, swing: false, bars: [[['D', 'm7']], [['D', 'm7']], [['D', 'm7']], [['D', 'm7']]] } },
]);
const TENS = { maj7: [['9', 14, 1], ['♯11', 18, 3], ['13', 21, 5]], dom: [['♭9', 13, 1], ['9', 14, 1], ['♯11', 18, 3], ['13', 21, 5]], m7: [['9', 14, 1], ['11', 17, 3]], hd: [['11', 17, 3], ['♭13', 20, 5]] };
addQuiz('l4', {
  cext: {
    stage: 4, title: '코드 기호 → 구성 (6·sus·dim…)',
    items: () => ['six', 'm6', 'sus', 'sus7', 'dim', 'dim7', 'aug', 'mM7'].map(q => `cx:${q}`),
    make(key) {
      const q = key.split(':')[1], R = pick(['C', 'D', 'G', 'A', 'E']), f = x => CHX[x].t.map(t => t[2]).join(' '), p = rootPos(parsePc(R));
      return {
        prompt: `<b>${cname(R, q)}</b>의 구성은?`, board: null, after: null,
        choices: opts(f(q), Object.keys(CHX).filter(x => x !== q).map(f)), correct: v => v === f(q),
        explain: `<b>${cname(R, q)}</b> (${CHX[q].ko}) = ${f(q)} → ${CHX[q].t.map(([s, st]) => spell(R, s, st)).join(' ')}`,
        play: () => { const r = midiAt(p.s, p.f); playSeq(CHX[q].t.map(t => r + t[0]), 0.35); },
      };
    },
  },
  tension: {
    stage: 4, title: '텐션 이름 (9 · 11 · 13)',
    items: () => Object.keys(TENS).flatMap(q => TENS[q].map(x => `tn:${q}:${x[0]}`)),
    make(key) {
      const [, q, lab] = key.split(':'), [, semi, st] = TENS[q].find(x => x[0] === lab);
      const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'B♭', 'E♭'].filter(R => clean(spell(R, semi % 12, st) + chordNotes(R, q).join('')));
      const R = pick(roots), ans = spell(R, semi % 12, st), p = rootPos(parsePc(R));
      return {
        prompt: `<b>${R}${CH[q].sym}</b>의 <b>${lab}음</b>은?`, board: null, after: null,
        choices: noteChoices(), correct: v => v === parsePc(ans),
        explain: `<b>${ans}</b>. ${lab}은 ${lab.replace('9', '2').replace('11', '4').replace('13', '6')}음과 같은 자리예요. 코드톤은 ${chordNotes(R, q).join(' ')}.`,
        play: () => { const r = midiAt(p.s, p.f); playSeq([...CH[q].t.map(t => r + t[0]), r + semi], 0.35); },
      };
    },
  },
});

/* ═════════ 5단계 보강 ═════════ */
addCards('l5', '기능: 집', [
  { h: '왜 그런 기능이 될까: 4음과 7음', b: `<p>C 키에서 불안정한 두 음은 <b>F(4음)</b>와 <b>B(7음)</b>예요. 코드가 이 둘을 얼마나 갖고 있는지가 기능을 정해요.</p>
    ${table(['코드', 'F(4)', 'B(7)', '기능'], [1, 2, 3, 4, 5, 6, 7].map(d => { const ns = chordNotes(scaleOf('C')[d - 1], DIA_Q[d - 1]); return [`${RN[d - 1]} ${dia('C', d)}`, ns.includes('F') ? '●' : '', ns.includes('B') ? '●' : '', FUNC[d - 1]]; }))}
    <p><b>둘 다 있음</b> → 도미넌트 (트라이톤이 생겨 가장 불안)<br><b>F만 있음</b> → 서브도미넌트<br><b>F가 없음</b> → 토닉 (안정)</p>
    <p>외울 필요 없이 <b>4음이 있나, 7음도 있나</b>만 보면 돼요.</p>` },
  { h: '대리코드: 같은 역할끼리 바꾸기', b: `<p>기능이 같고 음이 3개 겹치면 서로 바꿔 쓸 수 있어요.</p>
    ${table(['원래', '대리', '겹치는 음'], [['Cmaj7 (Ⅰ)', 'Em7 (ⅲ)', 'E G B'], ['Cmaj7 (Ⅰ)', 'Am7 (ⅵ)', 'C E G'], ['Fmaj7 (Ⅳ)', 'Dm7 (ⅱ)', 'F A C'], ['G7 (Ⅴ)', 'Bm7♭5 (ⅶ)', 'B D F']])}
    <p><b>솔로에서</b>: 차트에 Cmaj7이라 적혀 있어도 <b>Em7 아르페지오</b>를 치면 3·5·7·9가 나와서 더 세련되게 들려요. 4단계의 "위쪽 아르페지오"가 사실 대리코드예요.</p>`,
    tabs: [{ t: 'Cmaj7 위에서 Em7 아르페지오', bpm: 90, allow: [0, 2, 4, 7, 11], bars: [{ c: ['C', 'maj7'], n: [[0, 0, 2], [0, 3, 2], [1, 2, 2], [1, 5, 2]] }, { c: ['C', 'maj7'], n: [[1, 3, 8]] }] }] },
]);
// 키의 각 코드에서 스케일 7음을 코드톤 / 텐션 / 피할 음으로 나누기
function chordScale(K, d) {
  const sc = scaleOf(K), root = sc[d - 1], ct = CH[DIA_Q[d - 1]].t.map(t => t[0]);
  const rest = sc.map(n => [n, degOf(parsePc(n), root)]).filter(x => !ct.includes(x[1]));
  const isAvoid = n => ct.some(c => (n - c + 12) % 12 === 1);
  return { root, safe: rest.filter(x => !isAvoid(x[1])), avoid: rest.filter(x => isAvoid(x[1])), ct: ct.map((s, i) => [spell(root, s, CH[DIA_Q[d - 1]].t[i][1]), s]) };
}
const csText = l => l.map(([n, s]) => `${n}<small>(${TNAME[s]})</small>`).join(' ') || '–';
addCards('l5', '마이너 키의 다이아토닉', [
  { h: '피해야 할 음 (avoid note)', b: `<p>키 스케일이라도 <b>코드톤의 반음 위</b> 음은 오래 머물면 부딪혀요. 그 음을 피할 음이라고 해요.</p>
    ${table(['C 키 코드', '색칠에 좋은 음', '오래 머물지 않기'], [1, 2, 3, 4, 5, 6, 7].map(d => { const x = chordScale('C', d); return [`<b>${dia('C', d)}</b>`, csText(x.safe), csText(x.avoid)]; }))}
    <p>금지가 아니에요. <b>지나가는 건 괜찮고, 센 박에서 길게 끌지 말라</b>는 뜻이에요. 재즈 라인에서 가장 흔한 실수가 Cmaj7에서 F로 끝나는 거예요.</p>
    <p class="note">Dm7의 13(B)은 반음 위는 아니지만 G7의 3음이라 G7처럼 들릴 수 있어요. 상황을 보고 써요.</p>` },
  { h: '다이아토닉 아르페지오 이어 치기', b: `<p>키의 코드를 하나는 올라가고 하나는 내려오며 이어 치는 연습이에요. 코드가 바뀌는 지점이 <b>가까운 음으로 연결</b>되는 걸 느껴 보세요.</p>`,
    tabs: [{ t: 'C 키: Ⅰ 올라가고 ⅱ 내려오기', bpm: 90, allowCt: true, bars: [
      { c: ['C', 'maj7'], n: [[1, 3, 2], [2, 2, 2], [2, 5, 2], [3, 4, 2]] },
      { c: ['D', 'm7'], n: [[3, 5, 2], [3, 2, 2], [2, 3, 2], [1, 5, 2]] },
      { c: ['E', 'm7'], n: [[2, 2, 2], [2, 5, 2], [3, 4, 2], [3, 7, 2]], wide: true },
      { c: ['F', 'maj7'], n: [[3, 9, 2], [2, 10, 2], [2, 7, 2], [1, 8, 2]] }] }],
    b2: `<p class="note">🎸 연습: 다섯째 코드(G7)부터 Cmaj7까지 나머지는 직접 이어 보세요. 막히면 Claude 프로젝트에 물어보면 돼요.</p>` },
]);
addQuiz('l5', {
  subst: {
    stage: 5, title: '대리코드 찾기',
    items() { const k = []; ['C', 'G', 'F', 'B♭'].forEach(K => [1, 2, 4, 5].forEach(d => k.push(`sb:${K}:${d}`))); return k; },
    make(key) {
      const [, K, ds] = key.split(':'), d = +ds, same = { 1: [3, 6], 2: [4], 4: [2], 5: [7] }[d], a = pick(same), ans = dia(K, a);
      const wrong = [1, 2, 3, 4, 5, 6, 7].filter(x => x !== d && FUNC[x - 1] !== FUNC[d - 1]).map(x => dia(K, x));
      const shared = chordNotes(scaleOf(K)[d - 1], DIA_Q[d - 1]).filter(n => chordNotes(scaleOf(K)[a - 1], DIA_Q[a - 1]).includes(n));
      return {
        prompt: `<b>${K} 메이저</b> 키에서 <b>${dia(K, d)}</b>와 <b>기능이 같은</b> 대리코드는?`, board: null, after: null,
        choices: opts(ans, wrong), correct: v => v === ans,
        explain: `<b>${ans}</b> (${RNQ[a - 1]}). 둘 다 ${FUNC[d - 1]}이고 ${shared.join(' ')}가 겹쳐요.`,
        play: () => playProg(K, [d, a]), wait: 3000,
      };
    },
  },
  avoid: {
    stage: 5, title: '피해야 할 음 찾기',
    items() { const k = []; ['C', 'G', 'F'].forEach(K => [1, 3, 5, 6, 7].forEach(d => k.push(`av:${K}:${d}`))); return k; },
    make(key) {
      const [, K, ds] = key.split(':'), d = +ds, x = chordScale(K, d), [an, as] = pick(x.avoid);
      const near = x.ct.find(([, s]) => (as - s + 12) % 12 === 1)[0], p = rootPos(parsePc(x.root));
      return {
        prompt: `<b>${K}</b> 키의 <b>${dia(K, d)}</b>에서 <b>오래 머물면 부딪히는</b> 음은?`, board: null, after: null,
        choices: opts(an, [...x.ct, ...x.safe].map(y => y[0])), correct: v => v === an,
        explain: `<b>${an}</b> (${TNAME[as]}). 코드톤 ${near}의 반음 위라 부딪혀요. 색칠에 좋은 음은 ${x.safe.map(y => `${y[0]}(${TNAME[y[1]]})`).join(', ') || '없음'}.`,
        play: () => { const r = midiAt(p.s, p.f); comp(parsePc(x.root), DIA_Q[d - 1], 0, 2, 0.1); pluck(r, 0, 0.7); pluck(r + as, 0.8, 1.2); }, wait: 2400,
      };
    },
  },
});

/* ═════════ 6단계 보강 ═════════ */
addCards('l6', '세컨더리 도미넌트', [
  { h: '트라이톤 대리 (subⅤ7)', b: `<p>G7의 심장은 <b>B와 F</b>(3음과 ♭7음, 트라이톤)예요. 그런데 <b>D♭7</b>도 F와 C♭(=B)를 갖고 있어요. 심장이 같으니 <b>G7 대신 D♭7</b>을 쓸 수 있어요.</p>
    <p class="big">Dm7 – G7 – Cmaj7<br>Dm7 – <span style="color:var(--accent)">D♭7</span> – Cmaj7</p>
    <p>루트가 D → D♭ → C로 <b>반음씩 내려가요</b>. 베이시스트에게 가장 달콤한 라인이죠. 대리코드의 루트는 원래 Ⅴ7의 루트에서 트라이톤(반음 6개) 거리예요.</p>`,
    tabs: [{ t: 'D♭7로 바꿔 지나가기', bpm: 95, allowCt: true, bars: [
      { c: ['D', 'm7'], n: [[1, 5, 2], [2, 3, 2], [3, 2, 2], [3, 5, 2]] },
      { c: ['D♭', 'dom'], n: [[3, 4, 2], [3, 1, 2], [2, 3, 2], [1, 4, 2]] },
      { c: ['C', 'maj7'], n: [[1, 3, 2], [2, 2, 2], [2, 5, 4]] }] }],
    sounds: [{ label: '원래: Dm7 G7 Cmaj7', chords: [[38, 'm7'], [43, 'dom'], [36, 'maj7']] }, { label: '대리: Dm7 D♭7 Cmaj7', chords: [[38, 'm7'], [37, 'dom'], [36, 'maj7']] }] },
  { h: '모달 인터체인지: 마이너에서 빌려오기', b: `<p>C 메이저 곡에서 갑자기 <b>Fm7</b>이 나오면? <b>C 마이너</b> 키에서 빌려온 코드예요. 으뜸음은 그대로 두고 색만 잠깐 어두워져요.</p>
    ${table(['C 키에서', '번호', '빌려온 음'], [['Fm7', 'ⅳm7', 'A♭'], ['B♭7', '♭Ⅶ7', 'B♭ (Fm7 다음에 자주)'], ['A♭maj7', '♭Ⅵmaj7', 'A♭ E♭'], ['Dm7♭5', 'ⅱm7♭5', 'A♭']])}
    <p><b>솔로에서</b>: Fmaj7 → Fm7에서 <b>A가 A♭로</b> 반음 내려가는 것, 그리고 다음 Cmaj7의 <b>G로 또 반음</b> 내려가는 것. 이 세 음만 이어도 완벽한 라인이에요.</p>`,
    tabs: [{ t: 'A → A♭ → G를 들리게', bpm: 95, allowCt: true, bars: [
      { c: ['F', 'maj7'], n: [[3, 2, 2], [2, 3, 2], [1, 3, 2], [3, 2, 2]] },
      { c: ['F', 'm7'], n: [[3, 1, 2], [2, 3, 2], [1, 3, 2], [3, 1, 2]] },
      { c: ['C', 'maj7'], n: [[2, 5, 2], [2, 2, 2], [1, 3, 4]] }] }],
    sounds: [{ label: 'Fmaj7 – Fm7 – Cmaj7', chords: [[41, 'maj7'], [41, 'm7'], [36, 'maj7']] }, { label: 'Fm7 – B♭7 – Cmaj7', chords: [[41, 'm7'], [34, 'dom'], [36, 'maj7']] }] },
  { h: '전조: 키가 옮겨 가는 신호', b: `<p>곡 중간에 <b>다른 키의 ⅱ–Ⅴ</b>가 나오면 그 키로 옮겨 간다는 신호예요. ⅱ–Ⅴ를 보면 도착지를 미리 알 수 있어요.</p>
    ${chartHtml(['Cmaj7', 'Cm7', 'F7', 'B♭maj7'])}<p>Cmaj7이 <b>Cm7</b>로 바뀌는 순간, B♭ 키의 ⅱ가 돼요. Cm7–F7은 B♭의 ⅱ–Ⅴ, 그래서 B♭maj7에 도착해요. 같은 방법으로 <b>온음씩 내려가며</b> 키가 바뀌는 곡이 많아요.</p>
    <p><b>솔로에서</b>: Cmaj7의 E가 Cm7의 E♭로 바뀌는 걸 들려주면 전조가 들려요.</p>`,
    loop: { t: '온음씩 내려가는 전조', bpm: 100, swing: true, bars: [[['C', 'maj7']], [['C', 'maj7']], [['C', 'm7']], [['F', 'dom']], [['B♭', 'maj7']], [['B♭', 'maj7']], [['D', 'm7']], [['G', 'dom']]] } },
]);
addCards('l6', '12마디 블루스', [
  { h: '재즈 블루스: 블루스 + ⅱ–Ⅴ', b: `<p>기본 12마디의 빈 곳에 ⅱ–Ⅴ를 채운 것이 재즈 블루스예요. 뼈대(1·5·7·9마디)는 그대로예요.</p>`,
    loop: { t: 'F 재즈 블루스', bpm: 110, swing: true, bars: [[['F', 'dom']], [['B♭', 'dom']], [['F', 'dom']], [['C', 'm7'], ['F', 'dom']], [['B♭', 'dom']], [['B', 'dim7']], [['F', 'dom']], [['A', 'm7'], ['D', 'dom']], [['G', 'm7']], [['C', 'dom']], [['F', 'dom'], ['D', 'dom']], [['G', 'm7'], ['C', 'dom']]] },
    b2: `<p>4마디 <b>Cm7–F7</b>: B♭의 ⅱ–Ⅴ → 5마디 B♭7로<br>6마디 <b>Bdim7</b>: B♭과 다음 F7(의 5음 C)을 반음으로 잇는 다리<br>8마디 <b>Am7–D7</b>: Gm7으로 가는 ⅱ–Ⅴ<br>9~10마디 <b>Gm7–C7</b>: F로 가는 ⅱ–Ⅴ<br>11~12마디: 처음으로 돌아가는 턴어라운드</p>` },
]);
const TUNE = [[['F', 'maj7']], [['D', 'dom']], [['G', 'm7']], [['C', 'dom']], [['A', 'hd'], ['D', 'dom']], [['G', 'm7']], [['B♭', 'm7'], ['E♭', 'dom']], [['F', 'maj7'], ['C', 'dom']],
  [['C', 'm7']], [['F', 'dom']], [['B♭', 'maj7']], [['B♭', 'maj7']], [['D', 'm7']], [['G', 'dom']], [['G', 'm7']], [['C', 'dom']]];
addCards('l6', '차트 분석 루틴', [
  { h: '실전: 16마디 곡 하나 분석하기', b: `<p>연습용으로 만든 곡이에요. 먼저 <b>답을 보지 말고</b> 키, ⅱ–Ⅴ, 낯선 코드를 찾아보세요.</p>`,
    loop: { t: '연습곡 (F 키, 앞 8마디 A · 뒤 8마디 B)', bpm: 120, swing: true, bars: TUNE },
    b2: `<p><b>키</b>: Fmaj7로 시작하고 C7(Ⅴ)이 있으니 F 메이저</p>
    ${table(['마디', '코드', '정체'], [['2', 'D7', 'Gm7으로 가는 세컨더리 도미넌트 (키 밖 음 F♯)'], ['3–4', 'Gm7 C7', 'F의 ⅱ–Ⅴ'], ['5–6', 'Am7♭5 D7 → Gm7', 'Gm으로 가는 마이너 ⅱ–Ⅴ–ⅰ'], ['7', 'B♭m7 E♭7', 'F 마이너에서 빌려온 ⅳm7–♭Ⅶ7 (모달 인터체인지)'], ['8', 'Fmaj7 C7', 'Ⅰ로 돌아오고 C7로 반복 준비'], ['9–11', 'Cm7 F7 B♭maj7', 'B♭(Ⅳ)의 ⅱ–Ⅴ–Ⅰ로 잠깐 전조'], ['13–14', 'Dm7 G7', 'C의 ⅱ–Ⅴ. 그런데 C로 안 가고'], ['15–16', 'Gm7 C7', '다시 F의 ⅱ–Ⅴ로 처음으로']])}
    <p>코드는 19개지만 덩어리로 보면 <b>열 개도 안 돼요</b>. 8단계에서 이 곡 위에 솔로를 얹어요.</p>` },
]);
addQuiz('l6', {
  cls: {
    stage: 6, title: '이 코드의 정체는?',
    items() { const k = []; ['C', 'F', 'G', 'D'].forEach(K => ['d2', 'd3', 's2', 's5', 's6', 'm4', 'm6', 'm7', 't'].forEach(t => k.push(`cl:${K}:${t}`))); return k; },
    make(key) {
      const [, K, t] = key.split(':'), sc = scaleOf(K), I = K + 'maj7';
      const sec = d => spell(sc[d - 1], 7, 4) + '7';
      const M = {
        d2: ['다이아토닉', [dia(K, 2), dia(K, 5)], 'ⅱm7. 키 안의 코드예요.', [[2, 'm7'], [7, 'dom']]],
        d3: ['다이아토닉', [dia(K, 3), dia(K, 6)], 'ⅲm7. 키 안의 코드예요.', [[4, 'm7'], [9, 'm7']]],
        s2: ['세컨더리 도미넌트', [sec(2), dia(K, 2)], `${dia(K, 2)}로 가는 Ⅴ7이에요.`, [[9, 'dom'], [2, 'm7']]],
        s5: ['세컨더리 도미넌트', [sec(5), dia(K, 5)], `${dia(K, 5)}로 가는 Ⅴ7이에요.`, [[2, 'dom'], [7, 'dom']]],
        s6: ['세컨더리 도미넌트', [sec(6), dia(K, 6)], `${dia(K, 6)}로 가는 Ⅴ7이에요.`, [[4, 'dom'], [9, 'm7']]],
        m4: ['모달 인터체인지', [sc[3] + 'm7', I], `${K} 마이너에서 빌려온 ⅳm7이에요.`, [[5, 'm7'], [0, 'maj7']]],
        m6: ['모달 인터체인지', [spell(K, 8, 5) + 'maj7', I], `${K} 마이너에서 빌려온 ♭Ⅵmaj7이에요.`, [[8, 'maj7'], [0, 'maj7']]],
        m7: ['모달 인터체인지', [spell(K, 10, 6) + '7', I], `${K} 마이너에서 빌려온 ♭Ⅶ7이에요.`, [[10, 'dom'], [0, 'maj7']]],
        t: ['트라이톤 대리', [spell(K, 1, 1) + '7', I], `${dia(K, 5)} 대신 쓴 코드. 루트가 반음 내려 Ⅰ로 가요.`, [[1, 'dom'], [0, 'maj7']]],
      };
      const [ans, list, why, snd] = M[t], base = 33 + (parsePc(K) - 9 + 12) % 12;
      return {
        prompt: `<b>${K} 메이저</b> 키에서 <b>첫 번째 코드</b>의 정체는?${chartHtml(list, 0)}`, board: null, after: null,
        choices: ['다이아토닉', '세컨더리 도미넌트', '모달 인터체인지', '트라이톤 대리'].map(v => ({ v, label: v })), correct: v => v === ans,
        explain: `<b>${list[0]}</b> = <b>${ans}</b>. ${why}`,
        play: () => playChords([[base, 'maj7'], ...snd.map(([x, q]) => [base + x, q])], 1), wait: 3400,
      };
    },
  },
  tritone: {
    stage: 6, title: '트라이톤 대리 코드',
    items: () => ['G', 'C', 'D', 'A', 'E', 'B'].map(R => `tt:${R}`),
    make(key) {
      const R = key.split(':')[1], ans = spell(R, 6, 4) + '7', I = spell(R, 5, 3), g3 = spell(R, 4, 2), g7 = spell(R, 10, 6);
      return {
        prompt: `<b>${R}7</b> 대신 쓸 수 있는 트라이톤 대리 코드는?`, board: null, after: null,
        choices: opts(ans, [[5, 3], [7, 4], [10, 6], [2, 1], [9, 5]].map(([s, st]) => spell(R, s, st) + '7')), correct: v => v === ans,
        explain: `<b>${ans}</b>. ${R}7의 3음 ${g3}와 ♭7음 ${g7}를 그대로 갖고 있어요(이름만 바뀜). 루트가 반음 내려 ${I}로 가요.`,
        play: () => { const b = 33 + (parsePc(I) - 9 + 12) % 12; playChords([[b + 2, 'm7'], [b + 1, 'dom'], [b, 'maj7']], 1); }, wait: 3200,
      };
    },
  },
  keychg: {
    stage: 6, title: '전조: 어느 키로 가나?',
    items: () => [5, 10, 8, 3, 2, 7].map(x => `kc:${x}`),
    make(key) {
      const x = +key.split(':')[1], step = { 5: 3, 10: 6, 8: 5, 3: 2, 2: 1, 7: 4 }[x];
      const K = pick(['C', 'F', 'G', 'B♭'].filter(k => MAJ_KEYS.includes(spell(k, x, step)))), T = spell(K, x, step);
      const b = 33 + (parsePc(K) - 9 + 12) % 12;
      return {
        prompt: `<b>${K} 메이저</b> 곡 중간이에요. 이 ⅱ–Ⅴ는 <b>어느 키</b>로 가나요?${chartHtml([K + 'maj7', dia(T, 2), dia(T, 5), '?'])}`, board: null, after: null,
        choices: opts(T, [spell(T, 5, 3), spell(T, 7, 4), ...MAJ_KEYS.filter(k => k !== T)]).map(c => ({ ...c, label: `${c.v} 메이저` })), correct: v => v === T,
        explain: `<b>${T} 메이저</b>. ${dia(T, 2)}–${dia(T, 5)}는 ${T}의 ⅱ–Ⅴ. ${dia(T, 5)}의 4도 위가 도착지예요.`,
        play: () => playChords([[b, 'maj7'], [b + x + 2, 'm7'], [b + x + 7, 'dom'], [b + x, 'maj7']].map(([r, q]) => [r > 50 ? r - 12 : r, q]), 1), wait: 4200,
      };
    },
  },
});

/* ═════════ 7단계: 펜타토닉 · 블루스 ═════════ */
const Ablues = BLUES.map(d => [[scaleOf('A')[d - 1], 'dom']]);
LESSONS.push({
  id: 'l7', stage: 7, title: '펜타토닉 · 블루스 (첫 즉흥)', quizzes: [],
  cards: [
    { h: '왜 펜타토닉부터 시작할까', b: `<p>메이저 스케일에서 <b>4와 7을 빼면</b> 메이저 펜타토닉이에요. 왜 하필 그 둘일까요?</p>
      <p>3단계에서 본 반음 두 군데(3–4, 7–1)가 바로 그 음들이에요. 빼고 나면 <b>반음이 하나도 남지 않고, 트라이톤도 사라져요</b>. 그래서 어느 음에 멈춰도 크게 부딪히지 않아요.</p>
      <p class="big">1 2 3 <s style="opacity:.4">4</s> 5 6 <s style="opacity:.4">7</s></p>
      <p>대신 긴장도 줄어서, 진행을 따라가는 느낌은 약해요. 그건 8단계에서 채워요. 여기서는 <b>음 고민 없이 리듬과 노래에 집중</b>하는 게 목표예요.</p>`,
      sounds: [{ label: 'C 메이저 스케일', seq: [...MAJ, 12].map(x => 36 + x) }, { label: 'C 메이저 펜타토닉', seq: [...JPENTA, 12].map(x => 36 + x) }] },
    { h: '마이너 펜타토닉: 1 ♭3 4 5 ♭7', b: `<p>베이스에서 가장 많이 쓰는 모양이에요. <b>검지 = 루트 프렛</b>, 약지 = 2프렛 위, 새끼 = 3프렛 위.</p>`,
      board: { to: 9, marks: posMarks('A', MPENTA, 5, 8) }, cap: 'A 마이너 펜타토닉 (E현 5프렛 포지션)',
      tabs: [{ t: '올라가기', bpm: 90, key: 'A', allow: MPENTA, bars: [{ c: ['A', 'm7'], n: [[0, 5, 1], [0, 8, 1], [1, 5, 1], [1, 7, 1], [2, 5, 1], [2, 7, 1], [3, 5, 1], [3, 7, 1]] }] }] },
    { h: '메이저 펜타토닉: 1 2 3 5 6', b: `<p>루트를 <b>중지</b>로 잡는 모양. 3단계 메이저 포지션에서 4와 7만 빠진 거예요.</p><p><b>C 메이저 펜타와 A 마이너 펜타는 같은 음</b>이에요(C D E G A). 나란한조와 같은 원리라, 무엇을 집으로 느끼느냐만 달라요.</p>`,
      board: { to: 7, marks: posMarks('C', JPENTA, 2, 5, 1) }, cap: 'C 메이저 펜타토닉 (A현 3프렛 = 루트)',
      tabs: [{ t: '올라갔다 내려와서 1에 착지', bpm: 90, key: 'C', allow: JPENTA, bars: [
        { c: ['C', 'six'], n: [[1, 3, 1], [1, 5, 1], [2, 2, 1], [2, 5, 1], [3, 2, 1], [3, 5, 1], [3, 2, 1], [2, 5, 1]] },
        { c: ['C', 'six'], n: [[2, 2, 1], [1, 5, 1], [1, 3, 6]] }] }] },
    { h: '블루스 스케일: ♭5를 더하기', b: `<p>마이너 펜타에 <b>♭5</b> 하나를 더하면 블루스 스케일. 4와 5 사이를 반음으로 잇는 음이에요.</p><p class="big">1 ♭3 4 <span style="color:var(--accent)">♭5</span> 5 ♭7</p><p><b>주의</b>: ♭5는 <b>지나가는 음</b>이에요. 여기서 멈추면 틀린 음처럼 들리고, 4나 5로 흘려보내면 블루스가 돼요.</p>`,
      board: { to: 9, marks: posMarks('A', BLUE, 5, 8).map(m => m.t === '♭5' ? { ...m, c: 'ask' } : m) }, cap: '흰 점 = ♭5',
      tabs: [{ t: '♭5를 스쳐 내려오는 릭', bpm: 90, swing: true, key: 'A', allow: BLUE, bars: [
        { c: ['A', 'dom'], n: [[2, 7, 1], [2, 5, 1], [1, 7, 1], [1, 6, 1], [1, 5, 1], [0, 8, 1], [0, 5, 2]] },
        { c: ['A', 'dom'], n: [[0, 5, 1], [0, 8, 1], [1, 5, 1], [1, 6, 1], [1, 7, 4]] }] }],
      b2: `<p>첫째 마디는 5 → ♭5 → 4로 내려오고, 둘째 마디는 4 → ♭5 → 5로 올라가요. 둘 다 <b>♭5에 머물지 않죠</b>.</p>` },
    { h: '이론상 틀린데 왜 블루스로 들릴까', b: `<p>A7의 3음은 <b>C♯</b>인데 A 마이너 펜타에는 <b>C</b>가 있어요. 반음 충돌이라 이론대로면 틀린 음이에요.</p><p>블루스는 이 충돌 자체를 <b>소리의 정체성</b>으로 삼은 음악이에요. 반주는 메이저 3음, 멜로디는 마이너 3음. 이 거친 부딪힘이 블루스예요.</p><p>핵심 기술은 <b>♭3에서 3으로 미끄러지기</b>. 충돌을 만들고 바로 풀어 줘요.</p>`,
      tabs: [{ t: '♭3 → 3 릭 (3프렛에서 4프렛으로 슬라이드)', bpm: 90, swing: true, allow: [0, 3, 4, 7, 10], bars: [
        { c: ['A', 'dom'], n: [[0, 5, 2], [1, 3, 1], [1, 4, 1], [2, 2, 2], [2, 5, 1], [2, 2, 1]] },
        { c: ['A', 'dom'], n: [[1, 3, 1], [1, 4, 1], [0, 5, 2], [-1, 0, 4]] }] }] },
    { h: '같은 음, 코드마다 다른 맛', b: `<p>A 블루스에서 A 마이너 펜타 하나로 세 코드를 다 덮을 수 있어요. 그런데 같은 음도 <b>코드가 바뀌면 역할이 바뀌어요</b>.</p>
      ${table(['', 'A7', 'D7', 'E7'], MPENTA.map(x => { const n = nameOver((9 + x) % 12, 'A'); return [`<b>${n}</b>`, ...['A', 'D', 'E'].map(r => { const s = degOf(parsePc(n), r); return [0, 4, 7, 10].includes(s) ? `<b style="color:var(--ok)">${TNAME[s]}</b>` : TNAME[s]; })]; }))}
      <p>초록 = 그 코드의 코드톤. <b>C는 A7에선 거친 ♯9지만, D7에선 코드톤 ♭7</b>이에요. 그래서 D7로 바뀔 때 C를 길게 치면 딱 맞게 들려요. E7에선 E와 D가 안전해요.</p>` },
    { h: '언제 어떤 펜타토닉을 쓸까', b: `${table(['상황', '쓸 스케일'], [['마이너 곡, 마이너 한 코드 (Am7)', 'A 마이너 펜타'], ['메이저 곡 (C 키 팝)', 'C 메이저 펜타 (= A 마이너 펜타)'], ['블루스 (A7 D7 E7)', 'A 블루스. Ⅰ7에서는 A 메이저 펜타도'], ['maj7 코드 위', '3음에서 시작하는 마이너 펜타'], ['m7 코드 위', '루트에서 시작하는 마이너 펜타']])}
      <p><b>maj7 요령</b>: Cmaj7 위에서 <b>E 마이너 펜타</b>(E G A B D)를 치면 3·5·6·7·9. 피할 음 F가 아예 없어요. Fmaj7이면 A 마이너 펜타예요.</p><p class="note">블루스의 Ⅳ7(D7)에서 A 메이저 펜타의 C♯은 D7의 ♭7(C)과 부딪혀요. Ⅳ7에서는 마이너 펜타로 돌아오세요.</p>`,
      tabs: [{ t: 'Cmaj7 위에서 E 마이너 펜타', bpm: 85, allow: [2, 4, 7, 9, 11], bars: [
        { c: ['C', 'maj7'], n: [[2, 2, 1], [2, 5, 1], [3, 2, 1], [3, 4, 1], [3, 2, 1], [2, 5, 1], [2, 2, 2]] }] }] },
    { h: '첫 즉흥: 음 3개로 말하기', b: `<p>처음부터 다섯 음을 다 쓰면 오르내리기만 하게 돼요. <b>1 · ♭3 · 4 세 음만</b> 쓰세요. 음이 적으면 리듬을 만들 수밖에 없어요.</p><p><b>묻고 답하기(콜 앤 리스폰스)</b>: 1마디 묻고 → 1마디 쉬고 → 1마디 답하고 → 쉬기. <b>답의 끝은 1음</b>으로.</p>`,
      tabs: [{ t: '예시 (1 ♭3 4와 답에서 5 하나)', bpm: 90, swing: true, key: 'A', allow: [0, 3, 5, 7], bars: [
        { c: ['A', 'm7'], n: [[0, 5, 2], [0, 8, 1], [1, 5, 1], [0, 8, 2], [0, 5, 2]] },
        { c: ['A', 'm7'], n: [[-1, 0, 8]] },
        { c: ['A', 'm7'], n: [[0, 5, 2], [0, 8, 1], [1, 5, 1], [1, 7, 2], [1, 5, 1], [0, 8, 1]] },
        { c: ['A', 'm7'], n: [[0, 5, 4], [-1, 0, 4]] }] }],
      loop: { t: 'Am7 한 코드 반주', bpm: 85, swing: false, bars: [[['A', 'm7']], [['A', 'm7']], [['A', 'm7']], [['A', 'm7']]] } },
    { h: '12마디를 이야기로: A A B', b: `<p>블루스 가사는 <b>같은 줄을 두 번 부르고 셋째 줄로 답해요</b>. 솔로도 똑같이 하면 저절로 이야기가 돼요.</p>
      ${table(['마디', '코드', '할 일'], [['1–4', 'A7', '짧은 프레이즈(2마디) + 쉬기(2마디)'], ['5–8', 'D7 → A7', '같은 프레이즈를 다시. 끝음만 바꿔서'], ['9–12', 'E7 D7 A7 E7', '다른 프레이즈로 답하기']])}
      <p>5마디에서 D7로 바뀔 때 <b>C(♭7)나 F♯(3)</b>을 길게 쳐 보세요. 코드가 바뀐 게 들려요.</p>`,
      loop: { t: 'A 블루스 12마디', bpm: 90, swing: true, bars: Ablues } },
    { h: '연습 순서와 다음 단계', b: `<ol class="songs"><li>📱 "펜타토닉 지판" 퀴즈가 바로 나올 때까지</li><li>🎸 Am7 반주에서 <b>3음만</b>으로 5분</li><li>🎸 A 블루스 반주에서 <b>A A B</b>로 3번</li><li>🎸 휴대폰으로 녹음해 듣기. 쉬는 곳이 있나? 끝음이 안정되나?</li></ol>
      <p><b>한계</b>: 코드가 자주 바뀌는 재즈 진행에서는 펜타 하나로 덮으면 <b>진행이 안 들려요</b>. 거기서 필요한 게 8단계, 코드톤과 가이드톤이에요.</p>` },
  ],
});
const PKEYS = ['A', 'E', 'G', 'C', 'D', 'B', 'F♯'];
addQuiz('l7', {
  pentaTap: {
    stage: 7, title: '펜타토닉 지판에서 짚기',
    items: () => [3, 5, 7, 10, 6].map(n => `pt:${n}`),
    make(key) {
      const n = +key.split(':')[1], s = rnd(2), f = 3 + rnd(5), R = bluesRoot(pcAt(s, f)), set = n === 6 ? BLUE : MPENTA;
      return {
        prompt: `R = <b>${R}</b>. ${R} ${n === 6 ? '블루스 스케일' : '마이너 펜타토닉'}의 <b>${DEG[n]}음</b>을 짚어보세요`,
        board: { tap: true, marks: [{ s, f, t: 'R', c: 'root' }] }, tap: true,
        after: { marks: posMarks(R, set, f, f + 3, s).map(m => m.t === DEG[n] ? m : { ...m, c: m.c === 'root' ? 'root' : 'soft' }) },
        correct: v => degOf(pcAt(v.s, v.f), R) === n,
        explain: `${R} 기준 ${DEG[n]}음 = <b>${nameOver((parsePc(R) + n) % 12, R)}</b>. ${shapeText(ivShape(n))}.`,
        play: () => { const r = midiAt(s, f); playSeq([r, r + n]); },
      };
    },
  },
  pentaNot: {
    stage: 7, title: '펜타토닉에 없는 음은?',
    items() { const k = []; PKEYS.forEach(K => ['m', 'M'].forEach(t => k.push(`pn:${K}:${t}`))); return k; },
    make(key) {
      const [, K, t] = key.split(':'), inn = t === 'm' ? [[0, 0], [3, 2], [5, 3], [7, 4], [10, 6]] : [[0, 0], [2, 1], [4, 2], [7, 4], [9, 5]];
      const out = t === 'm' ? [[2, 1], [8, 5]] : [[5, 3], [11, 6]], sp = ([a, b]) => spell(K, a, b), ans = sp(pick(out));
      return {
        prompt: `<b>${K} ${t === 'm' ? '마이너' : '메이저'} 펜타토닉</b>에 <b>없는</b> 음은?`, board: null, after: null,
        choices: opts(ans, inn.map(sp)), correct: v => v === ans,
        explain: `<b>${ans}</b>. ${K} ${t === 'm' ? '마이너 펜타 = 1 ♭3 4 5 ♭7' : '메이저 펜타 = 1 2 3 5 6'} = ${inn.map(sp).join(' ')}.`,
        play: () => { const r = 33 + (parsePc(K) - 9 + 12) % 12; playSeq([...inn.map(x => r + x[0]), r + 12], 0.3); }, wait: 2400,
      };
    },
  },
  pentaOver: {
    stage: 7, title: '이 음은 이 코드의 몇 음?',
    items() { const k = []; MPENTA.forEach(n => [0, 5, 7].forEach(c => k.push(`po:${n}:${c}`))); return k; },
    make(key) {
      const [, n, c] = key.split(':').map(Number), K = pick(['A', 'E', 'G', 'C', 'D']), R = spell(K, c, { 0: 0, 5: 3, 7: 4 }[c]);
      const note = nameOver((parsePc(K) + n) % 12, K), s = degOf(parsePc(note), R), ans = TNAME[s];
      return {
        prompt: `${K} 블루스. <b>${R}7</b> 위에서 <b>${note}</b>는 몇 음?`, board: null, after: null,
        choices: opts(ans, ['1', '3', '5', '♭7', '♯9', '11', '♭13', '9']), correct: v => v === ans,
        explain: `<b>${ans}</b>. ${R}7의 코드톤은 ${chordNotes(R, 'dom').join(' ')}. ${[0, 4, 7, 10].includes(s) ? '코드톤이라 길게 쳐도 안전해요.' : s === 3 ? '3음과 부딪히는 블루스의 맛. 3음으로 풀어 주세요.' : '색칠 음이에요. 코드톤으로 이어 주세요.'}`,
        play: () => { const b = 33 + (parsePc(R) - 9 + 12) % 12; comp(parsePc(R), 'dom', 0, 2.4, 0.1); pluck(b, 0, 0.8); pluck(b + s, 0.9, 1.4); }, wait: 2600,
      };
    },
  },
  degEarP: degEar(7, '키 위에서 몇 음? (블루스 스케일)', 'e3p', 'm', BLUE),
});

/* ═════════ 8단계: 코드톤 솔로 · 가이드톤 ═════════ */
const gtRow = (r, q) => { const t = chordNotes(r, q); return [`<b>${cname(r, q)}</b>`, `${t[1]} <small>(${CH[q].t[1][2]})</small>`, `${t[3]} <small>(${CH[q].t[3][2]})</small>`]; };
const CYCLE = [['A', 'm7'], ['D', 'm7'], ['G', 'dom'], ['C', 'maj7'], ['F', 'maj7'], ['B', 'hd'], ['E', 'dom'], ['A', 'm7']];
LESSONS.push({
  id: 'l8', stage: 8, title: '코드톤 솔로 · 가이드톤', quizzes: [],
  cards: [
    { h: '목표: 반주 없이도 코드가 들리는 솔로', b: `<p>펜타토닉은 <b>키 하나</b>를 따라가요. 코드톤 솔로는 <b>코드 하나하나</b>를 따라가요.</p>
      <p><b>베이스 솔로에서 더 중요한 이유</b>: 기타나 색소폰이 솔로할 때는 베이스가 아래에서 루트를 쳐 줘요. 그런데 <b>베이스가 솔로를 시작하면 루트를 칠 사람이 없어져요</b>. 솔로 라인이 직접 코드를 들려줘야 음악이 무너지지 않아요.</p>
      <p>그래서 목표는 하나. <b>내 라인만 들어도 지금 무슨 코드인지 알 수 있게.</b></p>`,
      tabs: [{ t: '들어보세요: 반주를 빼도 진행이 들리는 라인', bpm: 100, allowCt: true, bars: [
        { c: ['D', 'm7'], n: [[1, 5, 2], [2, 3, 2], [3, 2, 2], [3, 5, 2]] },
        { c: ['G', 'dom'], n: [[3, 4, 2], [2, 5, 2], [2, 3, 2], [1, 5, 2]] },
        { c: ['C', 'maj7'], n: [[2, 2, 2], [2, 5, 2], [3, 4, 2], [2, 5, 2]] },
        { c: ['C', 'maj7'], n: [[2, 2, 8]] }] }] },
    { h: '아르페지오 하나를 네 가지로', b: `<p>1-3-5-7만 반복하면 연습처럼 들려요. 같은 네 음을 <b>방향과 시작점</b>만 바꿔도 멜로디가 돼요.</p>`,
      tabs: [{ t: 'Cmaj7: 올라가기 / 내려오기 / 3음부터 / 지그재그', bpm: 100, allowCt: true, bars: [
        { c: ['C', 'maj7'], n: [[1, 3, 2], [2, 2, 2], [2, 5, 2], [3, 4, 2]] },
        { c: ['C', 'maj7'], n: [[3, 4, 2], [2, 5, 2], [2, 2, 2], [1, 3, 2]] },
        { c: ['C', 'maj7'], n: [[2, 2, 2], [2, 5, 2], [3, 4, 2], [3, 5, 2]] },
        { c: ['C', 'maj7'], n: [[1, 3, 2], [2, 5, 2], [2, 2, 2], [3, 4, 2]] }] }],
      b2: `<p class="note">🎸 네 가지를 Dm7, G7에도 적용해 보세요.</p>` },
    { h: '나쁜 연결 vs 좋은 연결', b: `<p>코드마다 <b>루트로 뛰어 돌아가면</b> 뚝뚝 끊겨요. 앞 코드의 마지막 음에서 <b>가장 가까운 다음 코드톤</b>으로 가면 한 줄로 이어져요.</p>`,
      tabs: [
        { t: '❌ 코드마다 루트부터', bpm: 100, allowCt: true, bars: [
          { c: ['D', 'm7'], n: [[1, 5, 2], [2, 3, 2], [3, 2, 2], [3, 5, 2]] },
          { c: ['G', 'dom'], n: [[0, 3, 2], [1, 2, 2], [1, 5, 2], [2, 3, 2]] },
          { c: ['C', 'maj7'], n: [[1, 3, 2], [2, 2, 2], [2, 5, 2], [3, 4, 2]] }] },
        { t: '✅ 가장 가까운 코드톤으로', bpm: 100, allowCt: true, bars: [
          { c: ['D', 'm7'], n: [[1, 5, 2], [2, 3, 2], [3, 2, 2], [3, 5, 2]] },
          { c: ['G', 'dom'], n: [[3, 4, 2], [2, 5, 2], [2, 3, 2], [1, 5, 2]] },
          { c: ['C', 'maj7'], n: [[2, 2, 2], [1, 3, 2], [2, 2, 2], [2, 5, 2]] }] }],
      b2: `<p>아래쪽은 C→B(반음), D→E(온음)로 이어져요. 큰 도약이 코드가 바뀌는 순간에 없다는 게 차이예요.</p>` },
    { h: '가이드톤 = 3음과 7음', b: `<p>코드의 성격은 <b>3음</b>(밝음/어두움)과 <b>7음</b>(안정/긴장)이 정해요. 5음은 대부분의 코드에 똑같이 있어서 정보가 적고요.</p>
      ${table(['코드', '3음', '7음'], [['D', 'm7'], ['G', 'dom'], ['C', 'maj7']].map(x => gtRow(...x)))}
      <p>이 두 음만 치면 <b>루트 없이도 코드가 들려요</b>. 그리고 ⅱ–Ⅴ–Ⅰ에서는 마법 같은 일이 생겨요.</p><p class="big">Dm7의 C → G7의 B (반음)<br>Dm7의 F → G7의 F (그대로)<br>G7의 F → Cmaj7의 E (반음)<br>G7의 B → Cmaj7의 B (그대로)</p>
      <p><b>앞 코드의 7음은 한 걸음(반음이나 온음) 내려 다음 코드의 3음</b>, <b>앞 코드의 3음은 그대로 다음 코드의 7음</b>. 4도씩 움직이는 진행에서 계속 되풀이돼요.</p>` },
    { h: '가이드톤을 지판에서', b: `<p>D현과 G현, 딱 두 줄에서 끝나요. 한 손 모양이 거의 움직이지 않는 걸 보세요.</p>`,
      boards: [['D', 'm7'], ['G', 'dom'], ['C', 'maj7']].map(([r, q]) => ({ to: 7, marks: posMarks(r, [CH[q].t[1][0], CH[q].t[3][0]], 2, 5, 2, (n, pc) => nameOver(pc, r)).map(m => ({ ...m, c: 'ok' })), cap: cname(r, q) })),
      tabs: [{ t: '두 음씩: 3음 → 7음', bpm: 80, allowCt: true, bars: [
        { c: ['D', 'm7'], n: [[2, 3, 4], [3, 5, 4]] }, { c: ['G', 'dom'], n: [[2, 3, 4], [3, 4, 4]] }, { c: ['C', 'maj7'], n: [[2, 2, 4], [3, 4, 4]] }, { c: ['C', 'maj7'], n: [[2, 2, 8]] }] }] },
    { h: '가이드톤 라인: 한 음씩만', b: `<p>마디마다 <b>한 음만</b> 길게 쳐도 진행이 들려요. 길은 두 개예요.</p>`,
      tabs: [
        { t: '길 ①: C – B – B', bpm: 90, allowCt: true, bars: [{ c: ['D', 'm7'], n: [[3, 5, 8]] }, { c: ['G', 'dom'], n: [[3, 4, 8]] }, { c: ['C', 'maj7'], n: [[3, 4, 8]] }] },
        { t: '길 ②: F – F – E', bpm: 90, allowCt: true, bars: [{ c: ['D', 'm7'], n: [[2, 3, 8]] }, { c: ['G', 'dom'], n: [[2, 3, 8]] }, { c: ['C', 'maj7'], n: [[2, 2, 8]] }] }],
      loop: { t: 'C 키 ⅱ–Ⅴ–Ⅰ', bpm: 90, swing: true, bars: [[['D', 'm7']], [['G', 'dom']], [['C', 'maj7']], [['C', 'maj7']]] },
      b2: `<p>📱 출퇴근: "베이스 루트도 같이"를 켜고, 반주를 들으며 <b>C–B–B와 F–F–E를 속으로 불러 보세요</b>. 부를 수 있으면 칠 수 있어요.</p>` },
    { h: '착지 원칙: 첫 박에 3 또는 7', b: `<p>가장 중요한 규칙 하나예요.</p><p class="big">코드가 바뀌는 첫 박 = 3음 또는 7음</p><p>나머지 박은 코드톤으로 자유롭게. 루트를 첫 박에 쳐도 틀린 건 아니지만, 3이나 7이면 <b>훨씬 선율적</b>으로 들려요.</p><p>생각하는 순서: ① 다음 코드의 3·7음 확인 → ② 지금 손에서 가까운 쪽 고르기 → ③ 거기로 한 음씩 다가가기</p>`,
      tabs: [{ t: '첫 박이 전부 가이드톤인 라인', bpm: 95, allowCt: true, land: true, bars: [
        { c: ['D', 'm7'], n: [[2, 3, 2], [3, 2, 2], [3, 5, 2], [3, 2, 2]] },
        { c: ['G', 'dom'], n: [[3, 4, 2], [2, 5, 2], [1, 5, 2], [2, 3, 2]] },
        { c: ['C', 'maj7'], n: [[2, 2, 2], [1, 3, 2], [2, 5, 2], [2, 2, 2]] },
        { c: ['C', 'maj7'], n: [[3, 4, 8]] }] }] },
    { h: '마이너 ⅱ–Ⅴ–ⅰ', b: `${table(['코드', '3음', '7음'], [['B', 'hd'], ['E', 'dom'], ['A', 'm7']].map(x => gtRow(...x)))}<p>길 ①: <b>A → G♯ → G</b>. 반음씩 두 번 내려가요.<br>길 ②: <b>D → D → C</b>.</p><p>E7의 <b>G♯</b>은 A 자연단음계에 없는 음(하모닉 마이너)이라, 이 음을 짚는 순간 마이너 ⅱ–Ⅴ가 확실히 들려요.</p>`,
      tabs: [{ t: '첫 박: ♭3, 3, ♭3', bpm: 90, allowCt: true, land: true, bars: [
        { c: ['B', 'hd'], n: [[1, 5, 2], [1, 2, 2], [2, 3, 2], [3, 2, 2]] },
        { c: ['E', 'dom'], n: [[3, 1, 2], [2, 2, 2], [1, 5, 2], [1, 2, 2]] },
        { c: ['A', 'm7'], n: [[1, 3, 2], [2, 2, 2], [2, 5, 2], [2, 2, 2]] },
        { c: ['A', 'm7'], n: [[1, 3, 8]] }] }],
      loop: { t: 'A 마이너 ⅱ–Ⅴ–ⅰ', bpm: 90, swing: true, bars: [[['B', 'hd']], [['E', 'dom']], [['A', 'm7']], [['A', 'm7']]] } },
    { h: '블루스에서도: Ⅰ7 → Ⅳ7', b: `${table(['코드', '3음', '7음'], [['A', 'dom'], ['D', 'dom'], ['E', 'dom']].map(x => gtRow(...x)))}<p>A7 → D7: <b>C♯ → C</b>, <b>G → F♯</b>. 둘 다 반음 내려가요. A7 → E7: <b>C♯ → D</b>, <b>G → G♯</b>. 둘 다 반음 올라가요.</p><p>5마디에서 C♯을 C로 바꾸는 것. 이 한 음이 "블루스 코드가 바뀌었다"를 들려줘요.</p>`,
      tabs: [{ t: 'A7 → D7: G에서 F♯으로', bpm: 95, allowCt: true, bars: [
        { c: ['A', 'dom'], n: [[0, 5, 2], [1, 4, 2], [1, 7, 2], [2, 5, 2]] },
        { c: ['D', 'dom'], n: [[2, 4, 2], [2, 7, 2], [3, 5, 2], [2, 7, 2]] },
        { c: ['A', 'dom'], n: [[2, 5, 2], [1, 7, 2], [1, 4, 2], [0, 5, 2]] }] }],
      loop: { t: 'A 블루스', bpm: 95, swing: true, bars: Ablues } },
    { h: '긴 진행도 한 줄로: 5도권 순환', b: `<p>4도씩 도는 진행에서는 <b>3음과 7음이 번갈아 나오면서 계속 내려가요</b>. 8마디가 G현 한 줄로 끝나요.</p>
      ${table(['코드', '3음', '7음'], CYCLE.map(x => gtRow(...x)))}`,
      tabs: [{ t: 'C C B B A A G♯ G', bpm: 100, allowCt: true, land: true, wide: true, bars: [
        { c: ['A', 'm7'], n: [[3, 5, 8]] }, { c: ['D', 'm7'], n: [[3, 5, 8]] }, { c: ['G', 'dom'], n: [[3, 4, 8]] }, { c: ['C', 'maj7'], n: [[3, 4, 8]] },
        { c: ['F', 'maj7'], n: [[3, 2, 8]] }, { c: ['B', 'hd'], n: [[3, 2, 8]] }, { c: ['E', 'dom'], n: [[3, 1, 8]] }, { c: ['A', 'm7'], n: [[3, 0, 8]] }] }],
      loop: { t: '5도권 순환 8마디', bpm: 100, swing: true, bars: CYCLE.map(x => [x]) },
      b2: `<p>재즈 스탠더드에서 정말 자주 나오는 흐름이에요. 이 한 줄을 부를 수 있으면 절반은 온 거예요.</p>` },
    { h: '실전 루틴: 어떤 곡이든 5단계', b: `<ol class="songs"><li><b>루트</b>만: 마디 첫 박에 하나씩</li><li><b>아르페지오</b>: 1-3-5-7, 한 마디에 하나</li><li><b>가이드톤</b>: 한 마디에 한 음, 가까운 길로</li><li><b>착지</b>: 첫 박 3·7음, 나머지는 코드톤</li><li><b>비우기</b>: 2마디 치고 2마디 쉬면서 노래하듯</li></ol><p>한 단계를 <b>반주에서 세 번 연속 막힘없이</b> 하면 다음으로. 6단계의 16마디 연습곡으로 해보세요.</p>`,
      loop: { t: '연습곡 (6단계에서 분석한 곡)', bpm: 100, swing: true, bars: TUNE } },
    { h: '여기까지 하면, 그리고 다음', b: `<p>이제 <b>처음 보는 차트를 보고 틀린 음 없이 진행을 들려주는 솔로</b>를 할 수 있는 재료가 다 있어요. 아직 투박하게 들린다면 정상이에요. 코드톤만 쓰면 계단처럼 들리거든요.</p><p>9단계 <b>접근음과 크로매틱</b>이 그 계단 사이를 이어서 재즈답게 만들어요.</p><p class="note">🎧 지금부터 같이 하면 좋은 것: 좋아하는 베이스 솔로 하나를 골라 <b>4마디만</b> 듣고 따라 치기. 코드가 바뀌는 첫 박에 무슨 음을 쳤는지 확인해 보세요.</p>` },
  ],
});
const gtPairs = {
  ii: ['ⅱ–Ⅴ', K => [[scaleOf(K)[1], 'm7'], [scaleOf(K)[4], 'dom']], MAJ_KEYS], VI: ['Ⅴ–Ⅰ', K => [[scaleOf(K)[4], 'dom'], [K, 'maj7']], MAJ_KEYS],
  mii: ['마이너 ⅱ–Ⅴ', K => [[scaleOf(K, MIN)[1], 'hd'], [scaleOf(K, MIN)[4], 'dom']], ['A', 'E', 'D', 'G', 'C']], mVI: ['마이너 Ⅴ–ⅰ', K => [[scaleOf(K, MIN)[4], 'dom'], [K, 'm7']], ['A', 'E', 'D', 'G', 'C']],
  bl: ['블루스 Ⅰ7–Ⅳ7', K => [[K, 'dom'], [scaleOf(K)[3], 'dom']], ['A', 'C', 'F', 'G', 'B♭']],
};
addQuiz('l8', {
  gt: {
    stage: 8, title: '가이드톤(3·7음) 바로 말하기',
    items() { const k = []; Object.keys(CH).forEach(q => ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'B♭', 'E♭'].filter(R => CH[q].roots.includes(R)).forEach(R => k.push(`gt:${q}:${R}`))); return k; },
    make(key) {
      const [, q, R] = key.split(':'), t = chordNotes(R, q), pair = (a, b) => `${t[a]} · ${t[b]}`, ans = pair(1, 3), p = rootPos(parsePc(R));
      return {
        prompt: `<b>${R}${CH[q].sym}</b>의 가이드톤(3음 · 7음)은?`, board: null,
        after: { marks: chordMarks(p.s, p.f, q, t).map((m, i) => i === 1 || i === 3 ? m : { ...m, c: i ? 'soft' : 'root' }) },
        choices: opts(ans, [pair(0, 2), pair(2, 3), pair(1, 2), pair(0, 3)]), correct: v => v === ans,
        explain: `<b>${ans}</b>. ${R}${CH[q].sym} = ${t.join(' ')} (${CH[q].t.map(x => x[2]).join(' ')}).`,
        play: () => { const r = midiAt(p.s, p.f); comp(parsePc(R), q, 0, 2, 0.1); pluck(r + CH[q].t[1][0], 0.1, 0.7); pluck(r + CH[q].t[3][0], 0.9, 1); }, wait: 2200,
      };
    },
  },
  gtNext: {
    stage: 8, title: '가이드톤 이어가기',
    items() { const k = []; Object.keys(gtPairs).forEach(p => [1, 3].forEach(j => k.push(`gn:${p}:${j}`))); return k; },
    make(key) {
      const [, p, js] = key.split(':'), j = +js, [nm, f, ks] = gtPairs[p], [[r1, q1], [r2, q2]] = f(pick(ks));
      const from = chordNotes(r1, q1)[j], t2 = chordNotes(r2, q2), dist = n => { const d = degOf(parsePc(n), from); return Math.min(d, 12 - d); };
      const ans = dist(t2[1]) < dist(t2[3]) ? t2[1] : t2[3], lab = n => CH[q2].t[t2.indexOf(n)][2], d = dist(ans);
      return {
        prompt: `${nm}. <b>${r1}${CH[q1].sym}</b>의 <b>${from}</b>(${CH[q1].t[j][2]})에서 <b>가장 가까운 다음 가이드톤</b>은?${chartHtml([cname(r1, q1), cname(r2, q2)])}`, board: null, after: null,
        choices: opts(ans, t2), correct: v => v === ans,
        explain: `<b>${ans}</b> (${cname(r2, q2)}의 ${lab(ans)}음). ${d === 0 ? '같은 음을 그대로 유지해요.' : d === 1 ? '반음만 움직여요.' : '온음 움직여요.'} ${cname(r2, q2)}의 가이드톤은 ${t2[1]}, ${t2[3]}.`,
        play: () => { const b1 = 33 + (parsePc(r1) - 9 + 12) % 12, b2 = 33 + (parsePc(r2) - 9 + 12) % 12, m1 = 43 + (parsePc(from) - 7 + 12) % 12; let m2 = 43 + (parsePc(ans) - 7 + 12) % 12; if (m2 - m1 > 6) m2 -= 12; if (m1 - m2 > 6) m2 += 12;
          comp(parsePc(r1), q1, 0, 1.2, 0.08); pluck(b1, 0, 0.35, 0.3); pluck(m1, 0.35, 0.85, 0.5); comp(parsePc(r2), q2, 1.25, 1.4, 0.08); pluck(b2, 1.25, 0.35, 0.3); pluck(m2, 1.6, 1.1, 0.5); }, wait: 3200,
      };
    },
  },
  gtTap: {
    stage: 8, title: '가이드톤 지판에서 짚기',
    items() { const k = []; Object.keys(CH).forEach(q => [1, 3].forEach(j => k.push(`gp:${q}:${j}`))); return k; },
    make(key) {
      const [, q, js] = key.split(':'), j = +js, s = rnd(2), f = 2 + rnd(6), R = rootName(pcAt(s, f), q), t = chordNotes(R, q), pc = parsePc(t[j]);
      return {
        prompt: `<b>${R}${CH[q].sym}</b>의 <b>${CH[q].t[j][2]}음</b>을 짚어보세요`,
        board: { tap: true, marks: [{ s, f, t: 'R', c: 'root' }] }, tap: true, after: { marks: chordMarks(s, f, q, t, j) },
        correct: v => pcAt(v.s, v.f) === pc,
        explain: `${CH[q].t[j][2]}음 = <b>${t[j]}</b>. 루트에서 ${shapeText(ivShape(CH[q].t[j][0]))}.`,
        play: () => { const r = midiAt(s, f); comp(parsePc(R), q, 0, 1.6, 0.1); pluck(r + CH[q].t[j][0], 0.1, 1.3); },
      };
    },
  },
  earCT: {
    stage: 8, title: '귀로 듣기: 코드의 몇 음?', ear: true,
    items() { const k = []; Object.keys(CH).forEach(q => [0, 1, 2, 3].forEach(j => k.push(`ec:${q}:${j}`))); return k; },
    make(key) {
      const [, q, js] = key.split(':'), j = +js, r = 36 + rnd(8), R = rootName(r % 12, q), p = rootPos(r % 12), t = chordNotes(R, q);
      const play = () => { comp(r % 12, q, 0, 3, 0.11); pluck(r, 0, 1, 0.4); pluck(r + CH[q].t[j][0], 1.3, 1.6, 0.5); };
      return {
        prompt: `<b>${R}${CH[q].sym}</b> 위에서 <b>나중에 들린 베이스 음</b>은 몇 음? 🎧`, listen: true, autoplay: true, board: null, after: { marks: chordMarks(p.s, p.f, q, null, j) },
        choices: CH[q].t.map((x, i) => ({ v: i, label: x[2] })), correct: v => v === j,
        explain: `<b>${CH[q].t[j][2]}음</b> (${t[j]}). 먼저 들린 음이 루트 ${R}예요.`, play, wait: 2000,
      };
    },
  },
});
