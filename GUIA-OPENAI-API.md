# 🚀 GUIA COMPLETO PARA CONFIGURAR OPENAI API KEY

## 🎯 **O QUE VOCÊ PRECISA FAZER:**

### **PASSO 1: Obter sua OpenAI API Key**
1. Acesse: https://platform.openai.com/api-keys
2. Faça login na sua conta OpenAI (ou crie uma)
3. Clique em **"Create new secret key"**
4. Dê um nome para sua chave (ex: "YouTube Summarizer")
5. **Copie a chave** (começa com `sk-...`)

### **PASSO 2: Configurar no arquivo .env**
1. Abra o arquivo `.env` na raiz do projeto
2. Substitua a linha:
   ```
   OPENAI_API_KEY=sk-example123456789
   ```
   Por:
   ```
   OPENAI_API_KEY=sua_chave_real_aqui
   ```

### **PASSO 3: Reiniciar o servidor**
1. Pare o servidor atual (Ctrl+C)
2. Execute: `npm run dev`

## 🔑 **EXEMPLO DE ARQUIVO .ENV CORRETO:**

```
# 🎵 CONFIGURAÇÃO COMPLETA DO YOUTUBE LIVE SUMMARIZER
OPENAI_API_KEY=sk-1234567890abcdefghijklmnopqrstuvwxyz
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
```

## ⚠️ **IMPORTANTE:**

- **NUNCA compartilhe** sua API Key
- **NUNCA comite** o arquivo .env no Git
- A chave começa com `sk-` seguida de caracteres alfanuméricos
- Cada chave tem um limite de uso (verifique em https://platform.openai.com/usage)

## 🎉 **APÓS CONFIGURAR:**

O sistema tentará automaticamente:
1. **Legendas do YouTube** (mais rápida)
2. **Extração de áudio + OpenAI Whisper** (mais precisa) ⭐
3. **Scraping da página** (fallback)

## 🆘 **PROBLEMAS COMUNS:**

**Erro: "OpenAI API Key não configurada"**
- Verifique se o arquivo .env existe
- Verifique se a chave está correta

**Erro: "Insufficient quota"**
- Verifique seu saldo em https://platform.openai.com/usage
- Adicione créditos se necessário

**Erro: "Invalid API key"**
- Verifique se a chave está correta
- Verifique se não há espaços extras

---

**🚀 Após configurar, teste com qualquer vídeo do YouTube!**



