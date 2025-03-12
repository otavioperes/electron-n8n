const { ipcMain } = require("electron");
const { processResource } = require("../services/document-service");
const { extractTextFromDocx } = require("../services/document-service");
const { downloadResource } = require("../utils/file-utils");
const fs = require("fs-extra");

/**
 * Configura os handlers IPC relacionados ao processamento e download de recursos
 * @param {BrowserWindow} mainWindow - Janela principal do Electron
 */
function setupResourceHandlers(mainWindow) {
  /**
   * Handler para processar recursos individuais manualmente
   */
  ipcMain.handle(
    "process-resource",
    async (event, { fileId, resourceType, fileName, filePath }) => {
      try {
        if (!fileId || !resourceType || !fileName) {
          throw new Error("Parâmetros insuficientes para processar o recurso");
        }

        // Extrair o texto novamente se necessário
        let textoExtraido;
        if (filePath && fs.existsSync(filePath)) {
          textoExtraido = await extractTextFromDocx(filePath);
        } else {
          throw new Error("Arquivo não encontrado para processamento");
        }

        // Processar o recurso específico
        const result = await processResource(
          textoExtraido,
          fileName,
          fileId,
          resourceType
        );

        // Enviar atualização para o frontend
        if (mainWindow) {
          mainWindow.webContents.send("resource-update", {
            fileId: fileId,
            resourceType: resourceType,
            result: result,
            status: "completed",
            localPath: filePath,
          });
        }

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error(`Erro ao processar recurso ${resourceType}:`, error);

        // Enviar atualização de erro para o frontend
        if (mainWindow) {
          mainWindow.webContents.send("resource-update", {
            fileId: fileId,
            resourceType: resourceType,
            result: { error: error.message },
            status: "error",
          });
        }

        return { error: error.message };
      }
    }
  );

  /**
   * Handler para download de recursos quando o usuário clica em um dos botões
   */
  ipcMain.on("download-resource", async (event, resourceUrl) => {
    try {
      await downloadResource(resourceUrl);
    } catch (error) {
      console.error("Erro ao baixar recurso:", error);

      // Se mainWindow existir, enviar uma notificação de erro
      if (mainWindow) {
        mainWindow.webContents.send("download-error", {
          error: error.message,
          resourceUrl: resourceUrl,
        });
      }
    }
  });

  console.log("Handlers de recursos configurados com sucesso");
}

module.exports = {
  setupResourceHandlers,
};
