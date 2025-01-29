import type { IncomingMessage } from "node:http";
import { TextDocument } from "vscode-languageserver-textdocument";
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
} from "vscode-languageserver/node.js";
import type { IWebSocket } from "vscode-ws-jsonrpc";
import {
	WebSocketMessageReader,
	WebSocketMessageWriter,
} from "vscode-ws-jsonrpc";
import { type WebSocket, WebSocketServer } from "ws";

// Language Server設定
export const runMarkdownServer = () => {
	const wss = new WebSocketServer({ port: 3001 });
	console.log("Language server is running on port 3001");

	wss.on("connection", (webSocket: WebSocket) => {
		console.log("Client connected");
		const socket: IWebSocket = {
			send: (content: string) => webSocket.send(content),
			onMessage: (callback: (data: Buffer) => void) =>
				webSocket.on("message", callback),
			onError: (callback: (error: Error) => void) =>
				webSocket.on("error", callback),
			onClose: (callback: (code: number, reason: string) => void) =>
				webSocket.on("close", callback),
			dispose: () => webSocket.close(),
		};

		// Create connection
		const reader = new WebSocketMessageReader(socket);
		const writer = new WebSocketMessageWriter(socket);
		const connection = createConnection(reader, writer);

		connection.onInitialize((params: InitializeParams): InitializeResult => {
			console.log("onInitialize");
			return {
				capabilities: {
					textDocumentSync: TextDocumentSyncKind.Incremental,
					completionProvider: {
						resolveProvider: true,
						triggerCharacters: ["-", "#", " "],
					},
				},
			};
		});

		// 補完候補の提供
		connection.onCompletion(
			(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
				console.log("onCompletion");
				return [
					{
						label: "# ",
						kind: CompletionItemKind.Snippet,
						detail: "見出し1",
						insertText: "# ",
					},
					{
						label: "## ",
						kind: CompletionItemKind.Snippet,
						detail: "見出し2",
						insertText: "## ",
					},
					{
						label: "### ",
						kind: CompletionItemKind.Snippet,
						detail: "見出し3",
						insertText: "### ",
					},
					{
						label: "- ",
						kind: CompletionItemKind.Snippet,
						detail: "リスト",
						insertText: "- ",
					},
					{
						label: "```",
						kind: CompletionItemKind.Snippet,
						detail: "コードブロック",
						insertText: "```\n\n```",
					},
				];
			},
		);

		// TextDocumentsインスタンスを作成
		const documents = new TextDocuments(TextDocument);
		documents.listen(connection);

		// WebSocket接続を使用してLanguage Serverを開始
		connection.listen();
	});
};
