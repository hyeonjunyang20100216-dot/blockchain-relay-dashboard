# RelayScan — Blockchain Relay Dashboard

블록체인 중계 네트워크의 상태를 시각화하는 프론트엔드 데모 대시보드입니다.

## Features

- 실시간처럼 동작하는 트랜잭션 중계 피드
- 네트워크별 relay node / throughput / latency 표시
- SVG 기반 relay topology 시각화
- 처리량 그래프 및 1H / 24H / 7D 보기
- 최신 블록 전파 성능 카드
- Relay queue 상태
- Ethereum / Polygon / Arbitrum / Base 네트워크 전환
- 모바일 반응형 UI
- 외부 라이브러리 없이 HTML/CSS/JavaScript만 사용

## Run

별도 빌드 과정이 없습니다.

```bash
python -m http.server 8000
```

브라우저에서 `http://localhost:8000`으로 접속하세요.

또는 `index.html`을 직접 열어도 됩니다.

## Structure

```text
.
├── index.html
├── style.css
├── app.js
└── README.md
```

## Note

현재 데이터는 UI 데모를 위한 시뮬레이션 데이터입니다.
실제 체인 데이터와 연결하려면 `app.js`의 데이터 생성 부분을 RPC/WebSocket/API 호출로 교체하면 됩니다.
