import React from 'react'
import { SummaryResponse } from '../types'

interface AnalyticsDashboardProps {
  summaries: SummaryResponse[]
  apiUsage: {
    gemini: number
    openai: number
    local: number
  }
}

export default function AnalyticsDashboard({ summaries, apiUsage }: AnalyticsDashboardProps) {
  const totalSummaries = summaries.length
  const totalDuration = summaries.reduce((sum, s) => sum + s.duration, 0)
  const averageLength = summaries.length > 0 
    ? Math.round(summaries.reduce((sum, s) => sum + s.summary.length, 0) / summaries.length)
    : 0

  // Estatísticas por tipo
  const typeStats = summaries.reduce((acc, summary) => {
    acc[summary.summaryType] = (acc[summary.summaryType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Estatísticas por idioma
  const languageStats = summaries.reduce((acc, summary) => {
    acc[summary.language] = (acc[summary.language] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Estatísticas por sentimento
  const sentimentStats = summaries.reduce((acc, summary) => {
    acc[summary.sentiment] = (acc[summary.sentiment] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Uso de API
  const totalApiCalls = apiUsage.gemini + apiUsage.openai + apiUsage.local
  const geminiPercentage = totalApiCalls > 0 ? Math.round((apiUsage.gemini / totalApiCalls) * 100) : 0
  const openaiPercentage = totalApiCalls > 0 ? Math.round((apiUsage.openai / totalApiCalls) * 100) : 0
  const localPercentage = totalApiCalls > 0 ? Math.round((apiUsage.local / totalApiCalls) * 100) : 0

  // Resumos da semana
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const weeklySummaries = summaries.filter(s => new Date(s.createdAt) > oneWeekAgo)

  // Resumos do mês
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  const monthlySummaries = summaries.filter(s => new Date(s.createdAt) > oneMonthAgo)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        📊 Dashboard de Analytics
      </h3>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{totalSummaries}</div>
          <div className="text-sm text-blue-800">Total de Resumos</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{Math.round(totalDuration / 60)}</div>
          <div className="text-sm text-green-800">Minutos Processados</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{averageLength}</div>
          <div className="text-sm text-purple-800">Média de Caracteres</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{weeklySummaries.length}</div>
          <div className="text-sm text-orange-800">Esta Semana</div>
        </div>
      </div>

      {/* Gráficos e Estatísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Uso de APIs */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2 text-sm">🤖 Uso de APIs</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Gemini</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    style={{ width: `${geminiPercentage}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">{geminiPercentage}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">OpenAI</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full" 
                    style={{ width: `${openaiPercentage}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">{openaiPercentage}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Local</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-orange-500 h-1.5 rounded-full" 
                    style={{ width: `${localPercentage}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">{localPercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas por Tipo */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2 text-sm">📝 Tipos de Resumo</h4>
          <div className="space-y-1">
            {Object.entries(typeStats).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 capitalize">{type}</span>
                <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Estatísticas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {/* Idiomas */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2 text-sm">🌍 Idiomas</h4>
          <div className="space-y-1">
            {Object.entries(languageStats).map(([lang, count]) => (
              <div key={lang} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{lang}</span>
                <span className="text-xs font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sentimentos */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2 text-sm">😊 Sentimentos</h4>
          <div className="space-y-1">
            {Object.entries(sentimentStats).map(([sentiment, count]) => (
              <div key={sentiment} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 capitalize">{sentiment}</span>
                <span className="text-xs font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Crescimento */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2 text-sm">📈 Crescimento</h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Esta semana</span>
              <span className="text-xs font-medium text-green-600">+{weeklySummaries.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Este mês</span>
              <span className="text-xs font-medium text-blue-600">+{monthlySummaries.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dicas de Otimização */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2 text-sm">💡 Dicas de Otimização</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div>• Use resumos detalhados para conteúdo complexo</div>
          <div>• Configure o tamanho máximo baseado na duração do vídeo</div>
          <div>• Monitore o uso das APIs para otimizar custos</div>
        </div>
      </div>
    </div>
  )
}
