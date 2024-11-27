// App.jsx
import Editor from "@monaco-editor/react";

function App() {
  return (
    <div>
      <h1>Editor</h1>
      <div className="flex justify-center items-center">
        <Editor
          height="90vh"
          width="90vw"
          defaultLanguage="javascript"
          defaultValue="// your code here"
        />
      </div>
    </div>
  );
}
export default App;
