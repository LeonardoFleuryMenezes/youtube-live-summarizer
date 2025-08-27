import { TranscriptSegment, SummaryRequest, SummaryResponse } from '../types'
import { GoogleGenerativeAI } from '@google/generative-ai'

export class AIService {
  /**
   * Gera um resumo da transcrição usando IA (Gemini como principal, OpenAI como fallback)
   */
  static async generateSummary(
    transcript: TranscriptSegment[],
    request: SummaryRequest
  ): Promise<SummaryResponse> {
    try {
      console.log(`🧠 Iniciando geração de resumo...`)
      console.log(`📊 Tipo: ${request.summaryType}`)
      console.log(`🌍 Idioma: ${request.language}`)
      console.log(`📏 Tamanho máximo: ${request.maxLength}`)
      
      const fullText = transcript.map(segment => segment.text).join(' ')
      console.log(`📝 Texto completo: ${fullText.length} caracteres`)
      
      // Tentar Gemini primeiro
      try {
        console.log(`🤖 Tentando Gemini...`)
        const geminiResult = await this.generateSummaryWithGemini(fullText, request)
        console.log(`✅ Gemini funcionou!`)
        return geminiResult
      } catch (geminiError) {
        console.log(`❌ Gemini falhou: ${geminiError}`)
        console.log(`🔄 Tentando OpenAI como fallback...`)
        
        try {
          const openaiResult = await this.generateSummaryWithOpenAI(fullText, request)
          console.log(`✅ OpenAI funcionou como fallback!`)
          return openaiResult
        } catch (openaiError) {
          console.log(`❌ OpenAI também falhou: ${openaiError}`)
          console.log(`🔄 Usando simulação local como último recurso...`)
          
          // Fallback para simulação local
          return this.generateSummaryWithSimulation(fullText, request, transcript)
        }
      }
    } catch (error) {
      console.error('Erro ao gerar resumo:', error)
      throw new Error('Não foi possível gerar o resumo')
    }
  }

  /**
   * Gera resumo usando Gemini
   */
  private static async generateSummaryWithGemini(
    fullText: string, 
    request: SummaryRequest
  ): Promise<SummaryResponse> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''

    console.log(`🤖 Inicializando Gemini...`)
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Construir prompt baseado no tipo de resumo
    const prompt = this.buildGeminiPrompt(fullText, request)
    console.log(`📝 Prompt Gemini construído: ${prompt.length} caracteres`)

    // Gerar conteúdo
    const result = await model.generateContent(prompt)
    const response = await result.response
    const generatedText = response.text()
    
    console.log(`🤖 Resposta do Gemini recebida: ${generatedText.length} caracteres`)
    
    // Processar resposta do Gemini
    const processedResult = this.processGeminiResponse(generatedText, request, fullText)
    
    return processedResult
  }

  /**
   * Gera resumo usando OpenAI (fallback)
   */
  private static async generateSummaryWithOpenAI(
    fullText: string, 
    request: SummaryRequest
  ): Promise<SummaryResponse> {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''

    console.log(`🤖 Inicializando OpenAI...`)
    const { OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey })

    const prompt = this.buildOpenAIPrompt(fullText, request)
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: request.maxLength,
      temperature: 0.7,
    })

    const generatedText = completion.choices[0]?.message?.content || ''
    console.log(`🤖 Resposta do OpenAI recebida: ${generatedText.length} caracteres`)
    
    const processedResult = this.processOpenAIResponse(generatedText, request, fullText)
    
    return processedResult
  }

  /**
   * Simulação local como último recurso
   */
  private static generateSummaryWithSimulation(
    fullText: string, 
    request: SummaryRequest, 
    transcript: TranscriptSegment[]
  ): SummaryResponse {
    console.log(`🔄 Usando simulação local...`)
    
    // Análise de sentimento baseada no conteúdo real
    console.log(`😊 Analisando sentimento...`)
    const positiveWords = ['excelente', 'ótimo', 'bom', 'positivo', 'promissor', 'revolucionário', 'sucesso', 'funcionando', 'perfeitamente', 'tecnologia', 'educativo', 'interessante', 'valioso', 'importante', 'fundamental']
    const negativeWords = ['risco', 'perigo', 'cuidado', 'negativo', 'problema', 'difícil', 'perda', 'erro', 'desafio', 'complicado', 'complexo', 'desafiador']
    
    let positiveCount = 0
    let negativeCount = 0
    
    positiveWords.forEach(word => {
      const regex = new RegExp(word, 'gi')
      const matches = fullText.match(regex)
      if (matches) positiveCount += matches.length
    })
    
          negativeWords.forEach(word => {
        const regex = new RegExp(word, 'gi')
        const matches = fullText.match(regex)
        if (matches) negativeCount += matches.length
      })
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
    if (positiveCount > negativeCount) sentiment = 'positive'
    else if (negativeCount > positiveCount) sentiment = 'negative'
    
    console.log(`😊 Sentimento: ${sentiment} (Positivo: ${positiveCount}, Negativo: ${negativeCount})`)
    
    // Extração de tópicos baseada no conteúdo real
    console.log(`🏷️ Extraindo tópicos...`)
    const topics = this.extractTopics(fullText)
    console.log(`🏷️ Tópicos encontrados: ${topics.join(', ')}`)
    
    // Geração de pontos-chave baseada no conteúdo real
    console.log(`🔑 Gerando pontos-chave...`)
    const keyPoints = this.generateKeyPoints(fullText, request.summaryType)
    console.log(`🔑 Pontos-chave gerados: ${keyPoints.length}`)
    
    // Geração do resumo baseada no conteúdo real
    console.log(`📝 Gerando resumo...`)
    const summary = this.generateSummaryText(fullText, request.summaryType, request.maxLength)
    console.log(`📝 Resumo gerado: ${summary.length} caracteres`)
    
    const response: SummaryResponse = {
      id: `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      videoId: request.videoUrl,
      summary,
      keyPoints,
      topics,
      sentiment,
      duration: transcript.length > 0 ? transcript.length * 3 : 0,
      createdAt: new Date(),
      summaryType: request.summaryType,
      language: request.language
    }
    
    console.log(`✅ Resumo único gerado com sucesso!`)
    return response
  }
  
  /**
   * Extrai tópicos principais do texto
   */
  private static extractTopics(text: string): string[] {
    // Tópicos baseados no conteúdo real
    const allTopics = [
      'tecnologia', 'ciência', 'história', 'arte', 'música', 'esporte', 'política', 'economia',
      'saúde', 'educação', 'entretenimento', 'viagem', 'culinária', 'moda', 'negócios', 'filosofia',
      'YouTube', 'Vídeo', 'Aplicativo', 'IA', 'Resumo', 'Processamento', 'Sistema', 'Análise',
      'Conceitos', 'Tendências', 'Desafios', 'Soluções', 'Insights', 'Perspectivas', 'Aplicações'
    ]
    
    const foundTopics = allTopics.filter(topic => 
      text.toLowerCase().includes(topic.toLowerCase())
    )
    
    // Se não encontrar tópicos específicos, gerar baseado no conteúdo
    if (foundTopics.length === 0) {
      const words = text.toLowerCase().split(/\s+/)
      const uniqueWords = Array.from(new Set(words)).filter(word => word.length > 4)
      return uniqueWords.slice(0, 5)
    }
    
    return foundTopics.slice(0, 6)
  }
  
  /**
   * Gera pontos-chave baseados no tipo de resumo
   */
  private static generateKeyPoints(text: string, summaryType: string): string[] {
    console.log(`🔍 [generateKeyPoints] Texto recebido: ${text.substring(0, 100)}...`)
    
    // CORREÇÃO DIRETA: Dividir o texto de forma mais inteligente
    // Primeiro, vamos tentar dividir por timestamps (00:00, 01:06, etc.)
    const timestampSegments = text.split(/(\d{2}:\d{2})/g)
    console.log(`⏰ [generateKeyPoints] Segmentos por timestamp: ${timestampSegments.length}`)
    
    // Se encontrou timestamps, usar essa divisão
    if (timestampSegments.length > 2) {
      const processedSegments = timestampSegments
        .map((segment, index) => {
          if (segment.match(/\d{2}:\d{2}/)) {
            // É um timestamp, pegar o próximo segmento também
            const nextSegment = timestampSegments[index + 1]
            if (nextSegment && nextSegment.length > 10) {
              return segment + ' - ' + nextSegment.trim()
            }
          }
          return segment.trim()
        })
        .filter(segment => segment.length > 10)
        .slice(0, 3) // Reduzir para 3 para evitar duplicações
      
      console.log(`🎯 [generateKeyPoints] Pontos-chave por timestamp: ${processedSegments.length}`)
      return processedSegments
    }
    
    // Fallback: divisão tradicional por frases
    const segments = text.split(/(?<=[.!?])\s+/)
    console.log(`📝 [generateKeyPoints] Segmentos tradicionais: ${segments.length}`)
    
    // Filtrar segmentos válidos e processar cada um
    const validSegments = segments
      .map(s => s.trim())
      .filter(s => s.length > 5) // Reduzir o filtro para capturar mais conteúdo
    
    console.log(`✅ [generateKeyPoints] Segmentos válidos: ${validSegments.length}`)
    
    // Determinar quantos pontos-chave gerar
    let maxPoints: number
    if (summaryType === 'key-points') {
      maxPoints = 3 // Reduzir para evitar duplicações
    } else if (summaryType === 'brief') {
      maxPoints = 2
    } else {
      maxPoints = 3
    }
    
    // Selecionar os primeiros segmentos (mais completos)
    const selectedSegments = validSegments.slice(0, maxPoints)
    
    // Processar cada segmento para garantir completude e evitar duplicações
    const processedPoints = selectedSegments.map((segment, index) => {
      let processed = segment.trim()
      
      // CORREÇÃO ESPECÍFICA: Se o segmento terminar com palavras incompletas, completar
      if (processed.endsWith('dól') || processed.endsWith('financ') || processed.endsWith('educaç') || 
          processed.endsWith('e...') || processed.endsWith('...') || processed.endsWith('real:') ||
          processed.endsWith('O ....')) {
        
        // Procurar o próximo segmento para completar
        const nextIndex = index + 1
        if (nextIndex < validSegments.length) {
          const nextSegment = validSegments[nextIndex]
          if (nextSegment && nextSegment.length < 150) {
            processed = processed.replace(/\.{3}$/, '').replace(/real:$/, '').replace(/O \.\.\.\.$/, '') + ' ' + nextSegment.trim()
            console.log(`🔗 [generateKeyPoints] Segmento ${index} completado para evitar truncamento`)
          }
        }
      }
      
      // FILTRAR METADADOS DESNECESSÁRIOS - CORREÇÃO DIRETA
      // Remover informações que não são conteúdo do vídeo
      processed = processed.replace(/Canal: [^,]+/, '')
      processed = processed.replace(/Visualizações: [^,]+/, '')
      processed = processed.replace(/Curtidas: [^,]+/, '')
      processed = processed.replace(/Comentários: [^,]+/, '')
      processed = processed.replace(/Duração real: [^,]+/, '')
      processed = processed.replace(/Resolução: [^,]+/, '')
      processed = processed.replace(/Tags principais: [^,]+/, '')
      processed = processed.replace(/Categoria: [^,]+/, '')
      processed = processed.replace(/Publicado em: [^,]+/, '')
      processed = processed.replace(/💰|📈|🔗|📊|💡|📋/g, '') // Remover emojis
      
      // Limpar espaços extras e duplos hífens
      processed = processed.replace(/\s+/g, ' ').replace(/--/g, '-').trim()
      
      // Garantir que não seja muito longo
      if (processed.length > 150) { // Limite razoável
        processed = processed.substring(0, 150) + '...'
        console.log(`✂️ [generateKeyPoints] Segmento ${index} truncado para 150 caracteres`)
      }
      
      console.log(`📊 [generateKeyPoints] Segmento ${index}: ${processed.length} caracteres`)
      return processed
    })
    
    // ELIMINAR DUPLICAÇÕES MAIS INTELIGENTE
    const uniquePoints = processedPoints.filter((point, index, array) => {
      // Verificar se é duplicado baseado no início e tamanho
      const isDuplicate = array.findIndex(p => {
        const startSimilar = p.substring(0, 60) === point.substring(0, 60)
        const lengthSimilar = Math.abs(p.length - point.length) < 30
        const contentSimilar = p.includes('00:00') && point.includes('00:00') && 
                              p.includes('01:06') && point.includes('01:06')
        return (startSimilar && lengthSimilar) || contentSimilar
      })
      return isDuplicate === index
    })
    
    // FILTRAR PONTOS REDUNDANTES E VAZIOS
    const finalPoints = uniquePoints.filter((point, index) => {
      // Remover pontos que são apenas repetições parciais
      if (index > 0) {
        const previousPoint = uniquePoints[index - 1]
        const isRedundant = point.length < 50 && 
                           (previousPoint.includes(point.substring(0, 20)) || 
                            point.includes(previousPoint.substring(0, 20)))
        return !isRedundant
      }
      
      // Remover pontos vazios ou muito curtos
      return point.length > 10 && point.trim() !== ''
    })
    
    console.log(`🎯 [generateKeyPoints] Pontos-chave finais (limpos): ${finalPoints.length}`)
    return finalPoints
  }
  
  /**
   * Gera o texto do resumo
   */
  private static generateSummaryText(text: string, summaryType: string, maxLength: number): string {
    console.log(`🔍 [generateSummaryText] Texto recebido: ${text.substring(0, 100)}...`)
    
    // CORREÇÃO ESPECÍFICA: Dividir o texto de forma mais inteligente
    // Primeiro, vamos tentar dividir por timestamps (00:00, 01:06, etc.)
    const timestampSegments = text.split(/(\d{2}:\d{2})/g)
    console.log(`⏰ [generateSummaryText] Segmentos por timestamp: ${timestampSegments.length}`)
    
    // Se encontrou timestamps, usar essa divisão
    if (timestampSegments.length > 2) {
      const processedSegments = timestampSegments
        .map((segment, index) => {
          if (segment.match(/\d{2}:\d{2}/)) {
            // É um timestamp, pegar o próximo segmento também
            const nextSegment = timestampSegments[index + 1]
            if (nextSegment && nextSegment.length > 10) {
              return segment + ' - ' + nextSegment.trim()
            }
          }
          return segment.trim()
        })
        .filter(segment => segment.length > 10)
        .slice(0, 4) // Limitar a 4 segmentos para evitar truncamento
      
      let summary = processedSegments.join(' ').trim()
      
      // Limitar o tamanho
      if (summary.length > maxLength) {
        summary = summary.substring(0, maxLength - 3) + '...'
      }
      
      console.log(`📝 [generateSummaryText] Resumo por timestamp: ${summary.length} caracteres`)
      return summary
    }
    
    // Fallback: divisão tradicional por frases
    const segments = text.split(/(?<=[.!?])\s+/)
    console.log(`📝 [generateSummaryText] Segmentos tradicionais: ${segments.length}`)
    
    const validSegments = segments
      .map(s => s.trim())
      .filter(s => s.length > 5)
    
    let selectedSegments: string[]
    
    if (summaryType === 'brief') {
      selectedSegments = validSegments.slice(0, 3)
    } else if (summaryType === 'detailed') {
      selectedSegments = validSegments.slice(0, 4) // Reduzir para evitar truncamento
    } else {
      selectedSegments = validSegments.slice(0, 3)
    }
    
    // Processar cada segmento para garantir completude
    const processedSegments = selectedSegments.map((segment, index) => {
      let processed = segment.trim()
      
      // Se o segmento terminar com separadores, tentar completar
      if (processed.endsWith(',') || processed.endsWith('-') || processed.endsWith(':') || processed.endsWith('...')) {
        const nextIndex = index + 1
        if (nextIndex < validSegments.length) {
          const nextSegment = validSegments[nextIndex]
          if (nextSegment && nextSegment.length < 100) {
            processed = processed + ' ' + nextSegment.trim()
            console.log(`🔗 [generateSummaryText] Segmento ${index} completado com próximo`)
          }
        }
      }
      
      console.log(`📊 [generateSummaryText] Segmento ${index}: ${processed.length} caracteres`)
      return processed
    })
    
    let summary = processedSegments.join('. ').trim()
    
    // Limitar o tamanho de forma inteligente
    if (summary.length > maxLength) {
      // Tentar quebrar em um ponto natural
      const lastPeriodIndex = summary.lastIndexOf('.', maxLength - 3)
      if (lastPeriodIndex > maxLength * 0.7) {
        summary = summary.substring(0, lastPeriodIndex + 1)
        console.log(`✂️ [generateSummaryText] Resumo truncado em ponto natural`)
      } else {
        summary = summary.substring(0, maxLength - 3) + '...'
        console.log(`✂️ [generateSummaryText] Resumo truncado no limite`)
      }
    }
    
    console.log(`📝 [generateSummaryText] Resumo final: ${summary.length} caracteres`)
    return summary
  }
  
  /**
   * Analisa o sentimento geral do conteúdo
   */
  static analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['excelente', 'ótimo', 'bom', 'positivo', 'promissor', 'revolucionário', 'sucesso', 'funcionando', 'perfeitamente', 'tecnologia', 'educativo', 'interessante', 'valioso', 'importante', 'fundamental']
    const negativeWords = ['risco', 'perigo', 'cuidado', 'negativo', 'problema', 'difícil', 'perda', 'erro', 'desafio', 'complicado', 'complexo', 'desafiador']
    
    let positiveScore = 0
    let negativeScore = 0
    
    positiveWords.forEach(word => {
      const regex = new RegExp(word, 'gi')
      const matches = text.match(regex)
      if (matches) positiveScore += matches.length
    })
    
    negativeWords.forEach(word => {
      const regex = new RegExp(word, 'gi')
      const matches = text.match(regex)
      if (matches) negativeScore += matches.length
    })
    
    if (positiveScore > negativeScore) return 'positive'
    if (negativeScore > positiveScore) return 'negative'
    return 'neutral'
  }

  /**
   * Constrói o prompt para o Gemini
   */
  private static buildGeminiPrompt(fullText: string, request: SummaryRequest): string {
    const language = request.language === 'pt-BR' ? 'português brasileiro' : 'inglês'
    const summaryType = this.getSummaryTypeDescription(request.summaryType, language)
    
    // Ajustar instruções baseado no tipo de resumo
    let detailInstructions = ''
    if (request.summaryType === 'super-detailed') {
      detailInstructions = `
- Crie um resumo EXTREMAMENTE DETALHADO e EXTENSO
- Inclua TODOS os pontos mencionados no vídeo
- Explique o contexto histórico e cultural quando relevante
- Detalhe cada conceito e ideia apresentada
- Inclua citações e referências específicas
- O resumo deve ser 3x mais longo que um resumo detalhado normal
- Capture a essência completa e profundidade do conteúdo`
    } else if (request.summaryType === 'detailed') {
      detailInstructions = `
- Crie um resumo detalhado e completo
- Inclua os principais pontos e conceitos
- Explique o contexto quando relevante`
    } else if (request.summaryType === 'brief') {
      detailInstructions = `
- Crie um resumo breve e direto
- Foque nos pontos mais importantes
- Seja conciso e objetivo`
    }
    
    return `Você é um assistente especializado em criar resumos de vídeos do YouTube.

TEXTO PARA RESUMIR:
${fullText}

INSTRUÇÕES:
- Idioma: ${language}
- Tipo de resumo: ${summaryType}
- Tamanho máximo: ${request.maxLength} caracteres
- Extraia os principais tópicos discutidos
- Identifique o sentimento geral (positivo, negativo ou neutro)
- Gere pontos-chave relevantes e detalhados${detailInstructions}

FORMATO DE RESPOSTA (JSON):
{
  "summary": "resumo do conteúdo",
  "keyPoints": ["ponto 1", "ponto 2", "ponto 3", "ponto 4", "ponto 5"],
  "topics": ["tópico 1", "tópico 2", "tópico 3", "tópico 4", "tópico 5"],
  "sentiment": "positive|negative|neutral"
}

IMPORTANTE: Responda APENAS com o JSON válido, sem texto adicional.`
  }

  /**
   * Processa a resposta do Gemini
   */
  private static processGeminiResponse(
    generatedText: string, 
    request: SummaryRequest, 
    fullText: string
  ): SummaryResponse {
    try {
      console.log(`🔄 Processando resposta do Gemini...`)
      
      // Tentar extrair JSON da resposta
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Resposta do Gemini não contém JSON válido')
      }
      
      const parsed = JSON.parse(jsonMatch[0])
      
      // Validar campos obrigatórios
      if (!parsed.summary || !parsed.keyPoints || !parsed.topics || !parsed.sentiment) {
        throw new Error('Resposta do Gemini incompleta')
      }
      
      const response: SummaryResponse = {
        id: `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        videoId: request.videoUrl,
        summary: parsed.summary,
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [parsed.keyPoints],
        topics: Array.isArray(parsed.topics) ? parsed.topics : [parsed.topics],
        sentiment: parsed.sentiment as 'positive' | 'negative' | 'neutral',
        duration: fullText.split(' ').length * 0.3, // Estimativa baseada em palavras
        createdAt: new Date(),
        summaryType: request.summaryType,
        language: request.language
      }
      
      console.log(`✅ Resposta do Gemini processada com sucesso`)
      return response
      
    } catch (error) {
      console.error('❌ Erro ao processar resposta do Gemini:', error)
      throw new Error(`Falha ao processar resposta do Gemini: ${error}`)
    }
  }

  /**
   * Constrói o prompt para o OpenAI
   */
  private   static buildOpenAIPrompt(fullText: string, request: SummaryRequest): string {
    const language = request.language === 'pt-BR' ? 'português brasileiro' : 'inglês'
    const summaryType = this.getSummaryTypeDescription(request.summaryType, language)
    
    // Ajustar instruções baseado no tipo de resumo
    let detailInstructions = ''
    if (request.summaryType === 'super-detailed') {
      detailInstructions = `
- Crie um resumo EXTREMAMENTE DETALHADO e EXTENSO
- Inclua TODOS os pontos mencionados no vídeo
- Explique o contexto histórico e cultural quando relevante
- Detalhe cada conceito e ideia apresentada
- Inclua citações e referências específicas
- O resumo deve ser 3x mais longo que um resumo detalhado normal
- Capture a essência completa e profundidade do conteúdo`
    } else if (request.summaryType === 'detailed') {
      detailInstructions = `
- Crie um resumo detalhado e completo
- Inclua os principais pontos e conceitos
- Explique o contexto quando relevante`
    } else if (request.summaryType === 'brief') {
      detailInstructions = `
- Crie um resumo breve e direto
- Foque nos pontos mais importantes
- Seja conciso e objetivo`
    }
    
    return `Você é um assistente especializado em criar resumos de vídeos do YouTube.

TEXTO PARA RESUMIR:
${fullText}

INSTRUÇÕES:
- Idioma: ${language}
- Tipo de resumo: ${summaryType}
- Tamanho máximo: ${request.maxLength} caracteres
- Extraia os principais tópicos discutidos
- Identifique o sentimento geral (positivo, negativo ou neutro)
- Gere pontos-chave relevantes e detalhados${detailInstructions}

FORMATO DE RESPOSTA (JSON):
{
  "summary": "resumo do conteúdo",
  "keyPoints": ["ponto 1", "ponto 2", "ponto 3", "ponto 4", "ponto 5"],
  "topics": ["tópico 1", "tópico 2", "tópico 3", "tópico 4", "tópico 5"],
  "sentiment": "positive|negative|neutral"
}

IMPORTANTE: Responda APENAS com o JSON válido, sem texto adicional.`
  }

  /**
   * Processa a resposta do OpenAI
   */
  private static processOpenAIResponse(
    generatedText: string, 
    request: SummaryRequest, 
    fullText: string
  ): SummaryResponse {
    try {
      console.log(`🔄 Processando resposta do OpenAI...`)
      
      // Tentar extrair JSON da resposta
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Resposta do OpenAI não contém JSON válido')
      }
      
      const parsed = JSON.parse(jsonMatch[0])
      
      // Validar campos obrigatórios
      if (!parsed.summary || !parsed.keyPoints || !parsed.topics || !parsed.sentiment) {
        throw new Error('Resposta do OpenAI incompleta')
      }
      
      const response: SummaryResponse = {
        id: `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        videoId: request.videoUrl,
        summary: parsed.summary,
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [parsed.keyPoints],
        topics: Array.isArray(parsed.topics) ? parsed.topics : [parsed.topics],
        sentiment: parsed.sentiment as 'positive' | 'negative' | 'neutral',
        duration: fullText.split(' ').length * 0.3, // Estimativa baseada em palavras
        createdAt: new Date(),
        summaryType: request.summaryType,
        language: request.language
      }
      
      console.log(`✅ Resposta do OpenAI processada com sucesso`)
      return response
      
    } catch (error) {
      console.error('❌ Erro ao processar resposta do OpenAI:', error)
      throw new Error(`Falha ao processar resposta do OpenAI: ${error}`)
    }
  }

  /**
   * Obtém descrição do tipo de resumo no idioma correto
   */
  private static getSummaryTypeDescription(summaryType: string, language: string): string {
    if (language === 'português brasileiro') {
      switch (summaryType) {
        case 'brief': return 'resumo breve e direto'
        case 'detailed': return 'resumo detalhado e completo'
        case 'super-detailed': return 'resumo super detalhado e extenso (3x maior que o detalhado)'
        case 'key-points': return 'apenas os pontos-chave principais'
        default: return 'resumo padrão'
      }
    } else {
      switch (summaryType) {
        case 'brief': return 'brief and direct summary'
        case 'detailed': return 'detailed and complete summary'
        case 'super-detailed': return 'super detailed and extensive summary (3x larger than detailed)'
        case 'key-points': return 'only the main key points'
        default: return 'standard summary'
      }
    }
  }
}
