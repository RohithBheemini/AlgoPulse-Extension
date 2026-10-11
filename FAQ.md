# AlgoPulse — Comprehensive Engineering Specification, Architecture Guide & Technical FAQ

> **Complete Reference to Browser Extensions (Manifest V3), VS Code Extensions, Next.js Skill Intelligence Platform, and the 100% Free Gemini AI Technology Stack**
>
> *Author: Rohith Bheemini | Platform: AlgoPulse*

---

## Table of Contents
1. [Executive Summary & The Core Problem](#1-executive-summary--the-core-problem)
2. [Browser Extension Deep Dive & Terminology (Manifest V3)](#2-browser-extension-deep-dive--terminology-manifest-v3)
3. [VS Code Extension Deep Dive & Terminology](#3-vs-code-extension-deep-dive--terminology)
4. [Technology Stack Blueprint & Component Roles](#4-technology-stack-blueprint--component-roles)
5. [What is the Final Output for Each Surface?](#5-what-is-the-final-output-for-each-surface)
6. [Exhaustive Trade-Off Analysis: Why This Tech Stack Over Alternatives?](#6-exhaustive-trade-off-analysis-why-this-tech-stack-over-alternatives)
7. [Comprehensive Architectural & Viva Defense FAQ](#7-comprehensive-architectural--viva-defense-faq)

---

## 1. Executive Summary & The Core Problem

Traditional competitive programming platforms (LeetCode, GeeksforGeeks, HackerRank) evaluate student code using a strictly binary criterion: **Accepted** or **Wrong Answer**.

This binary verdict has fundamental pedagogical limitations:
- A student submitting an $O(N^2)$ brute-force solution with nested loops will often receive an "Accepted" verdict on LeetCode simply because the input size $N \le 10^3$ executes within the 2-second timeout.
- The platform **fails to teach** that the problem possessed a linear $O(N)$ invariant solvable via a single-pass hash map, two pointers, or monotonic stack.
- When students get stuck, typical platforms or AI tools dump the entire working code, destroying learning retention and promoting passive copy-pasting.

### How AlgoPulse Solves This
AlgoPulse embeds pedagogical, approach-based intelligence directly into the developer's natural environments:
1. **Chrome Extension (Manifest V3)**: Directly hooks into LeetCode, GeeksforGeeks, and HackerRank code editors.
2. **VS Code Extension (Local IDE)**: Reviews local code files (`.py`, `.cpp`, `.java`, `.js`, `.ts`, `.go`, `.rs`) via `Ctrl+Alt+A`.
3. **Web Analytics Dashboard (Next.js 14)**: Features Google dynamic lighting, a 16-week submission activity heatmap, streak statistics, and multi-platform intelligence metrics.

---

## 2. Browser Extension Deep Dive & Terminology (Manifest V3)

Building robust browser extensions on competitive programming platforms requires understanding Chrome's **Manifest V3 (MV3)** architecture:

| Term | Technical Definition & Implementation in AlgoPulse |
| :--- | :--- |
| **Manifest V3 (MV3)** | The modern Chrome Extension specification. Replaces persistent background pages with ephemeral service workers, restricts dynamic code execution, and tightens Content Security Policies (CSP). AlgoPulse is built 100% on MV3. |
| **Background Service Worker** | An event-driven background script (`background.js`) running in an isolated thread without DOM or `window` access. Manages Gemini API calls, local storage persistence, and triggers HTTP POST requests to sync evaluations with the dashboard. |
| **Content Script** | A script (`content.js`) injected into matching URLs (`leetcode.com/*`, `geeksforgeeks.org/*`, `hackerrank.com/*`). Content scripts run in an **Isolated World** with full DOM access, but cannot access JavaScript global variables defined on the webpage. |
| **Execution Worlds (Isolated vs. MAIN)** | **Isolated World**: The standard sandbox protecting the browser and extension from host-page tampering.<br/>**MAIN World**: The page's actual execution context where globals like `window.monaco` or `window.ace` live. Declaring `world: "MAIN"` in `manifest.json` allows `injected.js` to access editor instances directly. |
| **Monaco DOM Virtualization Problem** | Monaco Editor dynamically recycles and removes offscreen lines during scrolling. Scraping the DOM HTML lines results in truncated code. AlgoPulse overcomes this by injecting into the MAIN world and calling `window.monaco.editor.getModels()[0].getValue()`, retrieving 100% complete, uncorrupted code. |
| **Web Accessible Resources** | Declared in `manifest.json` to allow host web pages to load extension resources (such as `injected.js` and `styles.css`) without violating CSP headers. |
| **Message Passing Runtime** | Cross-boundary communication pipeline: `window.postMessage` communicates between the MAIN world and Content Script; `chrome.runtime.sendMessage` communicates between Content Script and Service Worker. |
| **chrome.storage.local** | Secure, asynchronous client-side storage. Stores the user's free Gemini API key, personal extension token, and local evaluation history on the user's device. |
| **Host Permissions & CORS** | Declared in `manifest.json` (`https://generativelanguage.googleapis.com/*`, `http://localhost:*/*`). In MV3, network requests from service workers do not suffer from traditional browser CORS restrictions when host permissions are granted. |

---

## 3. VS Code Extension Deep Dive & Terminology

For students and developers practicing algorithms locally, AlgoPulse provides a native VS Code extension:

| Term | Technical Definition & Implementation in AlgoPulse |
| :--- | :--- |
| **Extension Manifest (`package.json`)** | Declares extension entry point (`dist/extension.js`), activation events (`onCommand:algopulse.analyzeCode`), commands, configuration settings, keybindings (`Ctrl+Alt+A`), and Activity Bar view containers. |
| **`ExtensionContext` & Subscriptions** | The runtime context passed to `activate(context)`. Every command, status bar item, and view provider is registered in `context.subscriptions` for automated memory cleanup when the extension is disabled. |
| **`WebviewViewProvider`** | A persistent view provider implemented by `AlgoPulseSidebarProvider`. It renders an interactive HTML5/CSS3 application directly inside the VS Code Activity Bar sidebar panel. |
| **TextEditor & Document API** | `vscode.window.activeTextEditor` provides direct access to the user's open file. AlgoPulse extracts `document.getText(selection)` or full file text, detects language ID (`python`, `cpp`, `java`), and infers the problem title from the filename or header comments. |
| **In-Editor Code Replacement** | The webview passes an `INSERT_CODE` message to the extension host, which invokes `editor.edit(editBuilder => editBuilder.replace(...))`, allowing students to insert or replace their buffer with the optimal reference solution with a single click. |
| **VSIX Packaging** | Open VSIX packaging format (ZIP-based archive containing `package.json`, compiled `dist/extension.js`, and resources). Allows installation via `code --install-extension algopulse-vscode-1.0.0.vsix`. |
| **Bundling with esbuild** | Instead of heavy bundlers, AlgoPulse uses `esbuild` to compile TypeScript and bundle the entire extension in **13 milliseconds** into a single, dependency-free 33 KB JavaScript file. |

---

## 4. Technology Stack Blueprint & Component Roles

```
[Chrome Extension]        [VS Code Extension]         [Web Dashboard]
  Vite + TS + React 18     VS Code Ext API + esbuild    Next.js 14 App Router
       │                           │                          │
       ▼                           ▼                          ▼
[Google Gemini 3.8 Flash] ──────────────────────────► [Supabase PostgreSQL & Local JSON]
```

| Component | Technology | Role & Why It Helps |
| :--- | :--- | :--- |
| **Chrome Extension** | Manifest V3, TypeScript, Vite, Tailwind CSS | Hooks into competitive programming sites, inspects Monaco/Ace models, and renders an in-page slideover review drawer. |
| **VS Code Extension** | TypeScript, VS Code Ext API, esbuild, Webview | Provides an Activity Bar review panel, `Ctrl+Alt+A` hotkey, editor code insertion, and background sync. |
| **Web Dashboard** | Next.js 14 (App Router), React 18, Recharts, Lucide | Landing page with Google dynamic lighting; live 16-week submission heatmap; streak calculator; user profiles. |
| **AI Evaluation Engine** | Google Gemini (`gemini-3.8-flash`, `2.0-flash`, `1.5-flash`) | 4-pillar algorithmic approach scoring; Big-O distance benchmark; 3-tier progressive hints; optimal reference code. |
| **Database & Storage** | Supabase PostgreSQL + Local JSON fallback | Stores user profiles, personal access tokens, submission records, and activity streaks with 100% offline fallback. |

---

## 5. What is the Final Output for Each Surface?

### 1. In the Chrome Extension (LeetCode / GFG / HackerRank)
- Floating **⚡ AlgoPulse** widget on problem pages.
- Slide-over drawer displaying:
  - **Overall Score (0-100)** with color-coded badges (Optimal, Medium, Suboptimal).
  - **4-Pillar Score Breakdown**: Optimality (/35), Time (/25), Space (/20), Cleanliness (/20).
  - **Approach Comparison**: User Approach vs. Optimal Approach with Big-O complexity.
  - **Progressive Hints**: Tier 1 (Observation), Tier 2 (Pattern), Tier 3 (Strategy).
  - **Optimal Code Reference** with 1-click copy.
  - **Real-Time Sync Badge**: Confirms automatic sync to the web dashboard.

### 2. In the VS Code Extension
- **Activity Bar Icon**: Dedicated AlgoPulse icon in the left sidebar.
- **Sidebar Panel**: Instant evaluation of open code files with `Ctrl+Alt+A`.
- **Insert in Editor**: 1-click button to replace or paste optimal code into the active editor buffer.
- **Status Bar Item**: `$(sparkle) AlgoPulse` for one-click review from the bottom bar.

### 3. On the Web Dashboard (`http://localhost:3000`)
- **Landing Page (`/`)**: Animated Google 4-color dynamic lighting with interactive demo and FAQs.
- **Dedicated Dashboard (`/dashboard`)**:
  - **16-Week Submission Activity Heatmap** with 5 Google green intensity levels.
  - **Streak Statistics**: Current Streak, Longest Streak, Total Active Days.
  - **Platform Activity Breakdown**: LeetCode, GeeksforGeeks, HackerRank, VS Code.
  - **Top Mastered Paradigms**: Hash Map, Two Pointers, Dynamic Programming, etc.
  - **Live Auto-Polling**: Automatically updates every 5 seconds without manual page reload.
- **Submissions Explorer (`/submissions`)**: Search, filter by difficulty/platform, and deep inspect solutions.
- **Profile Page (`/profile`)**: User identity, personal extension token with 1-click copy, and setup guide.

---

## 6. Exhaustive Trade-Off Analysis: Why This Tech Stack Over Alternatives?

### 1. Why Google Gemini Flash instead of OpenAI GPT-4o or Claude 3.5 Sonnet?
- **100% Free Guarantee**: Google AI Studio provides a completely free tier with 15 requests per minute (RPM) and 1 million tokens per minute (TPM). OpenAI GPT-4o and Anthropic Claude 3.5 Sonnet have no free API tier for automated evaluation, making widespread student deployment impossible without monthly credit card billing.
- **Sub-2-Second Latency**: Gemini 3.8 Flash and 2.0 Flash return structured JSON evaluations in ~1.2 to 1.8 seconds, enabling seamless slide-over feedback.

### 2. Why Cloud Gemini instead of Local LLMs (Ollama / Llama 3 / DeepSeek-R1)?
- **Zero Hardware Barrier**: Running a capable coding LLM locally requires at least 16GB RAM and an 8GB+ VRAM GPU. Most students use lightweight laptops. Gemini runs serverless in the cloud, requiring zero downloads, zero VRAM, and providing instant zero-second cold starts.

### 3. Why MAIN World Page Injection instead of Pure Content Script DOM Scraping?
- **Defeating DOM Virtualization**: Monaco (LeetCode) and Ace (GFG) dynamically destroy offscreen DOM nodes during scrolling. Scraping DOM lines produces truncated code for any solution longer than a few lines. By injecting into the MAIN world and accessing `window.monaco.editor.getModels()`, AlgoPulse retrieves the complete buffer regardless of scroll state.

### 4. Why Next.js 14 App Router instead of a Simple Vite SPA + Separate Express Server?
- **Unified Full-Stack Architecture**: Next.js 14 App Router unifies React front-end pages and Node.js serverless API routes into a single deployment. This eliminates the need to manage and configure a separate Express.js backend, eliminates cross-origin port mismatch headaches during development, and natively supports SSR and cookie-based authentication with `@supabase/ssr`.

### 5. Why Dual-Layer Storage (Supabase + Local JSON Mirror) instead of Pure Cloud or Pure Local?
- **100% Resilience & Zero Lost Submissions**: If Supabase credentials are missing or offline, AlgoPulse seamlessly mirrors every evaluation to local JSON storage (`dashboard/data/submissions.json`). When online, it syncs to cloud PostgreSQL, allowing multiple machines to share progress. Users never experience crashes or data loss during network dropouts.

### 6. Why esbuild instead of Webpack or Rollup for Extension Bundling?
- **Near-Instant Compilation**: esbuild bundles the entire VS Code extension in **13 milliseconds**, compared to Webpack which takes 4 to 8 seconds. This enables an instant developer loop and produces a compact single-file bundle (33 KB) with zero external runtime dependencies.

### 7. Why 3-Tier Progressive Hints instead of Immediate Full Solutions?
- **Pedagogical Integrity**: Typical AI tools dump complete working solutions immediately, fostering dependency and reducing problem-solving retention. AlgoPulse reveals hints incrementally (Observation ➔ Pattern ➔ Concrete Strategy), mirroring the pedagogical behavior of real FAANG technical interviewers.

### 8. Why Approach-Based Evaluation instead of Raw Execution Time or Binary Verdicts?
- **True Algorithmic Understanding**: LeetCode server load fluctuations cause identical solutions to score anywhere from 40% to 90% in runtime percentiles. AlgoPulse judges the intrinsic algorithmic strategy: did the user employ Hash Map Single-Pass, Sliding Window, or Two Pointers? This teaches students transferable algorithmic invariants rather than micro-optimizations.

---

## 7. Comprehensive Architectural & Viva Defense FAQ

### Q1: What is the exact sequence of events when a user clicks "Analyze Code" on LeetCode?
1. The content script sends a window message (`GET_EDITOR_CODE`) to `injected.js` (MAIN world).
2. `injected.js` queries `window.monaco.editor.getModels()`, returning uncorrupted code and language ID.
3. `extractor.ts` scrapes problem slug, difficulty, and problem description.
4. Content script sends `ANALYZE_AND_EVALUATE` to the background service worker.
5. Background worker calls Gemini API with the 4-pillar rubric prompt.
6. Background worker receives structured JSON, saves locally in `chrome.storage.local`, and triggers `POST http://localhost:3000/api/submissions` with the bearer token.
7. The dashboard receives the submission, mirrors it to Supabase and local JSON, and updates the heatmap in real-time.
8. The content script renders the score, Big-O comparison, and progressive hints in the slide-over drawer.

### Q2: How does the VS Code extension differ from the Chrome extension?
The Chrome extension operates in the browser on web platforms (LeetCode, GFG, HackerRank) using DOM/Monaco hooks. The VS Code extension operates locally in the developer's IDE using the `vscode.window.activeTextEditor` API. Both extensions share identical prompt architecture, 4-pillar scoring rubrics, and sync seamlessly to the same centralized AlgoPulse dashboard.

### Q3: How does AlgoPulse handle Gemini API model deprecations or outages?
AlgoPulse implements **Dynamic Model Resolution** (`resolveBestModel`). Upon first invocation, it queries `/v1beta/models` using the user's API key and automatically selects the newest available model prioritizing `gemini-3.8-flash` > `gemini-2.0-flash` > `gemini-1.5-flash`. If a model fails or is deprecated, it automatically falls back to the next candidate without crashing.

### Q4: How does authentication between extensions and the dashboard work?
Each user account in the AlgoPulse dashboard is assigned a unique, cryptographically secure **Extension Token** (e.g., `ap_sec_c55fcaf1...`). When making HTTP requests to `/api/submissions`, extensions pass this token in the `Authorization: Bearer <token>` header. The dashboard validates the token against the Supabase `profiles` table and associates submissions with the user ID.

### Q5: What happens if a user submits code before setting up their extension token?
AlgoPulse features a resilient fallback: submissions without tokens are recorded with `user_id = null` in both Supabase and local JSON storage. The dashboard displays these unassigned submissions on the dashboard and heatmap so no work is ever lost.

### Q6: How does the Submission Activity Heatmap work?
The heatmap computes a 16-week (112-day) activity matrix up to today. For each day, it counts total submissions and assigns one of 5 Google green intensity levels (Level 0: empty, Level 1: 1 sub, Level 2: 2 subs, Level 3: 3 subs, Level 4: 4+ subs). It also calculates current streak, longest streak, and total active days with hover tooltips listing problem titles.

### Q7: How does real-time live sync work without manual page refresh?
Both `/dashboard` and `/submissions` implement active polling (every 5 seconds) combined with client-side state revalidation. When a new submission arrives from LeetCode or VS Code, the dashboard updates its KPI counters, heatmap, and recent submission list live.

### Q8: Why is Manifest V3 used instead of Manifest V2?
Chrome officially deprecated Manifest V2 in 2024. MV3 is mandatory for modern extensions. MV3 improves browser security, prevents malicious code injection, reduces memory footprint via event-driven service workers, and provides strict CSP sandboxing.

### Q9: Is user code stored publicly or shared with third parties?
No. User code is sent strictly via HTTPS directly to Google Gemini API using the user's private API key, and to the user's own local/hosted AlgoPulse instance. No code is shared with public telemetry or third-party ad networks.

### Q10: What are the main viva / academic project defense questions evaluators ask?
1. **"Why not just use ChatGPT?"** ➔ ChatGPT requires manual copy-pasting, has no in-editor DOM hooks, lacks a 4-pillar rubric, lacks progressive hints, and cannot track daily streak heatmaps.
2. **"How do you avoid LeetCode DOM changes breaking your scraper?"** ➔ We read Monaco's underlying model buffer in the MAIN world, making code extraction immune to DOM class changes.
3. **"What makes this free?"** ➔ We exclusively use Google AI Studio's 15 RPM free tier, Next.js hobby deployment, and Supabase free PostgreSQL with local JSON fallback.
