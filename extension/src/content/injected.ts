// Injected script running in the MAIN world context
// Can directly access window.monaco, window.ace, window.CodeMirror and page globals

declare global {
  interface Window {
    monaco?: any;
    ace?: any;
    CodeMirror?: any;
    __ALGOPULSE_INJECTED__?: boolean;
  }
}

if (!window.__ALGOPULSE_INJECTED__) {
  window.__ALGOPULSE_INJECTED__ = true;

  function getEditorCodeAndLanguage(): { code: string; language: string } | null {
    // 1. Check Monaco Editor (LeetCode, HackerRank, modern platforms)
    try {
      if (window.monaco?.editor?.getModels) {
        const models = window.monaco.editor.getModels();
        if (models && models.length > 0) {
          const solutionModel = models.find((m: any) => {
            const uriStr = m.uri?.toString() || '';
            return !uriStr.includes('testcase') && !uriStr.includes('console');
          }) || models[0];

          if (solutionModel && typeof solutionModel.getValue === 'function') {
            const code = solutionModel.getValue() || '';
            const language = solutionModel.getLanguageId ? solutionModel.getLanguageId() : '';
            if (code.trim().length > 0) {
              return { code, language };
            }
          }
        }
      }
    } catch (err) {
      console.warn('[AlgoPulse] Error reading Monaco editor:', err);
    }

    // 2. Check Ace Editor (GeeksforGeeks practice portal)
    try {
      const aceEl = document.querySelector('.ace_editor') as any;
      if (aceEl && window.ace?.edit) {
        const editor = window.ace.edit(aceEl);
        if (editor && typeof editor.getValue === 'function') {
          const code = editor.getValue() || '';
          const mode = editor.session?.getMode?.()?.$id || '';
          const language = mode.replace(/^ace\/mode\//, '') || '';
          if (code.trim().length > 0) {
            return { code, language };
          }
        }
      }
    } catch (err) {
      console.warn('[AlgoPulse] Error reading Ace editor:', err);
    }

    // 3. Check CodeMirror (HackerRank, GeeksforGeeks classic, etc.)
    try {
      const cmEl = document.querySelector('.CodeMirror') as any;
      if (cmEl && cmEl.CodeMirror && typeof cmEl.CodeMirror.getValue === 'function') {
        const code = cmEl.CodeMirror.getValue() || '';
        const mode = cmEl.CodeMirror.getOption ? cmEl.CodeMirror.getOption('mode') : '';
        const language = typeof mode === 'string' ? mode : mode?.name || '';
        if (code.trim().length > 0) {
          return { code, language };
        }
      }
    } catch (err) {
      console.warn('[AlgoPulse] Error reading CodeMirror editor:', err);
    }

    return null;
  }

  // Listen for requests from the content script (ISOLATED world)
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data || event.data.source !== 'ALGOPULSE_CONTENT') {
      return;
    }

    if (event.data.type === 'GET_EDITOR_CODE') {
      const result = getEditorCodeAndLanguage();
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

  console.log('[AlgoPulse] Multi-platform page bridge injected successfully (Monaco, Ace, CodeMirror).');
}
