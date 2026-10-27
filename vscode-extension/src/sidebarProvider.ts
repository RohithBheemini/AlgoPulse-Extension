import * as vscode from 'vscode';
import { ProblemMetadata, AIAnalysisResult, ExtensionConfig, SyncSubmissionPayload, AIProvider } from './types';
import { analyzeCodeWithMultiProvider, sanitizeApiKey, testProviderKey } from './analyzer';
import { syncSubmissionToDashboard } from './sync';

export class AlgoPulseSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'algopulse.sidebarView';
  private _view?: vscode.WebviewView;
  private _currentAnalysisState: 'idle' | 'analyzing' | 'done' = 'idle';
  private _lastAnalysisData?: { metadata: ProblemMetadata; result: AIAnalysisResult; syncResult: any };

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'ANALYZE_REQUEST': {
          await vscode.commands.executeCommand('algopulse.analyzeCode');
          break;
        }
        case 'OPEN_DASHBOARD': {
          const config = vscode.workspace.getConfiguration('algopulse');
          const url = config.get<string>('dashboardUrl') || 'http://localhost:3000';
          vscode.env.openExternal(vscode.Uri.parse(url));
          break;
        }
        case 'INSERT_CODE': {
          const editor = vscode.window.activeTextEditor;
          if (editor && data.code) {
            await editor.edit((editBuilder) => {
              const selection = editor.selection;
              if (!selection.isEmpty) {
                editBuilder.replace(selection, data.code);
              } else {
                const fullRange = new vscode.Range(
                  editor.document.positionAt(0),
                  editor.document.positionAt(editor.document.getText().length)
                );
                editBuilder.replace(fullRange, data.code);
              }
            });
            vscode.window.showInformationMessage('AlgoPulse: Optimal solution inserted into editor!');
          }
          break;
        }
        case 'COPY_CODE': {
          if (data.code) {
            await vscode.env.clipboard.writeText(data.code);
            vscode.window.showInformationMessage('Optimal code copied to clipboard!');
          }
          break;
        }
        case 'SAVE_SETTINGS': {
          const config = vscode.workspace.getConfiguration('algopulse');
          if (data.settings.activeProvider !== undefined) {
            await config.update('activeProvider', data.settings.activeProvider || 'auto', vscode.ConfigurationTarget.Global);
          }
          if (data.settings.geminiApiKey !== undefined) {
            const clean = sanitizeApiKey(data.settings.geminiApiKey);
            await config.update('geminiApiKey', clean, vscode.ConfigurationTarget.Global);
          }
          if (data.settings.openaiApiKey !== undefined) {
            const clean = sanitizeApiKey(data.settings.openaiApiKey);
            await config.update('openaiApiKey', clean, vscode.ConfigurationTarget.Global);
          }
          if (data.settings.anthropicApiKey !== undefined) {
            const clean = sanitizeApiKey(data.settings.anthropicApiKey);
            await config.update('anthropicApiKey', clean, vscode.ConfigurationTarget.Global);
          }
          if (data.settings.dashboardUrl !== undefined) {
            await config.update('dashboardUrl', data.settings.dashboardUrl ? data.settings.dashboardUrl.trim() : 'http://localhost:3000', vscode.ConfigurationTarget.Global);
          }
          if (data.settings.extensionToken !== undefined) {
            await config.update('extensionToken', data.settings.extensionToken ? data.settings.extensionToken.trim() : '', vscode.ConfigurationTarget.Global);
          }
          if (data.settings.preferredModel !== undefined) {
            await config.update('preferredModel', data.settings.preferredModel ? data.settings.preferredModel.trim() : 'auto', vscode.ConfigurationTarget.Global);
          }
          vscode.window.showInformationMessage('AlgoPulse settings saved successfully!');
          this.postMessage({ type: 'SETTINGS_SAVED' });
          break;
        }
        case 'TEST_PROVIDER_KEY': {
          const provider = data.provider || 'gemini';
          const cleanKey = sanitizeApiKey(data.apiKey);
          const result = await testProviderKey(provider, cleanKey);
          this.postMessage({
            type: 'TEST_PROVIDER_RESULT',
            provider,
            result
          });
          break;
        }
        case 'GET_INITIAL_DATA': {
          const config = vscode.workspace.getConfiguration('algopulse');
          this.postMessage({
            type: 'INIT_CONFIG',
            config: {
              activeProvider: config.get<string>('activeProvider') || 'auto',
              geminiApiKey: config.get<string>('geminiApiKey') || '',
              openaiApiKey: config.get<string>('openaiApiKey') || '',
              anthropicApiKey: config.get<string>('anthropicApiKey') || '',
              dashboardUrl: config.get<string>('dashboardUrl') || 'http://localhost:3000',
              extensionToken: config.get<string>('extensionToken') || '',
              autoSync: config.get<boolean>('autoSync') !== false,
              preferredModel: config.get<string>('preferredModel') || 'auto'
            }
          });
          if (this._currentAnalysisState === 'analyzing') {
            this.postMessage({ type: 'ANALYSIS_STARTED' });
          } else if (this._currentAnalysisState === 'done' && this._lastAnalysisData) {
            this.postMessage({
              type: 'ANALYSIS_SUCCESS',
              ...this._lastAnalysisData
            });
          }
          break;
        }
      }
    });
  }

  public postMessage(message: any) {
    if (this._view) {
      this._view.webview.postMessage(message);
    }
  }

  public async runAnalysisForEditor(editor: vscode.TextEditor): Promise<void> {
    if (!this._view) {
      await vscode.commands.executeCommand('algopulse.sidebarView.focus');
      let attempts = 0;
      while (!this._view && attempts < 30) {
        await new Promise((r) => setTimeout(r, 50));
        attempts++;
      }
    } else {
      this._view.show?.(true);
    }

    const document = editor.document;
    const selection = editor.selection;
    const selectedText = !selection.isEmpty ? document.getText(selection) : document.getText();

    if (!selectedText || selectedText.trim().length === 0) {
      vscode.window.showWarningMessage('AlgoPulse: Please open a code file with content to analyze.');
      return;
    }

    // Infer problem title & language
    const filename = document.fileName.split(/[\\/]/).pop() || 'Solution';
    const cleanTitle = filename
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-]/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Algorithm Problem';

    const language = document.languageId || 'python3';

    const metadata: ProblemMetadata = {
      title: cleanTitle,
      slug: cleanTitle.toLowerCase().replace(/\s+/g, '-'),
      difficulty: 'Medium',
      language,
      code: selectedText,
      platform: 'vscode',
      filePath: document.fileName
    };

    const config = vscode.workspace.getConfiguration('algopulse');
    const activeProvider = config.get<AIProvider>('activeProvider') || 'auto';
    const geminiApiKey = sanitizeApiKey(config.get<string>('geminiApiKey') || '');
    const openaiApiKey = sanitizeApiKey(config.get<string>('openaiApiKey') || '');
    const anthropicApiKey = sanitizeApiKey(config.get<string>('anthropicApiKey') || '');
    const dashboardUrl = config.get<string>('dashboardUrl') || 'http://localhost:3000';
    const extensionToken = config.get<string>('extensionToken') || '';
    const autoSync = config.get<boolean>('autoSync') !== false;
    const preferredModel = config.get<string>('preferredModel') || 'auto';

    const extConfig: ExtensionConfig = {
      activeProvider,
      geminiApiKey,
      openaiApiKey,
      anthropicApiKey,
      dashboardUrl,
      extensionToken,
      autoSync,
      preferredModel
    };

    if (!geminiApiKey && !openaiApiKey && !anthropicApiKey) {
      this.postMessage({
        type: 'PROMPT_API_KEY',
        message: 'Please configure at least one API key (Gemini, OpenAI, or Claude) in settings to begin.'
      });
      const inputKey = await vscode.window.showInputBox({
        title: 'AlgoPulse: AI API Key Required',
        prompt: 'Enter your Google Gemini, OpenAI, or Anthropic API Key',
        placeHolder: 'AIzaSy... / sk-... / sk-ant-...',
        password: true,
        ignoreFocusOut: true
      });
      if (inputKey && inputKey.trim()) {
        const trimmed = sanitizeApiKey(inputKey);
        if (trimmed.startsWith('sk-ant-')) {
          await config.update('anthropicApiKey', trimmed, vscode.ConfigurationTarget.Global);
          extConfig.anthropicApiKey = trimmed;
        } else if (trimmed.startsWith('sk-')) {
          await config.update('openaiApiKey', trimmed, vscode.ConfigurationTarget.Global);
          extConfig.openaiApiKey = trimmed;
        } else {
          await config.update('geminiApiKey', trimmed, vscode.ConfigurationTarget.Global);
          extConfig.geminiApiKey = trimmed;
        }
        return this.runAnalysisForEditor(editor);
      } else {
        return;
      }
    }

    this._currentAnalysisState = 'analyzing';
    this.postMessage({
      type: 'ANALYSIS_STARTED',
      metadata
    });

    try {
      const result: AIAnalysisResult = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `AlgoPulse: Analyzing ${metadata.title}...`,
          cancellable: false
        },
        async () => {
          return await analyzeCodeWithMultiProvider(metadata, extConfig);
        }
      );

      let syncResult = { synced: false, message: 'Auto-sync disabled' };
      if (autoSync && dashboardUrl) {
        const payload: SyncSubmissionPayload = {
          problem_title: metadata.title,
          problem_slug: metadata.slug,
          platform: 'vscode',
          difficulty: result.assessed_difficulty || metadata.difficulty || 'Medium',
          language: metadata.language,
          user_code: metadata.code,
          overall_score: result.score,
          optimality_score: result.scoring_breakdown.optimality,
          time_score: result.scoring_breakdown.time_complexity,
          space_score: result.scoring_breakdown.space_complexity,
          cleanliness_score: result.scoring_breakdown.cleanliness,
          user_time_complexity: `${result.user_approach.name} (${result.user_approach.time_complexity})`,
          user_space_complexity: result.user_approach.space_complexity,
          optimal_time_complexity: `${result.best_approach.name} (${result.best_approach.time_complexity})`,
          optimal_space_complexity: result.best_approach.space_complexity,
          why_suboptimal: result.why_suboptimal || result.user_approach.summary,
          why_ideal: result.why_ideal || result.best_approach.explanation,
          summary_feedback: result.best_approach.explanation,
          improvements: result.improvements || [],
          optimal_code: result.optimal_code,
          paradigm: result.user_approach?.paradigm || result.best_approach?.paradigm || undefined
        };

        const syncResp = await syncSubmissionToDashboard(payload, dashboardUrl, extensionToken);
        syncResult = { synced: syncResp.success, message: syncResp.message };
      }

      this._currentAnalysisState = 'done';
      this._lastAnalysisData = { metadata, result, syncResult };
      this.postMessage({
        type: 'ANALYSIS_SUCCESS',
        metadata,
        result,
        syncResult
      });

      vscode.window.showInformationMessage(
        `AlgoPulse: Score ${result.score}/100 for ${metadata.title}!${syncResult.synced ? ' Synced to dashboard.' : ''}`
      );
    } catch (err: any) {
      this._currentAnalysisState = 'idle';
      this.postMessage({
        type: 'ANALYSIS_ERROR',
        error: err.message || 'Analysis failed'
      });
      vscode.window.showErrorMessage(`AlgoPulse: ${err.message || 'Analysis failed'}`);
    }
  }

  private _getHtmlForWebview(_webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AlgoPulse Reviewer</title>
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --card-border: #30363d;
      --text: #f0f6fc;
      --text-muted: #8b949e;
      --blue: #4285F4;
      --green: #34A853;
      --yellow: #FBBC05;
      --red: #EA4335;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
      font-size: 12px;
      line-height: 1.4;
      padding: 12px;
    }
    .google-bar {
      height: 2px;
      width: 100%;
      background: linear-gradient(90deg, #4285F4 0%, #EA4335 33%, #FBBC05 66%, #34A853 100%);
      margin-bottom: 12px;
      border-radius: 1px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      font-size: 13px;
      color: var(--text);
    }
    .brand-badge {
      background: rgba(66, 133, 244, 0.15);
      color: var(--blue);
      border: 1px solid rgba(66, 133, 244, 0.3);
      padding: 1px 6px;
      border-radius: 10px;
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .btn {
      background: var(--blue);
      color: #fff;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 11px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
    .btn-secondary {
      background: var(--card-bg);
      color: var(--text);
      border: 1px solid var(--card-border);
    }
    .btn-secondary:hover { background: #21262d; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 10px;
    }
    .card-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .score-hero {
      text-align: center;
      padding: 14px 10px;
    }
    .score-num {
      font-size: 36px;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 4px;
    }
    .score-optimal { color: var(--green); }
    .score-medium { color: var(--yellow); }
    .score-suboptimal { color: var(--red); }
    .progress-bar-bg {
      background: #21262d;
      height: 5px;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 3px;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.5s ease;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: var(--text-muted);
      margin-top: 5px;
    }
    .pill {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }
    .pill-green { background: rgba(52, 168, 83, 0.15); color: var(--green); border: 1px solid rgba(52, 168, 83, 0.3); }
    .pill-yellow { background: rgba(251, 188, 5, 0.15); color: var(--yellow); border: 1px solid rgba(251, 188, 5, 0.3); }
    .pill-blue { background: rgba(66, 133, 244, 0.15); color: var(--blue); border: 1px solid rgba(66, 133, 244, 0.3); }
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 6px;
    }
    .comp-box {
      background: #0d1117;
      border: 1px solid var(--card-border);
      padding: 6px;
      border-radius: 6px;
      font-size: 10px;
    }
    .comp-label { color: var(--text-muted); font-size: 9px; text-transform: uppercase; margin-bottom: 2px; }
    .comp-val { font-family: monospace; font-weight: 600; color: var(--text); }
    .hint-item {
      background: #0d1117;
      border: 1px solid var(--card-border);
      border-radius: 6px;
      padding: 8px;
      margin-top: 6px;
    }
    .hint-btn {
      background: transparent;
      border: 1px dashed var(--blue);
      color: var(--blue);
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 10px;
      font-weight: 600;
      width: 100%;
      margin-top: 4px;
    }
    .hint-btn:hover { background: rgba(66, 133, 244, 0.1); }
    .hint-content { font-size: 11px; color: var(--text); margin-top: 4px; display: none; }
    .code-block {
      background: #0d1117;
      border: 1px solid var(--card-border);
      padding: 8px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 10px;
      max-height: 180px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
      margin-top: 6px;
    }
    .drawer {
      display: none;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 10px;
    }
    .input-group {
      margin-bottom: 8px;
    }
    .input-label {
      display: block;
      font-size: 10px;
      color: var(--text-muted);
      margin-bottom: 3px;
      font-weight: 600;
    }
    .input-field {
      width: 100%;
      background: #0d1117;
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 11px;
    }
    .input-field:focus { outline: 1px solid var(--blue); border-color: var(--blue); }
    .sync-status {
      font-size: 10px;
      color: var(--green);
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 6px;
    }
    .spinner {
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top: 2px solid var(--blue);
      border-radius: 50%;
      width: 16px;
      height: 16px;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="google-bar"></div>

  <div class="header">
    <div class="brand">
      <span>AlgoPulse</span>
      <span class="brand-badge">Multi-AI</span>
    </div>
    <div style="display: flex; gap: 4px;">
      <button id="toggleSettingsBtn" class="btn btn-secondary" style="padding: 4px 8px; font-size: 10px; width: auto;">⚙ Settings</button>
      <button id="openDashboardBtn" class="btn btn-secondary" style="padding: 4px 8px; font-size: 10px; width: auto;">📊 Dashboard</button>
    </div>
  </div>

  <!-- Settings Drawer -->
  <div id="settingsDrawer" class="drawer">
    <div class="card-title">
      <span>Settings & Multi-AI Hub</span>
      <span style="font-size: 9px; color: var(--green);">Gemini • OpenAI • Claude</span>
    </div>
    <div class="input-group">
      <label class="input-label">Active Provider</label>
      <select id="providerSelect" class="input-field" style="background: var(--bg); color: var(--text);">
        <option value="auto">⚡ Auto (Smart Failover)</option>
        <option value="gemini">Google Gemini</option>
        <option value="openai">OpenAI</option>
        <option value="claude">Anthropic Claude</option>
      </select>
    </div>
    <div class="input-group">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
        <label class="input-label" style="margin-bottom: 0;">Google Gemini API Key</label>
        <button id="testGeminiBtn" type="button" style="background: none; border: none; color: var(--blue); font-size: 10px; cursor: pointer; text-decoration: underline; padding: 0;">Test Key</button>
      </div>
      <input type="password" id="apiKeyInput" class="input-field" placeholder="AIzaSy... (Free tier)" />
      <div id="geminiTestStatus" style="font-size: 10px; margin-top: 3px; display: none;"></div>
    </div>
    <div class="input-group">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
        <label class="input-label" style="margin-bottom: 0;">OpenAI API Key</label>
        <button id="testOpenAiBtn" type="button" style="background: none; border: none; color: var(--blue); font-size: 10px; cursor: pointer; text-decoration: underline; padding: 0;">Test Key</button>
      </div>
      <input type="password" id="openaiApiKeyInput" class="input-field" placeholder="sk-... (gpt-4o-mini)" />
      <div id="openaiTestStatus" style="font-size: 10px; margin-top: 3px; display: none;"></div>
    </div>
    <div class="input-group">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
        <label class="input-label" style="margin-bottom: 0;">Anthropic Claude API Key</label>
        <button id="testClaudeBtn" type="button" style="background: none; border: none; color: var(--blue); font-size: 10px; cursor: pointer; text-decoration: underline; padding: 0;">Test Key</button>
      </div>
      <input type="password" id="claudeApiKeyInput" class="input-field" placeholder="sk-ant-... (3.5 Haiku)" />
      <div id="claudeTestStatus" style="font-size: 10px; margin-top: 3px; display: none;"></div>
    </div>
    <div class="input-group">
      <label class="input-label">Model Override (Default: auto)</label>
      <input type="text" id="modelInput" class="input-field" placeholder="auto (or gpt-4o, claude-3-5-sonnet, gemini-2.0-flash)" />
    </div>
    <div class="input-group">
      <label class="input-label">Dashboard URL</label>
      <input type="text" id="dashboardUrlInput" class="input-field" placeholder="http://localhost:3000" />
    </div>
    <div class="input-group">
      <label class="input-label">Extension Token (from Profile)</label>
      <input type="password" id="tokenInput" class="input-field" placeholder="ap_sec_..." />
    </div>
    <button id="saveSettingsBtn" class="btn" style="margin-top: 4px;">Save Configuration</button>
  </div>

  <!-- Primary Analyze CTA -->
  <div style="margin-bottom: 12px;">
    <button id="analyzeBtn" class="btn">
      <span id="btnIcon">⚡</span>
      <span id="btnText">Analyze Active Code File</span>
    </button>
  </div>

  <!-- Initial Blank State -->
  <div id="emptyState" class="card" style="text-align: center; padding: 20px 10px; color: var(--text-muted);">
    <div style="font-size: 24px; margin-bottom: 6px;">💡</div>
    <div style="font-weight: 600; color: var(--text); margin-bottom: 4px;">Ready to Review</div>
    <p style="font-size: 11px;">Open any Python, C++, Java, or JS/TS file and click <strong>Analyze Active Code File</strong> or press <code>Ctrl+Alt+A</code>.</p>
  </div>

  <!-- Loading State -->
  <div id="loadingState" class="card" style="display: none; text-align: center; padding: 24px 10px;">
    <div class="spinner" style="margin-bottom: 8px;"></div>
    <div style="font-weight: 600; color: var(--text);">Evaluating Algorithmic Approach...</div>
    <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Comparing with optimal Big-O & paradigm</div>
  </div>

  <!-- Results View -->
  <div id="resultsView" style="display: none;">
    <!-- Score Hero -->
    <div class="card score-hero">
      <div id="scoreNumber" class="score-num score-optimal">--</div>
      <div style="font-size: 11px; font-weight: 600; color: var(--text-muted);">OVERALL SCORE / 100</div>
      <div id="approachBadge" style="margin-top: 6px;">
        <span class="pill pill-green">Optimal Paradigm</span>
      </div>
      <div id="syncStatusBox" class="sync-status" style="justify-content: center; display: none;">
        <span>✓</span> <span id="syncStatusText">Synced to Dashboard Heatmap</span>
      </div>
    </div>

    <!-- 4-Pillar Rubric Breakdown -->
    <div class="card">
      <div class="card-title">
        <span>4-Pillar Rubric Breakdown</span>
      </div>

      <div style="margin-bottom: 8px;">
        <div class="metric-row">
          <span>Algorithmic Optimality</span>
          <span id="optScoreText">-- / 35</span>
        </div>
        <div class="progress-bar-bg">
          <div id="optBar" class="progress-bar-fill" style="width: 0%; background: var(--blue);"></div>
        </div>
      </div>

      <div style="margin-bottom: 8px;">
        <div class="metric-row">
          <span>Time Complexity (Big-O)</span>
          <span id="timeScoreText">-- / 25</span>
        </div>
        <div class="progress-bar-bg">
          <div id="timeBar" class="progress-bar-fill" style="width: 0%; background: var(--green);"></div>
        </div>
      </div>

      <div style="margin-bottom: 8px;">
        <div class="metric-row">
          <span>Space Complexity</span>
          <span id="spaceScoreText">-- / 20</span>
        </div>
        <div class="progress-bar-bg">
          <div id="spaceBar" class="progress-bar-fill" style="width: 0%; background: var(--yellow);"></div>
        </div>
      </div>

      <div>
        <div class="metric-row">
          <span>Code Cleanliness & Style</span>
          <span id="cleanScoreText">-- / 20</span>
        </div>
        <div class="progress-bar-bg">
          <div id="cleanBar" class="progress-bar-fill" style="width: 0%; background: var(--red);"></div>
        </div>
      </div>
    </div>

    <!-- Approach Comparison -->
    <div class="card">
      <div class="card-title">
        <span>Approach Comparison</span>
      </div>
      <div class="comparison-grid">
        <div class="comp-box">
          <div class="comp-label">Your Approach</div>
          <div id="userApproachName" class="comp-val">--</div>
          <div id="userTimeBigO" style="color: var(--text-muted); font-size: 9px; margin-top: 2px;">--</div>
        </div>
        <div class="comp-box">
          <div class="comp-label">Optimal Approach</div>
          <div id="optimalApproachName" class="comp-val" style="color: var(--blue);">--</div>
          <div id="optimalTimeBigO" style="color: var(--text-muted); font-size: 9px; margin-top: 2px;">--</div>
        </div>
      </div>
      <div id="approachSummaryText" style="font-size: 11px; color: var(--text-muted); margin-top: 8px; line-height: 1.4;"></div>
    </div>

    <!-- Progressive Hints -->
    <div class="card">
      <div class="card-title">
        <span>Progressive Hints</span>
        <span style="font-size: 9px; color: var(--yellow);">3 Tiers</span>
      </div>

      <div class="hint-item">
        <div style="font-weight: 600; font-size: 10px; color: var(--text);">Tier 1: Subtle Invariant / Nudge</div>
        <button id="revealHint1Btn" class="hint-btn">Reveal Observation</button>
        <div id="hint1Content" class="hint-content"></div>
      </div>

      <div class="hint-item">
        <div style="font-weight: 600; font-size: 10px; color: var(--text);">Tier 2: Pattern & Data Structure</div>
        <button id="revealHint2Btn" class="hint-btn">Reveal Pattern Hint</button>
        <div id="hint2Content" class="hint-content"></div>
      </div>

      <div class="hint-item">
        <div style="font-weight: 600; font-size: 10px; color: var(--text);">Tier 3: Concrete Strategy</div>
        <button id="revealHint3Btn" class="hint-btn">Reveal Strategy</button>
        <div id="hint3Content" class="hint-content"></div>
      </div>
    </div>

    <!-- Optimal Code Reference -->
    <div class="card">
      <div class="card-title">
        <span>Optimal Reference Code</span>
      </div>
      <div id="optimalCodeBlock" class="code-block"></div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px;">
        <button id="insertCodeBtn" class="btn btn-secondary" style="font-size: 10px; padding: 6px;">📥 Insert in Editor</button>
        <button id="copyCodeBtn" class="btn btn-secondary" style="font-size: 10px; padding: 6px;">📋 Copy Code</button>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    let currentOptimalCode = '';

    // Element references
    const analyzeBtn = document.getElementById('analyzeBtn');
    const openDashboardBtn = document.getElementById('openDashboardBtn');
    const toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
    const settingsDrawer = document.getElementById('settingsDrawer');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');
    const resultsView = document.getElementById('resultsView');

    // Ask for initial config
    vscode.postMessage({ type: 'GET_INITIAL_DATA' });

    analyzeBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'ANALYZE_REQUEST' });
    });

    openDashboardBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'OPEN_DASHBOARD' });
    });

    toggleSettingsBtn.addEventListener('click', () => {
      settingsDrawer.style.display = settingsDrawer.style.display === 'block' ? 'none' : 'block';
    });

    saveSettingsBtn.addEventListener('click', () => {
      const activeProvider = document.getElementById('providerSelect').value;
      const geminiApiKey = document.getElementById('apiKeyInput').value;
      const openaiApiKey = document.getElementById('openaiApiKeyInput').value;
      const anthropicApiKey = document.getElementById('claudeApiKeyInput').value;
      const dashboardUrl = document.getElementById('dashboardUrlInput').value;
      const extensionToken = document.getElementById('tokenInput').value;
      const preferredModel = document.getElementById('modelInput').value || 'auto';
      vscode.postMessage({
        type: 'SAVE_SETTINGS',
        settings: { activeProvider, geminiApiKey, openaiApiKey, anthropicApiKey, dashboardUrl, extensionToken, preferredModel }
      });
      settingsDrawer.style.display = 'none';
    });

    document.getElementById('insertCodeBtn').addEventListener('click', () => {
      vscode.postMessage({ type: 'INSERT_CODE', code: currentOptimalCode });
    });

    document.getElementById('copyCodeBtn').addEventListener('click', () => {
      vscode.postMessage({ type: 'COPY_CODE', code: currentOptimalCode });
    });

    // Hint toggle logic
    function setupHint(btnId, contentId) {
      const btn = document.getElementById(btnId);
      const content = document.getElementById(contentId);
      btn.addEventListener('click', () => {
        content.style.display = 'block';
        btn.style.display = 'none';
      });
    }
    setupHint('revealHint1Btn', 'hint1Content');
    setupHint('revealHint2Btn', 'hint2Content');
    setupHint('revealHint3Btn', 'hint3Content');

    function bindTestKey(btnId, inputId, statusId, provider) {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const apiKey = document.getElementById(inputId).value;
        const statusEl = document.getElementById(statusId);
        if (!apiKey || !apiKey.trim()) {
          statusEl.style.display = 'block';
          statusEl.style.color = 'var(--yellow)';
          statusEl.textContent = 'Please enter an API key first.';
          return;
        }
        statusEl.style.display = 'block';
        statusEl.style.color = 'var(--text-muted)';
        statusEl.textContent = 'Pinging ' + provider + '...';
        vscode.postMessage({ type: 'TEST_PROVIDER_KEY', provider, apiKey });
      });
    }
    bindTestKey('testGeminiBtn', 'apiKeyInput', 'geminiTestStatus', 'gemini');
    bindTestKey('testOpenAiBtn', 'openaiApiKeyInput', 'openaiTestStatus', 'openai');
    bindTestKey('testClaudeBtn', 'claudeApiKeyInput', 'claudeTestStatus', 'claude');

    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.type) {
        case 'TEST_PROVIDER_RESULT': {
          const statusId = message.provider === 'gemini' ? 'geminiTestStatus' : (message.provider === 'openai' ? 'openaiTestStatus' : 'claudeTestStatus');
          const statusEl = document.getElementById(statusId);
          if (statusEl) {
            statusEl.style.display = 'block';
            statusEl.style.color = message.result.success ? 'var(--green)' : 'var(--red)';
            statusEl.textContent = (message.result.success ? '✓ ' : '✕ ') + message.result.message;
          }
          break;
        }
        case 'INIT_CONFIG': {
          if (message.config) {
            if (message.config.activeProvider) {
              document.getElementById('providerSelect').value = message.config.activeProvider;
            }
            document.getElementById('apiKeyInput').value = message.config.geminiApiKey || '';
            document.getElementById('openaiApiKeyInput').value = message.config.openaiApiKey || '';
            document.getElementById('claudeApiKeyInput').value = message.config.anthropicApiKey || '';
            document.getElementById('dashboardUrlInput').value = message.config.dashboardUrl || 'http://localhost:3000';
            document.getElementById('tokenInput').value = message.config.extensionToken || '';
            document.getElementById('modelInput').value = message.config.preferredModel || 'auto';
          }
          break;
        }
        case 'ANALYSIS_STARTED': {
          emptyState.style.display = 'none';
          resultsView.style.display = 'none';
          loadingState.style.display = 'block';
          analyzeBtn.disabled = true;
          document.getElementById('btnText').textContent = 'Analyzing...';
          break;
        }
        case 'ANALYSIS_SUCCESS': {
          loadingState.style.display = 'none';
          resultsView.style.display = 'block';
          analyzeBtn.disabled = false;
          document.getElementById('btnText').textContent = 'Re-Analyze Active Code';

          const res = message.result;
          const score = res.score;
          const scoreEl = document.getElementById('scoreNumber');
          scoreEl.textContent = score;
          scoreEl.className = 'score-num ' + (score >= 80 ? 'score-optimal' : (score >= 50 ? 'score-medium' : 'score-suboptimal'));

          // Pillar scores
          const bd = res.scoring_breakdown;
          document.getElementById('optScoreText').textContent = (bd.optimality || 0) + ' / 35';
          document.getElementById('optBar').style.width = Math.min(100, Math.round(((bd.optimality || 0) / 35) * 100)) + '%';

          document.getElementById('timeScoreText').textContent = (bd.time_complexity || 0) + ' / 25';
          document.getElementById('timeBar').style.width = Math.min(100, Math.round(((bd.time_complexity || 0) / 25) * 100)) + '%';

          document.getElementById('spaceScoreText').textContent = (bd.space_complexity || 0) + ' / 20';
          document.getElementById('spaceBar').style.width = Math.min(100, Math.round(((bd.space_complexity || 0) / 20) * 100)) + '%';

          document.getElementById('cleanScoreText').textContent = (bd.cleanliness || 0) + ' / 20';
          document.getElementById('cleanBar').style.width = Math.min(100, Math.round(((bd.cleanliness || 0) / 20) * 100)) + '%';

          // Approaches
          document.getElementById('userApproachName').textContent = res.user_approach.name || 'Current';
          document.getElementById('userTimeBigO').textContent = res.user_approach.time_complexity || 'O(N)';
          document.getElementById('optimalApproachName').textContent = res.best_approach.name || 'Optimal';
          document.getElementById('optimalTimeBigO').textContent = res.best_approach.time_complexity || 'O(N)';
          document.getElementById('approachSummaryText').textContent = res.why_suboptimal || res.best_approach.explanation || '';

          // Hints reset
          document.getElementById('hint1Content').textContent = res.hints.tier1_observation;
          document.getElementById('hint1Content').style.display = 'none';
          document.getElementById('revealHint1Btn').style.display = 'block';

          document.getElementById('hint2Content').textContent = res.hints.tier2_pattern;
          document.getElementById('hint2Content').style.display = 'none';
          document.getElementById('revealHint2Btn').style.display = 'block';

          document.getElementById('hint3Content').textContent = res.hints.tier3_strategy;
          document.getElementById('hint3Content').style.display = 'none';
          document.getElementById('revealHint3Btn').style.display = 'block';

          // Optimal code
          currentOptimalCode = res.optimal_code || '';
          document.getElementById('optimalCodeBlock').textContent = currentOptimalCode;

          // Sync status
          if (message.syncResult && message.syncResult.synced) {
            document.getElementById('syncStatusBox').style.display = 'flex';
          } else {
            document.getElementById('syncStatusBox').style.display = 'none';
          }
          break;
        }
        case 'ANALYSIS_ERROR': {
          loadingState.style.display = 'none';
          analyzeBtn.disabled = false;
          document.getElementById('btnText').textContent = 'Analyze Active Code File';
          emptyState.style.display = 'block';
          break;
        }
        case 'PROMPT_API_KEY': {
          settingsDrawer.style.display = 'block';
          break;
        }
      }
    });
  </script>
</body>
</html>`;
  }
}
