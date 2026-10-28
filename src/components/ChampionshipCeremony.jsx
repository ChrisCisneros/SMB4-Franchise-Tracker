import React,{useMemo,useState} from 'react';
import { ceremonyRevealTypes } from '../utils/championshipHardwareUtils';
import { ChampionshipBanner,ChampionshipRing,ChampionshipTrophy } from './ChampionshipHardware';

export default function ChampionshipCeremony({ceremony,team,onComplete,onClose,replay=false}){
  const reveals=useMemo(()=>ceremonyRevealTypes(ceremony),[ceremony]);
  const [step,setStep]=useState(0);
  if(!ceremony||!team)return null;
  const isChamp=ceremony.type==='championship-opening';
  const leagueName=String(team.league||'').toUpperCase()==='AL'?'AMERICAN LEAGUE':String(team.league||'').toUpperCase()==='NL'?'NATIONAL LEAGUE':(team.league||ceremony.leagueLabel||'LEAGUE');
  const stages=isChamp?['intro','road','banner','trophy','rings','finale']:['intro','road','banner','finale'];
  const stage=stages[Math.min(step,stages.length-1)];
  const finish=()=>replay?onClose?.():onComplete?.(reveals);
  return <div className="championship-ceremony-overlay" role="dialog" aria-modal="true" aria-label={ceremony.title}>
    <div className={`championship-ceremony-stage stage-${stage}`}>
      <div className="ceremony-spotlights"><i/><i/><i/><i/></div>
      <div className="ceremony-confetti">{Array.from({length:34},(_,i)=><i key={i}/>)}</div>
      <div className="ceremony-broadcast-kicker">SMB NETWORK · HALL OF GLORY {replay?'REPLAY':'CEREMONY'}</div>
      {stage==='intro'&&<div className="ceremony-intro"><small>{ceremony.originSeasonName||ceremony.seasonName||'CHAMPIONSHIP SEASON'}</small><h1>{team.city} {team.name}</h1><strong>{isChamp?'WORLD SERIES CHAMPIONS':'LEAGUE CHAMPIONS'}</strong><p>The lights fall. The crowd stands. Tonight the championship becomes permanent.</p></div>}
      {stage==='road'&&<div className="ceremony-intro ceremony-road"><small>ROAD TO THE RAFTERS</small><h1>{team.abbr}</h1><strong>{isChamp?'LEAGUE TITLE · WORLD SERIES TITLE':'LEAGUE CHAMPIONSHIP'}</strong><p>{ceremony.originSeasonName||'That season'} is remembered here not as a line in a table, but as the run that earned this place in league history.</p><div className="ceremony-road-steps"><span>REGULAR SEASON</span><i>→</i><span>POSTSEASON</span><i>→</i><span>{isChamp?'WORLD SERIES':'LEAGUE TITLE'}</span><i>→</i><span>HALL OF GLORY</span></div></div>}
      {stage==='banner'&&<div className="ceremony-reveal"><ChampionshipBanner team={team} leagueLabel={leagueName} seasonName={ceremony.originSeasonName||''}/><h2>THE BANNER IS UP</h2><p>{team.abbr}'s championship season is officially in the rafters.</p></div>}
      {stage==='trophy'&&<div className="ceremony-reveal"><ChampionshipTrophy team={team} seasonName={ceremony.originSeasonName||''}/><h2>THE TROPHY RETURNS</h2><p>The World Series trophy takes center stage beneath the lights.</p></div>}
      {stage==='rings'&&<div className="ceremony-reveal"><ChampionshipRing team={team} seasonName={ceremony.originSeasonName||''}/><h2>THE RINGS ARE REVEALED</h2><p>{team.abbr} · WORLD SERIES CHAMPIONS. The title now has its permanent piece of hardware.</p></div>}
      {stage==='finale'&&<div className="ceremony-intro finale"><small>FOREVER PART OF LEAGUE HISTORY</small><h1>{team.abbr}</h1><strong>{isChamp?'BANNER · TROPHY · RINGS':'CHAMPIONSHIP BANNER'}</strong><p>{replay?'The Hall of Glory replay is complete.':'The ceremony is complete. The hardware is now permanently unveiled in the Hall of Glory.'}</p></div>}
      <div className="ceremony-controls">
        {step>0&&stage!=='finale'&&<button type="button" className="ghost" onClick={()=>setStep(s=>Math.max(0,s-1))}>Back</button>}
        {stage!=='finale'?<button type="button" onClick={()=>setStep(s=>Math.min(stages.length-1,s+1))}>{stage==='intro'?'Begin Ceremony':'Continue Ceremony'}</button>:<button type="button" onClick={finish}>{replay?'Finish Replay':'Complete Ceremony'}</button>}
        <button type="button" className="ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>;
}
