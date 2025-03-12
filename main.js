const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs-extra");
const os = require("os");

// Importar módulos
const { initConfig, downloadsPath } = require("./config/app-config");
const { initGoogleDrive } = require("./services/drive-service");
const { setupFileHandlers } = require("./handlers/file-handlers");
const { setupGenerationHandlers } = require("./handlers/generation-handlers");
const { setupResourceHandlers } = require("./handlers/resource-handlers");

// Variável global para a janela principal
let mainWindow;

// Inicialização da aplicação
async function init() {
  // Garantir que o diretório de downloads existe
  fs.ensureDirSync(downloadsPath);

  // Inicializar serviço do Google Drive
  await initGoogleDrive();

  // Configurar handlers
  setupFileHandlers(mainWindow);
  setupGenerationHandlers(mainWindow);
  setupResourceHandlers(mainWindow);
}

// Criar a janela principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Inicializar componentes após criação da janela
  init().catch((err) => console.error("Erro na inicialização:", err));
}

// Eventos do ciclo de vida do Electron
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Exportar a mainWindow para que outros módulos possam acessá-la
module.exports = { getMainWindow: () => mainWindow };
