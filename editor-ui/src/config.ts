// @ts-expect-error monaco-vscode-apiの型定義が見つからないため
import * as vscode from "@codingame/monaco-vscode-api";
import { LogLevel } from "@codingame/monaco-vscode-api/services";
import getKeybindingsServiceOverride from "@codingame/monaco-vscode-keybindings-service-override";
import type { WrapperConfig } from "monaco-editor-wrapper";
import type { MonacoLanguageClient } from "monaco-languageclient";
import { createUrl } from "monaco-languageclient/tools";
import {
	WebSocketMessageReader,
	WebSocketMessageWriter,
	toSocket,
} from "vscode-ws-jsonrpc";
import { configureMonacoWorkers } from "./utils";

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
		logLevel: LogLevel.Debug,
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
			codeResources: {
				[codeUri]: {
					text: code,
					uri: codeUri,
				},
			},
			monacoWorkerFactory: configureMonacoWorkers,
		},
	};
};
