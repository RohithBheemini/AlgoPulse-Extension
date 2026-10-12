"use strict";(()=>{var y=null;async function w(t){try{let r=`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(t.trim())}`,c=await fetch(r);if(c.ok){let i=((await c.json()).models||[]).filter(e=>Array.isArray(e.supportedGenerationMethods)&&e.supportedGenerationMethods.includes("generateContent")).map(e=>e.name.replace(/^models\//,"")).filter(e=>!e.includes("embedding")&&!e.includes("aqa")&&!e.includes("imagen"));if(i.length>0)return console.log("[AlgoPulse] Discovered models supporting generateContent from Google:",i),i}else console.warn("[AlgoPulse] ModelService.ListModels returned HTTP",c.status)}catch(r){console.warn("[AlgoPulse] Error querying ModelService.ListModels:",r)}return[]}async function f(t,r="auto"){let c=r&&r!=="auto"&&r.trim().length>0?r.trim():null,p=["gemini-1.5-flash","gemini-2.0-flash","gemini-2.5-flash","gemini-1.5-pro","gemini-pro"],s=await w(t),e=[...s.length>0?s:p].sort((n,l)=>{if(c){if(n.toLowerCase()===c.toLowerCase())return-1;if(l.toLowerCase()===c.toLowerCase())return 1}if(y){if(n===y)return-1;if(l===y)return 1}let u=n.includes("flash"),a=l.includes("flash");return u&&!a?-1:!u&&a?1:n.includes("2.0")&&!l.includes("2.0")?-1:!n.includes("2.0")&&l.includes("2.0")?1:n.includes("1.5")&&!l.includes("1.5")?-1:!n.includes("1.5")&&l.includes("1.5")?1:l.localeCompare(n,void 0,{numeric:!0})});return c&&!e.includes(c)?[c,...e]:e}async function _(t,r,c="auto"){if(!r||r.trim()==="")throw new Error("Gemini API key is not set. Please open AlgoPulse extension popup and configure your API key.");let p=`You are an elite competitive programmer, algorithm professor, and technical interview reviewer.
Your primary role is to evaluate a student's code based on their ALGORITHMIC APPROACH and problem-solving strategy, comparing it directly against the theoretical optimal approach.

CORE EVALUATION PRINCIPLE \u2014 EVALUATE BY APPROACH, NOT JUST RAW TIME COMPLEXITY:
Instead of only checking raw Big-O numbers, evaluate the algorithmic strategy:
- Identify the exact approach/paradigm used (e.g., "Brute Force Nested Iteration", "Two-Pointer Inward Scan", "Hash Map Single-Pass Lookup", "Sliding Window", "Dynamic Programming Tabulation", "Greedy with Priority Queue", "Binary Search on Answer").
- Analyze whether the student recognized the problem's underlying mathematical/data structure properties.
- Explain why the user's approach is or isn't optimal, and what paradigm shift is needed.

SCORING RUBRIC (Total 0 to 100):
1. Algorithmic Approach & Paradigm (0 to 35 pts):
   - Did the user choose the right algorithmic paradigm for this problem structure?
   - Did they recognize key properties (e.g., sorted array -> two pointers/binary search; frequency lookup -> hash map; overlapping subproblems -> DP)?
   - Deduct points for brute force or mismatching paradigms.
2. Approach Optimality & Strategy Efficiency (0 to 25 pts):
   - How close is the execution of their approach to the theoretical optimal strategy?
   - Does it avoid redundant computations, repeated traversals, or unnecessary state branching?
3. Space Complexity & Memory Strategy (0 to 20 pts):
   - Auxiliary memory economy: in-place mutations vs auxiliary allocations, avoiding unnecessary buffer structures.
4. Code Quality, Cleanliness & Edge Cases (0 to 20 pts):
   - Proper guard clauses, handling edge cases (empty inputs, single elements, duplicates, negative numbers, overflow), and clean idiomatic code.

Provide:
- Progressive Hints: 3 tiers:
  Tier 1: Subtle observation/nudge focusing on problem structure.
  Tier 2: Algorithmic approach / pattern hint (e.g. "Consider using a Hash Map single-pass approach...").
  Tier 3: Concrete strategy step without writing the whole code.
- Optimal Code: The cleanest, idiomatic, optimal solution in the user's programming language (${t.language}).

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
    "summary": string,
    "time_complexity": string,
    "space_complexity": string,
    "explanation": string
  },
  "why_suboptimal": string,
  "why_ideal": string,
  "assessed_difficulty": "Easy" | "Medium" | "Hard",
  "hints": [string, string, string],
  "improvements": [string, string],
  "optimal_code": string
}`,i={contents:[{parts:[{text:`
Problem: ${t.title} (${t.difficulty})
Platform: ${t.platform}
Language: ${t.language}

Problem Description / Summary:
${t.description||"Not provided. Analyze based on standard problem specifications."}

Student's Submitted Code:
\`\`\`${t.language}
${t.code||"// Empty code"}
\`\`\`

Evaluate the student's solution focusing on their algorithmic approach and output the JSON.`}]}],systemInstruction:{parts:[{text:p}]},generationConfig:{temperature:.2,responseMimeType:"application/json"}},e=await f(r,c),n="Failed to communicate with Gemini API",l=null;for(let m of e)try{let d=`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(r.trim())}`,g=await fetch(d,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)});if(g.ok){l=await g.json(),y=m,console.log(`[AlgoPulse] Successfully evaluated using model: ${m}`);break}else{n=(await g.json().catch(()=>({})))?.error?.message||`HTTP ${g.status}: ${g.statusText}`,console.warn(`[AlgoPulse] Model '${m}' failed:`,n);continue}}catch(d){n=d.message||"Network error"}if(!l)throw new Error(n);let u=l?.candidates?.[0]?.content?.parts?.[0]?.text;if(!u)throw new Error("Received an empty response from Gemini API.");let a;try{a=JSON.parse(u)}catch{let d=u.replace(/```json/g,"").replace(/```/g,"").trim();a=JSON.parse(d)}a.scoring_breakdown||(a.scoring_breakdown={});let o=a.scoring_breakdown;return o.approach_soundness=o.approach_soundness??o.optimality??30,o.optimality=o.approach_soundness,o.approach_optimality=o.approach_optimality??o.time_complexity??20,o.time_complexity=o.approach_optimality,o.space_complexity=o.space_complexity??18,o.cleanliness=o.cleanliness??18,a.user_approach?a.user_approach.name||(a.user_approach.name=a.user_approach.paradigm||"Submitted Approach"):a.user_approach={name:"Standard Approach",paradigm:"General",summary:"Student submitted approach",time_complexity:"O(N)",space_complexity:"O(1)"},a.best_approach?a.best_approach.name||(a.best_approach.name=a.best_approach.paradigm||"Optimal Approach"):a.best_approach={name:"Optimal Paradigm",paradigm:"Optimal",summary:"Ideal approach for this problem",time_complexity:"O(N)",space_complexity:"O(1)",explanation:"Optimal time and space complexity strategy."},a}var A={geminiApiKey:"",dashboardUrl:"http://localhost:3000",extensionToken:"",autoSync:!0,preferredModel:"auto"};async function h(){let t=await chrome.storage.local.get(["settings"]);return{...A,...t.settings||{}}}async function S(t){let c=(await chrome.storage.local.get(["history"])).history||[],p=[t,...c.filter(s=>s.id!==t.id)].slice(0,50);await chrome.storage.local.set({history:p})}async function b(t,r){if(!r.dashboardUrl||!r.dashboardUrl.trim())return{success:!1,message:"Dashboard URL is not configured."};let c=`${r.dashboardUrl.replace(/\/$/,"")}/api/submissions`;try{let p=await fetch(c,{method:"POST",headers:{"Content-Type":"application/json",...r.extensionToken?{Authorization:`Bearer ${r.extensionToken.trim()}`}:{}},body:JSON.stringify(t)});return p.ok?{success:!0,message:"Successfully synced to dashboard!",data:await p.json()}:{success:!1,message:(await p.json().catch(()=>({}))).error||`Dashboard returned HTTP ${p.status}: ${p.statusText}`}}catch(p){return{success:!1,message:`Failed to connect to dashboard at ${c}: ${p.message||"Network error"}`}}}chrome.runtime.onMessage.addListener((t,r,c)=>((async()=>{try{if(t.type==="GET_SETTINGS")return{success:!0,settings:await h()};if(t.type==="SAVE_SETTINGS")return await chrome.storage.local.set({settings:t.payload}),{success:!0};if(t.type==="TEST_GEMINI_KEY"){let s=t.payload?.apiKey;if(!s)return{success:!1,message:"API key is empty."};let i=await h(),e=await f(s,i.preferredModel||"auto"),n=!1,l="",u="";for(let a of e)try{let o=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${a}:generateContent?key=${encodeURIComponent(s.trim())}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:"Ping"}]}]})});if(o.ok){n=!0,u=a;break}else l=(await o.json().catch(()=>({})))?.error?.message||`HTTP ${o.status}`}catch(o){l=o.message}return n?{success:!0,message:`Connected to Gemini (${u}) successfully!`}:{success:!1,message:l||"Failed to ping Gemini API"}}if(t.type==="TEST_DASHBOARD"){let{url:s,token:i}=t.payload;if(!s)return{success:!1,message:"URL is required."};let e=`${s.replace(/\/$/,"")}/api/health`,n=await fetch(e,{headers:i?{Authorization:`Bearer ${i}`}:{}});return n.ok?{success:!0,message:"Connected to dashboard successfully!"}:{success:!1,message:`Dashboard replied with HTTP ${n.status}`}}if(t.type==="ANALYZE_AND_EVALUATE"){let s=t.payload,i=await h();if(!i.geminiApiKey)return{success:!1,message:"Gemini API key is not configured. Click the AlgoPulse extension icon in your toolbar to configure it."};let e=await _(s,i.geminiApiKey,i.preferredModel||"auto"),n=e.user_approach?.name?`${e.user_approach.name} (${e.user_approach.time_complexity})`:e.user_approach?.time_complexity||"Standard Approach",l=e.best_approach?.name?`${e.best_approach.name} (${e.best_approach.time_complexity})`:e.best_approach?.time_complexity||"Optimal Approach",u={problem_title:s.title,problem_slug:s.slug,platform:s.platform,difficulty:s.difficulty&&s.difficulty!=="Unknown"?s.difficulty:e.assessed_difficulty||"Medium",language:s.language,user_code:s.code,overall_score:e.score,optimality_score:e.scoring_breakdown.optimality,time_score:e.scoring_breakdown.time_complexity,space_score:e.scoring_breakdown.space_complexity,cleanliness_score:e.scoring_breakdown.cleanliness,user_time_complexity:n,user_space_complexity:e.user_approach.space_complexity,optimal_time_complexity:l,optimal_space_complexity:e.best_approach.space_complexity,why_suboptimal:e.why_suboptimal||e.user_approach.summary,why_ideal:e.why_ideal||e.best_approach.explanation,summary_feedback:e.best_approach.explanation,improvements:e.improvements,optimal_code:e.optimal_code,paradigm:e.user_approach?.paradigm||e.best_approach?.paradigm||void 0},a={synced:!1,message:"Auto-sync disabled"};if(i.autoSync&&i.dashboardUrl){let m=await b(u,i);a={synced:m.success,message:m.message}}let o={...u,id:`sub_${Date.now()}`,created_at:new Date().toISOString(),synced:a.synced};return await S(o),{success:!0,result:e,analysis:e,syncStatus:a,syncResult:a}}if(t.type==="SYNC_TO_DASHBOARD"){let s=t.payload,i=await h();return await b(s,i)}return{success:!1,message:`Unknown message type: ${t.type}`}}catch(s){return console.error("[AlgoPulse Background Error]",s),{success:!1,message:s.message||"Internal extension error"}}})().then(c),!0));console.log("[AlgoPulse] Background service worker initialized.");})();
