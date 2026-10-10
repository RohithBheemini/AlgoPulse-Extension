import { ProblemMetadata } from '../types';

export function detectPlatform(): 'leetcode' | 'geeksforgeeks' | 'hackerrank' | 'other' {
  const host = window.location.hostname.toLowerCase();
  if (host.includes('leetcode.com')) return 'leetcode';
  if (host.includes('geeksforgeeks.org')) return 'geeksforgeeks';
  if (host.includes('hackerrank.com')) return 'hackerrank';
  return 'other';
}

export async function requestEditorCode(timeoutMs = 1500): Promise<{ code: string; language: string } | null> {
  return new Promise((resolve) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const timer = setTimeout(() => {
      window.removeEventListener('message', handleMessage);
      resolve(null);
    }, timeoutMs);

    function handleMessage(event: MessageEvent) {
      if (
        event.source === window &&
        event.data &&
        event.data.source === 'ALGOPULSE_PAGE' &&
        event.data.type === 'EDITOR_CODE_RESPONSE' &&
        event.data.requestId === requestId
      ) {
        clearTimeout(timer);
        window.removeEventListener('message', handleMessage);
        resolve(event.data.payload);
      }
    }

    window.addEventListener('message', handleMessage);

    window.postMessage(
      {
        source: 'ALGOPULSE_CONTENT',
        type: 'GET_EDITOR_CODE',
        requestId
      },
      '*'
    );
  });
}

function scrapeFallbackCode(): string {
  // 1. Monaco lines container (LeetCode, etc.)
  const monacoLines = document.querySelectorAll('.monaco-editor .view-line');
  if (monacoLines.length > 0) {
    const textArr: string[] = [];
    monacoLines.forEach((line) => {
      textArr.push((line as HTMLElement).innerText || '');
    });
    const joined = textArr.join('\n').trim();
    if (joined) return joined;
  }

  // 2. Ace editor lines (GeeksforGeeks)
  const aceLines = document.querySelectorAll('.ace_editor .ace_line');
  if (aceLines.length > 0) {
    const textArr: string[] = [];
    aceLines.forEach((line) => {
      textArr.push((line as HTMLElement).innerText || '');
    });
    const joined = textArr.join('\n').trim();
    if (joined) return joined;
  }

  // 3. CodeMirror lines (HackerRank, etc.)
  const cmLines = document.querySelectorAll('.CodeMirror-line');
  if (cmLines.length > 0) {
    const textArr: string[] = [];
    cmLines.forEach((line) => {
      textArr.push((line as HTMLElement).innerText || '');
    });
    const joined = textArr.join('\n').trim();
    if (joined) return joined;
  }

  // 4. Any large textarea
  const textareas = document.querySelectorAll('textarea');
  for (const ta of textareas) {
    if (ta.value && ta.value.length > 20) {
      return ta.value;
    }
  }

  return '';
}

export function extractProblemSlug(): string {
  const pathname = window.location.pathname;
  const platform = detectPlatform();

  if (platform === 'leetcode' || platform === 'geeksforgeeks') {
    const match = pathname.match(/\/problems\/([^\/]+)/);
    if (match && match[1]) return match[1];
  } else if (platform === 'hackerrank') {
    const match = pathname.match(/\/challenges\/([^\/]+)/);
    if (match && match[1]) return match[1];
  }

  // Generic fallback
  const segments = pathname.split('/').filter(Boolean);
  return segments[segments.length - 1] || 'unknown-problem';
}

export function extractProblemTitle(): string {
  const platform = detectPlatform();

  if (platform === 'leetcode') {
    const titleSelectors = [
      'div[data-cy="question-title"]',
      'div.text-title-large',
      'a[href*="/problems/"][class*="text-"]',
      'h4[data-cypress="QuestionTitle"]'
    ];
    for (const selector of titleSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent) {
        const cleaned = el.textContent.trim().replace(/^\d+\.\s*/, '');
        if (cleaned) return cleaned;
      }
    }
  } else if (platform === 'geeksforgeeks') {
    const gfgSelectors = [
      '.problems_header_content__h1__L_P2o',
      '.problem-title',
      'h3.problem-title',
      'h1[class*="title"]',
      'h1'
    ];
    for (const sel of gfgSelectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent) {
        const cleaned = el.textContent.trim().replace(/^\d+\.\s*/, '');
        if (cleaned && !cleaned.toLowerCase().includes('practice')) return cleaned;
      }
    }
  } else if (platform === 'hackerrank') {
    const hrSelectors = [
      'h1.ui-icon-label-page',
      'h1.challenge-title',
      'h1.page-label',
      'h1'
    ];
    for (const sel of hrSelectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent) {
        const cleaned = el.textContent.trim();
        if (cleaned) return cleaned;
      }
    }
  }

  // Derive from slug
  const slug = extractProblemSlug();
  if (slug && slug !== 'unknown-problem') {
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return document.title.replace(/(- LeetCode|- GeeksforGeeks|\| HackerRank)/gi, '').trim() || 'Problem';
}

export function extractProblemDifficulty(): 'Easy' | 'Medium' | 'Hard' | 'Unknown' {
  const platform = detectPlatform();

  if (platform === 'geeksforgeeks') {
    const gfgBadges = document.querySelectorAll('.problemDifficulty, [class*="difficulty"], [class*="badge"]');
    for (const el of gfgBadges) {
      const txt = (el.textContent || '').trim().toLowerCase();
      if (txt.includes('school') || txt.includes('basic') || txt.includes('easy')) return 'Easy';
      if (txt.includes('medium')) return 'Medium';
      if (txt.includes('hard')) return 'Hard';
    }
  } else if (platform === 'hackerrank') {
    const hrBadges = document.querySelectorAll('.difficulty-tag, [class*="difficulty"]');
    for (const el of hrBadges) {
      const txt = (el.textContent || '').trim().toLowerCase();
      if (txt.includes('easy')) return 'Easy';
      if (txt.includes('medium')) return 'Medium';
      if (txt.includes('hard')) return 'Hard';
    }
  }

  // LeetCode & General Fallback
  const easyEl = document.querySelector('.text-difficulty-easy, [class*="text-olive"], [class*="text-teal"], [class*="text-green"]');
  const medEl = document.querySelector('.text-difficulty-medium, [class*="text-yellow"], [class*="text-amber"]');
  const hardEl = document.querySelector('.text-difficulty-hard, [class*="text-pink"], [class*="text-red"]');

  if (easyEl && /easy/i.test(easyEl.textContent || '')) return 'Easy';
  if (medEl && /medium/i.test(medEl.textContent || '')) return 'Medium';
  if (hardEl && /hard/i.test(hardEl.textContent || '')) return 'Hard';

  const bodyText = document.body.innerText;
  if (/\b(Basic|School|Easy)\b/i.test(bodyText)) return 'Easy';
  if (/\bMedium\b/i.test(bodyText)) return 'Medium';
  if (/\bHard\b/i.test(bodyText)) return 'Hard';

  return 'Medium';
}

export function extractProblemDescription(): string {
  const descSelectors = [
    '[data-track-load="description_content"]',
    '.elfjS',
    '[class*="description__"]',
    '.problems_problem_content__X21fq',
    '.problem-statement',
    '[class*="problemStatement"]',
    '.challenge-body-html',
    '.challenge_problem_statement'
  ];

  for (const sel of descSelectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent) {
      return el.textContent.slice(0, 3000).trim();
    }
  }
  return '';
}

export function extractLanguage(injectedLang?: string): string {
  if (injectedLang && injectedLang.trim()) {
    const cleaned = injectedLang.trim().toLowerCase();
    if (cleaned.includes('python')) return 'python3';
    if (cleaned.includes('c++') || cleaned.includes('cpp')) return 'cpp';
    if (cleaned.includes('java')) return 'java';
    if (cleaned.includes('javascript') || cleaned.includes('js')) return 'javascript';
    if (cleaned.includes('typescript') || cleaned.includes('ts')) return 'typescript';
    return cleaned;
  }

  // Check language selector buttons/dropdowns
  const langButtons = document.querySelectorAll('button[id*="headlessui-listbox-button"], [class*="select"], [class*="dropdown"], button');
  for (const btn of langButtons) {
    const text = (btn.textContent || '').trim().toLowerCase();
    if (['python', 'python3', 'c++', 'cpp', 'java', 'javascript', 'typescript', 'c#', 'c', 'go', 'rust'].includes(text)) {
      return text === 'python' ? 'python3' : text;
    }
  }

  return 'python3';
}

export async function extractCurrentProblemContext(): Promise<ProblemMetadata> {
  const platform = detectPlatform();
  const slug = extractProblemSlug();
  const title = extractProblemTitle();
  const difficulty = extractProblemDifficulty();
  const description = extractProblemDescription();

  // Try Monaco / Ace / CodeMirror first via injected page script
  const editorData = await requestEditorCode();
  const code = editorData?.code || scrapeFallbackCode();
  const language = extractLanguage(editorData?.language);

  return {
    title,
    slug,
    difficulty,
    language,
    code,
    platform,
    description,
    url: window.location.href
  };
}
