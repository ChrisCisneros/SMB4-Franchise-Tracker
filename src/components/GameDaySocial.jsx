import React,{useEffect,useRef,useState} from 'react';
import { getTeamColorsByAbbr } from '../config/teamColors';

function Badge({team}){const c=getTeamColorsByAbbr(team?.abbr);return <span className="gds-team-badge" style={{'--gds-main':c.main,'--gds-alt':c.alt,'--gds-border':c.border,'--gds-text':c.text}}>{team?.abbr||'FC'}</span>}
function formatWatching(n=0){if(n>=1000000)return `${(n/1000000).toFixed(n>=10000000?0:1)}M`;if(n>=1000)return `${(n/1000).toFixed(n>=10000?0:1)}K`;return String(n)}
function formatPostTime(ts){if(!ts)return '';try{return new Date(ts).toLocaleTimeString([],{hour:'numeric',minute:'2-digit',second:'2-digit'})}catch{return ''}}
function Post({post,compact=false}){return <article className={`gds-post ${post.tone||''} ${post.kind==='team-official'?'team-official':''} ${compact?'compact':''} ${post.isNew?'is-new':''}`}><div className="gds-avatar">{post.team?<Badge team={post.team}/>:<span className={`gds-league-avatar ${post.tone==='official'?'official':''}`}>{post.tone==='official'?'L':'FC'}</span>}</div><div><div className="gds-meta"><strong>{post.name}</strong><span>{post.handle}</span><em>{post.badge}</em>{post.arrivedAt&&<time dateTime={new Date(post.arrivedAt).toISOString()}>{formatPostTime(post.arrivedAt)}</time>}</div><p>{post.text}</p></div></article>}

export default function GameDaySocial({social,onOpenFandom,compact=false}){
  const [compactFeed,setCompactFeed]=useState([]);
  const matchupRef=useRef('');
  const eventRef=useRef('');
  const initializedRef=useRef(false);

  useEffect(()=>{
    if(!compact||!social||social.phase==='idle')return;
    const matchupKey=`${social.away?.id||''}-${social.home?.id||''}`;
    if(matchupRef.current!==matchupKey){
      matchupRef.current=matchupKey;
      eventRef.current='';
      initializedRef.current=false;
      setCompactFeed([]);
    }
    const candidates=(social.streamPosts?.length?social.streamPosts:social.posts||[]).filter(Boolean);
    if(!candidates.length)return;
    const token=social.eventToken||social.streamKey||'';
    const eventChanged=token!==eventRef.current;
    const first=!initializedRef.current;
    let amount=0;
    if(first)amount=Math.min(5,candidates.length);
    else if(eventChanged&&social.isBigMoment)amount=Math.min(4,candidates.length);
    else if(eventChanged)amount=Math.min(2,candidates.length);
    else if(social.shouldAmbientPost)amount=1;
    if(!amount)return;
    eventRef.current=token;
    initializedRef.current=true;
    const now=Date.now();
    const picked=candidates.slice(0,amount).map((post,index)=>({...post,timelineId:`${post.id||'post'}-${now}-${index}`,arrivedAt:now+index,isNew:true}));
    setCompactFeed(prev=>{
      const old=prev.map(p=>({...p,isNew:false}));
      const seen=new Set();
      return [...picked,...old].filter(p=>{const key=p.timelineId||p.id;if(seen.has(key))return false;seen.add(key);return true}).slice(0,10);
    });
  },[compact,social?.streamKey,social?.eventToken,social?.phase,social?.away?.id,social?.home?.id,social?.isBigMoment,social?.shouldAmbientPost]);

  if(!social||social.phase==='idle')return null;
  const phaseLabel=social.phase==='warmup'?'WARMUP WIRE':social.phase==='postgame'?'POSTGAME WIRE':'LIVE GAME WIRE';
  const compactPosts=compact?compactFeed:[];
  return <section className={`card game-day-social ${compact?'is-dashboard-compact':''} phase-${social.phase} ${social.isBigMoment?'is-big-moment':''}`}>
    <div className="gds-head"><div><div className="gds-kicker">{social.brand.abbr} SOCIAL · {phaseLabel}</div><h2>{social.away.abbr} <span>at</span> {social.home.abbr}</h2><p>{social.phase==='warmup'?'Anticipation, official team promos, predictions and fanbase nerves before first pitch.':social.phase==='postgame'?`${social.score} · the postgame reaction is rolling in.`:`${social.score} · ${social.inning}${social.play?` · ${social.play}`:''}`}</p></div><div className="gds-head-actions"><div className="gds-watching"><small>LIVE WATCHING</small><strong>{formatWatching(social.watching)}</strong><span>simulated viewers</span></div><span className="gds-live-dot">● {social.phase==='live'?'LIVE':social.phase.toUpperCase()}</span>{onOpenFandom&&<button type="button" onClick={onOpenFandom}>Open Fandom →</button>}</div></div>
    {compact ? <div className="gds-dashboard-stream">
      <div className="gds-dashboard-teams"><span><Badge team={social.away}/><b>{social.away.abbr} fans</b></span><em>NEWEST FIRST · {compactPosts.length}/10</em><span><Badge team={social.home}/><b>{social.home.abbr} fans</b></span></div>
      <div className="gds-dashboard-posts">{compactPosts.map((p)=><Post key={p.timelineId||p.id} post={p} compact />)}</div>
    </div> : <div className="gds-columns">
      <div className="gds-team-column"><div className="gds-column-title"><Badge team={social.away}/><div><small>AWAY FANBASE + CLUB</small><strong>{social.away.city} {social.away.name}</strong></div></div>{social.awayPosts.slice(0,5).map(p=><Post key={p.id} post={p}/>)}</div>
      <div className="gds-center-column"><div className="gds-column-title league"><span className="gds-league-avatar official">L</span><div><small>LEAGUE + MEDIA</small><strong>{social.brand.abbr} Game Desk</strong></div></div>{social.leaguePosts.slice(0,4).map(p=><Post key={p.id} post={p}/>)}</div>
      <div className="gds-team-column"><div className="gds-column-title"><Badge team={social.home}/><div><small>HOME FANBASE + CLUB</small><strong>{social.home.city} {social.home.name}</strong></div></div>{social.homePosts.slice(0,5).map(p=><Post key={p.id} post={p}/>)}</div>
    </div>}
  </section>
}
