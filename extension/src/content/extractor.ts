import { ProblemMetadata } from '../types';

export async function requestMonacoCode(timeoutMs = 1500): Promise<{ code: string; language: string } | null> {
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
  // Fallback 1: Monaco lines container
  const lines = document.querySelectorAll('.monaco-editor .view-line');
  if (lines.length > 0) {
    const textArr: string[] = [];
    lines.forEach((line) => {
      textArr.push((line as HTMLElement).innerText || '');
    });
    const joined = textArr.join('\n').trim();
    if (joined) return joined;
  }

  // Fallback 2: Any active textarea
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
  const match = pathname.match(/\/problems\/([^\/]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return 'unknown-problem';
}

export function extractProblemTitle(): string {
  // Method 1: Look for LeetCode title header element
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

  // Method 2: Derive from slug
  const slug = extractProblemSlug();
  if (slug && slug !== 'unknown-problem') {
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return document.title.replace('- LeetCode', '').trim() || 'Problem';
}

export function extractProblemDifficulty(): 'Easy' | 'Medium' | 'Hard' | 'Unknown' {
  const textContent = document.body.innerText;

  // Check specific difficulty badges first
  const easyEl = document.querySelector('.text-difficulty-easy, [class*="text-olive"], [class*="text-teal"], [class*="text-green"]');
  const medEl = document.querySelector('.text-difficulty-medium, [class*="text-yellow"], [class*="text-amber"]');
  const hardEl = document.querySelector('.text-difficulty-hard, [class*="text-pink"], [class*="text-red"]');

  if (easyEl && /easy/i.test(easyEl.textContent || '')) return 'Easy';
  if (medEl && /medium/i.test(medEl.textContent || '')) return 'Medium';
  if (hardEl && /hard/i.test(hardEl.textContent || '')) return 'Hard';

  // Fallback regex in description container
  const descEl = document.querySelector('[data-track-load="description_content"], [class*="description"]');
  const containerText = descEl?.parentElement?.textContent || '';
  if (/\bEasy\b/.test(containerText)) return 'Easy';
  if (/\bMedium\b/.test(containerText)) return 'Medium';
  if (/\bHard\b/.test(containerText)) return 'Hard';

  return 'Medium'; // default assumption
}

export function extractProblemDescription(): string {
  const descEl = document.querySelector('[data-track-load="description_content"], .elfjS, [class*="description__"]');
  if (descEl && descEl.textContent) {
    return descEl.textContent.slice(0, 3000).trim();
  }
  return '';
}

export function extractLanguage(monacoLang?: string): string {
  if (monacoLang && monacoLang.trim()) {
    return monacoLang.trim();
  }

  // Look for language selector button
  const langButtons = document.querySelectorAll('button[id*="headlessui-listbox-button"], [class*="rounded"]');
  for (const btn of langButtons) {
    const text = (btn.textContent || '').trim().toLowerCase();
    if (['python', 'python3', 'c++', 'cpp', 'java', 'javascript', 'typescript', 'c#', 'c', 'go', 'rust'].includes(text)) {
      return text;
    }
  }

  return 'python3';
}

export async function extractCurrentProblemContext(): Promise<ProblemMetadata> {
  const slug = extractProblemSlug();
  const title = extractProblemTitle();
  const difficulty = extractProblemDifficulty();
  const description = extractProblemDescription();

  // Try Monaco model first via page script
  const monacoData = await requestMonacoCode();
  const code = monacoData?.code || scrapeFallbackCode();
  const language = extractLanguage(monacoData?.language);

  return {
    title,
    slug,
    difficulty,
    language,
    code,
    platform: 'leetcode',
    description,
    url: window.location.href
  };
}
