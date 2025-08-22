import { SummaryResponse } from '../types'

// Interface para o banco de dados simplificado
export interface DatabaseSchema {
  summaries: SummaryResponse[]
  apiUsage: {
    gemini: number
    openai: number
    local: number
    lastUpdated: Date
  }
  settings: {
    maxLength: number
    language: string
    summaryStyle: 'academic' | 'casual' | 'professional' | 'storytelling'
    includeContext: boolean
    includeQuotes: boolean
    includeTimestamps: boolean
    sentimentAnalysis: boolean
    topicExtraction: boolean
    keyPointsCount: number
    outputFormat: 'text' | 'markdown' | 'html' | 'json'
    temperature: number
    creativity: 'low' | 'medium' | 'high'
    focusAreas: string[]
    lastUpdated: Date
  }
}

// Classe simplificada usando localStorage
export class YouTubeSummarizerDB {
  private readonly STORAGE_KEYS = {
    summaries: 'youtube_summarizer_summaries',
    apiUsage: 'youtube_summarizer_api_usage',
    settings: 'youtube_summarizer_settings'
  }

  constructor() {
    this.initializeDefaultData()
  }

  private initializeDefaultData(): void {
    if (!this.getStoredSettings()) {
      this.saveStoredSettings({
        maxLength: 1000,
        language: 'pt-BR',
        summaryStyle: 'professional',
        includeContext: true,
        includeQuotes: true,
        includeTimestamps: false,
        sentimentAnalysis: true,
        topicExtraction: true,
        keyPointsCount: 5,
        outputFormat: 'text',
        temperature: 0.7,
        creativity: 'medium',
        focusAreas: ['tecnologia', 'educação'],
        lastUpdated: new Date()
      })
    }

    if (!this.getStoredApiUsage()) {
      this.saveStoredApiUsage({ gemini: 0, openai: 0, local: 0, lastUpdated: new Date() })
    }
  }

  // ===== OPERAÇÕES DE RESUMOS =====

  async saveSummary(summary: SummaryResponse): Promise<string> {
    try {
      const summaries = this.getSummaries()
      const existingIndex = summaries.findIndex(s => s.id === summary.id)
      
      if (existingIndex >= 0) {
        summaries[existingIndex] = summary
        console.log('💾 Resumo atualizado:', summary.id)
      } else {
        summary.id = Date.now().toString()
        summaries.push(summary)
        console.log('💾 Novo resumo criado:', summary.id)
      }
      
      this.saveSummaries(summaries)
      return summary.id
    } catch (error) {
      console.error('❌ Erro ao salvar resumo:', error)
      throw error
    }
  }

  async deleteSummary(id: string): Promise<void> {
    try {
      const summaries = this.getSummaries()
      const filteredSummaries = summaries.filter(s => s.id !== id)
      this.saveSummaries(filteredSummaries)
      console.log('🗑️ Resumo deletado:', id)
    } catch (error) {
      console.error('❌ Erro ao deletar resumo:', error)
      throw error
    }
  }

  async searchSummaries(filters: {
    channelTitle?: string
    summaryType?: string
    language?: string
    topics?: string[]
    sentiment?: string
    dateFrom?: Date
    dateTo?: Date
    searchTerm?: string
  }): Promise<SummaryResponse[]> {
    try {
      let summaries = this.getSummaries()

      if (filters.channelTitle) {
        summaries = summaries.filter(summary =>
          summary.videoInfo?.channelTitle?.toLowerCase().includes(filters.channelTitle!.toLowerCase()) ?? false
        )
      }

      if (filters.summaryType) {
        summaries = summaries.filter(summary => summary.summaryType === filters.summaryType)
      }

      if (filters.language) {
        summaries = summaries.filter(summary => summary.language === filters.language)
      }

      if (filters.sentiment) {
        summaries = summaries.filter(summary => summary.sentiment === filters.sentiment)
      }

      if (filters.topics && filters.topics.length > 0) {
        summaries = summaries.filter(summary => 
          filters.topics!.some(topic => 
            summary.topics.some(summaryTopic => 
              summaryTopic.toLowerCase().includes(topic.toLowerCase())
            )
          )
        )
      }

      if (filters.dateFrom || filters.dateTo) {
        summaries = summaries.filter(summary => {
          const summaryDate = new Date(summary.createdAt)
          if (filters.dateFrom && summaryDate < filters.dateFrom) return false
          if (filters.dateTo && summaryDate > filters.dateTo) return false
          return true
        })
      }

      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase()
        summaries = summaries.filter(summary => 
          summary.summary.toLowerCase().includes(searchTerm) ||
          summary.videoInfo?.title?.toLowerCase().includes(searchTerm) ||
          summary.videoInfo?.channelTitle?.toLowerCase().includes(searchTerm) ||
          summary.topics.some(topic => topic.toLowerCase().includes(searchTerm))
        )
      }

      return summaries
    } catch (error) {
      console.error('❌ Erro ao buscar resumos:', error)
      return []
    }
  }

  // ===== OPERAÇÕES DE CONFIGURAÇÕES =====

  async saveSettings(settings: DatabaseSchema['settings']): Promise<void> {
    try {
      this.saveStoredSettings(settings)
      console.log('⚙️ Configurações salvas')
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error)
    }
  }

  async loadSettings(): Promise<DatabaseSchema['settings'] | null> {
    try {
      return this.getStoredSettings()
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error)
      return null
    }
  }

  // ===== OPERAÇÕES DE USO DE API =====

  async updateApiUsage(apiType: 'gemini' | 'openai' | 'local'): Promise<void> {
    try {
      const usage = this.getStoredApiUsage()
      usage[apiType]++
      usage.lastUpdated = new Date()
      this.saveStoredApiUsage(usage)
    } catch (error) {
      console.error('❌ Erro ao atualizar uso de API:', error)
    }
  }

  async getApiUsage(): Promise<{ gemini: number; openai: number; local: number }> {
    try {
      const usage = this.getStoredApiUsage()
      return {
        gemini: usage.gemini,
        openai: usage.openai,
        local: usage.local
      }
    } catch (error) {
      console.error('❌ Erro ao obter uso de API:', error)
      return { gemini: 0, openai: 0, local: 0 }
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  async toArray() {
    return this.getSummaries()
  }

  get summaries() {
    return {
      toArray: () => Promise.resolve(this.getSummaries())
    }
  }

  // ===== MÉTODOS PRIVADOS =====

  private getSummaries(): SummaryResponse[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.summaries)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  private saveSummaries(summaries: SummaryResponse[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.summaries, JSON.stringify(summaries))
    } catch (error) {
      console.error('❌ Erro ao salvar resumos:', error)
    }
  }

  private getStoredSettings(): DatabaseSchema['settings'] | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.settings)
      if (data) {
        const settings = JSON.parse(data)
        if (settings.lastUpdated) {
          settings.lastUpdated = new Date(settings.lastUpdated)
        }
        return settings
      }
      return null
    } catch {
      return null
    }
  }

  private saveStoredSettings(settings: DatabaseSchema['settings']): void {
    try {
      const settingsWithDate = { ...settings, lastUpdated: new Date() }
      localStorage.setItem(this.STORAGE_KEYS.settings, JSON.stringify(settingsWithDate))
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error)
    }
  }

  private getStoredApiUsage(): { gemini: number; openai: number; local: number; lastUpdated: Date } {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.apiUsage)
      if (data) {
        const usage = JSON.parse(data)
        if (usage.lastUpdated) {
          usage.lastUpdated = new Date(usage.lastUpdated)
        }
        return usage
      }
      return { gemini: 0, openai: 0, local: 0, lastUpdated: new Date() }
    } catch {
      return { gemini: 0, openai: 0, local: 0, lastUpdated: new Date() }
    }
  }

  private saveStoredApiUsage(usage: { gemini: number; openai: number; local: number; lastUpdated: Date }): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.apiUsage, JSON.stringify(usage))
    } catch (error) {
      console.error('❌ Erro ao salvar uso de API:', error)
    }
  }
}

// Instância global do banco
export const db = new YouTubeSummarizerDB()

// Inicialização do banco
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('✅ Banco de dados (localStorage) inicializado com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error)
  }
}