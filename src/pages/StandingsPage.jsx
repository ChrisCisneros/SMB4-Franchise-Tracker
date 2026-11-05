import React, { useMemo } from "react";
import { WILD_CARD_TEAMS_PER_LEAGUE } from "../config/constants";
import { getTeamColorsByAbbr } from "../config/teamColors";
import { buildNMLBPowerIndex } from '../utils/nmlbUniverseUtils';
import {
  eliminationNumber,
  divisionEliminationNumber,
  gamesBack,
  getPlayoffMarker,
  getWildcardMarker,
  isDivisionEliminated,
  pct,
  wildCardEliminationNumber,
  wildCardGamesBack,
} from "../utils/standingsUtils";
import { buildV4TeamMetrics } from "../utils/v4Utils";

function rdText(value) {
  const number = Number(value || 0);
  return `${number > 0 ? "+" : ""}${number}`;
}

function markerLabel(marker) {
  return ({ z: "#1 Seed", y: "Division", x: "Playoffs", w: "Wild Card", e: "Eliminated" })[marker] || "";
}

function TeamCell({ team, marker, divisionOut = false }) {
  const colors = getTeamColorsByAbbr(team?.abbr);
  return (
    <span className="standings-team-cell">
      <i
        className="standings-team-swatch"
        style={{ background: colors.main, borderColor: colors.border }}
      />
      <span className="standings-team-copy">
        <span className="standings-team-name-line">
          <strong>{team?.abbr || "TBD"}</strong>
          {marker && (
            <span className={`playoff-marker marker-${marker}`} title={markerLabel(marker)}>
              {marker === "e" ? "E" : marker}
            </span>
          )}
          {divisionOut && marker !== "e" && <span className="division-elim-marker" title="Mathematically eliminated from the division race">E</span>}
        </span>
        <small>{team?.name || ""}</small>
      </span>
    </span>
  );
}

function DivisionCard({ league, division, divisionTeams, picture, recentlyUpdatedTeamId }) {
  const leader = divisionTeams[0];
  const leaderColors = getTeamColorsByAbbr(leader?.abbr);
  const leaderMarker = leader ? getPlayoffMarker(leader, picture, leader) : "";
  const nearestChaser = divisionTeams.find((team) => team.id !== leader?.id && !isDivisionEliminated(team, picture));
  const divisionLocked = leaderMarker === "y" || leaderMarker === "z";

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
          <div className={`division-leader-chip ${divisionLocked ? "is-clinched" : ""}`}>
            <span>{divisionLocked ? "Clinched" : "Leader"}</span>
            <div><strong>{leader.abbr}</strong>{leaderMarker && <b className={`playoff-marker marker-${leaderMarker}`} title={markerLabel(leaderMarker)}>{leaderMarker}</b>}</div>
          </div>
        )}
      </div>

      <div className={`division-race-meter ${divisionLocked ? "is-clinched" : ""}`}>
        <span>{divisionLocked ? `${leader?.abbr || "—"} OWNS THE DIVISION` : nearestChaser ? `${leader?.abbr || "—"} vs ${nearestChaser.abbr} · ${gamesBack(nearestChaser, leader)} GB` : "DIVISION RACE"}</span>
        <strong>{divisionLocked ? markerLabel(leaderMarker) : nearestChaser ? `${divisionEliminationNumber(nearestChaser, picture)} E#` : "—"}</strong>
      </div>

      <div className="standings-table standings-division-table">
        <div className="standings-table-row standings-table-head">
          <span>RK</span><span>TEAM</span><span>W-L</span><span>PCT</span><span>GB</span><span>E#</span><span>DIFF</span>
        </div>

        {divisionTeams.map((team, index) => {
          const marker = getPlayoffMarker(team, picture, leader);
          const teamDivisionOut = isDivisionEliminated(team, picture);
          const rowStatus = marker ? `status-${marker}` : teamDivisionOut ? "status-division-out" : "";
          return (
            <div
              className={`standings-table-row ${index === 0 ? "division-first" : ""} ${rowStatus} ${recentlyUpdatedTeamId === team.id ? "recently-updated-row" : ""}`}
              key={team.id}
            >
              <span className="standings-rank">{index + 1}</span>
              <TeamCell team={team} marker={marker} divisionOut={teamDivisionOut} />
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
        <div className="standings-table standings-playoff-table standings-wildcard-table">
          <div className="standings-table-row standings-table-head playoff-head-row">
            <span>SEED</span><span>TEAM</span><span>W-L</span><span>PCT</span><span>WCGB</span><span>E#</span><span>DIFF</span>
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
                <TeamCell team={team} marker={marker} divisionOut={isDivisionEliminated(team, picture)} />
                <strong>{team.wins}-{team.losses}</strong>
                <span>{pct(team.wins, team.losses)}</span>
                <span>{wildCardGamesBack(team, picture.cutoffTeam, index)}</span>
                <span className={wildCardEliminationNumber(team, picture) === "E" ? "race-eliminated-number" : ""}>{isIn ? "—" : wildCardEliminationNumber(team, picture)}</span>
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
  const v4Metrics = useMemo(() => buildV4TeamMetrics(data, data.teams || [], playoffPicture), [data, playoffPicture]);
  const allTeams = data.teams || [];
  const gamesPlayed = allTeams.reduce((sum, team) => sum + Number(team.wins || 0) + Number(team.losses || 0), 0) / 2;
  const best = gamesPlayed > 0 ? [...allTeams].sort((a, b) => {
    const ap = Number(a.wins || 0) + Number(a.losses || 0) ? Number(a.wins || 0) / (Number(a.wins || 0) + Number(a.losses || 0)) : 0;
    const bp = Number(b.wins || 0) + Number(b.losses || 0) ? Number(b.wins || 0) / (Number(b.wins || 0) + Number(b.losses || 0)) : 0;
    return bp - ap || Number(b.runDiff || 0) - Number(a.runDiff || 0);
  })[0] : null;

  const closestMagic=[...v4Metrics].filter(m=>m.playoffMagic!=null&&m.playoffMagic>0).sort((a,b)=>a.playoffMagic-b.playoffMagic)[0];
  const bubble=[...v4Metrics].sort((a,b)=>Math.abs(a.playoffProbability-50)-Math.abs(b.playoffProbability-50))[0];
  const toughest=[...v4Metrics].sort((a,b)=>b.sos-a.sos)[0];
  const biggestMover=[...v4Metrics].filter(m=>m.previousRank).sort((a,b)=>Math.abs(b.movement)-Math.abs(a.movement))[0];

  const nmlbPower=buildNMLBPowerIndex(data,allTeams,playoffPicture);
  const divisionOut = playoffPicture.flatMap((picture) => (picture.leagueTeams || []).filter((team) => isDivisionEliminated(team, picture)).map((team) => ({ team, picture })));
  const postseasonOut = playoffPicture.flatMap((picture) => (picture.leagueTeams || []).filter((team) => getPlayoffMarker(team, picture) === "e").map((team) => ({ team, picture })));
  return (
    <div className="standings-v3-page standings-v4-page">
      <section className="standings-hero card">
        <div>
          <div className="standings-hero-eyebrow">NMLB · V6.4.13 · PENNANT RACE COMMAND</div>
          <h1>NMLB Pennant Race</h1>
          <p>{data.activeSeasonName || "Season 4"} is entering the pressure zone. Division control, Wild Card survival, clinches and elimination paths all live here.</p>
        </div>
        <div className="standings-hero-stats">
          <div><span>Games Played</span><strong>{Math.round(gamesPlayed)}</strong></div>
          <div><span>League Leader</span><strong>{best?.abbr || "—"}</strong></div>
          <div><span>Best Record</span><strong>{best ? `${best.wins}-${best.losses}` : "—"}</strong></div>
        </div>
      </section>

      <section className="card nmlb63-standings-power"><div><small>NMLB POWER INDEX</small><h2>Who is dangerous right now?</h2><p>Record, run differential, recent form, streak and postseason position rolled into one league pulse.</p></div><div className="nmlb63-power-mini">{nmlbPower.slice(0,5).map(x=><article key={x.team.id}><b>#{x.rank}</b><strong>{x.team.abbr}</strong><span>{x.score}</span><em>{x.label}</em></article>)}</div></section>
      <section className="nmlb646-race-control">
        <article className="card nmlb646-race-card"><small>DIVISION RACE STATUS</small><strong>{divisionOut.length}</strong><span>clubs mathematically out of their division race</span><div>{divisionOut.slice(0,8).map(({team,picture})=><b key={team.id}>{team.abbr} · {getPlayoffMarker(team,picture)==='e'?'POSTSEASON OUT':'DIVISION E'}</b>)}</div></article>
        <article className="card nmlb646-race-card danger"><small>POSTSEASON ELIMINATION</small><strong>{postseasonOut.length}</strong><span>clubs fully eliminated from the NMLB postseason</span><div>{postseasonOut.slice(0,8).map(({team})=><b key={team.id}>{team.abbr} · ELIMINATED</b>)}</div></article>
        <article className="card nmlb646-race-card"><small>TIEBREAK POLICY</small><strong>RD</strong><span>run differential resolves completed-schedule ties</span><div><b>NO MORE ZOMBIE TEAMS</b></div></article>
      </section>
      <section className="standings-v61-race-strip">{playoffPicture.map(p=>{const leader=p.divisionLeaders?.[0];const bubble=p.wildcardTeams?.[WILD_CARD_TEAMS_PER_LEAGUE-1];const chase=p.wildcardTeams?.[WILD_CARD_TEAMS_PER_LEAGUE];return <article className="card" key={`pulse-${p.league}`}><small>{p.league} RACE PULSE</small><strong>{leader?.abbr||'—'} sets the pace</strong><span>{bubble?`${bubble.abbr} currently holds the final Wild Card`: 'Race still forming'}</span><em>{chase?`${chase.abbr} is first team out`:'No team below the cut yet'}</em></article>})}</section>

      <section className="card standings-v4-intel">
        <div><span>Closest Magic Number</span><strong>{closestMagic ? `${closestMagic.team.abbr} · ${closestMagic.playoffMagic}` : "—"}</strong></div>
        <div><span>Bubble Team</span><strong>{bubble ? `${bubble.team.abbr} · ${Math.round(bubble.playoffProbability)}%` : "—"}</strong></div>
        <div><span>Toughest SOS</span><strong>{toughest?.team?.abbr || "—"}</strong><small>{toughest ? toughest.sos.toFixed(3).replace(/^0/,"") : ""}</small></div>
        <div><span>Biggest Mover</span><strong>{biggestMover ? `${biggestMover.team.abbr} ${biggestMover.movement>0?"▲":"▼"}${Math.abs(biggestMover.movement)}` : "—"}</strong></div>
      </section>

      <div className="standings-legend card">
        <strong>NMLB Clinching Key</strong>
        <span><b className="legend-marker marker-z">z</b><i>#1 Seed</i></span>
        <span><b className="legend-marker marker-y">y</b><i>Division</i></span>
        <span><b className="legend-marker marker-x">x</b><i>Playoffs</i></span>
        <span><b className="legend-marker marker-w">w</b><i>Wild Card</i></span>
        <span><b className="legend-marker marker-e">E</b><i>Postseason Eliminated</i></span>
        <span><b className="legend-division-e">E</b><i>Division Eliminated</i></span>
      </div>

      {(data.leagues || []).map((league) => {
        const picture = playoffPicture.find((item) => item.league === league);
        const leagueTeams = allTeams.filter((team) => team.league === league);
        const leagueHasGames = leagueTeams.some((team) => Number(team.wins || 0) + Number(team.losses || 0) > 0);
        const leagueBest = leagueHasGames ? [...leagueTeams].sort((a, b) => Number(b.wins || 0) - Number(a.wins || 0) || Number(b.runDiff || 0) - Number(a.runDiff || 0))[0] : null;
        return (
          <section className={`standings-league-section league-${league.toLowerCase()}`} key={league}>
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
          <div><span>IF THE SEASON ENDED TODAY</span><h2>NMLB Postseason Field</h2></div>
          <p>Division leaders take Seeds 1–3. Five Wild Cards survive the cut. Every marker above is mathematically earned.</p>
        </div>
        <div className="standings-playoff-grid">
          {playoffPicture.map((picture) => <PlayoffLeagueCard key={picture.league} picture={picture} recentlyUpdatedTeamId={recentlyUpdatedTeamId} />)}
        </div>
      </section>
    </div>
  );
}
