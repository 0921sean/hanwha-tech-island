@echo off
cd /d "%~dp0"
if not exist node_modules\vite\bin\vite.js (
 echo Run step 01 first.
 pause
 exit /b 1
)
echo Keep the API server and this window open.
call npm.cmd run dev -- --open
pause
