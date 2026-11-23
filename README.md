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
| 3 장음계·단음계·조 | 8 | 디그리(이름/지판), 조표, 나란한조 |
| 4 코드 구성음 | 8 | 코드톤, 아르페지오→코드, 귀로 코드 종류 |
| 5 다이아토닉 코드·로마숫자 | 8 | 로마숫자↔코드, 기능, 진행 보고 키 찾기 |
| 6 코드 진행 읽기 | 9 | ⅱ–Ⅴ–Ⅰ(메이저/마이너), 다음 코드 예측, 12마디 블루스, 귀로 진행 |

전체 커리큘럼은 [claude-project/curriculum.md](claude-project/curriculum.md)에 있습니다.

## Claude 프로젝트 (폰에서 AI에게 질문하기)
1. claude.ai → Projects → Create project
2. Instructions 칸에 [claude-project/instructions.md](claude-project/instructions.md) 내용 붙여넣기
3. Files에 [claude-project/curriculum.md](claude-project/curriculum.md) 업로드
4. 폰 Claude 앱 → 프로젝트에서 질문. 대화가 곧 학습 기록

## 로컬 실행
아무 정적 서버로 폴더를 열면 됩니다. 예: `npx serve .`
