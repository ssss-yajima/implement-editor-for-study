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
    console.log("onTextChanged");
    console.log(`Dirty? ${textChanges.isDirty}`);
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
        onLoad={(wrapper: MonacoEditorLanguageClientWrapper) => {
          console.log(`Loaded ${wrapper.reportStatus().join("\n").toString()}`);
        }}
        onError={(e) => {
          console.error(e);
        }}
      />
    </div>
  );
}

export default App;
