# 🚀 YouTube Live Summarizer com Gemini

## ✨ Nova Funcionalidade: API do Gemini

O aplicativo agora suporta a **API do Gemini** como principal serviço de IA para geração de resumos!

### 🔑 Como Configurar

#### 1. Obter Chave da API do Gemini
- Acesse: https://makersuite.google.com/app/apikey
- Faça login com sua conta Google
- Clique em "Create API Key"
- Copie a chave gerada

#### 2. Configurar no Aplicativo
**Opção A: Script Automático**
```bash
# Execute o arquivo batch
CONFIGURAR-GEMINI.bat
```

**Opção B: Manual**
- Abra o arquivo `config.env`
- Adicione sua chave:
```env
GEMINI_API_KEY=sua_chave_aqui
```

### 🤖 Como Funciona

#### Sistema de Fallback Inteligente
1. **🎯 Gemini (Principal)**: Primeira tentativa
2. **🔄 OpenAI (Fallback)**: Se Gemini falhar
3. **💻 Simulação Local**: Como último recurso

#### Vantagens do Gemini
- ✅ **Mais rápido**: Modelo otimizado para resumos
- ✅ **Melhor qualidade**: Especializado em processamento de texto
- ✅ **Custo menor**: Geralmente mais barato que OpenAI
- ✅ **Integração Google**: Funciona perfeitamente com YouTube

### 📝 Exemplo de Uso

```typescript
// O sistema automaticamente tenta Gemini primeiro
const summary = await AIService.generateSummary(transcript, request)

// Se Gemini falhar, tenta OpenAI
// Se ambos falharem, usa simulação local
```

### 🔧 Configurações Disponíveis

#### Modelo Gemini
- **Modelo**: `gemini-1.5-flash` (recomendado)
- **Alternativas**: `gemini-1.5-pro`, `gemini-1.0-pro`

#### Tipos de Resumo
- `brief`: Resumo breve e direto
- `detailed`: Resumo detalhado e completo  
- `key-points`: Apenas pontos-chave principais

#### Idiomas Suportados
- `pt-BR`: Português brasileiro
- `en`: Inglês
- Outros idiomas via OpenAI

### 🧪 Testando

```bash
# Teste básico da configuração
node test-gemini.js

# Teste completo do aplicativo
npm run dev
```

### 📊 Monitoramento

O sistema registra todas as tentativas:
```
🤖 Tentando Gemini...
✅ Gemini funcionou!
```

Ou em caso de falha:
```
❌ Gemini falhou: [erro]
🔄 Tentando OpenAI como fallback...
✅ OpenAI funcionou como fallback!
```

### 🚨 Solução de Problemas

#### Erro: "GEMINI_API_KEY não configurada"
- Verifique se a chave está no arquivo `config.env`
- Execute `CONFIGURAR-GEMINI.bat` novamente

#### Erro: "Falha ao processar resposta do Gemini"
- A resposta não está no formato JSON esperado
- O sistema automaticamente tenta OpenAI como fallback

#### Performance Lenta
- Verifique sua conexão com a internet
- O Gemini pode ter latência variável dependendo da região

### 💡 Dicas de Uso

1. **Sempre configure ambas as APIs** (Gemini + OpenAI) para máxima confiabilidade
2. **Use o modelo `gemini-1.5-flash`** para melhor performance
3. **Monitore os logs** para entender qual API está sendo usada
4. **Teste com vídeos curtos** primeiro para validar a configuração

### 🔄 Atualizações

- **v2.0**: Implementação inicial do Gemini
- **Próximas**: Suporte a mais modelos, configurações avançadas

---

**🎉 Pronto! Agora você tem o poder do Gemini integrado ao seu YouTube Live Summarizer!**
