@echo off
title FORÇANDO ATUALIZAÇÃO - YouTube Live Summarizer
echo ================================================
echo    FORÇANDO ATUALIZACAO DO APLICATIVO
echo ================================================
echo.

echo 🔄 Forçando reconstrução completa...
echo.

REM Parar qualquer processo Electron em execução
taskkill /f /im electron.exe >nul 2>&1
echo ✅ Processos Electron parados

REM Limpar cache
echo 🧹 Limpando cache...
if exist ".next" rmdir /s /q ".next"
if exist "out" rmdir /s /q "out"
echo ✅ Cache limpo

REM Reinstalar dependências
echo 📦 Reinstalando dependencias...
npm install
echo ✅ Dependencias reinstaladas

REM Reconstruir aplicação
echo 🔨 Reconstruindo aplicacao...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Erro ao construir aplicacao
    pause
    exit /b 1
)
echo ✅ Aplicacao reconstruida

REM Criar ícone ICO novamente
echo 🎨 Recriando icone ICO...
node criar-icone-real.js
echo ✅ Icone ICO recriado

echo.
echo ================================================
echo    ✅ ATUALIZACAO FORÇADA CONCLUIDA!
echo ================================================
echo.
echo 🚀 Iniciando aplicativo atualizado...
echo 💡 Agora deve funcionar com URLs reais do YouTube!
echo.

REM Iniciar aplicativo
npm run electron

echo.
echo ✅ Aplicativo fechado.
echo.
pause



