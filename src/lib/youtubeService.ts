import { TranscriptSegment } from '../types'
import { TranscriptionService } from './transcriptionService'
import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'

const execAsync = promisify(exec)

export class YouTubeService {
  /**
   * Extrai o ID do vídeo de uma URL do YouTube
   */
  static extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  /**
   * Valida se uma URL é válida do YouTube
   */
  static isValidYouTubeUrl(url: string): boolean {
    console.log(`🔗 Validando URL: ${url}`)
    const videoId = this.extractVideoId(url)
    const isValid = videoId !== null && videoId.length === 11
    
    if (isValid) {
      console.log(`✅ URL válida do YouTube. ID: ${videoId}`)
    } else {
      console.log(`❌ URL inválida do YouTube`)
    }
    
    return isValid
  }

  /**
   * Obtém informações REAIS do vídeo do YouTube
   */
  static async getVideoInfo(videoId: string): Promise<any> {
    try {
      console.log(`🔍 Obtendo informações REAIS do vídeo: ${videoId}`)
      
      // Tentar obter informações reais do YouTube
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
      
      if (response.ok) {
        const videoData = await response.json()
        console.log(`✅ Informações reais obtidas do YouTube: ${videoData.title}`)
        
        return {
          id: videoId,
          title: videoData.title,
          description: videoData.description || `Vídeo do YouTube: ${videoData.title}`,
          thumbnail: videoData.thumbnail_url,
          duration: "Duração não disponível via oEmbed",
          publishedAt: new Date().toISOString(),
          channelTitle: videoData.author_name || "YouTube Channel",
          viewCount: "Visualizações não disponíveis via oEmbed",
          isLive: false,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          isRealData: true
        }
      } else {
        console.log(`⚠️ Não foi possível obter dados reais, usando fallback`)
        // Fallback para dados simulados se a API falhar
        return this.getFallbackVideoInfo(videoId)
      }
    } catch (error) {
      console.error('Erro ao obter informações reais do vídeo:', error)
      console.log(`⚠️ Usando dados simulados como fallback`)
      return this.getFallbackVideoInfo(videoId)
    }
  }

  /**
   * 🎯 TRANSCRIÇÃO REAL DO VÍDEO - SOLUÇÃO COMPLETA
   * Obtém a transcrição REAL via múltiplas estratégias
   */
  static async getTranscript(videoId: string): Promise<TranscriptSegment[]> {
    console.log(`🎯 OBTENDO TRANSCRIÇÃO REAL DO VÍDEO: ${videoId}`)
    
    try {
      // ESTRATÉGIA 1: Transcrição via legendas do YouTube (mais rápida)
      console.log(`📝 Estratégia 1: Legendas/transcrição do YouTube`)
      const youtubeTranscript = await this.getYouTubeTranscript(videoId)
      if (youtubeTranscript && youtubeTranscript.length > 0) {
        console.log(`✅ TRANSCRIÇÃO REAL obtida via YouTube: ${youtubeTranscript.length} segmentos`)
        return youtubeTranscript
      }

      // ESTRATÉGIA 2: Extração de áudio e transcrição via IA (mais precisa)
      console.log(`🎵 Estratégia 2: Extração de áudio + transcrição via IA`)
      const audioTranscript = await this.extractAudioAndTranscribe(videoId)
      if (audioTranscript && audioTranscript.length > 0) {
        console.log(`✅ TRANSCRIÇÃO REAL obtida via áudio + IA: ${audioTranscript.length} segmentos`)
        return audioTranscript
      }

      // ESTRATÉGIA 3: Scraping avançado da página
      console.log(`🌐 Estratégia 3: Scraping avançado da página`)
      const scrapedTranscript = await this.advancedPageScraping(videoId)
      if (scrapedTranscript && scrapedTranscript.length > 0) {
        console.log(`✅ TRANSCRIÇÃO REAL obtida via scraping: ${scrapedTranscript.length} segmentos`)
        return scrapedTranscript
      }

      // Se nenhuma estratégia funcionar, informar o usuário
      console.log(`❌ NENHUMA ESTRATÉGIA FUNCIONOU`)
      console.log(`⚠️ O vídeo pode não ter legendas e a extração de áudio falhou`)
      
      return this.generateNoTranscriptMessage(videoId)
      
    } catch (error) {
      console.error('❌ ERRO ao obter transcrição:', error)
      return this.generateNoTranscriptMessage(videoId)
    }
  }

  /**
   * ESTRATÉGIA 1: Transcrição via legendas do YouTube
   */
  private static async getYouTubeTranscript(videoId: string): Promise<TranscriptSegment[]> {
    try {
      console.log(`📝 Tentando obter transcrição via legendas do YouTube...`)
      
      // URLs para tentar obter transcrição
      const urls = [
        `https://www.youtube.com/api/timedtext?v=${videoId}`,
        `https://www.youtube.com/api/timedtext?lang=pt&v=${videoId}`,
        `https://www.youtube.com/api/timedtext?lang=pt-BR&v=${videoId}`,
        `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`,
        `https://www.youtube.com/api/timedtext?lang=auto&v=${videoId}`
      ]
      
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i]
        try {
          console.log(`🌐 Tentativa ${i + 1}: ${url}`)
          
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/xml,text/xml,*/*;q=0.9',
              'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
            }
          })
          
          if (response.ok) {
            const xmlText = await response.text()
            console.log(`✅ Resposta obtida, tamanho: ${xmlText.length} caracteres`)
            
            // Verificar se é uma transcrição válida
            if (xmlText.length > 200 && !xmlText.includes('error') && !xmlText.includes('not found')) {
              const transcript = this.parseTranscriptXML(xmlText)
              if (transcript && transcript.length > 0) {
                console.log(`🎉 TRANSCRIÇÃO REAL PARSEADA: ${transcript.length} segmentos`)
                return transcript
              }
            } else {
              console.log(`⚠️ Resposta muito curta ou contém erro`)
            }
          } else {
            console.log(`⚠️ Falha na URL ${i + 1}: ${response.status}`)
          }
          
        } catch (urlError) {
          console.log(`⚠️ Erro na URL ${i + 1}:`, (urlError as Error).message)
          continue
        }
      }
      
      console.log(`❌ Nenhuma API retornou transcrição válida`)
      return []
      
    } catch (error) {
      console.error('❌ Erro na transcrição via YouTube:', error)
      return []
    }
  }

  /**
   * ESTRATÉGIA 2: Extração de áudio + transcrição via IA (REAL)
   */
  private static async extractAudioAndTranscribe(videoId: string): Promise<TranscriptSegment[]> {
    try {
      console.log(`🎵 Iniciando extração de áudio REAL e transcrição via IA...`)
      
      // PASSO 1: Verificar se o arquivo de áudio já existe
      const tempDir = path.join(process.cwd(), 'temp_audio')
      const existingAudioFile = path.join(tempDir, `audio_${videoId}.mp3`)
      
      if (fs.existsSync(existingAudioFile)) {
        console.log(`✅ Arquivo de áudio já existe: ${existingAudioFile}`)
        const stats = fs.statSync(existingAudioFile)
        console.log(`📊 Tamanho do arquivo: ${stats.size} bytes`)
        
        // PASSO 2: Fazer transcrição REAL via IA
        console.log(`🤖 Fazendo transcrição REAL via IA...`)
        const transcription = await this.transcribeAudioWithAI(existingAudioFile)
        if (transcription && transcription.success && transcription.segments.length > 0) {
          console.log(`🎉 TRANSCRIÇÃO REAL via IA: ${transcription.segments.length} segmentos`)
          return transcription.segments
        }
        
        console.log(`❌ Transcrição via IA falhou`)
        return []
      }
      
      // PASSO 1: Verificar se yt-dlp está disponível
      const ytDlpAvailable = await this.checkYtDlpAvailability()
      if (!ytDlpAvailable) {
        console.log(`❌ yt-dlp não está disponível`)
        return []
      }

      // PASSO 2: Extrair áudio REAL via yt-dlp
      console.log(`🎵 Extraindo áudio REAL do vídeo...`)
      const audioExtraction = await this.extractAudioWithYtDlp(videoId)
      if (!audioExtraction.success) {
        console.log(`❌ Falha na extração de áudio: ${audioExtraction.error}`)
        return []
      }

      console.log(`✅ Áudio extraído com sucesso: ${audioExtraction.filePath}`)
      
      // PASSO 3: Fazer transcrição REAL via IA
      console.log(`🤖 Fazendo transcrição REAL via IA...`)
      if (!audioExtraction.filePath) {
        console.log(`❌ Caminho do arquivo de áudio não definido`)
        return []
      }
      
      const transcription = await this.transcribeAudioWithAI(audioExtraction.filePath)
      if (transcription && transcription.success && transcription.segments.length > 0) {
        console.log(`🎉 TRANSCRIÇÃO REAL via IA: ${transcription.segments.length} segmentos`)
        
        // Limpar arquivo temporário
        await this.cleanupTempFile(audioExtraction.filePath)
        
        return transcription.segments
      }
      
      console.log(`❌ Transcrição via IA falhou`)
      return []
      
    } catch (error) {
      console.error('❌ Erro na extração de áudio + transcrição:', error)
      return []
    }
  }

  /**
   * Verifica se yt-dlp está disponível (REAL)
   */
  private static async checkYtDlpAvailability(): Promise<boolean> {
    try {
      console.log(`🔍 Verificando disponibilidade do yt-dlp...`)
      
      // Tentar usar yt-dlp do PATH primeiro
      let command = 'yt-dlp --version'
      
      // Se não funcionar, tentar usar o caminho completo
      try {
        const { stdout, stderr } = await execAsync(command)
        
        if (stdout && !stderr) {
          console.log(`✅ yt-dlp disponível: ${stdout.trim()}`)
          return true
        } else {
          console.log(`❌ yt-dlp não disponível: ${stderr}`)
          return false
        }
      } catch (pathError) {
        console.log(`⚠️ yt-dlp não encontrado no PATH, tentando caminho completo...`)
        
        // Tentar usar o caminho completo do Python
        command = 'python -m yt_dlp --version'
        const { stdout, stderr } = await execAsync(command)
        
        if (stdout && !stderr) {
          console.log(`✅ yt-dlp disponível via Python: ${stdout.trim()}`)
          return true
        } else {
          console.log(`❌ yt-dlp não disponível via Python: ${stderr}`)
          return false
        }
      }
      
    } catch (error) {
      console.log(`❌ yt-dlp não disponível:`, (error as Error).message)
      return false
    }
  }

  /**
   * Extração de áudio REAL via yt-dlp
   */
  private static async extractAudioWithYtDlp(videoId: string): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      console.log(`🎵 Extraindo áudio REAL via yt-dlp...`)
      
      // Criar diretório temporário se não existir
      const tempDir = path.join(process.cwd(), 'temp_audio')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }
      
      // Nome do arquivo de saída
      const outputFile = path.join(tempDir, `audio_${videoId}.mp3`)
      
      // Comando yt-dlp para extrair áudio com ffmpeg configurado
      const ffmpegPath = path.join(process.cwd(), 'ffmpeg', 'ffmpeg-master-latest-win64-gpl', 'bin')
      
      // Tentar usar yt-dlp do PATH primeiro, senão usar Python
      let ytDlpCommand = 'yt-dlp'
      try {
        await execAsync('yt-dlp --version')
      } catch (error) {
        console.log(`⚠️ yt-dlp não encontrado no PATH, usando Python`)
        ytDlpCommand = 'python -m yt_dlp'
      }
      
      // Construir comando como array para evitar problemas de parsing
      const commandArgs = [
        ytDlpCommand,
        '-f', 'bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '--ffmpeg-location', ffmpegPath,
        '-o', outputFile,
        `https://www.youtube.com/watch?v=${videoId}`
      ]
      
      console.log(`🚀 Executando comando: ${commandArgs.join(' ')}`)
      
      // Usar spawn para evitar problemas de parsing
      return new Promise((resolve) => {
        const process = spawn(commandArgs[0], commandArgs.slice(1), {
          stdio: 'pipe',
          timeout: 300000 // 5 minutos
        })
        
        let stdout = ''
        let stderr = ''
        
        process.stdout.on('data', (data) => {
          stdout += data.toString()
        })
        
        process.stderr.on('data', (data) => {
          stderr += data.toString()
        })
        
        process.on('close', (code) => {
          if (code === 0) {
            // Verificar se o arquivo foi criado
            if (fs.existsSync(outputFile)) {
              const stats = fs.statSync(outputFile)
              console.log(`✅ Arquivo de áudio criado: ${outputFile} (${stats.size} bytes)`)
              resolve({ success: true, filePath: outputFile })
            } else {
              console.log(`❌ Arquivo de áudio não foi criado`)
              resolve({ success: false, error: 'Arquivo não foi criado' })
            }
          } else {
            console.log(`❌ Erro na extração: ${stderr}`)
            resolve({ success: false, error: stderr })
          }
        })
        
        process.on('error', (error) => {
          console.error('❌ Erro na execução do comando:', error)
          resolve({ success: false, error: error.message })
        })
        
        process.on('timeout', () => {
          console.log('⏰ Timeout na extração de áudio')
          process.kill()
          resolve({ success: false, error: 'Timeout na extração de áudio' })
        })
      })
    } catch (error) {
      console.error('❌ Erro na extração de áudio:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Transcrição REAL de áudio via IA
   */
  private static async transcribeAudioWithAI(audioFilePath: string): Promise<any> {
    try {
      console.log(`🤖 Fazendo transcrição REAL via IA do arquivo: ${audioFilePath}`)
      
      // Inicializar serviço de transcrição
      TranscriptionService.initialize()
      
      // Fazer transcrição via múltiplas APIs
      const result = await TranscriptionService.transcribeWithMultipleAPIs(audioFilePath)
      
      if (result.success) {
        console.log(`✅ Transcrição via IA concluída: ${result.segments.length} segmentos`)
        return result
      } else {
        console.log(`❌ Falha na transcrição via IA: ${result.error}`)
        return result
      }
      
    } catch (error) {
      console.error('❌ Erro na transcrição via IA:', error)
      return {
        success: false,
        segments: [],
        error: (error as Error).message
      }
    }
  }

  /**
   * Limpeza de arquivos temporários (REAL)
   */
  private static async cleanupTempFile(filePath: string): Promise<void> {
    try {
      console.log(`🧹 Limpando arquivo temporário: ${filePath}`)
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log(`✅ Arquivo temporário removido: ${filePath}`)
      }
      
    } catch (error) {
      console.error('❌ Erro ao limpar arquivo temporário:', error)
    }
  }

  /**
   * ESTRATÉGIA 3: Scraping avançado da página
   */
  private static async advancedPageScraping(videoId: string): Promise<TranscriptSegment[]> {
    try {
      console.log(`🌐 Fazendo scraping avançado da página...`)
      
      // URL da página do vídeo
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
      
      const response = await fetch(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
        }
      })
      
      if (!response.ok) {
        console.log(`❌ Falha ao acessar página: ${response.status}`)
        return []
      }
      
      const html = await response.text()
      console.log(`✅ Página carregada, analisando HTML (${html.length} caracteres)...`)
      
      // Procurar por dados de transcrição no HTML
      const transcriptMatch = html.match(/ytInitialData["\s]*[:=]["\s]*({.+?});\s*<\/script>/)
      
      if (transcriptMatch) {
        try {
          const data = JSON.parse(transcriptMatch[1])
          console.log(`🔍 Dados encontrados no HTML, procurando transcrição...`)
          
          // Procurar por dados de transcrição nos dados
          const transcriptData = this.findTranscriptInData(data)
          if (transcriptData && transcriptData.length > 0) {
            console.log(`✅ Dados de transcrição encontrados: ${transcriptData.length} itens`)
            
            // Converter para nosso formato
            const segments: TranscriptSegment[] = []
            for (let i = 0; i < transcriptData.length; i++) {
              const item = transcriptData[i]
              if (item.text && (item.start || item.offset || item.time)) {
                const start = item.start || Math.floor((item.offset || item.time || 0) / 1000)
                const duration = item.duration || 3
                
                segments.push({
                  start: Math.floor(start),
                  duration: Math.floor(duration),
                  text: item.text,
                  offset: i
                })
              }
            }
            
            if (segments.length > 0) {
              console.log(`🎉 ${segments.length} segmentos de transcrição extraídos`)
              return segments
            }
          }
        } catch (parseError) {
          console.log(`⚠️ Erro ao parsear dados do HTML:`, (parseError as Error).message)
        }
      }
      
      console.log(`❌ Nenhuma transcrição encontrada no HTML`)
      return []
      
    } catch (error) {
      console.error('❌ Erro no scraping avançado:', error)
      return []
    }
  }

  /**
   * Procura por dados de transcrição nos dados do HTML
   */
  private static findTranscriptInData(data: any): any[] | null {
    try {
      // Função recursiva para procurar por dados de transcrição
      const findTranscriptData = (obj: any, path: string = ''): any => {
        if (!obj || typeof obj !== 'object') return null
        
        // Procurar por chaves que podem conter transcrição
        const transcriptKeys = ['transcript', 'captions', 'subtitles', 'timedText', 'text', 'segments']
        
        for (const key of transcriptKeys) {
          if (obj[key] && Array.isArray(obj[key])) {
            console.log(`🎯 Encontrado array de transcrição em: ${path}.${key}`)
            return obj[key]
          }
        }
        
        // Procurar recursivamente
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'object' && value !== null) {
            const result = findTranscriptData(value, `${path}.${key}`)
            if (result) return result
          }
        }
        
        return null
      }
      
      return findTranscriptData(data)
      
    } catch (error) {
      console.error('❌ Erro ao procurar transcrição nos dados:', error)
      return null
    }
  }

  /**
   * Parse XML da transcrição
   */
  private static parseTranscriptXML(xmlText: string): TranscriptSegment[] {
    try {
      console.log(`🔍 Parseando XML da transcrição...`)
      
      const segments: TranscriptSegment[] = []
      
      // Procurar por tags <text> com start e dur
      const textRegex = /<text start="([^"]+)" dur="([^"]+)">([^<]+)<\/text>/g
      let match
      let index = 0
      
      while ((match = textRegex.exec(xmlText)) !== null) {
        const start = parseFloat(match[1])
        const duration = parseFloat(match[2])
        const text = match[3].trim()
        
        if (text && !isNaN(start) && !isNaN(duration) && text.length > 2) {
          segments.push({
            start: Math.floor(start),
            duration: Math.floor(duration),
            text: text,
            offset: index++
          })
        }
      }
      
      // Se não encontrou, tentar formato alternativo
      if (segments.length === 0) {
        console.log(`⚠️ Formato padrão não encontrado, tentando alternativo...`)
        
        const altRegex = /<text start="([^"]+)">([^<]+)<\/text>/g
        while ((match = altRegex.exec(xmlText)) !== null) {
          const start = parseFloat(match[1])
          const text = match[2].trim()
          
          if (text && !isNaN(start) && text.length > 2) {
            segments.push({
              start: Math.floor(start),
              duration: 3, // Duração padrão
              text: text,
              offset: index++
            })
          }
        }
      }
      
      if (segments.length > 0) {
        console.log(`✅ ${segments.length} segmentos de transcrição parseados`)
        
        // Ordenar por tempo de início
        segments.sort((a, b) => a.start - b.start)
        
        // Remover duplicatas
        const uniqueSegments = segments.filter((segment, index, self) => 
          index === 0 || segment.text !== self[index - 1].text
        )
        
        console.log(`🎯 ${uniqueSegments.length} segmentos únicos após filtragem`)
        return uniqueSegments
      }
      
      console.log(`❌ Nenhum segmento de transcrição encontrado no XML`)
      return []
      
    } catch (error) {
      console.error('❌ Erro ao parsear XML:', error)
      return []
    }
  }

  /**
   * Mensagem quando não há transcrição disponível
   */
  private static generateNoTranscriptMessage(videoId: string): TranscriptSegment[] {
    console.log(`📝 Gerando mensagem de sem transcrição para ${videoId}`)
    
    const segments: TranscriptSegment[] = []
    let currentTime = 0
    let index = 0
    
    // Adicionar informações sobre as estratégias tentadas
    segments.push({
      text: `Este vídeo não possui transcrição/legendas disponíveis`,
      start: currentTime,
      duration: 5,
      offset: index++
    })
    currentTime += 5
    
    segments.push({
      text: `O YouTube Live Summarizer tentou múltiplas estratégias:`,
      start: currentTime,
      duration: 4,
      offset: index++
    })
    currentTime += 4
    
    segments.push({
      text: `1. Legendas/transcrição do YouTube`,
      start: currentTime,
      duration: 3,
      offset: index++
    })
    currentTime += 3
    
    segments.push({
      text: `2. Extração de áudio + transcrição via IA`,
      start: currentTime,
      duration: 4,
      offset: index++
    })
    currentTime += 4
    
    segments.push({
      text: `3. Scraping avançado da página`,
      start: currentTime,
      duration: 3,
      offset: index++
    })
    currentTime += 3
    
    segments.push({
      text: `Para transcrição via áudio, verifique se yt-dlp está instalado`,
      start: currentTime,
      duration: 6,
      offset: index++
    })
    currentTime += 6
    
    segments.push({
      text: `ID do vídeo: ${videoId}`,
      start: currentTime,
      duration: 2,
      offset: index++
    })
    
    console.log(`⚠️ Mensagem de sem transcrição gerada: ${segments.length} segmentos`)
    return segments
  }

  /**
   * Dados simulados como fallback
   */
  private static getFallbackVideoInfo(videoId: string): any {
    const hash = this.simpleHash(videoId)
    const titles = [
      `Vídeo sobre Tecnologia - ${videoId}`,
      `Conteúdo Educativo - ${videoId}`,
      `Análise Profunda - ${videoId}`,
      `Tutorial Completo - ${videoId}`,
      `Discussão Interessante - ${videoId}`,
      `Exploração de Conceitos - ${videoId}`,
      `Guia Prático - ${videoId}`,
      `Reflexões sobre o Futuro - ${videoId}`
    ]
    
    const channels = [
      'Tech Channel', 'Education Hub', 'Knowledge Base', 'Learning Center', 'Insight Lab'
    ]
    
    return {
      id: videoId,
      title: titles[hash % titles.length],
      description: `Dados simulados - não foi possível obter informações reais do YouTube`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: `${Math.floor((hash % 60) + 1)}:${(hash % 60).toString().padStart(2, '0')}`,
      publishedAt: new Date(Date.now() - (hash % 30) * 24 * 60 * 60 * 1000).toISOString(),
      channelTitle: channels[hash % channels.length],
      viewCount: `${(hash % 1000 + 100).toLocaleString()}+`,
      isLive: false,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      isRealData: false
    }
  }

  /**
   * Hash simples para gerar dados consistentes
   */
  private static simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }
}
