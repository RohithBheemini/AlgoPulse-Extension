import { ProblemMetadata, AIAnalysisResult, ExtensionConfig, ProgressiveHints } from './types';

// ============================================================================
// Shared System Instructions & Prompts
// ============================================================================
export const SYSTEM_INSTRUCTION = `You are an elite competitive programmer, algorithm professor, and technical interview reviewer.
Your primary role is to evaluate a student's code based on their ALGORITHMIC APPROACH and problem-solving strategy, comparing it directly against the theoretical optimal approach.

CORE EVALUATION PRINCIPLE — EVALUATE BY APPROACH, NOT JUST RAW TIME COMPLEXITY:
- Identify the exact algorithmic approach/paradigm used (e.g., "Brute Force Nested Iteration", "Two-Pointer Inward Scan", "Hash Map Single-Pass Lookup", "Sliding Window", "Dynamic Programming Tabulation", "Greedy with Priority Queue", "Binary Search on Answer").
- Analyze whether the student recognized the problem's underlying mathematical/data structure properties.
- Explain why the user's approach is or isn't optimal, and what paradigm shift is needed.

SCORING RUBRIC (Total 0 to 100):
1. Algorithmic Approach & Paradigm (0 to 35 pts):
   - Right algorithmic paradigm for this problem structure?
   - Recognized key invariants (sorted -> binary search/two pointers; frequency -> hash map; DAG -> topological sort)?
2. Approach Optimality & Strategy Efficiency (0 to 25 pts):
   - How close is the execution of their approach to the theoretical optimal strategy?
   - Avoids redundant computations or repeated traversals?
3. Space Complexity & Memory Strategy (0 to 20 pts):
   - Auxiliary memory economy: in-place mutations vs auxiliary allocations, avoiding unnecessary buffer structures.
4. Code Quality, Cleanliness & Edge Cases (0 to 20 pts):
   - Proper guard clauses, handling edge cases (empty inputs, single elements, duplicates, negative numbers, overflow), and clean idiomatic code.

PROGRESSIVE HINTS INSTRUCTION:
Provide exactly 3 progressive hints:
- Tier 1: Subtle observation/nudge focusing on problem structure (never name the algorithm).
- Tier 2: Algorithmic approach / pattern hint (e.g. "Consider using a Hash Map single-pass approach...").
- Tier 3: Concrete strategy step without writing the whole code.

You MUST return ONLY valid JSON strictly adhering to this schema:
{
  "score": number,
  "scoring_breakdown": {
    "approach_soundness": number,
    "approach_optimality": number,
    "optimality": number,
    "time_complexity": number,
    "space_complexity": number,
    "cleanliness": number
  },
  "user_approach": {
    "name": string,
    "paradigm": string,
    "summary": string,
    "time_complexity": string,
    "space_complexity": string
  },
  "best_approach": {
    "name": string,
    "paradigm": string,
    "time_complexity": string,
    "space_complexity": string,
    "explanation": string
  },
  "why_suboptimal": string,
  "why_ideal": string,
  "hints": {
    "tier1_observation": string,
    "tier2_pattern": string,
    "tier3_strategy": string
  },
  "assessed_difficulty": "Easy" | "Medium" | "Hard",
  "improvements": [string],
  "optimal_code": string
}`;

export function buildUserPrompt(metadata: ProblemMetadata): string {
  const descPart = metadata.description ? `Problem Description: ${metadata.description.slice(0, 1500)}` : '';
  return `Problem Title: ${metadata.title}
Difficulty: ${metadata.difficulty}
Programming Language: ${metadata.language}
${descPart}

Student's Code:
\`\`\`${metadata.language}
${metadata.code}
\`\`\`

Evaluate this code now. Focus on ALGORITHMIC APPROACH first, followed by complexity analysis, progressive hints, and optimal code.`;
}

// ============================================================================
// Universal Resilient JSON Normalizer
// ============================================================================
export function extractAndNormalizeJSON(rawText: string, providerName: string, modelName: string): AIAnalysisResult {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    throw new Error(`Empty response received from ${providerName} (${modelName}).`);
  }

  let parsed: any = null;

  try {
    parsed = JSON.parse(rawText.trim());
  } catch (_) {
    const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        parsed = JSON.parse(codeBlockMatch[1].trim());
      } catch (_) {}
    }

    if (!parsed) {
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const candidate = rawText.slice(firstBrace, lastBrace + 1).trim();
        try {
          parsed = JSON.parse(candidate);
        } catch (_) {}
      }
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Failed to parse valid JSON from ${providerName} response.`);
  }

  const scoreVal = typeof parsed.score === 'number' && !isNaN(parsed.score)
    ? Math.min(100, Math.max(0, Math.round(parsed.score)))
    : 70;

  const sb = (parsed.scoring_breakdown && typeof parsed.scoring_breakdown === 'object')
    ? parsed.scoring_breakdown
    : {};

  const approachSoundness = typeof sb.approach_soundness === 'number'
    ? sb.approach_soundness
    : (typeof sb.optimality === 'number' ? sb.optimality : 28);

  const approachOptimality = typeof sb.approach_optimality === 'number'
    ? sb.approach_optimality
    : (typeof sb.time_complexity === 'number' ? sb.time_complexity : 20);

  const spaceComplexity = typeof sb.space_complexity === 'number' ? sb.space_complexity : 18;
  const cleanliness = typeof sb.cleanliness === 'number' ? sb.cleanliness : 18;

  const userApproach = (parsed.user_approach && typeof parsed.user_approach === 'object')
    ? {
        name: String(parsed.user_approach.name || 'Submitted Approach'),
        paradigm: String(parsed.user_approach.paradigm || 'General'),
        summary: String(parsed.user_approach.summary || 'Approach evaluated.'),
        time_complexity: String(parsed.user_approach.time_complexity || 'O(N)'),
        space_complexity: String(parsed.user_approach.space_complexity || 'O(1)')
      }
    : {
        name: 'Submitted Approach',
        paradigm: 'General',
        summary: 'Approach evaluated.',
        time_complexity: 'O(N)',
        space_complexity: 'O(1)'
      };

  const bestApproach = (parsed.best_approach && typeof parsed.best_approach === 'object')
    ? {
        name: String(parsed.best_approach.name || 'Optimal Approach'),
        paradigm: String(parsed.best_approach.paradigm || 'Optimal Paradigm'),
        time_complexity: String(parsed.best_approach.time_complexity || 'O(N)'),
        space_complexity: String(parsed.best_approach.space_complexity || 'O(1)'),
        explanation: String(parsed.best_approach.explanation || 'Optimal algorithmic strategy.')
      }
    : {
        name: 'Optimal Approach',
        paradigm: 'Optimal Paradigm',
        time_complexity: 'O(N)',
        space_complexity: 'O(1)',
        explanation: 'Optimal algorithmic strategy.'
      };

  let hintsObj: ProgressiveHints = {
    tier1_observation: 'Observe the input constraints and search space properties.',
    tier2_pattern: 'Identify if a frequency map or two pointers can eliminate redundant traversals.',
    tier3_strategy: 'Formulate the state transition or recurrence relation.'
  };

  if (parsed.hints && typeof parsed.hints === 'object' && !Array.isArray(parsed.hints)) {
    hintsObj = {
      tier1_observation: String(parsed.hints.tier1_observation || hintsObj.tier1_observation),
      tier2_pattern: String(parsed.hints.tier2_pattern || hintsObj.tier2_pattern),
      tier3_strategy: String(parsed.hints.tier3_strategy || hintsObj.tier3_strategy)
    };
  } else if (Array.isArray(parsed.hints) && parsed.hints.length >= 3) {
    hintsObj = {
      tier1_observation: String(parsed.hints[0] || hintsObj.tier1_observation),
      tier2_pattern: String(parsed.hints[1] || hintsObj.tier2_pattern),
      tier3_strategy: String(parsed.hints[2] || hintsObj.tier3_strategy)
    };
  }

  const improvements = Array.isArray(parsed.improvements)
    ? parsed.improvements.map((item: any) => String(item))
    : ['Consider reducing auxiliary space allocations.'];

  const optimalCode = typeof parsed.optimal_code === 'string' && parsed.optimal_code.trim()
    ? parsed.optimal_code.trim()
    : '// Reference code provided in analysis';

  return {
    score: scoreVal,
    scoring_breakdown: {
      approach_soundness: approachSoundness,
      approach_optimality: approachOptimality,
      optimality: approachSoundness,
      time_complexity: approachOptimality,
      space_complexity: spaceComplexity,
      cleanliness: cleanliness
    },
    user_approach: userApproach,
    best_approach: bestApproach,
    why_suboptimal: parsed.why_suboptimal ? String(parsed.why_suboptimal) : undefined,
    why_ideal: parsed.why_ideal ? String(parsed.why_ideal) : undefined,
    hints: hintsObj,
    improvements,
    optimal_code: optimalCode,
    assessed_difficulty: ['Easy', 'Medium', 'Hard'].includes(parsed.assessed_difficulty)
      ? parsed.assessed_difficulty
      : 'Medium',
    model_used: modelName,
    provider_used: providerName
  };
}

// ============================================================================
// API Key Sanitizer
// ============================================================================
/**
 * Thoroughly sanitizes an AI provider API key by stripping:
 * - Surrounding quotes or backticks (e.g. copied from .env or JSON)
 * - Non-ASCII or invisible control characters (zero-width spaces, UTF-8 BOM, stray bytes)
 * - Trailing punctuation (commas, semicolons)
 * - Leading and trailing whitespace
 */
export function sanitizeApiKey(key?: string): string {
  if (!key || typeof key !== 'string') return '';
  let cleaned = key.trim();
  // Strip surrounding quotes or backticks
  cleaned = cleaned.replace(/^["'`]|["'`]$/g, '').trim();
  // Strip non-printable / non-ASCII characters (including zero-width spaces, UTF-8 BOM, stray bytes like [196, 129])
  cleaned = cleaned.replace(/[^\x21-\x7E]/g, '').trim();
  // Strip common trailing punctuation (comma, semicolon)
  cleaned = cleaned.replace(/[,;]+$/, '').trim();
  return cleaned;
}

// ============================================================================
// Google Gemini Adapter
// ============================================================================
let cachedGeminiModel: string | null = null;

export async function listAvailableGeminiModels(apiKey: string): Promise<string[]> {
  const cleanKey = sanitizeApiKey(apiKey);
  if (!cleanKey) return [];
  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`;
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
    console.warn('[AlgoPulse VSCode] Error querying ModelService.ListModels:', err);
  }
  return [];
}

async function resolveGeminiCandidateModels(apiKey: string, preferredModel = 'auto'): Promise<string[]> {
  const cleanKey = sanitizeApiKey(apiKey);
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

  const liveModels = await listAvailableGeminiModels(cleanKey);
  const pool = liveModels.length > 0 ? liveModels : safeFallbacks;

  const sorted = [...pool].sort((a, b) => {
    if (cleanPreferred) {
      if (a.toLowerCase() === cleanPreferred.toLowerCase()) return -1;
      if (b.toLowerCase() === cleanPreferred.toLowerCase()) return 1;
    }
    if (cachedGeminiModel) {
      if (a === cachedGeminiModel) return -1;
      if (b === cachedGeminiModel) return 1;
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

export async function analyzeWithGemini(
  metadata: ProblemMetadata,
  apiKey: string,
  preferredModel = 'auto'
): Promise<AIAnalysisResult> {
  const cleanKey = sanitizeApiKey(apiKey);
  if (!cleanKey) {
    throw new Error('Gemini API key is not configured or empty.');
  }
  const promptText = buildUserPrompt(metadata);
  const candidateModels = await resolveGeminiCandidateModels(cleanKey, preferredModel);

  let lastErrorMsg = 'Failed to communicate with Gemini API';
  let responseData: any = null;
  let successfulModel = '';

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`;

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
        cachedGeminiModel = model;
        break;
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastErrorMsg = errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      }
    } catch (err: any) {
      lastErrorMsg = err.message || 'Network error';
    }
  }

  if (!responseData) {
    throw new Error(`[Gemini Error] ${lastErrorMsg}`);
  }

  const rawText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Received an empty response from Gemini API.');
  }

  return extractAndNormalizeJSON(rawText, 'Google Gemini', successfulModel);
}

// ============================================================================
// OpenAI Adapter
// ============================================================================
let cachedOpenAIModel: string | null = null;
const OPENAI_MODELS = ['gpt-4o-mini', 'gpt-4o', 'o3-mini', 'gpt-3.5-turbo'];

export async function analyzeWithOpenAI(
  metadata: ProblemMetadata,
  apiKey: string,
  preferredModel = 'auto'
): Promise<AIAnalysisResult> {
  const promptText = buildUserPrompt(metadata);
  const candidateModels = (preferredModel && preferredModel !== 'auto')
    ? [preferredModel.trim(), ...OPENAI_MODELS.filter(m => m.toLowerCase() !== preferredModel.trim().toLowerCase())]
    : OPENAI_MODELS;

  let lastErrorMsg = 'Failed to communicate with OpenAI API';
  let responseData: any = null;
  let successfulModel = '';

  for (const model of candidateModels) {
    try {
      const isReasoning = /^o[13]/i.test(model);
      const requestBody: any = {
        model,
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          { role: 'user', content: promptText }
        ],
        response_format: { type: 'json_object' }
      };

      if (!isReasoning) {
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
        cachedOpenAIModel = model;
        break;
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastErrorMsg = errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
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

// ============================================================================
// Anthropic Claude Adapter
// ============================================================================
let cachedClaudeModel: string | null = null;
const CLAUDE_MODELS = ['claude-3-5-haiku-20241022', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'];

export async function analyzeWithClaude(
  metadata: ProblemMetadata,
  apiKey: string,
  preferredModel = 'auto'
): Promise<AIAnalysisResult> {
  const promptText = buildUserPrompt(metadata);
  const candidateModels = (preferredModel && preferredModel !== 'auto')
    ? [preferredModel.trim(), ...CLAUDE_MODELS.filter(m => m.toLowerCase() !== preferredModel.trim().toLowerCase())]
    : CLAUDE_MODELS;

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
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: 3500,
          temperature: 0.2,
          system: SYSTEM_INSTRUCTION,
          messages: [{ role: 'user', content: promptText }]
        })
      });

      if (res.ok) {
        responseData = await res.json();
        successfulModel = model;
        cachedClaudeModel = model;
        break;
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastErrorMsg = errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
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

// ============================================================================
// Provider Key Test Helper
// ============================================================================
export async function testProviderKey(provider: 'gemini' | 'openai' | 'claude', apiKey: string): Promise<{ success: boolean; message: string; model?: string }> {
  const cleanKey = sanitizeApiKey(apiKey);
  if (!cleanKey) {
    return { success: false, message: 'API key is empty.' };
  }

  if (provider === 'gemini') {
    try {
      const models = await resolveGeminiCandidateModels(cleanKey);
      const testModel = models[0] || 'gemini-2.0-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${encodeURIComponent(cleanKey)}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Ping' }] }] })
      });
      if (res.ok) {
        return { success: true, message: `Connected to Gemini (${testModel}) successfully!`, model: testModel };
      }
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err?.error?.message || `HTTP ${res.status}` };
    } catch (e: any) {
      return { success: false, message: e.message || 'Network error' };
    }
  }

  if (provider === 'openai') {
    try {
      const testModel = 'gpt-4o-mini';
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`
        },
        body: JSON.stringify({
          model: testModel,
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 10
        })
      });
      if (res.ok) {
        return { success: true, message: `Connected to OpenAI (${testModel}) successfully!`, model: testModel };
      }
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err?.error?.message || `HTTP ${res.status}` };
    } catch (e: any) {
      return { success: false, message: e.message || 'Network error' };
    }
  }

  if (provider === 'claude') {
    try {
      const testModel = 'claude-3-5-haiku-20241022';
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': cleanKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: testModel,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Ping' }]
        })
      });
      if (res.ok) {
        return { success: true, message: `Connected to Claude (${testModel}) successfully!`, model: testModel };
      }
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err?.error?.message || `HTTP ${res.status}` };
    } catch (e: any) {
      return { success: false, message: e.message || 'Network error' };
    }
  }

  return { success: false, message: `Unknown provider: ${provider}` };
}

// ============================================================================
// Multi-Provider Orchestrator
// ============================================================================
export async function analyzeCodeWithMultiProvider(
  metadata: ProblemMetadata,
  config: ExtensionConfig
): Promise<AIAnalysisResult> {
  const activeProvider = config.activeProvider || 'auto';
  const preferredModel = config.preferredModel || 'auto';

  const available: Array<{ id: 'gemini' | 'openai' | 'claude'; key: string }> = [];

  const geminiKey = sanitizeApiKey(config.geminiApiKey);
  const openaiKey = sanitizeApiKey(config.openaiApiKey);
  const claudeKey = sanitizeApiKey(config.anthropicApiKey);

  if (geminiKey) {
    available.push({ id: 'gemini', key: geminiKey });
  }
  if (openaiKey) {
    available.push({ id: 'openai', key: openaiKey });
  }
  if (claudeKey) {
    available.push({ id: 'claude', key: claudeKey });
  }

  if (available.length === 0) {
    throw new Error('No AI provider API key is configured. Please open AlgoPulse settings in VS Code and set your key for Gemini, OpenAI, or Claude.');
  }

  let executionPlan: Array<{ id: 'gemini' | 'openai' | 'claude'; key: string }> = [];

  if (activeProvider !== 'auto') {
    const target = available.find(p => p.id === activeProvider);
    if (!target) {
      throw new Error(`The selected provider '${activeProvider}' does not have an API key configured in VS Code settings.`);
    }
    executionPlan = [target, ...available.filter(p => p.id !== activeProvider)];
  } else {
    // Priority order: Gemini -> OpenAI -> Claude
    const priority: Array<'gemini' | 'openai' | 'claude'> = ['gemini', 'openai', 'claude'];
    for (const p of priority) {
      const match = available.find(item => item.id === p);
      if (match) executionPlan.push(match);
    }
  }

  const errors: string[] = [];

  for (const { id, key } of executionPlan) {
    try {
      if (id === 'gemini') {
        console.log('[AlgoPulse VSCode] Evaluating with Google Gemini...');
        return await analyzeWithGemini(metadata, key, preferredModel);
      } else if (id === 'openai') {
        console.log('[AlgoPulse VSCode] Evaluating with OpenAI...');
        return await analyzeWithOpenAI(metadata, key, preferredModel);
      } else if (id === 'claude') {
        console.log('[AlgoPulse VSCode] Evaluating with Anthropic Claude...');
        return await analyzeWithClaude(metadata, key, preferredModel);
      }
    } catch (err: any) {
      console.warn(`[AlgoPulse VSCode] ${id} analysis failed:`, err.message);
      errors.push(`${id}: ${err.message}`);
    }
  }

  throw new Error(`AlgoPulse: All configured AI providers failed:\n• ${errors.join('\n• ')}`);
}

// Backward compatibility alias
export async function analyzeCodeWithGemini(
  metadata: ProblemMetadata,
  apiKey: string,
  preferredModel = 'auto'
): Promise<AIAnalysisResult> {
  return await analyzeWithGemini(metadata, apiKey, preferredModel);
}
