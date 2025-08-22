/**
 * Serviço para extrair áudio real de vídeos do YouTube
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export interface AudioExtractionResult {
  success: boolean;
  audioFilePath?: string;
  error?: string;
  duration?: number;
  format?: string;
}

export class YouTubeAudioExtractor {
  private static readonly TEMP_DIR = path.join(process.cwd(), 'temp_audio');
  private static readonly YT_DLP_COMMAND = 'yt-dlp';
  private static readonly FFMPEG_PATH = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages', 'Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe', 'ffmpeg-7.1.1-full_build', 'bin');

  /**
   * Extrai áudio de um vídeo do YouTube
   */
  static async extractAudio(videoId: string): Promise<AudioExtractionResult> {
    try {
      console.log(`🎵 Iniciando extração de áudio para: ${videoId}`);
      
      // Criar diretório temporário se não existir
      await this.ensureTempDir();
      
      // Nome do arquivo de saída
      const outputFileName = `${videoId}_audio.mp3`;
      const outputPath = path.join(this.TEMP_DIR, outputFileName);
      
      // Comando yt-dlp para extrair áudio
      const command = this.YT_DLP_COMMAND;
      const args = [
        `https://www.youtube.com/watch?v=${videoId}`,
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0', // Melhor qualidade
        '--output', outputPath,
        '--no-playlist',
        '--quiet',
        '--ffmpeg-location', this.FFMPEG_PATH
      ];

      console.log(`🔧 Executando: ${command} ${args.join(' ')}`);

      // Executar yt-dlp
      const result = await this.executeCommand(command, args);
      
      if (result.success) {
        // Verificar se o arquivo foi criado
        const fileExists = await this.checkFileExists(outputPath);
        
        if (fileExists) {
          const fileStats = await fs.stat(outputPath);
          console.log(`✅ Áudio extraído com sucesso: ${outputPath} (${fileStats.size} bytes)`);
          
          return {
            success: true,
            audioFilePath: outputPath,
            duration: await this.getAudioDuration(outputPath),
            format: 'mp3'
          };
        } else {
          return {
            success: false,
            error: 'Arquivo de áudio não foi criado'
          };
        }
      } else {
        return {
          success: false,
          error: result.error || 'Falha na execução do yt-dlp'
        };
      }
    } catch (error) {
      console.error(`❌ Erro na extração de áudio:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Executa comando yt-dlp
   */
  private static async executeCommand(command: string, args: string[]): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const process = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ yt-dlp executado com sucesso`);
          resolve({ success: true });
        } else {
          console.error(`❌ yt-dlp falhou com código: ${code}`);
          console.error(`Stderr: ${stderr}`);
          resolve({ 
            success: false, 
            error: `yt-dlp falhou com código ${code}: ${stderr}` 
          });
        }
      });

      process.on('error', (error) => {
        console.error(`❌ Erro ao executar yt-dlp:`, error);
        resolve({ 
          success: false, 
          error: `Erro ao executar yt-dlp: ${error.message}` 
        });
      });

      // Timeout de 5 minutos
      setTimeout(() => {
        process.kill();
        resolve({ 
          success: false, 
          error: 'Timeout na execução do yt-dlp' 
        });
      }, 5 * 60 * 1000);
    });
  }

  /**
   * Verifica se o diretório temporário existe
   */
  private static async ensureTempDir(): Promise<void> {
    try {
      await fs.access(this.TEMP_DIR);
    } catch {
      console.log(`📁 Criando diretório temporário: ${this.TEMP_DIR}`);
      await fs.mkdir(this.TEMP_DIR, { recursive: true });
    }
  }

  /**
   * Verifica se um arquivo existe
   */
  private static async checkFileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtém duração do áudio (aproximada)
   */
  private static async getAudioDuration(filePath: string): Promise<number> {
    try {
      const stats = await fs.stat(filePath);
      // Estimativa baseada no tamanho do arquivo
      // WebM de áudio: ~64kbps = ~8KB/s
      const estimatedDuration = Math.round(stats.size / 8192);
      return estimatedDuration;
    } catch {
      return 0;
    }
  }

  /**
   * Limpa arquivos temporários
   */
  static async cleanupTempFiles(): Promise<void> {
    try {
      const files = await fs.readdir(this.TEMP_DIR);
      
      for (const file of files) {
        const filePath = path.join(this.TEMP_DIR, file);
        await fs.unlink(filePath);
        console.log(`🗑️ Arquivo temporário removido: ${file}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao limpar arquivos temporários:`, error);
    }
  }

  /**
   * Verifica se yt-dlp está instalado
   */
  static async checkYtDlpInstalled(): Promise<boolean> {
    try {
      const result = await this.executeCommand(this.YT_DLP_COMMAND, ['--version']);
      return result.success;
    } catch {
      return false;
    }
  }

  /**
   * Obtém instruções de instalação do yt-dlp
   */
  static getInstallationInstructions(): string {
    return 'Para transcrição real de áudio, você precisa instalar o yt-dlp. Use: winget install yt-dlp ou baixe manualmente de https://github.com/yt-dlp/yt-dlp/releases';
  }
}
