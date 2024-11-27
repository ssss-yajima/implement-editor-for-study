import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";

function App() {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [editorValue, setEditorValue] = useState("// Start coding here");

  useEffect(() => {
    if (editorRef.current && !monacoRef.current) {
      monacoRef.current = monaco.editor.create(editorRef.current, {
        value: editorValue,
        language: "typescript",
        theme: "vs-dark",
        fontSize: 14,
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        lineNumbers: "on",
      });
      monacoRef.current.onDidChangeModelContent(() => {
        setEditorValue(monacoRef.current?.getValue() ?? "");
      });
    }

    return () => {
      monacoRef.current?.dispose();
    };
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <h1>Editor</h1>
      <div
        style={{
          height: "calc(100vh - 50px)",
          width: "100%",
          position: "relative",
        }}
      >
        <div
          ref={editorRef}
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            border: "1px solid #ccc",
          }}
        />
      </div>
    </div>
  );
}

export default App;
