# implement-editor-for-study

## prompt

monaco-editorを利用したエディタ内包アプリと、それと対応する独自の言語サーバーを作ります。
WebアプリはReact+Vite, Linter/Formatterはbiome.jsを利用します。
言語サーバーはexampleにならって express.js + WebSocketを利用します。こちらもbiome.jsを利用します。
ルートディレクトリを起点として、pnpmを利用したモノレポ構成にします。

エディタではMarkdownをサポートします。
また言語サーバーとの通信はWebSocketを利用し、monaco-languageclientを利用します。

言語サーバーもmonaco-languageclientから利用されることを前提とします。

monaco-languageclientの公式exampleで React製app + WebScoket利用言語サーバーのコードがあるので、参考にしてください。
@

## フォルダ構造

```
.
├── editor-ui         // React+Vite製エディタアプリ
├── language-server   // express.js + WebSocket製言語サーバー
├── monaco-examples   // monaco-languageclientの公式exampleのコピー
```
