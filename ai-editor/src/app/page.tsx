"use client";

import * as monaco from "monaco-editor";
import { useEffect, useRef } from "react";

export default function Home() {
  return <MonacoEditor />;
}

function MonacoEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current && !monacoRef.current) {
      monacoRef.current = monaco.editor.create(editorRef.current, {
        value: "// Your code here",
        language: "typescript",
        theme: "vs-dark",
        fontSize: 14,
        minimap: { enabled: true },
        automaticLayout: true,
      });
    }

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
      }
    };
  }, []);

  return <div ref={editorRef} style={{ width: "100%", height: "100vh" }} />;
}
