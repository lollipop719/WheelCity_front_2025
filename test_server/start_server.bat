@echo off
echo ========================================
echo 휠도시 서버 시작 중...
echo ========================================
echo.

REM 기존 프로세스 종료
taskkill /F /IM node.exe /T 2>nul

REM 서버 시작
echo 서버 시작: http://localhost:3000
echo 종료하려면 Ctrl+C를 누르세요
echo.
node server.js

