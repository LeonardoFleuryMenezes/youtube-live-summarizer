# 🎵 SCRIPT SIMPLES DE CONFIGURAÇÃO
Write-Host "🎵 CONFIGURANDO ARQUIVO .ENV..." -ForegroundColor Green

# Criar arquivo .env com todas as configurações
$configContent = @"
# 🎵 CONFIGURAÇÃO COMPLETA DO YOUTUBE LIVE SUMMARIZER
OPENAI_API_KEY=sk-example123456789
YOUTUBE_API_KEY=your_youtube_api_key_here
AI_MODEL=gpt-3.5-turbo
AI_MAX_TOKENS=1000
TRANSCRIPT_LANGUAGE=pt-BR
TRANSCRIPT_FALLBACK_LANGUAGE=en
AUDIO_QUALITY=high
AUDIO_FORMAT=mp3
MAX_AUDIO_DURATION=3600
YTDLP_PATH=yt-dlp
YTDLP_AUDIO_QUALITY=0
YTDLP_AUDIO_FORMAT=mp3
APP_NAME=YouTube Live Summarizer
APP_VERSION=2.0.0
APP_ENV=development
"@

# Escrever arquivo
Set-Content -Path ".env" -Value $configContent -Encoding UTF8

Write-Host "✅ Arquivo .env criado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Edite o arquivo .env" -ForegroundColor White
Write-Host "2. Substitua 'sk-example123456789' pela sua OpenAI API Key real" -ForegroundColor White
Write-Host "3. Obtenha sua chave em: https://platform.openai.com/api-keys" -ForegroundColor White
Write-Host "4. Reinicie o servidor: npm run dev" -ForegroundColor White



