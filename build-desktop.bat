@echo off
title Construindo YouTube Live Summarizer Desktop
echo ================================================
echo    CONSTRUINDO APLICATIVO DESKTOP COMPLETO
echo ================================================
echo.

REM Verificar Node.js
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Instale o Node.js de https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

REM Instalar dependências
echo.
echo [2/5] Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias!
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas

REM Construir aplicação Next.js
echo.
echo [3/5] Construindo aplicacao Next.js...
npm run build
if %errorlevel% neq 0 (
    echo ERRO: Falha ao construir aplicacao!
    pause
    exit /b 1
)
echo ✅ Aplicacao construida

REM Criar instalador Electron
echo.
echo [4/5] Criando instalador Electron...
npm run electron-pack
if %errorlevel% neq 0 (
    echo ERRO: Falha ao criar instalador!
    pause
    exit /b 1
)
echo ✅ Instalador criado

REM Criar atalho
echo.
echo [5/5] Criando atalho na area de trabalho...
call Criar-Atalho.bat
echo ✅ Atalho criado

echo.
echo ================================================
echo    🎉 CONSTRUCAO CONCLUIDA COM SUCESSO!
echo ================================================
echo.
echo 📁 Arquivos gerados:
echo    - Instalador: dist\YouTube Live Summarizer Setup.exe
echo    - Atalho: %USERPROFILE%\Desktop\YouTube Live Summarizer.lnk
echo.
echo 🚀 Para usar o aplicativo:
echo    1. Execute o instalador em dist\
echo    2. Ou clique duas vezes no atalho na area de trabalho
echo.
echo ✅ Agora voce tem um aplicativo desktop completo!
pause



