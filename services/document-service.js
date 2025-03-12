const mammoth = require("mammoth");
const fs = require("fs-extra");
const axios = require("axios");
const { webhookUrls } = require("../config/app-config");

/**
 * Extrai texto de um arquivo DOCX
 * @param {string} filePath - Caminho do arquivo DOCX
 * @returns {Promise<string>} - Texto extraído
 */
async function extractTextFromDocx(filePath) {
  try {
    const docxBuffer = fs.readFileSync(filePath);
    console.log(`Tamanho do buffer: ${docxBuffer.length} bytes`);

    // Verificar se o arquivo é realmente um DOCX válido
    if (docxBuffer.length < 100) {
      throw new Error("Arquivo DOCX inválido ou muito pequeno");
    }

    // Opções para extração de texto com mais formatação
    const extractionOptions = {
      buffer: docxBuffer,
      extractAPIInfo: true,
      includeEmbeddedStyleMap: true,
      preserveNumbering: true,
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p => p:fresh",
      ],
    };

    console.log("Tentando extrair texto com opções avançadas...");

    // Primeiro tente extrair com HTML para preservar mais formatação
    const htmlResult = await mammoth.convertToHtml(extractionOptions);
    // Depois tente extrair apenas o texto bruto
    const textResult = await mammoth.extractRawText(extractionOptions);

    console.log(
      "Mensagens de aviso da extração:",
      JSON.stringify(htmlResult.messages || textResult.messages || [])
    );

    // Vamos usar o HTML se disponível, senão o texto puro
    let textoExtraido = htmlResult.value || textResult.value || "";

    // Se o HTML foi extraído, vamos converter para texto simples para casos onde só queremos o texto
    if (htmlResult.value && htmlResult.value.length > textResult.value.length) {
      console.log("Usando extração HTML, que contém mais conteúdo");
      // Remover tags HTML de maneira simples para obter texto
      textoExtraido = htmlResult.value
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    // Verificar se o texto extraído tem conteúdo real (não apenas whitespace)
    if (!textoExtraido || textoExtraido.trim().length < 10) {
      console.error(
        "Texto extraído está vazio ou contém apenas whitespace:",
        JSON.stringify(textoExtraido)
      );

      // Última tentativa: tentar ler o arquivo como texto simples
      try {
        const rawContent = docxBuffer.toString("utf8");
        const textContent = rawContent
          .replace(/[^\x20-\x7E\n\r\t]/g, " ")
          .trim();

        if (textContent.length > 50) {
          console.log("Usando extração alternativa de texto");
          textoExtraido = "EXTRAÇÃO ALTERNATIVA:\n\n" + textContent;
        } else {
          throw new Error("Não foi possível extrair texto legível do arquivo");
        }
      } catch (e) {
        throw new Error(
          "Não foi possível extrair texto do arquivo: " + e.message
        );
      }
    }

    console.log("Texto extraído (início):", textoExtraido.slice(0, 100), "...");
    return textoExtraido;
  } catch (error) {
    console.error("Erro ao processar o arquivo DOCX:", error);
    throw error;
  }
}

/**
 * Envia um recurso para processamento através do webhook
 * @param {string} textoExtraido - Texto extraído do documento
 * @param {string} fileName - Nome do arquivo
 * @param {string} fileId - ID do arquivo no Google Drive
 * @param {string} resourceType - Tipo de recurso (braille, audio, pdf, questoes)
 * @returns {Promise<Object>} - Resposta do webhook
 */
async function processResource(textoExtraido, fileName, fileId, resourceType) {
  try {
    if (!webhookUrls[resourceType]) {
      throw new Error(`Tipo de recurso inválido: ${resourceType}`);
    }

    console.log(`Processando recurso ${resourceType} para ${fileName}`);

    // Enviar a requisição para o webhook
    const response = await axios.post(webhookUrls[resourceType], {
      textoExtraido: textoExtraido,
      fileName: fileName,
      fileId: fileId,
    });

    console.log(`Resposta do webhook ${resourceType}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Erro no processamento de ${resourceType}:`, error);
    throw error;
  }
}

/**
 * Processa múltiplos recursos em paralelo
 * @param {string} textoExtraido - Texto extraído do documento
 * @param {string} fileName - Nome do arquivo
 * @param {string} fileId - ID do arquivo no Google Drive
 * @returns {Promise<Object>} - Status e resultados do processamento
 */
async function processAllResources(textoExtraido, fileName, fileId) {
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

  // Iniciar processamento paralelo
  const processingPromises = Object.keys(webhookUrls).map(
    async (resourceType) => {
      try {
        console.log(`Iniciando processamento do recurso: ${resourceType}`);
        status[resourceType] = "processing";

        // Enviar a requisição para o webhook específico
        const response = await axios.post(webhookUrls[resourceType], {
          textoExtraido: textoExtraido,
          fileName: fileName,
          fileId: fileId,
        });

        console.log(`Resposta do webhook ${resourceType}:`, response.data);

        // Armazenar o resultado
        results[resourceType] = response.data;
        status[resourceType] = "completed";

        return { resourceType, status: "completed", result: response.data };
      } catch (error) {
        console.error(`Erro no processamento de ${resourceType}:`, error);
        status[resourceType] = "error";
        results[resourceType] = { error: error.message };

        return { resourceType, status: "error", error: error.message };
      }
    }
  );

  // Aguardar que todos os processamentos sejam concluídos ou falhem
  await Promise.allSettled(processingPromises);

  return {
    status,
    results,
    processingStatus: "completed",
  };
}

module.exports = {
  extractTextFromDocx,
  processResource,
  processAllResources,
};
