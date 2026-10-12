// Node.js Comprehensive Micro-Level Endpoint Verification Suite for AlgoPulse
const BASE_URL = 'http://localhost:3000';

let passCount = 0;
let failCount = 0;

function assert(name, condition, details = '') {
  if (condition) {
    console.log(`\x1b[32m[PASS]\x1b[0m ${name}`);
    if (details) console.log(`       \x1b[90m${details}\x1b[0m`);
    passCount++;
  } else {
    console.log(`\x1b[31m[FAIL]\x1b[0m ${name}`);
    if (details) console.log(`       \x1b[33m${details}\x1b[0m`);
    failCount++;
  }
}

async function runTests() {
  console.log('\n=================================================================');
  console.log('   AlgoPulse Micro-Level Critical Endpoint Verification Suite   ');
  console.log('=================================================================\n');

  // 1. GET /api/health
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const json = await res.json();
    const hasCors = res.headers.get('access-control-allow-origin') === '*';
    const hasNoStore = (res.headers.get('cache-control') || '').includes('no-store');
    const isOk = res.status === 200 && json.status === 'ok' && json.storage.status === 'healthy';

    assert('1. GET /api/health (200 OK & Storage Diagnostic)', isOk, `Status: ${json.status}, Storage: ${json.storage.status} (${json.storage.mode}), Version: ${json.version}`);
    assert('2. GET /api/health (CORS & Cache-Control Headers)', hasCors && hasNoStore, `CORS: ${res.headers.get('access-control-allow-origin')}, Cache-Control: ${res.headers.get('cache-control')}`);
  } catch (err) {
    assert('1. GET /api/health', false, err.message);
  }

  // 2. OPTIONS /api/health
  try {
    const res = await fetch(`${BASE_URL}/api/health`, { method: 'OPTIONS' });
    const methods = res.headers.get('access-control-allow-methods') || '';
    assert('3. OPTIONS /api/health (204 Preflight & Allowed Methods)', res.status === 204 && methods.includes('GET'), `Status: ${res.status}, Methods: ${methods}`);
  } catch (err) {
    assert('3. OPTIONS /api/health', false, err.message);
  }

  // 3. HEAD /api/health
  try {
    const res = await fetch(`${BASE_URL}/api/health`, { method: 'HEAD' });
    assert('4. HEAD /api/health (200 OK for Uptime Monitors)', res.status === 200, `Status: ${res.status}`);
  } catch (err) {
    assert('4. HEAD /api/health', false, err.message);
  }

  // 4. GET /api/analytics
  try {
    const res = await fetch(`${BASE_URL}/api/analytics`);
    const json = await res.json();
    const hasHeatmap = Array.isArray(json.heatmap) && json.heatmap.length === 112;
    const hasParadigms = Array.isArray(json.paradigmMatrix) && json.paradigmMatrix.length === 14;
    const hasReadiness = typeof json.readinessScore === 'number';
    const hasQueue = Array.isArray(json.spacedReviewQueue);

    assert('5. GET /api/analytics (Full Diagnostic Aggregation)', res.status === 200 && hasHeatmap && hasParadigms && hasReadiness && hasQueue,
      `Total: ${json.totalSubmissions}, Heatmap Days: ${json.heatmap.length}, Paradigms: ${json.paradigmMatrix.length}, Readiness: ${json.readinessScore}%, Spaced Queue: ${json.spacedReviewQueue.length}`);
  } catch (err) {
    assert('5. GET /api/analytics', false, err.message);
  }

  // 5. OPTIONS /api/analytics
  try {
    const res = await fetch(`${BASE_URL}/api/analytics`, { method: 'OPTIONS' });
    const methods = res.headers.get('access-control-allow-methods') || '';
    assert('6. OPTIONS /api/analytics (204 Preflight)', res.status === 204 && methods.includes('GET'), `Methods: ${methods}`);
  } catch (err) {
    assert('6. OPTIONS /api/analytics', false, err.message);
  }

  // 6. GET /api/auth/profile (Unauthenticated fallback)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/profile`);
    const json = await res.json();
    assert('7. GET /api/auth/profile (Unauthenticated Graceful Fallback)', res.status === 200 && json.authenticated === false, `Authenticated: ${json.authenticated}, AuthMethod: ${json.authMethod}`);
  } catch (err) {
    assert('7. GET /api/auth/profile', false, err.message);
  }

  // 7. GET /api/submissions (All & Filter Queries)
  try {
    const res = await fetch(`${BASE_URL}/api/submissions`);
    const json = await res.json();
    assert('8. GET /api/submissions (All Records)', res.status === 200 && Array.isArray(json), `Records returned: ${json.length}`);

    // Query filter: limit=1
    const resLimit = await fetch(`${BASE_URL}/api/submissions?limit=1`);
    const jsonLimit = await resLimit.json();
    assert('9. GET /api/submissions?limit=1', Array.isArray(jsonLimit) && jsonLimit.length === 1, `Records returned: ${jsonLimit.length}`);

    // Query filter: platform=leetcode
    const resPlat = await fetch(`${BASE_URL}/api/submissions?platform=leetcode`);
    const jsonPlat = await resPlat.json();
    const allLeetcode = jsonPlat.every(s => (s.platform || '').toLowerCase().includes('leetcode'));
    assert('10. GET /api/submissions?platform=leetcode', allLeetcode && jsonPlat.length >= 1, `Matching records: ${jsonPlat.length}`);
  } catch (err) {
    assert('8. GET /api/submissions', false, err.message);
  }

  // 8. POST /api/submissions (Malformed JSON Guard)
  try {
    const res = await fetch(`${BASE_URL}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ malformed json: 123'
    });
    const json = await res.json();
    assert('11. POST /api/submissions (Malformed JSON Guard 400)', res.status === 400 && json.error.includes('Invalid JSON'), `Status: ${res.status}, Error: ${json.error}`);
  } catch (err) {
    assert('11. POST /api/submissions malformed', false, err.message);
  }

  // 9. POST /api/submissions (Missing Required Fields Guard)
  try {
    const res = await fetch(`${BASE_URL}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overall_score: 80 })
    });
    const json = await res.json();
    assert('12. POST /api/submissions (Missing Fields Guard 400)', res.status === 400 && json.error.includes('problem_title'), `Status: ${res.status}, Error: ${json.error}`);
  } catch (err) {
    assert('12. POST /api/submissions missing fields', false, err.message);
  }

  // 10. POST /api/submissions (Valid Record + Score Bounds Clamping + Follow-Ups)
  let createdId = null;
  try {
    const payload = {
      problem_title: 'Sliding Window Micro-Test',
      problem_slug: 'sliding-window-test',
      platform: 'leetcode',
      difficulty: 'Medium',
      language: 'python3',
      user_code: 'class Solution:\n    def lengthOfLongestSubstring(self, s):\n        return len(s)',
      overall_score: 185, // Tests clamping to 100
      optimality_score: 34,
      time_score: 25,
      space_score: 20,
      cleanliness_score: 18,
      user_time_complexity: 'Sliding Window (O(N))',
      user_space_complexity: 'O(min(M, N))',
      optimal_time_complexity: 'Sliding Window (O(N))',
      optimal_space_complexity: 'O(min(M, N))',
      why_ideal: 'Direct hash map indexing.',
      summary_feedback: 'Optimal linear scan approach.'
    };

    const res = await fetch(`${BASE_URL}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    createdId = json.submission?.id;
    const clamped = json.submission?.overall_score === 100;
    const hasFollowUps = Array.isArray(json.submission?.follow_up_questions) && json.submission.follow_up_questions.length >= 1;

    assert('13. POST /api/submissions (Valid Creation 201 Created)', res.status === 201 && !!createdId, `ID: ${createdId}`);
    assert('14. POST /api/submissions (Score Clamping 185 -> 100)', clamped, `Overall Score: ${json.submission?.overall_score}`);
    assert('15. POST /api/submissions (Auto Follow-Up Questions Preservation)', hasFollowUps, `Generated: ${json.submission?.follow_up_questions.length} questions`);
  } catch (err) {
    assert('13. POST /api/submissions valid', false, err.message);
  }

  // 11. GET /api/submissions/[id] (Existing Record)
  if (createdId) {
    try {
      const res = await fetch(`${BASE_URL}/api/submissions/${createdId}`);
      const json = await res.json();
      assert('16. GET /api/submissions/[id] (Existing Record 200 OK)', res.status === 200 && json.id === createdId, `Retrieved: ${json.problem_title} (${json.id})`);
    } catch (err) {
      assert('16. GET /api/submissions/[id]', false, err.message);
    }
  }

  // 12. GET /api/submissions/[id] (Non-Existent 404)
  try {
    const res = await fetch(`${BASE_URL}/api/submissions/non_existent_id_99999`);
    const json = await res.json();
    assert('17. GET /api/submissions/[id] (Non-Existent Record 404 Not Found)', res.status === 404 && json.error.includes('not found'), `Status: ${res.status}, Error: ${json.error}`);
  } catch (err) {
    assert('17. GET /api/submissions/[id] 404', false, err.message);
  }

  // 13. DELETE /api/submissions/[id] (Successful Deletion)
  if (createdId) {
    try {
      const res = await fetch(`${BASE_URL}/api/submissions/${createdId}`, { method: 'DELETE' });
      const json = await res.json();
      assert('18. DELETE /api/submissions/[id] (200 OK Success)', res.status === 200 && json.success === true, `Message: ${json.message}`);

      // Verify record is gone (404)
      const resCheck = await fetch(`${BASE_URL}/api/submissions/${createdId}`);
      assert('19. GET /api/submissions/[id] (Post-Delete Verified 404)', resCheck.status === 404, `Post-delete status: ${resCheck.status}`);
    } catch (err) {
      assert('18. DELETE /api/submissions/[id]', false, err.message);
    }
  }

  console.log('\n=================================================================');
  console.log(`TOTAL: Passed: ${passCount} | Failed: ${failCount}`);
  console.log('=================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();
