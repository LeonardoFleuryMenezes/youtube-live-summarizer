@echo off
title Teste Rápido - YouTube Live Summarizer
echo ================================================
echo    TESTANDO APLICATIVO DESKTOP
echo ================================================
echo.

REM Verificar se o aplicativo está construído
if not exist "out" (
    echo [1/3] Construindo aplicacao...
    npm run build
    if %errorlevel% neq 0 (
        echo ❌ Erro ao construir aplicacao
        pause
        exit /b 1
    )
    echo ✅ Aplicacao construida
) else (
    echo ✅ Aplicacao ja construida
)

REM Verificar se o Electron esta instalado
if not exist "node_modules\electron" (
    echo [2/3] Instalando Electron...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependencias
        pause
        exit /b 1
    )
    echo ✅ Electron instalado
) else (
    echo ✅ Electron ja instalado
)

REM Testar o aplicativo
echo.
echo [3/3] Testando aplicativo...
echo 🚀 Iniciando YouTube Live Summarizer...
echo.
echo 💡 DICA: O aplicativo deve abrir em uma nova janela
echo    Se nao abrir, verifique se ha erros no terminal
echo.
npm run electron

echo.
echo ✅ Teste concluido!
echo.
echo 📝 RESULTADO:
echo    - Aplicativo deve ter aberto em uma nova janela
echo    - Interface deve mostrar campos para URL do YouTube
echo    - Deve permitir selecionar tipo de resumo
echo    - Deve ter o icone personalizado na janela
echo.
pause



