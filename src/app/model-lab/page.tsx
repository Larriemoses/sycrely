"use client";

import { useState } from "react";
import Link from "next/link";

const MODEL_ID = "Xenova/distilbert-base-multilingual-cased-ner-hrl";
const SYNTHETIC_CASES = [
  "His name is Kunle Arowolo and the company is Green Basket Media Ltd in Lagos.",
  "Amina Bello studies at Cedar Bridge College in Abuja.",
  "Abeg help Chinedu Okafor write to Sunrise Parcel Services in Enugu.",
] as const;
type Entity = { entity_group?: string; entity?: string; word?: string; score?: number; start?: number; end?: number };
type LabStatus = "idle" | "loading" | "ready" | "running" | "failed";
let cachedPipeline: ((input: string, options?: Record<string, unknown>) => Promise<unknown>) | null = null;

export default function ModelLab() {
  const [status,setStatus]=useState<LabStatus>("idle"); const [selected,setSelected]=useState(0); const [entities,setEntities]=useState<Entity[]>([]);
  const [loadMs,setLoadMs]=useState<number|null>(null); const [runMs,setRunMs]=useState<number|null>(null); const [error,setError]=useState("");
  async function loadModel(){if(cachedPipeline){setStatus("ready");return;}setStatus("loading");setError("");const started=performance.now();try{const {env,pipeline}=await import("@huggingface/transformers");env.allowLocalModels=false;env.useBrowserCache=true;cachedPipeline=await pipeline("token-classification",MODEL_ID,{dtype:"q8",device:"wasm"}) as unknown as typeof cachedPipeline;setLoadMs(Math.round(performance.now()-started));setStatus("ready");}catch(reason){setError(reason instanceof Error?reason.message:"The local model could not be loaded.");setStatus("failed");}}
  async function runCase(){if(!cachedPipeline)return;setStatus("running");setError("");setEntities([]);const started=performance.now();try{const result=await cachedPipeline(SYNTHETIC_CASES[selected],{aggregation_strategy:"simple"});setRunMs(Math.round(performance.now()-started));setEntities(Array.isArray(result)?result as Entity[]:[]);setStatus("ready");}catch(reason){setError(reason instanceof Error?reason.message:"The synthetic test could not run.");setStatus("failed");}}
  return <main className="model-lab-page"><section className="lab-shell">
    <header className="lab-header"><div><p className="eyebrow">LOCAL MODEL LAB</p><h1>Test the privacy model safely</h1><p>Experimental development tool. Only the synthetic sentence selected below is processed.</p></div><Link href="/">← Return to Sycrely</Link></header>
    <div className="lab-warning"><strong>Not connected to Private Mode</strong><span>This candidate cannot approve or send a real conversation. Loading downloads model files; inference then runs inside this browser.</span></div>
    <section className="lab-card"><div className="lab-model-row"><div><small>Candidate</small><strong>{MODEL_ID}</strong><span>Quantized · WebAssembly · approximately 135 MB</span></div><span className={`lab-state ${status}`}>{status.replace("idle","not loaded")}</span></div><div className="lab-actions"><button className="primary" onClick={loadModel} disabled={status==="loading"||status==="running"}>{status==="loading"?"Downloading and preparing…":cachedPipeline?"Model ready":"Load model"}</button>{cachedPipeline&&<button className="secondary" onClick={runCase} disabled={status==="running"}>{status==="running"?"Detecting locally…":"Run selected test"}</button>}</div>{error&&<p className="lab-error" role="alert">{error}</p>}<div className="lab-metrics"><span><b>{loadMs===null?"—":`${loadMs} ms`}</b>First load</span><span><b>{runMs===null?"—":`${runMs} ms`}</b>Latest inference</span><span><b>{entities.length}</b>Entities found</span></div></section>
    <section className="lab-card"><h2>Synthetic test prompt</h2><div className="lab-case-list">{SYNTHETIC_CASES.map((value,index)=><button key={value} className={selected===index?"selected":""} onClick={()=>{setSelected(index);setEntities([]);setRunMs(null);}}><span>{index+1}</span>{value}</button>)}</div></section>
    <section className="lab-card"><h2>Detected spans</h2>{entities.length?<div className="entity-table">{entities.map((entity,index)=><div key={`${entity.start}-${entity.end}-${index}`}><strong>{entity.word??"Unknown span"}</strong><span>{(entity.entity_group??entity.entity??"unknown").replace(/^B-|^I-/,"")}</span><small>{Math.round((entity.score??0)*100)}%</small></div>)}</div>:<p className="lab-empty">Load the model and run a synthetic test. No real prompt is accepted on this page.</p>}</section>
    <footer className="lab-footer">A successful result here proves only that browser inference works. It does not make this model safe enough for production.</footer>
  </section></main>;
}
