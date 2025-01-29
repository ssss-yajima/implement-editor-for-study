// @ts-ignore
import * as vscode from '@codingame/monaco-vscode-api';
import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import type { WrapperConfig } from 'monaco-editor-wrapper';
import type { MonacoLanguageClient } from 'monaco-languageclient';
import { createUrl } from 'monaco-languageclient/tools';
import {
  WebSocketMessageReader,
  WebSocketMessageWriter,
  toSocket,
} from 'vscode-ws-jsonrpc';

export const createUserConfig = (
  workspaceRoot: string,
  code: string,
  codeUri: string
): WrapperConfig => {
  const url = createUrl({
    secured: false,
    host: 'localhost',
    port: 3001,
    path: 'markdown',
  });
  const webSocket = new WebSocket(url);
  const iWebSocket = toSocket(webSocket);
  const reader = new WebSocketMessageReader(iWebSocket);
  const writer = new WebSocketMessageWriter(iWebSocket);

  return {
    $type: 'extended',
    logLevel: 2,
    languageClientConfigs: {
      markdown: {
        name: 'Markdown Language Server Example',
        connection: {
          options: {
            $type: 'WebSocketDirect',
            webSocket: webSocket,
            startOptions: {
              onCall: (languageClient?: MonacoLanguageClient) => {
                if (languageClient) {
                  languageClient.start();
                }
              },
              reportStatus: true,
            },
          },
          messageTransports: { reader, writer },
        },
        clientOptions: {
          documentSelector: ['markdown'],
          workspaceFolder: {
            index: 0,
            name: 'workspace',
            uri: vscode.Uri.parse(workspaceRoot),
          },
        },
      },
    },
    vscodeApiConfig: {
      serviceOverrides: {
        ...getKeybindingsServiceOverride(),
      },
      userConfiguration: {
        json: JSON.stringify({
          'workbench.colorTheme': 'Default Dark Modern',
          'editor.guides.bracketPairsHorizontal': 'active',
          'editor.wordBasedSuggestions': 'off',
          'editor.experimental.asyncTokenization': true,
        }),
      },
    },
    editorAppConfig: {
      codeResources: {
        [codeUri]: {
          text: code,
          uri: codeUri,
        },
      },
    },
  };
};
