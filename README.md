# Electron + N8n - Exemplo Completo

Este projeto demonstra como integrar Electron e N8n para:

1. Listar arquivos de uma pasta do Google Drive
2. Baixar um arquivo .docx
3. Extrair texto via Mammoth localmente no Electron
4. Enviar texto ao N8n para gerar Braille, MP3, PDF e Questões

## Estrutura

- package.json
- main.js
- index.html
- style.css
- workflows/
  - listar-arquivos.json
  - baixar-arquivo.json
  - gerar-formatos.json

## Como Rodar

1. Instale dependências:
   npm install

2. Inicie o app:
   npm start

3. Importe os fluxos do N8n:

   - listar-arquivos.json
   - baixar-arquivo.json
   - gerar-formatos.json

4. Ajuste IDs de pasta do Drive e credenciais:

   - Em cada fluxo, configure 'Google Drive' node com suas credenciais
   - No main.js, aponte para http://localhost:5678 ou o endpoint real do N8n

5. Abra o app Electron e teste.
