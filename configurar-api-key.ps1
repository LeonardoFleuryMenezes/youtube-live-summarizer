# 🚀 SCRIPT PARA CONFIGURAR OPENAI API KEY
Write-Host "🚀 CONFIGURANDO OPENAI API KEY..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Solicitar a API Key do usuário
Write-Host ""
Write-Host "📝 Digite sua OpenAI API Key (começa com sk-):" -ForegroundColor Yellow
$apiKey = Read-Host "API Key"

# Validar se a chave começa com sk-
if ($apiKey -notmatch "^sk-") {
    Write-Host "❌ ERRO: A API Key deve começar com 'sk-'" -ForegroundColor Red
    Write-Host "Exemplo: sk-1234567890abcdefghijklmnopqrstuvwxyz" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔧 Atualizando arquivo .env..." -ForegroundColor Yellow

# Ler o arquivo .env atual
$envContent = Get-Content ".env"

# Substituir a linha da API Key
$newContent = $envContent -replace "OPENAI_API_KEY=.*", "OPENAI_API_KEY=$apiKey"

# Escrever o arquivo atualizado
Set-Content -Path ".env" -Value $newContent -Encoding UTF8

Write-Host "✅ API Key configurada com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Reinicie o servidor: npm run dev" -ForegroundColor White
Write-Host "2. Teste com um vídeo do YouTube" -ForegroundColor White
Write-Host "3. O sistema tentará transcrição via áudio!" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Configuração completa!" -ForegroundColor Green


