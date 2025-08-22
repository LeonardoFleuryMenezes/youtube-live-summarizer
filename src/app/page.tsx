'use client'

/**
 * 🚨 ALERTA DE SEGURANÇA - ATENÇÃO! 🚨
 * 
 * SUAS CHAVES DE API FORAM EXPOSTAS NO GITHUB!
 * ANTES DE USAR ESTE PROJETO, VOCÊ DEVE:
 * 1. Revogar as chaves comprometidas (YouTube, OpenAI, Gemini)
 * 2. Criar 3 novas chaves seguras
 * 3. Configurar o arquivo .env com as novas chaves
 * 
 * Veja o arquivo 🚨 ALERTA-SEGURANCA.md para instruções completas!
 */

import React, { useState, useEffect } from 'react'
import { Youtube, Play, FileText, Brain, Clock, TrendingUp, Users, Calendar, Download, Upload, Database, Trash2 } from 'lucide-react'
import { SummaryRequest, SummaryResponse, ProcessingStatus } from '../types'
import AdvancedSettings, { AdvancedSettings as AdvancedSettingsType } from '../components/AdvancedSettings'
import SummaryHistory from '../components/SummaryHistory'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import NotificationSystem, { Notification } from '../components/NotificationSystem'
import AuthorArchive from '../components/AuthorArchive'
import { db, initializeDatabase } from '../lib/database'
import { displaySecurityAlert } from '../lib/securityCheck'

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('')
  const [summaryType, setSummaryType] = useState<'brief' | 'detailed' | 'super-detailed' | 'key-points'>('detailed')
  const [language, setLanguage] = useState('pt-BR')
  const [maxLength, setMaxLength] = useState(1000)
  const [status, setStatus] = useState<ProcessingStatus>({
    status: 'idle',
    message: 'Digite a URL de uma live do YouTube para começar',
    progress: 0
  })
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  
  // Estados para funcionalidades avançadas
  const [summaries, setSummaries] = useState<SummaryResponse[]>([])
  const [apiUsage, setApiUsage] = useState({ gemini: 0, openai: 0, local: 0 })
  const [notifications] = useState<Notification[]>([])
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettingsType>({
    maxLength: 1000,
    summaryStyle: 'professional',
    includeContext: true,
    includeQuotes: true,
    includeTimestamps: false,
    sentimentAnalysis: true,
    topicExtraction: true,
    keyPointsCount: 5,
    language: 'pt-BR',
    outputFormat: 'text',
    temperature: 0.7,
    creativity: 'medium',
    focusAreas: ['tecnologia', 'educação']
  })

  // Inicializar banco de dados e carregar dados
  useEffect(() => {
    const initApp = async () => {
      try {
        // Inicializa banco
        await initializeDatabase()
        
        // Carrega resumos existentes
        const allSummaries = await db.summaries.toArray()
        setSummaries(allSummaries)
        
        // Carrega uso de API
        const usage = await db.getApiUsage()
        setApiUsage(usage)
        
        // Carrega configurações
        const settings = await db.loadSettings()
        if (settings) {
          setAdvancedSettings(prev => ({
            ...prev,
            maxLength: settings.maxLength,
            language: settings.language,
            summaryStyle: settings.summaryStyle,
            includeContext: settings.includeContext,
            includeQuotes: settings.includeQuotes,
            includeTimestamps: settings.includeTimestamps,
            sentimentAnalysis: settings.sentimentAnalysis,
            topicExtraction: settings.topicExtraction,
            keyPointsCount: settings.keyPointsCount,
            outputFormat: settings.outputFormat,
            temperature: settings.temperature,
            creativity: settings.creativity,
            focusAreas: settings.focusAreas
          }))
          setMaxLength(settings.maxLength)
          setLanguage(settings.language)
        }
        
        console.log('🚀 Aplicação inicializada com sucesso!')
        
        // Verificar segurança das chaves de API
        displaySecurityAlert()
      } catch (error) {
        console.error('❌ Erro ao inicializar aplicação:', error)
        addNotification('error', '❌ Erro de Inicialização', 'Falha ao carregar dados salvos')
      }
    }
    
    initApp()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!videoUrl.trim()) {
      setStatus({
        status: 'error',
        message: 'Por favor, digite uma URL válida do YouTube',
        progress: 0
      })
      return
    }

    setStatus({
      status: 'processing',
      message: 'Processando transcrição e gerando resumo...',
      progress: 25
    })

    try {
      const request: SummaryRequest = {
        videoUrl: videoUrl.trim(),
        summaryType,
        language,
        maxLength
      }

      setStatus({
        status: 'processing',
        message: 'Extraindo transcrição do YouTube...',
        progress: 50
      })

      // Detectar se estamos no Electron (modo offline)
      const isOffline = window.location.protocol === 'file:' || !navigator.onLine;
      
      let data;
      
      if (isOffline) {
        console.log('🔌 Modo offline detectado - usando simulação local');
        
        setStatus({
          status: 'processing',
          message: 'Modo offline - gerando resumo simulado...',
          progress: 75
        });
        
        // Simular delay para parecer real
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Gerar resumo simulado
        data = {
          id: 'offline-' + Date.now(),
          summary: `Este é um resumo simulado do tipo "${summaryType}" para a URL: ${videoUrl}\n\nEm modo offline, o aplicativo gera resumos simulados para demonstração. Para funcionalidade completa com IA real, conecte-se à internet.`,
          summaryType,
          language,
          sentiment: 'neutral',
          keyPoints: [
            'Resumo gerado em modo offline',
            'Funcionalidade simulada para demonstração',
            'Conecte-se à internet para IA real',
            'URL processada: ' + videoUrl,
            'Tipo de resumo: ' + summaryType
          ],
          topics: ['offline', 'demo', 'simulation', 'youtube'],
          duration: 0,
          createdAt: new Date().toISOString(),
          videoId: 'offline-demo',
          videoInfo: {
            title: 'Vídeo Demo (Modo Offline)',
            channelTitle: 'YouTube Live Summarizer',
            thumbnail: '',
            duration: '0:00',
            viewCount: '0',
            publishedAt: new Date().toISOString()
          }
        };
      } else {
        // Modo online - usar API real
        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Erro ao processar resumo');
        }

        setStatus({
          status: 'processing',
          message: 'Gerando resumo com IA...',
          progress: 75
        });

        data = await response.json();
      }
      
      setStatus({
        status: 'completed',
        message: 'Resumo gerado com sucesso!',
        progress: 100
      })

      // Salvar no banco de dados
      const newSummary = { ...data, isFavorite: false }
      await db.saveSummary(newSummary)
      
      // Atualizar estado local
      setSummaries(prev => [newSummary, ...prev])
      setSummary(newSummary)
      
      // Atualizar uso de API
      await db.updateApiUsage('gemini')
      const newUsage = await db.getApiUsage()
      setApiUsage(newUsage)
      
      // Adicionar notificação de sucesso
      addNotification(
        'success',
        '✅ Resumo Gerado!',
        `Resumo ${data.summaryType} criado com sucesso para "${data.videoInfo?.title || 'Vídeo'}"`,
        {
          label: 'Ver Resumo',
          onClick: () => {
            // Scroll para o resumo
            document.getElementById('summary-result')?.scrollIntoView({ behavior: 'smooth' })
          }
        }
      )
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setStatus({
        status: 'error',
        message: errorMessage,
        progress: 0
      })
      
      // Adicionar notificação de erro
      addNotification(
        'error',
        '❌ Erro ao Gerar Resumo',
        errorMessage,
        {
          label: 'Tentar Novamente',
          onClick: () => {
            // Resetar status para permitir nova tentativa
            setStatus({
              status: 'idle',
              message: 'Digite a URL de uma live do YouTube para começar',
              progress: 0
            })
          }
        }
      )
    }
  }

  const resetForm = () => {
    setVideoUrl('')
    setSummary(null)
    setStatus({
      status: 'idle',
      message: 'Digite a URL de uma live do YouTube para começar',
      progress: 0
    })
  }

  // Funções para gerenciar histórico
  const handleSummarySelect = (selectedSummary: SummaryResponse) => {
    setSummary(selectedSummary)
    setVideoUrl(selectedSummary.videoId)
          setSummaryType(selectedSummary.summaryType as 'brief' | 'detailed' | 'super-detailed' | 'key-points')
    setLanguage(selectedSummary.language)
    setMaxLength(selectedSummary.summary.length)
  }

  const handleSummaryDelete = async (id: string) => {
    try {
      await db.deleteSummary(id)
      setSummaries(prev => prev.filter(s => s.id !== id))
      if (summary?.id === id) {
        setSummary(null)
      }
      addNotification('success', '🗑️ Resumo Excluído', 'Resumo removido com sucesso')
    } catch (error) {
      console.error('❌ Erro ao excluir resumo:', error)
      addNotification('error', '❌ Erro ao Excluir', 'Falha ao excluir resumo')
    }
  }

  const handleSummaryFavorite = async (id: string) => {
    try {
      const updatedSummaries = summaries.map(s => 
        s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
      )
      setSummaries(updatedSummaries)
      
      // Salva no banco
      const summaryToUpdate = updatedSummaries.find(s => s.id === id)
      if (summaryToUpdate) {
        await db.saveSummary(summaryToUpdate)
      }
    } catch (error) {
      console.error('❌ Erro ao favoritar resumo:', error)
    }
  }

  const handleAdvancedSettingsChange = async (newSettings: AdvancedSettingsType) => {
    try {
      setAdvancedSettings(newSettings)
      setMaxLength(newSettings.maxLength)
      setLanguage(newSettings.language)
      
      // Salva no banco
      await db.saveSettings({
        ...newSettings,
        lastUpdated: new Date()
      })
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error)
      addNotification('error', '❌ Erro ao Salvar', 'Falha ao salvar configurações')
    }
  }

  // Funções para gerenciar notificações
  const addNotification = (type: Notification['type'], title: string, message: string, action?: Notification['action']) => {
    // Notificações são gerenciadas pelo NotificationSystem
    console.log(`🔔 ${type}: ${title} - ${message}`)
  }

  const handleNotificationRead = (id: string) => {
    // Notificações são gerenciadas pelo NotificationSystem
    console.log('Notificação lida:', id)
  }

  const handleNotificationDismiss = (id: string) => {
    // Notificações são gerenciadas pelo NotificationSystem
    console.log('Notificação descartada:', id)
  }

  const clearAllNotifications = () => {
    // Notificações são gerenciadas pelo NotificationSystem
  }

  // Funções de gerenciamento de banco de dados
  const exportDatabase = async () => {
    try {
      const blob = await db.exportDatabase()
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `youtube-summarizer-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      addNotification('success', '📤 Banco Exportado', 'Backup criado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao exportar banco:', error)
      addNotification('error', '❌ Erro ao Exportar', 'Falha ao criar backup')
    }
  }

  const importDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const success = await db.importDatabase(await file.text())
      if (success) {
        // Recarrega dados
        const allSummaries = await db.summaries.toArray()
        const usage = await db.getApiUsage()
        const settings = await db.loadSettings()
        
        setSummaries(allSummaries)
        setApiUsage(usage)
        if (settings) {
          setAdvancedSettings(prev => ({
            ...prev,
            maxLength: settings.maxLength,
            language: settings.language,
            summaryStyle: settings.summaryStyle,
            includeContext: settings.includeContext,
            includeQuotes: settings.includeQuotes,
            includeTimestamps: settings.includeTimestamps,
            sentimentAnalysis: settings.sentimentAnalysis,
            topicExtraction: settings.topicExtraction,
            keyPointsCount: settings.keyPointsCount,
            outputFormat: settings.outputFormat,
            temperature: settings.temperature,
            creativity: settings.creativity,
            focusAreas: settings.focusAreas
          }))
          setMaxLength(settings.maxLength)
          setLanguage(settings.language)
        }
        
        addNotification('success', '📥 Banco Importado', 'Dados restaurados com sucesso!')
      }
    } catch (error) {
      console.error('❌ Erro ao importar banco:', error)
      addNotification('error', '❌ Erro ao Importar', 'Formato de arquivo inválido')
    }
    
    // Limpa input
    event.target.value = ''
  }

  const clearDatabase = async () => {
    if (confirm('⚠️ Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita!')) {
      try {
        await db.clearDatabase()
        setSummaries([])
        setSummary(null)
        setApiUsage({ gemini: 0, openai: 0, local: 0 })
        addNotification('success', '🗑️ Banco Limpo', 'Todos os dados foram removidos')
      } catch (error) {
        console.error('❌ Erro ao limpar banco:', error)
        addNotification('error', '❌ Erro ao Limpar', 'Falha ao limpar banco')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-youtube-red p-2 rounded-lg">
                <Youtube className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">YouTube Live Summarizer</h1>
                <p className="text-gray-600">Resumo inteligente de lives com IA</p>
              </div>
            </div>
            
            {/* Sistema de Notificações */}
            <NotificationSystem
              notifications={notifications}
              onNotificationRead={handleNotificationRead}
              onNotificationDismiss={handleNotificationDismiss}
              onClearAll={clearAllNotifications}
            />

            {/* Gerenciamento de Banco */}
            <div className="flex items-center space-x-2">
              <button
                onClick={exportDatabase}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="Exportar Banco de Dados"
              >
                <Download className="h-5 w-5" />
              </button>
              
              <label className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={importDatabase}
                  className="hidden"
                />
                <Upload className="h-5 w-5" />
                <span className="sr-only">Importar Banco de Dados</span>
              </label>
              
              <button
                onClick={clearDatabase}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Limpar Banco de Dados"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulário */}
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <Play className="h-6 w-6 mr-2 text-primary-600" />
            Processar Live do YouTube
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                URL da Live/Vídeo
              </label>
              <input
                type="url"
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="summaryType" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Resumo
                </label>
                <select
                  id="summaryType"
                  value={summaryType}
                  onChange={(e) => setSummaryType(e.target.value as 'brief' | 'detailed' | 'super-detailed' | 'key-points')}
                  className="input-field"
                >
                  <option value="brief">Resumido</option>
                  <option value="detailed">Detalhado</option>
                  <option value="super-detailed">Super Detalhado</option>
                  <option value="key-points">Pontos-Chave</option>
                </select>
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input-field"
                >
                  <option value="pt-BR">Português (BR)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>

              <div>
                <label htmlFor="maxLength" className="block text-sm font-medium text-gray-700 mb-2">
                  Tamanho Máximo
                </label>
                <input
                  type="number"
                  id="maxLength"
                  value={maxLength}
                  onChange={(e) => setMaxLength(Number(e.target.value))}
                  min="100"
                  max="5000"
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button type="submit" className="btn-primary flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Gerar Resumo
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                Limpar
              </button>
            </div>
          </form>
        </div>

        {/* Status e Configurações em Linha */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">Status do Processamento</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{status.message}</span>
                <span className="text-sm font-medium text-gray-900">{status.progress}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    status.status === 'completed' ? 'bg-green-500' :
                    status.status === 'error' ? 'bg-red-500' :
                    status.status === 'processing' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  style={{ width: `${status.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Configurações Avançadas */}
          <div>
            <AdvancedSettings 
              onSettingsChange={handleAdvancedSettingsChange}
              currentSettings={advancedSettings}
            />
          </div>
        </div>

        {/* Resultado */}
        {summary && (
          <div id="summary-result" className="space-y-6">
            {/* Informações do Vídeo */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary-600" />
                Informações do Vídeo
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={summary.videoInfo?.thumbnail}
                    alt="Thumbnail do vídeo"
                    className="w-full rounded-lg shadow-sm"
                  />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{summary.videoInfo?.title}</h4>
                    <p className="text-sm text-gray-600">{summary.videoInfo?.channelTitle}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {summary.videoInfo?.duration}
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {summary.videoInfo?.viewCount} visualizações
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {summary.videoInfo?.publishedAt ? new Date(summary.videoInfo.publishedAt).toLocaleDateString('pt-BR') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-primary-600" />
                Resumo Gerado
              </h3>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{summary.summary}</p>
              </div>
            </div>

            {/* Pontos-Chave */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
                Pontos-Chave
              </h3>
              
              <ul className="space-y-2">
                {summary.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Metadados */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadados</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tipo:</span>
                  <span className="ml-2 font-medium text-gray-900 capitalize">{summary.summaryType}</span>
                </div>
                <div>
                  <span className="text-gray-600">Idioma:</span>
                  <span className="ml-2 font-medium text-gray-900">{summary.language}</span>
                </div>
                <div>
                  <span className="text-gray-600">Sentimento:</span>
                  <span className={`ml-2 font-medium capitalize ${
                    summary.sentiment === 'positive' ? 'text-green-600' :
                    summary.sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {summary.sentiment === 'positive' ? 'Positivo' :
                     summary.sentiment === 'negative' ? 'Negativo' : 'Neutro'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Duração:</span>
                  <span className="ml-2 font-medium text-gray-900">{Math.floor(summary.duration / 60)}:{String(summary.duration % 60).padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard e Arquivo por Autor em Linha */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Dashboard de Analytics */}
          <div>
            <AnalyticsDashboard 
              summaries={summaries}
              apiUsage={apiUsage}
            />
          </div>

          {/* Arquivo por Autor */}
          <div>
            <AuthorArchive 
              summaries={summaries}
              onSummarySelect={handleSummarySelect}
              onSummaryDelete={handleSummaryDelete}
              onSummaryFavorite={handleSummaryFavorite}
            />
          </div>
        </div>

        {/* Histórico de Resumos */}
        <SummaryHistory 
          summaries={summaries}
          onSummarySelect={handleSummarySelect}
          onSummaryDelete={handleSummaryDelete}
          onSummaryFavorite={handleSummaryFavorite}
        />
      </main>
    </div>
  )
}
