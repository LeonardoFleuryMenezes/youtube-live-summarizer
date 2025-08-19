# 🖥️ **YouTube Live Summarizer - Aplicativo Desktop**

## 🚀 **Como Usar o Aplicativo Desktop**

### **Opção 1: Executar em Modo Desenvolvimento**
```bash
# Duplo clique no arquivo:
INICIAR-DESKTOP.bat
```

### **Opção 2: Construir Aplicativo Executável**
```bash
# Duplo clique no arquivo:
CONSTRUIR-DESKTOP.bat
```

## 📋 **Requisitos do Sistema**

- **Windows 10/11** (64-bit)
- **Node.js 18+** instalado
- **8GB RAM** mínimo (recomendado)
- **2GB espaço livre** em disco

## 🔧 **Instalação e Configuração**

### **1. Primeira Execução**
- Execute `INICIAR-DESKTOP.bat`
- O script instalará automaticamente as dependências
- Aguarde a instalação do Electron

### **2. Configurar API Keys**
- Abra o arquivo `config.env`
- Configure sua chave Gemini: `GEMINI_API_KEY=sua_chave_aqui`
- Configure sua chave OpenAI (opcional): `OPENAI_API_KEY=sua_chave_aqui`

### **3. Executar Aplicativo**
- Execute `INICIAR-DESKTOP.bat`
- O aplicativo abrirá em uma janela desktop
- **NÃO feche o terminal** - ele mantém o servidor rodando

## 🎯 **Funcionalidades do Desktop**

### **✅ Sistema de Notificações**
- **Notificações desktop** nativas do Windows
- **Sons de alerta** quando resumos ficam prontos
- **Auto-ocultação** configurável
- **Histórico** de notificações

### **👤 Arquivo por Autor**
- **Organização inteligente** por criador de conteúdo
- **Busca avançada** por tópico e autor
- **Estatísticas detalhadas** por autor
- **Visualização em grade** ou lista

### **📊 Dashboard Completo**
- **Métricas em tempo real**
- **Uso de APIs** (Gemini vs OpenAI)
- **Análise de crescimento**
- **Dicas de otimização**

### **⚙️ Configurações Avançadas**
- **Estilo de escrita** personalizável
- **Configurações de IA** ajustáveis
- **Áreas de foco** específicas
- **Formato de saída** flexível

## 🚨 **Solução de Problemas**

### **Erro: "Node.js não está instalado"**
```bash
# Baixe e instale o Node.js de:
https://nodejs.org/
```

### **Erro: "Falha ao instalar dependências"**
```bash
# Execute manualmente:
npm install
```

### **Erro: "Porta 3000 em uso"**
```bash
# Feche outros aplicativos que usem a porta 3000
# Ou execute em outra porta:
set PORT=3001 && npm run dev
```

### **Aplicativo não abre**
```bash
# Verifique se o terminal está rodando
# Execute manualmente:
npm run electron-dev
```

## 📁 **Estrutura de Arquivos**

```
youtube-live-summarizer/
├── INICIAR-DESKTOP.bat          # Inicia aplicativo desktop
├── CONSTRUIR-DESKTOP.bat        # Constrói executável
├── config.env                   # Configurações de API
├── electron/                    # Configuração Electron
│   ├── main.js                 # Processo principal
│   ├── preload.js              # Script de pré-carregamento
│   └── assets/                 # Ícones e recursos
├── src/                         # Código fonte
│   ├── components/              # Componentes React
│   ├── lib/                     # Serviços e lógica
│   └── app/                     # Páginas Next.js
└── dist/                        # Aplicativo construído (após build)
```

## 🔄 **Atualizações**

### **Atualizar Dependências**
```bash
npm update
```

### **Reconstruir Aplicativo**
```bash
# Execute novamente:
CONSTRUIR-DESKTOP.bat
```

## 💡 **Dicas de Uso**

### **1. Performance**
- Use **resumos detalhados** para conteúdo complexo
- Configure **tamanho máximo** baseado na duração do vídeo
- Monitore **uso das APIs** para otimizar custos

### **2. Organização**
- Use **favoritos** para resumos importantes
- Organize por **autor** para acompanhar criadores
- Filtre por **tópicos** para encontrar conteúdo específico

### **3. Configurações**
- Ajuste **criatividade** da IA conforme necessário
- Configure **áreas de foco** para seu interesse
- Escolha **formato de saída** adequado ao uso

## 🆘 **Suporte**

### **Problemas Comuns**
1. **Aplicativo não inicia**: Verifique se Node.js está instalado
2. **Erro de API**: Configure corretamente as chaves em `config.env`
3. **Lentidão**: Aumente RAM ou feche outros aplicativos
4. **Erro de rede**: Verifique conexão com internet

### **Logs de Erro**
- Os erros aparecem no terminal
- Verifique mensagens de erro específicas
- Use `Ctrl+C` para parar o aplicativo

## 🎉 **Pronto para Usar!**

Agora você tem um **YouTube Live Summarizer PROFISSIONAL** rodando na sua máquina!

- ✅ **Sistema de Notificações** completo
- ✅ **Arquivo por Autor** inteligente
- ✅ **Busca Avançada** por tópicos
- ✅ **Dashboard Analytics** em tempo real
- ✅ **Configurações Avançadas** personalizáveis
- ✅ **Aplicativo Desktop** independente

**🚀 Execute `INICIAR-DESKTOP.bat` e comece a usar!**
