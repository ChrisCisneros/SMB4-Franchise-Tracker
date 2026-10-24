import { SEASON_LENGTH, WILD_CARD_TEAMS_PER_LEAGUE } from "../config/constants";

export function pct(wins, losses) {
  const total = wins + losses;
  if (!total) return ".000";
  return (wins / total).toFixed(3).replace("0.", ".");
}

export function gamesBack(team, leader) {
  if (!leader || team.id === leader.id) return "—";

  const gb = ((leader.wins - team.wins) + (team.losses - leader.losses)) / 2;

  if (gb <= 0) return "—";

  return gb.toFixed(1).replace(".0", "");
}

export function sortTeams(teams) {
  return [...teams].sort((a, b) => {
    const aPct = a.wins + a.losses ? a.wins / (a.wins + a.losses) : 0;
    const bPct = b.wins + b.losses ? b.wins / (b.wins + b.losses) : 0;
    if (bPct !== aPct) return bPct - aPct;
    return (b.runDiff || 0) - (a.runDiff || 0);
  });
}

export function teamLabel(team) {
  return team ? `${team.city} ${team.name}` : "";
}

export function teamOptionLabel(team) {
  if (!team || !team.abbr) return "";
  return `${team.abbr} — ${team.name || "Unnamed Team"}`;
}

export function winningPctValue(team) {
  const wins = Number(team.wins || 0);
  const losses = Number(team.losses || 0);
  const total = wins + losses;
  return total > 0 ? wins / total : 0;
}

export function sortStandingsTeams(list) {
  return [...list].sort((a, b) => {
    const pctDiff = winningPctValue(b) - winningPctValue(a);
    if (pctDiff !== 0) return pctDiff;

    const winDiff = Number(b.wins || 0) - Number(a.wins || 0);
    if (winDiff !== 0) return winDiff;

    const rdDiff = Number(b.runDiff || 0) - Number(a.runDiff || 0);
    if (rdDiff !== 0) return rdDiff;

    return String(a.abbr || "").localeCompare(String(b.abbr || ""));
  });
}

export function formatHalfGame(value) {
  const abs = Math.abs(value);
  return Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
}

export function wildCardGamesBack(team, cutoffTeam, index) {
  if (!team || !cutoffTeam) return "—";

  const raw =
    ((Number(cutoffTeam.wins || 0) - Number(team.wins || 0)) +
      (Number(team.losses || 0) - Number(cutoffTeam.losses || 0))) /
    2;

  const isCutoffOrTiedWithCutoff = raw === 0;

  if (isCutoffOrTiedWithCutoff) return "—";

  if (raw < 0) {
    return `+${formatHalfGame(raw)}`;
  }

  return formatHalfGame(raw);
}

export function gamesBackRaw(team, leader) {
  if (!team || !leader) return 0;

  const leaderWins = Number(leader.wins || 0);
  const leaderLosses = Number(leader.losses || 0);
  const teamWins = Number(team.wins || 0);
  const teamLosses = Number(team.losses || 0);

  return ((leaderWins - teamWins) + (teamLosses - leaderLosses)) / 2;
}

export function formatGamesBack(team, leader) {
  const gb = gamesBackRaw(team, leader);

  if (gb <= 0) return "—";
  return Number.isInteger(gb) ? String(gb) : gb.toFixed(1);
}

export function eliminationNumber(team, target, gamesPerSeason = SEASON_LENGTH) {
  if (!team || !target || team.id === target.id) return "—";

  const targetWins = Number(target.wins || 0);
  const teamLosses = Number(team.losses || 0);

  const number = gamesPerSeason + 1 - targetWins - teamLosses;

  return number <= 0 ? "E" : number;
}

export function gamesPlayed(team) {
  return Number(team.wins || 0) + Number(team.losses || 0);
}

export function gamesRemaining(team) {
  return Math.max(0, SEASON_LENGTH - gamesPlayed(team));
}

export function isEliminatedFromTarget(team, target) {
  if (!team || !target || team.id === target.id) return false;
  return eliminationNumber(team, target) === "E";
}

export function maxPossibleWins(team) {
  return Number(team.wins || 0) + gamesRemaining(team);
}

export function hasClinchedDivision(team, picture) {
  if (!team || !picture) return false;

  const divisionTeams = picture.leagueTeams?.filter(
    (otherTeam) =>
      otherTeam.division === team.division && otherTeam.id !== team.id
  ) || [];

  return divisionTeams.every(
    (otherTeam) => Number(team.wins || 0) > maxPossibleWins(otherTeam)
  );
}

export function hasClinchedTopLeagueSeed(team, picture) {
  if (!team || !picture) return false;

  const leagueTeams = picture.leagueTeams || [];

  return leagueTeams.every(
    (otherTeam) =>
      otherTeam.id === team.id ||
      Number(team.wins || 0) > maxPossibleWins(otherTeam)
  );
}

export function getPlayoffMarker(team, picture, divisionLeader) {
  if (!team || !picture) return "";

  const divisionLeaderIds = new Set(
    picture.divisionLeaders.map((leaderTeam) => leaderTeam.id)
  );

  const firstTeamOut = picture.wildcardTeams[WILD_CARD_TEAMS_PER_LEAGUE];

  const allLeagueGamesFinished = (picture.leagueTeams || []).every(
    (leagueTeam) => gamesRemaining(leagueTeam) === 0
  );

  if (allLeagueGamesFinished && hasClinchedTopLeagueSeed(team, picture)) {
    return "z";
  }

  if (hasClinchedDivision(team, picture)) {
    return "y";
  }

  if (firstTeamOut) {
    const firstTeamOutMaxWins =
      Number(firstTeamOut.wins || 0) + gamesRemaining(firstTeamOut);

    const hasClinchedPlayoffSpot =
      Number(team.wins || 0) > firstTeamOutMaxWins;

    if (hasClinchedPlayoffSpot) {
      if (!divisionLeaderIds.has(team.id)) {
        return "w";
      }

      return "x";
    }
  }

  if (divisionLeader && isEliminatedFromTarget(team, divisionLeader)) {
    return "e";
  }

  return "";
}

export function getWildcardMarker(team, picture, index) {
  if (!team || !picture) return "";

  const isWildCardTeam = index < WILD_CARD_TEAMS_PER_LEAGUE;
  const cutoffTeam = picture.cutoffTeam;

  if (isWildCardTeam) {
    const firstTeamOut = picture.wildcardTeams[WILD_CARD_TEAMS_PER_LEAGUE];

    if (!firstTeamOut) return "";

    const firstTeamOutMaxWins =
      Number(firstTeamOut.wins || 0) + gamesRemaining(firstTeamOut);

    if (Number(team.wins || 0) > firstTeamOutMaxWins) {
      return "w";
    }

    return "";
  }

  if (cutoffTeam && isEliminatedFromTarget(team, cutoffTeam)) {
    return "e";
  }

  return "";
}

export function getTeamColors(team) {
  const defaults = { primary: "#071739", accent: "#2f66ff" };
  if (!team?.abbr) return defaults;
  const map = {
    ARI: { primary: "#A71930", accent: "#E3D4AD" },
    ATL: { primary: "#CE1141", accent: "#13274F" },
    BAL: { primary: "#DF4601", accent: "#000000" },
    BOS: { primary: "#BD3039", accent: "#0C2340" },
    CHC: { primary: "#0E3386", accent: "#CC3433" },
    CWS: { primary: "#111111", accent: "#C4CED4" },
    CIN: { primary: "#C6011F", accent: "#000000" },
    CLE: { primary: "#0C2340", accent: "#E31937" },
    COL: { primary: "#333366", accent: "#C4CED4" },
    DET: { primary: "#0C2340", accent: "#FA4616" },
    HOU: { primary: "#002D62", accent: "#EB6E1F" },
    KC: { primary: "#004687", accent: "#BD9B60" },
    LAA: { primary: "#BA0021", accent: "#003263" },
    LAD: { primary: "#005A9C", accent: "#FFFFFF" },
    MIA: { primary: "#00A3E0", accent: "#EF3340" },
    MIL: { primary: "#12284B", accent: "#FFC52F" },
    MIN: { primary: "#002B5C", accent: "#D31145" },
    NYM: { primary: "#002D72", accent: "#FF5910" },
    NYY: { primary: "#132448", accent: "#C4CED3" },
    OAK: { primary: "#003831", accent: "#EFB21E" },
    PHI: { primary: "#E81828", accent: "#002D72" },
    PIT: { primary: "#27251F", accent: "#FDB827" },
    SD: { primary: "#2F241D", accent: "#FFC425" },
    SEA: { primary: "#0C2C56", accent: "#005C5C" },
    SF: { primary: "#FD5A1E", accent: "#27251F" },
    STL: { primary: "#C41E3A", accent: "#0C2340" },
    TB: { primary: "#092C5C", accent: "#8FBCE6" },
    TEX: { primary: "#003278", accent: "#C0111F" },
    TOR: { primary: "#134A8E", accent: "#E8291C" },
    WSH: { primary: "#AB0003", accent: "#14225A" },
  };
  return map[team.abbr] || defaults;
}


export function getLastNameSortValue(name) {
  return String(name || "").trim().split(/\s+/).slice(-1)[0]?.toLowerCase() || "";
}
