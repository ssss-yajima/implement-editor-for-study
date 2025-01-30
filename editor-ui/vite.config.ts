import vsixPlugin from "@codingame/monaco-vscode-rollup-vsix-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), vsixPlugin()],
	build: {
		target: "ES2022",
	},
	worker: {
		format: "es",
	},
});
