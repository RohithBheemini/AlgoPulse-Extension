"use strict";(()=>{async function f(t){let c=["gemini-3.8-flash","gemini-3.5-flash-lite","gemini-1.5-flash","gemini-1.5-flash-latest","gemini-2.0-flash"];try{let p=`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(t.trim())}`,n=await fetch(p);if(n.ok){let o=((await n.json()).models||[]).filter(e=>e.supportedGenerationMethods?.includes("generateContent")).map(e=>e.name.replace(/^models\//,""));if(console.log("[AlgoPulse] Available Gemini models for this API key:",o),o.length>0)return[...o].sort((i,l)=>i.includes("3.8-flash")?-1:l.includes("3.8-flash")?1:i.includes("3.5-flash")?-1:l.includes("3.5-flash")?1:i.includes("1.5-flash")?-1:l.includes("1.5-flash")?1:i.includes("flash")&&!l.includes("flash")?-1:!i.includes("flash")&&l.includes("flash")?1:0)}else console.warn("[AlgoPulse] Could not list models:",n.status,n.statusText)}catch(p){console.warn("[AlgoPulse] Error querying model list:",p)}return c}async function g(t,c){if(!c||c.trim()==="")throw new Error("Gemini API key is not set. Please open AlgoPulse extension popup and configure your API key.");let p=`You are an elite competitive programmer, algorithm professor, and technical interview reviewer.
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
  "hints": [string, string, string],
  "improvements": [string, string],
  "optimal_code": string
}`,s={contents:[{parts:[{text:`
Problem: ${t.title} (${t.difficulty})
Platform: ${t.platform}
Language: ${t.language}

Problem Description / Summary:
${t.description||"Not provided. Analyze based on standard problem specifications."}

Student's Submitted Code:
\`\`\`${t.language}
${t.code||"// Empty code"}
\`\`\`

Evaluate the student's solution focusing on their algorithmic approach and output the JSON.`}]}],systemInstruction:{parts:[{text:p}]},generationConfig:{temperature:.2,responseMimeType:"application/json"}},o=await f(c),e="Failed to communicate with Gemini API",i=null;for(let u of o)try{let m=`https://generativelanguage.googleapis.com/v1beta/models/${u}:generateContent?key=${encodeURIComponent(c.trim())}`,d=await fetch(m,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(d.ok){i=await d.json(),console.log(`[AlgoPulse] Successfully evaluated using model: ${u}`);break}else{e=(await d.json().catch(()=>({})))?.error?.message||`HTTP ${d.status}: ${d.statusText}`,console.warn(`[AlgoPulse] Model '${u}' failed:`,e);continue}}catch(m){e=m.message||"Network error"}if(!i)throw new Error(e);let l=i?.candidates?.[0]?.content?.parts?.[0]?.text;if(!l)throw new Error("Received an empty response from Gemini API.");let a;try{a=JSON.parse(l)}catch{let m=l.replace(/```json/g,"").replace(/```/g,"").trim();a=JSON.parse(m)}a.scoring_breakdown||(a.scoring_breakdown={});let r=a.scoring_breakdown;return r.approach_soundness=r.approach_soundness??r.optimality??30,r.optimality=r.approach_soundness,r.approach_optimality=r.approach_optimality??r.time_complexity??20,r.time_complexity=r.approach_optimality,r.space_complexity=r.space_complexity??18,r.cleanliness=r.cleanliness??18,a.user_approach?a.user_approach.name||(a.user_approach.name=a.user_approach.paradigm||"Submitted Approach"):a.user_approach={name:"Standard Approach",paradigm:"General",summary:"Student submitted approach",time_complexity:"O(N)",space_complexity:"O(1)"},a.best_approach?a.best_approach.name||(a.best_approach.name=a.best_approach.paradigm||"Optimal Approach"):a.best_approach={name:"Optimal Paradigm",paradigm:"Optimal",summary:"Ideal approach for this problem",time_complexity:"O(N)",space_complexity:"O(1)",explanation:"Optimal time and space complexity strategy."},a}var _={geminiApiKey:"",dashboardUrl:"http://localhost:3000",extensionToken:"",autoSync:!0};async function y(){let t=await chrome.storage.local.get(["settings"]);return{..._,...t.settings||{}}}async function b(t){let p=(await chrome.storage.local.get(["history"])).history||[],n=[t,...p.filter(s=>s.id!==t.id)].slice(0,50);await chrome.storage.local.set({history:n})}async function h(t,c){if(!c.dashboardUrl||!c.dashboardUrl.trim())return{success:!1,message:"Dashboard URL is not configured."};let p=`${c.dashboardUrl.replace(/\/$/,"")}/api/submissions`;try{let n=await fetch(p,{method:"POST",headers:{"Content-Type":"application/json",...c.extensionToken?{Authorization:`Bearer ${c.extensionToken.trim()}`}:{}},body:JSON.stringify(t)});return n.ok?{success:!0,message:"Successfully synced to dashboard!",data:await n.json()}:{success:!1,message:(await n.json().catch(()=>({}))).error||`Dashboard returned HTTP ${n.status}: ${n.statusText}`}}catch(n){return{success:!1,message:`Failed to connect to dashboard at ${p}: ${n.message||"Network error"}`}}}chrome.runtime.onMessage.addListener((t,c,p)=>((async()=>{try{if(t.type==="GET_SETTINGS")return{success:!0,settings:await y()};if(t.type==="SAVE_SETTINGS")return await chrome.storage.local.set({settings:t.payload}),{success:!0};if(t.type==="TEST_GEMINI_KEY"){let s=t.payload?.apiKey;if(!s)return{success:!1,message:"API key is empty."};let o=["gemini-3.8-flash","gemini-2.0-flash","gemini-1.5-flash"],e=!1,i="";for(let l of o)try{let a=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${l}:generateContent?key=${encodeURIComponent(s.trim())}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:"Ping"}]}]})});if(a.ok){e=!0;break}else i=(await a.json().catch(()=>({})))?.error?.message||`HTTP ${a.status}`}catch(a){i=a.message}return e?{success:!0,message:"Gemini API Key is valid and active!"}:{success:!1,message:i||"Failed to ping Gemini API"}}if(t.type==="TEST_DASHBOARD"){let{url:s,token:o}=t.payload;if(!s)return{success:!1,message:"URL is required."};let e=`${s.replace(/\/$/,"")}/api/health`,i=await fetch(e,{headers:o?{Authorization:`Bearer ${o}`}:{}});return i.ok?{success:!0,message:"Connected to dashboard successfully!"}:{success:!1,message:`Dashboard replied with HTTP ${i.status}`}}if(t.type==="ANALYZE_AND_EVALUATE"){let s=t.payload,o=await y();if(!o.geminiApiKey)return{success:!1,message:"Gemini API key is not configured. Click the AlgoPulse extension icon in your toolbar to configure it."};let e=await g(s,o.geminiApiKey),i=e.user_approach?.name?`${e.user_approach.name} (${e.user_approach.time_complexity})`:e.user_approach?.time_complexity||"Standard Approach",l=e.best_approach?.name?`${e.best_approach.name} (${e.best_approach.time_complexity})`:e.best_approach?.time_complexity||"Optimal Approach",a={problem_title:s.title,problem_slug:s.slug,platform:s.platform,difficulty:s.difficulty,language:s.language,user_code:s.code,overall_score:e.score,optimality_score:e.scoring_breakdown.optimality,time_score:e.scoring_breakdown.time_complexity,space_score:e.scoring_breakdown.space_complexity,cleanliness_score:e.scoring_breakdown.cleanliness,user_time_complexity:i,user_space_complexity:e.user_approach.space_complexity,optimal_time_complexity:l,optimal_space_complexity:e.best_approach.space_complexity,why_suboptimal:e.why_suboptimal||e.user_approach.summary,why_ideal:e.why_ideal||e.best_approach.explanation,summary_feedback:e.best_approach.explanation,improvements:e.improvements,optimal_code:e.optimal_code},r={synced:!1,message:"Auto-sync disabled"};if(o.autoSync&&o.dashboardUrl&&o.extensionToken){let m=await h(a,o);r={synced:m.success,message:m.message}}let u={...a,id:`sub_${Date.now()}`,created_at:new Date().toISOString(),synced:r.synced};return await b(u),{success:!0,result:e,analysis:e,syncStatus:r,syncResult:r}}if(t.type==="SYNC_TO_DASHBOARD"){let s=t.payload,o=await y();return await h(s,o)}return{success:!1,message:`Unknown message type: ${t.type}`}}catch(s){return console.error("[AlgoPulse Background Error]",s),{success:!1,message:s.message||"Internal extension error"}}})().then(p),!0));console.log("[AlgoPulse] Background service worker initialized.");})();
