@echo off
title YouTube Live Summarizer
echo Iniciando YouTube Live Summarizer...
echo.

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js de https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

REM Construir a aplicação se necessário
if not exist "out" (
    echo Construindo aplicacao...
    npm run build
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao construir aplicacao!
        pause
        exit /b 1
    )
)

echo Iniciando aplicacao Electron...
npm run electron

echo.
echo Aplicacao fechada.
pause



