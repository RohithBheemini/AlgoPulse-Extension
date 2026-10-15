import { AIAnalysisResult } from '../../types';

export function extractAndNormalizeJSON(rawText: string, providerName: string, modelName: string): AIAnalysisResult {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    throw new Error(`Empty response received from ${providerName} (${modelName}).`);
  }

  let parsed: any = null;

  // 1. Direct parse attempt
  try {
    parsed = JSON.parse(rawText.trim());
  } catch (_) {
    // 2. Extract from markdown code fence
    const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        parsed = JSON.parse(codeBlockMatch[1].trim());
      } catch (_) {}
    }

    // 3. Scan for outermost balanced curly braces { ... }
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

  // Sanitize Score
  const scoreVal = typeof parsed.score === 'number' && !isNaN(parsed.score)
    ? Math.min(100, Math.max(0, Math.round(parsed.score)))
    : 70;

  // Sanitize Scoring Breakdown
  const sb = (parsed.scoring_breakdown && typeof parsed.scoring_breakdown === 'object')
    ? parsed.scoring_breakdown
    : {};

  const approachSoundness = typeof sb.approach_soundness === 'number'
    ? sb.approach_soundness
    : (typeof sb.optimality === 'number' ? sb.optimality : 28);

  const approachOptimality = typeof sb.approach_optimality === 'number'
    ? sb.approach_optimality
    : (typeof sb.time_complexity === 'number' ? sb.time_complexity : 20);

  const spaceComplexity = typeof sb.space_complexity === 'number'
    ? sb.space_complexity
    : 18;

  const cleanliness = typeof sb.cleanliness === 'number'
    ? sb.cleanliness
    : 18;

  // Sanitize User Approach
  const userApproach = (parsed.user_approach && typeof parsed.user_approach === 'object')
    ? {
        name: String(parsed.user_approach.name || 'Submitted Approach'),
        paradigm: String(parsed.user_approach.paradigm || 'General'),
        time_complexity: String(parsed.user_approach.time_complexity || 'O(N)'),
        space_complexity: String(parsed.user_approach.space_complexity || 'O(1)'),
        summary: String(parsed.user_approach.summary || 'Approach evaluated.')
      }
    : {
        name: 'Submitted Approach',
        paradigm: 'General',
        time_complexity: 'O(N)',
        space_complexity: 'O(1)',
        summary: 'Approach evaluated.'
      };

  // Sanitize Best Approach
  const bestApproach = (parsed.best_approach && typeof parsed.best_approach === 'object')
    ? {
        name: String(parsed.best_approach.name || 'Optimal Approach'),
        paradigm: String(parsed.best_approach.paradigm || 'Optimal Paradigm'),
        time_complexity: String(parsed.best_approach.time_complexity || 'O(N)'),
        space_complexity: String(parsed.best_approach.space_complexity || 'O(1)'),
        summary: String(parsed.best_approach.summary || 'Theoretical optimal approach.'),
        explanation: String(parsed.best_approach.explanation || 'Optimal algorithmic strategy.')
      }
    : {
        name: 'Optimal Approach',
        paradigm: 'Optimal Paradigm',
        time_complexity: 'O(N)',
        space_complexity: 'O(1)',
        summary: 'Theoretical optimal approach.',
        explanation: 'Optimal algorithmic strategy.'
      };

  // Sanitize Hints
  let hintsArray: [string, string, string] = [
    'Observe the input constraints and search space properties.',
    'Identify if a frequency map or two pointers can eliminate redundant traversals.',
    'Formulate the state transition or recurrence relation.'
  ];

  if (Array.isArray(parsed.hints) && parsed.hints.length >= 3) {
    hintsArray = [
      String(parsed.hints[0] || hintsArray[0]),
      String(parsed.hints[1] || hintsArray[1]),
      String(parsed.hints[2] || hintsArray[2])
    ];
  } else if (parsed.hints && typeof parsed.hints === 'object') {
    // In case model returned object format { tier1_observation, tier2_pattern, tier3_strategy }
    hintsArray = [
      String(parsed.hints.tier1_observation || hintsArray[0]),
      String(parsed.hints.tier2_pattern || hintsArray[1]),
      String(parsed.hints.tier3_strategy || hintsArray[2])
    ];
  }

  // Sanitize Improvements
  const improvements = Array.isArray(parsed.improvements)
    ? parsed.improvements.map((item: any) => String(item))
    : ['Consider reducing auxiliary space allocations.'];

  // Sanitize Optimal Code
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
    hints: hintsArray,
    improvements,
    optimal_code: optimalCode,
    assessed_difficulty: ['Easy', 'Medium', 'Hard'].includes(parsed.assessed_difficulty)
      ? parsed.assessed_difficulty
      : 'Medium',
    provider_used: providerName,
    model_used: modelName
  };
}
