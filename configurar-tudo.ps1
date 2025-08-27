# 🎵 SCRIPT COMPLETO DE CONFIGURAÇÃO
# Executa tudo de uma vez sem interrupções

Write-Host "🎵 CONFIGURANDO TUDO DE UMA VEZ..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# 1. Verificar se .env existe
if (Test-Path ".env") {
    Write-Host "✅ Arquivo .env já existe" -ForegroundColor Green
} else {
    Write-Host "📝 Criando arquivo .env..." -ForegroundColor Yellow
    New-Item -Path ".env" -ItemType File -Force | Out-Null
}

# 2. Adicionar todas as configurações de uma vez
Write-Host "🔧 Adicionando configurações..." -ForegroundColor Yellow

$configContent = @"
# 🎵 CONFIGURAÇÃO COMPLETA DO YOUTUBE LIVE SUMMARIZER
# OpenAI API Key - Configure sua chave real aqui
OPENAI_API_KEY=sk-example123456789

# YouTube API Key (opcional)
YOUTUBE_API_KEY=your_youtube_api_key_here

# Configurações de IA
AI_MODEL=gpt-3.5-turbo
AI_MAX_TOKENS=1000

# Configurações de transcrição
TRANSCRIPT_LANGUAGE=pt-BR
TRANSCRIPT_FALLBACK_LANGUAGE=en

# Configurações de áudio
AUDIO_QUALITY=high
AUDIO_FORMAT=mp3
MAX_AUDIO_DURATION=3600

# Configurações do yt-dlp
YTDLP_PATH=yt-dlp
YTDLP_AUDIO_QUALITY=0
YTDLP_AUDIO_FORMAT=mp3

# Configurações do aplicativo
APP_NAME=YouTube Live Summarizer
APP_VERSION=2.0.0
APP_ENV=development
"@

# Escrever todo o conteúdo de uma vez
Set-Content -Path ".env" -Value $configContent -Encoding UTF8

Write-Host "✅ Arquivo .env configurado com sucesso!" -ForegroundColor Green

# 3. Verificar yt-dlp
Write-Host "🔍 Verificando yt-dlp..." -ForegroundColor Yellow
try {
    $ytDlpVersion = yt-dlp --version
    Write-Host "✅ yt-dlp disponível: $ytDlpVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ yt-dlp não encontrado" -ForegroundColor Red
}

# 4. Verificar dependências Node.js
Write-Host "📦 Verificando dependências Node.js..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️ node_modules não encontrado" -ForegroundColor Yellow
}

# 5. Resumo final
Write-Host ""
Write-Host "🎉 CONFIGURAÇÃO COMPLETA!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Edite o arquivo .env" -ForegroundColor White
Write-Host "2. Substitua 'sk-example123456789' pela sua OpenAI API Key real" -ForegroundColor White
Write-Host "3. Obtenha sua chave em: https://platform.openai.com/api-keys" -ForegroundColor White
Write-Host "4. Reinicie o servidor: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Após configurar, o sistema tentará:" -ForegroundColor Cyan
Write-Host "   - Legendas do YouTube (mais rápida)" -ForegroundColor White
Write-Host "   - Extração de áudio + OpenAI Whisper (mais precisa)" -ForegroundColor White
Write-Host "   - Scraping da página (fallback)" -ForegroundColor White
Write-Host ""
Write-Host "✅ Arquivo .env criado e configurado!" -ForegroundColor Green








