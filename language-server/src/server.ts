import express from 'express';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  type CompletionItem,
  CompletionItemKind,
  type InitializeParams,
  type InitializeResult,
  ProposedFeatures,
  type TextDocumentPositionParams,
  TextDocumentSyncKind,
  TextDocuments,
  createConnection,
} from 'vscode-languageserver/node.js';
import {
  ConsoleLogger,
  WebSocketMessageReader,
  WebSocketMessageWriter,
  createWebSocketConnection,
} from 'vscode-ws-jsonrpc';
import { WebSocketServer } from 'ws';

// 言語サーバーの設定
const connection = createConnection(ProposedFeatures.all);
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

// WebSocketサーバーの設定
const app = express();
const wss = new WebSocketServer({ noServer: true });

// WebSocketの接続処理
wss.on('connection', (webSocket) => {
  const socket = {
    send: (content: string) => webSocket.send(content),
    onMessage: (callback: (data: any) => void) =>
      webSocket.on('message', callback),
    onError: (callback: (error: Error) => void) =>
      webSocket.on('error', callback),
    onClose: (callback: (code: number, reason: string) => void) =>
      webSocket.on('close', callback),
    dispose: () => webSocket.close(),
  };

  // WebSocket接続を言語サーバーのconnectionに変換
  // const reader = new WebSocketMessageReader(socket);
  // const writer = new WebSocketMessageWriter(socket);
  const logger = new ConsoleLogger();
  const socketConnection = createWebSocketConnection(socket, logger);

  // 言語サーバーの接続を開始
  connection.listen();
});

// HTTPサーバーの設定
const server = app.listen(3001, () => {
  console.log('Language server is running on port 3001');
});

// WebSocketサーバーをHTTPサーバーにアップグレード
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '', 'http://localhost').pathname;

  if (pathname === '/markdown') {
    wss.handleUpgrade(request, socket, head, (webSocket) => {
      wss.emit('connection', webSocket, request);
    });
  }
});
