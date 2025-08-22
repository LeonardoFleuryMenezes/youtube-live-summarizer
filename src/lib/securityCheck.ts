/**
 * 🚨 SISTEMA DE VERIFICAÇÃO DE SEGURANÇA
 * 
 * Este arquivo SEMPRE verificará se as chaves de API estão configuradas
 * e alertará sobre as chaves comprometidas.
 */

export interface SecurityStatus {
  isConfigured: boolean
  missingKeys: string[]
  compromisedKeys: boolean
  recommendations: string[]
}

export function checkSecurityStatus(): SecurityStatus {
  const missingKeys: string[] = []
  const recommendations: string[] = []
  
  // Verificar se as chaves estão configuradas
  if (!process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY === 'SUA_CHAVE_YOUTUBE_AQUI') {
    missingKeys.push('YouTube API Key')
    recommendations.push('Configure sua chave do YouTube no arquivo .env')
  }
  
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'SUA_CHAVE_OPENAI_AQUI') {
    missingKeys.push('OpenAI API Key')
    recommendations.push('Configure sua chave do OpenAI no arquivo .env')
  }
  
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'SUA_CHAVE_GEMINI_AQUI') {
    missingKeys.push('Gemini API Key')
    recommendations.push('Configure sua chave do Gemini no arquivo .env')
  }
  
  // Verificar se há chaves comprometidas (padrões conhecidos)
  const compromisedPatterns = [
    'CHAVE_COMPROMETIDA_YOUTUBE', // Placeholder para chave comprometida
    'CHAVE_COMPROMETIDA_OPENAI', // Placeholder para chave comprometida
    'CHAVE_COMPROMETIDA_GEMINI' // Placeholder para chave comprometida
  ]
  
  const hasCompromisedKeys = compromisedPatterns.some(pattern => 
    process.env.YOUTUBE_API_KEY?.includes(pattern) ||
    process.env.OPENAI_API_KEY?.includes(pattern) ||
    process.env.GEMINI_API_KEY?.includes(pattern)
  )
  
  if (hasCompromisedKeys) {
    recommendations.push('🚨 ALERTA: Chaves comprometidas detectadas! Revogue imediatamente!')
  }
  
  return {
    isConfigured: missingKeys.length === 0,
    missingKeys,
    compromisedKeys: hasCompromisedKeys,
    recommendations
  }
}

export function displaySecurityAlert(): void {
  const status = checkSecurityStatus()
  
  if (!status.isConfigured || status.compromisedKeys) {
    console.error('🚨 ALERTA DE SEGURANÇA! 🚨')
    console.error('Suas chaves de API foram expostas no GitHub!')
    console.error('')
    console.error('AÇÕES URGENTES NECESSÁRIAS:')
    console.error('1. Revogar chaves comprometidas (YouTube, OpenAI, Gemini)')
    console.error('2. Criar 3 novas chaves seguras')
    console.error('3. Configurar arquivo .env com novas chaves')
    console.error('')
    console.error('Veja o arquivo 🚨 ALERTA-SEGURANCA.md para instruções!')
    console.error('')
    
    // Mostrar alerta visual se estiver no navegador
    if (typeof window !== 'undefined') {
      alert('🚨 ALERTA DE SEGURANÇA!\n\nSuas chaves de API foram expostas no GitHub!\n\nANTES DE USAR ESTE PROJETO:\n1. Revogar chaves comprometidas\n2. Criar novas chaves seguras\n3. Configurar arquivo .env\n\nVeja 🚨 ALERTA-SEGURANCA.md para instruções!')
    }
  }
}

// Executar verificação automaticamente
if (typeof window !== 'undefined') {
  // No navegador, verificar após carregamento
  window.addEventListener('load', () => {
    setTimeout(displaySecurityAlert, 1000)
  })
} else {
  // No servidor, verificar imediatamente
  displaySecurityAlert()
}
