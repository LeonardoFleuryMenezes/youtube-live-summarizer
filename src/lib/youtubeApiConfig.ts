/**
 * Configuração da API do YouTube para resolver problemas de referer
 */

export interface YouTubeApiConfig {
  apiKey: string;
  allowedReferrers: string[];
  maxRetries: number;
  timeout: number;
}

export class YouTubeApiService {
  private static config: YouTubeApiConfig = {
    apiKey: process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '',
    allowedReferrers: [
      'localhost:3000',
      'localhost:3001',
      '127.0.0.1:3000',
      '127.0.0.1:3001',
      'localhost',
      '127.0.0.1'
    ],
    maxRetries: 3,
    timeout: 15000
  };

  /**
   * Configura a API do YouTube
   */
  static configure(config: Partial<YouTubeApiConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Obtém informações do vídeo via API oficial com headers corretos
   */
  static async getVideoInfo(videoId: string): Promise<any> {
    try {
      console.log(`🔑 Tentando API oficial do YouTube com headers corretos...`);
      
      if (!this.config.apiKey) {
        throw new Error('Chave da API do YouTube não configurada');
      }

      const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${this.config.apiKey}`;
      
      // Headers mais simples e compatíveis para evitar problemas de CORS
      const headers = {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      };

      console.log(`🔗 URL da API: ${url}`);
      console.log(`🔑 Chave da API: ${this.config.apiKey.substring(0, 20)}...`);

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API falhou: ${response.status} - ${errorText}`);
        
        if (response.status === 403) {
          throw new Error('API bloqueada por referer. Configure as restrições no Google Cloud Console.');
        } else if (response.status === 401) {
          throw new Error('API não autorizada. Verifique se a chave está correta e as APIs estão habilitadas.');
        }
        
        throw new Error(`API falhou: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ API funcionou! Dados obtidos para: ${data.items?.[0]?.snippet?.title || 'Título não disponível'}`);
      
      return data;
    } catch (error) {
      console.error(`❌ Erro na API oficial:`, error);
      throw error;
    }
  }

  /**
   * Obtém transcrição via API oficial (se disponível)
   */
  static async getTranscript(videoId: string): Promise<any> {
    try {
      console.log(`📝 Tentando obter transcrição via API oficial...`);
      
      if (!this.config.apiKey) {
        throw new Error('Chave da API do YouTube não configurada');
      }

      // Tentar obter captions disponíveis
      const url = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${this.config.apiKey}`;
      
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      };

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        console.log(`⚠️ API de captions falhou: ${response.status} - tentando alternativas...`);
        return null;
      }

      const data = await response.json();
      console.log(`✅ Captions encontradas: ${data.items?.length || 0}`);
      
      return data;
    } catch (error) {
      console.error(`❌ Erro ao obter captions:`, error);
      return null;
    }
  }

  /**
   * Verifica se a API está funcionando
   */
  static async testApi(): Promise<boolean> {
    try {
      console.log(`🧪 Testando API do YouTube...`);
      
      // Testar com um vídeo conhecido
      const testVideoId = 'dQw4w9WgXcQ'; // Rick Roll
      const result = await this.getVideoInfo(testVideoId);
      
      if (result && result.items && result.items.length > 0) {
        console.log(`✅ API funcionando perfeitamente!`);
        return true;
      } else {
        console.log(`⚠️ API retornou dados vazios`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Teste da API falhou:`, error);
      return false;
    }
  }

  /**
   * Obtém instruções para configurar a API
   */
  static getSetupInstructions(): string {
    return `
🔧 CONFIGURAÇÃO DA API DO YOUTUBE

Para resolver o problema de "referer bloqueado", siga estes passos:

1. Acesse: https://console.cloud.google.com/
2. Vá para "APIs & Services" > "Credentials"
3. Encontre sua chave da API: ${this.config.apiKey.substring(0, 20)}...
4. Clique no ícone de edição (lápis)
5. Em "Application restrictions", selecione "HTTP referrers"
6. Adicione os seguintes referrers:
   • localhost:3000/*
   • localhost:3001/*
   • 127.0.0.1:3000/*
   • 127.0.0.1:3001/*
   • localhost/*
   • 127.0.0.1/*

7. Em "API restrictions", selecione "Restrict key"
8. Escolha "YouTube Data API v3"
9. Clique em "Save"

Após a configuração, a API funcionará corretamente!
    `.trim();
  }

  /**
   * Obtém informações básicas do vídeo via oEmbed (fallback)
   */
  static async getVideoInfoOEmbed(videoId: string): Promise<any> {
    try {
      console.log(`🌐 Tentando oEmbed como fallback...`);
      
      const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`oEmbed falhou: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ oEmbed funcionou: ${data.title}`);
      
      return data;
    } catch (error) {
      console.error(`❌ Erro no oEmbed:`, error);
      return null;
    }
  }
}
