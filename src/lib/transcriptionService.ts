import { TranscriptSegment } from '../types'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as fs from 'fs'
import FormData from 'form-data'

export interface TranscriptionResult {
  success: boolean
  segments: TranscriptSegment[]
  error?: string
  processingTime?: number
}

export class TranscriptionService {
  private static openaiApiKey: string | undefined
  private static openai: OpenAI | undefined

  /**
   * Inicializa o serviço de transcrição
   */
  static initialize(): void {
    this.openaiApiKey = process.env.OPENAI_API_KEY
    
    if (this.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: this.openaiApiKey,
        timeout: 120000, // 120s
        maxRetries: 2,
      })
      console.log(`🤖 Serviço de transcrição inicializado com OpenAI`)
    } else {
      console.log(`⚠️ OpenAI API Key não configurada`)
    }
  }

  /**
   * Transcreve áudio via OpenAI Whisper (REAL) com retry
   */
  static async transcribeWithOpenAI(audioFilePath: string, maxRetries: number = 3): Promise<TranscriptionResult> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (!this.openai || !this.openaiApiKey) {
          return {
            success: false,
            segments: [],
            error: 'OpenAI API Key não configurada'
          }
        }

        if (!fs.existsSync(audioFilePath)) {
          return {
            success: false,
            segments: [],
            error: `Arquivo de áudio não encontrado: ${audioFilePath}`
          }
        }

        console.log(`🎵 Transcrevendo áudio REAL via OpenAI Whisper (tentativa ${attempt}/${maxRetries}): ${audioFilePath}`)
        const startTime = Date.now()

        // Verificar tamanho do arquivo
        const stats = fs.statSync(audioFilePath)
        const fileSizeInMB = stats.size / (1024 * 1024)
        console.log(`📊 Tamanho do arquivo: ${fileSizeInMB.toFixed(2)} MB`)

        // OpenAI Whisper tem limite de 25MB
        if (fileSizeInMB > 25) {
          console.log(`⚠️ Arquivo muito grande (${fileSizeInMB.toFixed(2)} MB), OpenAI Whisper suporta até 25MB`)
          return {
            success: false,
            segments: [],
            error: `Arquivo muito grande: ${fileSizeInMB.toFixed(2)} MB. OpenAI Whisper suporta até 25MB`
          }
        }

        // Fazer transcrição REAL via OpenAI Whisper (SDK)
        const transcription = await this.openai.audio.transcriptions.create({
          file: fs.createReadStream(audioFilePath),
          model: "whisper-1",
          language: "pt", // Português
          response_format: "verbose_json",
          timestamp_granularities: ["segment"]
        })

        const processingTime = Date.now() - startTime
        console.log(`✅ Transcrição OpenAI REAL concluída em ${processingTime}ms (tentativa ${attempt})`)

        // Converter resultado para nosso formato
        const segments = this.convertOpenAIResultToSegments(transcription)
        
        return {
          success: true,
          segments,
          processingTime
        }

      } catch (error) {
        console.error(`❌ Erro na transcrição OpenAI REAL (tentativa ${attempt}/${maxRetries}):`, error)
        
        // Última tentativa: tentar via HTTP direto (multipart) como fallback
        if (attempt === maxRetries) {
          try {
            console.log('🌐 Tentando fallback via HTTP direto (multipart)')
            const result = await this.transcribeViaHttp(audioFilePath)
            if (result.success) return result
            return result
          } catch (httpErr) {
            return {
              success: false,
              segments: [],
              error: `Falha após ${maxRetries} tentativas e fallback HTTP: ${(httpErr as Error).message}`
            }
          }
        }
        
        // Aguardar antes da próxima tentativa (backoff exponencial)
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000) // 1s, 2s, 4s, 8s, 10s max
        console.log(`⏳ Aguardando ${waitTime}ms antes da próxima tentativa...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
    
    return {
      success: false,
      segments: [],
      error: 'Número máximo de tentativas excedido'
    }
  }

  /**
   * Fallback: chamada HTTP direta ao endpoint de transcrição
   */
  private static async transcribeViaHttp(audioFilePath: string): Promise<TranscriptionResult> {
    if (!this.openaiApiKey) {
      return { success: false, segments: [], error: 'OpenAI API Key não configurada' }
    }
    if (!fs.existsSync(audioFilePath)) {
      return { success: false, segments: [], error: `Arquivo não encontrado: ${audioFilePath}` }
    }

    const startTime = Date.now()
    
    try {
      // Ler arquivo como Buffer para evitar problemas com FormData
      const audioBuffer = fs.readFileSync(audioFilePath)
      console.log(`📊 Lendo arquivo como Buffer: ${audioBuffer.length} bytes`)
      
      const form = new FormData()
      // Campos exigidos
      form.append('model', 'whisper-1')
      form.append('language', 'pt')
      form.append('response_format', 'verbose_json')
      // Campo array deve usar [] em multipart
      form.append('timestamp_granularities[]', 'segment')
      
      // Criar Blob a partir do Buffer
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      form.append('file', audioBlob, 'audio.mp3')

      console.log(`🌐 Enviando requisição HTTP direta para OpenAI...`)
      
             const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
         method: 'POST',
         headers: {
           Authorization: `Bearer ${this.openaiApiKey}`,
         },
         body: form as any,
       })

      if (!res.ok) {
        const errTxt = await res.text().catch(() => '')
        console.log(`❌ HTTP ${res.status}: ${errTxt}`)
        return {
          success: false,
          segments: [],
          error: `HTTP ${res.status} - ${errTxt}`
        }
      }

      const json: any = await res.json()
      console.log(`✅ Fallback HTTP funcionou!`)
      const segments = this.convertOpenAIResultToSegments(json)
      const processingTime = Date.now() - startTime
      return { success: true, segments, processingTime }
      
    } catch (error) {
      console.error('❌ Erro no fallback HTTP:', error)
      return {
        success: false,
        segments: [],
        error: `Fallback HTTP falhou: ${(error as Error).message}`
            }
    }
  }

  /**
   * Converte resultado do Gemini para nosso formato
   */
  private static convertGeminiResultToSegments(transcriptionText: string): TranscriptSegment[] {
    try {
      console.log(`🔄 Convertendo resultado do Gemini...`)
      
      const segments: TranscriptSegment[] = []
      const words = transcriptionText.split(' ')
      const wordsPerSegment = 20
      const segmentDuration = 10 // 10 segundos por segmento
      
      for (let i = 0; i < words.length; i += wordsPerSegment) {
        const segmentWords = words.slice(i, i + wordsPerSegment)
        const segmentText = segmentWords.join(' ')
        
        segments.push({
          start: Math.floor((i / wordsPerSegment) * segmentDuration),
          duration: segmentDuration,
          text: segmentText,
          offset: Math.floor(i / wordsPerSegment)
        })
      }
      
      console.log(`✅ ${segments.length} segmentos convertidos do Gemini`)
      return segments
      
    } catch (error) {
      console.error('❌ Erro na conversão do Gemini:', error)
      return []
    }
  }

  /**
   * Converte resultado do OpenAI Whisper para nosso formato
   */
  private static convertOpenAIResultToSegments(transcription: any): TranscriptSegment[] {
    try {
      console.log(`🔄 Convertendo resultado do OpenAI Whisper...`)
      
      const segments: TranscriptSegment[] = []
      
      if (transcription.segments && Array.isArray(transcription.segments)) {
        // Formato verbose_json com segmentos
        transcription.segments.forEach((segment: any, index: number) => {
          if (segment.text && segment.start !== undefined && segment.end !== undefined) {
            segments.push({
              start: Math.floor(segment.start),
              duration: Math.floor(segment.end - segment.start),
              text: segment.text.trim(),
              offset: index
            })
          }
        })
      } else if (transcription.text) {
        // Formato simples, dividir em segmentos
        const text = transcription.text
        const words = text.split(' ')
        const wordsPerSegment = 20
        const segmentDuration = 10 // 10 segundos por segmento
        
        for (let i = 0; i < words.length; i += wordsPerSegment) {
          const segmentWords = words.slice(i, i + wordsPerSegment)
          const segmentText = segmentWords.join(' ')
          
          segments.push({
            start: Math.floor((i / wordsPerSegment) * segmentDuration),
            duration: segmentDuration,
            text: segmentText,
            offset: Math.floor(i / wordsPerSegment)
          })
        }
      }
      
      console.log(`✅ ${segments.length} segmentos convertidos do OpenAI Whisper`)
      return segments
      
    } catch (error) {
      console.error('❌ Erro na conversão do OpenAI:', error)
      return []
    }
  }

  /**
   * Transcreve áudio via Gemini (Google) - Fallback principal
   */
  static async transcribeWithGemini(audioFilePath: string): Promise<TranscriptionResult> {
    try {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
        return {
          success: false,
          segments: [],
          error: 'Gemini API Key não configurada'
        }
      }

      console.log(`🎵 Transcrevendo áudio via Gemini: ${audioFilePath}`)
      const startTime = Date.now()

      // Inicializar Gemini
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      // Ler arquivo como base64
      const audioBuffer = fs.readFileSync(audioFilePath)
      const base64Audio = audioBuffer.toString('base64')
      
      console.log(`📊 Arquivo convertido para base64: ${base64Audio.length} caracteres`)

      // Prompt para transcrição
      const prompt = `Transcreva este áudio em português brasileiro. Retorne apenas o texto transcrito, sem formatação adicional. Se houver múltiplos falantes, identifique-os.`

      // Enviar para Gemini com áudio
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "audio/mpeg",
            data: base64Audio
          }
        }
      ])

      const response = await result.response
      const transcriptionText = response.text()

      const processingTime = Date.now() - startTime
      console.log(`✅ Transcrição Gemini concluída em ${processingTime}ms`)

      // Converter para segmentos
      const segments = this.convertGeminiResultToSegments(transcriptionText)
      
      return {
        success: true,
        segments,
        processingTime
      }

    } catch (error) {
      console.error('❌ Erro na transcrição Gemini:', error)
      return {
        success: false,
        segments: [],
        error: (error as Error).message
      }
    }
  }

  /**
   * Transcreve áudio via AssemblyAI (alternativa)
   */
  static async transcribeWithAssemblyAI(audioFilePath: string): Promise<TranscriptionResult> {
    try {
      const apiKey = process.env.ASSEMBLYAI_API_KEY
      if (!apiKey) {
        return {
          success: false,
          segments: [],
          error: 'AssemblyAI API Key não configurada'
        }
      }

      console.log(`🎵 Transcrevendo áudio via AssemblyAI: ${audioFilePath}`)
      const startTime = Date.now()

      // Implementar AssemblyAI
      console.log(`⚠️ AssemblyAI não implementado ainda - arquivo: ${audioFilePath}`)
      
      return {
        success: false,
        segments: [],
        error: 'AssemblyAI não implementado ainda'
      }

    } catch (error) {
      console.error('❌ Erro na transcrição AssemblyAI:', error)
      return {
        success: false,
        segments: [],
        error: (error as Error).message
      }
    }
  }

  /**
   * Transcreve áudio via múltiplas APIs (fallback automático)
   */
  static async transcribeWithMultipleAPIs(audioFilePath: string): Promise<TranscriptionResult> {
    console.log(`🔄 Tentando transcrição via múltiplas APIs...`)
    
    // Tentar OpenAI primeiro
    const openaiResult = await this.transcribeWithOpenAI(audioFilePath)
    if (openaiResult.success) {
      console.log(`✅ OpenAI funcionou, retornando resultado`)
      return openaiResult
    }

    // Tentar Gemini como fallback principal
    console.log(`🔄 OpenAI falhou, tentando Gemini...`)
    const geminiResult = await this.transcribeWithGemini(audioFilePath)
    if (geminiResult.success) {
      console.log(`✅ Gemini funcionou, retornando resultado`)
      return geminiResult
    }

    // Tentar AssemblyAI como último fallback
    console.log(`🔄 Gemini falhou, tentando AssemblyAI...`)
    const assemblyResult = await this.transcribeWithAssemblyAI(audioFilePath)
    if (assemblyResult.success) {
      console.log(`✅ AssemblyAI funcionou, retornando resultado`)
      return assemblyResult
    }

    // Nenhuma API funcionou
    console.log(`❌ Nenhuma API de transcrição funcionou`)
    return {
      success: false,
      segments: [],
      error: `Todas as APIs falharam. OpenAI: ${openaiResult.error}, Gemini: ${geminiResult.error}, AssemblyAI: ${assemblyResult.error}`
    }
  }

  /**
   * Processa arquivo de áudio para transcrição
   */
  static async processAudioFile(audioFilePath: string): Promise<TranscriptionResult> {
    try {
      console.log(`🎵 Processando arquivo de áudio: ${audioFilePath}`)
      
      // Verificar se o arquivo existe
      if (!fs.existsSync(audioFilePath)) {
        return {
          success: false,
          segments: [],
          error: `Arquivo não encontrado: ${audioFilePath}`
        }
      }
      
      // Fazer transcrição
      const result = await this.transcribeWithMultipleAPIs(audioFilePath)
      
      if (result.success) {
        console.log(`🎉 Transcrição concluída com sucesso: ${result.segments.length} segmentos`)
      } else {
        console.log(`❌ Falha na transcrição: ${result.error}`)
      }
      
      return result

    } catch (error) {
      console.error('❌ Erro no processamento de áudio:', error)
      return {
        success: false,
        segments: [],
        error: (error as Error).message
      }
    }
  }

  /**
   * Converte resultado de transcrição para formato padrão
   */
  static convertToTranscriptSegments(rawTranscription: any): TranscriptSegment[] {
    try {
      console.log(`🔄 Convertendo resultado de transcrição...`)
      
      const segments: TranscriptSegment[] = []
      
      // Implementar conversão baseada no formato da API
      // Por enquanto, retornamos vazio
      
      console.log(`⚠️ Conversão de transcrição não implementada`)
      return segments

    } catch (error) {
      console.error('❌ Erro na conversão de transcrição:', error)
      return []
    }
  }
}
