@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 휠도시 서버 시작
echo ========================================
echo.

echo [1단계] 기존 서버 종료 중...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo [2단계] 서버 시작 중...
echo.
echo ✅ 서버 주소: http://localhost:3000
echo.
echo ⚠️  서버 종료: Ctrl + C
echo ⚠️  이 창을 닫으면 서버가 종료됩니다!
echo.
echo ========================================
echo 서버 로그:
echo ========================================
echo.

cd /d "%~dp0"
node server.js

pause

