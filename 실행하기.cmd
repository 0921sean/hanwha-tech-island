@echo off
setlocal
cd /d "%~dp0"

if /i "%~1"=="backend" goto backend
if /i "%~1"=="frontend" goto frontend

where node >nul 2>&1
if errorlevel 1 goto missing_node
where npm.cmd >nul 2>&1
if errorlevel 1 goto missing_node

if not exist ".venv\Scripts\python.exe" (
    where py >nul 2>&1
    if not errorlevel 1 (
        py -3 -m venv .venv
    ) else (
        python -m venv .venv
    )
    if errorlevel 1 goto setup_failed
)

".venv\Scripts\python.exe" -c "import fastapi, uvicorn, httpx, dotenv" >nul 2>&1
if errorlevel 1 (
    echo Installing backend packages...
    ".venv\Scripts\python.exe" -m pip install -r backend\requirements.txt
    if errorlevel 1 goto setup_failed
)

if not exist "node_modules\.bin\vite.cmd" goto install_frontend
if not exist "node_modules\three\package.json" goto install_frontend
goto frontend_ready

:install_frontend
echo Installing frontend packages...
call npm.cmd ci --no-audit --no-fund
if errorlevel 1 goto setup_failed

:frontend_ready
if not exist ".env" (
    copy /y ".env.example" ".env" >nul
    if errorlevel 1 goto setup_failed
    echo Created .env. Add a server API key there to enable AI answers.
)

start "Hanwha API" cmd /k ""%~f0" backend"
start "Hanwha Game" cmd /k ""%~f0" frontend"
echo API:  http://127.0.0.1:8000/api/health
echo Game: http://127.0.0.1:5173
exit /b 0

:backend
".venv\Scripts\python.exe" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --env-file ".env"
exit /b %errorlevel%

:frontend
call npm.cmd run dev -- --open
exit /b %errorlevel%

:missing_node
echo [ERROR] Node.js and npm are required. Install Node.js 20.19+ or 22.12+.
exit /b 1

:setup_failed
echo [ERROR] Setup failed. Check the message above and run this file again.
exit /b 1
