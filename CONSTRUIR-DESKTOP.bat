@echo off
echo.
echo ========================================
echo   CONSTRUINDO APLICATIVO DESKTOP
echo ========================================
echo.
echo Este processo ira:
echo 1. Construir a aplicacao Next.js
echo 2. Empacotar com Electron
echo 3. Criar instalador executavel
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

echo.
echo ========================================
echo   Passo 1: Construindo Next.js...
echo ========================================
echo.

REM Construir a aplicacao Next.js
npm run build
if %errorlevel% neq 0 (
    echo ERRO: Falha ao construir Next.js!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Passo 2: Empacotando com Electron...
echo ========================================
echo.

REM Empacotar com Electron
npm run dist
if %errorlevel% neq 0 (
    echo ERRO: Falha ao empacotar com Electron!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   CONSTRUCAO CONCLUIDA!
echo ========================================
echo.
echo O aplicativo desktop foi criado com sucesso!
echo.
echo Arquivos gerados:
echo - Instalador Windows: dist\YouTube Live Summarizer Setup.exe
echo - Aplicativo portatil: dist\win-unpacked\YouTube Live Summarizer.exe
echo.
echo Para instalar, execute o arquivo .exe na pasta dist
echo Para usar portatil, execute o .exe na pasta win-unpacked
echo.

pause
