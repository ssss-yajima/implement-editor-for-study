import { TextDocument } from "vscode-languageserver-textdocument";
import {
  type CompletionItem,
  type InitializeParams,
  type InitializeResult,
  ProposedFeatures,
  TextDocuments,
  createConnection,
} from "vscode-languageserver/node";

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

connection.onInitialize(() => ({
  capabilities: {
    completionProvider: {
      triggerCharacters: ["."],
    },
  },
}));

connection.onCompletion((): CompletionItem[] => {
  return [
    {
      label: "example",
      kind: 1,
      detail: "Basic completion example",
    },
  ];
});

documents.listen(connection);
connection.listen();
