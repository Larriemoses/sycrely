"use client";

import { useEffect, useMemo, useState } from "react";
import { PRIVACY_LABELS, type PrivacyLabelId } from "@/lib/privacy-labels";
import type { TrainingRecord, TrainingSpan } from "@/lib/training-corpus";

type Decision = "unreviewed" | "approved" | "needs-changes" | "rejected";
type RecordReview = { spans: TrainingSpan[]; decision: Decision; note: string; reviewer: string; updatedAt: string };
type ReviewStore = { schemaVersion: "1.0.0"; reviews: Record<string,RecordReview>; audit: AuditEntry[] };
type AuditEntry = { at: string; recordId: string; reviewer: string; action: string; detail: string };
const STORAGE_KEY = "sycrely.annotation-reviews.v1";
const EMPTY_STORE: ReviewStore = { schemaVersion:"1.0.0",reviews:{},audit:[] };

function highlightedText(text:string,spans:TrainingSpan[]){
  const output:React.ReactNode[]=[];let cursor=0;
  for(const span of [...spans].sort((a,b)=>a.start-b.start)){
    if(span.start<cursor)continue;
    output.push(text.slice(cursor,span.start));
    output.push(<mark key={`${span.start}-${span.end}`} title={span.label}>{text.slice(span.start,span.end)}<small>{span.label}</small></mark>);
    cursor=span.end;
  }
  output.push(text.slice(cursor));return output;
}

export default function ReviewClient({records}:{records:TrainingRecord[]}){
  const [store,setStore]=useState<ReviewStore>(EMPTY_STORE);const [ready,setReady]=useState(false);const [index,setIndex]=useState(0);
  const [filter,setFilter]=useState<Decision|"all">("all");const [query,setQuery]=useState("");const [reviewer,setReviewer]=useState("");
  const [selection,setSelection]=useState({start:0,end:0});const [newLabel,setNewLabel]=useState<PrivacyLabelId>("PERSON");
  useEffect(()=>{const timer=window.setTimeout(()=>{try{const saved=localStorage.getItem(STORAGE_KEY);if(saved)setStore(JSON.parse(saved) as ReviewStore);}catch{}setReady(true)},0);return()=>window.clearTimeout(timer)},[]);
  useEffect(()=>{if(ready)localStorage.setItem(STORAGE_KEY,JSON.stringify(store))},[ready,store]);
  const visible=useMemo(()=>records.filter(record=>{const decision=store.reviews[record.id]?.decision??"unreviewed";return(filter==="all"||decision===filter)&&(!query||record.text.toLocaleLowerCase().includes(query.toLocaleLowerCase())||record.id.includes(query));}),[records,store,filter,query]);
  const safeIndex=Math.min(index,Math.max(0,visible.length-1));
  const record=visible[safeIndex];
  const review=record?store.reviews[record.id]:undefined;
  const spans=review?.spans??record?.spans??[];
  const counts=useMemo(()=>records.reduce((value,row)=>{value[store.reviews[row.id]?.decision??"unreviewed"]++;return value},{unreviewed:0,approved:0,"needs-changes":0,rejected:0} as Record<Decision,number>),[records,store]);
  function update(action:string,detail:string,change:(current:RecordReview)=>RecordReview){
    if(!record||!reviewer.trim())return;
    const current=store.reviews[record.id]??{spans:record.spans,decision:"unreviewed",note:"",reviewer:"",updatedAt:""};
    const at=new Date().toISOString();
    setStore(value=>({...value,reviews:{...value.reviews,[record.id]:{...change(current),reviewer:reviewer.trim(),updatedAt:at}},audit:[...value.audit,{at,recordId:record.id,reviewer:reviewer.trim(),action,detail}]}));
  }
  function changeDecision(decision:Decision){update("decision",decision,current=>({...current,decision}))}
  function addSpan(){if(!record||selection.end<=selection.start)return;const text=record.text.slice(selection.start,selection.end);if(spans.some(span=>selection.start<span.end&&selection.end>span.start))return;update("add-span",`${newLabel}:${selection.start}-${selection.end}`,current=>({...current,spans:[...current.spans,{...selection,text,label:newLabel}].sort((a,b)=>a.start-b.start)}));setSelection({start:0,end:0})}
  function removeSpan(target:TrainingSpan){update("remove-span",`${target.label}:${target.start}-${target.end}`,current=>({...current,spans:current.spans.filter(span=>!(span.start===target.start&&span.end===target.end))}))}
  function relabelSpan(target:TrainingSpan,label:PrivacyLabelId){update("relabel-span",`${target.label}->${label}:${target.start}-${target.end}`,current=>({...current,spans:current.spans.map(span=>span.start===target.start&&span.end===target.end?{...span,label}:span)}))}
  function setNote(note:string){update("note","review note updated",current=>({...current,note}))}
  function exportReviews(){const payload={exportedAt:new Date().toISOString(),datasetRecords:records.length,...store};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));const anchor=document.createElement("a");anchor.href=url;anchor.download="sycrely-annotation-review.json";anchor.click();URL.revokeObjectURL(url)}
  if(!ready)return <section className="annotation-loading">Opening local review workspace…</section>;
  return <div className="annotation-shell">
    <aside className="annotation-sidebar">
      <label>Reviewer name<input value={reviewer} onChange={event=>setReviewer(event.target.value)} placeholder="Required for audit log"/></label>
      <div className="review-counts"><button onClick={()=>{setFilter("all");setIndex(0)}} className={filter==="all"?"active":""}><b>{records.length}</b>All</button>{(["unreviewed","approved","needs-changes","rejected"] as Decision[]).map(value=><button key={value} onClick={()=>{setFilter(value);setIndex(0)}} className={filter===value?"active":""}><b>{counts[value]}</b>{value.replace("-"," ")}</button>)}</div>
      <input className="review-search" value={query} onChange={event=>{setQuery(event.target.value);setIndex(0)}} placeholder="Search prompts or ID"/>
      <div className="record-list">{visible.map((row,rowIndex)=><button key={row.id} onClick={()=>{setIndex(rowIndex);setSelection({start:0,end:0})}} className={rowIndex===safeIndex?"selected":""}><span>{row.id}</span><small>{store.reviews[row.id]?.decision??"unreviewed"}</small><p>{row.text}</p></button>)}</div>
      <button className="secondary export-review" onClick={exportReviews} disabled={!store.audit.length}>Export review file</button>
    </aside>
    <section className="review-workspace">{record?<>
      <div className="review-toolbar"><div><span>{record.id} · {record.split}</span><strong>{review?.decision??"unreviewed"}</strong></div><nav><button onClick={()=>setIndex(Math.max(0,safeIndex-1))} disabled={safeIndex===0}>←</button><span>{safeIndex+1} / {visible.length}</span><button onClick={()=>setIndex(Math.min(visible.length-1,safeIndex+1))} disabled={safeIndex===visible.length-1}>→</button></nav></div>
      {!reviewer.trim()&&<p className="review-warning">Enter a reviewer name before changing annotations. This makes every correction auditable.</p>}
      <article className="annotation-preview">{highlightedText(record.text,spans)}</article>
      <label className="selection-box">Select a missed sensitive phrase<textarea value={record.text} readOnly onSelect={event=>{const target=event.currentTarget;setSelection({start:target.selectionStart,end:target.selectionEnd})}}/><div><span>{selection.end>selection.start?`Selected: “${record.text.slice(selection.start,selection.end)}”`:"Highlight words inside the box"}</span><select value={newLabel} onChange={event=>setNewLabel(event.target.value as PrivacyLabelId)}>{PRIVACY_LABELS.map(label=><option key={label.id} value={label.id}>{label.id} — {label.title}</option>)}</select><button className="primary" onClick={addSpan} disabled={!reviewer.trim()||selection.end<=selection.start}>Add span</button></div></label>
      <section className="span-editor"><h2>Sensitive spans <span>{spans.length}</span></h2>{spans.length?spans.map(span=><div key={`${span.start}-${span.end}`}><p><strong>{span.text}</strong><small>Characters {span.start}–{span.end}</small></p><select value={span.label} onChange={event=>relabelSpan(span,event.target.value as PrivacyLabelId)} disabled={!reviewer.trim()}>{PRIVACY_LABELS.map(label=><option key={label.id} value={label.id}>{label.id}</option>)}</select><button onClick={()=>removeSpan(span)} disabled={!reviewer.trim()} aria-label={`Remove ${span.text}`}>Remove</button></div>):<p className="lab-empty">This is currently a harmless control with no sensitive spans.</p>}</section>
      <label className="review-note">Review note<textarea key={record.id} defaultValue={review?.note??""} onBlur={event=>{if(event.target.value!==(review?.note??""))setNote(event.target.value)}} disabled={!reviewer.trim()} placeholder="Explain corrections or uncertainty"/></label>
      <div className="decision-row"><button onClick={()=>changeDecision("rejected")} disabled={!reviewer.trim()}>Reject</button><button onClick={()=>changeDecision("needs-changes")} disabled={!reviewer.trim()}>Needs changes</button><button className="primary" onClick={()=>changeDecision("approved")} disabled={!reviewer.trim()}>Approve annotation</button></div>
    </>:<div className="annotation-empty"><h2>No records match this filter</h2><button className="secondary" onClick={()=>{setFilter("all");setQuery("")}}>Clear filters</button></div>}</section>
  </div>;
}
