import React from 'react';
import { hardwareTheme } from '../utils/championshipHardwareUtils';

export function ChampionshipBanner({team,leagueLabel='LEAGUE',seasonName='',size='large'}){
  const t=hardwareTheme(team?.abbr);
  return <div className={`hall-banner hall-banner-${size}`} style={{'--hall-main':t.main,'--hall-accent':t.accent,'--hall-border':t.border,'--hall-text':t.text}}>
    <i className="hall-banner-rod"/><span>{leagueLabel}</span><strong>{team?.abbr||'—'}</strong><b>CHAMPIONS</b><small>{seasonName}</small><i className="hall-banner-stitch"/>
  </div>;
}

export function ChampionshipTrophy({team,seasonName='',size='large'}){
  const t=hardwareTheme(team?.abbr);
  return <div className={`hall-trophy hall-trophy-${size}`} style={{'--hall-main':t.main,'--hall-accent':t.accent,'--hall-border':t.border,'--hall-text':t.text}} aria-label={`${team?.abbr||'Team'} World Series trophy`}>
    <div className="hall-trophy-globe"><i/><i/><i/><i/><i/><span>★</span></div>
    <div className="hall-trophy-neck"/>
    <div className="hall-trophy-cup"><span>{team?.abbr||'—'}</span><b>WORLD SERIES</b></div>
    <div className="hall-trophy-stem"/>
    <div className="hall-trophy-base"><strong>{team?.abbr||'—'}</strong><small>WORLD SERIES CHAMPIONS</small><em>{seasonName}</em></div>
  </div>;
}

export function ChampionshipRing({team,seasonName='',size='large'}){
  const t=hardwareTheme(team?.abbr);
  return <div className={`hall-ring hall-ring-${size}`} style={{'--hall-main':t.main,'--hall-accent':t.accent,'--hall-border':t.border,'--hall-text':t.text}} aria-label={`${team?.abbr||'Team'} championship ring`}>
    <div className="hall-ring-band left"/><div className="hall-ring-band right"/>
    <div className="hall-ring-face">
      <div className="hall-ring-gems">{Array.from({length:18},(_,i)=><i key={i}/>)}</div>
      <div className="hall-ring-center"><small>{team?.abbr||'—'}</small><strong>WORLD SERIES</strong><b>CHAMPIONS</b><em>{seasonName}</em></div>
    </div>
    <div className="hall-ring-engraving">{team?.abbr||'TEAM'} · {seasonName||'CHAMPIONS'}</div>
  </div>;
}
