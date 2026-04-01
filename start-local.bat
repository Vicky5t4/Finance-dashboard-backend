@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)
if not exist .env (
  copy .env.example .env >nul
)
echo Starting Finance Dashboard Backend...
call npm run dev
