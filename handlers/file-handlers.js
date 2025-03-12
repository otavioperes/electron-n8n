const { ipcMain } = require("electron");
const { ROOT_FOLDER_ID } = require("../config/app-config");
const { listFolders, listFiles } = require("../services/drive-service");

/**
 * Configura os handlers IPC relacionados a listagem de arquivos e pastas
 * @param {BrowserWindow} mainWindow - Janela principal do Electron
 */
function setupFileHandlers(mainWindow) {
  /**
   * Listar pastas dentro de uma pasta específica
   */
  ipcMain.handle("listar-pastas", async (event, parentFolderId = null) => {
    try {
      const folders = await listFolders(parentFolderId, ROOT_FOLDER_ID);
      return folders;
    } catch (error) {
      console.error("Erro ao listar pastas:", error.message);
      return [];
    }
  });

  /**
   * Listar arquivos .docx e Documentos Google dentro de uma pasta específica
   */
  ipcMain.handle("listar-arquivos", async (event, folderId = null) => {
    try {
      const files = await listFiles(folderId, ROOT_FOLDER_ID);
      return files;
    } catch (error) {
      console.error("Erro ao listar arquivos:", error.message);
      return [];
    }
  });

  /**
   * Handler para solicitar o status atual de um arquivo em processamento
   */
  ipcMain.handle("get-resource-status", async (event, fileId) => {
    try {
      // Este handler permite ao frontend verificar o status atual dos recursos
      // para um determinado arquivo, útil quando a aplicação é reiniciada

      // Na implementação real, você poderia armazenar esses estados em um banco de dados
      // ou em um arquivo local para persistência

      // Por enquanto, apenas enviamos um status "not found" se o arquivo não estiver
      // em processamento ativo

      return {
        found: false,
        message: "Nenhum processamento ativo encontrado para este arquivo",
      };
    } catch (error) {
      console.error("Erro ao obter status de recursos:", error);
      return { error: error.message };
    }
  });

  console.log("Handlers de arquivo configurados com sucesso");
}

module.exports = {
  setupFileHandlers,
};
