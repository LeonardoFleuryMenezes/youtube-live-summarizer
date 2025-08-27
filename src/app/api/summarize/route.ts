import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const maxDuration = 300
import { YouTubeService } from '../../../lib/youtubeService'
import { AIService } from '../../../lib/aiService'
import { SummaryRequest } from '../../../types'

export async function POST(request: NextRequest) {
  try {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log(`🚀 [${requestId}] Iniciando processamento de resumo...`)
    
    const body: SummaryRequest = await request.json()
    console.log(`📥 [${requestId}] Dados recebidos:`, {
      videoUrl: body.videoUrl,
      summaryType: body.summaryType,
      language: body.language,
      maxLength: body.maxLength
    })
    
    // Validação dos dados
    if (!body.videoUrl) {
      console.log(`❌ [${requestId}] URL vazia`)
      return NextResponse.json(
        { error: 'URL_EMPTY', message: 'URL do vídeo é obrigatória' },
        { status: 400 }
      )
    }
    
    console.log(`🔗 [${requestId}] Validando URL: ${body.videoUrl}`)
    if (!YouTubeService.isValidYouTubeUrl(body.videoUrl)) {
      console.log(`❌ [${requestId}] URL inválida do YouTube`)
      return NextResponse.json(
        { error: 'INVALID_URL', message: 'URL do YouTube inválida' },
        { status: 400 }
      )
    }
    
    // Valores padrão
    const summaryType = body.summaryType || 'super-detailed'
    const language = body.language || 'pt-BR'
    const maxLength = body.maxLength || 5000
    
    console.log(`⚙️ [${requestId}] Configurações:`, { summaryType, language, maxLength })
    
    // Extrair ID do vídeo
    console.log(`🔍 [${requestId}] Extraindo ID do vídeo...`)
    const videoId = YouTubeService.extractVideoId(body.videoUrl)
    if (!videoId) {
      console.log(`❌ [${requestId}] Falha ao extrair ID do vídeo`)
      return NextResponse.json(
        { error: 'VIDEO_ID_EXTRACTION_FAILED', message: 'Não foi possível extrair o ID do vídeo' },
        { status: 400 }
      )
    }
    
    console.log(`✅ [${requestId}] ID do vídeo extraído: ${videoId}`)
    
    // Obter informações do vídeo
    console.log(`📹 [${requestId}] Obtendo informações do vídeo...`)
    const videoInfo = await YouTubeService.getVideoInfo(videoId)
    console.log(`✅ [${requestId}] Informações do vídeo obtidas`)
    
    // Obter transcrição
    console.log(`📝 [${requestId}] Obtendo transcrição...`)
    const transcript = await YouTubeService.getTranscript(videoId)
    
    if (!transcript || transcript.length === 0) {
      console.log(`❌ [${requestId}] Transcrição não encontrada`)
      return NextResponse.json(
        { error: 'TRANSCRIPT_NOT_FOUND', message: 'Transcrição não encontrada para este vídeo' },
        { status: 404 }
      )
    }
    
    console.log(`✅ [${requestId}] Transcrição obtida: ${transcript.length} segmentos`)
    
    // Gerar resumo com IA
    console.log(`🧠 [${requestId}] Gerando resumo com IA...`)
    const summaryRequest: SummaryRequest = {
      videoUrl: body.videoUrl,
      summaryType,
      language,
      maxLength
    }
    
    const summary = await AIService.generateSummary(transcript, summaryRequest)
    console.log(`✅ [${requestId}] Resumo gerado com sucesso`)
    
    // Adicionar informações do vídeo ao resumo
    const response = {
      ...summary,
      videoInfo,
      transcriptLength: transcript.length,
      processingTime: Date.now(),
      requestId,
      timestamp: new Date().toISOString()
    }
    
    console.log(`🎉 [${requestId}] Processamento concluído com sucesso!`)
    
    // Retornar resposta com headers anti-cache
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Request-ID': requestId,
        'X-Timestamp': new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Erro ao processar resumo:', error)
    
    return NextResponse.json(
      { 
        error: 'INTERNAL_ERROR', 
        message: 'Erro interno do servidor',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'YouTube Live Summarizer API',
    version: '1.0.0',
    status: 'Funcionando perfeitamente com URLs reais!',
    endpoints: {
      POST: '/api/summarize - Processa resumo de live do YouTube',
      GET: '/api/summarize - Informações da API'
    },
    features: [
      '✅ Processamento de URLs reais do YouTube',
      '✅ Extração de ID de vídeo',
      '✅ Geração de transcrição simulada',
      '✅ Análise de sentimento',
      '✅ Identificação de tópicos',
      '✅ Resumos personalizáveis'
    ]
  })
}
