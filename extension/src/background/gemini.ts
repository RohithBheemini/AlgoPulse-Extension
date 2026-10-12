import { ProblemMetadata, AIAnalysisResult } from '../types';

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
        console.log('[AlgoPulse] Discovered models supporting generateContent from Google:', generateModels);
        return generateModels;
      }
    } else {
      console.warn('[AlgoPulse] ModelService.ListModels returned HTTP', res.status);
    }
  } catch (err) {
    console.warn('[AlgoPulse] Error querying ModelService.ListModels:', err);
  }
  return [];
}

export async function resolveBestModel(apiKey: string, preferredModel = 'auto'): Promise<string[]> {
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
    throw new Error('Gemini API key is not set. Please open AlgoPulse extension popup and configure your API key.');
  }

  const systemInstruction = `You are an elite competitive programmer, algorithm professor, and technical interview reviewer.
Your primary role is to evaluate a student's code based on their ALGORITHMIC APPROACH and problem-solving strategy, comparing it directly against the theoretical optimal approach.

CORE EVALUATION PRINCIPLE — EVALUATE BY APPROACH, NOT JUST RAW TIME COMPLEXITY:
Instead of only checking raw Big-O numbers, evaluate the algorithmic strategy:
- Identify the exact approach/paradigm used (e.g., "Brute Force Nested Iteration", "Two-Pointer Inward Scan", "Hash Map Single-Pass Lookup", "Sliding Window", "Dynamic Programming Tabulation", "Greedy with Priority Queue", "Binary Search on Answer").
- Analyze whether the student recognized the problem's underlying mathematical/data structure properties.
- Explain why the user's approach is or isn't optimal, and what paradigm shift is needed.

SCORING RUBRIC (Total 0 to 100):
1. Algorithmic Approach & Paradigm (0 to 35 pts):
   - Did the user choose the right algorithmic paradigm for this problem structure?
   - Did they recognize key properties (e.g., sorted array -> two pointers/binary search; frequency lookup -> hash map; overlapping subproblems -> DP)?
   - Deduct points for brute force or mismatching paradigms.
2. Approach Optimality & Strategy Efficiency (0 to 25 pts):
   - How close is the execution of their approach to the theoretical optimal strategy?
   - Does it avoid redundant computations, repeated traversals, or unnecessary state branching?
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
    "summary": string,
    "time_complexity": string,
    "space_complexity": string,
    "explanation": string
  },
  "why_suboptimal": string,
  "why_ideal": string,
  "assessed_difficulty": "Easy" | "Medium" | "Hard",
  "hints": [string, string, string],
  "improvements": [string, string],
  "optimal_code": string
}`;

  const userPrompt = `
Problem: ${metadata.title} (${metadata.difficulty})
Platform: ${metadata.platform}
Language: ${metadata.language}

Problem Description / Summary:
${metadata.description || 'Not provided. Analyze based on standard problem specifications.'}

Student's Submitted Code:
\`\`\`${metadata.language}
${metadata.code || '// Empty code'}
\`\`\`

Evaluate the student's solution focusing on their algorithmic approach and output the JSON.`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: userPrompt }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  };

  // Dynamically discover valid models for this user's API key
  const candidateModels = await resolveBestModel(apiKey, preferredModel);
  let lastErrorMsg = 'Failed to communicate with Gemini API';
  let responseData: any = null;

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        apiKey.trim()
      )}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (res.ok) {
        responseData = await res.json();
        cachedWorkingModel = model;
        console.log(`[AlgoPulse] Successfully evaluated using model: ${model}`);
        break; // Success!
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastErrorMsg = errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
        console.warn(`[AlgoPulse] Model '${model}' failed:`, lastErrorMsg);
        continue;
      }
    } catch (err: any) {
      lastErrorMsg = err.message || 'Network error';
    }
  }

  if (!responseData) {
    throw new Error(lastErrorMsg);
  }

  const rawText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Received an empty response from Gemini API.');
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    parsed = JSON.parse(cleaned);
  }

  // 1. Ensure score is a valid number
  parsed.score = typeof parsed.score === 'number' && !isNaN(parsed.score) ? Math.min(100, Math.max(0, Math.round(parsed.score))) : 70;

  // 2. Ensure scoring_breakdown is an object with valid numbers
  if (!parsed.scoring_breakdown || typeof parsed.scoring_breakdown !== 'object') {
    parsed.scoring_breakdown = {};
  }
  const sb = parsed.scoring_breakdown;
  sb.approach_soundness = typeof sb.approach_soundness === 'number' ? sb.approach_soundness : (typeof sb.optimality === 'number' ? sb.optimality : 28);
  sb.optimality = sb.approach_soundness;
  sb.approach_optimality = typeof sb.approach_optimality === 'number' ? sb.approach_optimality : (typeof sb.time_complexity === 'number' ? sb.time_complexity : 20);
  sb.time_complexity = sb.approach_optimality;
  sb.space_complexity = typeof sb.space_complexity === 'number' ? sb.space_complexity : 18;
  sb.cleanliness = typeof sb.cleanliness === 'number' ? sb.cleanliness : 18;

  // 3. Ensure user_approach is fully formed
  if (!parsed.user_approach || typeof parsed.user_approach !== 'object') {
    parsed.user_approach = {
      name: 'Submitted Approach',
      paradigm: 'General',
      summary: 'Student submitted approach',
      time_complexity: 'O(N)',
      space_complexity: 'O(1)'
    };
  } else {
    parsed.user_approach.name = parsed.user_approach.name || parsed.user_approach.paradigm || 'Submitted Approach';
    parsed.user_approach.paradigm = parsed.user_approach.paradigm || 'General';
    parsed.user_approach.time_complexity = parsed.user_approach.time_complexity || 'O(N)';
    parsed.user_approach.space_complexity = parsed.user_approach.space_complexity || 'O(1)';
    parsed.user_approach.summary = parsed.user_approach.summary || '';
  }

  // 4. Ensure best_approach is fully formed
  if (!parsed.best_approach || typeof parsed.best_approach !== 'object') {
    parsed.best_approach = {
      name: 'Optimal Paradigm',
      paradigm: 'Optimal',
      summary: 'Ideal approach for this problem',
      time_complexity: 'O(N)',
      space_complexity: 'O(1)',
      explanation: 'Optimal time and space complexity strategy.'
    };
  } else {
    parsed.best_approach.name = parsed.best_approach.name || parsed.best_approach.paradigm || 'Optimal Approach';
    parsed.best_approach.paradigm = parsed.best_approach.paradigm || 'Optimal';
    parsed.best_approach.time_complexity = parsed.best_approach.time_complexity || 'O(N)';
    parsed.best_approach.space_complexity = parsed.best_approach.space_complexity || 'O(1)';
    parsed.best_approach.explanation = parsed.best_approach.explanation || parsed.best_approach.summary || 'Optimal time and space complexity strategy.';
  }

  // 5. Ensure hints is ALWAYS an array of 3 strings
  if (Array.isArray(parsed.hints)) {
    parsed.hints = parsed.hints.map((h: any) => (typeof h === 'string' ? h : (h?.hint || h?.text || String(h))));
    while (parsed.hints.length < 3) {
      parsed.hints.push('Analyze the problem constraints and invariants for potential optimizations.');
    }
  } else if (parsed.hints && typeof parsed.hints === 'object') {
    parsed.hints = Object.values(parsed.hints).map((h: any) => (typeof h === 'string' ? h : String(h)));
    while (parsed.hints.length < 3) {
      parsed.hints.push('Analyze the problem constraints and invariants for potential optimizations.');
    }
  } else {
    parsed.hints = [
      'Observe the input bounds and whether elements can be pre-sorted or hashed.',
      'Consider using an auxiliary hash map or two-pointer scan to avoid nested loops.',
      'Maintain running state in a single pass to achieve linear time complexity.'
    ];
  }

  // 6. Ensure improvements is an array of strings
  if (!Array.isArray(parsed.improvements)) {
    parsed.improvements = parsed.improvements ? [String(parsed.improvements)] : [];
  }

  // 7. Ensure optimal_code is a string
  parsed.optimal_code = typeof parsed.optimal_code === 'string' ? parsed.optimal_code : '';

  return parsed as AIAnalysisResult;
}
