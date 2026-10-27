import React,{useMemo,useState} from 'react';
import { hardwareTheme,ceremonyRevealTypes } from '../utils/championshipHardwareUtils';

export default function ChampionshipCeremony({ceremony,team,onComplete,onClose}){
  const reveals=useMemo(()=>ceremonyRevealTypes(ceremony),[ceremony]);
  const [step,setStep]=useState(0);
  if(!ceremony||!team)return null;
  const theme=hardwareTheme(team.abbr);
  const isChamp=ceremony.type==='championship-opening';
  const leagueName=String(team.league||'').toUpperCase()==='AL'?'AMERICAN LEAGUE':String(team.league||'').toUpperCase()==='NL'?'NATIONAL LEAGUE':(team.league||ceremony.leagueLabel||'LEAGUE');
  const stages=isChamp?['intro','banner','trophy','rings','finale']:['intro','banner','finale'];
  const stage=stages[Math.min(step,stages.length-1)];
  const finish=()=>onComplete?.(reveals);
  return <div className="championship-ceremony-overlay" role="dialog" aria-modal="true" aria-label={ceremony.title}>
    <div className={`championship-ceremony-stage stage-${stage}`} style={{'--cer-main':theme.main,'--cer-accent':theme.accent,'--cer-border':theme.border,'--cer-text':theme.text}}>
      <div className="ceremony-spotlights"><i/><i/><i/><i/></div>
      <div className="ceremony-broadcast-kicker">SMB NETWORK · CHAMPIONSHIP CEREMONY</div>
      {stage==='intro'&&<div className="ceremony-intro"><small>{ceremony.originSeasonName||ceremony.seasonName||'CHAMPIONSHIP SEASON'}</small><h1>{team.city} {team.name}</h1><strong>{isChamp?'WORLD SERIES CHAMPIONS':'LEAGUE CHAMPIONS'}</strong><p>The building goes dark. The crowd is on its feet. History is about to take its place in the rafters.</p></div>}
      {stage==='banner'&&<div className="ceremony-reveal"><div className="ceremony-banner"><span>{leagueName}</span><strong>{team.abbr}</strong><b>CHAMPIONS</b><small>{ceremony.originSeasonName||''}</small></div><h2>THE BANNER IS UP</h2><p>{team.abbr}'s championship season is officially in the rafters.</p></div>}
      {stage==='trophy'&&<div className="ceremony-reveal"><div className="ceremony-trophy">🏆</div><h2>THE TROPHY RETURNS</h2><p>The World Series trophy takes center stage as the champions are recognized.</p></div>}
      {stage==='rings'&&<div className="ceremony-reveal"><div className="ceremony-ring"><div><small>{team.abbr}</small><strong>WORLD SERIES</strong><b>CHAMPIONS</b><em>{ceremony.originSeasonName||''}</em></div></div><h2>THE RINGS ARE REVEALED</h2><p>One final piece of hardware — made permanent for the champions.</p></div>}
      {stage==='finale'&&<div className="ceremony-intro finale"><small>FOREVER PART OF LEAGUE HISTORY</small><h1>{team.abbr}</h1><strong>{isChamp?'BANNER · TROPHY · RINGS':'CHAMPIONSHIP BANNER'}</strong><p>The ceremony is complete. The hardware now joins the Trophy Room in all its glory.</p></div>}
      <div className="ceremony-controls">
        {step>0&&stage!=='finale'&&<button type="button" className="ghost" onClick={()=>setStep(s=>Math.max(0,s-1))}>Back</button>}
        {stage!=='finale'?<button type="button" onClick={()=>setStep(s=>Math.min(stages.length-1,s+1))}>{stage==='intro'?'Begin Reveal':'Continue Ceremony'}</button>:<button type="button" onClick={finish}>Complete Ceremony</button>}
        <button type="button" className="ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>;
}
