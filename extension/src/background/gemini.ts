import { ProblemMetadata, AIAnalysisResult } from '../types';

async function resolveBestModel(apiKey: string): Promise<string[]> {
  const fallbackCandidates = [
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-2.0-flash'
  ];

  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey.trim())}`;
    const res = await fetch(listUrl);
    if (res.ok) {
      const data = await res.json();
      const available = (data.models || [])
        .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => m.name.replace(/^models\//, ''));

      console.log('[AlgoPulse] Available Gemini models for this API key:', available);

      if (available.length > 0) {
        // Prioritize: 3.8-flash > 3.5-flash-lite > other flash > any gemini
        const sorted = [...available].sort((a, b) => {
          if (a.includes('3.8-flash')) return -1;
          if (b.includes('3.8-flash')) return 1;
          if (a.includes('3.5-flash')) return -1;
          if (b.includes('3.5-flash')) return 1;
          if (a.includes('1.5-flash')) return -1;
          if (b.includes('1.5-flash')) return 1;
          if (a.includes('flash') && !b.includes('flash')) return -1;
          if (!a.includes('flash') && b.includes('flash')) return 1;
          return 0;
        });
        return sorted;
      }
    } else {
      console.warn('[AlgoPulse] Could not list models:', res.status, res.statusText);
    }
  } catch (err) {
    console.warn('[AlgoPulse] Error querying model list:', err);
  }

  return fallbackCandidates;
}

export async function analyzeCodeWithGemini(
  metadata: ProblemMetadata,
  apiKey: string
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
  const candidateModels = await resolveBestModel(apiKey);
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

  // Ensure approach-first normalization & aliases
  if (!parsed.scoring_breakdown) {
    parsed.scoring_breakdown = {};
  }
  const sb = parsed.scoring_breakdown;
  sb.approach_soundness = sb.approach_soundness ?? sb.optimality ?? 30;
  sb.optimality = sb.approach_soundness;
  sb.approach_optimality = sb.approach_optimality ?? sb.time_complexity ?? 20;
  sb.time_complexity = sb.approach_optimality;
  sb.space_complexity = sb.space_complexity ?? 18;
  sb.cleanliness = sb.cleanliness ?? 18;

  if (!parsed.user_approach) {
    parsed.user_approach = {
      name: 'Standard Approach',
      paradigm: 'General',
      summary: 'Student submitted approach',
      time_complexity: 'O(N)',
      space_complexity: 'O(1)'
    };
  } else if (!parsed.user_approach.name) {
    parsed.user_approach.name = parsed.user_approach.paradigm || 'Submitted Approach';
  }

  if (!parsed.best_approach) {
    parsed.best_approach = {
      name: 'Optimal Paradigm',
      paradigm: 'Optimal',
      summary: 'Ideal approach for this problem',
      time_complexity: 'O(N)',
      space_complexity: 'O(1)',
      explanation: 'Optimal time and space complexity strategy.'
    };
  } else if (!parsed.best_approach.name) {
    parsed.best_approach.name = parsed.best_approach.paradigm || 'Optimal Approach';
  }

  return parsed as AIAnalysisResult;
}
