import { ProblemMetadata, AIAnalysisResult } from './types';

let cachedWorkingModel: string | null = null;

// Dynamically query all supported generateContent models for this specific API key via Google's ModelService.ListModels
export async function listAvailableModels(apiKey: string): Promise<string[]> {
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
        console.log('[AlgoPulse VSCode] Discovered models supporting generateContent from Google:', generateModels);
        return generateModels;
      }
    } else {
      console.warn('[AlgoPulse VSCode] ModelService.ListModels returned HTTP', res.status);
    }
  } catch (err) {
    console.warn('[AlgoPulse VSCode] Error querying ModelService.ListModels:', err);
  }
  return [];
}

async function resolveBestModel(apiKey: string, preferredModel = 'auto'): Promise<string[]> {
  const cleanPreferred = (preferredModel && preferredModel !== 'auto' && preferredModel.trim().length > 0)
    ? preferredModel.trim()
    : null;

  // Real, verified fallback models if ListModels is unreachable
  const safeFallbacks = [
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-pro'
  ];

  // 1. Live discovery via Google's ModelService.ListModels
  const liveModels = await listAvailableModels(apiKey);
  const pool = liveModels.length > 0 ? liveModels : safeFallbacks;

  // 2. Flexible sorting: prioritize fast Flash models, user's preference, or cached working model
  const sorted = [...pool].sort((a, b) => {
    // If user specified a preferred model, put it first
    if (cleanPreferred) {
      if (a.toLowerCase() === cleanPreferred.toLowerCase()) return -1;
      if (b.toLowerCase() === cleanPreferred.toLowerCase()) return 1;
    }
    // If a model worked previously in this session, prioritize it
    if (cachedWorkingModel) {
      if (a === cachedWorkingModel) return -1;
      if (b === cachedWorkingModel) return 1;
    }
    // Prioritize fast/free flash models
    const aFlash = a.includes('flash');
    const bFlash = b.includes('flash');
    if (aFlash && !bFlash) return -1;
    if (!aFlash && bFlash) return 1;

    // Prioritize 2.0 or 1.5 over older
    if (a.includes('2.0') && !b.includes('2.0')) return -1;
    if (!a.includes('2.0') && b.includes('2.0')) return 1;
    if (a.includes('1.5') && !b.includes('1.5')) return -1;
    if (!a.includes('1.5') && b.includes('1.5')) return 1;

    return b.localeCompare(a, undefined, { numeric: true });
  });

  // If user typed a custom model name not found in pool, prepend it so it gets attempted first
  if (cleanPreferred && !sorted.includes(cleanPreferred)) {
    return [cleanPreferred, ...sorted];
  }

  return sorted;
}

export async function analyzeCodeWithGemini(
  metadata: ProblemMetadata,
  apiKey: string,
  preferredModel = 'auto'
): Promise<AIAnalysisResult> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API key is not configured. Please open AlgoPulse settings in VS Code and set your free API key.');
  }

  const systemInstruction = `You are an elite competitive programmer, algorithm professor, and technical interview reviewer.
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

Provide:
- Progressive Hints: 3 tiers:
  Tier 1: Subtle observation/nudge focusing on problem structure.
  Tier 2: Algorithmic approach / pattern hint (e.g. "Consider using a Hash Map single-pass approach...").
  Tier 3: Concrete strategy step without writing the whole code.
- Optimal Code: The cleanest, idiomatic, optimal solution in the user's programming language (${metadata.language}).

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

  const prompt = `Problem Title: ${metadata.title}
Difficulty: ${metadata.difficulty}
Programming Language: ${metadata.language}
${metadata.description ? `Problem Description: ${metadata.description.slice(0, 1500)}` : ''}

Student's Code:
\`\`\`${metadata.language}
${metadata.code}
\`\`\`

Evaluate this code now. Focus on ALGORITHMIC APPROACH first, followed by complexity analysis, progressive hints, and optimal code.`;

  const candidateModels = await resolveBestModel(apiKey, preferredModel);
  let lastError: Error | null = null;

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!res.ok) {
        const errorJson: any = await res.json().catch(() => ({}));
        const msg = errorJson.error?.message || `HTTP ${res.status}: ${res.statusText}`;
        console.warn(`[AlgoPulse VSCode] Model ${model} returned error: ${msg}. Trying next model...`);
        lastError = new Error(`Model ${model}: ${msg}`);
        continue;
      }

      const data: any = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Gemini returned an empty response.');
      }

      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

      const parsed: AIAnalysisResult = JSON.parse(cleaned);

      // Validate required fields
      if (typeof parsed.score !== 'number' || !parsed.scoring_breakdown || !parsed.hints) {
        throw new Error('Invalid JSON structure from Gemini response.');
      }

      // Backward compatibility mapping for scoring breakdown
      if (parsed.scoring_breakdown.optimality === undefined) {
        parsed.scoring_breakdown.optimality = parsed.scoring_breakdown.approach_soundness || 30;
      }
      if (parsed.scoring_breakdown.time_complexity === undefined) {
        parsed.scoring_breakdown.time_complexity = parsed.scoring_breakdown.approach_optimality || 20;
      }

      cachedWorkingModel = model;
      console.log(`[AlgoPulse VSCode] Evaluated successfully using model: ${model}`);
      parsed.model_used = model;
      return parsed;
    } catch (err: any) {
      lastError = err;
      console.warn(`[AlgoPulse VSCode] Failed with model ${model}:`, err.message);
    }
  }

  throw lastError || new Error(`AlgoPulse: Failed to analyze code across attempted Gemini models [${candidateModels.slice(0, 4).join(', ')}]. Please check your API key.`);
}
