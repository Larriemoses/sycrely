"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { analyzePrompt, type AliasEntry, type PrivacyAnalysis } from "@/lib/privacy";
import { buildTaskCapsule, type TaskCapsule } from "@/lib/capsule";
import { createVault, deleteSession, hasVault, loadSession, saveSession, unlockVault } from "@/lib/vault";

type DeliveryMeta = { mode: "mock" | "live"; model: string; provider?: string; usage?: { totalTokens: number }; privacy: { zeroDataRetention: boolean; dataCollection: "deny" | "not-applicable" } };
type Message = { id: string; role: "user" | "assistant"; text: string; protectedText?: string; capsule?: TaskCapsule; aliases?: AliasEntry[]; delivery?: DeliveryMeta };
type Mode = "balanced" | "strict";
type Theme = "dark" | "light";
type ThemePreference = Theme | "system";
type PendingRequest = { analysis: PrivacyAnalysis; capsule: TaskCapsule };
const ACTIVE_SESSION = "sycrely.active-session";
const STARTERS = [
  { icon: "✦", title: "Protect a personal question", prompt: "I need advice about a sensitive personal situation involving " },
  { icon: "◎", title: "Research an idea privately", prompt: "Help me research this confidential product idea: " },
  { icon: "↗", title: "Handle a workplace issue", prompt: "Help me think through a private workplace situation: " },
  { icon: "⌁", title: "Check what will be shared", prompt: "Explain what private details should be protected in this request: " },
];

function Shield({ small = false }: { small?: boolean }) {
  return <span className={small ? "shield small" : "shield"} aria-hidden="true">S</span>;
}

function LockScreen({ setup, onReady }: { setup: boolean; onReady: (key: CryptoKey) => void }) {
  const [pin, setPin] = useState(""); const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    if (pin.length < 6) return setError("Use at least 6 characters.");
    if (setup && pin !== confirm) return setError("The two entries do not match.");
    setBusy(true);
    try { onReady(setup ? await createVault(pin) : await unlockVault(pin)); }
    catch { setError("That unlock phrase did not work."); setBusy(false); }
  }
  return <main className="lock-page"><section className="lock-card">
    <div className="brand"><Shield /><span>Sycrely</span></div><p className="eyebrow">PRIVATE BY DESIGN</p>
    <h1>{setup ? "Create your local vault" : "Unlock your private session"}</h1>
    <p className="lede">{setup ? "Your conversations will be encrypted before they are saved in this browser." : "Your session is still here. Sycrely needs your local unlock phrase to read it."}</p>
    <form onSubmit={submit}><label>Local unlock phrase<input autoFocus type="password" value={pin} onChange={e=>setPin(e.target.value)} autoComplete={setup ? "new-password" : "current-password"} /></label>
      {setup && <label>Confirm phrase<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password" /></label>}
      {error && <p className="form-error" role="alert">{error}</p>}<button className="primary wide" disabled={busy}>{busy ? "Preparing vault..." : setup ? "Create private vault" : "Unlock session"}</button>
    </form><p className="fine-print">Sycrely does not send this phrase to a server. If you forget it, this prototype cannot recover your encrypted conversation.</p>
  </section></main>;
}

function ReviewModal({ request, onCancel, onSend, sending }: { request: PendingRequest; onCancel: () => void; onSend: () => void; sending: boolean }) {
  const { analysis, capsule } = request;
  return <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="review-title">
    <div className="modal-title-row"><div className="risk-icon">!</div><div><p className="eyebrow danger">HIGH SENSITIVITY DETECTED</p><h2 id="review-title">Review before anything leaves</h2></div></div>
    <p className="muted">Sycrely found information that could expose a secret or identify someone. The original stays in your encrypted local vault.</p>
    <div className="finding-list">{analysis.findings.map((finding,index)=><span key={`${finding.category}-${index}`}>{finding.label}</span>)}</div>
    <div className="preview-block"><div className="preview-label"><span>Provider-bound version</span><span className="safe-chip">Protected</span></div><p>{analysis.protectedText}</p></div>
    <div className={`policy-block ${analysis.contentPolicy}`}><strong>Protection decision</strong><span>{analysis.policyExplanation}</span></div>
    {analysis.combinationRisk.level!=="none"&&<div className="policy-block"><strong>Combined-detail risk: {analysis.combinationRisk.level} ({analysis.combinationRisk.score})</strong><span>{analysis.combinationRisk.explanation} Signals: {analysis.combinationRisk.signals.join(", ")}.</span></div>}
    <div className="policy-block"><strong>Local classifier</strong><span>{analysis.semanticClassification.predictions.length ? analysis.semanticClassification.predictions.map(item=>`${item.category} ${Math.round(item.confidence*100)}%`).join(", ") : "No semantic risk signal detected"}. Completed locally in {analysis.semanticClassification.durationMs} ms.</span></div>
    <div className="capsule-block"><div className="preview-label"><span>Task capsule</span><span className="safe-chip">Built locally</span></div><dl><div><dt>Task</dt><dd>{capsule.task}</dd></div><div><dt>Requested answer</dt><dd>{capsule.requestedOutput}</dd></div><div><dt>Privacy rules</dt><dd>{capsule.constraints.length} attached</dd></div></dl></div>
    <details><summary>What changed?</summary><ul>{analysis.changes.map((change,index)=><li key={`${index}-${change}`}>{change}</li>)}</ul></details>
    <div className="modal-actions"><button className="secondary" onClick={onCancel} disabled={sending}>Go back and edit</button><button className="primary" onClick={onSend} disabled={sending}>{sending ? "Sending protected version..." : "Send protected version"}</button></div>
  </section></div>;
}

function EndSessionModal({ onClose, onSave, onDelete }: { onClose:()=>void; onSave:()=>void; onDelete:()=>void }) {
  return <div className="modal-backdrop"><section className="modal compact" role="dialog" aria-modal="true"><p className="eyebrow">END PRIVATE SESSION</p><h2>Save it or delete it?</h2><p className="muted">Saving keeps an encrypted copy in this browser. Deleting destroys the local session record.</p><div className="choice-grid"><button className="choice" onClick={onSave}><strong>Save encrypted</strong><span>Return to it later on this browser.</span></button><button className="choice destructive" onClick={onDelete}><strong>Delete now</strong><span>Remove messages and their encrypted record.</span></button></div><button className="text-button" onClick={onClose}>Continue conversation</button></section></div>;
}

function SettingsModal({ preference, onChange, onClose }: { preference:ThemePreference; onChange:(value:ThemePreference)=>void; onClose:()=>void }) {
  const options: Array<{value:ThemePreference;title:string;description:string}> = [
    {value:"system",title:"Use device setting",description:"Automatically match your phone or computer."},
    {value:"dark",title:"Dark",description:"Black, charcoal and Sycrely green."},
    {value:"light",title:"Light",description:"Bright surfaces with strong readable contrast."},
  ];
  return <div className="modal-backdrop"><section className="modal settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div className="settings-heading"><div><p className="eyebrow">PREFERENCES</p><h2 id="settings-title">Settings</h2></div><button className="icon-button" onClick={onClose} aria-label="Close settings">×</button></div><div className="settings-section"><h3>Appearance</h3><p className="muted">Choose how Sycrely looks on this device.</p><div className="theme-options">{options.map(option=><button key={option.value} className={`theme-option ${preference===option.value?"selected":""}`} onClick={()=>onChange(option.value)}><span className={`theme-swatch ${option.value}`}></span><span><strong>{option.title}</strong><small>{option.description}</small></span>{preference===option.value&&<b>✓</b>}</button>)}</div></div><div className="settings-note"><Shield small/><span>Appearance preferences stay in this browser.</span></div></section></div>;
}

export default function Home() {
  const [booted,setBooted]=useState(false); const [needsSetup,setNeedsSetup]=useState(false); const [key,setKey]=useState<CryptoKey|null>(null);
  const [sessionId,setSessionId]=useState(""); const [messages,setMessages]=useState<Message[]>([]); const [draft,setDraft]=useState(""); const [mode,setMode]=useState<Mode>("balanced");
  const [pending,setPending]=useState<PendingRequest|null>(null); const [sending,setSending]=useState(false); const [showTrace,setShowTrace]=useState(false); const [ending,setEnding]=useState(false); const [saved,setSaved]=useState(false);
  const [themePreference,setThemePreference]=useState<ThemePreference>("system"); const [settingsOpen,setSettingsOpen]=useState(false);
  const endRef=useRef<HTMLDivElement>(null);
  const draftRef=useRef<HTMLTextAreaElement>(null);
  const sendLockRef=useRef(false);
  useEffect(()=>{hasVault().then(value=>{setNeedsSetup(!value);setBooted(true);});},[]);
  useEffect(()=>{const stored=localStorage.getItem("sycrely.theme");queueMicrotask(()=>setThemePreference(stored==="light"||stored==="dark"?stored:"system"));},[]);
  useEffect(()=>{const media=window.matchMedia("(prefers-color-scheme: dark)");const apply=()=>{document.documentElement.dataset.theme=themePreference==="system"?(media.matches?"dark":"light"):themePreference;};apply();media.addEventListener("change",apply);return()=>media.removeEventListener("change",apply);},[themePreference]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[messages,sending]);
  useEffect(()=>{const field=draftRef.current;if(!field)return;field.style.height="auto";field.style.height=`${Math.min(field.scrollHeight,180)}px`;},[draft]);
  useEffect(()=>{if(!key)return;const existing=localStorage.getItem(ACTIVE_SESSION)||crypto.randomUUID();localStorage.setItem(ACTIVE_SESSION,existing);queueMicrotask(()=>setSessionId(existing));loadSession(key,existing).then(session=>{if(session){setMessages(session.messages as Message[]);setMode(session.mode);}}).catch(()=>{});},[key]);
  useEffect(()=>{if(!key||!sessionId)return;const timer=setTimeout(()=>saveSession(key,{id:sessionId,updatedAt:Date.now(),mode,messages}).then(()=>setSaved(true)),250);return()=>clearTimeout(timer);},[key,sessionId,messages,mode]);
  const latestProtected=useMemo(()=>[...messages].reverse().find(m=>m.role==="user"&&m.protectedText),[messages]);
  const latestDelivery=useMemo(()=>[...messages].reverse().find(m=>m.role==="assistant"&&m.delivery)?.delivery,[messages]);
  async function beginSend(event?:FormEvent){event?.preventDefault();if(!draft.trim()||sending)return;const analysis=analyzePrompt(draft.trim(),mode);const request={analysis,capsule:buildTaskCapsule(analysis,mode)};if(analysis.risk==="high"||analysis.risk==="critical"){setPending(request);return;}await send(request);}
  async function send(request:PendingRequest){if(sendLockRef.current)return;sendLockRef.current=true;setSending(true);setPending(null);const original=draft.trim();setDraft("");setMessages(v=>[...v,{id:crypto.randomUUID(),role:"user",text:original,protectedText:request.analysis.protectedText,capsule:request.capsule,aliases:request.analysis.aliases}]);try{const response=await fetch('/api/inference',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({taskCapsule:request.capsule})});const data=await response.json() as {message?:unknown;error?:unknown;meta?:DeliveryMeta};if(!response.ok)throw new Error(typeof data.error==='string'?data.error:'Request failed');if(typeof data.message!=="string")throw new Error("Invalid response");const id=crypto.randomUUID();setMessages(v=>[...v,{id,role:'assistant',text:"",delivery:data.meta}]);for(const word of data.message.split(' ')){await new Promise(r=>setTimeout(r,28));setMessages(v=>v.map(m=>m.id===id?{...m,text:(m.text+" "+word).trim()}:m));}}catch(error){setMessages(v=>[...v,{id:crypto.randomUUID(),role:'assistant',text:`${error instanceof Error?error.message:'The protected AI request could not be completed.'} Your original message remained in the local vault.`}]);}finally{sendLockRef.current=false;setSending(false);}}
  async function remove(){if(sessionId)await deleteSession(sessionId);localStorage.removeItem(ACTIVE_SESSION);setMessages([]);const id=crypto.randomUUID();localStorage.setItem(ACTIVE_SESSION,id);setSessionId(id);setEnding(false);setSaved(false);}
  async function saveAndLock(){if(key&&sessionId)await saveSession(key,{id:sessionId,updatedAt:Date.now(),mode,messages});setEnding(false);setKey(null);}
  if(!booted)return <main className="splash"><div className="brand"><Shield/><span>Sycrely</span></div></main>;
  if(!key)return <LockScreen setup={needsSetup} onReady={value=>{setKey(value);setNeedsSetup(false);}}/>;
  function changeTheme(preference:ThemePreference){setThemePreference(preference);localStorage.setItem("sycrely.theme",preference);}
  return <main className="app-shell"><aside className="sidebar"><div className="brand"><Shield/><span>Sycrely</span></div><button className="new-chat" onClick={()=>{setMessages([]);const id=crypto.randomUUID();localStorage.setItem(ACTIVE_SESSION,id);setSessionId(id);}}><span>＋</span> New private session</button><div className="side-section"><p>ACTIVE SESSION</p><button className="session-item"><span className="session-dot"></span><span><strong>{messages.length?"Private research":"Untitled session"}</strong><small>{saved?"Encrypted locally":"Saving locally..."}</small></span></button></div><div className="side-bottom"><button onClick={()=>setShowTrace(true)}>Privacy trace</button><button onClick={()=>setSettingsOpen(true)}>Settings</button><button onClick={()=>setKey(null)}>Lock vault</button></div></aside>
    <section className="chat-panel"><header className="topbar"><div><p className="eyebrow">PRIVATE SESSION</p><h1>{messages.length?"Private research":"New conversation"}</h1></div><div className="top-actions"><div className="privacy-pill"><span className="pulse"></span>Private Mode <b>On</b></div><button className="mobile-settings icon-button" type="button" onClick={()=>setSettingsOpen(true)} aria-label="Open settings">⚙</button><button className="end-button" onClick={()=>setEnding(true)}>End session</button></div></header>
      <div className="chat-scroll">{!messages.length?<section className="empty-state"><div className="hero-shield"><Shield/></div><p className="eyebrow">YOUR CONTEXT STAYS YOURS</p><h2>What would you like to explore privately?</h2><p>Write naturally. Sycrely checks sensitive context locally and lets you see what is safe to send.</p><div className="starter-grid">{STARTERS.map(item=><button key={item.title} onClick={()=>{setDraft(item.prompt);requestAnimationFrame(()=>draftRef.current?.focus());}}><span>{item.icon}</span><strong>{item.title}</strong><small>Start with a protected draft</small></button>)}</div><div className="promise-row"><span>Local detection</span><span>Protected preview</span><span>Encrypted session</span></div></section>:<div className="messages">{messages.map(message=><article key={message.id} className={`message ${message.role}`}><div className="avatar">{message.role==='user'?'You':'S'}</div><div><p className="message-label">{message.role==='user'?'You - local original':message.delivery?.mode==='live'?'Sycrely - protected AI response':'Sycrely - mock protected response'}</p><div className="bubble">{message.text||<span className="thinking"><i></i><i></i><i></i><b>Working with protected context</b></span>}</div>{message.delivery&&<p className="delivery-receipt"><span className="receipt-dot"></span>{message.delivery.mode==='live'?`OpenRouter · ${message.delivery.model}${message.delivery.usage?.totalTokens?` · ${message.delivery.usage.totalTokens} tokens`:''}`:'Local prototype · no external AI call'}</p>}{message.role==='user'&&<button className="trace-link" onClick={()=>setShowTrace(true)}>View protected version <span>→</span></button>}</div></article>)}<div ref={endRef}/></div>}</div>
      <form className="composer" onSubmit={beginSend}><div className="mode-row"><div className="mode-switch" aria-label="Privacy strength"><button type="button" className={mode==='balanced'?'active':''} onClick={()=>setMode('balanced')}>Balanced</button><button type="button" className={mode==='strict'?'active':''} onClick={()=>setMode('strict')}>Strict</button></div><span className="local-status"><Shield small/> Protection ready on this device</span></div><div className={`input-wrap ${draft.trim()?'has-text':''}`}><textarea ref={draftRef} rows={1} aria-label="Private message" placeholder="Message Sycrely privately..." value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();beginSend();}}}/><div className="composer-tools"><span>Enter to send · Shift + Enter for a new line</span></div><button className="send-button" disabled={!draft.trim()||sending} aria-label="Send protected message">{sending?<span className="send-spinner"></span>:<span>↑</span>}</button></div><p className="composer-note"><span className="status-lock">◆</span> Original encrypted locally. Only the protected version can reach the selected AI.</p></form></section>
    <aside className={`trace-panel ${showTrace?'open':''}`}><button className="trace-close" onClick={()=>setShowTrace(false)}>×</button><p className="eyebrow">PRIVACY TRACE</p><h2>What left this device?</h2>{latestProtected?<><div className="trace-safe">Protected capsule sent</div><p className="trace-copy">{latestProtected.protectedText}</p>{latestProtected.capsule&&<div className="trace-capsule"><b>Protection policy</b><span>{latestProtected.capsule.privacy.policyExplanation}</span><b>Capsule purpose</b><span>{latestProtected.capsule.requestedOutput}</span><b>Local transformations</b><span>{latestProtected.capsule.privacy.transformationCount}</span><b>Private aliases kept locally</b><span>{latestProtected.aliases?.length??0}</span></div>}<div className="trace-list"><span><b>Original</b> Encrypted locally</span><span><b>Destination</b> {latestDelivery?.mode==='live'?`OpenRouter · ${latestDelivery.model}`:'Mock Sycrely API'}</span><span><b>Provider privacy</b> {latestDelivery?.mode==='live'?'ZDR required; data collection denied':'No external provider used'}</span><span><b>Storage</b> No Sycrely server conversation record</span></div></>:<p className="muted">Nothing has been sent in this session yet.</p>}</aside>
    {pending&&<ReviewModal request={pending} onCancel={()=>setPending(null)} onSend={()=>send(pending)} sending={sending}/>} {ending&&<EndSessionModal onClose={()=>setEnding(false)} onSave={saveAndLock} onDelete={remove}/>} {settingsOpen&&<SettingsModal preference={themePreference} onChange={changeTheme} onClose={()=>setSettingsOpen(false)}/>}</main>;
}
