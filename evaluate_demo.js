// Comprehensive Evaluation & Demo Benchmark Suite for AlgoPulse
// Usage: node evaluate_demo.js [TARGET_URL]
// Default target: http://localhost:3000

const targetUrl = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');

console.log('=================================================================');
console.log(`   AlgoPulse Demo & Working Evaluation Suite                      `);
console.log(`   Target: ${targetUrl}                                          `);
console.log('=================================================================\n');

async function measure(name, fn) {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = Math.round(performance.now() - start);
    console.log(`\x1b[32m[PASS]\x1b[0m ${name} \x1b[90m(${duration}ms)\x1b[0m`);
    return { success: true, duration, data: result };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    console.log(`\x1b[31m[FAIL]\x1b[0m ${name} \x1b[90m(${duration}ms)\x1b[0m: ${err.message}`);
    return { success: false, duration, error: err.message };
  }
}

async function runEvaluation() {
  const results = {};

  // 1. Health & Storage Status
  results.health = await measure('1. API Health & Storage Subsystem', async () => {
    const res = await fetch(`${targetUrl}/api/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.status !== 'ok') throw new Error('Status not ok');
    console.log(`       \x1b[90mVersion: ${json.version} | Storage Mode: ${json.storage.mode} (${json.storage.status})\x1b[0m`);
    return json;
  });

  // 2. CORS Preflight Handshake
  results.cors = await measure('2. CORS Preflight Handshake (OPTIONS)', async () => {
    const res = await fetch(`${targetUrl}/api/submissions`, { method: 'OPTIONS' });
    if (res.status !== 204) throw new Error(`Expected 204, got ${res.status}`);
    const allowOrigin = res.headers.get('access-control-allow-origin');
    const allowMethods = res.headers.get('access-control-allow-methods');
    if (allowOrigin !== '*') throw new Error(`CORS origin header mismatch: ${allowOrigin}`);
    console.log(`       \x1b[90mAllowed Methods: ${allowMethods}\x1b[0m`);
    return { allowOrigin, allowMethods };
  });

  // 3. Landing Page HTTP Response & Assets
  results.home = await measure('3. Welcome Landing Page (/) HTTP Status', async () => {
    const res = await fetch(`${targetUrl}/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.includes('AlgoPulse')) throw new Error('Page missing AlgoPulse branding');
    return { size: text.length };
  });

  // 4. Analytics Aggregation (16-Wk Heatmap & 14-Paradigm Matrix)
  results.analytics = await measure('4. Skill Intelligence & Analytics Engine (/api/analytics)', async () => {
    const res = await fetch(`${targetUrl}/api/analytics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.heatmap || json.heatmap.length !== 112) throw new Error('Heatmap must contain 112 days');
    if (!json.paradigmMatrix || json.paradigmMatrix.length !== 14) throw new Error('Must contain 14 paradigm skills');
    console.log(`       \x1b[90mReadiness: ${json.readinessScore}% | Streaks: ${json.streaks.currentStreak}d active | Reviews Due: ${json.spacedReviewQueue.length}\x1b[0m`);
    return json;
  });

  // 5. Public Verified Portfolio Page (/verify)
  results.verify = await measure('5. Verified Portfolio Transcript Page (/verify)', async () => {
    const res = await fetch(`${targetUrl}/verify`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    if (!html.includes('Public') && !html.includes('Transcript')) throw new Error('Missing verified transcript content');
    return { size: html.length };
  });

  // 6. Cross-Platform Submission Simulation (Simulate LeetCode, GFG, HackerRank, VS Code)
  const platforms = [
    { name: 'LeetCode (Two Sum)', slug: 'two-sum', platform: 'leetcode', diff: 'Easy', score: 96 },
    { name: 'GeeksforGeeks (School/Basic Invariant)', slug: 'gfg-basic-test', platform: 'geeksforgeeks', diff: 'Basic', score: 88 },
    { name: 'HackerRank (Medium Challenge)', slug: 'hr-test', platform: 'hackerrank', diff: 'Medium', score: 82 },
    { name: 'VS Code (Local File)', slug: 'vscode-demo-algo', platform: 'vscode', diff: 'Medium', score: 94 }
  ];

  let createdIds = [];

  for (const p of platforms) {
    results[`post_${p.platform}`] = await measure(`6. Simulate ${p.name} Sync`, async () => {
      const payload = {
        problem_title: `Demo Eval: ${p.name}`,
        problem_slug: p.slug,
        platform: p.platform,
        difficulty: p.diff,
        language: 'python3',
        user_code: 'class Solution:\n    def solve(self): pass',
        overall_score: p.score,
        optimality_score: 35,
        time_score: 25,
        space_score: 18,
        cleanliness_score: 16,
        user_time_complexity: 'O(N)',
        user_space_complexity: 'O(1)',
        optimal_time_complexity: 'O(N)',
        optimal_space_complexity: 'O(1)',
        why_ideal: 'Optimal single pass',
        summary_feedback: 'Demonstration sync payload'
      };

      const res = await fetch(`${targetUrl}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      const json = await res.json();
      if (!json.submission?.id) throw new Error('No submission ID returned');
      createdIds.push(json.submission.id);

      // Verify difficulty normalization
      const expectedDiff = p.diff === 'Basic' ? 'Easy' : p.diff;
      if (json.submission.difficulty !== expectedDiff) {
        throw new Error(`Expected difficulty '${expectedDiff}', got '${json.submission.difficulty}'`);
      }

      console.log(`       \x1b[90mID: ${json.submission.id} | Normalized Diff: ${json.submission.difficulty}\x1b[0m`);
      return json.submission;
    });
  }

  // 7. Cleanup created test submissions
  for (const id of createdIds) {
    await fetch(`${targetUrl}/api/submissions/${id}`, { method: 'DELETE' });
  }

  console.log('\n=================================================================');
  const allPassed = Object.values(results).every(r => r.success);
  if (allPassed) {
    console.log(`\x1b[32m✔ EVALUATION COMPLETE: All tests passed on ${targetUrl}!\x1b[0m`);
  } else {
    console.log(`\x1b[31m✖ EVALUATION FAILED: Some tests failed on ${targetUrl}\x1b[0m`);
  }
  console.log('=================================================================\n');
}

runEvaluation();
