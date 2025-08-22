# 🔑 CONFIGURAÇÃO DE API KEYS - YouTube Live Summarizer

## 🚀 **Como Configurar suas API Keys para IA Real**

### 1. **OpenAI API (Recomendado - Mais Poderosa)**
- **Acesse:** https://platform.openai.com/api-keys
- **Faça login** ou crie uma conta
- **Clique em:** "Create new secret key"
- **Copie a chave** gerada (começa com `sk-...`)
- **Edite o arquivo:** `electron/main.js`
- **Localize a linha:** `OPENAI_API_KEY: 'your_openai_api_key_here'`
- **Substitua por:** `OPENAI_API_KEY: 'sk-...'` (sua chave real)

### 2. **Google Gemini API (Alternativa - Gratuita)**
- **Acesse:** https://makersuite.google.com/app/apikey
- **Faça login** com sua conta Google
- **Clique em:** "Create API Key"
- **Copie a chave** gerada (começa com `AIza...`)
- **Edite o arquivo:** `electron/main.js`
- **Localize a linha:** `GEMINI_API_KEY: 'your_gemini_api_key_here'`
- **Substitua por:** `GEMINI_API_KEY: 'AIza...'` (sua chave real)

### 3. **YouTube API (Opcional - Para informações reais do vídeo)**
- **Acesse:** https://console.cloud.google.com/apis/credentials
- **Crie um projeto** ou selecione um existente
- **Ative a API:** "YouTube Data API v3"
- **Crie credenciais:** "API Key"
- **Copie a chave** gerada
- **Edite o arquivo:** `electron/main.js`
- **Localize a linha:** `YOUTUBE_API_KEY: 'your_youtube_api_key_here'`
- **Substitua por:** `YOUTUBE_API_KEY: '...'` (sua chave real)

## 📝 **Exemplo de Configuração:**

```javascript
const API_CONFIG = {
  OPENAI_API_KEY: 'sk-1234567890abcdef...', // Sua chave OpenAI real
  GEMINI_API_KEY: 'AIzaSy1234567890abcdef...', // Sua chave Gemini real
  YOUTUBE_API_KEY: 'AIzaSy1234567890abcdef...' // Sua chave YouTube real
};
```

## ⚠️ **IMPORTANTE:**

1. **NUNCA compartilhe** suas API keys
2. **NUNCA commite** as chaves no Git
3. **Configure pelo menos uma** das chaves de IA (OpenAI OU Gemini)
4. **Reinicie a aplicação** após configurar as chaves

## 🧪 **Teste:**

1. Configure suas API keys
2. Reinicie o Electron: `npm run electron`
3. Insira uma URL do YouTube
4. Clique em "Gerar Resumo"
5. A IA real deve processar e gerar um resumo!

## 💰 **Custos:**

- **OpenAI:** ~$0.002 por 1K tokens (muito barato)
- **Gemini:** Gratuito (com limites)
- **YouTube:** Gratuito (com limites)

## 🆘 **Problemas Comuns:**

- **Erro 401:** API key inválida
- **Erro 429:** Limite de requisições atingido
- **Erro 500:** Problema temporário da API

---

**🎯 Configure suas chaves e teste a IA real!**
