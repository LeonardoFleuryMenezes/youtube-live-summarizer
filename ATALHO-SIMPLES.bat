@echo off
title YouTube Live Summarizer - Atalho Simples
echo ================================================
echo    YOUTUBE LIVE SUMMARIZER - ATALHO SIMPLES
echo ================================================
echo.

echo 🎯 Iniciando aplicativo...
echo.

REM Navegar para a pasta do projeto
cd /d "C:\youtube-live-summarizer"

REM Verificar se chegamos na pasta correta
if not exist "package.json" (
    echo ❌ ERRO: Nao foi possivel encontrar o projeto
    echo.
    echo 📁 Pasta atual: %CD%
    echo 📁 Pasta esperada: C:\youtube-live-summarizer
    echo.
    pause
    exit /b 1
)

echo ✅ Pasta do projeto encontrada
echo.

REM Iniciar o aplicativo
echo 🚀 Iniciando YouTube Live Summarizer...
echo 💡 Uma nova janela deve abrir com o aplicativo
echo.

npm run electron

echo.
echo ✅ Aplicativo fechado.
echo.
pause



