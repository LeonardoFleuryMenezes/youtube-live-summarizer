const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs protegidas para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Informações da aplicação
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppName: () => ipcRenderer.invoke('get-app-name'),
  
  // Diálogos do sistema
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Eventos do menu
  onNewAnalysis: (callback) => ipcRenderer.on('new-analysis', callback),
  onSaveSummary: (callback) => ipcRenderer.on('save-summary', callback),
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
  onOpenHistory: (callback) => ipcRenderer.on('open-history', callback),
  onOpenDocs: (callback) => ipcRenderer.on('open-docs', callback),
  
  // Utilitários
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development',
  
  // Remover listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Expor APIs para funcionalidades específicas
contextBridge.exposeInMainWorld('appFeatures', {
  // Funcionalidades de desktop
  canUseSystemDialogs: true,
  canUseNativeMenus: true,
  canUseFileSystem: true,
  
  // Funcionalidades específicas da plataforma
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux'
});

// Expor informações de ambiente
contextBridge.exposeInMainWorld('env', {
  NODE_ENV: process.env.NODE_ENV,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production'
});

// Log de inicialização
console.log('🔌 Preload script carregado');
console.log('📱 Plataforma:', process.platform);
console.log('🌍 Ambiente:', process.env.NODE_ENV);
console.log('⚡ Electron APIs expostas com sucesso');



