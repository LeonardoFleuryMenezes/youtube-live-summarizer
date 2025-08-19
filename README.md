# 🎥 YouTube Live Summarizer

Aplicativo inteligente para fazer resumo automático de lives e vídeos do YouTube usando inteligência artificial.

## ✨ Funcionalidades

- **🎯 Extração de Transcrições**: Obtém automaticamente transcrições de vídeos do YouTube
- **🧠 Resumo com IA**: Gera resumos inteligentes usando processamento de linguagem natural
- **📊 Múltiplos Tipos**: Resumos resumidos, detalhados ou em pontos-chave
- **🌍 Multi-idioma**: Suporte para português, inglês e espanhol
- **📈 Análise de Sentimento**: Identifica o tom geral do conteúdo
- **🎨 Interface Moderna**: Design responsivo e intuitivo
- **⚡ Processamento Rápido**: Otimizado para performance

## 🚀 Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilização**: Tailwind CSS, Lucide React Icons
- **Backend**: API Routes do Next.js
- **IA**: Processamento de linguagem natural (simulado)
- **YouTube**: youtube-transcript-api para transcrições

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Acesso à internet para transcrições do YouTube

## 🛠️ Instalação

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd youtube-live-summarizer
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Execute em modo de desenvolvimento:**
```bash
npm run dev
```

4. **Acesse a aplicação:**
```
http://localhost:3000
```

## 📖 Como Usar

### 1. **Cole a URL do YouTube**
- Cole a URL de qualquer vídeo ou live do YouTube
- O sistema automaticamente extrai o ID do vídeo

### 2. **Configure as Opções**
- **Tipo de Resumo**: Escolha entre resumido, detalhado ou pontos-chave
- **Idioma**: Selecione o idioma desejado para o resumo
- **Tamanho Máximo**: Defina o limite de caracteres do resumo

### 3. **Gere o Resumo**
- Clique em "Gerar Resumo"
- Acompanhe o progresso em tempo real
- Visualize o resultado completo

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# OpenAI (opcional - para IA real)
OPENAI_API_KEY=sua_chave_aqui

# YouTube API (opcional - para informações detalhadas)
YOUTUBE_API_KEY=sua_chave_aqui
```

### Personalização
- **Cores**: Edite `tailwind.config.js` para personalizar o tema
- **Componentes**: Modifique os componentes em `src/components/`
- **Serviços**: Ajuste a lógica de IA em `src/lib/aiService.ts`

## 📁 Estrutura do Projeto

```
youtube-live-summarizer/
├── src/
│   ├── app/                 # App Router do Next.js
│   │   ├── api/            # API Routes
│   │   │   └── summarize/  # Endpoint de resumo
│   │   ├── globals.css     # Estilos globais
│   │   ├── layout.tsx      # Layout principal
│   │   └── page.tsx        # Página inicial
│   ├── components/         # Componentes React
│   ├── lib/               # Serviços e utilitários
│   │   ├── aiService.ts   # Serviço de IA
│   │   └── youtubeService.ts # Serviço do YouTube
│   └── types/             # Definições TypeScript
├── public/                 # Arquivos estáticos
├── tailwind.config.js      # Configuração do Tailwind
├── next.config.js         # Configuração do Next.js
└── package.json           # Dependências do projeto
```

## 🎯 Tipos de Resumo

### 📝 **Resumido**
- Resumo conciso em 3-5 frases
- Ideal para visão geral rápida
- Foco nos pontos principais

### 🔍 **Detalhado**
- Resumo completo em 8-10 frases
- Inclui contexto e detalhes
- Perfeito para análise aprofundada

### 🎯 **Pontos-Chave**
- Lista numerada de pontos importantes
- Fácil de escanear e revisar
- Ideal para estudos e referência

## 🌟 Recursos Avançados

### **Análise de Sentimento**
- Identifica automaticamente o tom do conteúdo
- Classifica como positivo, negativo ou neutro
- Baseado em análise de palavras-chave

### **Extração de Tópicos**
- Detecta automaticamente temas principais
- Categoriza o conteúdo por área
- Facilita a organização do conhecimento

### **Processamento Inteligente**
- Análise contextual do conteúdo
- Identificação de conceitos relacionados
- Geração de resumos coerentes

## 🚀 Deploy

### **Vercel (Recomendado)**
```bash
npm install -g vercel
vercel
```

### **Netlify**
```bash
npm run build
# Faça upload da pasta .next
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Limitações e Considerações

### **YouTube**
- Transcrições disponíveis apenas para vídeos com legendas
- Alguns vídeos podem ter transcrições desabilitadas
- Lives em tempo real podem ter transcrições incompletas

### **IA**
- Versão atual usa processamento simulado
- Para IA real, integre com OpenAI, Claude ou similar
- Considere custos de API para uso em produção

### **Performance**
- Processamento depende do tamanho da transcrição
- Vídeos longos podem levar mais tempo
- Cache implementado para otimização

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

- **Issues**: Abra uma issue no GitHub
- **Documentação**: Consulte este README
- **Comunidade**: Participe das discussões

## 🔮 Roadmap

- [ ] Integração com APIs reais de IA (OpenAI, Claude)
- [ ] Suporte para mais idiomas
- [ ] Histórico de resumos salvos
- [ ] Exportação em PDF/Markdown
- [ ] Análise de múltiplos vídeos
- [ ] Dashboard de estatísticas
- [ ] API pública para desenvolvedores

---

**Desenvolvido com ❤️ para facilitar o consumo de conteúdo do YouTube**



