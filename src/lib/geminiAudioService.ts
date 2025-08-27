/**
 * Serviço de transcrição de áudio via Gemini API
 */

import { YouTubeAudioExtractor } from './youtubeAudioExtractor';
import { OpenAIWhisperService } from './openaiWhisperService';
import { promises as fs } from 'fs';

export interface AudioTranscriptionResult {
  text: string;
  segments: TranscriptSegment[];
  confidence: number;
  language: string;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  confidence: number;
}

export class GeminiAudioService {
  private static readonly GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  /**
   * Transcreve áudio de um vídeo do YouTube
   */
  static async transcribeYouTubeAudio(videoId: string): Promise<AudioTranscriptionResult | null> {
    try {
      console.log(`🎵 Iniciando transcrição de áudio via Gemini para: ${videoId}`);
      
      if (!this.GEMINI_API_KEY) {
        console.error(`❌ Chave da API Gemini não configurada`);
        return null;
      }

      // Passo 1: Extrair áudio do vídeo usando YouTubeAudioExtractor
      console.log(`📥 Extraindo áudio via yt-dlp...`);
      const audioExtraction = await YouTubeAudioExtractor.extractAudio(videoId);
      
      if (!audioExtraction.success || !audioExtraction.audioFilePath) {
        console.error(`❌ Falha ao extrair áudio: ${audioExtraction.error}`);
        return null;
      }

      console.log(`✅ Áudio extraído: ${audioExtraction.audioFilePath}`);

      // Passo 2: Ler o arquivo de áudio
      const audioData = await fs.readFile(audioExtraction.audioFilePath);
      console.log(`✅ Áudio lido: ${audioData.length} bytes`);

      // Passo 3: Transcrever via Gemini
      const transcription = await this.transcribeAudioWithGemini(audioData);
      if (!transcription) {
        console.error(`❌ Falha na transcrição via Gemini, tentando OpenAI Whisper...`);
        
        // Fallback: Tentar OpenAI Whisper
        const whisperTranscription = await OpenAIWhisperService.transcribeAudio(audioData);
        if (whisperTranscription) {
          console.log(`✅ Transcrição Whisper obtida: ${whisperTranscription.text.length} caracteres`);
          return whisperTranscription;
        } else {
          console.error(`❌ Falha na transcrição via Whisper também`);
          return null;
        }
      }

      console.log(`✅ Transcrição Gemini concluída: ${transcription.text.length} caracteres`);

      // Limpar arquivo temporário
      try {
        await fs.unlink(audioExtraction.audioFilePath);
        console.log(`🗑️ Arquivo temporário removido`);
      } catch (cleanupError) {
        console.warn(`⚠️ Erro ao limpar arquivo temporário:`, cleanupError);
      }

      return transcription;
    } catch (error) {
      console.error(`❌ Erro na transcrição de áudio:`, error);
      return null;
    }
  }

  /**
   * Transcreve áudio usando Gemini API
   */
  private static async transcribeAudioWithGemini(audioData: Buffer): Promise<AudioTranscriptionResult | null> {
    try {
      console.log(`🤖 Enviando áudio para transcrição via Gemini...`);
      
      // Converter áudio para base64
      const audioBase64 = audioData.toString('base64');
      
      // Preparar payload para Gemini
      const payload = {
        contents: [{
          parts: [
            {
              text: "Transcreva este áudio em português brasileiro. Forneça o texto transcrito com timestamps aproximados."
            },
            {
              inline_data: {
                mime_type: "audio/mpeg",
                data: audioBase64
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 8192,
        }
      };

      // Fazer request para Gemini
      const response = await fetch(`${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API falhou: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
        throw new Error('Resposta inválida da Gemini API');
      }

      const transcriptionText = result.candidates[0].content.parts[0].text;
      
      // Processar a transcrição para extrair segmentos
      const segments = this.parseTranscriptionText(transcriptionText);
      
      return {
        text: transcriptionText,
        segments,
        confidence: 0.9, // Gemini tem alta confiança
        language: 'pt-BR'
      };
    } catch (error) {
      console.error(`❌ Erro na transcrição Gemini:`, error);
      return null;
    }
  }

  /**
   * Parseia o texto de transcrição para extrair segmentos
   */
  private static parseTranscriptionText(text: string): TranscriptSegment[] {
    try {
      const segments: TranscriptSegment[] = [];
      
      // Dividir o texto em parágrafos ou frases
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      
      lines.forEach((line, index) => {
        // Tentar extrair timestamp se presente
        const timestampMatch = line.match(/(\d{1,2}):(\d{2})/);
        let start = index * 10; // Fallback: 10 segundos por segmento
        
        if (timestampMatch) {
          const minutes = parseInt(timestampMatch[1]);
          const seconds = parseInt(timestampMatch[2]);
          start = minutes * 60 + seconds;
        }
        
        segments.push({
          start,
          end: start + 10,
          text: line.trim(),
          confidence: 0.9
        });
      });
      
      return segments;
    } catch (error) {
      console.error(`❌ Erro ao processar transcrição:`, error);
      return [{
        start: 0,
        end: 0,
        text: text,
        confidence: 0.9
      }];
    }
  }

  /**
   * Testa o serviço Gemini
   */
  static async testService(): Promise<boolean> {
    try {
      if (!this.GEMINI_API_KEY) {
        console.error(`❌ Chave da API Gemini não configurada`);
        return false;
      }
      
      console.log(`🧪 Testando serviço Gemini...`);
      
      // Teste simples com texto
      const testPayload = {
        contents: [{
          parts: [{
            text: "Olá, teste de API Gemini"
          }]
        }]
      };
      
      const response = await fetch(`${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });
      
      if (response.ok) {
        console.log(`✅ Serviço Gemini funcionando`);
        return true;
      } else {
        console.error(`❌ Serviço Gemini falhou: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Erro ao testar Gemini:`, error);
      return false;
    }
  }
}
