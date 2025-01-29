import type { Services, UserConfig } from 'monaco-editor-wrapper';

export const createUserConfig = (
  workspaceRoot: string,
  content: string,
  modelUri: string
): UserConfig => {
  return {
    wrapperConfig: {
      serviceConfig: {
        userServices: {
          enableLanguageClient: true,
          configureLanguageClient: (services: Services) => {
            const { languageClient } = services;
            if (languageClient) {
              languageClient.start();
            }
          },
        },
        debugLogging: true,
        workspaceConfig: {
          workspaceRoot,
          modelUri,
        },
      },
      editorConfig: {},
    },
    languageClientConfig: {
      options: {
        $type: 'WebSocket',
        host: 'localhost',
        port: 3001,
        path: '/markdown',
      },
    },
  };
};
