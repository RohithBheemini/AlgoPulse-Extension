import { analyzeCodeWithGemini } from './gemini';
import { ProblemMetadata, AIAnalysisResult, ExtensionSettings, SyncSubmissionPayload, SubmissionHistoryItem } from '../types';

const DEFAULT_SETTINGS: ExtensionSettings = {
  geminiApiKey: '',
  dashboardUrl: 'http://localhost:3000',
  extensionToken: '',
  autoSync: true
};

async function getStoredSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.local.get(['settings']);
  return { ...DEFAULT_SETTINGS, ...(result.settings || {}) };
}

async function saveSubmissionLocally(item: SubmissionHistoryItem): Promise<void> {
  const result = await chrome.storage.local.get(['history']);
  const history: SubmissionHistoryItem[] = result.history || [];
  // Keep up to 50 latest submissions
  const updated = [item, ...history.filter(h => h.id !== item.id)].slice(0, 50);
  await chrome.storage.local.set({ history: updated });
}

async function syncToDashboard(
  payload: SyncSubmissionPayload,
  settings: ExtensionSettings
): Promise<{ success: boolean; message: string; data?: any }> {
  if (!settings.dashboardUrl || !settings.dashboardUrl.trim()) {
    return { success: false, message: 'Dashboard URL is not configured.' };
  }

  const url = `${settings.dashboardUrl.replace(/\/$/, '')}/api/submissions`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(settings.extensionToken ? { Authorization: `Bearer ${settings.extensionToken.trim()}` } : {})
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errJson.error || `Dashboard returned HTTP ${res.status}: ${res.statusText}`
      };
    }

    const data = await res.json();
    return { success: true, message: 'Successfully synced to dashboard!', data };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to connect to dashboard at ${url}: ${err.message || 'Network error'}`
    };
  }
}

// Runtime message dispatcher
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const handleAsync = async () => {
    try {
      if (message.type === 'GET_SETTINGS') {
        const settings = await getStoredSettings();
        return { success: true, settings };
      }

      if (message.type === 'SAVE_SETTINGS') {
        await chrome.storage.local.set({ settings: message.payload });
        return { success: true };
      }

      if (message.type === 'TEST_GEMINI_KEY') {
        const apiKey = message.payload?.apiKey;
        if (!apiKey) return { success: false, message: 'API key is empty.' };
        
        const candidateModels = ['gemini-3.8-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
        let success = false;
        let lastErr = '';

        for (const model of candidateModels) {
          try {
            const testRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: 'Ping' }] }] })
              }
            );
            if (testRes.ok) {
              success = true;
              break;
            } else {
              const err = await testRes.json().catch(() => ({}));
              lastErr = err?.error?.message || `HTTP ${testRes.status}`;
            }
          } catch (e: any) {
            lastErr = e.message;
          }
        }

        if (success) {
          return { success: true, message: 'Gemini API Key is valid and active!' };
        }
        return { success: false, message: lastErr || 'Failed to ping Gemini API' };
      }

      if (message.type === 'TEST_DASHBOARD') {
        const { url, token } = message.payload;
        if (!url) return { success: false, message: 'URL is required.' };
        const testUrl = `${url.replace(/\/$/, '')}/api/health`;
        const res = await fetch(testUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!res.ok) {
          return { success: false, message: `Dashboard replied with HTTP ${res.status}` };
        }
        return { success: true, message: 'Connected to dashboard successfully!' };
      }

      if (message.type === 'ANALYZE_AND_EVALUATE') {
        const metadata: ProblemMetadata = message.payload;
        const settings = await getStoredSettings();

        if (!settings.geminiApiKey) {
          return {
            success: false,
            message: 'Gemini API key is not configured. Click the AlgoPulse extension icon in your toolbar to configure it.'
          };
        }

        // Run Gemini Analysis
        const analysis: AIAnalysisResult = await analyzeCodeWithGemini(metadata, settings.geminiApiKey);

        const userApproachDisplay = analysis.user_approach?.name 
          ? `${analysis.user_approach.name} (${analysis.user_approach.time_complexity})`
          : (analysis.user_approach?.time_complexity || 'Standard Approach');

        const optimalApproachDisplay = analysis.best_approach?.name
          ? `${analysis.best_approach.name} (${analysis.best_approach.time_complexity})`
          : (analysis.best_approach?.time_complexity || 'Optimal Approach');

        // Prepare sync payload
        const syncPayload: SyncSubmissionPayload = {
          problem_title: metadata.title,
          problem_slug: metadata.slug,
          platform: metadata.platform,
          difficulty: metadata.difficulty,
          language: metadata.language,
          user_code: metadata.code,
          overall_score: analysis.score,
          optimality_score: analysis.scoring_breakdown.optimality,
          time_score: analysis.scoring_breakdown.time_complexity,
          space_score: analysis.scoring_breakdown.space_complexity,
          cleanliness_score: analysis.scoring_breakdown.cleanliness,
          user_time_complexity: userApproachDisplay,
          user_space_complexity: analysis.user_approach.space_complexity,
          optimal_time_complexity: optimalApproachDisplay,
          optimal_space_complexity: analysis.best_approach.space_complexity,
          why_suboptimal: analysis.why_suboptimal || analysis.user_approach.summary,
          why_ideal: analysis.why_ideal || analysis.best_approach.explanation,
          summary_feedback: analysis.best_approach.explanation,
          improvements: analysis.improvements,
          optimal_code: analysis.optimal_code
        };

        let syncStatus = { synced: false, message: 'Auto-sync disabled' };
        if (settings.autoSync && settings.dashboardUrl && settings.extensionToken) {
          const syncResult = await syncToDashboard(syncPayload, settings);
          syncStatus = { synced: syncResult.success, message: syncResult.message };
        }

        // Save locally
        const historyItem: SubmissionHistoryItem = {
          ...syncPayload,
          id: `sub_${Date.now()}`,
          created_at: new Date().toISOString(),
          synced: syncStatus.synced
        };
        await saveSubmissionLocally(historyItem);

        return {
          success: true,
          result: analysis,
          analysis,
          syncStatus,
          syncResult: syncStatus
        };
      }

      if (message.type === 'SYNC_TO_DASHBOARD') {
        const payload: SyncSubmissionPayload = message.payload;
        const settings = await getStoredSettings();
        const syncResult = await syncToDashboard(payload, settings);
        return syncResult;
      }

      return { success: false, message: `Unknown message type: ${message.type}` };
    } catch (err: any) {
      console.error('[AlgoPulse Background Error]', err);
      return { success: false, message: err.message || 'Internal extension error' };
    }
  };

  handleAsync().then(sendResponse);
  return true; // Keep message channel open for async response
});

console.log('[AlgoPulse] Background service worker initialized.');
