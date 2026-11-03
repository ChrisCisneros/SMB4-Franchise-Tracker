import React,{useEffect,useMemo,useState} from 'react';
import { ceremonyRevealTypes } from '../utils/championshipHardwareUtils';
import { ChampionshipBanner,ChampionshipRing,ChampionshipTrophy } from './ChampionshipHardware';
import { buildCeremonyScript } from '../utils/ceremonyUtils';
import { getTeamColorsByAbbr,TEAM_COLOR_BASE_MAP } from '../config/teamColors';

export default function ChampionshipCeremony({ceremony,team,onComplete,onClose,replay=false,sharedStep=null,onSharedStepChange=null,operator=false}){
  const reveals=useMemo(()=>ceremonyRevealTypes(ceremony),[ceremony]);
  const [localStep,setLocalStep]=useState(0);
  const [bannerReady,setBannerReady]=useState(true);
  const controlled=sharedStep!==null&&sharedStep!==undefined&&Number.isFinite(Number(sharedStep));
  const step=controlled?Math.max(0,Number(sharedStep||0)):localStep;
  const script=useMemo(()=>buildCeremonyScript(ceremony,team),[ceremony,team]);
  const colors=useMemo(()=>getTeamColorsByAbbr(team?.abbr||ceremony?.teamAbbr),[team?.abbr,ceremony?.teamAbbr]);
  const baseColors=TEAM_COLOR_BASE_MAP[team?.abbr||ceremony?.teamAbbr]||{};
  useEffect(()=>{if(!controlled)setLocalStep(0)},[ceremony?.id,controlled]);

  const isChamp=ceremony?.type==='championship-opening';
  const leagueName=String(team?.league||'').toUpperCase()==='AL'?'AMERICAN LEAGUE':String(team?.league||'').toUpperCase()==='NL'?'NATIONAL LEAGUE':(team?.league||ceremony?.leagueLabel||'LEAGUE');
  const stages=isChamp
    ?['intro','commissioner','commissioner2','road','road2','fans1','manager','manager2','bannerIntro','banner','postBanner','trophyIntro','trophy','ringsIntro','rings','fans2','finale']
    :['intro','commissioner','road','fans1','manager','manager2','bannerIntro','banner','postBanner','fans2','finale'];
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
  const teamPrimary=baseColors.primary||colors?.main||'#1f0554';
  const teamSecondary=baseColors.accent||colors?.alt||colors?.border||'#ffffff';
  const confettiColors=[teamPrimary,teamSecondary,teamPrimary,teamSecondary,teamPrimary,'#ffffff',teamSecondary,'#e8c66a'];
  const fanFirst=script.fans.slice(0,isChamp?4:3);
  const fanSecond=script.fans.slice(isChamp?4:3);
  const bannerStage=stage==='banner';

  useEffect(()=>{
    if(!bannerStage){setBannerReady(true);return undefined;}
    setBannerReady(false);
    const timer=setTimeout(()=>setBannerReady(true),9800);
    return()=>clearTimeout(timer);
  },[bannerStage,ceremony?.id]);

  const bannerIndex=stages.indexOf('banner');
  const celebrationStarted=safeStep>bannerIndex||(bannerStage&&bannerReady);
  const ambientConfettiCount=celebrationStarted?220:72;
  const showBannerBurst=bannerStage&&bannerReady;
  const showFireworks=stage==='finale'||(isChamp&&stage==='trophy');

  if(!ceremony||!team)return null;

  const FanGrid=({lines,title,small})=><div className="ceremony-fan-voices"><small>{small}</small><h2>{title}</h2><div className="ceremony-fan-grid">{lines.map((line,i)=><article key={`${line}-${i}`}><span>{['HOME END','SEASON TICKET ROW','RIGHT FIELD','UPPER DECK','CENTER FIELD','CONCOURSE'][i%6]}</span><p>“{line}”</p></article>)}</div><strong>{isChamp?(team.city||team.abbr||'THE CITY').toUpperCase()+' REMEMBERS.':(team.abbr||'THE CLUB')+' FANS RISE FOR THEIR LEAGUE CHAMPIONS.'}</strong></div>;

  return <div className="championship-ceremony-overlay" role="dialog" aria-modal="true" aria-label={ceremony.title}>
    <div className={`championship-ceremony-stage stage-${stage} ${isChamp?'world-series-ceremony':'league-title-ceremony'}`} style={{'--cer-main':teamPrimary,'--cer-accent':teamSecondary,'--cer-border':colors?.border||teamSecondary,'--cer-text':colors?.text||'#ffffff','--cer-confetti-a':teamPrimary,'--cer-confetti-b':teamSecondary}}>
      <div className="ceremony-rafters"><i/><i/><i/><i/><i/></div>
      <div className="ceremony-spotlights"><i/><i/><i/><i/><i/><i/></div>
      <div className={`ceremony-confetti ceremony-confetti-ambient ${celebrationStarted?'ceremony-confetti-heavy ceremony-confetti-celebration':''}`}>{Array.from({length:ambientConfettiCount},(_,i)=><i key={`ambient-${i}`} style={{'--confetti-color':confettiColors[i%confettiColors.length],'--confetti-left':`${(i*37)%101}%`,'--confetti-delay':`${((i*17)%120)/20}s`,'--confetti-drift':`${((i%9)-4)*18}px`}}/>)}</div>
      {showBannerBurst&&<div className="ceremony-confetti ceremony-confetti-impact" aria-hidden="true">{Array.from({length:320},(_,i)=><i key={`impact-${i}`} style={{'--confetti-color':confettiColors[i%confettiColors.length],'--confetti-left':`${(i*29)%101}%`,'--confetti-delay':`${((i*11)%18)/100}s`,'--confetti-drift':`${((i%13)-6)*22}px`}}/>)}</div>}
      {showFireworks&&<div className={`ceremony-fireworks ${stage==='finale'?'ceremony-fireworks-finale':'ceremony-fireworks-trophy'}`} aria-hidden="true">{Array.from({length:14},(_,i)=><i key={i}/>)}</div>}
      <div className="ceremony-broadcast-kicker">NMLB NETWORK · CHAMPIONSHIP CEREMONY {replay?'REPLAY':'LIVE'}</div>
      {controlled&&!replay&&<div className="ceremony-live-badge">● LIVE ACROSS THE NMLB</div>}

      {stage==='intro'&&<div className="ceremony-intro"><small>{ceremony.originSeasonName||ceremony.seasonName||'CHAMPIONSHIP SEASON'}</small><h1>{team.city} {team.name}</h1><strong>{finaleLabel}</strong><p>{script.opening}</p><div className="ceremony-crowd-ribbon">THE HOUSE LIGHTS FALL · THE CROWD RISES · HISTORY TAKES THE FIELD</div></div>}

      {stage==='commissioner'&&<div className="ceremony-speech"><small>FROM THE COMMISSIONER</small><div className="ceremony-podium"><span>NMLB</span></div><h2>{isChamp?'A Championship Address':'A Pennant Address'}</h2><blockquote>“{script.commissioner}”</blockquote><p className="ceremony-speaker-tag">Commissioner · Nicky’s Major League Baseball</p></div>}

      {stage==='commissioner2'&&<div className="ceremony-speech ceremony-speech-grand"><small>THE COMMISSIONER CONTINUES</small><div className="ceremony-podium"><span>NMLB</span></div><h2>The Highest Honor in the NMLB</h2><blockquote>“{script.commissionerExtra}”</blockquote><p className="ceremony-speaker-tag">Commissioner · Nicky’s Major League Baseball</p></div>}

      {stage==='road'&&<div className="ceremony-intro ceremony-road"><small>{isChamp?'ROAD TO THE CHAMPIONSHIP':'ROAD TO THE PENNANT'}</small><h1>{team.abbr}</h1><strong>{isChamp?'LEAGUE TITLE · WORLD SERIES TITLE':'LEAGUE CHAMPIONSHIP'}</strong><p>{script.road}</p><div className="ceremony-road-steps"><span>OPENING DAY</span><i>→</i><span>PENNANT RACE</span><i>→</i><span>{isChamp?'WORLD SERIES':'LEAGUE TITLE'}</span><i>→</i><span>TONIGHT</span></div></div>}

      {stage==='road2'&&<div className="ceremony-intro ceremony-road ceremony-road-second"><small>ONE SEASON · ONE LASTING STORY</small><h1>{ceremony.originSeasonName||team.abbr}</h1><p>{script.roadSecond}</p><div className="ceremony-crowd-ribbon">THE MOMENTS RETURN · THE FINAL OUT ECHOES · THE BUILDING REMEMBERS</div></div>}

      {stage==='fans1'&&<FanGrid lines={fanFirst} small="VOICES FROM THE STANDS" title={isChamp?'The Fanbase Remembers the Run':'The Fanbase Remembers the Pennant'}/>} 

      {stage==='manager'&&<div className="ceremony-speech manager"><small>FROM THE DUGOUT</small><div className="ceremony-podium team"><span>{team.abbr}</span></div><h2>Manager’s Address</h2><blockquote>“{script.manager}”</blockquote><p className="ceremony-speaker-tag">Manager of the {team.city} {team.name}</p></div>}

      {stage==='manager2'&&<div className="ceremony-speech manager ceremony-speech-grand"><small>ONE MORE WORD FROM THE CLUBHOUSE</small><div className="ceremony-podium team"><span>{team.abbr}</span></div><h2>For the Team. For the City.</h2><blockquote>“{script.managerSecond}”</blockquote><p className="ceremony-speaker-tag">Manager of the {team.city} {team.name}</p></div>}

      {stage==='bannerIntro'&&<div className="ceremony-intro ceremony-banner-intro"><small>THE RAFTERS ARE READY</small><h1>{team.abbr}</h1><strong>{isChamp?'WORLD SERIES BANNER':'LEAGUE CHAMPIONSHIP BANNER'}</strong><p>{script.bannerIntro}</p><div className="ceremony-crowd-ribbon">ALL EYES TO THE RAFTERS</div></div>}

      {stage==='banner'&&<div className="ceremony-reveal ceremony-banner-raise"><div className="ceremony-banner-lift"><ChampionshipBanner team={team} leagueLabel={isChamp?'WORLD SERIES':leagueName} worldSeries={isChamp} seasonName={ceremony.originSeasonName||''}/></div><h2>{bannerReady?'THE BANNER IS HOME':'THE BANNER RISES'}</h2><p>{bannerReady?`${team.abbr}'s ${isChamp?'World Series championship':'league championship'} is now part of the rafters forever.`:'The building watches as the banner makes its slow climb into NMLB history.'}</p><div className={`ceremony-banner-countdown ${bannerReady?'landed':''}`}>{bannerReady?'CONFETTI CANNONS — FIRE!':'RAISING TO THE RAFTERS…'}</div></div>}

      {stage==='postBanner'&&<div className="ceremony-intro ceremony-post-banner"><small>THE RAFTERS ERUPT</small><h1>{team.abbr}</h1><strong>{isChamp?'WORLD CHAMPIONS':'LEAGUE CHAMPIONS'}</strong><p>The banner locks into place and the entire ballpark disappears beneath {team.abbr} colors.</p><div className="ceremony-crowd-ribbon">CONFETTI RAIN · CROWD ROAR · CHAMPIONS FOREVER</div></div>}

      {stage==='trophyIntro'&&<div className="ceremony-intro ceremony-trophy-intro"><small>THE HARDWARE COMES HOME</small><h1>🏆</h1><strong>NICKY’S COMMISSIONER’S TROPHY</strong><p>{script.trophyIntro}</p><div className="ceremony-crowd-ribbon">THE LIGHTS FALL · THE CENTER STAGE OPENS</div></div>}

      {stage==='trophy'&&<div className="ceremony-reveal ceremony-trophy-reveal"><div className="ceremony-trophy-aura"/><div className="ceremony-trophy-wrap"><ChampionshipTrophy team={team} seasonName={ceremony.originSeasonName||''}/></div><h2>NICKY’S COMMISSIONER’S TROPHY</h2><p>The trophy emerges beneath the lights as another storm of team-color confetti and fireworks fills the building.</p></div>}

      {stage==='ringsIntro'&&<div className="ceremony-intro"><small>THE CHAMPIONS STEP FORWARD</small><h1>💍</h1><strong>THE RINGS</strong><p>{script.ringsIntro}</p><div className="ceremony-crowd-ribbon">ONE BY ONE · THE CHAMPIONS ARE CALLED</div></div>}

      {stage==='rings'&&<div className="ceremony-reveal ceremony-ring-reveal"><ChampionshipRing team={team} seasonName={ceremony.originSeasonName||''}/><h2>THE CHAMPIONS RECEIVE THEIR RINGS</h2><p>{team.abbr} · WORLD SERIES CHAMPIONS. One final piece of the title is placed into their hands.</p></div>}

      {stage==='fans2'&&<FanGrid lines={fanSecond} small={isChamp?'ONE LAST WORD FROM THE CROWD':'THE PENNANT CELEBRATION CONTINUES'} title={isChamp?'The City Gets Its Victory Lap':'The Fans Salute Their League Champions'}/>} 

      {stage==='finale'&&<div className="ceremony-intro finale"><small>FOREVER PART OF NMLB HISTORY</small><h1>{team.abbr}</h1><strong>{isChamp?'BANNER · TROPHY · RINGS · WORLD CHAMPIONS':'PENNANT · BANNER · LEAGUE CHAMPIONS'}</strong><p>{script.finale}</p><div className="ceremony-finale-call">{isChamp?'THE CHAMPIONSHIP IS HOME.':'THE PENNANT LIVES HERE.'}</div><div className="ceremony-finale-firework-call">LET THE SKY KNOW WHO WON.</div></div>}

      <div className="ceremony-controls">
        {canControl&&step>0&&stage!=='finale'&&<button type="button" className="ghost" onClick={()=>setStep(step-1)}>Back</button>}
        {canControl&&stage!=='finale'&&<button type="button" disabled={bannerStage&&!bannerReady} onClick={()=>setStep(step+1)}>{stage==='intro'?'Begin Ceremony':bannerStage&&!bannerReady?'Banner Rising…':'Continue Ceremony'}</button>}
        {canControl&&stage==='finale'&&<button type="button" onClick={finish}>{replay?'Finish Replay':'Complete Ceremony'}</button>}
        {!operator&&!replay&&<span className="ceremony-viewer-note">The operator is controlling this live NMLB ceremony.</span>}
        {replay&&<button type="button" className="ghost" onClick={onClose}>Close Replay</button>}
      </div>
    </div>
  </div>;
}
