const { ipcMain } = require("electron");
const fs = require("fs-extra");
const path = require("path");
const { downloadsPath } = require("../config/app-config");
const { downloadFile } = require("../services/drive-service");
const {
  extractTextFromDocx,
  processAllResources,
} = require("../services/document-service");
const {
  generateTempFileName,
  getTempFilePath,
} = require("../utils/file-utils");

/**
 * Configura os handlers IPC relacionados à geração de recursos
 * @param {BrowserWindow} mainWindow - Janela principal do Electron
 */
function setupGenerationHandlers(mainWindow) {
  /**
   * Gerar Aula a partir de um arquivo .docx (baixar, extrair texto, etc.)
   */
  ipcMain.handle("gerar-aula", async (event, fileId, fileName) => {
    try {
      console.log(
        `Iniciando geração de aula para fileId=${fileId}, fileName=${fileName}`
      );

      // 1) Sanitizar o nome do arquivo para evitar problemas com caracteres especiais
      const sanitizedFileName = generateTempFileName(fileId);
      const filePath = getTempFilePath(sanitizedFileName, downloadsPath);

      console.log(`Nome de arquivo sanitizado: ${sanitizedFileName}`);
      console.log(`Caminho completo: ${filePath}`);

      // 2) Baixar o arquivo do Google Drive
      try {
        const downloadResult = await downloadFile(fileId, filePath);
        console.log("Download concluído com sucesso:", downloadResult);
      } catch (downloadError) {
        console.error("Erro durante o download do arquivo:", downloadError);
        throw new Error(`Falha no download: ${downloadError.message}`);
      }

      // 3) Extrair texto do documento
      try {
        const textoExtraido = await extractTextFromDocx(filePath);
        console.log("Texto extraído com sucesso");

        // 4) Iniciar processamento de recursos em paralelo
        console.log(
          "Iniciando processamento paralelo com múltiplos webhooks..."
        );

        // Objeto para armazenar os resultados dos webhooks
        const results = {
          braille: null,
          audio: null,
          pdf: null,
          questoes: null,
        };

        // Status inicial, será atualizado conforme os webhooks responderem
        const status = {
          braille: "pending",
          audio: "pending",
          pdf: "pending",
          questoes: "pending",
        };

        // Função para enviar atualizações para o frontend sobre o progresso do processamento
        const sendProcessingUpdate = () => {
          if (mainWindow) {
            mainWindow.webContents.send("resource-update", {
              fileId: fileId,
              status: status,
              results: results,
              localPath: filePath,
            });
          }
        };

        // Iniciar processamento em segundo plano
        processAllResources(textoExtraido, fileName, fileId)
          .then((processingResult) => {
            // Atualizar os resultados e status
            Object.assign(results, processingResult.results);
            Object.assign(status, processingResult.status);

            // Enviar atualização final para o frontend
            sendProcessingUpdate();
          })
          .catch((processingError) => {
            console.error(
              "Erro no processamento de recursos:",
              processingError
            );

            // Atualizar status com erro
            Object.keys(status).forEach((key) => {
              if (status[key] === "processing") {
                status[key] = "error";
                results[key] = { error: processingError.message };
              }
            });

            // Enviar atualização de erro para o frontend
            sendProcessingUpdate();
          });

        // Enviar a primeira atualização de status
        sendProcessingUpdate();

        // Montar uma resposta normalizada para retorno imediato
        const normalizedResponse = {
          brailleLink: null,
          mp3Link: null,
          pdfLink: null,
          questoesLink: null,
          // Informações sobre o status do processamento
          processingStatus: "ongoing",
          message:
            "Processamento iniciado em paralelo. Os recursos serão atualizados conforme ficarem prontos.",
          localPath: filePath,
        };

        return normalizedResponse;
      } catch (processingError) {
        console.error("Erro ao processar o arquivo DOCX:", processingError);

        // Tentar remover arquivo potencialmente corrompido
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.error("Erro ao remover arquivo:", unlinkError);
        }

        throw new Error(
          `Falha ao processar o arquivo: ${processingError.message}`
        );
      }
    } catch (error) {
      console.error("Erro ao gerar aula:", error.message);
      return { error: error.message };
    }
  });

  console.log("Handlers de geração configurados com sucesso");
}

module.exports = {
  setupGenerationHandlers,
};
