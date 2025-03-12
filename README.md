# Construtor de Aulas - Aplicativo Electron

Aplicativo desktop desenvolvido com Electron para integração com o Google Drive e n8n, permitindo a geração de recursos educacionais em múltiplos formatos (áudio, braille, PDF, questões) a partir de documentos do Word/Google Docs.

> Versão: 1.0.1 - Código modularizado

## Estrutura do Projeto

O projeto foi organizado em uma estrutura modular:

```
my-electron-app/
├── config/               # Configurações da aplicação
│   └── app-config.js     # Configurações centralizadas (caminhos, URLs, etc.)
├── handlers/             # Manipuladores de eventos IPC
│   ├── file-handlers.js      # Manipuladores para listagem de arquivos/pastas
│   ├── generation-handlers.js # Manipuladores para geração de recursos
│   └── resource-handlers.js   # Manipuladores para processamento/download
├── services/             # Serviços e integrações
│   ├── document-service.js  # Processamento de documentos DOCX
│   └── drive-service.js     # Integração com o Google Drive
├── utils/                # Utilitários
│   └── file-utils.js     # Funções para manipulação de arquivos
├── main.js               # Ponto de entrada da aplicação Electron
├── index.html            # Interface do usuário principal
└── style.css             # Estilos da interface
```

## Funcionalidades

- Autenticação com o Google Drive via Service Account
- Navegação nas pastas do Google Drive
- Visualização de documentos Word e Documentos Google
- Download e processamento de documentos
- Extração de texto de documentos DOCX
- Geração de recursos em formato de áudio, braille, PDF e questões
- Integração com webhooks do n8n para processamento de recursos

## Requisitos

- Node.js (v14 ou superior)
- npm ou yarn
- Credenciais de Service Account do Google para acesso à API do Google Drive
- Serviço n8n configurado com os workflows necessários

## Configuração e Instalação

1. Clone este repositório:

   ```
   git clone https://github.com/otavioperes/electron-n8n.git
   cd electron-n8n
   ```

2. Instale as dependências:

   ```
   npm install
   ```

3. Configure as credenciais do Google Drive:

   - Crie um arquivo `service-account.json` na raiz do projeto com suas credenciais de Service Account

4. Configure os webhooks do n8n no arquivo `config/app-config.js`:

   - Atualize as URLs para apontar para seus workflows do n8n

5. Execute o aplicativo:
   ```
   npm start
   ```

## Dependências Principais

- Electron: Framework para criação de aplicativos desktop usando HTML/CSS/JS
- Googleapis: Biblioteca oficial para acesso às APIs do Google
- Mammoth: Biblioteca para extração de texto de documentos DOCX
- Axios: Cliente HTTP para comunicação com webhooks
- fs-extra: Extensão do módulo fs para manipulação de arquivos

## Fluxo de Processamento

1. O usuário navega pelas pastas do Google Drive
2. Seleciona um documento para processamento
3. O aplicativo baixa o documento e extrai o texto
4. O texto é enviado para webhooks do n8n para processamento
5. Os recursos gerados (áudio, braille, PDF, questões) são disponibilizados para download

## Desenvolvimento

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature: `git checkout -b minha-nova-feature`
3. Faça commit das alterações: `git commit -am 'Adiciona nova feature'`
4. Envie para a branch: `git push origin minha-nova-feature`
5. Envie um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
