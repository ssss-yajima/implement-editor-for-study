// @ts-expect-error monaco-vscode-apiの型定義が見つからないため
import * as vscode from "@codingame/monaco-vscode-api";
import getKeybindingsServiceOverride from "@codingame/monaco-vscode-keybindings-service-override";
import type { WrapperConfig } from "monaco-editor-wrapper";
import type { MonacoLanguageClient } from "monaco-languageclient";
import { createUrl } from "monaco-languageclient/tools";
import {
	WebSocketMessageReader,
	WebSocketMessageWriter,
	toSocket,
} from "vscode-ws-jsonrpc";

// monaco-editorのワーカーを設定する関数
const configureMonacoWorkers = (logger: any) => {
	// @ts-expect-error
	self.MonacoEnvironment = {
		getWorker: (moduleId: string, label: string) => {
			logger.info(`Creating worker for ${moduleId}, ${label}`);
			switch (label) {
				case "editorWorkerService":
					return new Worker(
						new URL(
							"monaco-editor/esm/vs/editor/editor.worker",
							import.meta.url,
						),
					);
				case "markdown":
					return new Worker(
						new URL(
							"monaco-editor/esm/vs/basic-languages/markdown/markdown.worker",
							import.meta.url,
						),
					);
				default:
					throw new Error(`Unknown label ${label}`);
			}
		},
	};
};

export const createUserConfig = (
	workspaceRoot: string,
	code: string,
	codeUri: string,
): WrapperConfig => {
	const url = createUrl({
		secured: false,
		host: "localhost",
		port: 3001,
		path: "markdown",
	});
	const webSocket = new WebSocket(url);
	const iWebSocket = toSocket(webSocket);
	const reader = new WebSocketMessageReader(iWebSocket);
	const writer = new WebSocketMessageWriter(iWebSocket);

	return {
		$type: "extended",
		logLevel: 2,
		languageClientConfigs: {
			markdown: {
				name: "Markdown Language Server Example",
				connection: {
					options: {
						$type: "WebSocketDirect",
						webSocket: webSocket,
						startOptions: {
							onCall: (languageClient?: MonacoLanguageClient) => {
								setTimeout(() => {
									// 必要なコマンドを登録
									for (const cmdName of [
										"markdown.preview",
										"markdown.showSource",
									]) {
										vscode.commands.registerCommand(
											cmdName,
											(...args: unknown[]) => {
												languageClient?.sendRequest(
													"workspace/executeCommand",
													{
														command: cmdName,
														arguments: args,
													},
												);
											},
										);
									}
								}, 250);
							},
							reportStatus: true,
						},
					},
					messageTransports: { reader, writer },
				},
				clientOptions: {
					documentSelector: ["markdown"],
					workspaceFolder: {
						index: 0,
						name: "workspace",
						uri: vscode.Uri.parse(workspaceRoot),
					},
				},
			},
		},
		vscodeApiConfig: {
			...getKeybindingsServiceOverride(),
			userConfiguration: {
				json: JSON.stringify({
					"workbench.colorTheme": "Default Dark Modern",
					"editor.guides.bracketPairsHorizontal": "active",
					"editor.wordBasedSuggestions": "off",
					"editor.experimental.asyncTokenization": true,
				}),
			},
		},
		editorAppConfig: {
			[codeUri]: {
				text: code,
				uri: codeUri,
			},
			monacoWorkerFactory: configureMonacoWorkers,
		},
	};
};
