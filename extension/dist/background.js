"use strict";(()=>{async function g(e){let i=["gemini-3.8-flash","gemini-3.5-flash-lite","gemini-1.5-flash","gemini-1.5-flash-latest","gemini-2.0-flash"];try{let l=`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(e.trim())}`,a=await fetch(l);if(a.ok){let o=((await a.json()).models||[]).filter(t=>t.supportedGenerationMethods?.includes("generateContent")).map(t=>t.name.replace(/^models\//,""));if(console.log("[AlgoPulse] Available Gemini models for this API key:",o),o.length>0)return[...o].sort((n,r)=>n.includes("3.8-flash")?-1:r.includes("3.8-flash")?1:n.includes("3.5-flash")?-1:r.includes("3.5-flash")?1:n.includes("1.5-flash")?-1:r.includes("1.5-flash")?1:n.includes("flash")&&!r.includes("flash")?-1:!n.includes("flash")&&r.includes("flash")?1:0)}else console.warn("[AlgoPulse] Could not list models:",a.status,a.statusText)}catch(l){console.warn("[AlgoPulse] Error querying model list:",l)}return i}async function p(e,i){if(!i||i.trim()==="")throw new Error("Gemini API key is not set. Please open AlgoPulse extension popup and configure your API key.");let l=`You are an elite competitive programmer, algorithm professor, and technical interview reviewer.
Your job is to objectively analyze a student's code for a coding problem, compare it against the absolute most optimal algorithmic solution, score it using a strict rubric, and output structured JSON.

SCORING RUBRIC (Total 0 to 100):
1. Algorithmic Optimality (0 to 35 pts): Did the user pick the optimal algorithm/data structure? (e.g., O(N) Hashmap vs O(N^2) brute force).
2. Time Complexity (0 to 25 pts): How close is the Big-O time complexity to the theoretical minimum?
3. Space Complexity (0 to 20 pts): Did the user minimize auxiliary memory and unnecessary allocations?
4. Code Cleanliness & Edge Cases (0 to 20 pts): Proper idiomatic syntax, clean variable names, guard clauses, handling edge cases.

Provide:
- Progressive Hints: 3 tiers:
  Tier 1: Subtle observation/nudge.
  Tier 2: Relevant data structure or pattern hint (e.g. "Try using a Hash Map").
  Tier 3: Concrete strategy step without writing the whole code.
- Optimal Code: The cleanest, idiomatic, optimal solution in the user's programming language (${e.language}).

You MUST return ONLY valid JSON strictly adhering to this schema:
{
  "score": number,
  "scoring_breakdown": {
    "optimality": number,
    "time_complexity": number,
    "space_complexity": number,
    "cleanliness": number
  },
  "user_approach": {
    "summary": string,
    "time_complexity": string,
    "space_complexity": string
  },
  "best_approach": {
    "summary": string,
    "time_complexity": string,
    "space_complexity": string,
    "explanation": string
  },
  "hints": [string, string, string],
  "improvements": [string, string],
  "optimal_code": string
}`,s={contents:[{parts:[{text:`
Problem: ${e.title} (${e.difficulty})
Platform: ${e.platform}
Language: ${e.language}

Problem Description / Summary:
${e.description||"Not provided. Analyze based on standard problem specifications."}

Student's Submitted Code:
\`\`\`${e.language}
${e.code||"// Empty code"}
\`\`\`

Analyze the student's code now and output the JSON.`}]}],systemInstruction:{parts:[{text:l}]},generationConfig:{temperature:.2,responseMimeType:"application/json"}},o=await g(i),t="Failed to communicate with Gemini API",n=null;for(let c of o)try{let u=`https://generativelanguage.googleapis.com/v1beta/models/${c}:generateContent?key=${encodeURIComponent(i.trim())}`,m=await fetch(u,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(m.ok){n=await m.json(),console.log(`[AlgoPulse] Successfully evaluated using model: ${c}`);break}else{t=(await m.json().catch(()=>({})))?.error?.message||`HTTP ${m.status}: ${m.statusText}`,console.warn(`[AlgoPulse] Model '${c}' failed:`,t);continue}}catch(u){t=u.message||"Network error"}if(!n)throw new Error(t);let r=n?.candidates?.[0]?.content?.parts?.[0]?.text;if(!r)throw new Error("Received an empty response from Gemini API.");try{return JSON.parse(r)}catch{let u=r.replace(/```json/g,"").replace(/```/g,"").trim();return JSON.parse(u)}}var h={geminiApiKey:"",dashboardUrl:"http://localhost:3000",extensionToken:"",autoSync:!0};async function d(){let e=await chrome.storage.local.get(["settings"]);return{...h,...e.settings||{}}}async function f(e){let l=(await chrome.storage.local.get(["history"])).history||[],a=[e,...l.filter(s=>s.id!==e.id)].slice(0,50);await chrome.storage.local.set({history:a})}async function y(e,i){if(!i.dashboardUrl||!i.dashboardUrl.trim())return{success:!1,message:"Dashboard URL is not configured."};let l=`${i.dashboardUrl.replace(/\/$/,"")}/api/submissions`;try{let a=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json",...i.extensionToken?{Authorization:`Bearer ${i.extensionToken.trim()}`}:{}},body:JSON.stringify(e)});return a.ok?{success:!0,message:"Successfully synced to dashboard!",data:await a.json()}:{success:!1,message:(await a.json().catch(()=>({}))).error||`Dashboard returned HTTP ${a.status}: ${a.statusText}`}}catch(a){return{success:!1,message:`Failed to connect to dashboard at ${l}: ${a.message||"Network error"}`}}}chrome.runtime.onMessage.addListener((e,i,l)=>((async()=>{try{if(e.type==="GET_SETTINGS")return{success:!0,settings:await d()};if(e.type==="SAVE_SETTINGS")return await chrome.storage.local.set({settings:e.payload}),{success:!0};if(e.type==="TEST_GEMINI_KEY"){let s=e.payload?.apiKey;if(!s)return{success:!1,message:"API key is empty."};let o=["gemini-3.8-flash","gemini-2.0-flash","gemini-1.5-flash"],t=!1,n="";for(let r of o)try{let c=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${r}:generateContent?key=${encodeURIComponent(s.trim())}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:"Ping"}]}]})});if(c.ok){t=!0;break}else n=(await c.json().catch(()=>({})))?.error?.message||`HTTP ${c.status}`}catch(c){n=c.message}return t?{success:!0,message:"Gemini API Key is valid and active!"}:{success:!1,message:n||"Failed to ping Gemini API"}}if(e.type==="TEST_DASHBOARD"){let{url:s,token:o}=e.payload;if(!s)return{success:!1,message:"URL is required."};let t=`${s.replace(/\/$/,"")}/api/health`,n=await fetch(t,{headers:o?{Authorization:`Bearer ${o}`}:{}});return n.ok?{success:!0,message:"Connected to dashboard successfully!"}:{success:!1,message:`Dashboard replied with HTTP ${n.status}`}}if(e.type==="ANALYZE_AND_EVALUATE"){let s=e.payload,o=await d();if(!o.geminiApiKey)return{success:!1,message:"Gemini API key is not configured. Click the AlgoPulse extension icon in your toolbar to configure it."};let t=await p(s,o.geminiApiKey),n={problem_title:s.title,problem_slug:s.slug,platform:s.platform,difficulty:s.difficulty,language:s.language,user_code:s.code,overall_score:t.score,optimality_score:t.scoring_breakdown.optimality,time_score:t.scoring_breakdown.time_complexity,space_score:t.scoring_breakdown.space_complexity,cleanliness_score:t.scoring_breakdown.cleanliness,user_time_complexity:t.user_approach.time_complexity,user_space_complexity:t.user_approach.space_complexity,optimal_time_complexity:t.best_approach.time_complexity,optimal_space_complexity:t.best_approach.space_complexity,summary_feedback:t.best_approach.explanation,improvements:t.improvements,optimal_code:t.optimal_code},r={synced:!1,message:"Auto-sync disabled"};if(o.autoSync&&o.dashboardUrl&&o.extensionToken){let u=await y(n,o);r={synced:u.success,message:u.message}}let c={...n,id:`sub_${Date.now()}`,created_at:new Date().toISOString(),synced:r.synced};return await f(c),{success:!0,analysis:t,syncStatus:r}}if(e.type==="SYNC_TO_DASHBOARD"){let s=e.payload,o=await d();return await y(s,o)}return{success:!1,message:`Unknown message type: ${e.type}`}}catch(s){return console.error("[AlgoPulse Background Error]",s),{success:!1,message:s.message||"Internal extension error"}}})().then(l),!0));console.log("[AlgoPulse] Background service worker initialized.");})();
