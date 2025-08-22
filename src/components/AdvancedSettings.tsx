import React, { useState } from 'react'

interface AdvancedSettingsProps {
  onSettingsChange: (settings: AdvancedSettings) => void
  currentSettings: AdvancedSettings
}

export interface AdvancedSettings {
  // Configurações de resumo
  maxLength: number
  summaryStyle: 'academic' | 'casual' | 'professional' | 'storytelling'
  includeContext: boolean
  includeQuotes: boolean
  includeTimestamps: boolean
  
  // Configurações de análise
  sentimentAnalysis: boolean
  topicExtraction: boolean
  keyPointsCount: number
  
  // Configurações de formatação
  language: string
  outputFormat: 'text' | 'markdown' | 'html' | 'json'
  
  // Configurações de IA
  temperature: number
  creativity: 'low' | 'medium' | 'high'
  focusAreas: string[]
  
  // Metadados
  lastUpdated?: Date
}

export default function AdvancedSettings({ onSettingsChange, currentSettings }: AdvancedSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSettingChange = (key: keyof AdvancedSettings, value: string | number | boolean | string[]) => {
    const newSettings = { ...currentSettings, [key]: value }
    onSettingsChange(newSettings)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold text-gray-800">
          ⚙️ Configurações Avançadas
        </h3>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-6">
          {/* Configurações de Resumo */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">📝 Estilo do Resumo</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Estilo de Escrita
                </label>
                <select
                  value={currentSettings.summaryStyle}
                  onChange={(e) => handleSettingChange('summaryStyle', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="academic">Acadêmico</option>
                  <option value="casual">Casual</option>
                  <option value="professional">Profissional</option>
                  <option value="storytelling">Narrativo</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Número de Pontos-Chave
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={currentSettings.keyPointsCount}
                  onChange={(e) => handleSettingChange('keyPointsCount', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Configurações de Conteúdo */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">🔍 Conteúdo Incluído</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentSettings.includeContext}
                  onChange={(e) => handleSettingChange('includeContext', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Incluir contexto histórico/cultural</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentSettings.includeQuotes}
                  onChange={(e) => handleSettingChange('includeQuotes', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Incluir citações importantes</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentSettings.includeTimestamps}
                  onChange={(e) => handleSettingChange('includeTimestamps', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Incluir timestamps relevantes</span>
              </label>
            </div>
          </div>

          {/* Configurações de Análise */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">📊 Análise Avançada</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentSettings.sentimentAnalysis}
                  onChange={(e) => handleSettingChange('sentimentAnalysis', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Análise de sentimento detalhada</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentSettings.topicExtraction}
                  onChange={(e) => handleSettingChange('topicExtraction', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Extração avançada de tópicos</span>
              </label>
            </div>
          </div>

          {/* Configurações de IA */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">🤖 Configurações de IA</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Criatividade
                </label>
                <select
                  value={currentSettings.creativity}
                  onChange={(e) => handleSettingChange('creativity', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Baixa (Mais preciso)</option>
                  <option value="medium">Média (Equilibrado)</option>
                  <option value="high">Alta (Mais criativo)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formato de Saída
                </label>
                <select
                  value={currentSettings.outputFormat}
                  onChange={(e) => handleSettingChange('outputFormat', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Texto simples</option>
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML</option>
                  <option value="json">JSON estruturado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Áreas de Foco */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">🎯 Áreas de Foco</h4>
            <div className="space-y-2">
              {['tecnologia', 'educação', 'saúde', 'negócios', 'arte', 'ciência', 'história', 'política'].map((area) => (
                <label key={area} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentSettings.focusAreas.includes(area)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleSettingChange('focusAreas', [...currentSettings.focusAreas, area])
                      } else {
                        handleSettingChange('focusAreas', currentSettings.focusAreas.filter(a => a !== area))
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600 capitalize">{area}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
