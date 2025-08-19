import { SummaryResponse } from '../types'

const STORAGE_KEY = 'youtube-summarizer-data'
const BACKUP_KEY = 'youtube-summarizer-backup'

export interface StorageData {
  summaries: SummaryResponse[]
  apiUsage: {
    gemini: number
    openai: number
    local: number
  }
  settings: {
    maxLength: number
    language: string
    summaryStyle: string
  }
  lastUpdated: string
}

export class StorageService {
  /**
   * Salva dados no localStorage
   */
  static saveData(data: Partial<StorageData>): void {
    try {
      const existingData = this.loadData()
      const newData = { ...existingData, ...data, lastUpdated: new Date().toISOString() }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
      console.log('💾 Dados salvos com sucesso:', newData)
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error)
    }
  }

  /**
   * Carrega dados do localStorage
   */
  static loadData(): StorageData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        console.log('📂 Dados carregados:', data)
        return data
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
    }

    // Retorna dados padrão se não houver nada salvo
    return {
      summaries: [],
      apiUsage: { gemini: 0, openai: 0, local: 0 },
      settings: {
        maxLength: 1000,
        language: 'pt-BR',
        summaryStyle: 'professional'
      },
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Salva um resumo específico
   */
  static saveSummary(summary: SummaryResponse): void {
    try {
      const data = this.loadData()
      const existingIndex = data.summaries.findIndex(s => s.id === summary.id)
      
      if (existingIndex >= 0) {
        // Atualiza resumo existente
        data.summaries[existingIndex] = summary
      } else {
        // Adiciona novo resumo
        data.summaries.unshift(summary)
      }
      
      this.saveData(data)
    } catch (error) {
      console.error('❌ Erro ao salvar resumo:', error)
    }
  }

  /**
   * Remove um resumo
   */
  static deleteSummary(id: string): void {
    try {
      const data = this.loadData()
      data.summaries = data.summaries.filter(s => s.id !== id)
      this.saveData(data)
    } catch (error) {
      console.error('❌ Erro ao deletar resumo:', error)
    }
  }

  /**
   * Atualiza uso de API
   */
  static updateApiUsage(apiType: 'gemini' | 'openai' | 'local'): void {
    try {
      const data = this.loadData()
      data.apiUsage[apiType]++
      this.saveData(data)
    } catch (error) {
      console.error('❌ Erro ao atualizar uso de API:', error)
    }
  }

  /**
   * Exporta dados para arquivo JSON
   */
  static exportData(): void {
    try {
      const data = this.loadData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `youtube-summarizer-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      console.log('📤 Dados exportados com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao exportar dados:', error)
    }
  }

  /**
   * Importa dados de arquivo JSON
   */
  static async importData(file: File): Promise<boolean> {
    try {
      const text = await file.text()
      const data: StorageData = JSON.parse(text)
      
      // Validação básica dos dados
      if (!data.summaries || !Array.isArray(data.summaries)) {
        throw new Error('Formato de arquivo inválido')
      }
      
      // Salva backup antes de importar
      const currentData = this.loadData()
      localStorage.setItem(BACKUP_KEY, JSON.stringify(currentData))
      
      // Importa novos dados
      this.saveData(data)
      
      console.log('📥 Dados importados com sucesso!')
      return true
    } catch (error) {
      console.error('❌ Erro ao importar dados:', error)
      return false
    }
  }

  /**
   * Restaura backup
   */
  static restoreBackup(): boolean {
    try {
      const backup = localStorage.getItem(BACKUP_KEY)
      if (backup) {
        const data = JSON.parse(backup)
        this.saveData(data)
        localStorage.removeItem(BACKUP_KEY)
        console.log('🔄 Backup restaurado com sucesso!')
        return true
      }
      return false
    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error)
      return false
    }
  }

  /**
   * Limpa todos os dados
   */
  static clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(BACKUP_KEY)
      console.log('🗑️ Todos os dados foram limpos!')
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error)
    }
  }

  /**
   * Obtém estatísticas de armazenamento
   */
  static getStorageStats(): { used: number; available: number; percentage: number } {
    try {
      const data = this.loadData()
      const used = new Blob([JSON.stringify(data)]).size
      const available = 5 * 1024 * 1024 // 5MB (limite típico do localStorage)
      const percentage = Math.round((used / available) * 100)
      
      return { used, available, percentage }
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 }
    }
  }
}
