import ytdl from 'ytdl-core';
import { YouTubeApiService } from './youtubeApiConfig';
import { YouTubeAudioExtractor } from './youtubeAudioExtractor';
import { GeminiAudioService } from './geminiAudioService';

export interface TranscriptSegment {
  start: number;
  duration: number;
  text: string;
}

export interface VideoInfo {
  title: string;
  description: string;
  duration: string;
  viewCount: string;
  uploadDate: string;
  channelTitle: string;
  thumbnail?: string;
}

export class YouTubeService {
  private static readonly YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
  private static readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

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
   * Obtém transcrição do vídeo usando múltiplas estratégias
   */
  static async getTranscript(videoId: string): Promise<TranscriptSegment[]> {
    console.log(`📹 Tentando obter transcrição REAL do vídeo: ${videoId}`);
    
    try {
      // Estratégia 1: Tentar API oficial do YouTube (PRIORIDADE MÁXIMA)
      try {
        const apiTranscript = await YouTubeApiService.getTranscript(videoId);
        if (apiTranscript && apiTranscript.items && apiTranscript.items.length > 0) {
          console.log(`✅ Transcrição obtida via API oficial: ${apiTranscript.items.length} itens`);
          return this.convertApiTranscriptToSegments(apiTranscript);
        }
      } catch (error) {
        console.log(`⚠️ API oficial falhou, tentando alternativas:`, error);
      }

      // Estratégia 2: Tentar obter legendas via ytdl-core
      try {
        const captions = await this.getCaptionsViaYtdl(videoId);
        if (captions && captions.length > 0) {
          console.log(`✅ Legendas obtidas via ytdl-core: ${captions.length} segmentos`);
          return captions;
        }
      } catch (error) {
        console.log(`⚠️ ytdl-core falhou, tentando transcrição de áudio real:`, error);
      }

      // Estratégia 3: TRANSCRIÇÃO DE ÁUDIO REAL VIA GEMINI (PRIORIDADE ALTA)
      console.log(`🎵 FORÇANDO transcrição de áudio REAL via Gemini...`);
      
      // Verificar se yt-dlp está instalado
      const ytDlpInstalled = await YouTubeAudioExtractor.checkYtDlpInstalled();
      if (ytDlpInstalled) {
        console.log(`✅ yt-dlp detectado, extraindo áudio real...`);
        
        try {
          // Extrair áudio real do vídeo
          const audioExtraction = await YouTubeAudioExtractor.extractAudio(videoId);
          if (audioExtraction.success && audioExtraction.audioFilePath) {
            console.log(`✅ Áudio extraído: ${audioExtraction.audioFilePath}`);
            
            // Transcrever via Gemini
            const geminiTranscription = await GeminiAudioService.transcribeYouTubeAudio(videoId);
            if (geminiTranscription && geminiTranscription.segments.length > 0) {
              console.log(`✅ Transcrição Gemini obtida: ${geminiTranscription.segments.length} segmentos`);
              
              // Converter para formato TranscriptSegment
              const segments = geminiTranscription.segments.map(seg => ({
                start: seg.start,
                duration: seg.end - seg.start,
                text: seg.text
              }));
              
              return segments;
            } else {
              console.log(`⚠️ Transcrição Gemini falhou, tentando outras estratégias`);
            }
          } else {
            console.log(`⚠️ Falha na extração de áudio: ${audioExtraction.error}`);
          }
        } catch (error) {
          console.log(`⚠️ Erro na transcrição de áudio real:`, error);
        }
      } else {
        console.log(`⚠️ yt-dlp não instalado, pulando transcrição de áudio`);
        console.log(`📋 Instruções: ${YouTubeAudioExtractor.getInstallationInstructions()}`);
      }

      // Estratégia 4: Fallback para transcrição antiga (se Gemini falhar)
      try {
        const audioTranscription = await this.transcribeAudioFromVideo(videoId);
        if (audioTranscription && audioTranscription.length > 0) {
          console.log(`✅ Transcrição de áudio obtida: ${audioTranscription.length} segmentos`);
          return audioTranscription;
        }
      } catch (error) {
        console.log(`⚠️ Transcrição antiga falhou:`, error);
      }

      // Estratégia 5: Scraping inteligente como último recurso
      try {
        const scrapedContent = await this.scrapeVideoContent(videoId);
        if (scrapedContent && scrapedContent.length > 0) {
          console.log(`✅ Conteúdo obtido via scraping: ${scrapedContent.length} segmentos`);
          return scrapedContent;
        }
      } catch (error) {
        console.log(`⚠️ Scraping falhou:`, error);
      }

      // Estratégia 6: oEmbed como último recurso (APENAS se tudo falhar)
      try {
        const oembedInfo = await YouTubeApiService.getVideoInfoOEmbed(videoId);
        if (oembedInfo && oembedInfo.title) {
          console.log(`⚠️ Usando oEmbed como último recurso: ${oembedInfo.title}`);
          // Criar segmento básico com informações do oEmbed
          return [{
            start: 0,
            duration: 0,
            text: `${oembedInfo.title}. ${oembedInfo.description || 'Descrição não disponível'}. Canal: ${oembedInfo.author_name || 'Autor não disponível'}.`
          }];
        }
      } catch (error) {
        console.log(`⚠️ oEmbed falhou:`, error);
      }

      // Se todas as estratégias falharem, retornar mensagem informativa
      return this.generateNoTranscriptMessage(videoId);
    } catch (error) {
      console.error(`❌ Erro ao obter transcrição:`, error);
      return this.generateNoTranscriptMessage(videoId);
    }
  }

  /**
   * Converter transcrição da API para segmentos
   */
  private static convertApiTranscriptToSegments(apiTranscript: any): TranscriptSegment[] {
    try {
      const segments: TranscriptSegment[] = [];
      
      if (apiTranscript.items && apiTranscript.items.length > 0) {
        apiTranscript.items.forEach((item: any, index: number) => {
          if (item.snippet && item.snippet.text) {
            segments.push({
              start: index * 10,
              duration: 10,
              text: item.snippet.text
            });
          }
        });
      }
      
      return segments;
    } catch (error) {
      console.error(`❌ Erro ao converter transcrição da API:`, error);
      return [];
    }
  }

  /**
   * Estratégia 1: Obter legendas via ytdl-core
   */
  private static async getCaptionsViaYtdl(videoId: string): Promise<TranscriptSegment[] | null> {
    try {
      console.log(`🔍 Tentando obter legendas via ytdl-core...`);
      
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const info = await ytdl.getInfo(videoUrl);
      
      // Verificar se há legendas disponíveis
      if ((info as any).captions && Object.keys((info as any).captions).length > 0) {
        console.log(`📝 Legendas disponíveis: ${Object.keys((info as any).captions).join(', ')}`);
        
        // Tentar obter legendas em português ou inglês
        const captionTrack = (info as any).captions['pt'] || (info as any).captions['pt-BR'] || (info as any).captions['en'] || (info as any).captions['en-US'];
        
        if (captionTrack && captionTrack.length > 0) {
          const captionUrl = captionTrack[0].url;
          const response = await fetch(captionUrl);
          const captionText = await response.text();
          
          // Converter formato de legenda para TranscriptSegment
          return this.parseCaptionFormat(captionText);
        }
      }
      
      console.log(`❌ Nenhuma legenda disponível via ytdl-core`);
      return null;
    } catch (error) {
      console.error(`❌ Erro ao obter legendas via ytdl-core:`, error);
      return null;
    }
  }

  /**
   * Estratégia 2: Transcrição de áudio usando OpenAI Whisper
   */
  private static async transcribeAudioFromVideo(videoId: string): Promise<TranscriptSegment[] | null> {
    try {
      console.log(`🎵 Tentando transcrição de áudio...`);
      
      if (!this.OPENAI_API_KEY) {
        console.log(`❌ Chave da API OpenAI não configurada`);
        return null;
      }

      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      // Extrair áudio usando ytdl-core
      const audioStream = ytdl(videoUrl, { 
        filter: 'audioonly',
        quality: 'highestaudio'
      });

      // Converter stream para buffer
      const chunks: Buffer[] = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }
      
      if (chunks.length === 0) {
        console.log(`❌ Não foi possível extrair áudio`);
        return null;
      }

      const audioBuffer = Buffer.concat(chunks);
      console.log(`✅ Áudio extraído: ${audioBuffer.length} bytes`);

      // Usar OpenAI Whisper para transcrição
      const transcription = await this.callOpenAIWhisper(audioBuffer);
      
      if (transcription) {
        // Dividir transcrição em segmentos
        const segments = transcription.split('.').filter(s => s.trim().length > 0);
        return segments.map((text, index) => ({
          start: index * 10, // Aproximação de tempo
          duration: 10,
          text: text.trim() + '.'
        }));
      }

      return null;
    } catch (error) {
      console.error(`❌ Erro na transcrição de áudio:`, error);
      return null;
    }
  }

  /**
   * Chamar OpenAI Whisper para transcrição
   */
  private static async callOpenAIWhisper(audioBuffer: Buffer): Promise<string | null> {
    try {
      console.log(`🤖 Chamando OpenAI Whisper...`);
      
      const formData = new FormData();
      formData.append('file', new Blob([audioBuffer], { type: 'audio/webm' }), 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'pt');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Transcrição Whisper obtida: ${result.text?.length || 0} caracteres`);
      
      return result.text || null;
    } catch (error) {
      console.error(`❌ Erro ao chamar OpenAI Whisper:`, error);
      return null;
    }
  }

  /**
   * Estratégia 3: Scraping inteligente (mantido como fallback)
   */
  private static async scrapeVideoContent(videoId: string): Promise<TranscriptSegment[] | null> {
    try {
      console.log(`🌐 Scraping avançado da página...`);
      
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await fetch(videoUrl);
      const html = await response.text();
      
      if (html.length < 1000) {
        console.log(`❌ HTML muito pequeno, possivelmente bloqueado`);
        return null;
      }

      // Extrair informações básicas do vídeo
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const descriptionMatch = html.match(/"description":"([^"]+)"/);
      
      if (titleMatch && descriptionMatch) {
        const title = titleMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        const description = descriptionMatch[1].replace(/\\n/g, ' ').replace(/\\"/g, '"');
        
        // Criar segmento único com as informações disponíveis
        return [{
          start: 0,
          duration: 0,
          text: `${title}. ${description}`
        }];
      }

      return null;
    } catch (error) {
      console.error(`❌ Erro no scraping:`, error);
      return null;
    }
  }

  /**
   * Parsear formato de legenda para TranscriptSegment
   */
  private static parseCaptionFormat(captionText: string): TranscriptSegment[] {
    try {
      const segments: TranscriptSegment[] = [];
      const lines = captionText.split('\n');
      
      let currentSegment: Partial<TranscriptSegment> = {};
      
      for (const line of lines) {
        if (line.includes('-->')) {
          // Linha de tempo
          const timeMatch = line.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
          if (timeMatch) {
            currentSegment.start = this.parseTimeToSeconds(timeMatch[1]);
            const endTime = this.parseTimeToSeconds(timeMatch[2]);
            currentSegment.duration = endTime - currentSegment.start;
          }
        } else if (line.trim() && currentSegment.start !== undefined) {
          // Linha de texto
          currentSegment.text = line.trim();
          if (currentSegment.text && currentSegment.duration !== undefined) {
            segments.push(currentSegment as TranscriptSegment);
            currentSegment = {};
          }
        }
      }
      
      return segments;
    } catch (error) {
      console.error(`❌ Erro ao parsear legendas:`, error);
      return [];
    }
  }

  /**
   * Converter tempo de legenda para segundos
   */
  private static parseTimeToSeconds(timeString: string): number {
    const parts = timeString.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseFloat(parts[2].replace(',', '.'));
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Gerar mensagem informativa quando não há transcrição
   */
  private static generateNoTranscriptMessage(videoId: string): TranscriptSegment[] {
    const message = `Não foi possível obter transcrição ou legendas para este vídeo. O sistema tentou múltiplas estratégias: legendas via YouTube, transcrição de áudio via IA, e análise da página. Para melhorar os resultados, certifique-se de que o vídeo tenha legendas ativadas ou que as APIs estejam configuradas corretamente.`;
    
    return [{
      start: 0,
      duration: 0,
      text: message
    }];
  }

  /**
   * Obter informações básicas do vídeo
   */
  static async getVideoInfo(videoId: string): Promise<VideoInfo | null> {
    try {
      console.log(`🔑 Tentando obter informações via API oficial do YouTube...`);
      
      // Primeiro tentar API oficial
      try {
        const apiInfo = await YouTubeApiService.getVideoInfo(videoId);
        if (apiInfo && apiInfo.items && apiInfo.items.length > 0) {
          const item = apiInfo.items[0];
          const snippet = item.snippet;
          const statistics = item.statistics;
          const contentDetails = item.contentDetails;
          
          console.log(`✅ Informações obtidas via API oficial: ${snippet.title}`);
          
          return {
            title: snippet.title || 'Título não disponível',
            description: snippet.description || 'Descrição não disponível',
            duration: contentDetails?.duration || '0',
            viewCount: statistics?.viewCount || '0',
            uploadDate: snippet.publishedAt || new Date().toISOString(),
            channelTitle: snippet.channelTitle || 'Canal não disponível',
            thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || ''
          };
        }
      } catch (apiError) {
        console.log(`⚠️ API oficial falhou, tentando oEmbed:`, apiError);
      }
      
      // Fallback: tentar oEmbed
      try {
        const oembedInfo = await YouTubeApiService.getVideoInfoOEmbed(videoId);
        if (oembedInfo) {
          console.log(`✅ Informações obtidas via oEmbed: ${oembedInfo.title}`);
          
          return {
            title: oembedInfo.title || 'Título não disponível',
            description: oembedInfo.description || 'Descrição não disponível',
            duration: '0', // oEmbed não fornece duração
            viewCount: '0', // oEmbed não fornece visualizações
            uploadDate: new Date().toISOString(),
            channelTitle: oembedInfo.author_name || 'Canal não disponível',
            thumbnail: oembedInfo.thumbnail_url || ''
          };
        }
      } catch (oembedError) {
        console.log(`⚠️ oEmbed falhou:`, oembedError);
      }
      
      // Último recurso: tentar ytdl-core
      try {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const info = await ytdl.getInfo(videoUrl);
        
        console.log(`✅ Informações obtidas via ytdl-core: ${info.videoDetails.title}`);
        
        return {
          title: info.videoDetails.title || 'Título não disponível',
          description: info.videoDetails.description || 'Descrição não disponível',
          duration: info.videoDetails.lengthSeconds || '0',
          viewCount: info.videoDetails.viewCount || '0',
          uploadDate: info.videoDetails.uploadDate || new Date().toISOString(),
          channelTitle: info.videoDetails.author?.name || 'Canal não disponível',
          thumbnail: info.videoDetails.thumbnails?.[0]?.url || ''
        };
      } catch (ytdlError) {
        console.log(`⚠️ ytdl-core falhou:`, ytdlError);
      }
      
      console.error(`❌ Todas as estratégias falharam para obter informações do vídeo`);
      return null;
    } catch (error) {
      console.error(`❌ Erro ao obter informações do vídeo:`, error);
      return null;
    }
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
}
