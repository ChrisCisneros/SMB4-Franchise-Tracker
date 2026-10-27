import React from 'react';
import { WEEKDAYS, buildSeasonCalendar, calendarSummary, currentSeasonDay, getCalendarAnchorTeam, scheduleEntryLabel } from '../utils/seasonCalendarUtils';
import { ceremonyForGame } from '../utils/ceremonyUtils';
import { getTeamColorsByAbbr } from '../config/teamColors';

const WEEK_LABELS=['OPENING WEEK','FIRST IMPRESSIONS','THE GRIND','ALL-STAR PUSH','SECOND HALF','PRESSURE BUILDS','PENNANT RACE','FINAL WEEK'];
const MILESTONES={1:'OPENING DAY',10:'QUARTER MARK',20:'MIDSEASON',30:'STRETCH RUN',40:'SEASON FINALE'};

function ResultLine({game,teams=[],anchor}){
  if(!game)return null;
  const a=teams.find(t=>t.id===game.awayTeamId),h=teams.find(t=>t.id===game.homeTeamId);
  const anchorAway=anchor?.id===game.awayTeamId;
  const anchorHome=anchor?.id===game.homeTeamId;
  const won=anchorAway?Number(game.awayScore)>Number(game.homeScore):anchorHome?Number(game.homeScore)>Number(game.awayScore):null;
  const extras=Number(game.inning||0)>9;
  return <div className={`season-cal-result ${won===true?'win':won===false?'loss':''}`}><b>{won===true?'W · FINAL':won===false?'L · FINAL':'FINAL'}</b><span>{a?.abbr||'AWY'} {game.awayScore} · {h?.abbr||'HME'} {game.homeScore}</span><div className="season-cal-result-badges">{game.walkoff&&<em>WALK-OFF</em>}{extras&&<em>EXTRAS</em>}{game.shutout&&<em>SHUTOUT</em>}</div></div>;
}

function weekRecord(week,anchor){
  let w=0,l=0;
  week.forEach(slot=>{
    const g=slot.result;if(!g||!anchor)return;
    const isAway=g.awayTeamId===anchor.id,isHome=g.homeTeamId===anchor.id;
    if(!isAway&&!isHome)return;
    const rf=Number(isAway?g.awayScore:g.homeScore)||0,ra=Number(isAway?g.homeScore:g.awayScore)||0;
    if(rf>ra)w++; else if(ra>rf)l++;
  });
  return w+l?`${w}-${l}`:'';
}

function segmentKind(slots,index){
  const slot=slots[index]; if(!slot?.gameNumber)return '';
  const loc=slot.schedule?.location;
  if(!loc)return '';
  const prev=slots[index-1],next=slots[index+1];
  const samePrev=prev?.gameNumber&&prev.schedule?.location===loc;
  const sameNext=next?.gameNumber&&next.schedule?.location===loc;
  if(!samePrev&&sameNext)return 'segment-start';
  if(samePrev&&sameNext)return 'segment-mid';
  if(samePrev&&!sameNext)return 'segment-end';
  return 'segment-solo';
}

export default function SeasonCalendar({data,teams=[],editable=false,onToggle,onSelectGame,selectedGameNumber,compact=false,paintTimeType='',onPaintTimeType}){
  const slots=buildSeasonCalendar(data,teams);const summary=calendarSummary(data);const current=currentSeasonDay(data,teams);const anchor=getCalendarAnchorTeam(data,teams);
  const anchorColors=getTeamColorsByAbbr(anchor?.abbr||'SF');
  return <div className={`season-calendar-shell ${editable?'is-editable':'is-public'} ${compact?'is-compact':''}`} style={{'--calendar-home':anchorColors.main,'--calendar-home-alt':anchorColors.alt,'--calendar-home-border':anchorColors.border||anchorColors.alt,'--calendar-home-text':anchorColors.text||'#fff'}}>
    <div className="season-calendar-legend"><span className="home"><i/>HOME</span><span className="away"><i/>AWAY</span><span className="off"><i/>OFF DAY</span><span className="current"><i/>CURRENT</span><span className="special">★ SPECIAL EVENT</span></div>
    <div className="season-calendar-status"><div><strong>{summary.scheduled} / 40 games scheduled</strong><span>{summary.remaining?`${summary.remaining} still need a date`:'Season calendar complete ✓'}</span></div>{current&&<div className="season-calendar-current-label"><span>CURRENT {anchor?.abbr||'SF'} GAME DAY</span><b>W{current.week} · {current.weekday} · GAME {current.gameNumber}</b></div>}<div><span>8 WEEKS</span><b>MON → SUN</b></div></div>
    <div className="season-calendar-scroll">
      <div className="season-calendar-grid">
        <div className="season-calendar-corner">WEEK</div>{WEEKDAYS.map(d=><div key={d} className="season-calendar-dayhead">{d}</div>)}
        {Array.from({length:8},(_,w)=>{
          const week=slots.slice(w*7,w*7+7); const record=weekRecord(week,anchor);
          const weekPhase=w===0?'OPENING':w===3?'ALL-STAR':w===4?'SECOND HALF':w===6?'PENNANT':w===7?'FINALE':'REGULAR';
          return <React.Fragment key={`week-${w+1}`}>
            <div className={`season-calendar-weeklabel phase-${weekPhase.toLowerCase().replace(' ','-')}`}><strong>W{w+1}</strong><span>{WEEK_LABELS[w]}</span>{record&&<em>{record}</em>}</div>
            {week.map((slot,di)=>{
              const ceremonies=slot.gameNumber?ceremonyForGame(data,teams,slot.gameNumber):[];
              const selected=slot.gameNumber&&slot.gameNumber===selectedGameNumber;
              const isCurrent=current&&slot.slotIndex===current.slotIndex;
              const isHome=slot.schedule?.location==='home',isAway=slot.schedule?.location==='away';
              const milestone=MILESTONES[slot.gameNumber];
              const timeType=data.leagueExtras?.gameDayMeta?.[String(slot.gameNumber)]?.timeType||'NIGHT';
              const opponent=slot.schedule?.opponentAbbr;
              const prevGame=slots[slot.slotIndex-1],nextGame=slots[slot.slotIndex+1];
              const seriesWithPrev=opponent&&prevGame?.schedule?.opponentAbbr===opponent;
              const seriesWithNext=opponent&&nextGame?.schedule?.opponentAbbr===opponent;
              const seg=segmentKind(slots,slot.slotIndex);
              return <button type="button" key={slot.slotIndex} className={`season-calendar-cell ${slot.gameNumber?'is-game':'is-off'} ${isHome?'is-home':''} ${isAway?'is-away':''} ${slot.result?'is-final':''} ${slot.promo?'has-promo':''} ${ceremonies.length?'has-ceremony':''} ${selected?'is-selected':''} ${isCurrent?'is-current':''} ${paintTimeType&&slot.gameNumber?'is-time-paintable':''} ${seg}`} onClick={()=>{if(editable){if(slot.gameNumber&&paintTimeType&&onPaintTimeType){onPaintTimeType(slot.gameNumber,paintTimeType);onSelectGame?.(slot.gameNumber)}else onToggle?.(slot.slotIndex)}else if(slot.gameNumber)onSelectGame?.(slot.gameNumber)}} title={editable?(slot.gameNumber?(paintTimeType?`Set Game ${slot.gameNumber} to ${paintTimeType}`:'Click to remove this Game Day'):'Click to assign the next unscheduled game'):(slot.gameNumber?`Game ${slot.gameNumber}`:'Off Day')}>
                <div className="season-cal-top"><span>{slot.dateLabel||slot.weekday}{isCurrent?' · CURRENT':''}</span>{slot.gameNumber?<b>G{slot.gameNumber} · {timeType}</b>:<b>OFF</b>}</div>
                {slot.gameNumber?<>
                  <div className="season-cal-flags">{milestone&&<span className="season-cal-milestone">★ {milestone}</span>}{(seriesWithPrev||seriesWithNext)&&<span className="season-cal-series">SERIES</span>}</div>
                  <strong className="season-cal-matchup">{scheduleEntryLabel(slot.schedule)}</strong>
                  <span className={`season-cal-location ${isHome?'home':'away'}`}>{isHome?'HOME':'ROAD'}</span>
                  {ceremonies.slice(0,1).map(c=><span className="season-cal-ceremony" key={c.id}>{c.type==='championship-opening'?'💍🏆🎏':'🎏'} {c.title}</span>)}
                  {slot.promo&&<span className="season-cal-promo">{slot.promo.icon||'🎟️'} {slot.promo.name}</span>}
                  <ResultLine game={slot.result} teams={teams} anchor={anchor}/>
                </>:<span className="season-cal-offtext">{editable?'Click to add Game Day':'OFF DAY'}</span>}
              </button>})}
            {w===3&&<div className="season-calendar-break"><span>⭐ ALL-STAR BREAK</span><strong>MIDSEASON FESTIVITIES</strong><em>First-half awards · fan voting · media day · second-half predictions</em></div>}
          </React.Fragment>
        })}
      </div>
    </div>
  </div>;
}
