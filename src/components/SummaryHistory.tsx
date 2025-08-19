import React, { useState } from 'react'
import { SummaryResponse } from '../types'

interface SummaryHistoryProps {
  summaries: SummaryResponse[]
  onSummarySelect: (summary: SummaryResponse) => void
  onSummaryDelete: (id: string) => void
  onSummaryFavorite: (id: string) => void
}

export default function SummaryHistory({ 
  summaries, 
  onSummarySelect, 
  onSummaryDelete, 
  onSummaryFavorite 
}: SummaryHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'favorites' | 'recent'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredSummaries = summaries.filter(summary => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'favorites' && summary.isFavorite) ||
                         (filter === 'recent' && isRecent(summary.createdAt))
    
    const matchesSearch = summary.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         summary.videoId.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const isRecent = (date: Date) => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    return new Date(date) > oneWeekAgo
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSummaryPreview = (summary: string) => {
    return summary.length > 100 ? summary.substring(0, 100) + '...' : summary
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        📚 Histórico de Resumos ({filteredSummaries.length})
      </h3>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'favorites' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ⭐ Favoritos
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'recent' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📅 Recentes
          </button>
        </div>
        
        <input
          type="text"
          placeholder="🔍 Buscar resumos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lista de Resumos */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredSummaries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {filter === 'favorites' ? 'Nenhum resumo favoritado ainda' :
             filter === 'recent' ? 'Nenhum resumo recente' :
             'Nenhum resumo encontrado'}
          </div>
        ) : (
          filteredSummaries.map((summary) => (
            <div
              key={summary.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSummarySelect(summary)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {summary.summaryType}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {summary.language}
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      {summary.sentiment}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {getSummaryPreview(summary.summary)}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📅 {formatDate(summary.createdAt)}</span>
                    <span>⏱️ {summary.duration}s</span>
                    <span>🔑 {summary.keyPoints.length} pontos</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSummaryFavorite(summary.id)
                    }}
                    className={`p-2 rounded-full hover:bg-gray-100 ${
                      summary.isFavorite ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                    title={summary.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  >
                    {summary.isFavorite ? '⭐' : '☆'}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSummaryDelete(summary.id)
                    }}
                    className="p-2 rounded-full hover:bg-red-100 text-red-500"
                    title="Excluir resumo"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Estatísticas */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
          <div>
            <div className="font-semibold text-lg text-blue-600">{summaries.length}</div>
            <div>Total</div>
          </div>
          <div>
            <div className="font-semibold text-lg text-yellow-600">
              {summaries.filter(s => s.isFavorite).length}
            </div>
            <div>Favoritos</div>
          </div>
          <div>
            <div className="font-semibold text-lg text-green-600">
              {summaries.filter(s => isRecent(s.createdAt)).length}
            </div>
            <div>Esta semana</div>
          </div>
        </div>
      </div>
    </div>
  )
}
