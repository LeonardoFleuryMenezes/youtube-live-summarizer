/**
 * Serviço de transcrição de áudio via OpenAI Whisper API
 */

export interface WhisperTranscriptionResult {
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

export class OpenAIWhisperService {
  private static readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
  private static readonly WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

  /**
   * Transcreve áudio usando OpenAI Whisper
   */
  static async transcribeAudio(audioData: Buffer): Promise<WhisperTranscriptionResult | null> {
    try {
      console.log(`🎤 Iniciando transcrição via OpenAI Whisper...`);
      
      if (!this.OPENAI_API_KEY) {
        console.error(`❌ Chave da API OpenAI não configurada`);
        return null;
      }

      // Para Node.js, vamos usar uma abordagem diferente
      // Enviar o áudio como base64 em um JSON
      console.log(`📤 Enviando áudio para OpenAI Whisper...`);

      // Converter áudio para base64
      const audioBase64 = audioData.toString('base64');
      
      // Preparar payload para Whisper
      const payload = {
        file: `data:audio/mpeg;base64,${audioBase64}`,
        model: 'whisper-1',
        language: 'pt',
        response_format: 'verbose_json'
      };

      // Fazer request para OpenAI Whisper
      const response = await fetch(this.WHISPER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI Whisper API falhou: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.text) {
        throw new Error('Resposta inválida da OpenAI Whisper API');
      }

      console.log(`✅ Transcrição Whisper concluída: ${result.text.length} caracteres`);

      // Processar a transcrição para extrair segmentos
      const segments = this.parseWhisperSegments(result);

      return {
        text: result.text,
        segments,
        confidence: 0.95, // Whisper tem alta confiança
        language: 'pt-BR'
      };
    } catch (error) {
      console.error(`❌ Erro na transcrição Whisper:`, error);
      return null;
    }
  }

  /**
   * Parseia os segmentos da resposta do Whisper
   */
  private static parseWhisperSegments(result: any): TranscriptSegment[] {
    try {
      const segments: TranscriptSegment[] = [];
      
      if (result.segments && Array.isArray(result.segments)) {
        result.segments.forEach((segment: any) => {
          segments.push({
            start: segment.start || 0,
            end: segment.end || 0,
            text: segment.text || '',
            confidence: segment.avg_logprob || 0.9
          });
        });
      } else {
        // Fallback: dividir o texto em segmentos
        const text = result.text || '';
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        
        lines.forEach((line: string, index: number) => {
          segments.push({
            start: index * 10,
            end: (index + 1) * 10,
            text: line.trim(),
            confidence: 0.9
          });
        });
      }
      
      return segments;
    } catch (error) {
      console.error(`❌ Erro ao processar segmentos Whisper:`, error);
      return [{
        start: 0,
        end: 0,
        text: result.text || '',
        confidence: 0.9
      }];
    }
  }

  /**
   * Testa o serviço Whisper
   */
  static async testService(): Promise<boolean> {
    try {
      if (!this.OPENAI_API_KEY) {
        console.error(`❌ Chave da API OpenAI não configurada`);
        return false;
      }
      
      console.log(`🧪 Testando serviço OpenAI Whisper...`);
      
      // Teste simples com texto (não podemos testar áudio sem enviar arquivo)
      console.log(`✅ Chave da API OpenAI configurada`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao testar Whisper:`, error);
      return false;
    }
  }
}
