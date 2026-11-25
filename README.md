# 화성학 스터디 · 베이스

출퇴근길 폰으로 하는, 베이스 즉흥연주를 위한 화성학 공부 앱. 음 이름은 ABC 표기.
목표: 처음 보는 코드 차트를 보고 코드톤과 스케일로 솔로하기.

- 앱: https://kyun00221166.github.io/harmony-study/
- 서버 없음: 정적 파일만 (GitHub Pages)
- 오프라인 동작 (Service Worker). 홈 화면에 추가하면 앱처럼 실행
- 진도는 폰 브라우저 localStorage에 저장

## 지금 들어 있는 것
| 단계 | 개념 카드 | 퀴즈 |
|---|---|---|
| 1 음 이름과 지판 | 8 | 지판→이름, 이름→지판, 반음·온음 |
| 2 음정 | 8 | 지판 모양, 귀로 듣기 |
| 3 장음계·단음계·조 | 15 | 디그리(이름/지판), 조표, 나란한조, 마이너 3종, 귀로 디그리(E3) |
| 4 코드 구성음 | 15 | 코드톤, 아르페지오→코드, 코드 기호, 텐션, 귀로 코드 종류 |
| 5 다이아토닉 코드·로마숫자 | 12 | 로마숫자↔코드, 기능, 키 찾기, 대리코드, 피할 음 |
| 6 코드 진행 읽기 | 14 | ⅱ–Ⅴ–Ⅰ, 다음 코드 예측, 블루스, 코드 정체, 트라이톤 대리, 전조, 귀로 진행 |
| 7 펜타토닉·블루스 | 10 | 지판에서 짚기, 없는 음, 코드 위의 역할, 귀로 블루스 디그리 |
| 8 코드톤 솔로·가이드톤 | 12 | 가이드톤 말하기·이어가기·짚기, 귀로 코드톤 |

카드에는 TAB(음 이름·디그리 포함, 듣기/느리게)과 반주 루프(템포 조절)가 들어 있습니다. 코드는 `app.js`(기능, 1~6단계 기본)와 `theory.js`(보강 카드, 7·8단계)로 나뉩니다.

전체 커리큘럼은 [claude-project/curriculum.md](claude-project/curriculum.md)에 있습니다.

## 난이도 조절과 기록 (`adapt.js`)
전부 폰 안에서 계산하고 어디로도 보내지 않습니다.
- 시작 진단(6~18문제)으로 시작 단계를 정하고, 정답률과 속도로 계속 조정
- 오늘의 5분: 약점, 지금 단계, 잊을 때쯤 복습(1·3·7·14일)을 섞고, 막히면 바탕 문제로, 잘하면 위로
- 내 기록: 약한 개념, 자주 틀린 문제, Claude에 붙일 기록 복사, 백업·복원

## Claude 프로젝트 (폰에서 AI에게 질문하기)
1. claude.ai → Projects → Create project
2. Instructions 칸에 [claude-project/instructions.md](claude-project/instructions.md) 내용 붙여넣기
3. Files에 [claude-project/curriculum.md](claude-project/curriculum.md) 업로드
4. 폰 Claude 앱 → 프로젝트에서 질문. 대화가 곧 학습 기록

## 소리 출처
베이스 샘플(`samples/bass/`): FluidR3_GM 일렉 베이스(핑거), Frank Wen, [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/us/). [gleitz/midi-js-soundfonts](https://github.com/gleitz/midi-js-soundfonts)에서 받음. 재생할 때 음높이와 길이를 조정합니다.

## 로컬 실행
아무 정적 서버로 폴더를 열면 됩니다. 예: `npx serve .`
