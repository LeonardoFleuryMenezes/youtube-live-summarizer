@echo off
echo 🎵 CONFIGURANDO OPENAI API KEY
echo ================================

echo.
echo 📝 Criando arquivo .env...

echo # Configuração OpenAI > .env
echo OPENAI_API_KEY=sk-example123456789 >> .env
echo YOUTUBE_API_KEY=your_youtube_api_key_here >> .env
echo AI_MODEL=gpt-3.5-turbo >> .env
echo AI_MAX_TOKENS=1000 >> .env

echo.
echo ✅ Arquivo .env criado!
echo.
echo 📋 PRÓXIMOS PASSOS:
echo 1. Edite o arquivo .env
echo 2. Substitua "sk-example123456789" pela sua chave real
echo 3. Obtenha sua chave em: https://platform.openai.com/api-keys
echo 4. Reinicie o servidor
echo.
echo 🚀 Após configurar, o sistema tentará transcrição via áudio!
echo.
pause


