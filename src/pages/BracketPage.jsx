import React from "react";

export default function BracketPage({ ctx }) {
  const { renderBracketSeries, data, teamById } = ctx;
  const history = data.seasonHistory || [];
  const latest = [...history].sort((a,b)=>(Date.parse(b.archivedAt)||0)-(Date.parse(a.archivedAt)||0))[0];
  const defendingChampion = latest?.championTeamId ? (latest.teams || []).find((t)=>t.id===latest.championTeamId) : null;
  const currentFinals = data.playoffBracket?.finals || {};
  const wsAway = teamById?.(currentFinals.awayTeamId);
  const wsHome = teamById?.(currentFinals.homeTeamId);

  return (
    <div className="bracket-page">
        <div className="card season-format-card">
          <h2>Playoff Bracket</h2>
          <p className="muted">
            40-game regular season. Top 8 teams per league qualify. Every series is best-of-5.
          </p>
        </div>
    
        <div className="playoff-hub-strip">
          <div className="playoff-hub-stat"><span>Defending Champion</span><strong>{defendingChampion?.abbr || "—"}</strong></div>
          <div className="playoff-hub-stat"><span>World Series Matchup</span><strong>{wsAway?.abbr && wsHome?.abbr ? `${wsAway.abbr} vs ${wsHome.abbr}` : "TBD"}</strong></div>
          <div className="playoff-hub-stat"><span>Archived Postseasons</span><strong>{history.length}</strong></div>
        </div>

        <div className="smb-bracket-shell">
          {["AL", "NL"].map((league) => {
            const leagueKey = league.toLowerCase();
    
            return (
              <div className="smb-league-bracket" key={`${league}-smb-bracket`}>
                <h3>{league}</h3>
    
                <div className="smb-bracket-grid">
                  <div className="smb-bracket-column">
                    <div className="bracket-round-title">Quarterfinals</div>
    
                    {renderBracketSeries(
                      `${leagueKey}_qf1`,
                      `QF A — #1 vs #8`,
                      null,
                      null,
                      "qf-slot-1"
                    )}
    
                    {renderBracketSeries(
                      `${leagueKey}_qf2`,
                      `QF B — #4 vs #5`,
                      null,
                      null,
                      "qf-slot-2"
                    )}
    
                    {renderBracketSeries(
                      `${leagueKey}_qf3`,
                      `QF C — #3 vs #6`,
                      null,
                      null,
                      "qf-slot-3"
                    )}
    
                    {renderBracketSeries(
                      `${leagueKey}_qf4`,
                      `QF D — #2 vs #7`,
                      null,
                      null,
                      "qf-slot-4"
                    )}
                  </div>
    
                  <div className="smb-bracket-column">
                    <div className="bracket-round-title">{league} Division Series</div>
    
                    {renderBracketSeries(
                      `${leagueKey}_sf1`,
                      `${league}DS A — QF A vs QF B`,
                      null,
                      null,
                      "sf-slot-1"
                    )}
    
                    {renderBracketSeries(
                      `${leagueKey}_sf2`,
                      `${league}DS B — QF C vs QF D`,
                      null,
                      null,
                      "sf-slot-2"
                    )}
                  </div>
    
                  <div className="smb-bracket-column">
                    <div className="bracket-round-title">{league} Championship Series</div>
    
                    {renderBracketSeries(
                      `${leagueKey}_lc`,
                      `${league}CS`,
                      null,
                      null,
                      "lc-slot"
                    )}
                  </div>
                </div>
              </div>
            );
          })}
    
          <div className="smb-finals-wrap">
      <div className="bracket-round-title">World Series</div>
      {renderBracketSeries(
        "finals",
        "World Series",
        null,
        null,
        "finals-slot world-series-card"
      )}
    </div>
        </div>
      </div>
  );
}
