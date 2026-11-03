import React,{useEffect,useMemo,useState} from 'react';
import { ceremonyRevealTypes } from '../utils/championshipHardwareUtils';
import { ChampionshipBanner,ChampionshipRing,ChampionshipTrophy } from './ChampionshipHardware';
import { buildCeremonyScript } from '../utils/ceremonyUtils';
import { getTeamColorsByAbbr } from '../config/teamColors';

export default function ChampionshipCeremony({ceremony,team,onComplete,onClose,replay=false,sharedStep=null,onSharedStepChange=null,operator=false}){
  const reveals=useMemo(()=>ceremonyRevealTypes(ceremony),[ceremony]);
  const [localStep,setLocalStep]=useState(0);
  const controlled=sharedStep!==null&&sharedStep!==undefined&&Number.isFinite(Number(sharedStep));
  const step=controlled?Math.max(0,Number(sharedStep||0)):localStep;
  const script=useMemo(()=>buildCeremonyScript(ceremony,team),[ceremony,team]);
  const colors=useMemo(()=>getTeamColorsByAbbr(team?.abbr||ceremony?.teamAbbr),[team?.abbr,ceremony?.teamAbbr]);
  useEffect(()=>{if(!controlled)setLocalStep(0)},[ceremony?.id,controlled]);
  if(!ceremony||!team)return null;

  const isChamp=ceremony.type==='championship-opening';
  const leagueName=String(team.league||'').toUpperCase()==='AL'?'AMERICAN LEAGUE':String(team.league||'').toUpperCase()==='NL'?'NATIONAL LEAGUE':(team.league||ceremony.leagueLabel||'LEAGUE');
  const stages=isChamp
    ?['intro','commissioner','road','banner','manager','fans','trophy','rings','finale']
    :['intro','fans','manager','banner','finale'];
  const safeStep=Math.min(step,stages.length-1);
  const stage=stages[safeStep];
  const canControl=operator||replay;
  const setStep=(next)=>{
    const n=Math.max(0,Math.min(stages.length-1,next));
    if(controlled)onSharedStepChange?.(n);
    else setLocalStep(n);
  };
  const finish=()=>replay?onClose?.():onComplete?.(reveals);
  const finaleLabel=isChamp?'WORLD SERIES CHAMPIONS':'LEAGUE CHAMPIONS';
  const confettiColors=[colors?.main||'#1f0554',colors?.alt||'#ffffff','#ffffff','#e8c66a'];

  return <div className="championship-ceremony-overlay" role="dialog" aria-modal="true" aria-label={ceremony.title}>
    <div className={`championship-ceremony-stage stage-${stage} ${isChamp?'world-series-ceremony':'league-title-ceremony'}`} style={{'--cer-main':colors?.main||'#1f0554','--cer-accent':colors?.alt||'#e8c66a','--cer-border':colors?.border||'#ffffff','--cer-text':colors?.text||'#ffffff'}}>
      <div className="ceremony-rafters"><i/><i/><i/><i/><i/></div>
      <div className="ceremony-spotlights"><i/><i/><i/><i/><i/><i/></div>
      <div className={`ceremony-confetti ${(['trophy','rings','finale'].includes(stage)||(!isChamp&&stage==='banner'))?'ceremony-confetti-heavy':''}`}>{Array.from({length:72},(_,i)=><i key={i} style={{'--confetti-color':confettiColors[i%confettiColors.length]}}/>)}</div>
      {stage==='finale'&&<div className="ceremony-fireworks" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>}
      <div className="ceremony-broadcast-kicker">NMLB NETWORK · CHAMPIONSHIP CEREMONY {replay?'REPLAY':'LIVE'}</div>
      {controlled&&!replay&&<div className="ceremony-live-badge">● LIVE ACROSS THE NMLB</div>}

      {stage==='intro'&&<div className="ceremony-intro"><small>{ceremony.originSeasonName||ceremony.seasonName||'CHAMPIONSHIP SEASON'}</small><h1>{team.city} {team.name}</h1><strong>{finaleLabel}</strong><p>{script.opening}</p><div className="ceremony-crowd-ribbon">THE HOUSE LIGHTS FALL · THE CROWD RISES · HISTORY TAKES THE FIELD</div></div>}

      {isChamp&&stage==='commissioner'&&<div className="ceremony-speech"><small>FROM THE COMMISSIONER</small><div className="ceremony-podium"><span>NMLB</span></div><h2>Commissioner’s Address</h2><blockquote>“{script.commissioner}”</blockquote><p className="ceremony-speaker-tag">Nicky’s Major League Baseball</p></div>}

      {isChamp&&stage==='road'&&<div className="ceremony-intro ceremony-road"><small>ROAD TO THE RAFTERS</small><h1>{team.abbr}</h1><strong>{isChamp?'LEAGUE TITLE · WORLD SERIES TITLE':'LEAGUE CHAMPIONSHIP'}</strong><p>{script.road}</p><div className="ceremony-road-steps"><span>REGULAR SEASON</span><i>→</i><span>PENNANT RACE</span><i>→</i><span>{isChamp?'WORLD SERIES':'LEAGUE TITLE'}</span><i>→</i><span>THE RAFTERS</span></div></div>}

      {stage==='banner'&&<div className="ceremony-reveal ceremony-banner-raise"><div className="ceremony-banner-lift"><ChampionshipBanner team={team} leagueLabel={isChamp?'WORLD SERIES':leagueName} worldSeries={isChamp} seasonName={ceremony.originSeasonName||''}/></div><h2>{isChamp?'RAISE THE WORLD SERIES BANNER':'RAISE THE LEAGUE CHAMPIONSHIP BANNER'}</h2><p>{team.abbr}'s {isChamp?'World Series championship':'league championship'} is lifted into the rafters, where it becomes part of the building forever.</p></div>}

      {stage==='manager'&&<div className="ceremony-speech manager"><small>FROM THE DUGOUT</small><div className="ceremony-podium team"><span>{team.abbr}</span></div><h2>Manager’s Address</h2><blockquote>“{script.manager}”</blockquote><p className="ceremony-speaker-tag">Manager of the {team.city} {team.name}</p></div>}

      {stage==='fans'&&<div className="ceremony-fan-voices"><small>{isChamp?'VOICES FROM THE STANDS':'THE FANBASE REACTS'}</small><h2>{isChamp?'This One Belongs to the Fanbase, Too':'A Pennant the Fans Will Remember'}</h2><div className="ceremony-fan-grid">{script.fans.map((line,i)=><article key={`${line}-${i}`}><span>{['HOME END','SEASON TICKET ROW','RIGHT FIELD','UPPER DECK'][i%4]}</span><p>“{line}”</p></article>)}</div><strong>{isChamp?(team.city||team.abbr||'THE CITY').toUpperCase()+' REMEMBERS.':(team.abbr||'THE CLUB')+' FANS RISE FOR THEIR LEAGUE CHAMPIONS.'}</strong></div>}

      {stage==='trophy'&&<div className="ceremony-reveal ceremony-trophy-reveal"><div className="ceremony-trophy-aura"/><div className="ceremony-trophy-wrap"><ChampionshipTrophy team={team} seasonName={ceremony.originSeasonName||''}/></div><h2>NICKY’S COMMISSIONER’S TROPHY</h2><p>The championship trophy emerges beneath the lights as the building disappears into confetti.</p></div>}

      {stage==='rings'&&<div className="ceremony-reveal ceremony-ring-reveal"><ChampionshipRing team={team} seasonName={ceremony.originSeasonName||''}/><h2>THE CHAMPIONS RECEIVE THEIR RINGS</h2><p>{team.abbr} · WORLD SERIES CHAMPIONS. One final piece of the title is placed into their hands.</p></div>}

      {stage==='finale'&&<div className="ceremony-intro finale"><small>FOREVER PART OF NMLB HISTORY</small><h1>{team.abbr}</h1><strong>{isChamp?'BANNER · TROPHY · RINGS':'PENNANT · BANNER · CELEBRATION'}</strong><p>{script.finale}</p><div className="ceremony-finale-call">{isChamp?'THE CHAMPIONSHIP IS HOME.':'THE PENNANT LIVES HERE.'}</div></div>}

      <div className="ceremony-controls">
        {canControl&&step>0&&stage!=='finale'&&<button type="button" className="ghost" onClick={()=>setStep(step-1)}>Back</button>}
        {canControl&&stage!=='finale'&&<button type="button" onClick={()=>setStep(step+1)}>{stage==='intro'?'Begin Ceremony':'Continue Ceremony'}</button>}
        {canControl&&stage==='finale'&&<button type="button" onClick={finish}>{replay?'Finish Replay':'Complete Ceremony'}</button>}
        {!operator&&!replay&&<span className="ceremony-viewer-note">The operator is controlling this live NMLB ceremony.</span>}
        {replay&&<button type="button" className="ghost" onClick={onClose}>Close Replay</button>}
      </div>
    </div>
  </div>;
}
