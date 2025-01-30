import { runMarkdownServer } from './main.js';

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
});

process.on(
  'unhandledRejection',
  (reason: unknown, promise: Promise<unknown>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  }
);

runMarkdownServer();
