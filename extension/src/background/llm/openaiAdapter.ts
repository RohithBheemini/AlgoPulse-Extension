import { ProblemMetadata, AIAnalysisResult } from '../../types';
import { LLMAdapter, ProviderTestResult } from './types';
import { SYSTEM_INSTRUCTION, buildUserPrompt } from './prompt';
import { extractAndNormalizeJSON } from './normalizer';

let cachedWorkingModel: string | null = null;

const OPENAI_MODELS = [
  'gpt-4o-mini',
  'gpt-4o',
  'o3-mini',
  'gpt-3.5-turbo'
];

export function resolveOpenAICandidateModels(preferredModel = 'auto'): string[] {
  const clean = preferredModel && preferredModel !== 'auto' && preferredModel.trim().length > 0
    ? preferredModel.trim()
    : null;

  if (clean) {
    return [clean, ...OPENAI_MODELS.filter(m => m.toLowerCase() !== clean.toLowerCase())];
  }
  if (cachedWorkingModel) {
    return [cachedWorkingModel, ...OPENAI_MODELS.filter(m => m !== cachedWorkingModel)];
  }
  return OPENAI_MODELS;
}

export const openaiAdapter: LLMAdapter = {
  id: 'openai',
  name: 'OpenAI',

  async testKey(apiKey: string): Promise<ProviderTestResult> {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, message: 'OpenAI API key is empty.' };
    }

    const testModel = 'gpt-4o-mini';
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: testModel,
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 10
        })
      });

      if (res.ok) {
        cachedWorkingModel = testModel;
        return { success: true, message: `Connected to OpenAI (${testModel}) successfully!`, model: testModel };
      } else {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
        return { success: false, message: msg };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error reaching OpenAI' };
    }
  },

  async analyze(
    metadata: ProblemMetadata,
    apiKey: string,
    preferredModel = 'auto'
  ): Promise<AIAnalysisResult> {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('OpenAI API key is not configured.');
    }

    const promptText = buildUserPrompt(metadata);
    const candidateModels = resolveOpenAICandidateModels(preferredModel);

    let lastErrorMsg = 'Failed to communicate with OpenAI API';
    let responseData: any = null;
    let successfulModel = '';

    for (const model of candidateModels) {
      try {
        const isReasoningModel = /^o[13]/i.test(model);

        const requestBody: any = {
          model,
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            { role: 'user', content: promptText }
          ],
          response_format: { type: 'json_object' }
        };

        // o1 / o3 reasoning models do not accept standard temperature
        if (!isReasoningModel) {
          requestBody.temperature = 0.2;
          requestBody.max_tokens = 3500;
        } else {
          requestBody.max_completion_tokens = 3500;
        }

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`
          },
          body: JSON.stringify(requestBody)
        });

        if (res.ok) {
          responseData = await res.json();
          successfulModel = model;
          cachedWorkingModel = model;
          break;
        } else {
          const errJson = await res.json().catch(() => ({}));
          lastErrorMsg = errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          console.warn(`[AlgoPulse OpenAI] Model '${model}' failed:`, lastErrorMsg);
        }
      } catch (err: any) {
        lastErrorMsg = err.message || 'Network error';
      }
    }

    if (!responseData) {
      throw new Error(`[OpenAI Error] ${lastErrorMsg}`);
    }

    const rawText = responseData?.choices?.[0]?.message?.content;
    if (!rawText) {
      throw new Error('Received an empty response from OpenAI API.');
    }

    return extractAndNormalizeJSON(rawText, 'OpenAI', successfulModel);
  }
};
