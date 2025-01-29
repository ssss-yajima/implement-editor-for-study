import {
  RegisteredFileSystemProvider,
  RegisteredMemoryFile,
  registerFileSystemOverlay,
} from "@codingame/monaco-vscode-files-service-override";
import { MonacoEditorReactComp } from "@typefox/monaco-editor-react";
import type {
  MonacoEditorLanguageClientWrapper,
  TextChanges,
} from "monaco-editor-wrapper";
import { useCallback } from "react";
import { URI } from "vscode-uri";
import { createUserConfig } from "./config";

const sampleMarkdown = `# サンプルマークダウン

これはサンプルのマークダウンファイルです。

## 機能
- マークダウンのシンタックスハイライト
- 言語サーバーによる補完
- WebSocketによるリアルタイム通信
`;

function App() {
  const markdownUri = URI.file("/workspace/sample.md");
  const fileSystemProvider = new RegisteredFileSystemProvider(false);
  fileSystemProvider.registerFile(
    new RegisteredMemoryFile(markdownUri, sampleMarkdown)
  );
  registerFileSystemOverlay(1, fileSystemProvider);

  const onTextChanged = (textChanges: TextChanges) => {
    console.log("onTextChanged called");
    console.log("Changes:", textChanges);
  };

  const onLoad = (wrapper: MonacoEditorLanguageClientWrapper) => {
    console.log(`Loaded ${wrapper.reportStatus().join("\n").toString()}`);
    const editor = wrapper.getEditor();
    if (editor) {
      editor.onDidChangeModelContent((e) => {
        console.log("Model content changed", e);
      });
    }
  };

  const wrapperConfig = createUserConfig(
    "/workspace",
    sampleMarkdown,
    "/workspace/sample.md"
  );

  return (
    <div style={{ height: "100vh", padding: "20px" }}>
      <MonacoEditorReactComp
        wrapperConfig={wrapperConfig}
        style={{ height: "100%" }}
        onTextChanged={onTextChanged}
        onLoad={onLoad}
        onError={(e) => {
          console.error(e);
        }}
      />
    </div>
  );
}

export default App;
