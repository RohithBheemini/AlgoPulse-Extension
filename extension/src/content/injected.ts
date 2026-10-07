// Injected script running in the MAIN world context of LeetCode
// Can directly access window.monaco and page globals

declare global {
  interface Window {
    monaco?: {
      editor?: {
        getModels?: () => Array<{
          getValue: () => string;
          getLanguageId?: () => string;
          uri?: { path?: string; toString?: () => string };
        }>;
      };
    };
    __ALGOPULSE_INJECTED__?: boolean;
  }
}

if (!window.__ALGOPULSE_INJECTED__) {
  window.__ALGOPULSE_INJECTED__ = true;

  function getMonacoCodeAndLanguage(): { code: string; language: string } | null {
    try {
      if (!window.monaco?.editor?.getModels) {
        return null;
      }
      const models = window.monaco.editor.getModels();
      if (!models || models.length === 0) {
        return null;
      }

      // Filter out testcase or internal models if any
      const solutionModel = models.find(m => {
        const uriStr = m.uri?.toString() || '';
        return !uriStr.includes('testcase') && !uriStr.includes('console');
      }) || models[0];

      return {
        code: solutionModel.getValue() || '',
        language: solutionModel.getLanguageId ? solutionModel.getLanguageId() : ''
      };
    } catch (err) {
      console.warn('[AlgoPulse] Error reading Monaco editor:', err);
      return null;
    }
  }

  // Listen for requests from the content script (ISOLATED world)
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data || event.data.source !== 'ALGOPULSE_CONTENT') {
      return;
    }

    if (event.data.type === 'GET_EDITOR_CODE') {
      const result = getMonacoCodeAndLanguage();
      window.postMessage(
        {
          source: 'ALGOPULSE_PAGE',
          type: 'EDITOR_CODE_RESPONSE',
          requestId: event.data.requestId,
          payload: result
        },
        '*'
      );
    }
  });

  console.log('[AlgoPulse] Page bridge injected successfully.');
}
