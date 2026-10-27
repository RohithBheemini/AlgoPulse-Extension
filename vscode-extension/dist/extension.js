"use strict";var G=Object.create;var I=Object.defineProperty;var L=Object.getOwnPropertyDescriptor;var H=Object.getOwnPropertyNames;var U=Object.getPrototypeOf,j=Object.prototype.hasOwnProperty;var V=(s,i)=>{for(var n in i)I(s,n,{get:i[n],enumerable:!0})},B=(s,i,n,e)=>{if(i&&typeof i=="object"||typeof i=="function")for(let t of H(i))!j.call(s,t)&&t!==n&&I(s,t,{get:()=>i[t],enumerable:!(e=L(i,t))||e.enumerable});return s};var O=(s,i,n)=>(n=s!=null?G(U(s)):{},B(i||!s||!s.__esModule?I(n,"default",{value:s,enumerable:!0}):n,s)),F=s=>B(I({},"__esModule",{value:!0}),s);var te={};V(te,{activate:()=>X,deactivate:()=>ee});module.exports=F(te);var y=O(require("vscode"));var d=O(require("vscode"));var C=`You are an elite competitive programmer, algorithm professor, and technical interview reviewer.
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

PROGRESSIVE HINTS INSTRUCTION:
Provide exactly 3 progressive hints:
- Tier 1: Subtle observation/nudge focusing on problem structure (never name the algorithm).
- Tier 2: Algorithmic approach / pattern hint (e.g. "Consider using a Hash Map single-pass approach...").
- Tier 3: Concrete strategy step without writing the whole code.

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
}`;function T(s){let i=s.description?`Problem Description: ${s.description.slice(0,1500)}`:"";return`Problem Title: ${s.title}
Difficulty: ${s.difficulty}
Programming Language: ${s.language}
${i}

Student's Code:
\`\`\`${s.language}
${s.code}
\`\`\`

Evaluate this code now. Focus on ALGORITHMIC APPROACH first, followed by complexity analysis, progressive hints, and optimal code.`}function P(s,i,n){if(!s||typeof s!="string"||!s.trim())throw new Error(`Empty response received from ${i} (${n}).`);let e=null;try{e=JSON.parse(s.trim())}catch{let x=s.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);if(x&&x[1])try{e=JSON.parse(x[1].trim())}catch{}if(!e){let w=s.indexOf("{"),f=s.lastIndexOf("}");if(w!==-1&&f!==-1&&f>w){let l=s.slice(w,f+1).trim();try{e=JSON.parse(l)}catch{}}}}if(!e||typeof e!="object")throw new Error(`Failed to parse valid JSON from ${i} response.`);let t=typeof e.score=="number"&&!isNaN(e.score)?Math.min(100,Math.max(0,Math.round(e.score))):70,o=e.scoring_breakdown&&typeof e.scoring_breakdown=="object"?e.scoring_breakdown:{},a=typeof o.approach_soundness=="number"?o.approach_soundness:typeof o.optimality=="number"?o.optimality:28,c=typeof o.approach_optimality=="number"?o.approach_optimality:typeof o.time_complexity=="number"?o.time_complexity:20,p=typeof o.space_complexity=="number"?o.space_complexity:18,r=typeof o.cleanliness=="number"?o.cleanliness:18,m=e.user_approach&&typeof e.user_approach=="object"?{name:String(e.user_approach.name||"Submitted Approach"),paradigm:String(e.user_approach.paradigm||"General"),summary:String(e.user_approach.summary||"Approach evaluated."),time_complexity:String(e.user_approach.time_complexity||"O(N)"),space_complexity:String(e.user_approach.space_complexity||"O(1)")}:{name:"Submitted Approach",paradigm:"General",summary:"Approach evaluated.",time_complexity:"O(N)",space_complexity:"O(1)"},g=e.best_approach&&typeof e.best_approach=="object"?{name:String(e.best_approach.name||"Optimal Approach"),paradigm:String(e.best_approach.paradigm||"Optimal Paradigm"),time_complexity:String(e.best_approach.time_complexity||"O(N)"),space_complexity:String(e.best_approach.space_complexity||"O(1)"),explanation:String(e.best_approach.explanation||"Optimal algorithmic strategy.")}:{name:"Optimal Approach",paradigm:"Optimal Paradigm",time_complexity:"O(N)",space_complexity:"O(1)",explanation:"Optimal algorithmic strategy."},u={tier1_observation:"Observe the input constraints and search space properties.",tier2_pattern:"Identify if a frequency map or two pointers can eliminate redundant traversals.",tier3_strategy:"Formulate the state transition or recurrence relation."};e.hints&&typeof e.hints=="object"&&!Array.isArray(e.hints)?u={tier1_observation:String(e.hints.tier1_observation||u.tier1_observation),tier2_pattern:String(e.hints.tier2_pattern||u.tier2_pattern),tier3_strategy:String(e.hints.tier3_strategy||u.tier3_strategy)}:Array.isArray(e.hints)&&e.hints.length>=3&&(u={tier1_observation:String(e.hints[0]||u.tier1_observation),tier2_pattern:String(e.hints[1]||u.tier2_pattern),tier3_strategy:String(e.hints[2]||u.tier3_strategy)});let b=Array.isArray(e.improvements)?e.improvements.map(_=>String(_)):["Consider reducing auxiliary space allocations."],A=typeof e.optimal_code=="string"&&e.optimal_code.trim()?e.optimal_code.trim():"// Reference code provided in analysis";return{score:t,scoring_breakdown:{approach_soundness:a,approach_optimality:c,optimality:a,time_complexity:c,space_complexity:p,cleanliness:r},user_approach:m,best_approach:g,why_suboptimal:e.why_suboptimal?String(e.why_suboptimal):void 0,why_ideal:e.why_ideal?String(e.why_ideal):void 0,hints:u,improvements:b,optimal_code:A,assessed_difficulty:["Easy","Medium","Hard"].includes(e.assessed_difficulty)?e.assessed_difficulty:"Medium",model_used:n,provider_used:i}}function h(s){if(!s||typeof s!="string")return"";let i=s.trim();return i=i.replace(/^["'`]|["'`]$/g,"").trim(),i=i.replace(/[^\x21-\x7E]/g,"").trim(),i=i.replace(/[,;]+$/,"").trim(),i}var E=null;async function Y(s){let i=h(s);if(!i)return[];try{let n=`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(i)}`,e=await fetch(n);if(e.ok){let a=((await e.json()).models||[]).filter(c=>Array.isArray(c.supportedGenerationMethods)&&c.supportedGenerationMethods.includes("generateContent")).map(c=>c.name.replace(/^models\//,"")).filter(c=>!c.includes("embedding")&&!c.includes("aqa")&&!c.includes("imagen"));if(a.length>0)return a}}catch(n){console.warn("[AlgoPulse VSCode] Error querying ModelService.ListModels:",n)}return[]}async function K(s,i="auto"){let n=h(s),e=i&&i!=="auto"&&i.trim().length>0?i.trim():null,t=["gemini-2.0-flash","gemini-1.5-flash","gemini-3.7-flash","gemini-3.6-flash","gemini-3.5-flash","gemini-pro"],o=await Y(n),c=[...o.length>0?o:t].sort((p,r)=>{if(e){if(p.toLowerCase()===e.toLowerCase())return-1;if(r.toLowerCase()===e.toLowerCase())return 1}if(E){if(p===E)return-1;if(r===E)return 1}let m=p.includes("flash"),g=r.includes("flash");return m&&!g?-1:!m&&g?1:p.includes("2.0")&&!r.includes("2.0")?-1:!p.includes("2.0")&&r.includes("2.0")?1:p.includes("1.5")&&!r.includes("1.5")?-1:!p.includes("1.5")&&r.includes("1.5")?1:r.localeCompare(p,void 0,{numeric:!0})});return e&&!c.includes(e)?[e,...c]:c}async function J(s,i,n="auto"){let e=h(i);if(!e)throw new Error("Gemini API key is not configured or empty.");let t=T(s),o=await K(e,n),a="Failed to communicate with Gemini API",c=null,p="";for(let m of o)try{let g=`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(e)}`,u=await fetch(g,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:t}]}],systemInstruction:{parts:[{text:C}]},generationConfig:{temperature:.2,responseMimeType:"application/json"}})});if(u.ok){c=await u.json(),p=m,E=m;break}else a=(await u.json().catch(()=>({})))?.error?.message||`HTTP ${u.status}: ${u.statusText}`}catch(g){a=g.message||"Network error"}if(!c)throw new Error(`[Gemini Error] ${a}`);let r=c?.candidates?.[0]?.content?.parts?.[0]?.text;if(!r)throw new Error("Received an empty response from Gemini API.");return P(r,"Google Gemini",p)}var W=null,M=["gpt-4o-mini","gpt-4o","o3-mini","gpt-3.5-turbo"];async function q(s,i,n="auto"){let e=T(s),t=n&&n!=="auto"?[n.trim(),...M.filter(r=>r.toLowerCase()!==n.trim().toLowerCase())]:M,o="Failed to communicate with OpenAI API",a=null,c="";for(let r of t)try{let m=/^o[13]/i.test(r),g={model:r,messages:[{role:"system",content:C},{role:"user",content:e}],response_format:{type:"json_object"}};m?g.max_completion_tokens=3500:(g.temperature=.2,g.max_tokens=3500);let u=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${i.trim()}`},body:JSON.stringify(g)});if(u.ok){a=await u.json(),c=r,W=r;break}else o=(await u.json().catch(()=>({})))?.error?.message||`HTTP ${u.status}: ${u.statusText}`}catch(m){o=m.message||"Network error"}if(!a)throw new Error(`[OpenAI Error] ${o}`);let p=a?.choices?.[0]?.message?.content;if(!p)throw new Error("Received an empty response from OpenAI API.");return P(p,"OpenAI",c)}var Q=null,R=["claude-3-5-haiku-20241022","claude-3-5-sonnet-20241022","claude-3-haiku-20240307"];async function Z(s,i,n="auto"){let e=T(s),t=n&&n!=="auto"?[n.trim(),...R.filter(r=>r.toLowerCase()!==n.trim().toLowerCase())]:R,o="Failed to communicate with Anthropic Claude API",a=null,c="";for(let r of t)try{let m=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":i.trim(),"anthropic-version":"2023-06-01"},body:JSON.stringify({model:r,max_tokens:3500,temperature:.2,system:C,messages:[{role:"user",content:e}]})});if(m.ok){a=await m.json(),c=r,Q=r;break}else o=(await m.json().catch(()=>({})))?.error?.message||`HTTP ${m.status}: ${m.statusText}`}catch(m){o=m.message||"Network error"}if(!a)throw new Error(`[Claude Error] ${o}`);let p=a?.content?.[0]?.text;if(!p)throw new Error("Received an empty response from Claude API.");return P(p,"Anthropic Claude",c)}async function z(s,i){let n=h(i);if(!n)return{success:!1,message:"API key is empty."};if(s==="gemini")try{let t=(await K(n))[0]||"gemini-2.0-flash",o=`https://generativelanguage.googleapis.com/v1beta/models/${t}:generateContent?key=${encodeURIComponent(n)}`,a=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:"Ping"}]}]})});return a.ok?{success:!0,message:`Connected to Gemini (${t}) successfully!`,model:t}:{success:!1,message:(await a.json().catch(()=>({})))?.error?.message||`HTTP ${a.status}`}}catch(e){return{success:!1,message:e.message||"Network error"}}if(s==="openai")try{let e="gpt-4o-mini",t=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:e,messages:[{role:"user",content:"Ping"}],max_tokens:10})});return t.ok?{success:!0,message:`Connected to OpenAI (${e}) successfully!`,model:e}:{success:!1,message:(await t.json().catch(()=>({})))?.error?.message||`HTTP ${t.status}`}}catch(e){return{success:!1,message:e.message||"Network error"}}if(s==="claude")try{let e="claude-3-5-haiku-20241022",t=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":n,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:e,max_tokens:10,messages:[{role:"user",content:"Ping"}]})});return t.ok?{success:!0,message:`Connected to Claude (${e}) successfully!`,model:e}:{success:!1,message:(await t.json().catch(()=>({})))?.error?.message||`HTTP ${t.status}`}}catch(e){return{success:!1,message:e.message||"Network error"}}return{success:!1,message:`Unknown provider: ${s}`}}async function N(s,i){let n=i.activeProvider||"auto",e=i.preferredModel||"auto",t=[],o=h(i.geminiApiKey),a=h(i.openaiApiKey),c=h(i.anthropicApiKey);if(o&&t.push({id:"gemini",key:o}),a&&t.push({id:"openai",key:a}),c&&t.push({id:"claude",key:c}),t.length===0)throw new Error("No AI provider API key is configured. Please open AlgoPulse settings in VS Code and set your key for Gemini, OpenAI, or Claude.");let p=[];if(n!=="auto"){let m=t.find(g=>g.id===n);if(!m)throw new Error(`The selected provider '${n}' does not have an API key configured in VS Code settings.`);p=[m,...t.filter(g=>g.id!==n)]}else{let m=["gemini","openai","claude"];for(let g of m){let u=t.find(b=>b.id===g);u&&p.push(u)}}let r=[];for(let{id:m,key:g}of p)try{if(m==="gemini")return console.log("[AlgoPulse VSCode] Evaluating with Google Gemini..."),await J(s,g,e);if(m==="openai")return console.log("[AlgoPulse VSCode] Evaluating with OpenAI..."),await q(s,g,e);if(m==="claude")return console.log("[AlgoPulse VSCode] Evaluating with Anthropic Claude..."),await Z(s,g,e)}catch(u){console.warn(`[AlgoPulse VSCode] ${m} analysis failed:`,u.message),r.push(`${m}: ${u.message}`)}throw new Error(`AlgoPulse: All configured AI providers failed:
\u2022 ${r.join(`
\u2022 `)}`)}async function $(s,i,n){if(!i||!i.trim())return{success:!1,message:"Dashboard URL is not configured."};let e=`${i.replace(/\/$/,"")}/api/submissions`;try{let t=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json",...n&&n.trim()?{Authorization:`Bearer ${n.trim()}`}:{}},body:JSON.stringify(s)});return t.ok?{success:!0,message:"Successfully synced submission to AlgoPulse dashboard!",data:await t.json()}:{success:!1,message:(await t.json().catch(()=>({}))).error||`Dashboard returned HTTP ${t.status}: ${t.statusText}`}}catch(t){return{success:!1,message:`Failed to connect to dashboard at ${e}: ${t.message||"Network error"}`}}}var S=class{constructor(i){this._extensionUri=i}static viewType="algopulse.sidebarView";_view;_currentAnalysisState="idle";_lastAnalysisData;resolveWebviewView(i,n,e){this._view=i,i.webview.options={enableScripts:!0,localResourceRoots:[this._extensionUri]},i.webview.html=this._getHtmlForWebview(i.webview),i.webview.onDidReceiveMessage(async t=>{switch(t.type){case"ANALYZE_REQUEST":{await d.commands.executeCommand("algopulse.analyzeCode");break}case"OPEN_DASHBOARD":{let a=d.workspace.getConfiguration("algopulse").get("dashboardUrl")||"http://localhost:3000";d.env.openExternal(d.Uri.parse(a));break}case"INSERT_CODE":{let o=d.window.activeTextEditor;o&&t.code&&(await o.edit(a=>{let c=o.selection;if(!c.isEmpty)a.replace(c,t.code);else{let p=new d.Range(o.document.positionAt(0),o.document.positionAt(o.document.getText().length));a.replace(p,t.code)}}),d.window.showInformationMessage("AlgoPulse: Optimal solution inserted into editor!"));break}case"COPY_CODE":{t.code&&(await d.env.clipboard.writeText(t.code),d.window.showInformationMessage("Optimal code copied to clipboard!"));break}case"SAVE_SETTINGS":{let o=d.workspace.getConfiguration("algopulse");if(t.settings.activeProvider!==void 0&&await o.update("activeProvider",t.settings.activeProvider||"auto",d.ConfigurationTarget.Global),t.settings.geminiApiKey!==void 0){let a=h(t.settings.geminiApiKey);await o.update("geminiApiKey",a,d.ConfigurationTarget.Global)}if(t.settings.openaiApiKey!==void 0){let a=h(t.settings.openaiApiKey);await o.update("openaiApiKey",a,d.ConfigurationTarget.Global)}if(t.settings.anthropicApiKey!==void 0){let a=h(t.settings.anthropicApiKey);await o.update("anthropicApiKey",a,d.ConfigurationTarget.Global)}t.settings.dashboardUrl!==void 0&&await o.update("dashboardUrl",t.settings.dashboardUrl?t.settings.dashboardUrl.trim():"http://localhost:3000",d.ConfigurationTarget.Global),t.settings.extensionToken!==void 0&&await o.update("extensionToken",t.settings.extensionToken?t.settings.extensionToken.trim():"",d.ConfigurationTarget.Global),t.settings.preferredModel!==void 0&&await o.update("preferredModel",t.settings.preferredModel?t.settings.preferredModel.trim():"auto",d.ConfigurationTarget.Global),d.window.showInformationMessage("AlgoPulse settings saved successfully!"),this.postMessage({type:"SETTINGS_SAVED"});break}case"TEST_PROVIDER_KEY":{let o=t.provider||"gemini",a=h(t.apiKey),c=await z(o,a);this.postMessage({type:"TEST_PROVIDER_RESULT",provider:o,result:c});break}case"GET_INITIAL_DATA":{let o=d.workspace.getConfiguration("algopulse");this.postMessage({type:"INIT_CONFIG",config:{activeProvider:o.get("activeProvider")||"auto",geminiApiKey:o.get("geminiApiKey")||"",openaiApiKey:o.get("openaiApiKey")||"",anthropicApiKey:o.get("anthropicApiKey")||"",dashboardUrl:o.get("dashboardUrl")||"http://localhost:3000",extensionToken:o.get("extensionToken")||"",autoSync:o.get("autoSync")!==!1,preferredModel:o.get("preferredModel")||"auto"}}),this._currentAnalysisState==="analyzing"?this.postMessage({type:"ANALYSIS_STARTED"}):this._currentAnalysisState==="done"&&this._lastAnalysisData&&this.postMessage({type:"ANALYSIS_SUCCESS",...this._lastAnalysisData});break}}})}postMessage(i){this._view&&this._view.webview.postMessage(i)}async runAnalysisForEditor(i){if(this._view)this._view.show?.(!0);else{await d.commands.executeCommand("algopulse.sidebarView.focus");let l=0;for(;!this._view&&l<30;)await new Promise(v=>setTimeout(v,50)),l++}let n=i.document,e=i.selection,t=e.isEmpty?n.getText():n.getText(e);if(!t||t.trim().length===0){d.window.showWarningMessage("AlgoPulse: Please open a code file with content to analyze.");return}let a=(n.fileName.split(/[\\/]/).pop()||"Solution").replace(/\.[^/.]+$/,"").replace(/[_-]/g," ").replace(/([A-Z])/g," $1").trim().split(" ").filter(Boolean).map(l=>l.charAt(0).toUpperCase()+l.slice(1)).join(" ")||"Algorithm Problem",c=n.languageId||"python3",p={title:a,slug:a.toLowerCase().replace(/\s+/g,"-"),difficulty:"Medium",language:c,code:t,platform:"vscode",filePath:n.fileName},r=d.workspace.getConfiguration("algopulse"),m=r.get("activeProvider")||"auto",g=h(r.get("geminiApiKey")||""),u=h(r.get("openaiApiKey")||""),b=h(r.get("anthropicApiKey")||""),A=r.get("dashboardUrl")||"http://localhost:3000",_=r.get("extensionToken")||"",x=r.get("autoSync")!==!1,w=r.get("preferredModel")||"auto",f={activeProvider:m,geminiApiKey:g,openaiApiKey:u,anthropicApiKey:b,dashboardUrl:A,extensionToken:_,autoSync:x,preferredModel:w};if(!g&&!u&&!b){this.postMessage({type:"PROMPT_API_KEY",message:"Please configure at least one API key (Gemini, OpenAI, or Claude) in settings to begin."});let l=await d.window.showInputBox({title:"AlgoPulse: AI API Key Required",prompt:"Enter your Google Gemini, OpenAI, or Anthropic API Key",placeHolder:"AIzaSy... / sk-... / sk-ant-...",password:!0,ignoreFocusOut:!0});if(l&&l.trim()){let v=h(l);return v.startsWith("sk-ant-")?(await r.update("anthropicApiKey",v,d.ConfigurationTarget.Global),f.anthropicApiKey=v):v.startsWith("sk-")?(await r.update("openaiApiKey",v,d.ConfigurationTarget.Global),f.openaiApiKey=v):(await r.update("geminiApiKey",v,d.ConfigurationTarget.Global),f.geminiApiKey=v),this.runAnalysisForEditor(i)}else return}this._currentAnalysisState="analyzing",this.postMessage({type:"ANALYSIS_STARTED",metadata:p});try{let l=await d.window.withProgress({location:d.ProgressLocation.Notification,title:`AlgoPulse: Analyzing ${p.title}...`,cancellable:!1},async()=>await N(p,f)),v={synced:!1,message:"Auto-sync disabled"};if(x&&A){let D={problem_title:p.title,problem_slug:p.slug,platform:"vscode",difficulty:l.assessed_difficulty||p.difficulty||"Medium",language:p.language,user_code:p.code,overall_score:l.score,optimality_score:l.scoring_breakdown.optimality,time_score:l.scoring_breakdown.time_complexity,space_score:l.scoring_breakdown.space_complexity,cleanliness_score:l.scoring_breakdown.cleanliness,user_time_complexity:`${l.user_approach.name} (${l.user_approach.time_complexity})`,user_space_complexity:l.user_approach.space_complexity,optimal_time_complexity:`${l.best_approach.name} (${l.best_approach.time_complexity})`,optimal_space_complexity:l.best_approach.space_complexity,why_suboptimal:l.why_suboptimal||l.user_approach.summary,why_ideal:l.why_ideal||l.best_approach.explanation,summary_feedback:l.best_approach.explanation,improvements:l.improvements||[],optimal_code:l.optimal_code,paradigm:l.user_approach?.paradigm||l.best_approach?.paradigm||void 0},k=await $(D,A,_);v={synced:k.success,message:k.message}}this._currentAnalysisState="done",this._lastAnalysisData={metadata:p,result:l,syncResult:v},this.postMessage({type:"ANALYSIS_SUCCESS",metadata:p,result:l,syncResult:v}),d.window.showInformationMessage(`AlgoPulse: Score ${l.score}/100 for ${p.title}!${v.synced?" Synced to dashboard.":""}`)}catch(l){this._currentAnalysisState="idle",this.postMessage({type:"ANALYSIS_ERROR",error:l.message||"Analysis failed"}),d.window.showErrorMessage(`AlgoPulse: ${l.message||"Analysis failed"}`)}}_getHtmlForWebview(i){return`<!DOCTYPE html>
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
      <span class="brand-badge">Multi-AI</span>
    </div>
    <div style="display: flex; gap: 4px;">
      <button id="toggleSettingsBtn" class="btn btn-secondary" style="padding: 4px 8px; font-size: 10px; width: auto;">\u2699 Settings</button>
      <button id="openDashboardBtn" class="btn btn-secondary" style="padding: 4px 8px; font-size: 10px; width: auto;">\u{1F4CA} Dashboard</button>
    </div>
  </div>

  <!-- Settings Drawer -->
  <div id="settingsDrawer" class="drawer">
    <div class="card-title">
      <span>Settings & Multi-AI Hub</span>
      <span style="font-size: 9px; color: var(--green);">Gemini \u2022 OpenAI \u2022 Claude</span>
    </div>
    <div class="input-group">
      <label class="input-label">Active Provider</label>
      <select id="providerSelect" class="input-field" style="background: var(--bg); color: var(--text);">
        <option value="auto">\u26A1 Auto (Smart Failover)</option>
        <option value="gemini">Google Gemini</option>
        <option value="openai">OpenAI</option>
        <option value="claude">Anthropic Claude</option>
      </select>
    </div>
    <div class="input-group">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
        <label class="input-label" style="margin-bottom: 0;">Google Gemini API Key</label>
        <button id="testGeminiBtn" type="button" style="background: none; border: none; color: var(--blue); font-size: 10px; cursor: pointer; text-decoration: underline; padding: 0;">Test Key</button>
      </div>
      <input type="password" id="apiKeyInput" class="input-field" placeholder="AIzaSy... (Free tier)" />
      <div id="geminiTestStatus" style="font-size: 10px; margin-top: 3px; display: none;"></div>
    </div>
    <div class="input-group">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
        <label class="input-label" style="margin-bottom: 0;">OpenAI API Key</label>
        <button id="testOpenAiBtn" type="button" style="background: none; border: none; color: var(--blue); font-size: 10px; cursor: pointer; text-decoration: underline; padding: 0;">Test Key</button>
      </div>
      <input type="password" id="openaiApiKeyInput" class="input-field" placeholder="sk-... (gpt-4o-mini)" />
      <div id="openaiTestStatus" style="font-size: 10px; margin-top: 3px; display: none;"></div>
    </div>
    <div class="input-group">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
        <label class="input-label" style="margin-bottom: 0;">Anthropic Claude API Key</label>
        <button id="testClaudeBtn" type="button" style="background: none; border: none; color: var(--blue); font-size: 10px; cursor: pointer; text-decoration: underline; padding: 0;">Test Key</button>
      </div>
      <input type="password" id="claudeApiKeyInput" class="input-field" placeholder="sk-ant-... (3.5 Haiku)" />
      <div id="claudeTestStatus" style="font-size: 10px; margin-top: 3px; display: none;"></div>
    </div>
    <div class="input-group">
      <label class="input-label">Model Override (Default: auto)</label>
      <input type="text" id="modelInput" class="input-field" placeholder="auto (or gpt-4o, claude-3-5-sonnet, gemini-2.0-flash)" />
    </div>
    <div class="input-group">
      <label class="input-label">Dashboard URL</label>
      <input type="text" id="dashboardUrlInput" class="input-field" placeholder="http://localhost:3000" />
    </div>
    <div class="input-group">
      <label class="input-label">Extension Token (from Profile)</label>
      <input type="password" id="tokenInput" class="input-field" placeholder="ap_sec_..." />
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
      const activeProvider = document.getElementById('providerSelect').value;
      const geminiApiKey = document.getElementById('apiKeyInput').value;
      const openaiApiKey = document.getElementById('openaiApiKeyInput').value;
      const anthropicApiKey = document.getElementById('claudeApiKeyInput').value;
      const dashboardUrl = document.getElementById('dashboardUrlInput').value;
      const extensionToken = document.getElementById('tokenInput').value;
      const preferredModel = document.getElementById('modelInput').value || 'auto';
      vscode.postMessage({
        type: 'SAVE_SETTINGS',
        settings: { activeProvider, geminiApiKey, openaiApiKey, anthropicApiKey, dashboardUrl, extensionToken, preferredModel }
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

    function bindTestKey(btnId, inputId, statusId, provider) {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const apiKey = document.getElementById(inputId).value;
        const statusEl = document.getElementById(statusId);
        if (!apiKey || !apiKey.trim()) {
          statusEl.style.display = 'block';
          statusEl.style.color = 'var(--yellow)';
          statusEl.textContent = 'Please enter an API key first.';
          return;
        }
        statusEl.style.display = 'block';
        statusEl.style.color = 'var(--text-muted)';
        statusEl.textContent = 'Pinging ' + provider + '...';
        vscode.postMessage({ type: 'TEST_PROVIDER_KEY', provider, apiKey });
      });
    }
    bindTestKey('testGeminiBtn', 'apiKeyInput', 'geminiTestStatus', 'gemini');
    bindTestKey('testOpenAiBtn', 'openaiApiKeyInput', 'openaiTestStatus', 'openai');
    bindTestKey('testClaudeBtn', 'claudeApiKeyInput', 'claudeTestStatus', 'claude');

    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.type) {
        case 'TEST_PROVIDER_RESULT': {
          const statusId = message.provider === 'gemini' ? 'geminiTestStatus' : (message.provider === 'openai' ? 'openaiTestStatus' : 'claudeTestStatus');
          const statusEl = document.getElementById(statusId);
          if (statusEl) {
            statusEl.style.display = 'block';
            statusEl.style.color = message.result.success ? 'var(--green)' : 'var(--red)';
            statusEl.textContent = (message.result.success ? '\u2713 ' : '\u2715 ') + message.result.message;
          }
          break;
        }
        case 'INIT_CONFIG': {
          if (message.config) {
            if (message.config.activeProvider) {
              document.getElementById('providerSelect').value = message.config.activeProvider;
            }
            document.getElementById('apiKeyInput').value = message.config.geminiApiKey || '';
            document.getElementById('openaiApiKeyInput').value = message.config.openaiApiKey || '';
            document.getElementById('claudeApiKeyInput').value = message.config.anthropicApiKey || '';
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
</html>`}};function X(s){console.log("[AlgoPulse VSCode] Extension activated.");let i=new S(s.extensionUri);s.subscriptions.push(y.window.registerWebviewViewProvider(S.viewType,i,{webviewOptions:{retainContextWhenHidden:!0}}));let n=y.commands.registerCommand("algopulse.analyzeCode",async()=>{let a=y.window.activeTextEditor;if(!a&&y.window.visibleTextEditors.length>0&&(a=y.window.visibleTextEditors[0]),!a){y.window.showInformationMessage("AlgoPulse: Please open a code file in the editor to analyze.");return}await i.runAnalysisForEditor(a)}),e=y.commands.registerCommand("algopulse.openDashboard",()=>{let c=y.workspace.getConfiguration("algopulse").get("dashboardUrl")||"http://localhost:3000";y.env.openExternal(y.Uri.parse(c))}),t=y.commands.registerCommand("algopulse.configureSettings",()=>{y.commands.executeCommand("workbench.action.openSettings","algopulse")}),o=y.window.createStatusBarItem(y.StatusBarAlignment.Right,100);o.command="algopulse.analyzeCode",o.text="$(sparkle) AlgoPulse",o.tooltip="Analyze Active Code with AlgoPulse (Ctrl+Alt+A)",o.show(),s.subscriptions.push(n,e,t,o)}function ee(){console.log("[AlgoPulse VSCode] Extension deactivated.")}0&&(module.exports={activate,deactivate});
//# sourceMappingURL=extension.js.map
