@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 goto fail
where npm.cmd >nul 2>nul
if errorlevel 1 goto fail
if not exist .venv\Scripts\python.exe python -m venv .venv
if errorlevel 1 goto fail
.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
if errorlevel 1 goto fail
call npm.cmd ci --no-audit --no-fund
if errorlevel 1 goto fail
if not exist .env copy .env.example .env >nul
echo Installation complete. Edit .env, then run step 02 and step 03.
pause
exit /b 0
:fail
echo Installation failed. Check Python, Node.js and internet access.
pause
exit /b 1
