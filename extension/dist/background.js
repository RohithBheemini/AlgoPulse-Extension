"use strict";(()=>{var h=null;async function w(s){try{let r=`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(s.trim())}`,c=await fetch(r);if(c.ok){let i=((await c.json()).models||[]).filter(t=>Array.isArray(t.supportedGenerationMethods)&&t.supportedGenerationMethods.includes("generateContent")).map(t=>t.name.replace(/^models\//,"")).filter(t=>!t.includes("embedding")&&!t.includes("aqa")&&!t.includes("imagen"));if(i.length>0)return console.log("[AlgoPulse] Discovered models supporting generateContent from Google:",i),i}else console.warn("[AlgoPulse] ModelService.ListModels returned HTTP",c.status)}catch(r){console.warn("[AlgoPulse] Error querying ModelService.ListModels:",r)}return[]}async function f(s,r="auto"){let c=r&&r!=="auto"&&r.trim().length>0?r.trim():null,m=["gemini-3.7-flash","gemini-3.6-flash","gemini-3.5-flash","gemini-3.8-flash","gemini-2.0-flash","gemini-1.5-flash","gemini-pro"],a=await w(s),t=[...a.length>0?a:m].sort((n,l)=>{if(c){if(n.toLowerCase()===c.toLowerCase())return-1;if(l.toLowerCase()===c.toLowerCase())return 1}if(h){if(n===h)return-1;if(l===h)return 1}let u=n.includes("flash"),e=l.includes("flash");return u&&!e?-1:!u&&e?1:n.includes("2.0")&&!l.includes("2.0")?-1:!n.includes("2.0")&&l.includes("2.0")?1:n.includes("1.5")&&!l.includes("1.5")?-1:!n.includes("1.5")&&l.includes("1.5")?1:l.localeCompare(n,void 0,{numeric:!0})});return c&&!t.includes(c)?[c,...t]:t}async function _(s,r,c="auto"){if(!r||r.trim()==="")throw new Error("Gemini API key is not set. Please open AlgoPulse extension popup and configure your API key.");let m=`You are an elite competitive programmer, algorithm professor, and technical interview reviewer.
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
- Optimal Code: The cleanest, idiomatic, optimal solution in the user's programming language (${s.language}).

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
Problem: ${s.title} (${s.difficulty})
Platform: ${s.platform}
Language: ${s.language}

Problem Description / Summary:
${s.description||"Not provided. Analyze based on standard problem specifications."}

Student's Submitted Code:
\`\`\`${s.language}
${s.code||"// Empty code"}
\`\`\`

Evaluate the student's solution focusing on their algorithmic approach and output the JSON.`}]}],systemInstruction:{parts:[{text:m}]},generationConfig:{temperature:.2,responseMimeType:"application/json"}},t=await f(r,c),n="Failed to communicate with Gemini API",l=null;for(let p of t)try{let d=`https://generativelanguage.googleapis.com/v1beta/models/${p}:generateContent?key=${encodeURIComponent(r.trim())}`,y=await fetch(d,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)});if(y.ok){l=await y.json(),h=p,console.log(`[AlgoPulse] Successfully evaluated using model: ${p}`);break}else{n=(await y.json().catch(()=>({})))?.error?.message||`HTTP ${y.status}: ${y.statusText}`,console.warn(`[AlgoPulse] Model '${p}' failed:`,n);continue}}catch(d){n=d.message||"Network error"}if(!l)throw new Error(n);let u=l?.candidates?.[0]?.content?.parts?.[0]?.text;if(!u)throw new Error("Received an empty response from Gemini API.");let e;try{e=JSON.parse(u)}catch{let d=u.replace(/```json/g,"").replace(/```/g,"").trim();e=JSON.parse(d)}e.score=typeof e.score=="number"&&!isNaN(e.score)?Math.min(100,Math.max(0,Math.round(e.score))):70,(!e.scoring_breakdown||typeof e.scoring_breakdown!="object")&&(e.scoring_breakdown={});let o=e.scoring_breakdown;if(o.approach_soundness=typeof o.approach_soundness=="number"?o.approach_soundness:typeof o.optimality=="number"?o.optimality:28,o.optimality=o.approach_soundness,o.approach_optimality=typeof o.approach_optimality=="number"?o.approach_optimality:typeof o.time_complexity=="number"?o.time_complexity:20,o.time_complexity=o.approach_optimality,o.space_complexity=typeof o.space_complexity=="number"?o.space_complexity:18,o.cleanliness=typeof o.cleanliness=="number"?o.cleanliness:18,!e.user_approach||typeof e.user_approach!="object"?e.user_approach={name:"Submitted Approach",paradigm:"General",summary:"Student submitted approach",time_complexity:"O(N)",space_complexity:"O(1)"}:(e.user_approach.name=e.user_approach.name||e.user_approach.paradigm||"Submitted Approach",e.user_approach.paradigm=e.user_approach.paradigm||"General",e.user_approach.time_complexity=e.user_approach.time_complexity||"O(N)",e.user_approach.space_complexity=e.user_approach.space_complexity||"O(1)",e.user_approach.summary=e.user_approach.summary||""),!e.best_approach||typeof e.best_approach!="object"?e.best_approach={name:"Optimal Paradigm",paradigm:"Optimal",summary:"Ideal approach for this problem",time_complexity:"O(N)",space_complexity:"O(1)",explanation:"Optimal time and space complexity strategy."}:(e.best_approach.name=e.best_approach.name||e.best_approach.paradigm||"Optimal Approach",e.best_approach.paradigm=e.best_approach.paradigm||"Optimal",e.best_approach.time_complexity=e.best_approach.time_complexity||"O(N)",e.best_approach.space_complexity=e.best_approach.space_complexity||"O(1)",e.best_approach.explanation=e.best_approach.explanation||e.best_approach.summary||"Optimal time and space complexity strategy."),Array.isArray(e.hints))for(e.hints=e.hints.map(p=>typeof p=="string"?p:p?.hint||p?.text||String(p));e.hints.length<3;)e.hints.push("Analyze the problem constraints and invariants for potential optimizations.");else if(e.hints&&typeof e.hints=="object")for(e.hints=Object.values(e.hints).map(p=>typeof p=="string"?p:String(p));e.hints.length<3;)e.hints.push("Analyze the problem constraints and invariants for potential optimizations.");else e.hints=["Observe the input bounds and whether elements can be pre-sorted or hashed.","Consider using an auxiliary hash map or two-pointer scan to avoid nested loops.","Maintain running state in a single pass to achieve linear time complexity."];return Array.isArray(e.improvements)||(e.improvements=e.improvements?[String(e.improvements)]:[]),e.optimal_code=typeof e.optimal_code=="string"?e.optimal_code:"",e}var A={geminiApiKey:"",dashboardUrl:"http://localhost:3000",extensionToken:"",autoSync:!0,preferredModel:"auto"};async function g(){let s=await chrome.storage.local.get(["settings"]);return{...A,...s.settings||{}}}async function x(s){let c=(await chrome.storage.local.get(["history"])).history||[],m=[s,...c.filter(a=>a.id!==s.id)].slice(0,50);await chrome.storage.local.set({history:m})}async function b(s,r){if(!r.dashboardUrl||!r.dashboardUrl.trim())return{success:!1,message:"Dashboard URL is not configured."};let c=`${r.dashboardUrl.replace(/\/$/,"")}/api/submissions`;try{let m=await fetch(c,{method:"POST",headers:{"Content-Type":"application/json",...r.extensionToken?{Authorization:`Bearer ${r.extensionToken.trim()}`}:{}},body:JSON.stringify(s)});return m.ok?{success:!0,message:"Successfully synced to dashboard!",data:await m.json()}:{success:!1,message:(await m.json().catch(()=>({}))).error||`Dashboard returned HTTP ${m.status}: ${m.statusText}`}}catch(m){return{success:!1,message:`Failed to connect to dashboard at ${c}: ${m.message||"Network error"}`}}}chrome.runtime.onMessage.addListener((s,r,c)=>((async()=>{try{if(s.type==="GET_SETTINGS")return{success:!0,settings:await g()};if(s.type==="SAVE_SETTINGS")return await chrome.storage.local.set({settings:s.payload}),{success:!0};if(s.type==="TEST_GEMINI_KEY"){let a=s.payload?.apiKey;if(!a)return{success:!1,message:"API key is empty."};let i=await g(),t=await f(a,i.preferredModel||"auto"),n=!1,l="",u="";for(let e of t)try{let o=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${e}:generateContent?key=${encodeURIComponent(a.trim())}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:"Ping"}]}]})});if(o.ok){n=!0,u=e;break}else l=(await o.json().catch(()=>({})))?.error?.message||`HTTP ${o.status}`}catch(o){l=o.message}return n?{success:!0,message:`Connected to Gemini (${u}) successfully!`}:{success:!1,message:l||"Failed to ping Gemini API"}}if(s.type==="TEST_DASHBOARD"){let{url:a,token:i}=s.payload;if(!a)return{success:!1,message:"URL is required."};let t=`${a.replace(/\/$/,"")}/api/health`,n=await fetch(t,{headers:i?{Authorization:`Bearer ${i}`}:{}});return n.ok?{success:!0,message:"Connected to dashboard successfully!"}:{success:!1,message:`Dashboard replied with HTTP ${n.status}`}}if(s.type==="ANALYZE_AND_EVALUATE"){let a=s.payload,i=await g();if(!i.geminiApiKey)return{success:!1,message:"Gemini API key is not configured. Click the AlgoPulse extension icon in your toolbar to configure it."};let t=await _(a,i.geminiApiKey,i.preferredModel||"auto"),n=t.user_approach?.name?`${t.user_approach.name} (${t.user_approach.time_complexity})`:t.user_approach?.time_complexity||"Standard Approach",l=t.best_approach?.name?`${t.best_approach.name} (${t.best_approach.time_complexity})`:t.best_approach?.time_complexity||"Optimal Approach",u={problem_title:a.title,problem_slug:a.slug,platform:a.platform,difficulty:a.difficulty&&a.difficulty!=="Unknown"?a.difficulty:t.assessed_difficulty||"Medium",language:a.language,user_code:a.code,overall_score:t.score,optimality_score:t.scoring_breakdown.optimality,time_score:t.scoring_breakdown.time_complexity,space_score:t.scoring_breakdown.space_complexity,cleanliness_score:t.scoring_breakdown.cleanliness,user_time_complexity:n,user_space_complexity:t.user_approach.space_complexity,optimal_time_complexity:l,optimal_space_complexity:t.best_approach.space_complexity,why_suboptimal:t.why_suboptimal||t.user_approach.summary,why_ideal:t.why_ideal||t.best_approach.explanation,summary_feedback:t.best_approach.explanation,improvements:t.improvements,optimal_code:t.optimal_code,paradigm:t.user_approach?.paradigm||t.best_approach?.paradigm||void 0},e={synced:!1,message:"Auto-sync disabled"};if(i.autoSync&&i.dashboardUrl){let p=await b(u,i);e={synced:p.success,message:p.message}}let o={...u,id:`sub_${Date.now()}`,created_at:new Date().toISOString(),synced:e.synced};return await x(o),{success:!0,result:t,analysis:t,syncStatus:e,syncResult:e}}if(s.type==="SYNC_TO_DASHBOARD"){let a=s.payload,i=await g();return await b(a,i)}return{success:!1,message:`Unknown message type: ${s.type}`}}catch(a){return console.error("[AlgoPulse Background Error]",a),{success:!1,message:a.message||"Internal extension error"}}})().then(c),!0));console.log("[AlgoPulse] Background service worker initialized.");})();
//# sourceMappingURL=background.js.map
