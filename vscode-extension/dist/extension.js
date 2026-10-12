"use strict";var B=Object.create;var v=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var T=Object.getOwnPropertyNames;var P=Object.getPrototypeOf,M=Object.prototype.hasOwnProperty;var O=(n,e)=>{for(var s in e)v(n,s,{get:e[s],enumerable:!0})},C=(n,e,s,p)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of T(e))!M.call(n,t)&&t!==s&&v(n,t,{get:()=>e[t],enumerable:!(p=k(e,t))||p.enumerable});return n};var S=(n,e,s)=>(s=n!=null?B(P(n)):{},C(e||!n||!n.__esModule?v(s,"default",{value:n,enumerable:!0}):s,n)),R=n=>C(v({},"__esModule",{value:!0}),n);var L={};O(L,{activate:()=>D,deactivate:()=>H});module.exports=R(L);var c=S(require("vscode"));var a=S(require("vscode"));var h=null;async function z(n){try{let e=`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(n.trim())}`,s=await fetch(e);if(s.ok){let i=((await s.json()).models||[]).filter(r=>Array.isArray(r.supportedGenerationMethods)&&r.supportedGenerationMethods.includes("generateContent")).map(r=>r.name.replace(/^models\//,"")).filter(r=>!r.includes("embedding")&&!r.includes("aqa")&&!r.includes("imagen"));if(i.length>0)return console.log("[AlgoPulse VSCode] Discovered models supporting generateContent from Google:",i),i}else console.warn("[AlgoPulse VSCode] ModelService.ListModels returned HTTP",s.status)}catch(e){console.warn("[AlgoPulse VSCode] Error querying ModelService.ListModels:",e)}return[]}async function N(n,e="auto"){let s=e&&e!=="auto"&&e.trim().length>0?e.trim():null,p=["gemini-3.7-flash","gemini-3.6-flash","gemini-3.5-flash","gemini-3.8-flash","gemini-2.0-flash","gemini-1.5-flash","gemini-pro"],t=await z(n),r=[...t.length>0?t:p].sort((d,l)=>{if(s){if(d.toLowerCase()===s.toLowerCase())return-1;if(l.toLowerCase()===s.toLowerCase())return 1}if(h){if(d===h)return-1;if(l===h)return 1}let g=d.includes("flash"),u=l.includes("flash");return g&&!u?-1:!g&&u?1:d.includes("2.0")&&!l.includes("2.0")?-1:!d.includes("2.0")&&l.includes("2.0")?1:d.includes("1.5")&&!l.includes("1.5")?-1:!d.includes("1.5")&&l.includes("1.5")?1:l.localeCompare(d,void 0,{numeric:!0})});return s&&!r.includes(s)?[s,...r]:r}async function I(n,e,s="auto"){if(!e||e.trim()==="")throw new Error("Gemini API key is not configured. Please open AlgoPulse settings in VS Code and set your free API key.");let p=`You are an elite competitive programmer, algorithm professor, and technical interview reviewer.
Your primary role is to evaluate a student's code based on their ALGORITHMIC APPROACH and problem-solving strategy, comparing it directly against the theoretical optimal approach.

CORE EVALUATION PRINCIPLE \u2014 EVALUATE BY APPROACH, NOT JUST RAW TIME COMPLEXITY:
- Identify the exact algorithmic approach/paradigm used (e.g., "Brute Force Nested Iteration", "Two-Pointer Inward Scan", "Hash Map Single-Pass Lookup", "Sliding Window", "Dynamic Programming Tabulation", "Greedy with Priority Queue", "Binary Search on Answer").
- Analyze whether the student recognized the problem's underlying mathematical/data structure properties.
- Explain why the user's approach is or isn't optimal, and what paradigm shift is needed.

SCORING RUBRIC (Total 0 to 100):
1. Algorithmic Approach & Paradigm (0 to 35 pts):
   - Right algorithmic paradigm for this problem structure?
   - Recognized key invariants (sorted -> binary search/two pointers; frequency -> hash map; DAG -> topological sort)?
2. Approach Optimality & Strategy Efficiency (0 to 25 pts):
   - How close is the execution of their approach to the theoretical optimal strategy?
   - Avoids redundant computations or repeated traversals?
3. Space Complexity & Memory Strategy (0 to 20 pts):
   - Auxiliary memory economy: in-place mutations vs auxiliary allocations, avoiding unnecessary buffer structures.
4. Code Quality, Cleanliness & Edge Cases (0 to 20 pts):
   - Proper guard clauses, handling edge cases (empty inputs, single elements, duplicates, negative numbers, overflow), and clean idiomatic code.

Provide:
- Progressive Hints: 3 tiers:
  Tier 1: Subtle observation/nudge focusing on problem structure.
  Tier 2: Algorithmic approach / pattern hint (e.g. "Consider using a Hash Map single-pass approach...").
  Tier 3: Concrete strategy step without writing the whole code.
- Optimal Code: The cleanest, idiomatic, optimal solution in the user's programming language (${n.language}).

You MUST return ONLY valid JSON strictly adhering to this schema:
{
  "score": number,
  "scoring_breakdown": {
    "approach_soundness": number,
    "approach_optimality": number,
    "optimality": number,
    "time_complexity": number,
    "space_complexity": number,
    "cleanliness": number
  },
  "user_approach": {
    "name": string,
    "paradigm": string,
    "summary": string,
    "time_complexity": string,
    "space_complexity": string
  },
  "best_approach": {
    "name": string,
    "paradigm": string,
    "time_complexity": string,
    "space_complexity": string,
    "explanation": string
  },
  "why_suboptimal": string,
  "why_ideal": string,
  "hints": {
    "tier1_observation": string,
    "tier2_pattern": string,
    "tier3_strategy": string
  },
  "assessed_difficulty": "Easy" | "Medium" | "Hard",
  "improvements": [string],
  "optimal_code": string
}`,t=`Problem Title: ${n.title}
Difficulty: ${n.difficulty}
Programming Language: ${n.language}
${n.description?`Problem Description: ${n.description.slice(0,1500)}`:""}

Student's Code:
\`\`\`${n.language}
${n.code}
\`\`\`

Evaluate this code now. Focus on ALGORITHMIC APPROACH first, followed by complexity analysis, progressive hints, and optimal code.`,i=await N(e,s),r=null;for(let d of i)try{let l=`https://generativelanguage.googleapis.com/v1beta/models/${d}:generateContent?key=${encodeURIComponent(e.trim())}`,g=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:t}]}],systemInstruction:{parts:[{text:p}]},generationConfig:{temperature:.2,responseMimeType:"application/json"}})});if(!g.ok){let o=(await g.json().catch(()=>({}))).error?.message||`HTTP ${g.status}: ${g.statusText}`;console.warn(`[AlgoPulse VSCode] Model ${d} returned error: ${o}. Trying next model...`),r=new Error(`Model ${d}: ${o}`);continue}let y=(await g.json()).candidates?.[0]?.content?.parts?.[0]?.text;if(!y)throw new Error("Gemini returned an empty response.");let f=y.replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/\s*```$/,"").trim(),m=JSON.parse(f);if(typeof m.score!="number"||!m.scoring_breakdown||!m.hints)throw new Error("Invalid JSON structure from Gemini response.");return m.scoring_breakdown.optimality===void 0&&(m.scoring_breakdown.optimality=m.scoring_breakdown.approach_soundness||30),m.scoring_breakdown.time_complexity===void 0&&(m.scoring_breakdown.time_complexity=m.scoring_breakdown.approach_optimality||20),h=d,console.log(`[AlgoPulse VSCode] Evaluated successfully using model: ${d}`),m.model_used=d,m}catch(l){r=l,console.warn(`[AlgoPulse VSCode] Failed with model ${d}:`,l.message)}throw r||new Error(`AlgoPulse: Failed to analyze code across attempted Gemini models [${i.slice(0,4).join(", ")}]. Please check your API key.`)}async function E(n,e,s){if(!e||!e.trim())return{success:!1,message:"Dashboard URL is not configured."};let p=`${e.replace(/\/$/,"")}/api/submissions`;try{let t=await fetch(p,{method:"POST",headers:{"Content-Type":"application/json",...s&&s.trim()?{Authorization:`Bearer ${s.trim()}`}:{}},body:JSON.stringify(n)});return t.ok?{success:!0,message:"Successfully synced submission to AlgoPulse dashboard!",data:await t.json()}:{success:!1,message:(await t.json().catch(()=>({}))).error||`Dashboard returned HTTP ${t.status}: ${t.statusText}`}}catch(t){return{success:!1,message:`Failed to connect to dashboard at ${p}: ${t.message||"Network error"}`}}}var b=class{constructor(e){this._extensionUri=e}static viewType="algopulse.sidebarView";_view;resolveWebviewView(e,s,p){this._view=e,e.webview.options={enableScripts:!0,localResourceRoots:[this._extensionUri]},e.webview.html=this._getHtmlForWebview(e.webview),e.webview.onDidReceiveMessage(async t=>{switch(t.type){case"ANALYZE_REQUEST":{await a.commands.executeCommand("algopulse.analyzeCode");break}case"OPEN_DASHBOARD":{let r=a.workspace.getConfiguration("algopulse").get("dashboardUrl")||"http://localhost:3000";a.env.openExternal(a.Uri.parse(r));break}case"INSERT_CODE":{let i=a.window.activeTextEditor;i&&t.code&&(await i.edit(r=>{let d=i.selection;if(!d.isEmpty)r.replace(d,t.code);else{let l=new a.Range(i.document.positionAt(0),i.document.positionAt(i.document.getText().length));r.replace(l,t.code)}}),a.window.showInformationMessage("AlgoPulse: Optimal solution inserted into editor!"));break}case"COPY_CODE":{t.code&&(await a.env.clipboard.writeText(t.code),a.window.showInformationMessage("Optimal code copied to clipboard!"));break}case"SAVE_SETTINGS":{let i=a.workspace.getConfiguration("algopulse");t.settings.geminiApiKey!==void 0&&await i.update("geminiApiKey",t.settings.geminiApiKey,a.ConfigurationTarget.Global),t.settings.dashboardUrl!==void 0&&await i.update("dashboardUrl",t.settings.dashboardUrl,a.ConfigurationTarget.Global),t.settings.extensionToken!==void 0&&await i.update("extensionToken",t.settings.extensionToken,a.ConfigurationTarget.Global),t.settings.preferredModel!==void 0&&await i.update("preferredModel",t.settings.preferredModel||"auto",a.ConfigurationTarget.Global),a.window.showInformationMessage("AlgoPulse settings saved successfully!"),this.postMessage({type:"SETTINGS_SAVED"});break}case"GET_INITIAL_DATA":{let i=a.workspace.getConfiguration("algopulse");this.postMessage({type:"INIT_CONFIG",config:{geminiApiKey:i.get("geminiApiKey")||"",dashboardUrl:i.get("dashboardUrl")||"http://localhost:3000",extensionToken:i.get("extensionToken")||"",autoSync:i.get("autoSync")!==!1,preferredModel:i.get("preferredModel")||"auto"}});break}}})}postMessage(e){this._view&&this._view.webview.postMessage(e)}async runAnalysisForEditor(e){this._view||await a.commands.executeCommand("algopulse.sidebarView.focus");let s=e.document,p=e.selection,t=p.isEmpty?s.getText():s.getText(p);if(!t||t.trim().length===0){a.window.showWarningMessage("AlgoPulse: Please open a code file with content to analyze.");return}let r=(s.fileName.split(/[\\/]/).pop()||"Solution").replace(/\.[^/.]+$/,"").replace(/[_-]/g," ").replace(/([A-Z])/g," $1").trim().split(" ").filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1)).join(" ")||"Algorithm Problem",d=s.languageId||"python3",l={title:r,slug:r.toLowerCase().replace(/\s+/g,"-"),difficulty:"Medium",language:d,code:t,platform:"vscode",filePath:s.fileName},g=a.workspace.getConfiguration("algopulse"),u=g.get("geminiApiKey")||"",y=g.get("dashboardUrl")||"http://localhost:3000",f=g.get("extensionToken")||"",m=g.get("autoSync")!==!1,w=g.get("preferredModel")||"auto";if(!u||u.trim()===""){this.postMessage({type:"PROMPT_API_KEY",message:"Please configure your free Gemini API key to begin."});let o=await a.window.showInputBox({title:"AlgoPulse: Gemini API Key Required",prompt:"Enter your free Google Gemini API Key from Google AI Studio",placeHolder:"AIzaSy...",password:!0,ignoreFocusOut:!0});return o&&o.trim()?(await g.update("geminiApiKey",o.trim(),a.ConfigurationTarget.Global),this.runAnalysisForEditor(e)):void 0}this.postMessage({type:"ANALYSIS_STARTED",metadata:l});try{let o=await a.window.withProgress({location:a.ProgressLocation.Notification,title:`AlgoPulse: Analyzing ${l.title}...`,cancellable:!1},async()=>await I(l,u,w)),x={synced:!1,message:"Auto-sync disabled"};if(m&&y){let _={problem_title:l.title,problem_slug:l.slug,platform:"vscode",difficulty:o.assessed_difficulty||l.difficulty||"Medium",language:l.language,user_code:l.code,overall_score:o.score,optimality_score:o.scoring_breakdown.optimality,time_score:o.scoring_breakdown.time_complexity,space_score:o.scoring_breakdown.space_complexity,cleanliness_score:o.scoring_breakdown.cleanliness,user_time_complexity:`${o.user_approach.name} (${o.user_approach.time_complexity})`,user_space_complexity:o.user_approach.space_complexity,optimal_time_complexity:`${o.best_approach.name} (${o.best_approach.time_complexity})`,optimal_space_complexity:o.best_approach.space_complexity,why_suboptimal:o.why_suboptimal||o.user_approach.summary,why_ideal:o.why_ideal||o.best_approach.explanation,summary_feedback:o.best_approach.explanation,improvements:o.improvements||[],optimal_code:o.optimal_code,paradigm:o.user_approach?.paradigm||o.best_approach?.paradigm||void 0},A=await E(_,y,f);x={synced:A.success,message:A.message}}this.postMessage({type:"ANALYSIS_SUCCESS",metadata:l,result:o,syncResult:x}),a.window.showInformationMessage(`AlgoPulse: Score ${o.score}/100 for ${l.title}!${x.synced?" Synced to dashboard.":""}`)}catch(o){this.postMessage({type:"ANALYSIS_ERROR",error:o.message||"Analysis failed"}),a.window.showErrorMessage(`AlgoPulse: ${o.message||"Analysis failed"}`)}}_getHtmlForWebview(e){return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AlgoPulse Reviewer</title>
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --card-border: #30363d;
      --text: #f0f6fc;
      --text-muted: #8b949e;
      --blue: #4285F4;
      --green: #34A853;
      --yellow: #FBBC05;
      --red: #EA4335;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
      font-size: 12px;
      line-height: 1.4;
      padding: 12px;
    }
    .google-bar {
      height: 2px;
      width: 100%;
      background: linear-gradient(90deg, #4285F4 0%, #EA4335 33%, #FBBC05 66%, #34A853 100%);
      margin-bottom: 12px;
      border-radius: 1px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      font-size: 13px;
      color: var(--text);
    }
    .brand-badge {
      background: rgba(66, 133, 244, 0.15);
      color: var(--blue);
      border: 1px solid rgba(66, 133, 244, 0.3);
      padding: 1px 6px;
      border-radius: 10px;
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .btn {
      background: var(--blue);
      color: #fff;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 11px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
    .btn-secondary {
      background: var(--card-bg);
      color: var(--text);
      border: 1px solid var(--card-border);
    }
    .btn-secondary:hover { background: #21262d; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 10px;
    }
    .card-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .score-hero {
      text-align: center;
      padding: 14px 10px;
    }
    .score-num {
      font-size: 36px;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 4px;
    }
    .score-optimal { color: var(--green); }
    .score-medium { color: var(--yellow); }
    .score-suboptimal { color: var(--red); }
    .progress-bar-bg {
      background: #21262d;
      height: 5px;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 3px;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.5s ease;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: var(--text-muted);
      margin-top: 5px;
    }
    .pill {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }
    .pill-green { background: rgba(52, 168, 83, 0.15); color: var(--green); border: 1px solid rgba(52, 168, 83, 0.3); }
    .pill-yellow { background: rgba(251, 188, 5, 0.15); color: var(--yellow); border: 1px solid rgba(251, 188, 5, 0.3); }
    .pill-blue { background: rgba(66, 133, 244, 0.15); color: var(--blue); border: 1px solid rgba(66, 133, 244, 0.3); }
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 6px;
    }
    .comp-box {
      background: #0d1117;
      border: 1px solid var(--card-border);
      padding: 6px;
      border-radius: 6px;
      font-size: 10px;
    }
    .comp-label { color: var(--text-muted); font-size: 9px; text-transform: uppercase; margin-bottom: 2px; }
    .comp-val { font-family: monospace; font-weight: 600; color: var(--text); }
    .hint-item {
      background: #0d1117;
      border: 1px solid var(--card-border);
      border-radius: 6px;
      padding: 8px;
      margin-top: 6px;
    }
    .hint-btn {
      background: transparent;
      border: 1px dashed var(--blue);
      color: var(--blue);
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 10px;
      font-weight: 600;
      width: 100%;
      margin-top: 4px;
    }
    .hint-btn:hover { background: rgba(66, 133, 244, 0.1); }
    .hint-content { font-size: 11px; color: var(--text); margin-top: 4px; display: none; }
    .code-block {
      background: #0d1117;
      border: 1px solid var(--card-border);
      padding: 8px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 10px;
      max-height: 180px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
      margin-top: 6px;
    }
    .drawer {
      display: none;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 10px;
    }
    .input-group {
      margin-bottom: 8px;
    }
    .input-label {
      display: block;
      font-size: 10px;
      color: var(--text-muted);
      margin-bottom: 3px;
      font-weight: 600;
    }
    .input-field {
      width: 100%;
      background: #0d1117;
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 11px;
    }
    .input-field:focus { outline: 1px solid var(--blue); border-color: var(--blue); }
    .sync-status {
      font-size: 10px;
      color: var(--green);
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 6px;
    }
    .spinner {
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top: 2px solid var(--blue);
      border-radius: 50%;
      width: 16px;
      height: 16px;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="google-bar"></div>

  <div class="header">
    <div class="brand">
      <span>AlgoPulse</span>
      <span class="brand-badge">Gemini AI</span>
    </div>
    <div style="display: flex; gap: 4px;">
      <button id="toggleSettingsBtn" class="btn btn-secondary" style="padding: 4px 8px; font-size: 10px; width: auto;">\u2699 Settings</button>
      <button id="openDashboardBtn" class="btn btn-secondary" style="padding: 4px 8px; font-size: 10px; width: auto;">\u{1F4CA} Dashboard</button>
    </div>
  </div>

  <!-- Settings Drawer -->
  <div id="settingsDrawer" class="drawer">
    <div class="card-title">
      <span>Settings & Configuration</span>
      <span style="font-size: 9px; color: var(--green);">Free Gemini Tier</span>
    </div>
    <div class="input-group">
      <label class="input-label">Gemini API Key (Google AI Studio)</label>
      <input type="password" id="apiKeyInput" class="input-field" placeholder="AIzaSy..." />
    </div>
    <div class="input-group">
      <label class="input-label">Dashboard URL</label>
      <input type="text" id="dashboardUrlInput" class="input-field" placeholder="http://localhost:3000" />
    </div>
    <div class="input-group">
      <label class="input-label">Extension Token (from Profile)</label>
      <input type="password" id="tokenInput" class="input-field" placeholder="ap_sec_..." />
    </div>
    <div class="input-group">
      <label class="input-label">Gemini Model (Default: auto)</label>
      <input type="text" id="modelInput" class="input-field" placeholder="auto (or gemini-1.5-flash, gemini-2.0-flash)" />
    </div>
    <button id="saveSettingsBtn" class="btn" style="margin-top: 4px;">Save Configuration</button>
  </div>

  <!-- Primary Analyze CTA -->
  <div style="margin-bottom: 12px;">
    <button id="analyzeBtn" class="btn">
      <span id="btnIcon">\u26A1</span>
      <span id="btnText">Analyze Active Code File</span>
    </button>
  </div>

  <!-- Initial Blank State -->
  <div id="emptyState" class="card" style="text-align: center; padding: 20px 10px; color: var(--text-muted);">
    <div style="font-size: 24px; margin-bottom: 6px;">\u{1F4A1}</div>
    <div style="font-weight: 600; color: var(--text); margin-bottom: 4px;">Ready to Review</div>
    <p style="font-size: 11px;">Open any Python, C++, Java, or JS/TS file and click <strong>Analyze Active Code File</strong> or press <code>Ctrl+Alt+A</code>.</p>
  </div>

  <!-- Loading State -->
  <div id="loadingState" class="card" style="display: none; text-align: center; padding: 24px 10px;">
    <div class="spinner" style="margin-bottom: 8px;"></div>
    <div style="font-weight: 600; color: var(--text);">Evaluating Algorithmic Approach...</div>
    <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Comparing with optimal Big-O & paradigm</div>
  </div>

  <!-- Results View -->
  <div id="resultsView" style="display: none;">
    <!-- Score Hero -->
    <div class="card score-hero">
      <div id="scoreNumber" class="score-num score-optimal">--</div>
      <div style="font-size: 11px; font-weight: 600; color: var(--text-muted);">OVERALL SCORE / 100</div>
      <div id="approachBadge" style="margin-top: 6px;">
        <span class="pill pill-green">Optimal Paradigm</span>
      </div>
      <div id="syncStatusBox" class="sync-status" style="justify-content: center; display: none;">
        <span>\u2713</span> <span id="syncStatusText">Synced to Dashboard Heatmap</span>
      </div>
    </div>

    <!-- 4-Pillar Rubric Breakdown -->
    <div class="card">
      <div class="card-title">
        <span>4-Pillar Rubric Breakdown</span>
      </div>

      <div style="margin-bottom: 8px;">
        <div class="metric-row">
          <span>Algorithmic Optimality</span>
          <span id="optScoreText">-- / 35</span>
        </div>
        <div class="progress-bar-bg">
          <div id="optBar" class="progress-bar-fill" style="width: 0%; background: var(--blue);"></div>
        </div>
      </div>

      <div style="margin-bottom: 8px;">
        <div class="metric-row">
          <span>Time Complexity (Big-O)</span>
          <span id="timeScoreText">-- / 25</span>
        </div>
        <div class="progress-bar-bg">
          <div id="timeBar" class="progress-bar-fill" style="width: 0%; background: var(--green);"></div>
        </div>
      </div>

      <div style="margin-bottom: 8px;">
        <div class="metric-row">
          <span>Space Complexity</span>
          <span id="spaceScoreText">-- / 20</span>
        </div>
        <div class="progress-bar-bg">
          <div id="spaceBar" class="progress-bar-fill" style="width: 0%; background: var(--yellow);"></div>
        </div>
      </div>

      <div>
        <div class="metric-row">
          <span>Code Cleanliness & Style</span>
          <span id="cleanScoreText">-- / 20</span>
        </div>
        <div class="progress-bar-bg">
          <div id="cleanBar" class="progress-bar-fill" style="width: 0%; background: var(--red);"></div>
        </div>
      </div>
    </div>

    <!-- Approach Comparison -->
    <div class="card">
      <div class="card-title">
        <span>Approach Comparison</span>
      </div>
      <div class="comparison-grid">
        <div class="comp-box">
          <div class="comp-label">Your Approach</div>
          <div id="userApproachName" class="comp-val">--</div>
          <div id="userTimeBigO" style="color: var(--text-muted); font-size: 9px; margin-top: 2px;">--</div>
        </div>
        <div class="comp-box">
          <div class="comp-label">Optimal Approach</div>
          <div id="optimalApproachName" class="comp-val" style="color: var(--blue);">--</div>
          <div id="optimalTimeBigO" style="color: var(--text-muted); font-size: 9px; margin-top: 2px;">--</div>
        </div>
      </div>
      <div id="approachSummaryText" style="font-size: 11px; color: var(--text-muted); margin-top: 8px; line-height: 1.4;"></div>
    </div>

    <!-- Progressive Hints -->
    <div class="card">
      <div class="card-title">
        <span>Progressive Hints</span>
        <span style="font-size: 9px; color: var(--yellow);">3 Tiers</span>
      </div>

      <div class="hint-item">
        <div style="font-weight: 600; font-size: 10px; color: var(--text);">Tier 1: Subtle Invariant / Nudge</div>
        <button id="revealHint1Btn" class="hint-btn">Reveal Observation</button>
        <div id="hint1Content" class="hint-content"></div>
      </div>

      <div class="hint-item">
        <div style="font-weight: 600; font-size: 10px; color: var(--text);">Tier 2: Pattern & Data Structure</div>
        <button id="revealHint2Btn" class="hint-btn">Reveal Pattern Hint</button>
        <div id="hint2Content" class="hint-content"></div>
      </div>

      <div class="hint-item">
        <div style="font-weight: 600; font-size: 10px; color: var(--text);">Tier 3: Concrete Strategy</div>
        <button id="revealHint3Btn" class="hint-btn">Reveal Strategy</button>
        <div id="hint3Content" class="hint-content"></div>
      </div>
    </div>

    <!-- Optimal Code Reference -->
    <div class="card">
      <div class="card-title">
        <span>Optimal Reference Code</span>
      </div>
      <div id="optimalCodeBlock" class="code-block"></div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px;">
        <button id="insertCodeBtn" class="btn btn-secondary" style="font-size: 10px; padding: 6px;">\u{1F4E5} Insert in Editor</button>
        <button id="copyCodeBtn" class="btn btn-secondary" style="font-size: 10px; padding: 6px;">\u{1F4CB} Copy Code</button>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    let currentOptimalCode = '';

    // Element references
    const analyzeBtn = document.getElementById('analyzeBtn');
    const openDashboardBtn = document.getElementById('openDashboardBtn');
    const toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
    const settingsDrawer = document.getElementById('settingsDrawer');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');
    const resultsView = document.getElementById('resultsView');

    // Ask for initial config
    vscode.postMessage({ type: 'GET_INITIAL_DATA' });

    analyzeBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'ANALYZE_REQUEST' });
    });

    openDashboardBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'OPEN_DASHBOARD' });
    });

    toggleSettingsBtn.addEventListener('click', () => {
      settingsDrawer.style.display = settingsDrawer.style.display === 'block' ? 'none' : 'block';
    });

    saveSettingsBtn.addEventListener('click', () => {
      const geminiApiKey = document.getElementById('apiKeyInput').value;
      const dashboardUrl = document.getElementById('dashboardUrlInput').value;
      const extensionToken = document.getElementById('tokenInput').value;
      const preferredModel = document.getElementById('modelInput').value || 'auto';
      vscode.postMessage({
        type: 'SAVE_SETTINGS',
        settings: { geminiApiKey, dashboardUrl, extensionToken, preferredModel }
      });
      settingsDrawer.style.display = 'none';
    });

    document.getElementById('insertCodeBtn').addEventListener('click', () => {
      vscode.postMessage({ type: 'INSERT_CODE', code: currentOptimalCode });
    });

    document.getElementById('copyCodeBtn').addEventListener('click', () => {
      vscode.postMessage({ type: 'COPY_CODE', code: currentOptimalCode });
    });

    // Hint toggle logic
    function setupHint(btnId, contentId) {
      const btn = document.getElementById(btnId);
      const content = document.getElementById(contentId);
      btn.addEventListener('click', () => {
        content.style.display = 'block';
        btn.style.display = 'none';
      });
    }
    setupHint('revealHint1Btn', 'hint1Content');
    setupHint('revealHint2Btn', 'hint2Content');
    setupHint('revealHint3Btn', 'hint3Content');

    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.type) {
        case 'INIT_CONFIG': {
          if (message.config) {
            document.getElementById('apiKeyInput').value = message.config.geminiApiKey || '';
            document.getElementById('dashboardUrlInput').value = message.config.dashboardUrl || 'http://localhost:3000';
            document.getElementById('tokenInput').value = message.config.extensionToken || '';
            document.getElementById('modelInput').value = message.config.preferredModel || 'auto';
          }
          break;
        }
        case 'ANALYSIS_STARTED': {
          emptyState.style.display = 'none';
          resultsView.style.display = 'none';
          loadingState.style.display = 'block';
          analyzeBtn.disabled = true;
          document.getElementById('btnText').textContent = 'Analyzing...';
          break;
        }
        case 'ANALYSIS_SUCCESS': {
          loadingState.style.display = 'none';
          resultsView.style.display = 'block';
          analyzeBtn.disabled = false;
          document.getElementById('btnText').textContent = 'Re-Analyze Active Code';

          const res = message.result;
          const score = res.score;
          const scoreEl = document.getElementById('scoreNumber');
          scoreEl.textContent = score;
          scoreEl.className = 'score-num ' + (score >= 80 ? 'score-optimal' : (score >= 50 ? 'score-medium' : 'score-suboptimal'));

          // Pillar scores
          const bd = res.scoring_breakdown;
          document.getElementById('optScoreText').textContent = (bd.optimality || 0) + ' / 35';
          document.getElementById('optBar').style.width = Math.min(100, Math.round(((bd.optimality || 0) / 35) * 100)) + '%';

          document.getElementById('timeScoreText').textContent = (bd.time_complexity || 0) + ' / 25';
          document.getElementById('timeBar').style.width = Math.min(100, Math.round(((bd.time_complexity || 0) / 25) * 100)) + '%';

          document.getElementById('spaceScoreText').textContent = (bd.space_complexity || 0) + ' / 20';
          document.getElementById('spaceBar').style.width = Math.min(100, Math.round(((bd.space_complexity || 0) / 20) * 100)) + '%';

          document.getElementById('cleanScoreText').textContent = (bd.cleanliness || 0) + ' / 20';
          document.getElementById('cleanBar').style.width = Math.min(100, Math.round(((bd.cleanliness || 0) / 20) * 100)) + '%';

          // Approaches
          document.getElementById('userApproachName').textContent = res.user_approach.name || 'Current';
          document.getElementById('userTimeBigO').textContent = res.user_approach.time_complexity || 'O(N)';
          document.getElementById('optimalApproachName').textContent = res.best_approach.name || 'Optimal';
          document.getElementById('optimalTimeBigO').textContent = res.best_approach.time_complexity || 'O(N)';
          document.getElementById('approachSummaryText').textContent = res.why_suboptimal || res.best_approach.explanation || '';

          // Hints reset
          document.getElementById('hint1Content').textContent = res.hints.tier1_observation;
          document.getElementById('hint1Content').style.display = 'none';
          document.getElementById('revealHint1Btn').style.display = 'block';

          document.getElementById('hint2Content').textContent = res.hints.tier2_pattern;
          document.getElementById('hint2Content').style.display = 'none';
          document.getElementById('revealHint2Btn').style.display = 'block';

          document.getElementById('hint3Content').textContent = res.hints.tier3_strategy;
          document.getElementById('hint3Content').style.display = 'none';
          document.getElementById('revealHint3Btn').style.display = 'block';

          // Optimal code
          currentOptimalCode = res.optimal_code || '';
          document.getElementById('optimalCodeBlock').textContent = currentOptimalCode;

          // Sync status
          if (message.syncResult && message.syncResult.synced) {
            document.getElementById('syncStatusBox').style.display = 'flex';
          } else {
            document.getElementById('syncStatusBox').style.display = 'none';
          }
          break;
        }
        case 'ANALYSIS_ERROR': {
          loadingState.style.display = 'none';
          analyzeBtn.disabled = false;
          document.getElementById('btnText').textContent = 'Analyze Active Code File';
          emptyState.style.display = 'block';
          break;
        }
        case 'PROMPT_API_KEY': {
          settingsDrawer.style.display = 'block';
          break;
        }
      }
    });
  </script>
</body>
</html>`}};function D(n){console.log("[AlgoPulse VSCode] Extension activated.");let e=new b(n.extensionUri);n.subscriptions.push(c.window.registerWebviewViewProvider(b.viewType,e,{webviewOptions:{retainContextWhenHidden:!0}}));let s=c.commands.registerCommand("algopulse.analyzeCode",async()=>{let r=c.window.activeTextEditor;if(!r){c.window.showInformationMessage("AlgoPulse: Please open a code file in the editor to analyze.");return}await e.runAnalysisForEditor(r)}),p=c.commands.registerCommand("algopulse.openDashboard",()=>{let d=c.workspace.getConfiguration("algopulse").get("dashboardUrl")||"http://localhost:3000";c.env.openExternal(c.Uri.parse(d))}),t=c.commands.registerCommand("algopulse.configureSettings",()=>{c.commands.executeCommand("workbench.action.openSettings","algopulse")}),i=c.window.createStatusBarItem(c.StatusBarAlignment.Right,100);i.command="algopulse.analyzeCode",i.text="$(sparkle) AlgoPulse",i.tooltip="Analyze Active Code with AlgoPulse (Ctrl+Alt+A)",i.show(),n.subscriptions.push(s,p,t,i)}function H(){console.log("[AlgoPulse VSCode] Extension deactivated.")}0&&(module.exports={activate,deactivate});
//# sourceMappingURL=extension.js.map
