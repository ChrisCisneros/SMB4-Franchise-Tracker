import React from 'react';
import { WEEKDAYS, buildSeasonCalendar, calendarSummary, scheduleEntryLabel } from '../utils/seasonCalendarUtils';
import { ceremonyForGame } from '../utils/ceremonyUtils';

function ResultLine({game,teams=[]}){
  if(!game)return null;
  const a=teams.find(t=>t.id===game.awayTeamId),h=teams.find(t=>t.id===game.homeTeamId);
  return <div className="season-cal-result"><b>FINAL</b><span>{a?.abbr||'AWY'} {game.awayScore} · {h?.abbr||'HME'} {game.homeScore}</span></div>;
}

export default function SeasonCalendar({data,teams=[],editable=false,onToggle,onSelectGame,selectedGameNumber,compact=false}){
  const slots=buildSeasonCalendar(data,teams);const summary=calendarSummary(data);
  return <div className={`season-calendar-shell ${editable?'is-editable':'is-public'} ${compact?'is-compact':''}`}>
    <div className="season-calendar-status"><div><strong>{summary.scheduled} / 40 games scheduled</strong><span>{summary.remaining?`${summary.remaining} still need a date`:'Season calendar complete ✓'}</span></div><div><span>8 WEEKS</span><b>MON → SUN</b></div></div>
    <div className="season-calendar-scroll">
      <div className="season-calendar-grid">
        <div className="season-calendar-corner">WEEK</div>{WEEKDAYS.map(d=><div key={d} className="season-calendar-dayhead">{d}</div>)}
        {Array.from({length:8},(_,w)=>{
          const week=slots.slice(w*7,w*7+7);
          return <React.Fragment key={`week-${w+1}`}><div className="season-calendar-weeklabel"><strong>W{w+1}</strong><span>{w===0?'OPENING':w===3?'ALL-STAR':w>=6?'PENNANT':'REGULAR'}</span></div>{week.map(slot=>{
            const ceremonies=slot.gameNumber?ceremonyForGame(data,teams,slot.gameNumber):[];
            const selected=slot.gameNumber&&slot.gameNumber===selectedGameNumber;
            return <button type="button" key={slot.slotIndex} className={`season-calendar-cell ${slot.gameNumber?'is-game':'is-off'} ${slot.result?'is-final':''} ${slot.promo?'has-promo':''} ${ceremonies.length?'has-ceremony':''} ${selected?'is-selected':''}`} onClick={()=>{if(editable)onToggle?.(slot.slotIndex);else if(slot.gameNumber)onSelectGame?.(slot.gameNumber)}} title={editable?(slot.gameNumber?'Click to remove this Game Day':'Click to assign the next unscheduled game'):(slot.gameNumber?`Game ${slot.gameNumber}`:'Off Day')}>
              <div className="season-cal-top"><span>{slot.dateLabel||slot.weekday}</span>{slot.gameNumber?<b>G{slot.gameNumber}</b>:<b>OFF</b>}</div>
              {slot.gameNumber?<>
                <strong className="season-cal-matchup">{scheduleEntryLabel(slot.schedule)}</strong>
                {ceremonies.slice(0,1).map(c=><span className="season-cal-ceremony" key={c.id}>{c.type==='championship-opening'?'💍🏆🎏':'🎏'} {c.title}</span>)}
                {slot.promo&&<span className="season-cal-promo">{slot.promo.icon||'🎟️'} {slot.promo.name}</span>}
                <ResultLine game={slot.result} teams={teams}/>
              </>:<span className="season-cal-offtext">{editable?'Click to add Game Day':'OFF DAY'}</span>}
            </button>})}</React.Fragment>
        })}
      </div>
    </div>
  </div>;
}
