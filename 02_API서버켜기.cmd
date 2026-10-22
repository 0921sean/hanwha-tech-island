@echo off
cd /d "%~dp0"
if not exist .venv\Scripts\python.exe (
 echo Run step 01 first.
 pause
 exit /b 1
)
if not exist .env (
 echo Create .env from .env.example and enter your API key.
 pause
 exit /b 1
)
echo Keep this window open. API: http://127.0.0.1:8000/api/health
.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --env-file .env
pause
