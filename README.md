# ⚡ AlgoPulse — AI Code Reviewer & Skill Intelligence Platform

> **An automated pedagogical code review and skill intelligence ecosystem for competitive programming (LeetCode, GeeksforGeeks, HackerRank) and local editor workflows (VS Code), featuring 4-pillar algorithmic evaluation, progressive hints, and a real-time submission heatmap dashboard.**

Built with **100% free-tier technologies** (Google Gemini 3.8 Flash / 2.0 Flash, Next.js 14, React 18, TypeScript, Tailwind CSS, Manifest V3, and VS Code API).

---

## 🎯 The Core Philosophy: Evaluate by Approach, Not Just Execution Time

When developers solve algorithms on LeetCode, GeeksforGeeks, or HackerRank, typical platforms only give a binary verdict: *Accepted* or *Wrong Answer*. They do **not** reveal:
- Whether your $O(N^2)$ solution is sub-optimal compared to the $O(N)$ hash-map, sliding-window, or two-pointer approach.
- How your solution rates across algorithmic paradigm, time efficiency, space efficiency, and edge-case handling.
- Where your conceptual blind spots are across different algorithmic patterns.

**AlgoPulse bridges this gap across the entire coding lifecycle:**
1. **Chrome Extension (Manifest V3)**: Evaluates solutions directly on **LeetCode**, **GeeksforGeeks**, and **HackerRank** using Monaco, Ace Editor, and CodeMirror hooks.
2. **VS Code Extension (Local IDE)**: Reviews your local Python, C++, Java, JS/TS, Go, and Rust files directly from VS Code (`Ctrl+Alt+A`).
3. **Web Analytics Dashboard (Next.js 14)**: Features a **Google-style dynamic lighting welcome page**, **16-week submission activity heatmap**, streak tracking, and multi-platform intelligence metrics.

---

## 🏗️ System Architecture & Data Flow

```
   [LeetCode]           [GeeksforGeeks]         [HackerRank]          [VS Code IDE]
 (Monaco Editor)         (Ace Editor)           (CodeMirror)        (Active File / Selection)
        │                      │                      │                     │
        ▼                      ▼                      ▼                     │
  ┌────────────────────────────────────────────────────────┐                │
  │               AlgoPulse Chrome Extension               │                │
  │     - In-page slide-over review drawer                 │                │
  │     - Universal problem extractor (Slug, Title, Diff)  │                │
  └───────────────────────────┬────────────────────────────┘                │
                              │                                             │
                              │                  ┌──────────────────────────┴─────┐
                              │                  │   AlgoPulse VS Code Extension   │
                              │                  │   - Activity Bar Webview Panel │
                              │                  │   - Ctrl+Alt+A Instant Review  │
                              │                  └────────────────┬───────────────┘
                              │                                   │
                              ├───────────────────────────────────┘
                              │
               (Evaluate Code via HTTPS)
                              ▼
               ┌───────────────────────────────┐
               │    Google Gemini API Engine   │
               │   - gemini-3.8-flash (Primary)│
               │   - gemini-2.0-flash (Fallback│
               │   - gemini-1.5-flash (Fallback│
               │   - 4-Pillar Scoring Rubric   │
               │   - 3-Tier Progressive Hints  │
               └──────────────┬────────────────┘
                              │
               (Real-Time Sync via HTTP POST)
                              ▼
               ┌───────────────────────────────┐
               │     AlgoPulse Web Dashboard   │
               │     (Next.js 14 + Tailwind)   │
               │  - / : Google Dynamic Glow UI │
               │  - /dashboard : 16-Wk Heatmap │
               │  - /submissions : Filter & Log│
               │  - /profile : Token & Stats   │
               └──────────────┬────────────────┘
                              │
                              ▼
               ┌───────────────────────────────┐
               │      Supabase PostgreSQL      │
               │    (with Local JSON Mirror)   │
               └───────────────────────────────┘
```

---

## 🌟 4-Pillar Algorithmic Scoring Rubric (Total 0 to 100)

| Pillar | Weight | Description |
| :--- | :---: | :--- |
| 🧠 **Algorithmic Optimality** | **35 pts** | Evaluates whether you chose the correct algorithmic paradigm (e.g., Two Pointers, Hash Map, DP Tabulation, Monotonic Stack, Binary Search) based on problem invariants. |
| ⏱️ **Time Complexity (Big-O)** | **25 pts** | Distance between user's algorithmic time complexity and theoretical optimal. Penalizes redundant iterations and exponential branching. |
| 💾 **Space Complexity** | **20 pts** | Auxiliary memory efficiency: in-place mutations vs unnecessary heap buffers and auxiliary arrays. |
| 🧹 **Code Cleanliness & Style** | **20 pts** | Guard clauses, handling edge cases (empty inputs, duplicates, integer overflow), and idiomatic conventions. |

### 💡 3-Tier Progressive Hints Engine
- **Tier 1 (Observation)**: Subtle invariant nudge focused on problem structure (e.g., *"Notice that the input array is already sorted"*).
- **Tier 2 (Pattern)**: Suggests the optimal algorithmic pattern or data structure (e.g., *"Consider a single-pass hash map to avoid quadratic lookups"*).
- **Tier 3 (Strategy)**: Detailed concrete roadmap without spoiling the code.

---

## 📡 API Endpoints Reference

All endpoints support CORS and bearer token authentication:

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Health status and service timestamp. |
| `/api/analytics` | `GET` | Aggregated analytics summary, 16-week heatmap data, streaks, and platform distribution. Accepts optional `?userId=<uuid>`. |
| `/api/submissions` | `GET` | Fetches all submissions. Filters by authenticated user session or `?userId=<uuid>`. |
| `/api/submissions` | `POST` | Saves a new evaluated submission from the Chrome or VS Code extension. Supports `Authorization: Bearer <token>`. |
| `/api/auth/profile` | `GET` | Returns authenticated user profile and secret extension token. |

### Sample `POST /api/submissions` Request
```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_extension_token>" \
  -d '{
    "problem_title": "Two Sum",
    "problem_slug": "two-sum",
    "platform": "leetcode",
    "difficulty": "Easy",
    "language": "python3",
    "user_code": "...",
    "overall_score": 95,
    "optimality_score": 35,
    "time_score": 25,
    "space_score": 18,
    "cleanliness_score": 17,
    "user_time_complexity": "Hash Map Single-Pass (O(N))",
    "user_space_complexity": "O(N)",
    "optimal_time_complexity": "Hash Map Single-Pass (O(N))",
    "optimal_space_complexity": "O(N)",
    "why_suboptimal": "Solution is optimal.",
    "why_ideal": "Single pass with O(1) lookups.",
    "summary_feedback": "Excellent approach.",
    "improvements": ["Clean type hints."],
    "optimal_code": "..."
  }'
```

---

## 🛠️ 100% Free Technology Stack

| Component | Technology | Free Tier Details |
| :--- | :--- | :--- |
| **Web Dashboard** | Next.js 14 (App Router), React 18, Tailwind CSS, Recharts | Vercel Hobby / Local Node.js server |
| **Chrome Extension** | Manifest V3, TypeScript, Vite, Monaco/Ace/CodeMirror hooks | 100% Free local browser extension |
| **VS Code Extension** | VS Code Ext API, TypeScript, esbuild, Activity Bar Webview | 100% Free `.vsix` package |
| **AI Evaluation** | Google Gemini (`gemini-3.8-flash`, `2.0-flash`, `1.5-flash`) | 100% Free tier via [Google AI Studio](https://aistudio.google.com/app/apikey) |
| **Database** | Supabase (PostgreSQL) + Local JSON mirroring fallback | 500MB free PostgreSQL + local filesystem persistence |

---

## 🧪 How to Test and Demo (Step-by-Step)

### Demo 1: Run the Next.js Web Dashboard
1. Open terminal in `dashboard/`:
   ```powershell
   cd dashboard
   npm run dev
   ```
2. Open your browser and navigate to:
   - **Welcome / Landing Page**: [http://localhost:3000](http://localhost:3000)
     - Notice the **Google 4-color dynamic ambient lighting** (floating glowing orbs).
     - Test the **interactive demo widget** (toggle between Optimal 100/100 and Brute Force 42/100).
     - Explore the 5-step workflow and click through the **interactive FAQs**.
   - **Analytics & Heatmap Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
     - Observe the **16-Week Submission Heatmap** with Google green levels.
     - Hover over any active cell to see the date and solved problems.
     - View streaks (Current Streak, Longest Streak, Total Active Days).
     - Observe the **"🟢 Live Polling Active"** status badge.
   - **User Profile & Extension Token**: [http://localhost:3000/profile](http://localhost:3000/profile)
     - Copy your secret extension token (`ap_sec_...`).

---

### Demo 2: Test the Chrome Extension (LeetCode / GFG / HackerRank)
1. Build the extension:
   ```powershell
   cd extension
   npm run build
   ```
2. Open Chrome and go to `chrome://extensions/`.
3. Toggle on **Developer mode** (top right) and click **Load unpacked**.
4. Select `c:\Users\Rohith\Downloads\Extension\extension\dist`.
5. Click the **AlgoPulse** icon in your Chrome toolbar:
   - Paste your free **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Set Dashboard URL to `http://localhost:3000`.
   - Paste your **Extension Token** from your Profile page.
   - Click **Save Settings**.
6. Visit a coding problem:
   - **LeetCode**: `https://leetcode.com/problems/two-sum/`
   - **GeeksforGeeks**: `https://www.geeksforgeeks.org/problems/two-sum/`
   - **HackerRank**: `https://www.hackerrank.com/challenges/solve-me-first/`
7. Click the floating **AlgoPulse** widget and click **"Analyze Code"**:
   - The drawer reveals your 4-pillar scores, Big-O comparison, and progressive hints.
   - Switch back to [http://localhost:3000/dashboard](http://localhost:3000/dashboard): the new submission appears **live** without manual page refresh!

---

### Demo 3: Test the VS Code Extension
1. Install the packaged extension into VS Code:
   ```powershell
   code --install-extension "c:\Users\Rohith\Downloads\Extension\vscode-extension\algopulse-vscode-1.0.0.vsix"
   ```
2. Click the **AlgoPulse** lightning icon in the VS Code Activity Bar (left sidebar).
3. In **⚙ Settings**, enter your free Gemini API key and Dashboard URL (`http://localhost:3000`).
4. Open any Python, C++, Java, or JS file (e.g. create a file `solution.py`):
   ```python
   class Solution:
       def twoSum(self, nums, target):
           seen = {}
           for i, n in enumerate(nums):
               if target - n in seen:
                   return [seen[target - n], i]
               seen[n] = i
           return []
   ```
5. Press **`Ctrl+Alt+A`** (or right-click ➔ **"AlgoPulse: Analyze Current Code File"**).
6. View the 4-pillar review, click **"Reveal Observation"** to test progressive hints, or click **"Insert in Editor"** to insert the optimal reference code.
7. Check [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to see your VS Code submission synced to your heatmap!

---

## 🎓 Academic Review & Viva Defense Highlights

1. **Approach Over Raw Big-O**: Algorithmic evaluation focuses on problem invariants, data structure selection, and paradigm recognition rather than just CPU clock cycles.
2. **Multi-Platform AST & Model Hooks**:
   - *LeetCode*: Reads Monaco's underlying model directly in the MAIN execution world.
   - *GeeksforGeeks*: Injects into Ace Editor instances (`window.ace`).
   - *HackerRank*: Interfaces with CodeMirror buffers.
   - *VS Code*: Native TextEditor and document APIs.
3. **Pedagogical Hint Hierarchy**: Progressive 3-tier hints prevent academic dishonesty while guiding students toward conceptual breakthroughs.
4. **Resilient Dual Storage**: Automatically mirrors writes to PostgreSQL (Supabase) and local JSON storage (`dashboard/data/submissions.json`), ensuring offline capability during demos.

---

## 📄 License
MIT License. Created by Rohith Bheemini.
