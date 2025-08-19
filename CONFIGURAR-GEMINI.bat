@echo off
echo ========================================
echo    CONFIGURADOR DA API DO GEMINI
echo ========================================
echo.
echo Este script vai ajudar você a configurar
echo a chave da API do Gemini para o aplicativo.
echo.
echo IMPORTANTE: Você precisa ter uma conta no
echo Google AI Studio e gerar uma chave de API.
echo.
echo Para obter sua chave:
echo 1. Acesse: https://makersuite.google.com/app/apikey
echo 2. Faça login com sua conta Google
echo 3. Clique em "Create API Key"
echo 4. Copie a chave gerada
echo.
pause
echo.
echo Digite sua chave da API do Gemini:
set /p GEMINI_KEY=
echo.
echo Configurando a chave da API...
echo GEMINI_API_KEY=%GEMINI_KEY% >> config.env
echo.
echo ✅ Chave da API do Gemini configurada!
echo.
echo Agora você pode:
echo 1. Executar o aplicativo principal
echo 2. O Gemini será usado como API principal
echo 3. OpenAI será usado como fallback
echo.
pause
