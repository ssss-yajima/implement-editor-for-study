import type { IncomingMessage } from 'node:http';
import express from 'express';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  type CompletionItem,
  CompletionItemKind,
  IPCMessageReader,
  IPCMessageWriter,
  type InitializeParams,
  type InitializeResult,
  ProposedFeatures,
  type TextDocumentPositionParams,
  TextDocumentSyncKind,
  TextDocuments,
  createConnection,
} from 'vscode-languageserver/node.js';
import { runLanguageServer } from './language-server-runner.js';

// Language Server設定
const startServer = () => {
  // IPCを使用して接続を作成
  const connection = createConnection(
    new IPCMessageReader(process),
    new IPCMessageWriter(process)
  );
  const documents = new TextDocuments(TextDocument);

  // 初期化時の処理
  connection.onInitialize((params: InitializeParams): InitializeResult => {
    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        completionProvider: {
          resolveProvider: true,
          triggerCharacters: ['-', '#', ' '],
        },
      },
    };
  });

  // 補完候補の提供
  connection.onCompletion(
    (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
      return [
        {
          label: '# ',
          kind: CompletionItemKind.Snippet,
          detail: '見出し1',
          insertText: '# ',
        },
        {
          label: '## ',
          kind: CompletionItemKind.Snippet,
          detail: '見出し2',
          insertText: '## ',
        },
        {
          label: '### ',
          kind: CompletionItemKind.Snippet,
          detail: '見出し3',
          insertText: '### ',
        },
        {
          label: '- ',
          kind: CompletionItemKind.Snippet,
          detail: 'リスト',
          insertText: '- ',
        },
        {
          label: '```',
          kind: CompletionItemKind.Snippet,
          detail: 'コードブロック',
          insertText: '```\\n\\n```',
        },
      ];
    }
  );

  // ドキュメントの管理をconnectionに紐付け
  documents.listen(connection);
  connection.listen();
};

// Language Serverの起動
runLanguageServer({
  serverName: 'MARKDOWN',
  pathName: '/markdown',
  serverPort: 3001,
  wsServerOptions: {
    noServer: true,
    perMessageDeflate: false,
    clientTracking: true,
    verifyClient: (
      clientInfo: { origin: string; secure: boolean; req: IncomingMessage },
      callback: (result: boolean) => void
    ) => {
      const parsedURL = new URL(
        `${clientInfo.origin}${clientInfo.req.url ?? ''}`
      );
      const authToken = parsedURL.searchParams.get('authorization');
      if (authToken === 'UserAuth') {
        callback(true);
      } else {
        callback(false);
      }
    },
  },
  logMessages: true,
});

startServer();
