import { ProblemMetadata, AIAnalysisResult } from '../../types';

export type AIProviderId = 'gemini' | 'openai' | 'claude';

export interface ProviderTestResult {
  success: boolean;
  message: string;
  model?: string;
}

export interface LLMAdapter {
  id: AIProviderId;
  name: string;
  testKey(apiKey: string): Promise<ProviderTestResult>;
  analyze(
    metadata: ProblemMetadata,
    apiKey: string,
    preferredModel?: string
  ): Promise<AIAnalysisResult>;
}
