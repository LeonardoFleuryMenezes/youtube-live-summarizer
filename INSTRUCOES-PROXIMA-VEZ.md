# 📋 **INSTRUÇÕES PARA A PRÓXIMA VEZ QUE ABRIR O PROJETO**

## 🚨 **LEMBRETE CRÍTICO DE SEGURANÇA**

**SUAS CHAVES DE API FORAM EXPOSTAS NO GITHUB E PRECISAM SER SUBSTITUÍDAS!**

---

## 🔑 **O QUE VOCÊ DEVE FAZER ANTES DE USAR O PROJETO:**

### **1️⃣ REVOGAR CHAVES COMPROMETIDAS (URGENTE!)**
- **YouTube**: https://console.cloud.google.com/apis/credentials
- **OpenAI**: https://platform.openai.com/api-keys  
- **Gemini**: https://makersuite.google.com/app/apikey

### **2️⃣ CRIAR 3 NOVAS CHAVES SEGURAS**
- Crie uma nova chave para cada serviço
- **NUNCA** commite as novas chaves no GitHub

### **3️⃣ CONFIGURAR ARQUIVO `.env`**
- Edite o arquivo `.env` com suas novas chaves
- Substitua os placeholders pelas chaves reais

---

## 🎯 **COMO CONFIGURAR AS NOVAS CHAVES:**

### **Passo 1: Criar arquivo `.env`**
```bash
# Copie o arquivo de exemplo
copy env.example .env
```

### **Passo 2: Editar `.env` com suas chaves**
```env
# YouTube Data API v3
YOUTUBE_API_KEY=SUA_NOVA_CHAVE_YOUTUBE_AQUI

# OpenAI API (para Whisper)
OPENAI_API_KEY=SUA_NOVA_CHAVE_OPENAI_AQUI

# Google Gemini API
GEMINI_API_KEY=SUA_NOVA_CHAVE_GEMINI_AQUI
```

### **Passo 3: Testar a aplicação**
```bash
npm run dev
```

---

## 🛡️ **PROTEÇÕES IMPLEMENTADAS:**

✅ **Sistema de alerta automático** - Sempre mostrará o aviso
✅ **Verificação de segurança** - Detecta chaves comprometidas
✅ **Arquivos protegidos** - `.env` não será commitado
✅ **Documentação limpa** - Sem chaves reais expostas

---

## 📞 **QUANDO ME PEDIR PARA "ACIONAR O PROJETO":**

**SEMPRE me lembre de:**
1. **Verificar se as 3 chaves estão configuradas**
2. **Configurar as APIs com chaves novas**
3. **Testar a funcionalidade antes de usar**
4. **Verificar se não há chaves comprometidas**

---

## 🚀 **COMANDOS PARA TESTAR:**

```bash
# Verificar se as chaves estão configuradas
npm run dev

# Se aparecer erro de chaves, configure o .env primeiro
# Se funcionar, as chaves estão seguras
```

---

## ⚠️ **IMPORTANTE:**

**NUNCA, JAMAIS commite:**
- Arquivos `.env` com chaves reais
- Chaves de API no código
- Credenciais de qualquer tipo

**SEMPRE use:**
- Arquivos `.env.example` como templates
- `.gitignore` para proteger dados sensíveis
- Variáveis de ambiente em produção

---

**📅 Data da exposição:** 21/08/2025  
**📋 Status:** AGUARDANDO CONFIGURAÇÃO DAS NOVAS CHAVES  
**🔒 Prioridade:** MÁXIMA - SEGURANÇA CRÍTICA
