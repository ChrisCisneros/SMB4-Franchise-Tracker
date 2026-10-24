import React from "react";
import { WILD_CARD_TEAMS_PER_LEAGUE } from "../config/constants";
import { getTeamColorsByAbbr } from "../config/teamColors";
import {
  eliminationNumber,
  gamesBack,
  getPlayoffMarker,
  getWildcardMarker,
  pct,
  wildCardGamesBack,
} from "../utils/standingsUtils";

function rdText(value) {
  const number = Number(value || 0);
  return `${number > 0 ? "+" : ""}${number}`;
}

function markerLabel(marker) {
  return ({ z: "#1 Seed", y: "Division", x: "Playoffs", w: "Wild Card", e: "Eliminated" })[marker] || "";
}

function TeamCell({ team, marker }) {
  const colors = getTeamColorsByAbbr(team?.abbr);
  return (
    <span className="standings-team-cell">
      <i
        className="standings-team-swatch"
        style={{ background: colors.main, borderColor: colors.border }}
      />
      <span className="standings-team-copy">
        <strong>{team?.abbr || "TBD"}</strong>
        <small>{team?.name || ""}</small>
      </span>
      {marker && (
        <span className={`playoff-marker marker-${marker}`} title={markerLabel(marker)}>
          {marker}
        </span>
      )}
    </span>
  );
}

function DivisionCard({ league, division, divisionTeams, picture, recentlyUpdatedTeamId }) {
  const leader = divisionTeams[0];
  const leaderColors = getTeamColorsByAbbr(leader?.abbr);

  return (
    <div
      className="card standings-division-card"
      style={{ "--division-accent": leaderColors.border || leaderColors.main }}
    >
      <div className="standings-card-head">
        <div>
          <span className="standings-card-kicker">{league} {division}</span>
          <h3>{division} Division</h3>
        </div>
        {leader && (
          <div className="division-leader-chip">
            <span>Leader</span>
            <strong>{leader.abbr}</strong>
          </div>
        )}
      </div>

      <div className="standings-table standings-division-table">
        <div className="standings-table-row standings-table-head">
          <span>RK</span><span>TEAM</span><span>W-L</span><span>PCT</span><span>GB</span><span>E#</span><span>DIFF</span>
        </div>

        {divisionTeams.map((team, index) => {
          const marker = getPlayoffMarker(team, picture, leader);
          return (
            <div
              className={`standings-table-row ${index === 0 ? "division-first" : ""} ${recentlyUpdatedTeamId === team.id ? "recently-updated-row" : ""}`}
              key={team.id}
            >
              <span className="standings-rank">{index + 1}</span>
              <TeamCell team={team} marker={marker} />
              <strong>{team.wins}-{team.losses}</strong>
              <span>{pct(team.wins, team.losses)}</span>
              <span>{gamesBack(team, leader)}</span>
              <span>{index === 0 ? "—" : eliminationNumber(team, leader)}</span>
              <strong className={Number(team.runDiff || 0) > 0 ? "rd-positive" : Number(team.runDiff || 0) < 0 ? "rd-negative" : ""}>
                {rdText(team.runDiff)}
              </strong>
            </div>
          );
        })}
      </div>

      {!divisionTeams.length && <p className="muted">No teams in this division yet.</p>}
    </div>
  );
}

function PlayoffLeagueCard({ picture, recentlyUpdatedTeamId }) {
  const leader = picture.divisionLeaders?.[0];

  return (
    <div className="card standings-playoff-card">
      <div className="standings-card-head playoff-card-head">
        <div>
          <span className="standings-card-kicker">POSTSEASON RACE</span>
          <h3>{picture.league} Playoff Picture</h3>
        </div>
        <div className="playoff-slots-pill">8 TEAMS</div>
      </div>

      <div className="playoff-picture-section">
        <div className="playoff-picture-title"><span>Division Leaders</span><small>Seeds 1–3</small></div>
        <div className="standings-table standings-playoff-table">
          <div className="standings-table-row standings-table-head playoff-head-row">
            <span>SEED</span><span>TEAM</span><span>DIV</span><span>W-L</span><span>PCT</span><span>DIFF</span>
          </div>
          {picture.divisionLeaders.map((team, index) => {
            const marker = getPlayoffMarker(team, picture, team);
            return (
              <div className={`standings-table-row playoff-qualified ${recentlyUpdatedTeamId === team.id ? "recently-updated-row" : ""}`} key={`${picture.league}-leader-${team.id}`}>
                <strong className="seed-number">#{index + 1}</strong>
                <TeamCell team={team} marker={marker} />
                <span>{team.division}</span>
                <strong>{team.wins}-{team.losses}</strong>
                <span>{pct(team.wins, team.losses)}</span>
                <strong className={Number(team.runDiff || 0) >= 0 ? "rd-positive" : "rd-negative"}>{rdText(team.runDiff)}</strong>
              </div>
            );
          })}
        </div>
      </div>

      <div className="playoff-picture-section">
        <div className="playoff-picture-title"><span>Wild Card</span><small>Top 5 advance</small></div>
        <div className="standings-table standings-playoff-table">
          <div className="standings-table-row standings-table-head playoff-head-row">
            <span>SEED</span><span>TEAM</span><span>W-L</span><span>PCT</span><span>WCGB</span><span>DIFF</span>
          </div>
          {picture.wildcardTeams.map((team, index) => {
            const isIn = index < WILD_CARD_TEAMS_PER_LEAGUE;
            const isCutoff = index === WILD_CARD_TEAMS_PER_LEAGUE - 1;
            const marker = getWildcardMarker(team, picture, index);
            return (
              <div
                className={`standings-table-row ${isIn ? "playoff-qualified" : "playoff-chasing"} ${isCutoff ? "standings-cut-line" : ""} ${recentlyUpdatedTeamId === team.id ? "recently-updated-row" : ""}`}
                key={`${picture.league}-wc-${team.id}`}
              >
                <strong className="seed-number">{isIn ? `#${index + 4}` : "—"}</strong>
                <TeamCell team={team} marker={marker} />
                <strong>{team.wins}-{team.losses}</strong>
                <span>{pct(team.wins, team.losses)}</span>
                <span>{wildCardGamesBack(team, picture.cutoffTeam, index)}</span>
                <strong className={Number(team.runDiff || 0) >= 0 ? "rd-positive" : "rd-negative"}>{rdText(team.runDiff)}</strong>
              </div>
            );
          })}
        </div>
      </div>

      {!picture.wildcardTeams.length && <p className="muted">No wild card teams yet.</p>}
    </div>
  );
}

export default function StandingsPage({ ctx }) {
  const { data, playoffPicture, standings, recentlyUpdatedTeamId } = ctx;
  const allTeams = data.teams || [];
  const gamesPlayed = allTeams.reduce((sum, team) => sum + Number(team.wins || 0) + Number(team.losses || 0), 0) / 2;
  const best = gamesPlayed > 0 ? [...allTeams].sort((a, b) => {
    const ap = Number(a.wins || 0) + Number(a.losses || 0) ? Number(a.wins || 0) / (Number(a.wins || 0) + Number(a.losses || 0)) : 0;
    const bp = Number(b.wins || 0) + Number(b.losses || 0) ? Number(b.wins || 0) / (Number(b.wins || 0) + Number(b.losses || 0)) : 0;
    return bp - ap || Number(b.runDiff || 0) - Number(a.runDiff || 0);
  })[0] : null;

  return (
    <div className="standings-v3-page">
      <section className="standings-hero card">
        <div>
          <div className="standings-hero-eyebrow">FRANCHISE CENTRAL · V3</div>
          <h1>{data.activeSeasonName || "Season 4"} Standings</h1>
          <p>Division races, clinch status and the live road to the postseason.</p>
        </div>
        <div className="standings-hero-stats">
          <div><span>Games Played</span><strong>{Math.round(gamesPlayed)}</strong></div>
          <div><span>League Leader</span><strong>{best?.abbr || "—"}</strong></div>
          <div><span>Best Record</span><strong>{best ? `${best.wins}-${best.losses}` : "—"}</strong></div>
        </div>
      </section>

      <div className="standings-legend card">
        <strong>Clinching Key</strong>
        <span><b className="legend-marker marker-z">z</b>#1 Seed</span>
        <span><b className="legend-marker marker-y">y</b>Division</span>
        <span><b className="legend-marker marker-x">x</b>Playoffs</span>
        <span><b className="legend-marker marker-w">w</b>Wild Card</span>
        <span><b className="legend-marker marker-e">e</b>Eliminated</span>
      </div>

      {(data.leagues || []).map((league) => {
        const picture = playoffPicture.find((item) => item.league === league);
        const leagueTeams = allTeams.filter((team) => team.league === league);
        const leagueHasGames = leagueTeams.some((team) => Number(team.wins || 0) + Number(team.losses || 0) > 0);
        const leagueBest = leagueHasGames ? [...leagueTeams].sort((a, b) => Number(b.wins || 0) - Number(a.wins || 0) || Number(b.runDiff || 0) - Number(a.runDiff || 0))[0] : null;
        return (
          <section className="standings-league-section" key={league}>
            <div className="standings-league-masthead">
              <div><span>{league}</span><h2>{league === "AL" ? "American League" : "National League"}</h2></div>
              <div>{leagueBest ? `${leagueBest.abbr} leads ${league} at ${leagueBest.wins}-${leagueBest.losses}` : "Season awaiting first results"}</div>
            </div>
            <div className="standings-division-grid">
              {(data.divisions || []).map((division) => {
                const key = `${league}-${division}`;
                return <DivisionCard key={key} league={league} division={division} divisionTeams={standings[key] || []} picture={picture} recentlyUpdatedTeamId={recentlyUpdatedTeamId} />;
              })}
            </div>
          </section>
        );
      })}

      <section className="standings-postseason-section">
        <div className="standings-section-heading">
          <div><span>IF THE SEASON ENDED TODAY</span><h2>Playoff Picture</h2></div>
          <p>Division leaders earn the top three seeds; five wild cards fill the field.</p>
        </div>
        <div className="standings-playoff-grid">
          {playoffPicture.map((picture) => <PlayoffLeagueCard key={picture.league} picture={picture} recentlyUpdatedTeamId={recentlyUpdatedTeamId} />)}
        </div>
      </section>
    </div>
  );
}
