# 🔧 CONFIGURAÇÃO DA API DO YOUTUBE

## ❌ PROBLEMAS ATUAIS

### 1. Erro 403 Forbidden (Referer bloqueado)
```
"Requests from referer <empty> are blocked."
```

### 2. Erro 401 Unauthorized (API não autorizada)
```
"API não autorizada. Verifique se a chave está correta e as APIs estão habilitadas."
```

## ✅ SOLUÇÕES IMPLEMENTADAS

### Solução 1: Sistema de Fallbacks Inteligentes
O sistema agora usa múltiplas estratégias em ordem de prioridade:
1. **API oficial do YouTube** (com headers otimizados)
2. **oEmbed do YouTube** (fallback para informações básicas)
3. **ytdl-core atualizado** (para legendas)
4. **OpenAI Whisper** (transcrição de áudio)
5. **Scraping inteligente** (último recurso)

### Solução 2: Headers Otimizados
- Headers simplificados para evitar problemas de CORS
- Timeout aumentado para 15 segundos
- Logs detalhados para debug

## 📋 PASSOS PARA CONFIGURAR A API OFICIAL

### 1. Acessar Google Cloud Console
- Vá para: https://console.cloud.google.com/
- Faça login com sua conta Google

### 2. Verificar APIs Habilitadas
- No menu lateral, clique em **"APIs & Services"** > **"Library"**
- Procure por **"YouTube Data API v3"**
- Se não estiver habilitada, clique em **"Enable"**

### 3. Configurar Credentials
- Vá para **"APIs & Services"** > **"Credentials"**
- Encontre sua chave: `SUA_CHAVE_YOUTUBE_AQUI`
- Clique no **ícone de edição (lápis)**

### 4. Configurar Application Restrictions
- Em **"Application restrictions"**, selecione **"HTTP referrers (web sites)"**
- Clique em **"ADD AN ITEM"** e adicione:

```
localhost:3000/*
localhost:3001/*
127.0.0.1:3000/*
127.0.0.1:3001/*
localhost/*
127.0.0.1/*
```

### 5. Configurar API Restrictions
- Em **"API restrictions"**, selecione **"Restrict key"**
- Escolha **"YouTube Data API v3"**
- Clique em **"Save"**

## 🧪 TESTAR A CONFIGURAÇÃO

### Teste 1: Verificar se a API está funcionando
```bash
# O sistema testará automaticamente e mostrará:
✅ API funcionou! Dados obtidos para: [Título do Vídeo]
```

### Teste 2: Verificar fallbacks
Se a API falhar, você verá:
```
⚠️ API oficial falhou, tentando alternativas
✅ oEmbed funcionou: [Título do Vídeo]
```

## 🔍 VERIFICAÇÃO DE STATUS

### ✅ API Funcionando
```
🔑 Tentando API oficial do YouTube com headers corretos...
✅ API funcionou! Dados obtidos para: [Título]
```

### ⚠️ API com Problemas (mas fallbacks funcionando)
```
⚠️ API oficial falhou, tentando alternativas
✅ oEmbed funcionou: [Título]
✅ Transcrição obtida via oEmbed
```

### ❌ Todos os métodos falharam
```
❌ Todas as estratégias falharam
📝 Gerando mensagem informativa
```

## 🆘 ALTERNATIVAS AUTOMÁTICAS

Mesmo se a API oficial falhar, o sistema continuará funcionando:

1. **oEmbed**: Informações básicas do vídeo
2. **ytdl-core**: Legendas disponíveis
3. **OpenAI Whisper**: Transcrição de áudio
4. **Scraping**: Análise da página

## 📞 SUPORTE

### Para problemas com a API:
- [Google Cloud Console Help](https://cloud.google.com/apis/docs/overview)
- [YouTube Data API v3 Documentation](https://developers.google.com/youtube/v3)

### Para problemas com o sistema:
- Verifique os logs no terminal
- Teste com diferentes vídeos
- Verifique se as dependências estão atualizadas

---

**Nota**: O sistema agora é muito mais robusto e funcionará mesmo com problemas na API oficial!
