# ⚡ AlgoPulse — AI Code Reviewer & Skill Intelligence Platform

> **An automated pedagogical code review engine for competitive programming platforms (LeetCode) with AI complexity scoring and a real-time analytics web dashboard.**

Built as an academic mini-project engineered with modern, production-grade practices and **100% free-tier technologies** (Google Gemini 2.5 Flash, Next.js 14, React, TypeScript, Manifest V3, and PostgreSQL).

---

## 🎯 Project Overview

When students practice algorithms on LeetCode or HackerRank, typical platforms only give a binary verdict: *Accepted* or *Wrong Answer*. They do **not** teach:
- Whether your $O(N^2)$ solution is sub-optimal compared to the $O(N)$ hash-map or two-pointer approach.
- How your code rates across algorithmic paradigm, time efficiency, space efficiency, and edge-case handling.
- Where your conceptual blind spots are across different algorithmic topics.

**AlgoPulse** bridges this gap:
1. **Chrome Extension (Manifest V3)**: Hooks into LeetCode's Monaco Editor, extracts your code, compares your approach against the theoretical optimal solution using **Gemini 2.5 Flash**, and displays an in-page review drawer with progressive hints.
2. **Real-Time Synchronization**: Seamlessly sends the code, score, and AI benchmark to a hosted web application using a secure Personal Access Token.
3. **Hosted Web Dashboard**: Visualizes your score progression over time, analyzes your strengths/weaknesses across difficulty tiers, and stores a side-by-side code review history.

---

## 🏗️ Architecture & Data Flow

```
                      +---------------------------------------+
                      |       LeetCode Webpage (Browser)       |
                      |  [Monaco Editor]   [Problem Context]  |
                      +---------------------------------------+
                                          |
                        (Direct Model Read via MAIN World)
                                          v
                      +---------------------------------------+
                      |       AlgoPulse Chrome Extension      |
                      |   - In-page Slide-over Drawer UI      |
                      |   - 4-Pillar Rubric Scorer            |
                      |   - Progressive 3-Tier Hint Engine    |
                      +---------------------------------------+
                                  |               |
               (Evaluate Code)    |               |  (Sync Submission)
                                  v               v
                +---------------------+       +-----------------------+
                |  Google Gemini API  |       | AlgoPulse Next.js App |
                | (Gemini 2.5 Flash)  |       |   (API & Dashboard)   |
                +---------------------+       +-----------------------+
                                                          |
                                                          v
                                              +-----------------------+
                                              | Supabase / PostgreSQL |
                                              | (or Local JSON Store) |
                                              +-----------------------+
```

---

## 🌟 Key Features

### 1. In-Browser AI Reviewer (Chrome Extension)
- **Monaco Model Direct Extractor**: Extracts 100% complete code without virtualized DOM scroll truncation.
- **Scientific 4-Pillar Rubric (0 to 100 pts)**:
  - **Algorithmic Optimality (35 pts)**: Paradigms & data structure choices.
  - **Time Complexity (25 pts)**: Big-O distance from theoretical optimal.
  - **Space Complexity (20 pts)**: Auxiliary memory footprint.
  - **Code Quality & Cleanliness (20 pts)**: Guard clauses, edge-case handling, idiomatic conventions.
- **Progressive Hints (Pedagogical Design)**:
  - *Tier 1*: Subtle observation / nudge.
  - *Tier 2*: Algorithmic pattern hint.
  - *Tier 3*: Concrete strategy step.
  *(Avoids spoiling the whole solution right away!)*
- **Optimal Benchmark Snippet**: Shows the clean, optimal reference implementation with 1-click copy.

### 2. Personal Analytics Dashboard (Next.js 14)
- **Score Progression Chart**: Interactive area chart showing your performance trend over time.
- **Difficulty Distribution**: Visual breakdown across Easy, Medium, and Hard problems.
- **Side-by-Side Code Inspector**: Side-by-side view comparing *Your Submitted Code* against the *Optimal Solution*.
- **Personal Extension Token**: Zero-friction authentication between extension and dashboard.

---

## 🛠️ 100% Free Tech Stack

| Layer | Technology | Free Tier Details |
| :--- | :--- | :--- |
| **Extension** | **Vite + React 18 + TypeScript + Tailwind CSS** | Local Chrome Manifest V3 |
| **AI Engine** | **Google Gemini 2.5 Flash** | 100% Free via Google AI Studio (15 RPM, 1M TPM, no credit card required) |
| **Dashboard** | **Next.js 14 (App Router) + Recharts + Lucide** | Free Vercel Hobby tier |
| **Database** | **Supabase (PostgreSQL) + Local JSON Fallback** | Free tier (500MB DB) or built-in local store |

---

## 🚀 Quick Start Guide

### Step 1: Run the Web Dashboard
Open your terminal in `dashboard/`:
```bash
cd dashboard
npm run dev
```
The dashboard will start on `http://localhost:3000`.
Visit `http://localhost:3000/settings` to view your **Extension Access Token**.

*(Note: The dashboard comes preloaded with sample evaluations and automatically saves to local JSON storage `dashboard/data/submissions.json` if Supabase credentials are not provided.)*

---

### Step 2: Load the Chrome Extension
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle on **"Developer mode"** in the top right corner.
3. Click **"Load unpacked"** in the top left corner.
4. Select the folder:
   `c:\Users\Rohith\Downloads\Extension\extension\dist`
5. Click the AlgoPulse icon in your Chrome toolbar:
   - Paste your **Google Gemini API Key** ([Get free key from Google AI Studio](https://aistudio.google.com/app/apikey)).
   - Set Dashboard URL to `http://localhost:3000`.
   - Paste your **Extension Access Token** from `http://localhost:3000/settings`.
   - Click **"Save Configuration"**.

---

### Step 3: Test on LeetCode
1. Open any problem on LeetCode (e.g. `https://leetcode.com/problems/two-sum/`).
2. Write your code in the LeetCode editor.
3. Look at the bottom right corner of the page: click **"⚡ AlgoPulse Review"**.
4. Click **"Analyze Code"**:
   - The drawer will evaluate your solution in ~2 seconds.
   - Shows your Big-O comparison, 4-pillar scores, and suggestions.
   - Automatically syncs the submission to your web dashboard!
5. Refresh `http://localhost:3000` to see your new submission live on the dashboard!

---

## 🎓 Viva / Academic Review Defense Points

When presenting this project to evaluators:
1. **Highlight the Pedagogical Value**: Unlike generic AI cheat tools, AlgoPulse uses a progressive 3-tier hint system and multi-dimensional rubric to foster algorithmic problem solving.
2. **Explain the Monaco Editor Solution**: Evaluators often ask *"How do you scrape code if LeetCode updates its DOM?"*. Answer: *We inject a script into the page's MAIN world execution context to read Monaco Editor's underlying model directly, avoiding virtual DOM truncation.*
3. **Explain Security & Token Model**: The extension uses Bring-Your-Own-Key (BYOK) stored in Chrome's sandboxed `storage.local` and authenticates with the hosted dashboard using secret bearer tokens.
