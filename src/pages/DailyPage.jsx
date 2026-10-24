import React from "react";
import { teamOptionLabel } from "../utils/standingsUtils";

export default function DailyPage({ ctx }) {
  const { addDailyRows, applyBulkResultsInput, applyDailyResults, bulkResultsInput, bulkWarnings, clearDailyRow, data, getDailyRowIssue, numberedTeams, setBulkResultsInput, setData, teams, updateDailyRow } = ctx;

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
                    <button onClick={applyDailyResults}>Apply All Valid Results</button>
                  </div>
                </div>
    
                <div className="daily-results-table">
                  <div className="daily-results-head">
                    <div>Away</div><div>Away Score</div><div>Home</div><div>Home Score</div><div>Status</div><div>Clear</div>
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
                <p className="muted">One game per line. Examples: <strong>1 3 2 4</strong> or <strong>sf 5 sd 2</strong>. First valid line wins if a team is duplicated.</p>
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
            </div>
  );
}
