import React,{useMemo,useState} from 'react';
import { getAvailableLooks,getPostseasonColorsByAbbr,getTeamColorsByAbbr } from '../config/teamColors';

function Paint({colors}){return <div className="theme-lab-paint" style={{background:colors.gradient?`linear-gradient(135deg,${colors.main},${colors.alt})`:colors.main,borderColor:colors.border,color:colors.text}}/>}
function Swatches({colors}){return <div className="theme-lab-swatches"><i style={{background:colors.main}}/><i style={{background:colors.alt}}/><i style={{background:colors.border}}/><i style={{background:colors.text}}/></div>}

export default function NMLBThemeLab({teams=[],playoffPicture=[]}){
  const sorted=useMemo(()=>[...teams].sort((a,b)=>String(a.abbr).localeCompare(String(b.abbr))),[teams]);
  const [abbr,setAbbr]=useState(sorted[0]?.abbr||'SF');
  const looks=getAvailableLooks(abbr);
  const [lookKey,setLookKey]=useState('primary:0');
  const selected=sorted.find(t=>t.abbr===abbr)||sorted[0];
  const [mode,indexRaw]=lookKey.split(':'); const index=Number(indexRaw||0);
  const colors=getTeamColorsByAbbr(abbr,mode,index);
  const post=getPostseasonColorsByAbbr(abbr);
  const field=useMemo(()=>{
    const ids=new Set();
    (playoffPicture||[]).forEach(p=>[...(p.divisionLeaders||[]),...(p.wildcardTeams||[]).slice(0,8)].forEach(t=>t?.id&&ids.add(t.id)));
    return sorted.filter(t=>ids.has(t.id));
  },[playoffPicture,sorted]);
  const changeTeam=e=>{setAbbr(e.target.value);setLookKey('primary:0')};
  return <div className="theme-lab">
    <section className="card theme-lab-hero"><div><small>NMLB COMMISSIONER TOOLS · PREVIEW ONLY</small><h2>Theme Lab</h2><p>Test the real colors from <code>src/config/teamColors.js</code> without touching Firebase, the schedule, or a live game.</p></div><div className="theme-lab-safe">READ ONLY<br/><b>NO LEAGUE DATA WRITES</b></div></section>
    <section className="card theme-lab-controls"><label><span>TEAM</span><select value={abbr} onChange={changeTeam}>{sorted.map(t=><option key={t.id} value={t.abbr}>{t.abbr} · {t.city} {t.name}</option>)}</select></label><label><span>LOOK</span><select value={lookKey} onChange={e=>setLookKey(e.target.value)}>{looks.map(x=><option key={`${x.mode}:${x.index}`} value={`${x.mode}:${x.index}`}>{x.label}</option>)}</select></label><div><span>CURRENT LOOK</span><strong>{colors.name||looks.find(x=>`${x.mode}:${x.index}`===lookKey)?.label||'Primary'}</strong><Swatches colors={colors}/></div><div><span>POSTSEASON LOOK</span><strong>Post / fallback</strong><Swatches colors={post}/></div></section>
    <section className="theme-lab-preview-grid">
      <article className="theme-lab-scorebug" style={{'--main':colors.main,'--alt':colors.alt,'--border':colors.border,'--text':colors.text}}><small>NMLB NETWORK · LIVE</small><div><b>{abbr}</b><strong>4</strong><span>7th · 1 OUT</span><strong>3</strong><b>OPP</b></div></article>
      <article className="theme-lab-network" style={{'--main':colors.main,'--alt':colors.alt,'--border':colors.border,'--text':colors.text}}><small>NMLB PRIMETIME</small><h3>{selected?.city||abbr} enters the spotlight</h3><p>Broadcast lower-third and headline treatment.</p></article>
      <article className="theme-lab-bracket" style={{'--main':post.main,'--alt':post.alt,'--border':post.border,'--text':post.text}}><small>POSTSEASON SERIES</small><div><b>#2 {abbr}</b><strong>1</strong></div><div><b>#7 OPP</b><strong>0</strong></div><em>{abbr} LEADS 1–0</em></article>
      <article className="theme-lab-banner" style={{'--main':post.main,'--alt':post.alt,'--border':post.border,'--text':post.text}}><small>NMLB CHAMPIONSHIP CEREMONY</small><div className="theme-lab-banner-shape"><b>{abbr}</b><span>LEAGUE CHAMPIONS</span></div><p>Banner + ceremony palette preview.</p></article>
      <article className="theme-lab-confetti"><small>CONFETTI PALETTE</small><h3>{abbr} Celebration Rain</h3><div className="theme-lab-confetti-field">{Array.from({length:34},(_,i)=><i key={i} style={{background:[post.main,post.alt,post.border,'#ffffff'][i%4],left:`${(i*29)%96}%`,top:`${(i*47)%88}%`,transform:`rotate(${i*31}deg)`}}/>)}</div></article>
      <article className="theme-lab-palette-card"><small>RAW PALETTE</small><Paint colors={colors}/><dl><div><dt>Main</dt><dd>{colors.main}</dd></div><div><dt>Alt</dt><dd>{colors.alt}</dd></div><div><dt>Border</dt><dd>{colors.border}</dd></div><div><dt>Text</dt><dd>{colors.text}</dd></div></dl></article>
    </section>
    <section className="card theme-lab-post-grid"><div><small>POSTSEASON GRID</small><h3>Likely / qualified field</h3><p>Every card below uses <code>getPostseasonColorsByAbbr()</code>, the same postseason palette resolver used by the real presentation.</p></div><div>{(field.length?field:sorted).map(t=>{const c=getPostseasonColorsByAbbr(t.abbr);return <article key={t.id} style={{background:c.gradient?`linear-gradient(135deg,${c.main},${c.alt})`:c.main,borderColor:c.border,color:c.text}}><b>{t.abbr}</b><span>{t.city}</span><Swatches colors={c}/></article>})}</div></section>
  </div>;
}
