import React, { useMemo, useState } from "react";
import { teamOptionLabel } from "../utils/standingsUtils";

export default function DailyPage({ ctx }) {
  const { addDailyRows, applyBulkResultsInput, applyDailyResults, bulkResultsInput, bulkWarnings, clearDailyRow, data, getDailyRowIssue, numberedTeams, setBulkResultsInput, setData, syncLeagueExtrasToFirebase, teams, updateDailyRow } = ctx;
  const [reviewFilter, setReviewFilter] = useState("all");
  const recentNotableGames = useMemo(() => (data.games || []).filter((game) => game?.status === "Final" && (game.quickEntry || game.source === "simulation")).filter((game) => {
    const innings = Number(game.innings || game.inning || 9);
    const margin = Math.abs(Number(game.awayScore || 0) - Number(game.homeScore || 0));
    const total = Number(game.awayScore || 0) + Number(game.homeScore || 0);
    const notable = innings >= 12 || margin <= 1 || game.walkoff || total >= 14;
    const promoted = (data.leagueExtras?.simulationHighlights || []).some((x) => x.gameId === game.id);
    return reviewFilter === "promoted" ? notable && promoted : reviewFilter === "unreviewed" ? notable && !promoted : notable;
  }).slice(0, 18), [data.games, data.leagueExtras?.simulationHighlights, reviewFilter]);
  const promoteGame = (game) => {
    const away = teams.find((team) => team.id === game.awayTeamId);
    const home = teams.find((team) => team.id === game.homeTeamId);
    if (!away || !home) return;
    const innings = Number(game.innings || game.inning || 9);
    const margin = Math.abs(Number(game.awayScore || 0) - Number(game.homeScore || 0));
    const headline = innings >= 12 ? `${away.abbr} and ${home.abbr} survive a ${innings}-inning marathon` : game.walkoff ? `${home.abbr} walks it off against ${away.abbr}` : `${away.abbr}–${home.abbr} becomes an instant classic`;
    const nextHighlight = { id: crypto.randomUUID(), gameId: game.id, createdAt: new Date().toISOString(), headline, category: "Simulation Classic", detail: `${away.abbr} ${game.awayScore}, ${home.abbr} ${game.homeScore} · ${innings} innings${margin <= 1 ? " · one-run finish" : ""}.`, teams: [away.abbr, home.abbr], source: "simulation" };
    const extras = data.leagueExtras || {};
    const nextExtras = { ...extras, simulationHighlights: [nextHighlight, ...(extras.simulationHighlights || []).filter((x) => x.gameId !== game.id)].slice(0, 80) };
    syncLeagueExtrasToFirebase?.(nextExtras);
    setData((prev) => ({ ...prev, leagueExtras: nextExtras }));
  };
  const isPromoted = (game) => (data.leagueExtras?.simulationHighlights || []).some((x) => x.gameId === game.id);

  return (
    <div className="daily-page-wrap">
              <div className="card">
                <div className="daily-header-row">
                  <div>
                    <h2>Daily Results</h2>
                    <p className="muted">Use this for the other games on the schedule. Blank rows are ignored.</p>
                  </div>
                  <div className="daily-controls">
                    <input type="date" value={data.dailyResultsDate} onChange={(e) => setData((prev) => ({ ...prev, dailyResultsDate: e.target.value }))} />
                    <button onClick={() => addDailyRows(5)}>Add 5 Rows</button>
                    <button onClick={() => addDailyRows(10)}>Add 10 Rows</button>
                    <button onClick={applyDailyResults}>Apply All Valid Results</button>
                  </div>
                </div>
    
                <div className="daily-results-table">
                  <div className="daily-results-head">
                    <div>Away</div><div>Away Score</div><div>Home</div><div>Home Score</div><div>Inn.</div><div>Note</div><div>Status</div><div>Clear</div>
                  </div>
                  {data.dailyResultsRows.map((row) => {
                    const away = teams.find((t) => t.id === row.awayTeamId);
                    const home = teams.find((t) => t.id === row.homeTeamId);
                    const issue = getDailyRowIssue(row, data.dailyResultsRows);
                    return (
                      <div className="daily-results-row" key={row.id}>
                        <div>
                          <select value={row.awayTeamId} onChange={(e) => updateDailyRow(row.id, "awayTeamId", e.target.value)}>
                            <option value="">Away team</option>
                            {numberedTeams.map((team) => <option value={team.id} key={team.id}>{`${team.listNumber}. ${teamOptionLabel(team)}`}</option>)}
                          </select>
                        </div>
                        <div><input type="number" value={row.awayScore} onChange={(e) => updateDailyRow(row.id, "awayScore", e.target.value)} placeholder="0" /></div>
                        <div>
                          <select value={row.homeTeamId} onChange={(e) => updateDailyRow(row.id, "homeTeamId", e.target.value)}>
                            <option value="">Home team</option>
                            {numberedTeams.map((team) => <option value={team.id} key={team.id}>{`${team.listNumber}. ${teamOptionLabel(team)}`}</option>)}
                          </select>
                        </div>
                        <div><input type="number" value={row.homeScore} onChange={(e) => updateDailyRow(row.id, "homeScore", e.target.value)} placeholder="0" /></div>
                        <div><input className="daily-innings-input" type="number" min="1" max="30" value={row.innings ?? "9"} onChange={(e) => updateDailyRow(row.id, "innings", e.target.value)} title="Final innings" /></div>
                        <div className="daily-note-cell"><input className="daily-note-input" value={row.note || ""} onChange={(e) => updateDailyRow(row.id, "note", e.target.value)} placeholder="Optional" /><label title="Mark as a walk-off"><input type="checkbox" checked={Boolean(row.walkoff)} onChange={(e) => updateDailyRow(row.id, "walkoff", e.target.checked)} /> WO</label></div>
                        <div className="daily-status-cell">
                          {issue === "applied" && <span className="status-pill applied">Applied</span>}
                          {issue === "same-team" && <span className="status-pill invalid">Same Team</span>}
                          {issue === "duplicate-team" && <span className="status-pill invalid">Duplicate Team</span>}
                          {issue === "tie" && <span className="status-pill invalid">No Ties</span>}
                          {issue === "ready" && <span className="status-pill ready">Ready</span>}
                          {(issue === "empty" || issue === "incomplete") && <span className="status-pill empty">Waiting</span>}
                          {away && home && row.awayScore !== "" && row.homeScore !== "" && issue !== "tie" && <div className="muted small-text">{Number(row.awayScore) > Number(row.homeScore) ? away.abbr : home.abbr}</div>}
                        </div>
                        <div><button className="danger" onClick={() => clearDailyRow(row.id)}>Clear</button></div>
                      </div>
                    );
                  })}
                </div>
              </div>
    
              <div className="card daily-bulk-card">
              <div className="card daily-helper-card">
                <h3>Teams Added In These Rows</h3>
                <p className="muted">Filled rows light up the teams currently included in Daily Results so you can spot duplicates fast.</p>
                <div className="team-status-grid">
                  {numberedTeams.map((team) => {
                    const relatedRows = data.dailyResultsRows.filter((row) => row.awayTeamId === team.id || row.homeTeamId === team.id);
                    const isAdded = relatedRows.some((row) => row.awayTeamId && row.homeTeamId && row.awayScore !== "" && row.homeScore !== "");
                    const isOpen = relatedRows.length > 0;
    
                    return (
                      <div
                        key={`daily-status-${team.id}`}
                        className={`team-status-chip ${isAdded ? "is-added" : isOpen ? "is-open" : ""}`}
                      >
                        <span className="team-status-abbr">{team.abbr}</span>
                        <span className="team-status-name">{team.city} {team.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
    
                <h3>Bulk Results Entry</h3>
                <p className="muted">One game per line. Examples: <strong>1 3 2 4</strong>, <strong>sf 5 sd 2</strong>, or <strong>laa 3 tex 2 15</strong> for a 15-inning final.</p>
                {bulkWarnings.length > 0 && (
                  <div className="bulk-warning-box">
                    <strong>Skipped lines</strong>
                    {bulkWarnings.map((warning, index) => <div key={`${warning}-${index}`}>{warning}</div>)}
                  </div>
                )}
                <textarea
                  className="bulk-results-input"
                  value={bulkResultsInput}
                  onChange={(e) => setBulkResultsInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      applyBulkResultsInput();
                    }
                  }}
                  placeholder={"1 3 2 4\nsf 5 sd 2\n7 1 12 6"}
                  rows={8}
                />
                <div className="inline-buttons">
                  <button onClick={applyBulkResultsInput}>Fill Rows From Bulk Entry</button>
                </div>
              </div>
              <section className="card v66-simulation-review">
                <div className="daily-header-row"><div><div className="operator-kicker">V6.6 · SIMULATION REVIEW</div><h2>Final Week Classics Desk</h2><p className="muted">Simulation results still count automatically. Promote only the games that deserve permanent NMLB coverage.</p></div><div className="operator-segmented">{[["all","All"],["unreviewed","Unreviewed"],["promoted","Promoted"]].map(([value,label])=><button key={value} className={reviewFilter===value?"is-active":""} onClick={()=>setReviewFilter(value)}>{label}</button>)}</div></div>
                <div className="v66-simulation-grid">{recentNotableGames.length ? recentNotableGames.map((game) => { const away=teams.find((team)=>team.id===game.awayTeamId); const home=teams.find((team)=>team.id===game.homeTeamId); const innings=Number(game.innings||game.inning||9); return <article key={game.id}><div><small>{isPromoted(game)?"PROMOTED":"NOTABLE FINAL"}</small><strong>{away?.abbr||"AWY"} {game.awayScore} · {home?.abbr||"HME"} {game.homeScore}</strong><span>{innings} innings{game.walkoff?" · WALK-OFF":""}{Math.abs(Number(game.awayScore||0)-Number(game.homeScore||0))<=1?" · ONE-RUN GAME":""}</span></div>{isPromoted(game)?<b className="v66-reviewed-pill">✓ IN NEWS</b>:<button type="button" onClick={()=>promoteGame(game)}>Promote to News</button>}</article>; }) : <p className="muted">No notable simulated finals are waiting for review.</p>}</div>
              </section>
            </div>
  );
}
