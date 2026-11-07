"use client";
import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { Activity, ArrowUpRight, Bot, Check, ChevronDown, Code2, Command, Copy, Cpu, FileCode2, Layers3, LoaderCircle, PanelLeft, Play, Plus, Search, ShieldCheck, Sparkles, TerminalSquare, WandSparkles, X } from "lucide-react";

type Agent = { role: string; provider: string; model: string; content: string };
type Result = { answer?: string; code?: string | null; agents?: Agent[]; error?: string; elapsedMs?: number };
const starter = `// VORTEX AI — your implementation appears here
// Describe what you want to build and let the agent work.

export default function App() {
  return (
    <main className="demo-app">
      <div className="demo-orb" />
      <span className="demo-kicker">VORTEX GENERATED PREVIEW</span>
      <h1>Your next idea starts here.</h1>
      <p>Ask VORTEX to build a component or application.</p>
    </main>
  );
}`;

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState(starter);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"code" | "preview">("code");
  const [status, setStatus] = useState<{ready:boolean;provider?:string;model?:string}|null>(null);
  const [history, setHistory] = useState<string[]>(["New workspace"]);
  const [sidebar, setSidebar] = useState(true);
  const [copied, setCopied] = useState(false);
  const [phase, setPhase] = useState<"home" | "launching" | "workspace">("home");

  useEffect(() => { fetch("/api/status").then(r => r.json()).then(setStatus).catch(() => setStatus(null)); }, []);
  const preview = useMemo(() => {
    const escaped = code.replace(new RegExp("</script", "gi"), "<" + "\\/" + "script");
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="https://unpkg.com/@babel/standalone/babel.min.js"><\\/script><style>*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui;background:#0b0d13;color:#f6f5fb}.demo-app{min-height:100vh;padding:48px;display:grid;align-content:center;justify-items:center;text-align:center}.demo-orb{width:90px;height:90px;border-radius:30px;background:linear-gradient(135deg,#a58cff,#63d5df);filter:blur(1px);box-shadow:0 0 80px #9875ff55;margin-bottom:28px;animation:float 5s ease-in-out infinite}@keyframes float{50%{transform:translateY(-12px) rotate(7deg)}}.demo-kicker{font-size:10px;letter-spacing:.2em;color:#b4a3ff}.demo-app h1{font-size:clamp(30px,6vw,56px);letter-spacing:-.05em;margin:16px 0}.demo-app p{color:#9298aa}</style></head><body><div id="root"></div><script src="https://unpkg.com/react@18/umd/react.development.js"><\\/script><script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\\/script><script type="text/babel">${escaped.replace(/export default function App/, "function App").replace(/export default App;?/, "")}\nReactDOM.createRoot(document.getElementById('root')).render(<App/>);<\\/script></body></html>`;
  }, [code]);

  async function submit(requestPrompt = prompt) {
    if (!requestPrompt.trim() || busy) return;
    setBusy(true); setResult(null);
    try {
      const response = await fetch("/api/chat", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({prompt:requestPrompt}) });
      const data: Result = await response.json();
      if (!response.ok) throw new Error(data.error || "The request failed.");
      setResult(data); if (data.code) setCode(data.code);
      setHistory(old => [requestPrompt.slice(0,42), ...old].slice(0,8)); setPrompt("");
    } catch (e) { setResult({error:e instanceof Error ? e.message : "Something went wrong."}); }
    finally { setBusy(false); }
  }
  function launchProject() {
    const requestPrompt = prompt.trim();
    if (!requestPrompt || busy || phase !== "home") return;
    setPhase("launching");
    window.setTimeout(() => {
      setPhase("workspace");
      void submit(requestPrompt);
    }, 1120);
  }

  async function copyCode() {
    await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  if (phase !== "workspace") return <main className={`landing-screen ${phase === "launching" ? "is-launching" : ""}`}>
    <div className="landing-grid" />
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="landing-nav">
      <div className="brand"><div className="brand-mark"><Layers3 size={18}/></div><span>VORTEX <b>AI</b></span><span className="brand-tag">UNIFIED CODING INTELLIGENCE</span></div>
      <div className="landing-nav-right"><span className="landing-status"><i/> YOUR CREATIVE ENGINE</span><span className="landing-version">V 1.0</span></div>
    </header>
    <section className="landing-center">
      <div className="hero-orbit"><div className="orbit-ring orbit-ring-a"/><div className="orbit-ring orbit-ring-b"/><div className="hero-core"><Layers3 size={30}/></div><span className="orbit-spark spark-a"/><span className="orbit-spark spark-b"/></div>
      <div className="hero-eyebrow"><span/> INTELLIGENCE IN MOTION <span/></div>
      <h1>Ideas in.<br/><em>Extraordinary</em> out.</h1>
      <p className="hero-copy">Your AI engineering workspace. Describe what you imagine.<br/>VORTEX plans, builds, reviews, and brings it to life.</p>
      <div className="landing-prompt-wrap">
        <div className="landing-prompt">
          <div className="landing-prompt-label"><Sparkles size={13}/> START WITH AN IDEA <span>⌘ ↵</span></div>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();launchProject()}}} placeholder="Build me a beautiful portfolio with fluid animations..." aria-label="Describe what you want to build"/>
          <div className="landing-prompt-bottom"><div className="landing-prompt-hints"><span><ShieldCheck size={12}/> Review-first workflow</span><span><Cpu size={12}/> Multi-stage reasoning</span></div><button className="launch-button" onClick={launchProject} disabled={!prompt.trim()}><span>Start building</span><ArrowUpRight size={15}/></button></div>
        </div>
        <div className="prompt-glow"/>
      </div>
      <div className="idea-row"><span>OR TRY</span>{["A futuristic SaaS dashboard","A 3D product landing page","A full-stack task manager"].map(x=><button key={x} onClick={()=>setPrompt(x)}>{x}<ArrowUpRight size={10}/></button>)}</div>
    </section>
    <footer className="landing-footer"><span>DESIGNED FOR THE CURIOUS.</span><span>POWERED BY YOUR IDEAS <i>✦</i></span><span>VORTEX AI © 2026</span></footer>
    {phase === "launching" && <><div className="launch-flash"/><div className="launch-token"><div className="brand-mark"><Layers3 size={22}/></div><span>VORTEX</span></div><div className="launch-caption">INITIALIZING YOUR WORKSPACE</div></>}
  </main>;

  return <main className="app-shell workspace-mode">
    <header className="topbar">
      <button className="icon-button" onClick={() => setSidebar(!sidebar)} aria-label="Toggle sidebar"><PanelLeft size={17}/></button>
      <div className="brand"><div className="brand-mark"><Layers3 size={17}/></div><span>VORTEX <b>AI</b></span><span className="brand-tag">UNIFIED CODING INTELLIGENCE</span></div>
      <div className="top-actions"><div className="system-pill"><span className={`pulse-dot ${status?.ready ? "" : "muted"}`}/>{status?.ready ? "GEMINI CONNECTED" : "ENGINE SETUP REQUIRED"}</div><button className="setup-button" onClick={() => window.open("https://aistudio.google.com/app/apikey","_blank")}>Connect Gemini <ArrowUpRight size={12}/></button><button className="avatar">V</button></div>
    </header>
    <div className={`workspace ${sidebar ? "sidebar-visible" : "sidebar-hidden"}`}>
      {sidebar && <aside className="sidebar">
        <button className="new-project" onClick={() => {setPrompt("");setResult(null);setCode(starter)}}><Plus size={15}/> New workspace <span>⌘ K</span></button>
        <div className="side-label">WORKSPACE</div><div className="nav-item active"><Code2 size={15}/> Coding agent</div><div className="nav-item"><Layers3 size={15}/> Agent orchestration <span className="nav-count">04</span></div><div className="nav-item"><TerminalSquare size={15}/> Code workspace</div>
        <div className="side-label history-label">RECENT SESSIONS</div>{history.map((item,i)=><button className="history-item" key={i} onClick={()=>setPrompt(item)}><FileCode2 size={13}/><span>{item}</span></button>)}
        <div className="sidebar-bottom"><div className="plan-card"><Sparkles size={16} className="plan-icon"/><b>VORTEX orchestration</b><p>One request. Four specialist passes.</p><div className="plan-line"><span/></div><small>PLANNER · BUILDER · REVIEWER · SYNTHESIS</small></div><div className="profile"><div className="profile-avatar">V</div><div><b>VORTEX Workspace</b><small>Personal environment</small></div><ChevronDown size={14}/></div></div>
      </aside>}
      <section className="main-panel">
        <div className="welcome-row"><div><div className="eyebrow"><span/> ACCURACY-FIRST ENGINEERING</div><h1>Build something <em>extraordinary.</em></h1><p>Your coding workspace, powered by coordinated AI specialists.</p></div><div className="mode-chip"><WandSparkles size={13}/> Agent mode <ChevronDown size={12}/></div></div>
        <section className="prompt-card">
          <div className="prompt-head"><Command size={13}/> VORTEX PROMPT <span className="prompt-hint">Describe the outcome, not the steps.</span></div>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();submit()}}} placeholder="Build a responsive dashboard with authentication, a clean component system, and tests..." />
          <div className="prompt-footer"><div className="prompt-tools"><span><ShieldCheck size={12}/> Independent review</span><span><Cpu size={12}/> Multi-stage reasoning</span></div><button className="send-button" disabled={!prompt.trim()||busy} onClick={()=>submit()}>{busy?<><LoaderCircle size={14} className="spin"/> Working</>:<>Run agent <ArrowUpRight size={14}/></>}</button></div>
        </section>
        <div className="quick-prompts"><span>TRY:</span>{["Build a SaaS landing page","Debug this code","Design a REST API","Review architecture"].map(x=><button key={x} onClick={()=>setPrompt(x)}>{x}</button>)}</div>
        <div className="result-heading"><div><div className="section-kicker"><Activity size={11}/> LIVE WORKSPACE</div><h2>Implementation environment</h2></div><div className="result-state">{busy?<><LoaderCircle size={12} className="spin"/> ORCHESTRATING</>:result?.agents?"COMPLETE":"READY"}</div></div>
        <section className="result-card">
          <div className="result-tabs"><div className="tab-group"><button className={`tab ${tab==="code"?"active":""}`} onClick={()=>setTab("code")}><Code2 size={13}/> Code</button><button className={`tab ${tab==="preview"?"active":""}`} onClick={()=>setTab("preview")}><Play size={12}/> Preview</button></div><div className="file-label"><FileCode2 size={12}/> App.tsx</div><button className="subtle-button" onClick={copyCode}>{copied?<Check size={12}/>:<Copy size={12}/>} {copied?"Copied":"Copy code"}</button></div>
          <div className="editor-area">{tab==="code"?<Editor height="410px" language="typescript" theme="vs-dark" value={code} onChange={v=>setCode(v||"")} options={{fontSize:12,minimap:{enabled:false},wordWrap:"on",padding:{top:18},scrollBeyondLastLine:false,automaticLayout:true,renderLineHighlight:"gutter"}}/>:<iframe title="Generated code preview" className="preview-frame" sandbox="allow-scripts" srcDoc={preview}/>}</div>
        </section>
        <section className="response-card"><div className="response-title"><div className="response-icon"><Bot size={16}/></div><div><b>VORTEX synthesis</b><small>{result?.elapsedMs ? `Completed in ${(result.elapsedMs/1000).toFixed(1)}s` : "Final engineering response"}</small></div><span className="verified"><ShieldCheck size={12}/> REVIEW PIPELINE</span></div>
          {busy?<div className="response-content"><LoaderCircle size={13} className="spin"/> VORTEX is planning, building, reviewing and synthesizing...</div>:result?.error?<div className="error-box"><X size={14}/>{result.error}</div>:<div className="response-content">{result?.answer || "Your agent's final implementation notes will appear here. Enter a request above to start the four-stage workflow."}</div>}
          {result?.agents && <div className="agent-grid">{result.agents.map(a=><div className="agent-card" key={a.role}><div className="agent-top"><span className="agent-indicator"/><b>{a.role}</b><small><Check size={11}/></small></div><p>{a.provider} · {a.model}</p></div>)}</div>}
        </section>
        <div className="footer-note"><ShieldCheck size={12}/> Generated code is a draft. Review it before running or deploying.</div>
      </section>
    </div>
  </main>;
}