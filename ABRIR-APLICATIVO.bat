@echo off
title YouTube Live Summarizer
echo ================================================
echo    INICIANDO YOUTUBE LIVE SUMMARIZER
echo ================================================
echo.

echo 🚀 Iniciando aplicativo...
echo.

REM Verificar se estamos na pasta correta
if not exist "package.json" (
    echo ❌ ERRO: Execute este arquivo na pasta do projeto
    echo.
    echo 📁 Pasta atual: %CD%
    echo 📁 Pasta correta: C:\youtube-live-summarizer
    echo.
    pause
    exit /b 1
)

REM Verificar se o aplicativo está construído
if not exist "out" (
    echo 🔨 Construindo aplicacao...
    npm run build
    if %errorlevel% neq 0 (
        echo ❌ Erro ao construir aplicacao
        pause
        exit /b 1
    )
    echo ✅ Aplicacao construida
)

REM Verificar se o Electron está instalado
if not exist "node_modules\electron" (
    echo 📦 Instalando Electron...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependencias
        pause
        exit /b 1
    )
    echo ✅ Electron instalado
)

echo.
echo 🎯 Iniciando YouTube Live Summarizer...
echo 💡 Uma nova janela deve abrir com o aplicativo
echo.

REM Iniciar o aplicativo
npm run electron

echo.
echo ✅ Aplicativo fechado.
echo.
pause



