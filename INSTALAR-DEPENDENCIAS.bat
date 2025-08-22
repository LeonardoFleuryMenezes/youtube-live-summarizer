@echo off
echo 🎵 INSTALANDO DEPENDÊNCIAS PARA TRANSCRIÇÃO DE ÁUDIO
echo =====================================================

echo.
echo 📦 Instalando dependências Node.js...
npm install yt-dlp-exec fluent-ffmpeg

echo.
echo 🐍 Instalando yt-dlp via pip...
pip install yt-dlp

echo.
echo 🤖 Instalando OpenAI (se não estiver instalado)...
npm install openai

echo.
echo ✅ Dependências instaladas!
echo.
echo 📋 PRÓXIMOS PASSOS:
echo 1. Configure sua OPENAI_API_KEY no arquivo .env
echo 2. Opcional: Configure ASSEMBLYAI_API_KEY para fallback
echo 3. Teste o aplicativo com um vídeo do YouTube
echo.
echo 🎯 O sistema agora tentará:
echo    - Legendas do YouTube (mais rápida)
echo    - Extração de áudio + IA (mais precisa)
echo    - Scraping da página (fallback)
echo.
pause


