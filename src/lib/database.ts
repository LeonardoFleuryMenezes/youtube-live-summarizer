import Dexie, { Table } from 'dexie'
import { SummaryResponse } from '../types'

// Interface para o banco de dados
export interface DatabaseSchema {
  summaries: SummaryResponse
  apiUsage: {
    id?: number
    gemini: number
    openai: number
    local: number
    lastUpdated: Date
  }
  settings: {
    id?: number
    maxLength: number
    language: string
    summaryStyle: string
    includeContext: boolean
    includeQuotes: boolean
    includeTimestamps: boolean
    sentimentAnalysis: boolean
    topicExtraction: boolean
    keyPointsCount: number
    outputFormat: string
    temperature: number
    creativity: string
    focusAreas: string[]
    lastUpdated: Date
  }
  analytics: {
    id?: number
    date: string
    totalSummaries: number
    totalDuration: number
    averageLength: number
    geminiUsage: number
    openaiUsage: number
    localUsage: number
  }
}

// Classe principal do banco de dados
export class YouTubeSummarizerDB extends Dexie {
  // Tabelas
  summaries!: Table<SummaryResponse>
  apiUsage!: Table<DatabaseSchema['apiUsage']>
  settings!: Table<DatabaseSchema['settings']>
  analytics!: Table<DatabaseSchema['analytics']>

  constructor() {
    super('YouTubeSummarizerDB')
    
    // Versão do banco
    this.version(1).stores({
      summaries: '++id, videoId, summaryType, language, createdAt, channelTitle, topics, sentiment',
      apiUsage: '++id, lastUpdated',
      settings: '++id, lastUpdated',
      analytics: '++id, date'
    })

    // Índices compostos para consultas avançadas
    this.version(2).stores({
      summaries: '++id, videoId, summaryType, language, createdAt, channelTitle, topics, sentiment, [channelTitle+createdAt], [summaryType+language]',
      apiUsage: '++id, lastUpdated',
      settings: '++id, lastUpdated',
      analytics: '++id, date'
    })

    // Hooks para atualizar analytics automaticamente
    this.summaries.hook('creating', () => {
      this.updateAnalytics()
    })

    this.summaries.hook('deleting', () => {
      this.updateAnalytics()
    })
  }

  // ===== OPERAÇÕES DE RESUMOS =====

  /**
   * Adiciona ou atualiza um resumo
   */
  async saveSummary(summary: SummaryResponse): Promise<string> {
    try {
      if (summary.id) {
        // Atualiza resumo existente
        await this.summaries.update(summary.id, summary)
        console.log('💾 Resumo atualizado:', summary.id)
        return summary.id
      } else {
        // Cria novo resumo
        const id = await this.summaries.add(summary)
        console.log('💾 Novo resumo criado:', id)
        return id as string
      }
    } catch (error) {
      console.error('❌ Erro ao salvar resumo:', error)
      throw error
    }
  }

  /**
   * Busca resumos com filtros avançados
   */
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
      let query = this.summaries.toCollection()

      // Filtros básicos
      if (filters.channelTitle) {
        query = query.filter(summary => 
          summary.videoInfo?.channelTitle?.toLowerCase().includes(filters.channelTitle!.toLowerCase())
        )
      }

      if (filters.summaryType) {
        query = query.filter(summary => summary.summaryType === filters.summaryType)
      }

      if (filters.language) {
        query = query.filter(summary => summary.language === filters.language)
      }

      if (filters.sentiment) {
        query = query.filter(summary => summary.sentiment === filters.sentiment)
      }

      // Filtro por tópicos
      if (filters.topics && filters.topics.length > 0) {
        query = query.filter(summary => 
          filters.topics!.some(topic => 
            summary.topics.some(summaryTopic => 
              summaryTopic.toLowerCase().includes(topic.toLowerCase())
            )
          )
        )
      }

      // Filtro por data
      if (filters.dateFrom || filters.dateTo) {
        query = query.filter(summary => {
          const summaryDate = new Date(summary.createdAt)
          if (filters.dateFrom && summaryDate < filters.dateFrom) return false
          if (filters.dateTo && summaryDate > filters.dateTo) return false
          return true
        })
      }

      // Busca por texto
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase()
        query = query.filter(summary => 
          summary.summary.toLowerCase().includes(searchTerm) ||
          summary.videoInfo?.title?.toLowerCase().includes(searchTerm) ||
          summary.videoInfo?.channelTitle?.toLowerCase().includes(searchTerm) ||
          summary.topics.some(topic => topic.toLowerCase().includes(searchTerm))
        )
      }

      return await query.toArray()
    } catch (error) {
      console.error('❌ Erro ao buscar resumos:', error)
      return []
    }
  }

  /**
   * Obtém estatísticas avançadas
   */
  async getAdvancedStats(): Promise<{
    totalSummaries: number
    totalDuration: number
    averageLength: number
    byChannel: { channel: string; count: number; totalDuration: number }[]
    byType: { type: string; count: number }[]
    byLanguage: { language: string; count: number }[]
    bySentiment: { sentiment: string; count: number }[]
    byTopic: { topic: string; count: number }[]
    weeklyGrowth: { week: string; count: number }[]
    monthlyGrowth: { month: string; count: number }[]
  }> {
    try {
      const summaries = await this.summaries.toArray()
      
      // Estatísticas básicas
      const totalSummaries = summaries.length
      const totalDuration = summaries.reduce((sum, s) => sum + s.duration, 0)
      const averageLength = summaries.length > 0 
        ? Math.round(summaries.reduce((sum, s) => sum + s.summary.length, 0) / summaries.length)
        : 0

      // Por canal
      const byChannel = Object.values(
        summaries.reduce((acc, summary) => {
          const channel = summary.videoInfo?.channelTitle || 'Desconhecido'
          if (!acc[channel]) {
            acc[channel] = { channel, count: 0, totalDuration: 0 }
          }
          acc[channel].count++
          acc[channel].totalDuration += summary.duration
          return acc
        }, {} as Record<string, { channel: string; count: number; totalDuration: number }>)
      ).sort((a, b) => b.count - a.count)

      // Por tipo
      const byType = Object.values(
        summaries.reduce((acc, summary) => {
          const type = summary.summaryType
          acc[type] = (acc[type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).map((count, type) => ({ type, count }))

      // Por idioma
      const byLanguage = Object.values(
        summaries.reduce((acc, summary) => {
          const lang = summary.language
          acc[lang] = (acc[lang] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).map((count, language) => ({ language, count }))

      // Por sentimento
      const bySentiment = Object.values(
        summaries.reduce((acc, summary) => {
          const sentiment = summary.sentiment
          acc[sentiment] = (acc[sentiment] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).map((count, sentiment) => ({ sentiment, count }))

      // Por tópico
      const byTopic = Object.values(
        summaries.reduce((acc, summary) => {
          summary.topics.forEach(topic => {
            acc[topic] = (acc[topic] || 0) + 1
          })
          return acc
        }, {} as Record<string, number>)
      ).map((count, topic) => ({ topic, count })).sort((a, b) => b.count - a.count)

      // Crescimento semanal
      const weeklyGrowth = this.calculateGrowth(summaries, 7)

      // Crescimento mensal
      const monthlyGrowth = this.calculateGrowth(summaries, 30)

      return {
        totalSummaries,
        totalDuration,
        averageLength,
        byChannel,
        byType,
        byLanguage,
        bySentiment,
        byTopic,
        weeklyGrowth,
        monthlyGrowth
      }
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error)
      return {
        totalSummaries: 0,
        totalDuration: 0,
        averageLength: 0,
        byChannel: [],
        byType: [],
        byLanguage: [],
        bySentiment: [],
        byTopic: [],
        weeklyGrowth: [],
        monthlyGrowth: []
      }
    }
  }

  /**
   * Calcula crescimento por período
   */
  private calculateGrowth(summaries: SummaryResponse[], days: number): { week: string; count: number }[] {
    const result: { week: string; count: number }[] = []
    const now = new Date()
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const count = summaries.filter(summary => {
        const summaryDate = new Date(summary.createdAt)
        return summaryDate.toISOString().split('T')[0] === dateStr
      }).length
      
      result.push({ week: dateStr, count })
    }
    
    return result
  }

  // ===== OPERAÇÕES DE CONFIGURAÇÕES =====

  /**
   * Salva configurações
   */
  async saveSettings(settings: DatabaseSchema['settings']): Promise<void> {
    try {
      const existing = await this.settings.toArray()
      if (existing.length > 0) {
        await this.settings.update(existing[0].id!, { ...settings, lastUpdated: new Date() })
      } else {
        await this.settings.add({ ...settings, lastUpdated: new Date() })
      }
      console.log('⚙️ Configurações salvas')
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error)
    }
  }

  /**
   * Carrega configurações
   */
  async loadSettings(): Promise<DatabaseSchema['settings'] | null> {
    try {
      const settings = await this.settings.toArray()
      return settings.length > 0 ? settings[0] : null
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error)
      return null
    }
  }

  // ===== OPERAÇÕES DE USO DE API =====

  /**
   * Atualiza uso de API
   */
  async updateApiUsage(apiType: 'gemini' | 'openai' | 'local'): Promise<void> {
    try {
      const existing = await this.apiUsage.toArray()
      if (existing.length > 0) {
        const current = existing[0]
        await this.apiUsage.update(current.id!, {
          ...current,
          [apiType]: current[apiType] + 1,
          lastUpdated: new Date()
        })
      } else {
        await this.apiUsage.add({
          gemini: apiType === 'gemini' ? 1 : 0,
          openai: apiType === 'openai' ? 1 : 0,
          local: apiType === 'local' ? 1 : 0,
          lastUpdated: new Date()
        })
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar uso de API:', error)
    }
  }

  /**
   * Obtém uso de API
   */
  async getApiUsage(): Promise<{ gemini: number; openai: number; local: number }> {
    try {
      const usage = await this.apiUsage.toArray()
      if (usage.length > 0) {
        return {
          gemini: usage[0].gemini,
          openai: usage[0].openai,
          local: usage[0].local
        }
      }
      return { gemini: 0, openai: 0, local: 0 }
    } catch (error) {
      console.error('❌ Erro ao obter uso de API:', error)
      return { gemini: 0, openai: 0, local: 0 }
    }
  }

  // ===== OPERAÇÕES DE ANALYTICS =====

  /**
   * Atualiza analytics
   */
  private async updateAnalytics(): Promise<void> {
    try {
      const stats = await this.getAdvancedStats()
      const today = new Date().toISOString().split('T')[0]
      
      const existing = await this.analytics.where('date').equals(today).toArray()
      const analyticsData = {
        date: today,
        totalSummaries: stats.totalSummaries,
        totalDuration: stats.totalDuration,
        averageLength: stats.averageLength,
        geminiUsage: 0,
        openaiUsage: 0,
        localUsage: 0
      }

      const apiUsage = await this.getApiUsage()
      analyticsData.geminiUsage = apiUsage.gemini
      analyticsData.openaiUsage = apiUsage.openai
      analyticsData.localUsage = apiUsage.local

      if (existing.length > 0) {
        await this.analytics.update(existing[0].id!, analyticsData)
      } else {
        await this.analytics.add(analyticsData)
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar analytics:', error)
    }
  }

  // ===== OPERAÇÕES DE EXPORTAÇÃO/IMPORTAÇÃO =====

  /**
   * Exporta banco completo
   */
  async exportDatabase(): Promise<Blob> {
    try {
      const exportData = {
        summaries: await this.summaries.toArray(),
        apiUsage: await this.apiUsage.toArray(),
        settings: await this.settings.toArray(),
        analytics: await this.analytics.toArray(),
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      console.log('📤 Banco exportado com sucesso!')
      return blob
    } catch (error) {
      console.error('❌ Erro ao exportar banco:', error)
      throw error
    }
  }

  /**
   * Importa banco completo
   */
  async importDatabase(data: unknown): Promise<boolean> {
    try {
      // Validação básica
      if (!data.summaries || !Array.isArray(data.summaries)) {
        throw new Error('Formato de importação inválido')
      }

      // Limpa banco atual
      await this.clearDatabase()

      // Importa novos dados
      if (data.summaries.length > 0) {
        await this.summaries.bulkAdd(data.summaries)
      }
      
      if (data.apiUsage && data.apiUsage.length > 0) {
        await this.apiUsage.bulkAdd(data.apiUsage)
      }
      
      if (data.settings && data.settings.length > 0) {
        await this.settings.bulkAdd(data.settings)
      }
      
      if (data.analytics && data.analytics.length > 0) {
        await this.analytics.bulkAdd(data.analytics)
      }

      console.log('📥 Banco importado com sucesso!')
      return true
    } catch (error) {
      console.error('❌ Erro ao importar banco:', error)
      return false
    }
  }

  /**
   * Limpa banco completo
   */
  async clearDatabase(): Promise<void> {
    try {
      await this.summaries.clear()
      await this.apiUsage.clear()
      await this.settings.clear()
      await this.analytics.clear()
      console.log('🗑️ Banco limpo com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao limpar banco:', error)
    }
  }

  /**
   * Obtém informações do banco
   */
  async getDatabaseInfo(): Promise<{
    totalSummaries: number
    totalSize: number
    lastUpdated: Date | null
    version: number
  }> {
    try {
      const summaries = await this.summaries.count()
      const lastSummary = await this.summaries.orderBy('createdAt').reverse().first()
      
      // Calcula tamanho aproximado
      const allData = await this.summaries.toArray()
      const totalSize = new Blob([JSON.stringify(allData)]).size
      
      return {
        totalSummaries: summaries,
        totalSize,
        lastUpdated: lastSummary ? new Date(lastSummary.createdAt) : null,
        version: 2
      }
    } catch (error) {
      console.error('❌ Erro ao obter informações do banco:', error)
      return {
        totalSummaries: 0,
        totalSize: 0,
        lastUpdated: null,
        version: 2
      }
    }
  }
}

// Instância global do banco
export const db = new YouTubeSummarizerDB()

// Inicialização do banco
export async function initializeDatabase(): Promise<void> {
  try {
    // Verifica se o banco está funcionando
    await db.open()
    console.log('✅ Banco de dados inicializado com sucesso!')
    
    // Cria configurações padrão se não existirem
    const settings = await db.loadSettings()
    if (!settings) {
      await db.saveSettings({
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
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error)
  }
}
