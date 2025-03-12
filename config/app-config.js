const path = require("path");
const os = require("os");

// Caminho da pasta de downloads
const downloadsPath = path.join(os.homedir(), "Downloads", "ConstrutorDeAulas");

// ID da pasta raiz no Google Drive
const ROOT_FOLDER_ID = "11ihE_KnUKKCVBIaX7UhDzH8py36HsS3F";

// URLs dos webhooks para cada tipo de recurso
const webhookUrls = {
  braille: "http://localhost:5678/webhook/gerar-braille",
  audio: "http://localhost:5678/webhook/gerar-audio",
  pdf: "http://localhost:5678/webhook/gerar-pdf",
  questoes: "http://localhost:5678/webhook/gerar-questoes",
};

// Inicialização de configurações
function initConfig() {
  console.log("Inicializando configurações da aplicação...");
  return {
    downloadsPath,
    ROOT_FOLDER_ID,
    webhookUrls,
  };
}

module.exports = {
  downloadsPath,
  ROOT_FOLDER_ID,
  webhookUrls,
  initConfig,
};
