"use client";

import { Editor } from "@monaco-editor/react";

export default function CodeEditor() {
  return (
    <Editor
      height="100vh"
      defaultLanguage="typescript"
      defaultValue="// Your code here"
      theme="vs-dark"
      options={{
        minimap: { enabled: true },
        fontSize: 14,
      }}
    />
  );
}
