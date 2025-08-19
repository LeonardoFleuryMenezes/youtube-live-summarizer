import React, { useState, useMemo } from 'react'
import { Search, User, Tag, Calendar, BookOpen, Star } from 'lucide-react'
import { SummaryResponse } from '../types'

interface AuthorArchiveProps {
  summaries: SummaryResponse[]
  onSummarySelect: (summary: SummaryResponse) => void
  onSummaryDelete: (id: string) => void
  onSummaryFavorite: (id: string) => void
}

interface AuthorStats {
  name: string
  count: number
  totalDuration: number
  averageLength: number
  topics: string[]
  lastActivity: Date
  favoriteCount: number
}

export default function AuthorArchive({
  summaries,
  onSummarySelect,
  onSummaryDelete,
  onSummaryFavorite
}: AuthorArchiveProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all')
  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'recent' | 'duration'>('count')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Extrair estatísticas dos autores
  const authorStats = useMemo(() => {
    const authorMap = new Map<string, AuthorStats>()
    
    summaries.forEach(summary => {
      const authorName = summary.videoInfo?.channelTitle || 'Autor Desconhecido'
      
      if (!authorMap.has(authorName)) {
        authorMap.set(authorName, {
          name: authorName,
          count: 0,
          totalDuration: 0,
          averageLength: 0,
          topics: [],
          lastActivity: new Date(0),
          favoriteCount: 0
        })
      }
      
      const author = authorMap.get(authorName)!
      author.count++
      author.totalDuration += summary.duration
      author.averageLength += summary.summary.length
      
      // Adicionar tópicos únicos
      summary.topics.forEach(topic => {
        if (!author.topics.includes(topic)) {
          author.topics.push(topic)
        }
      })
      
      // Atualizar última atividade
      const summaryDate = new Date(summary.createdAt)
      if (summaryDate > author.lastActivity) {
        author.lastActivity = summaryDate
      }
      
      // Contar favoritos
      if (summary.isFavorite) {
        author.favoriteCount++
      }
    })
    
    // Calcular médias
    authorMap.forEach(author => {
      author.averageLength = Math.round(author.averageLength / author.count)
    })
    
    return Array.from(authorMap.values())
  }, [summaries])

  // Filtrar e ordenar autores
  const filteredAuthors = useMemo(() => {
    const filtered = authorStats.filter(author => {
      const matchesSearch = author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           author.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesTopic = selectedTopic === 'all' || author.topics.includes(selectedTopic)
      
      return matchesSearch && matchesTopic
    })
    
    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'count':
          return b.count - a.count
        case 'recent':
          return b.lastActivity.getTime() - a.lastActivity.getTime()
        case 'duration':
          return b.totalDuration - a.totalDuration
        default:
          return 0
      }
    })
    
    return filtered
  }, [authorStats, searchTerm, selectedTopic, sortBy])

  // Obter todos os tópicos únicos
  const allTopics = useMemo(() => {
    const topics = new Set<string>()
    summaries.forEach(summary => {
      summary.topics.forEach(topic => topics.add(topic))
    })
    return Array.from(topics).sort()
  }, [summaries])

  // Obter resumos de um autor específico
  const getAuthorSummaries = (authorName: string) => {
    return summaries.filter(summary => 
      (summary.videoInfo?.channelTitle || 'Autor Desconhecido') === authorName
    )
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
          Arquivo por Autor ({filteredAuthors.length})
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
            title="Visualização em grade"
          >
            <div className="grid grid-cols-2 gap-1 w-4 h-4">
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
            </div>
          </button>
          
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
            title="Visualização em lista"
          >
            <div className="space-y-1 w-4 h-4">
              <div className="bg-current rounded-sm h-1"></div>
              <div className="bg-current rounded-sm h-1"></div>
              <div className="bg-current rounded-sm h-1"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="🔍 Buscar por autor ou tópico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={selectedAuthor}
          onChange={(e) => setSelectedAuthor(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">👥 Todos os Autores</option>
          {filteredAuthors.map(author => (
            <option key={author.name} value={author.name}>
              {author.name} ({author.count})
            </option>
          ))}
        </select>
        
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">🏷️ Todos os Tópicos</option>
          {allTopics.map(topic => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'count' | 'recent' | 'duration')}
          className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="count">📊 Por Quantidade</option>
          <option value="name">🔤 Por Nome</option>
          <option value="recent">📅 Por Recente</option>
          <option value="duration">⏱️ Por Duração</option>
        </select>
      </div>

      {/* Lista de Autores */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
        {filteredAuthors.map((author) => (
          <div
            key={author.name}
            className={`border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer ${
              selectedAuthor === author.name ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedAuthor(author.name)}
          >
            {/* Header do Autor */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 truncate max-w-32">
                    {author.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {author.count} resumo{author.count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              {author.favoriteCount > 0 && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4" />
                  <span className="text-sm font-medium">{author.favoriteCount}</span>
                </div>
              )}
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="text-center p-1.5 bg-gray-50 rounded">
                <div className="text-sm font-semibold text-blue-600">
                  {formatDuration(author.totalDuration)}
                </div>
                <div className="text-xs text-gray-600">Duração Total</div>
              </div>
              
              <div className="text-center p-1.5 bg-gray-50 rounded">
                <div className="text-sm font-semibold text-green-600">
                  {author.averageLength}
                </div>
                <div className="text-xs text-gray-600">Média Caracteres</div>
              </div>
            </div>

            {/* Tópicos */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Tópicos</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {author.topics.slice(0, 3).map((topic, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {topic}
                  </span>
                ))}
                {author.topics.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{author.topics.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Última Atividade */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Última: {formatDate(author.lastActivity)}</span>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Mostrar resumos do autor
                  const authorSummaries = getAuthorSummaries(author.name)
                  if (authorSummaries.length > 0) {
                    onSummarySelect(authorSummaries[0])
                  }
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver Resumos
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resumos do Autor Selecionado */}
      {selectedAuthor !== 'all' && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            📚 Resumos de {selectedAuthor}
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {getAuthorSummaries(selectedAuthor).map((summary) => (
              <div
                key={summary.id}
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
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
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {summary.summary}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📅 {formatDate(new Date(summary.createdAt))}</span>
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
            ))}
          </div>
        </div>
      )}

      {/* Estatísticas Gerais */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">📊 Estatísticas Gerais</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{authorStats.length}</div>
            <div className="text-xs text-blue-800">Autores Únicos</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">{summaries.length}</div>
            <div className="text-xs text-green-800">Total de Resumos</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600">{allTopics.length}</div>
            <div className="text-xs text-purple-800">Tópicos Únicos</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-xl font-bold text-orange-600">
              {Math.round(summaries.reduce((sum, s) => sum + s.duration, 0) / 60)}
            </div>
            <div className="text-xs text-orange-800">Minutos Totais</div>
          </div>
        </div>
      </div>
    </div>
  )
}
