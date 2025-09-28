import log from "electron-log"
import { dialog } from 'electron';

export async function initErrorHandling() {
  try {
    const unhandled = await import('electron-unhandled');
    const { openNewGitHubIssue } = await import('electron-util');
    const { debugInfo } = await import('electron-util/main');

    unhandled.default({
      logger: log.error,
      showDialog: true,
      reportButton: (error) => {
        const title = `Error: ${error.message.substring(0, 50)}${error.message.length > 50 ? '...' : ''}`;
        openNewGitHubIssue({
          user: 'netmods',
          repo: 'rev',
          title,
          body: `
Your software is trash.

## Error stack
\`\`\`
${error.stack || 'No stack trace available'}
\`\`\`

## Debug info
${debugInfo()}
        `
        });
      }
    });

    process.on('unhandledRejection', (reason) => {
      log.error('Unhandled Rejection:', reason);
    });
  } catch (error) {
    log.error('Failed to initialize error handling:', error);
    dialog.showErrorBox('Error Handler Failure', 'Failed to set up error handling. Please restart the app.');
  }
}

export const showError = (args) => {
  const { error, message } = args
  dialog.showErrorBox(`${error}`, message);
}
