import type { Server } from "node:http";
import type { IncomingMessage } from "node:http";
import express from "express";
import { WebSocketServer } from "ws";

export interface LanguageServerRunConfig {
	serverName: string;
	pathName: string;
	serverPort: number;
	wsServerOptions: {
		noServer: boolean;
		perMessageDeflate: boolean;
		clientTracking: boolean;
		verifyClient?: (
			info: { origin: string; secure: boolean; req: IncomingMessage },
			callback: (result: boolean) => void,
		) => void;
	};
	logMessages?: boolean;
}

/** LSP server runner */
export const runLanguageServer = (
	languageServerRunConfig: LanguageServerRunConfig,
) => {
	process.on("uncaughtException", (err) => {
		console.error("Uncaught Exception: ", err.toString());
		if (err.stack !== undefined) {
			console.error(err.stack);
		}
	});

	// create the express application
	const app = express();

	// start the http server
	const httpServer: Server = app.listen(languageServerRunConfig.serverPort);
	const wss = new WebSocketServer(languageServerRunConfig.wsServerOptions);

	// WebSocketサーバーをHTTPサーバーにアップグレード
	httpServer.on("upgrade", (request, socket, head) => {
		const pathname = new URL(request.url || "", "http://localhost").pathname;

		if (pathname === languageServerRunConfig.pathName) {
			wss.handleUpgrade(request, socket, head, (webSocket) => {
				if (languageServerRunConfig.logMessages) {
					console.log(
						`${languageServerRunConfig.serverName} WebSocket connection established`,
					);
				}
				wss.emit("connection", webSocket, request);
			});
		}
	});
};
