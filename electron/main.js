const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Mantenha uma referência global do objeto da janela
let mainWindow;

function createWindow() {
  // Criar a janela do navegador
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'default',
    show: false, // Não mostrar até estar pronto
    backgroundColor: '#f8fafc'
  });

  // Carregar a aplicação
  if (isDev) {
    // Em desenvolvimento, carregar do servidor Next.js
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // Em produção, carregar do build estático
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  // Mostrar a janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focar na janela
    mainWindow.focus();
  });

  // Emitido quando a janela é fechada
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevenir navegação para URLs externas
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:3000' && !isDev) {
      event.preventDefault();
    }
  });

  // Prevenir novas janelas
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
}

// Este método será chamado quando o Electron terminar a inicialização
app.whenReady().then(() => {
  createWindow();

  // Criar menu personalizado
  createMenu();

  app.on('activate', () => {
    // No macOS, é comum recriar uma janela quando o dock é clicado
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit quando todas as janelas estiverem fechadas
app.on('window-all-closed', () => {
  // No macOS, é comum para aplicações manterem-se ativas
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Criar menu da aplicação
function createMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Nova Análise',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('new-analysis');
            }
          }
        },
        {
          label: 'Salvar Resumo',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('save-summary');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Sair',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Recortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
        { role: 'selectall', label: 'Selecionar Tudo' }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { role: 'forceReload', label: 'Forçar Recarregamento' },
        { role: 'toggleDevTools', label: 'Ferramentas de Desenvolvedor' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Normal' },
        { role: 'zoomIn', label: 'Aumentar Zoom' },
        { role: 'zoomOut', label: 'Diminuir Zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tela Cheia' }
      ]
    },
    {
      label: 'Ferramentas',
      submenu: [
        {
          label: 'Configurações',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-settings');
            }
          }
        },
        {
          label: 'Histórico',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-history');
            }
          }
        }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Sobre YouTube Live Summarizer',
              message: 'YouTube Live Summarizer',
              detail: 'Versão 1.0.0\n\nAplicativo para fazer resumo automático de lives do YouTube usando IA.\n\nDesenvolvido com ❤️ para facilitar o consumo de conteúdo.'
            });
          }
        },
        {
          label: 'Documentação',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-docs');
            }
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers para comunicação com o renderer
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-name', () => {
  return app.getName();
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

// Manipular ativação da aplicação (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Manipular segunda instância (Windows)
if (process.platform === 'win32') {
  const gotTheLock = app.requestSingleInstanceLock();
  
  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // Alguém tentou executar uma segunda instância, devemos focar nossa janela
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });
  }
}



