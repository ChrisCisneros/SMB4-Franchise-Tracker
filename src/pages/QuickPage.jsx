import React, { useMemo, useState } from "react";
import { SEASON_LENGTH } from "../config/constants";
import { eliminationNumber, gamesBack, pct } from "../utils/standingsUtils";

export default function QuickPage({ ctx }) {
  const { adjustTeamNumber, adjustTeamStreak, resetTeamStreak, controlsUnlocked, data, recentlyUpdatedTeamId, resetRegularSeasonStats, teams } = ctx;
  const [search, setSearch] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("ALL");
  const [progressFilter, setProgressFilter] = useState("all");

  const visibleTeams = useMemo(() => {
    const query = search.trim().toLowerCase();
    return teams.filter((team) => {
      const gamesPlayed = Number(team.wins || 0) + Number(team.losses || 0);
      const matchesSearch = !query || `${team.city} ${team.name} ${team.abbr}`.toLowerCase().includes(query);
      const matchesLeague = leagueFilter === "ALL" || team.league === leagueFilter;
      const matchesProgress =
        progressFilter === "all" ||
        (progressFilter === "incomplete" && gamesPlayed < SEASON_LENGTH) ||
        (progressFilter === "complete" && gamesPlayed >= SEASON_LENGTH);
      return matchesSearch && matchesLeague && matchesProgress;
    });
  }, [teams, search, leagueFilter, progressFilter]);

  const incompleteCount = teams.filter(
    (team) => Number(team.wins || 0) + Number(team.losses || 0) < SEASON_LENGTH
  ).length;

  return (
    <div className="quick-groups-wrap quick-v3-page">
      <div className="card quick-reset-card quick-ops-header">
        <div>
          <div className="operator-kicker">FRANCHISE CONTROL CENTER</div>
          <h2>Quick Record Editor</h2>
          <p className="muted">Fast manual corrections without digging through every team.</p>
        </div>
        <div className="quick-ops-summary">
          <div><span>Teams</span><strong>{teams.length}</strong></div>
          <div><span>Still Playing</span><strong>{incompleteCount}</strong></div>
          <div><span>Visible</span><strong>{visibleTeams.length}</strong></div>
        </div>
        {controlsUnlocked && (
          <button className="danger-lite" onClick={resetRegularSeasonStats}>
            Reset Regular Season
          </button>
        )}
      </div>

      <div className="card quick-filter-bar">
        <div className="quick-search-wrap">
          <label>Find Team</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type SF, Cubs, Texas..."
          />
        </div>
        <div>
          <label>League</label>
          <div className="operator-segmented">
            {["ALL", ...data.leagues].map((league) => (
              <button
                key={league}
                className={leagueFilter === league ? "is-active" : ""}
                onClick={() => setLeagueFilter(league)}
              >
                {league}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label>Progress</label>
          <div className="operator-segmented">
            {[
              ["all", "All"],
              ["incomplete", "Still Playing"],
              ["complete", "Finished"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={progressFilter === value ? "is-active" : ""}
                onClick={() => setProgressFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {(search || leagueFilter !== "ALL" || progressFilter !== "all") && (
          <button
            className="operator-clear-filter"
            onClick={() => {
              setSearch("");
              setLeagueFilter("ALL");
              setProgressFilter("all");
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {data.leagues.map((league) => {
        if (leagueFilter !== "ALL" && leagueFilter !== league) return null;
        const leagueHasVisible = visibleTeams.some((team) => team.league === league);
        if (!leagueHasVisible) return null;

        return (
          <div key={league} className="league-block quick-league-block">
            <div className="quick-league-title"><h2>{league}</h2><span>{visibleTeams.filter((team) => team.league === league).length} teams shown</span></div>
            <div className="grid three quick-division-grid">
              {data.divisions.map((division) => {
                const groupTeams = [...visibleTeams]
                  .filter((team) => team.league === league && team.division === division)
                  .sort((a, b) => {
                    const pctA = (a.wins || 0) + (a.losses || 0) > 0 ? (a.wins || 0) / ((a.wins || 0) + (a.losses || 0)) : 0;
                    const pctB = (b.wins || 0) + (b.losses || 0) > 0 ? (b.wins || 0) / ((b.wins || 0) + (b.losses || 0)) : 0;
                    if (pctB !== pctA) return pctB - pctA;
                    if ((b.wins || 0) !== (a.wins || 0)) return (b.wins || 0) - (a.wins || 0);
                    if ((b.runDiff || 0) !== (a.runDiff || 0)) return (b.runDiff || 0) - (a.runDiff || 0);
                    return a.abbr.localeCompare(b.abbr);
                  });

                if (!groupTeams.length) return null;
                const leader = groupTeams[0];

                return (
                  <div className="card quick-division-card" key={`${league}-${division}-quick`}>
                    <div className="quick-division-heading">
                      <h3>{division}</h3>
                      <span>{groupTeams.length}</span>
                    </div>
                    {groupTeams.map((team) => {
                      const gamesPlayed = Number(team.wins || 0) + Number(team.losses || 0);
                      const gamesLeft = Math.max(0, SEASON_LENGTH - gamesPlayed);
                      const isDone = gamesLeft === 0;
                      const rd = Number(team.runDiff || 0);

                      return (
                        <div
                          className={`quick-row smb-quick-row quick-operator-row ${recentlyUpdatedTeamId === team.id ? "recently-updated-row" : ""}`}
                          key={team.id}
                        >
                          <div className="quick-team-name">
                            <strong>{team.city} {team.name}</strong>
                            <span>{team.abbr}</span>
                          </div>

                          <span className={`quick-game-count ${isDone ? "complete" : "needs-games"}`}>
                            {gamesPlayed}/{SEASON_LENGTH} · {isDone ? "DONE" : `${gamesLeft} LEFT`}
                          </span>

                          <div className="quick-mini-stats">
                            <div><label>PCT</label><strong>{pct(Number(team.wins || 0), Number(team.losses || 0))}</strong></div>
                            <div><label>GB</label><strong>{gamesBack(team, leader)}</strong></div>
                            <div><label>E#</label><strong>{team.id === leader?.id ? "—" : eliminationNumber(team, leader)}</strong></div>
                          </div>

                          <div className="quick-record-stack">
                            <div className="quick-compact-stepper">
                              <label>W</label>
                              <button type="button" onClick={() => adjustTeamNumber(team.id, "wins", -1)}>-</button>
                              <strong>{team.wins || 0}</strong>
                              <button type="button" onClick={() => adjustTeamNumber(team.id, "wins", 1)}>+</button>
                            </div>
                            <div className="quick-compact-stepper">
                              <label>L</label>
                              <button type="button" onClick={() => adjustTeamNumber(team.id, "losses", -1)}>-</button>
                              <strong>{team.losses || 0}</strong>
                              <button type="button" onClick={() => adjustTeamNumber(team.id, "losses", 1)}>+</button>
                            </div>
                          </div>

                          <div className="quick-streak-control">
                            <label>STREAK</label>
                            <div>
                              <strong className={String(team.streak||'').startsWith('W')?'positive':String(team.streak||'').startsWith('L')?'negative':''}>{team.streak||'—'}</strong>
                              <button type="button" title="Add/continue win streak" onClick={() => adjustTeamStreak?.(team.id, "W")}>W+</button>
                              <button type="button" title="Add/continue losing streak" onClick={() => adjustTeamStreak?.(team.id, "L")}>L+</button>
                              <button type="button" className="ghost" title="Clear streak" onClick={() => resetTeamStreak?.(team.id)}>×</button>
                            </div>
                          </div>

                          <div className="quick-rd-compact">
                            <label>RD</label>
                            <div className="quick-rd-buttons">
                              <button type="button" onClick={() => adjustTeamNumber(team.id, "runDiff", -5)}>-5</button>
                              <button type="button" onClick={() => adjustTeamNumber(team.id, "runDiff", -1)}>-1</button>
                              <strong className={rd > 0 ? "positive" : rd < 0 ? "negative" : ""}>{rd > 0 ? `+${rd}` : rd}</strong>
                              <button type="button" onClick={() => adjustTeamNumber(team.id, "runDiff", 1)}>+1</button>
                              <button type="button" onClick={() => adjustTeamNumber(team.id, "runDiff", 5)}>+5</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {!visibleTeams.length && (
        <div className="card operator-empty-state">
          <h3>No teams match those filters.</h3>
          <button onClick={() => { setSearch(""); setLeagueFilter("ALL"); setProgressFilter("all"); }}>Show All Teams</button>
        </div>
      )}
    </div>
  );
}
