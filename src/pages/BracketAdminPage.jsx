import React, { useMemo, useState } from "react";
import { getPlayoffSeries, getWinsNeededForSeries } from "../utils/playoffUtils";

export default function BracketAdminPage({ ctx }) {
  const {
    addPlayoffGameResult, bumpPlayoffScore, initializeBracketFromCurrentSeeds,
    playoffAwayScore, playoffBracket, playoffHomeScore, playoffSeriesDropdownLabel,
    playoffSeriesOptions, resetSelectedPlayoffSeries, selectedPlayoffSeriesId,
    seriesStatusText, setPlayoffAwayScore, setPlayoffHomeScore, setSelectedPlayoffSeriesId,
    teamAbbr,
  } = ctx;
  const [viewFilter, setViewFilter] = useState("active");

  const selectedSeries = getPlayoffSeries(playoffBracket, selectedPlayoffSeriesId);
  const awayAbbr = teamAbbr(selectedSeries.awayTeamId);
  const homeAbbr = teamAbbr(selectedSeries.homeTeamId);
  const winsNeeded = getWinsNeededForSeries(selectedPlayoffSeriesId);
  const gameNumber = (selectedSeries.games?.length || 0) + 1;
  const scoreReady = playoffAwayScore !== "" && playoffHomeScore !== "" && Number(playoffAwayScore) !== Number(playoffHomeScore);

  const filteredSeries = useMemo(() => playoffSeriesOptions.filter((option) => {
    const series = getPlayoffSeries(playoffBracket, option.id);
    const hasMatchup = Boolean(series.awayTeamId && series.homeTeamId);
    if (viewFilter === "all") return true;
    if (viewFilter === "finished") return Boolean(series.winnerTeamId);
    return hasMatchup && !series.winnerTeamId;
  }), [playoffBracket, playoffSeriesOptions, viewFilter]);

  return (
    <div className="bracket-admin-page bracket-admin-v3">
      <div className="card bracket-admin-hero">
        <div>
          <div className="operator-kicker">POSTSEASON CONTROL ROOM</div>
          <h2>Bracket Admin</h2>
          <p className="muted">Pick a series, enter the final score, and the bracket advances automatically.</p>
        </div>
        <button onClick={initializeBracketFromCurrentSeeds}>Initialize From Current Seeds</button>
      </div>

      <div className="bracket-admin-layout">
        <div className="card bracket-entry-console">
          <div className="bracket-entry-heading">
            <div>
              <span className="operator-label">Selected Series</span>
              <h3>{playoffSeriesDropdownLabel(playoffSeriesOptions.find((s) => s.id === selectedPlayoffSeriesId) || { id: selectedPlayoffSeriesId })}</h3>
            </div>
            <span className={`series-state-pill ${selectedSeries.winnerTeamId ? "finished" : "active"}`}>
              {seriesStatusText(selectedSeries, selectedPlayoffSeriesId)}
            </span>
          </div>

          <select
            className="bracket-series-select"
            value={selectedPlayoffSeriesId}
            onChange={(e) => setSelectedPlayoffSeriesId(e.target.value)}
          >
            {playoffSeriesOptions.map((series) => (
              <option key={series.id} value={series.id}>{playoffSeriesDropdownLabel(series)}</option>
            ))}
          </select>

          <div className="bracket-matchup-console">
            <div className="bracket-console-team">
              <span>Away</span>
              <strong>{awayAbbr}</strong>
              <small>Series wins: {selectedSeries.awayWins || 0}</small>
            </div>
            <div className="bracket-console-center">
              <span>GAME {gameNumber}</span>
              <strong>{selectedSeries.awayWins || 0} – {selectedSeries.homeWins || 0}</strong>
              <small>First to {winsNeeded}</small>
            </div>
            <div className="bracket-console-team">
              <span>Home</span>
              <strong>{homeAbbr}</strong>
              <small>Series wins: {selectedSeries.homeWins || 0}</small>
            </div>
          </div>

          <div className="bracket-score-console">
            <div>
              <label>{awayAbbr !== "TBD" ? awayAbbr : "Away"} Score</label>
              <div className="playoff-score-stepper playoff-score-stepper-large">
                <button type="button" onClick={() => bumpPlayoffScore("away", -1)}>-</button>
                <input type="number" min="0" value={playoffAwayScore} onChange={(e) => setPlayoffAwayScore(e.target.value)} />
                <button type="button" onClick={() => bumpPlayoffScore("away", 1)}>+</button>
              </div>
            </div>
            <div className="bracket-score-versus">FINAL</div>
            <div>
              <label>{homeAbbr !== "TBD" ? homeAbbr : "Home"} Score</label>
              <div className="playoff-score-stepper playoff-score-stepper-large">
                <button type="button" onClick={() => bumpPlayoffScore("home", -1)}>-</button>
                <input type="number" min="0" value={playoffHomeScore} onChange={(e) => setPlayoffHomeScore(e.target.value)} />
                <button type="button" onClick={() => bumpPlayoffScore("home", 1)}>+</button>
              </div>
            </div>
          </div>

          <div className="bracket-entry-actions">
            <button className="bracket-submit-result" disabled={!scoreReady || selectedSeries.winnerTeamId} onClick={addPlayoffGameResult}>
              {scoreReady ? `Record ${awayAbbr} ${playoffAwayScore} – ${homeAbbr} ${playoffHomeScore}` : "Enter Final Score"}
            </button>
            <button onClick={() => { setPlayoffAwayScore(""); setPlayoffHomeScore(""); }}>Clear Score</button>
            <button className="danger-lite" onClick={resetSelectedPlayoffSeries}>Reset This Series</button>
          </div>
        </div>

        <div className="card bracket-series-picker">
          <div className="bracket-series-picker-head">
            <div><span className="operator-label">Quick Select</span><h3>Series Board</h3></div>
            <div className="operator-segmented compact">
              {[["active","Active"],["finished","Finished"],["all","All"]].map(([value,label]) => (
                <button key={value} className={viewFilter === value ? "is-active" : ""} onClick={() => setViewFilter(value)}>{label}</button>
              ))}
            </div>
          </div>

          <div className="bracket-admin-series-list bracket-admin-series-click-list">
            {filteredSeries.map((option) => {
              const series = getPlayoffSeries(playoffBracket, option.id);
              const selected = option.id === selectedPlayoffSeriesId;
              return (
                <button
                  type="button"
                  className={`bracket-admin-series-row bracket-admin-series-button ${selected ? "selected" : ""} ${series.winnerTeamId ? "complete" : ""}`}
                  key={`admin-${option.id}`}
                  onClick={() => setSelectedPlayoffSeriesId(option.id)}
                >
                  <div>
                    <strong>{playoffSeriesDropdownLabel(option)}</strong>
                    <div className="muted">{teamAbbr(series.awayTeamId)} vs {teamAbbr(series.homeTeamId)}</div>
                  </div>
                  <div className="series-board-score">
                    <strong>{series.awayWins || 0}-{series.homeWins || 0}</strong>
                    <div>{seriesStatusText(series, option.id)}</div>
                  </div>
                </button>
              );
            })}
            {!filteredSeries.length && <div className="operator-empty-mini">No series in this view.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
