import React from 'react';
import { getTeamColorsByAbbr } from '../config/teamColors';

function Badge({team}){const c=getTeamColorsByAbbr(team?.abbr);return <span className="gds-team-badge" style={{'--gds-main':c.main,'--gds-alt':c.alt,'--gds-border':c.border,'--gds-text':c.text}}>{team?.abbr||'FC'}</span>}
function formatWatching(n=0){if(n>=1000000)return `${(n/1000000).toFixed(n>=10000000?0:1)}M`;if(n>=1000)return `${(n/1000).toFixed(n>=10000?0:1)}K`;return String(n)}
function Post({post,compact=false}){return <article className={`gds-post ${post.tone||''} ${post.kind==='team-official'?'team-official':''} ${compact?'compact':''}`}><div className="gds-avatar">{post.team?<Badge team={post.team}/>:<span className={`gds-league-avatar ${post.tone==='official'?'official':''}`}>{post.tone==='official'?'L':'FC'}</span>}</div><div><div className="gds-meta"><strong>{post.name}</strong><span>{post.handle}</span><em>{post.badge}</em></div><p>{post.text}</p></div></article>}
export default function GameDaySocial({social,onOpenFandom,compact=false}){
  if(!social||social.phase==='idle')return null;
  const phaseLabel=social.phase==='warmup'?'WARMUP WIRE':social.phase==='postgame'?'POSTGAME WIRE':'LIVE GAME WIRE';
  const compactPosts = compact ? [
    social.awayPosts?.[0], social.homePosts?.[0], social.leaguePosts?.[0],
    social.awayPosts?.[1], social.homePosts?.[1], social.leaguePosts?.[1],
    social.awayPosts?.[2], social.homePosts?.[2]
  ].filter(Boolean).slice(0,7) : [];
  return <section className={`card game-day-social ${compact?'is-dashboard-compact':''} phase-${social.phase} ${social.isBigMoment?'is-big-moment':''}`}>
    <div className="gds-head"><div><div className="gds-kicker">{social.brand.abbr} SOCIAL · {phaseLabel}</div><h2>{social.away.abbr} <span>at</span> {social.home.abbr}</h2><p>{social.phase==='warmup'?'Anticipation, official team promos, predictions and fanbase nerves before first pitch.':social.phase==='postgame'?`${social.score} · the postgame reaction is rolling in.`:`${social.score} · ${social.inning}${social.play?` · ${social.play}`:''}`}</p></div><div className="gds-head-actions"><div className="gds-watching"><small>LIVE WATCHING</small><strong>{formatWatching(social.watching)}</strong><span>simulated viewers</span></div><span className="gds-live-dot">● {social.phase==='live'?'LIVE':social.phase.toUpperCase()}</span>{onOpenFandom&&<button type="button" onClick={onOpenFandom}>Open Fandom →</button>}</div></div>
    {compact ? <div className="gds-dashboard-stream">
      <div className="gds-dashboard-teams"><span><Badge team={social.away}/><b>{social.away.abbr} fans</b></span><em>LIVE CONVERSATION</em><span><Badge team={social.home}/><b>{social.home.abbr} fans</b></span></div>
      <div className="gds-dashboard-posts">{compactPosts.map((p,i)=><Post key={`${p.id||'post'}-${i}`} post={p} compact />)}</div>
    </div> : <div className="gds-columns">
      <div className="gds-team-column"><div className="gds-column-title"><Badge team={social.away}/><div><small>AWAY FANBASE + CLUB</small><strong>{social.away.city} {social.away.name}</strong></div></div>{social.awayPosts.slice(0,5).map(p=><Post key={p.id} post={p}/>)}</div>
      <div className="gds-center-column"><div className="gds-column-title league"><span className="gds-league-avatar official">L</span><div><small>LEAGUE + MEDIA</small><strong>{social.brand.abbr} Game Desk</strong></div></div>{social.leaguePosts.slice(0,4).map(p=><Post key={p.id} post={p}/>)}</div>
      <div className="gds-team-column"><div className="gds-column-title"><Badge team={social.home}/><div><small>HOME FANBASE + CLUB</small><strong>{social.home.city} {social.home.name}</strong></div></div>{social.homePosts.slice(0,5).map(p=><Post key={p.id} post={p}/>)}</div>
    </div>}
  </section>
}
