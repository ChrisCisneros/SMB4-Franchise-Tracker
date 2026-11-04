import React,{useEffect,useMemo,useState} from 'react';
import { getAvailableLooks,getPostseasonColorsByAbbr,getTeamColorsByAbbr } from '../config/teamColors';

const HEX=/^#[0-9a-fA-F]{6}$/;
const cleanHex=(value,fallback)=>HEX.test(String(value||'').trim())?String(value).trim():fallback;
function Paint({colors}){return <div className="theme-lab-paint" style={{background:colors.gradient?`linear-gradient(135deg,${colors.main},${colors.alt})`:colors.main,borderColor:colors.border,color:colors.text}}/>}
function Swatches({colors}){return <div className="theme-lab-swatches"><i style={{background:colors.main}}/><i style={{background:colors.alt}}/><i style={{background:colors.border}}/><i style={{background:colors.text}}/></div>}
function ColorField({label,value,onChange}){
  const valid=HEX.test(value);
  return <label className={`theme-lab-color-field ${valid?'':'invalid'}`}><span>{label}</span><div><input type="color" value={valid?value:'#000000'} onChange={e=>onChange(e.target.value)}/><input value={value} maxLength={7} spellCheck="false" onChange={e=>onChange(e.target.value.startsWith('#')?e.target.value:`#${e.target.value}`)} /></div></label>
}

export default function NMLBThemeLab({teams=[],playoffPicture=[]}){
  const sorted=useMemo(()=>[...teams].sort((a,b)=>String(a.abbr).localeCompare(String(b.abbr))),[teams]);
  const [abbr,setAbbr]=useState(sorted[0]?.abbr||'SF');
  const looks=getAvailableLooks(abbr);
  const [lookKey,setLookKey]=useState('primary:0');
  const selected=sorted.find(t=>t.abbr===abbr)||sorted[0];
  const [mode,indexRaw]=lookKey.split(':'); const index=Number(indexRaw||0);
  const savedColors=getTeamColorsByAbbr(abbr,mode,index);
  const savedPost=getPostseasonColorsByAbbr(abbr);
  const [sandboxOn,setSandboxOn]=useState(true);
  const [sandbox,setSandbox]=useState(()=>({...savedPost}));
  const [copied,setCopied]=useState(false);
  const field=useMemo(()=>{
    const ids=new Set();
    (playoffPicture||[]).forEach(p=>[...(p.divisionLeaders||[]),...(p.wildcardTeams||[]).slice(0,8)].forEach(t=>t?.id&&ids.add(t.id)));
    return sorted.filter(t=>ids.has(t.id));
  },[playoffPicture,sorted]);
  useEffect(()=>{setSandbox({...getPostseasonColorsByAbbr(abbr)});setCopied(false)},[abbr]);
  const changeTeam=e=>{setAbbr(e.target.value);setLookKey('primary:0')};
  const loadPalette=(c)=>setSandbox({main:c.main,alt:c.alt,border:c.border,text:c.text,gradient:Boolean(c.gradient)});
  const palette={
    main:cleanHex(sandbox.main,savedPost.main),
    alt:cleanHex(sandbox.alt,savedPost.alt),
    border:cleanHex(sandbox.border,savedPost.border),
    text:cleanHex(sandbox.text,savedPost.text),
    gradient:Boolean(sandbox.gradient),
  };
  const colors=sandboxOn?palette:savedColors;
  const post=sandboxOn?palette:savedPost;
  const codeLine=`${abbr}: ["${palette.main}", "${palette.alt}", "${palette.border}", "${palette.text}", ${palette.gradient}],`;
  const copyLine=async()=>{try{await navigator.clipboard.writeText(codeLine);setCopied(true);setTimeout(()=>setCopied(false),1600)}catch{setCopied(false)}};
  return <div className="theme-lab">
    <section className="card theme-lab-hero"><div><small>NMLB COMMISSIONER TOOLS · PREVIEW ONLY</small><h2>Theme Lab</h2><p>Experiment freely. Nothing here writes to Firebase or changes a live game. When the palette looks right, copy one line into the postseason edit zone in <code>src/config/teamColors.js</code>.</p></div><div className="theme-lab-safe">SANDBOX<br/><b>NO LEAGUE DATA WRITES</b></div></section>
    <section className="card theme-lab-controls"><label><span>TEAM</span><select value={abbr} onChange={changeTeam}>{sorted.map(t=><option key={t.id} value={t.abbr}>{t.abbr} · {t.city} {t.name}</option>)}</select></label><label><span>STARTING LOOK</span><select value={lookKey} onChange={e=>setLookKey(e.target.value)}>{looks.map(x=><option key={`${x.mode}:${x.index}`} value={`${x.mode}:${x.index}`}>{x.label}</option>)}</select></label><div><span>SAVED LOOK</span><strong>{savedColors.name||looks.find(x=>`${x.mode}:${x.index}`===lookKey)?.label||'Primary'}</strong><Swatches colors={savedColors}/></div><div><span>SAVED POST</span><strong>Post / fallback</strong><Swatches colors={savedPost}/></div></section>
    <section className="card theme-lab-sandbox">
      <div className="theme-lab-sandbox-head"><div><small>PALETTE SANDBOX</small><h3>Try the colors before touching code</h3></div><label className="theme-lab-switch"><input type="checkbox" checked={sandboxOn} onChange={e=>setSandboxOn(e.target.checked)}/><span>Use sandbox in previews</span></label></div>
      <div className="theme-lab-color-grid"><ColorField label="MAIN" value={sandbox.main} onChange={v=>setSandbox(s=>({...s,main:v}))}/><ColorField label="ALT" value={sandbox.alt} onChange={v=>setSandbox(s=>({...s,alt:v}))}/><ColorField label="BORDER" value={sandbox.border} onChange={v=>setSandbox(s=>({...s,border:v}))}/><ColorField label="TEXT" value={sandbox.text} onChange={v=>setSandbox(s=>({...s,text:v}))}/></div>
      <div className="theme-lab-sandbox-actions"><label className="theme-lab-gradient"><input type="checkbox" checked={sandbox.gradient} onChange={e=>setSandbox(s=>({...s,gradient:e.target.checked}))}/> Gradient</label><button type="button" onClick={()=>loadPalette(savedColors)}>Load selected look</button><button type="button" onClick={()=>loadPalette(savedPost)}>Reset to saved Post</button></div>
      <div className="theme-lab-copyline"><span>PASTE INTO <code>POSTSEASON_PALETTES</code></span><code>{codeLine}</code><button type="button" onClick={copyLine}>{copied?'COPIED!':'COPY LINE'}</button></div>
    </section>
    <section className="theme-lab-preview-grid">
      <article className="theme-lab-scorebug" style={{'--main':colors.main,'--alt':colors.alt,'--border':colors.border,'--text':colors.text}}><small>NMLB NETWORK · LIVE</small><div><b>{abbr}</b><strong>4</strong><span>7th · 1 OUT</span><strong>3</strong><b>OPP</b></div></article>
      <article className="theme-lab-network" style={{'--main':colors.main,'--alt':colors.alt,'--border':colors.border,'--text':colors.text}}><small>NMLB PRIMETIME</small><h3>{selected?.city||abbr} enters the spotlight</h3><p>Broadcast lower-third and headline treatment.</p></article>
      <article className="theme-lab-bracket" style={{'--main':post.main,'--alt':post.alt,'--border':post.border,'--text':post.text}}><small>POSTSEASON SERIES</small><div><b>#2 {abbr}</b><strong>1</strong></div><div><b>#7 OPP</b><strong>0</strong></div><em>{abbr} LEADS 1–0</em></article>
      <article className="theme-lab-banner" style={{'--main':post.main,'--alt':post.alt,'--border':post.border,'--text':post.text}}><small>NMLB CHAMPIONSHIP CEREMONY</small><div className="theme-lab-banner-shape"><b>{abbr}</b><span>LEAGUE CHAMPIONS</span></div><p>Banner + ceremony palette preview.</p></article>
      <article className="theme-lab-confetti"><small>CONFETTI PALETTE</small><h3>{abbr} Celebration Rain</h3><div className="theme-lab-confetti-field">{Array.from({length:46},(_,i)=><i key={i} style={{background:[post.main,post.alt,post.border,'#ffffff'][i%4],left:`${(i*29)%96}%`,top:`${(i*47)%88}%`,transform:`rotate(${i*31}deg)`}}/>)}</div></article>
      <article className="theme-lab-palette-card"><small>ACTIVE PREVIEW PALETTE</small><Paint colors={colors}/><dl><div><dt>Main</dt><dd>{colors.main}</dd></div><div><dt>Alt</dt><dd>{colors.alt}</dd></div><div><dt>Border</dt><dd>{colors.border}</dd></div><div><dt>Text</dt><dd>{colors.text}</dd></div></dl></article>
    </section>
    <section className="card theme-lab-post-grid"><div><small>POSTSEASON GRID</small><h3>Likely / qualified field</h3><p>Saved team cards use <code>getPostseasonColorsByAbbr()</code>. The selected team above can be sandboxed without changing these saved values.</p></div><div>{(field.length?field:sorted).map(t=>{const c=getPostseasonColorsByAbbr(t.abbr);return <article key={t.id} style={{background:c.gradient?`linear-gradient(135deg,${c.main},${c.alt})`:c.main,borderColor:c.border,color:c.text}}><b>{t.abbr}</b><span>{t.city}</span><Swatches colors={c}/></article>})}</div></section>
  </div>;
}
