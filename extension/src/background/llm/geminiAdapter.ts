import { ProblemMetadata, AIAnalysisResult } from '../../types';
import { LLMAdapter, ProviderTestResult } from './types';
import { SYSTEM_INSTRUCTION, buildUserPrompt } from './prompt';
import { extractAndNormalizeJSON } from './normalizer';

let cachedWorkingModel: string | null = null;

export async function listAvailableGeminiModels(apiKey: string): Promise<string[]> {
  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey.trim())}`;
    const res = await fetch(listUrl);
    if (res.ok) {
      const data: any = await res.json();
      const models: any[] = data.models || [];
      const generateModels = models
        .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map((m) => m.name.replace(/^models\//, ''))
        .filter((name) => !name.includes('embedding') && !name.includes('aqa') && !name.includes('imagen'));

      if (generateModels.length > 0) {
        return generateModels;
      }
    }
  } catch (err) {
    console.warn('[AlgoPulse Gemini] Error querying ModelService.ListModels:', err);
  }
  return [];
}

export async function resolveGeminiCandidateModels(apiKey: string, preferredModel = 'auto'): Promise<string[]> {
  const cleanPreferred = preferredModel && preferredModel !== 'auto' && preferredModel.trim().length > 0
    ? preferredModel.trim()
    : null;

  const safeFallbacks = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-pro'
  ];

  const liveModels = await listAvailableGeminiModels(apiKey);
  const pool = liveModels.length > 0 ? liveModels : safeFallbacks;

  const sorted = [...pool].sort((a, b) => {
    if (cleanPreferred) {
      if (a.toLowerCase() === cleanPreferred.toLowerCase()) return -1;
      if (b.toLowerCase() === cleanPreferred.toLowerCase()) return 1;
    }
    if (cachedWorkingModel) {
      if (a === cachedWorkingModel) return -1;
      if (b === cachedWorkingModel) return 1;
    }
    const aFlash = a.includes('flash');
    const bFlash = b.includes('flash');
    if (aFlash && !bFlash) return -1;
    if (!aFlash && bFlash) return 1;

    if (a.includes('2.0') && !b.includes('2.0')) return -1;
    if (!a.includes('2.0') && b.includes('2.0')) return 1;
    if (a.includes('1.5') && !b.includes('1.5')) return -1;
    if (!a.includes('1.5') && b.includes('1.5')) return 1;

    return b.localeCompare(a, undefined, { numeric: true });
  });

  if (cleanPreferred && !sorted.includes(cleanPreferred)) {
    return [cleanPreferred, ...sorted];
  }

  return sorted;
}

export const geminiAdapter: LLMAdapter = {
  id: 'gemini',
  name: 'Google Gemini',

  async testKey(apiKey: string): Promise<ProviderTestResult> {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, message: 'Gemini API key is empty.' };
    }

    const candidateModels = await resolveGeminiCandidateModels(apiKey);
    let lastErr = 'Failed to connect to Google Gemini';

    for (const model of candidateModels.slice(0, 4)) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Ping' }] }] })
        });

        if (res.ok) {
          cachedWorkingModel = model;
          return { success: true, message: `Connected to Gemini (${model}) successfully!`, model };
        } else {
          const errJson = await res.json().catch(() => ({}));
          lastErr = errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
        }
      } catch (err: any) {
        lastErr = err.message || 'Network error';
      }
    }

    return { success: false, message: lastErr };
  },

  async analyze(
    metadata: ProblemMetadata,
    apiKey: string,
    preferredModel = 'auto'
  ): Promise<AIAnalysisResult> {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('Gemini API key is not configured.');
    }

    const promptText = buildUserPrompt(metadata);
    const candidateModels = await resolveGeminiCandidateModels(apiKey, preferredModel);

    let lastErrorMsg = 'Failed to communicate with Gemini API';
    let responseData: any = null;
    let successfulModel = '';

    for (const model of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          })
        });

        if (res.ok) {
          responseData = await res.json();
          successfulModel = model;
          cachedWorkingModel = model;
          break;
        } else {
          const errJson = await res.json().catch(() => ({}));
          lastErrorMsg = errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          console.warn(`[AlgoPulse Gemini] Model '${model}' failed:`, lastErrorMsg);
        }
      } catch (err: any) {
        lastErrorMsg = err.message || 'Network error';
      }
    }

    if (!responseData) {
      throw new Error(`[Gemini Error] ${lastErrorMsg}`);
    }

    const candidate = responseData?.candidates?.[0];
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
      console.warn(`[AlgoPulse Gemini] FinishReason was '${candidate.finishReason}'`);
    }

    const rawText = candidate?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Received an empty response from Gemini API.');
    }

    return extractAndNormalizeJSON(rawText, 'Google Gemini', successfulModel);
  }
};
