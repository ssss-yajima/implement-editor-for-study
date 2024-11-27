import Editor from "@monaco-editor/react";

function App() {
  return (
    <div className="w-full bg-gray-800 min-h-screen">
      <h1 className="text-white text-2xl p-4">Editor</h1>
      <div className="flex justify-center items-center p-4">
        <Editor
          height="80vh"
          width="80vw"
          defaultLanguage="javascript"
          defaultValue="// your code here"
        />
      </div>
    </div>
  );
}
export default App;
