# Render 한 곳에 게임과 API 배포

`render.yaml`은 Docker로 Vite 화면을 빌드하고 FastAPI가 화면과 API를
같은 주소에서 제공하도록 설정한다. Cloudflare Pages는 필요하지 않다.

1. 이 저장소의 변경 사항을 GitHub `main` 브랜치에 푸시한다.
2. Render 대시보드에서 **New → Blueprint**를 선택해 저장소를 연결한다.
   루트의 `render.yaml`을 사용하고 브랜치는 `main`으로 지정한다.
3. 로컬 `.env`에서 사용 중인 `GEMINI_API_KEY`, `GEMINI_MODEL` 값을
   Render 입력 화면에 각각 넣는다. 키를 GitHub 또는 대화창에 붙여넣지 않는다.
4. **Deploy Blueprint** 후 `https://...onrender.com/api/health`에서
   `{"mode":"llm"}`을 확인한다.
5. 같은 주소의 `/`에서 게임을 열고 AI 질문을 보내 답변을 확인한다.

Render 무료 서버는 요청이 없으면 잠들 수 있어 첫 접속에 시간이 걸릴 수 있다.
현재 `DAILY_API_CALL_LIMIT`은 프로세스 메모리 기준이라 재시작 시 초기화된다.
공개 서비스의 API 비용을 확실히 제한하려면 Gemini 계정의 사용량·예산 한도와
서버 측 인증 또는 지속 저장소를 쓰는 호출 제한이 필요하다.
