# Cloudflare Pages + Render 배포

이 프로젝트는 Vite 화면을 Cloudflare Pages에, FastAPI를 Render에 배포한다.
`실행하기.cmd`는 로컬 실행용이며 배포 서버에서는 사용하지 않는다.

## 1. GitHub

프로젝트 루트를 GitHub 저장소에 올린다. `.env`, `.venv/`, `node_modules/`,
`dist/`는 `.gitignore`에 따라 제외한다. API 키를 저장소에 넣지 않는다.

## 2. Render API

Render에서 GitHub 저장소를 연결하고 `render.yaml`로 Blueprint를 생성한다.
무료 인스턴스와 Singapore 리전, 빌드·실행·상태 확인 명령은 파일에 정의돼 있다.
생성 과정에서 다음 값을 Render 환경 변수로 입력한다.

| 변수 | 값 |
| --- | --- |
| `GEMINI_API_KEY` | 로컬 `.env`에서 사용 중인 실제 키 |
| `GEMINI_MODEL` | 로컬 `.env`에서 사용 중인 모델 ID |

Pages 주소가 정해지기 전에는 API가 기본 로컬 출처만 허용한다.

Render 주소가 정해지면 `https://...onrender.com/api/health`에서
`{"mode":"llm"}`을 확인한다. 이 결과는 키가 읽혔다는 뜻이며,
실제 모델 호출 성공은 배포된 화면에서 질문해 확인한다.

## 3. Cloudflare Pages 화면

같은 GitHub 저장소를 Cloudflare Pages에 연결한다.

| 설정 | 값 |
| --- | --- |
| Framework preset | React (Vite) |
| Root directory | 저장소 루트 |
| Build command | `npm run build` |
| Build output directory | `dist` |
| `VITE_API_BASE_URL` | Render API 주소, 예: `https://...onrender.com` |

`VITE_API_BASE_URL`은 빌드 시 화면 코드에 들어가는 공개 주소다.
`GEMINI_API_KEY`는 Cloudflare나 `VITE_` 변수에 넣지 않는다.

Pages 주소가 발급되면 Render의 `CORS_ORIGINS`를 해당 주소(예:
`https://프로젝트.pages.dev`)로 설정하고
API를 재배포한다. 커스텀 도메인을 쓰면 그 출처도 쉼표로 추가한다.

## 4. 확인과 운영

배포된 Pages 주소에서 게임을 열고 AI 질문을 보낸다.
Render 무료 서버는 한동안 요청이 없으면 잠들 수 있다. 재시작에 걸리는
시간 때문에 첫 질문은 최대 2분간 대기할 수 있다. 그래도 실패하면 다시
시도하거나 유료 인스턴스로 변경해야 한다.

현재 `DAILY_API_CALL_LIMIT`은 프로세스 메모리 기준이며 재시작과 복수
인스턴스에서 확실한 비용 제한이 아니다. 공개 사이트라면 공급자 계정의
사용 한도와 API 인증 또는 지속 저장소를 쓰는 사용량 제한을 별도로 설정한다.
