import React, { useMemo, useState } from "react";
import { chronicleSnapshots } from "../utils/seasonChronicleUtils";
import { getPlayoffSeries, makeSafePlayoffBracket } from "../utils/playoffUtils";

export default function HistoryPage({ ctx }) {
  const { archiveCurrentSeason, controlsUnlocked, data, deleteSeasonSnapshot, expandedHistorySeasonIds, playoffBracket, playoffSeriesOptions, teamById, teams, toggleHistorySeason } = ctx;
  const [historyType,setHistoryType]=useState('All');
  const [historyTeam,setHistoryTeam]=useState('ALL');
  const [historySeason,setHistorySeason]=useState('ALL');
  const extras=data.leagueExtras||{};
  const historyFeed=useMemo(()=>{
    const rows=[];
    (data.games||[]).filter(g=>g?.status==='Final').forEach(g=>rows.push({id:`game-${g.id}`,type:'Games',teamAbbr:'',season:g.seasonName||data.activeSeasonName||'',title:`${teamById(g.awayTeamId)?.abbr||'AWY'} ${g.awayScore}–${g.homeScore} ${teamById(g.homeTeamId)?.abbr||'HME'}`,detail:g.gameType==='playoff'?'Postseason final':'Regular-season final',date:g.finalizedAt||g.date||''}));
    (extras.manualEvents||[]).forEach(e=>rows.push({id:`event-${e.id}`,type:/rival/i.test(`${e.title} ${e.note}`)?'Rivalries':/champ|world series|title/i.test(`${e.title} ${e.note}`)?'Championships':'Cultural Moments',teamAbbr:e.teamAbbr||'',season:e.date||'',title:e.title||'History Event',detail:e.note||'',date:e.createdAt||''}));
    (extras.achievements||[]).forEach(a=>rows.push({id:`ach-${a.id}`,type:'Player Milestones',teamAbbr:a.teamAbbr||'',season:a.season||'',title:`${a.playerName||'Player'} · ${a.title}`,detail:a.note||'',date:a.createdAt||''}));
    (extras.customRecords||[]).forEach(r=>rows.push({id:`record-${r.id}`,type:'Records',teamAbbr:r.teamAbbr||'',season:r.season||'',title:r.title||'Record',detail:`${r.holder||''}${r.value?` · ${r.value}`:''}${r.note?` · ${r.note}`:''}`,date:r.createdAt||''}));
    (extras.awards||[]).filter(a=>a?.winner).forEach(a=>rows.push({id:`award-${a.id}`,type:'Awards',teamAbbr:a.teamAbbr||'',season:a.season||'',title:`${a.winner} · ${a.award}`,detail:a.note||a.category||'',date:a.createdAt||''}));
    (extras.ceremonies||[]).filter(c=>c.status==='completed').forEach(c=>rows.push({id:`cer-${c.id}`,type:'Ceremonies',teamAbbr:c.teamAbbr||'',season:c.seasonName||'',title:c.title||'Ceremony',detail:c.detail||'',date:c.completedAt||c.createdAt||''}));
    (extras.worldMoments||[]).forEach(w=>rows.push({id:`world-${w.id}`,type:'Cultural Moments',teamAbbr:w.teamAbbr||'',season:w.season||data.activeSeasonName||'',title:w.title||w.label||'World Moment',detail:w.detail||w.note||'',date:w.createdAt||''}));
    chronicleSnapshots(data).forEach(c=>rows.push({id:`snap-${c.id}`,type:'Snapshots',teamAbbr:'',season:c.season||'',title:c.label,detail:`${c.status==='locked'?'Locked':'Draft'} · ${c.checkpoint||'Weekly checkpoint'}`,date:c.createdAt||''}));
    return rows.sort((a,b)=>(Date.parse(b.date||'')||0)-(Date.parse(a.date||'')||0));
  },[data,teamById]);
  const seasonOptions=[...new Set([...historyFeed.map(x=>x.season).filter(Boolean),(data.seasonHistory||[]).map(x=>x.name).filter(Boolean)])];
  const visibleHistory=historyFeed.filter(x=>(historyType==='All'||x.type===historyType)&&(historyTeam==='ALL'||String(x.teamAbbr||'').toUpperCase()===historyTeam)&&(historySeason==='ALL'||x.season===historySeason));

  return (
    <div className="history-page">
        <div className="card history-header-card">
          <div>
            <h2>Season History</h2>
            <p className="muted">
              Archive completed seasons here before starting the next one.
            </p>
          </div>
    
          {controlsUnlocked && (
            <button onClick={archiveCurrentSeason}>Archive Current Season</button>
          )}
        </div>

        <div className="card history-filter-console"><div><h3>League Memory Filter</h3><p className="muted">Find the exact kind of history you want without scrolling the entire universe.</p></div><div className="history-filter-controls"><select value={historyType} onChange={e=>setHistoryType(e.target.value)}>{['All','Games','Championships','Player Milestones','Records','Awards','Ceremonies','Rivalries','Cultural Moments','Snapshots'].map(x=><option key={x}>{x}</option>)}</select><select value={historyTeam} onChange={e=>setHistoryTeam(e.target.value)}><option value="ALL">All Teams</option>{[...teams].sort((a,b)=>a.abbr.localeCompare(b.abbr)).map(t=><option key={t.id} value={t.abbr}>{t.abbr}</option>)}</select><select value={historySeason} onChange={e=>setHistorySeason(e.target.value)}><option value="ALL">All Seasons</option>{seasonOptions.map(x=><option key={x} value={x}>{x}</option>)}</select></div></div>
        <div className="history-memory-feed">{visibleHistory.slice(0,40).map(x=><article className="card" key={x.id}><small>{x.type} · {x.season||'League history'} {x.teamAbbr?`· ${x.teamAbbr}`:''}</small><strong>{x.title}</strong><p>{x.detail}</p></article>)}{!visibleHistory.length&&<div className="card"><p className="muted">No history entries match those filters.</p></div>}</div>
    
        {(data.seasonHistory || []).length === 0 ? (
          <div className="card">
            <h3>No seasons archived yet</h3>
            <p className="muted">
              When the World Series is complete, archive the season here before
              resetting for the next year.
            </p>
          </div>
        ) : (
          (data.seasonHistory || []).map((snapshot) => {
            function sortSnapshotTeams(list) {
              return [...list].sort((a, b) => {
                const pctA =
                  Number(a.wins || 0) + Number(a.losses || 0) > 0
                    ? Number(a.wins || 0) /
                      (Number(a.wins || 0) + Number(a.losses || 0))
                    : 0;
    
                const pctB =
                  Number(b.wins || 0) + Number(b.losses || 0) > 0
                    ? Number(b.wins || 0) /
                      (Number(b.wins || 0) + Number(b.losses || 0))
                    : 0;
    
                if (pctB !== pctA) return pctB - pctA;
    
                const winDiff = Number(b.wins || 0) - Number(a.wins || 0);
                if (winDiff !== 0) return winDiff;
    
                return Number(b.runDiff || 0) - Number(a.runDiff || 0);
              });
            }
    
            const snapshotTeamAbbr = (teamId) =>
              snapshot.teams?.find((team) => team.id === teamId)?.abbr ||
              teamById(teamId)?.abbr ||
              "TBD";
    
            const isExpanded = expandedHistorySeasonIds.includes(snapshot.id);
    
            return (
              <div className="card history-season-card" key={snapshot.id}>
                <div className="history-season-title">
                  <div>
                    <h3>{snapshot.name}</h3>
                    <p className="muted">
                      Archived{" "}
                      {new Date(snapshot.archivedAt).toLocaleDateString()}
                    </p>
                  </div>
    
                  <div className="history-title-actions">
                    <div className="history-champion-pill">
                      Champion: {snapshot.championAbbr || "TBD"}
                    </div>
    
                    <button onClick={() => toggleHistorySeason(snapshot.id)}>
                      {isExpanded ? "Hide Details" : "Show Details"}
                    </button>
    
                    {controlsUnlocked && (
                      <button
                        className="danger-lite"
                        onClick={() => deleteSeasonSnapshot(snapshot.id)}
                      >
                        Delete Season
                      </button>
                    )}
                  </div>
                </div>
    
                {isExpanded && (() => {
                  const seasonBestTeam = sortSnapshotTeams(snapshot.teams || [])[0];
                  const playerRows = snapshot.players || [];
                  const hitLeader = [...playerRows].sort((a,b)=>Number(b.seasonHits||0)-Number(a.seasonHits||0))[0];
                  const hrLeader = [...playerRows].sort((a,b)=>Number(b.seasonHR||0)-Number(a.seasonHR||0))[0];
                  const winLeader = [...playerRows].sort((a,b)=>Number(b.seasonPitchingWins||0)-Number(a.seasonPitchingWins||0))[0];
                  return <>
                  <div className="history-almanac-strip">
                    <div><span>Champion</span><strong>{snapshot.championAbbr || 'TBD'}</strong></div>
                    <div><span>Best Record</span><strong>{seasonBestTeam ? `${seasonBestTeam.abbr} ${seasonBestTeam.wins}-${seasonBestTeam.losses}` : '—'}</strong></div>
                    <div><span>Archived Games</span><strong>{snapshot.games?.length || 0}</strong></div>
                    <div><span>Players Saved</span><strong>{snapshot.players?.length || 0}</strong></div>
                  </div>
                  {(playerRows.length > 0) && <div className="history-player-leaders">
                    <div className="card"><span>Hits Leader</span><strong>{hitLeader?.name || '—'}</strong><small>{hitLeader?.seasonHits || 0} hits</small></div>
                    <div className="card"><span>HR Leader</span><strong>{hrLeader?.name || '—'}</strong><small>{hrLeader?.seasonHR || 0} HR</small></div>
                    <div className="card"><span>Pitching Wins</span><strong>{winLeader?.name || '—'}</strong><small>{winLeader?.seasonPitchingWins || 0} wins</small></div>
                  </div>}
                  {((snapshot.awards||[]).length>0||(snapshot.achievements||[]).length>0)&&<div className="history-honors-shelf">{(snapshot.awards||[]).map(a=><article className="card" key={a.id}><span>{a.icon||'🏆'} {a.award}</span><strong>{a.winner}</strong><small>{a.teamAbbr||''}{a.note?` · ${a.note}`:''}</small></article>)}{(snapshot.achievements||[]).map(a=><article className="card" key={a.id}><span>{a.icon||'🏅'} PLAYER MILESTONE</span><strong>{a.playerName||a.title}</strong><small>{a.title}{a.note?` · ${a.note}`:''}</small></article>)}</div>}
                  <div className="history-grid">
                    <div>
                      <h4>Final Standings Snapshot</h4>
    
                      <div className="history-division-grid">
                        {data.leagues.map((league) => (
                          <div
                            className="history-league-group"
                            key={`${snapshot.id}-${league}`}
                          >
                            <h5>{league}</h5>
    
                            {data.divisions.map((division) => {
                              const divisionTeams = sortSnapshotTeams(
                                (snapshot.teams || []).filter(
                                  (team) =>
                                    team.league === league &&
                                    team.division === division
                                )
                              );
    
                              if (!divisionTeams.length) return null;
    
                              return (
                                <div
                                  className="history-division-card"
                                  key={`${snapshot.id}-${league}-${division}`}
                                >
                                  <div className="history-division-title">
                                    {division}
                                  </div>
    
                                  <div className="history-team-table">
                                    <div className="history-team-row history-team-head">
                                      <span>Team</span>
                                      <span>Record</span>
                                      <span>RD</span>
                                    </div>
    
                                    {divisionTeams.map((team) => (
                                      <div
                                        className="history-team-row"
                                        key={`${snapshot.id}-${team.id}`}
                                      >
                                        <span>
                                          <strong>{team.abbr}</strong>
                                          <small>{team.name}</small>
                                        </span>
                                        <span>
                                          {team.wins}-{team.losses}
                                        </span>
                                        <span>
                                          {Number(team.runDiff || 0) > 0 ? "+" : ""}
                                          {team.runDiff}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
    
                    <div>
                      <h4>Playoff Bracket Snapshot</h4>
    
                      <div className="history-series-list">
                        {playoffSeriesOptions.map((option) => {
                          const series = getPlayoffSeries(
                            makeSafePlayoffBracket(snapshot.playoffBracket),
                            option.id
                          );
    
                          if (!series.awayTeamId && !series.homeTeamId) return null;
    
                          const winnerAbbr = snapshotTeamAbbr(series.winnerTeamId);
    
                          return (
                            <div
                              className="history-series-row"
                              key={`${snapshot.id}-${option.id}`}
                            >
                              <strong>{option.label.split(" — ")[0]}</strong>
                              <span>
                                {snapshotTeamAbbr(series.awayTeamId)}{" "}
                                {series.awayWins || 0}
                                {" - "}
                                {snapshotTeamAbbr(series.homeTeamId)}{" "}
                                {series.homeWins || 0}
                              </span>
                              <small>Winner: {winnerAbbr}</small>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  </>;
                })()}
              </div>
            );
          })
        )}
      </div>
  );
}
