@echo off
echo.
echo ========================================
echo   YouTube Live Summarizer - DESKTOP
echo ========================================
echo.
echo Iniciando aplicativo desktop...
echo.

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao esta instalado!
    echo Por favor, instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Verificar se as dependencias estao instaladas
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

REM Verificar se o Electron esta instalado
if not exist "node_modules\electron" (
    echo Instalando Electron...
    npm install electron --save-dev
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao instalar Electron!
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   Iniciando aplicativo desktop...
echo ========================================
echo.
echo O aplicativo sera aberto em uma janela desktop.
echo Para sair, feche a janela ou pressione Ctrl+C.
echo.

REM Iniciar o aplicativo desktop
npm run electron

echo.
echo Aplicativo fechado.
pause
