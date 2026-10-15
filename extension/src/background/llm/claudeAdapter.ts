import { ProblemMetadata, AIAnalysisResult } from '../../types';
import { LLMAdapter, ProviderTestResult } from './types';
import { SYSTEM_INSTRUCTION, buildUserPrompt } from './prompt';
import { extractAndNormalizeJSON } from './normalizer';

let cachedWorkingModel: string | null = null;

const CLAUDE_MODELS = [
  'claude-3-5-haiku-20241022',
  'claude-3-5-sonnet-20241022',
  'claude-3-haiku-20240307'
];

export function resolveClaudeCandidateModels(preferredModel = 'auto'): string[] {
  const clean = preferredModel && preferredModel !== 'auto' && preferredModel.trim().length > 0
    ? preferredModel.trim()
    : null;

  if (clean) {
    return [clean, ...CLAUDE_MODELS.filter(m => m.toLowerCase() !== clean.toLowerCase())];
  }
  if (cachedWorkingModel) {
    return [cachedWorkingModel, ...CLAUDE_MODELS.filter(m => m !== cachedWorkingModel)];
  }
  return CLAUDE_MODELS;
}

export const claudeAdapter: LLMAdapter = {
  id: 'claude',
  name: 'Anthropic Claude',

  async testKey(apiKey: string): Promise<ProviderTestResult> {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, message: 'Anthropic API key is empty.' };
    }

    const testModel = 'claude-3-5-haiku-20241022';
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: testModel,
          max_tokens: 15,
          messages: [{ role: 'user', content: 'Ping' }]
        })
      });

      if (res.ok) {
        cachedWorkingModel = testModel;
        return { success: true, message: `Connected to Claude (${testModel}) successfully!`, model: testModel };
      } else {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
        return { success: false, message: msg };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error reaching Anthropic Claude' };
    }
  },

  async analyze(
    metadata: ProblemMetadata,
    apiKey: string,
    preferredModel = 'auto'
  ): Promise<AIAnalysisResult> {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('Anthropic Claude API key is not configured.');
    }

    const promptText = buildUserPrompt(metadata);
    const candidateModels = resolveClaudeCandidateModels(preferredModel);

    let lastErrorMsg = 'Failed to communicate with Anthropic Claude API';
    let responseData: any = null;
    let successfulModel = '';

    for (const model of candidateModels) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey.trim(),
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model,
            max_tokens: 3500,
            temperature: 0.2,
            system: SYSTEM_INSTRUCTION,
            messages: [
              { role: 'user', content: promptText }
            ]
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
          console.warn(`[AlgoPulse Claude] Model '${model}' failed:`, lastErrorMsg);
        }
      } catch (err: any) {
        lastErrorMsg = err.message || 'Network error';
      }
    }

    if (!responseData) {
      throw new Error(`[Claude Error] ${lastErrorMsg}`);
    }

    const rawText = responseData?.content?.[0]?.text;
    if (!rawText) {
      throw new Error('Received an empty response from Claude API.');
    }

    return extractAndNormalizeJSON(rawText, 'Anthropic Claude', successfulModel);
  }
};
