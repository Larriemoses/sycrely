"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { analyzePrompt, type AliasEntry, type PrivacyAnalysis } from "@/lib/privacy";
import { buildTaskCapsule, type TaskCapsule } from "@/lib/capsule";
import { createVault, deleteSession, hasVault, loadSession, saveSession, unlockVault } from "@/lib/vault";

type Message = { id: string; role: "user" | "assistant"; text: string; protectedText?: string; capsule?: TaskCapsule; aliases?: AliasEntry[] };
type Mode = "balanced" | "strict";
type Theme = "dark" | "light";
type PendingRequest = { analysis: PrivacyAnalysis; capsule: TaskCapsule };
const ACTIVE_SESSION = "sycrely.active-session";

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

export default function Home() {
  const [booted,setBooted]=useState(false); const [needsSetup,setNeedsSetup]=useState(false); const [key,setKey]=useState<CryptoKey|null>(null);
  const [sessionId,setSessionId]=useState(""); const [messages,setMessages]=useState<Message[]>([]); const [draft,setDraft]=useState(""); const [mode,setMode]=useState<Mode>("balanced");
  const [pending,setPending]=useState<PendingRequest|null>(null); const [sending,setSending]=useState(false); const [showTrace,setShowTrace]=useState(false); const [ending,setEnding]=useState(false); const [saved,setSaved]=useState(false);
  const [theme,setTheme]=useState<Theme>("dark");
  const endRef=useRef<HTMLDivElement>(null);
  const sendLockRef=useRef(false);
  useEffect(()=>{hasVault().then(value=>{setNeedsSetup(!value);setBooted(true);});},[]);
  useEffect(()=>{const stored=localStorage.getItem("sycrely.theme");const selected=stored==="light"?"light":"dark";document.documentElement.dataset.theme=selected;queueMicrotask(()=>setTheme(selected));},[]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[messages,sending]);
  useEffect(()=>{if(!key)return;const existing=localStorage.getItem(ACTIVE_SESSION)||crypto.randomUUID();localStorage.setItem(ACTIVE_SESSION,existing);queueMicrotask(()=>setSessionId(existing));loadSession(key,existing).then(session=>{if(session){setMessages(session.messages as Message[]);setMode(session.mode);}}).catch(()=>{});},[key]);
  useEffect(()=>{if(!key||!sessionId)return;const timer=setTimeout(()=>saveSession(key,{id:sessionId,updatedAt:Date.now(),mode,messages}).then(()=>setSaved(true)),250);return()=>clearTimeout(timer);},[key,sessionId,messages,mode]);
  const latestProtected=useMemo(()=>[...messages].reverse().find(m=>m.role==="user"&&m.protectedText),[messages]);
  async function beginSend(event?:FormEvent){event?.preventDefault();if(!draft.trim()||sending)return;const analysis=analyzePrompt(draft.trim(),mode);const request={analysis,capsule:buildTaskCapsule(analysis,mode)};if(analysis.risk==="high"||analysis.risk==="critical"){setPending(request);return;}await send(request);}
  async function send(request:PendingRequest){if(sendLockRef.current)return;sendLockRef.current=true;setSending(true);setPending(null);const original=draft.trim();setDraft("");setMessages(v=>[...v,{id:crypto.randomUUID(),role:"user",text:original,protectedText:request.analysis.protectedText,capsule:request.capsule,aliases:request.analysis.aliases}]);try{const response=await fetch('/api/inference',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({taskCapsule:request.capsule})});if(!response.ok)throw new Error('Request failed');const data=await response.json();const id=crypto.randomUUID();setMessages(v=>[...v,{id,role:'assistant',text:""}]);for(const word of String(data.message).split(' ')){await new Promise(r=>setTimeout(r,28));setMessages(v=>v.map(m=>m.id===id?{...m,text:(m.text+" "+word).trim()}:m));}}catch{setMessages(v=>[...v,{id:crypto.randomUUID(),role:'assistant',text:'The protected mock request could not be completed. Your original message remained in the local vault.'}]);}finally{sendLockRef.current=false;setSending(false);}}
  async function remove(){if(sessionId)await deleteSession(sessionId);localStorage.removeItem(ACTIVE_SESSION);setMessages([]);const id=crypto.randomUUID();localStorage.setItem(ACTIVE_SESSION,id);setSessionId(id);setEnding(false);setSaved(false);}
  async function saveAndLock(){if(key&&sessionId)await saveSession(key,{id:sessionId,updatedAt:Date.now(),mode,messages});setEnding(false);setKey(null);}
  if(!booted)return <main className="splash"><div className="brand"><Shield/><span>Sycrely</span></div></main>;
  if(!key)return <LockScreen setup={needsSetup} onReady={value=>{setKey(value);setNeedsSetup(false);}}/>;
  function switchTheme(){const next=theme==="dark"?"light":"dark";setTheme(next);document.documentElement.dataset.theme=next;localStorage.setItem("sycrely.theme",next);}
  return <main className="app-shell"><aside className="sidebar"><div className="brand"><Shield/><span>Sycrely</span></div><button className="new-chat" onClick={()=>{setMessages([]);const id=crypto.randomUUID();localStorage.setItem(ACTIVE_SESSION,id);setSessionId(id);}}>+ New private session</button><div className="side-section"><p>ACTIVE SESSION</p><button className="session-item"><span className="session-dot"></span><span><strong>{messages.length?"Private research":"Untitled session"}</strong><small>{saved?"Encrypted locally":"Saving locally..."}</small></span></button></div><div className="side-bottom"><button onClick={()=>setShowTrace(true)}>Privacy trace</button><button onClick={()=>setKey(null)}>Lock vault</button></div></aside>
    <section className="chat-panel"><header className="topbar"><div><p className="eyebrow">PRIVATE SESSION</p><h1>{messages.length?"Private research":"New conversation"}</h1></div><div className="top-actions"><button className="theme-button" type="button" onClick={switchTheme} aria-label={`Switch to ${theme==="dark"?"light":"dark"} theme`}>{theme==="dark"?"Light":"Dark"}</button><div className="privacy-pill"><span className="pulse"></span>Private Mode <b>On</b></div><button className="end-button" onClick={()=>setEnding(true)}>End session</button></div></header>
      <div className="chat-scroll">{!messages.length?<section className="empty-state"><div className="hero-shield"><Shield/></div><p className="eyebrow">YOUR CONTEXT STAYS YOURS</p><h2>What would you like to explore privately?</h2><p>Write naturally. Sycrely will check for sensitive context on this device and show you exactly what is safe to send.</p><div className="promise-row"><span>Local detection</span><span>Protected preview</span><span>Encrypted session</span></div></section>:<div className="messages">{messages.map(message=><article key={message.id} className={`message ${message.role}`}><div className="avatar">{message.role==='user'?'You':'S'}</div><div><p className="message-label">{message.role==='user'?'You - local original':'Sycrely - mock protected response'}</p><div className="bubble">{message.text||<span className="typing">Thinking securely...</span>}</div>{message.role==='user'&&<button className="trace-link" onClick={()=>setShowTrace(true)}>Protected before sending</button>}</div></article>)}<div ref={endRef}/></div>}</div>
      <form className="composer" onSubmit={beginSend}><div className="mode-row"><button type="button" className={mode==='balanced'?'active':''} onClick={()=>setMode('balanced')}>Balanced</button><button type="button" className={mode==='strict'?'active':''} onClick={()=>setMode('strict')}>Strict</button><span><Shield small/> Analysis runs on this device</span></div><div className="input-wrap"><textarea aria-label="Private message" placeholder="Ask anything. Sensitive context will be protected before sending..." value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();beginSend();}}}/><button className="send-button" disabled={!draft.trim()||sending} aria-label="Send">↑</button></div><p className="composer-note">The original is encrypted locally. External AI receives only the protected version.</p></form></section>
    <aside className={`trace-panel ${showTrace?'open':''}`}><button className="trace-close" onClick={()=>setShowTrace(false)}>×</button><p className="eyebrow">PRIVACY TRACE</p><h2>What left this device?</h2>{latestProtected?<><div className="trace-safe">Protected capsule sent</div><p className="trace-copy">{latestProtected.protectedText}</p>{latestProtected.capsule&&<div className="trace-capsule"><b>Protection policy</b><span>{latestProtected.capsule.privacy.policyExplanation}</span><b>Capsule purpose</b><span>{latestProtected.capsule.requestedOutput}</span><b>Local transformations</b><span>{latestProtected.capsule.privacy.transformationCount}</span><b>Private aliases kept locally</b><span>{latestProtected.aliases?.length??0}</span></div>}<div className="trace-list"><span><b>Original</b> Encrypted locally</span><span><b>Destination</b> Mock Sycrely API</span><span><b>Storage</b> No server conversation record</span></div></>:<p className="muted">Nothing has been sent in this session yet.</p>}</aside>
    {pending&&<ReviewModal request={pending} onCancel={()=>setPending(null)} onSend={()=>send(pending)} sending={sending}/>} {ending&&<EndSessionModal onClose={()=>setEnding(false)} onSave={saveAndLock} onDelete={remove}/>}</main>;
}
