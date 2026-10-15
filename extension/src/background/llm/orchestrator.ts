import { ProblemMetadata, AIAnalysisResult, ExtensionSettings } from '../../types';
import { AIProviderId, ProviderTestResult } from './types';
import { geminiAdapter } from './geminiAdapter';
import { openaiAdapter } from './openaiAdapter';
import { claudeAdapter } from './claudeAdapter';

const adapters = {
  gemini: geminiAdapter,
  openai: openaiAdapter,
  claude: claudeAdapter
};

export async function testProviderKey(provider: AIProviderId, apiKey: string): Promise<ProviderTestResult> {
  const adapter = adapters[provider];
  if (!adapter) {
    return { success: false, message: `Unknown provider: ${provider}` };
  }
  return await adapter.testKey(apiKey);
}

export async function analyzeCodeWithMultiProvider(
  metadata: ProblemMetadata,
  settings: ExtensionSettings
): Promise<AIAnalysisResult> {
  const activeProvider = settings.activeProvider || 'auto';
  const preferredModel = settings.preferredModel || 'auto';

  // Build list of configured providers with their keys
  const availableProviders: Array<{ id: AIProviderId; key: string }> = [];

  if (settings.geminiApiKey && settings.geminiApiKey.trim()) {
    availableProviders.push({ id: 'gemini', key: settings.geminiApiKey.trim() });
  }
  if (settings.openaiApiKey && settings.openaiApiKey.trim()) {
    availableProviders.push({ id: 'openai', key: settings.openaiApiKey.trim() });
  }
  if (settings.anthropicApiKey && settings.anthropicApiKey.trim()) {
    availableProviders.push({ id: 'claude', key: settings.anthropicApiKey.trim() });
  }

  if (availableProviders.length === 0) {
    throw new Error('No AI provider API key is configured. Please open AlgoPulse extension settings and add a key for Gemini, OpenAI, or Claude.');
  }

  // Determine execution sequence
  let executionPlan: Array<{ id: AIProviderId; key: string }> = [];

  if (activeProvider !== 'auto') {
    // User picked a specific provider
    const target = availableProviders.find(p => p.id === activeProvider);
    if (!target) {
      throw new Error(`The selected provider '${activeProvider}' does not have an API key configured. Please add its API key in settings.`);
    }
    // Specific provider first, followed by others as failover backups
    executionPlan = [target, ...availableProviders.filter(p => p.id !== activeProvider)];
  } else {
    // Auto Mode: Prioritize Gemini (free tier) -> OpenAI (ultra-low cost/fast) -> Claude
    const priorityOrder: AIProviderId[] = ['gemini', 'openai', 'claude'];
    for (const pId of priorityOrder) {
      const match = availableProviders.find(p => p.id === pId);
      if (match) executionPlan.push(match);
    }
  }

  const errors: string[] = [];

  for (const { id, key } of executionPlan) {
    const adapter = adapters[id];
    try {
      console.log(`[AlgoPulse Orchestrator] Attempting analysis via ${adapter.name}...`);
      const result = await adapter.analyze(metadata, key, preferredModel);
      console.log(`[AlgoPulse Orchestrator] Analysis succeeded with ${adapter.name} (${result.model_used})`);
      return result;
    } catch (err: any) {
      const msg = err.message || 'Unknown error';
      console.warn(`[AlgoPulse Orchestrator] ${adapter.name} failed:`, msg);
      errors.push(`${adapter.name}: ${msg}`);
      // Cascade to next available provider in executionPlan
    }
  }

  throw new Error(`AlgoPulse: All configured AI providers failed:\n• ${errors.join('\n• ')}`);
}
