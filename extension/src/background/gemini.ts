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
Your job is to objectively analyze a student's code for a coding problem, compare it against the absolute most optimal algorithmic solution, score it using a strict rubric, and output structured JSON.

SCORING RUBRIC (Total 0 to 100):
1. Algorithmic Optimality (0 to 35 pts): Did the user pick the optimal algorithm/data structure? (e.g., O(N) Hashmap vs O(N^2) brute force).
2. Time Complexity (0 to 25 pts): How close is the Big-O time complexity to the theoretical minimum?
3. Space Complexity (0 to 20 pts): Did the user minimize auxiliary memory and unnecessary allocations?
4. Code Cleanliness & Edge Cases (0 to 20 pts): Proper idiomatic syntax, clean variable names, guard clauses, handling edge cases.

Provide:
- Progressive Hints: 3 tiers:
  Tier 1: Subtle observation/nudge.
  Tier 2: Relevant data structure or pattern hint (e.g. "Try using a Hash Map").
  Tier 3: Concrete strategy step without writing the whole code.
- Optimal Code: The cleanest, idiomatic, optimal solution in the user's programming language (${metadata.language}).

You MUST return ONLY valid JSON strictly adhering to this schema:
{
  "score": number,
  "scoring_breakdown": {
    "optimality": number,
    "time_complexity": number,
    "space_complexity": number,
    "cleanliness": number
  },
  "user_approach": {
    "summary": string,
    "time_complexity": string,
    "space_complexity": string
  },
  "best_approach": {
    "summary": string,
    "time_complexity": string,
    "space_complexity": string,
    "explanation": string
  },
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

Analyze the student's code now and output the JSON.`;

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

  try {
    const parsed: AIAnalysisResult = JSON.parse(rawText);
    return parsed;
  } catch (err) {
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as AIAnalysisResult;
  }
}
