# AlgoPulse VS Code Extension ⚡

> **AI-Powered Algorithmic Code Review & Skill Intelligence Directly in Visual Studio Code**

AlgoPulse brings competitive programming and technical interview intelligence into your local editor. It reviews your algorithmic approach, scores your solution across 4 rigorous pillars, provides 3-tier progressive hints, and automatically synchronizes submissions with your **AlgoPulse Live Dashboard** and **Submission Activity Heatmap**.

---

## ✨ Features

- **100% Free Implementation**: Runs entirely on Google Gemini's generous free tier (`gemini-3.8-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`) via Google AI Studio. No credit cards, paid subscriptions, or server fees.
- **Approach-Based Review**: Rather than just judging raw execution time, AlgoPulse identifies your algorithmic paradigm (e.g., *Sliding Window*, *Two-Pointer Inward Scan*, *Hash Map Single-Pass*) and contrasts it with the optimal approach.
- **4-Pillar Scoring Rubric (0 to 100)**:
  - 🧠 **Algorithmic Optimality (35 pts)**: Paradigm suitability and structural insights.
  - ⏱️ **Time Complexity (25 pts)**: Theoretical Big-O and avoidance of redundant iterations.
  - 💾 **Space Complexity (20 pts)**: Auxiliary memory economy and in-place mutations.
  - 🧹 **Code Cleanliness (20 pts)**: Guard clauses, edge cases, and idiomatic style.
- **Progressive Hints**: Click-to-reveal hints across 3 tiers (Observation ➔ Pattern ➔ Strategy) without spoiling the solution.
- **Optimal Code Reference**: View the clean, optimal solution with 1-click **"Insert in Editor"** or **"Copy Code"**.
- **Real-Time Dashboard Sync**: Submissions automatically synchronize to your running AlgoPulse Next.js dashboard, updating your streaks and 16-week activity heatmap.

---

## 🚀 Quick Setup (3 Minutes)

### 1. Get a Free Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key** (100% free).

### 2. Configure AlgoPulse in VS Code
1. Open the AlgoPulse sidebar by clicking the **AlgoPulse** icon in the Activity Bar (or press `Ctrl+Shift+P` ➔ `AlgoPulse: Configure API Key & Dashboard`).
2. Click **⚙ Settings** in the AlgoPulse sidebar:
   - **Gemini API Key**: Paste your Google AI Studio key (`AIzaSy...`).
   - **Dashboard URL**: `http://localhost:3000` (or your deployed dashboard URL).
   - **Extension Token**: Paste your personal token from your [AlgoPulse Dashboard Profile](http://localhost:3000/profile).
3. Click **Save Configuration**.

---

## ⌨️ How to Use

1. Open any solution file (e.g. `two_sum.py`, `Solution.java`, `main.cpp`, `reverse_list.js`).
2. To analyze:
   - Press **`Ctrl+Alt+A`** (Windows/Linux) or **`Cmd+Alt+A`** (macOS).
   - Or right-click anywhere in the editor ➔ select **AlgoPulse: Analyze Current Code File**.
   - Or click the **$(sparkle)** icon in the editor title bar.
   - Or open the AlgoPulse sidebar panel and click **Analyze Active Code File**.
3. View the 4-pillar scores, Big-O comparison, and unlock progressive hints.
4. Your submission is instantly recorded on your AlgoPulse dashboard heatmap!

---

## 🛠️ Local Development & Testing

To test or modify this extension locally:

```bash
cd vscode-extension
npm install
npm run build
```

Press **`F5`** in VS Code to launch a new **Extension Development Host** window with the AlgoPulse extension preloaded.

---

## 📄 License
MIT License. Built for competitive programmers, computer science students, and technical interview candidates.
