import { PLAYOFF_WINS_NEEDED } from "../config/constants";

export function defaultBracketSeries() {
  return {
    awayTeamId: "",
    homeTeamId: "",
    awayWins: 0,
    homeWins: 0,
    winnerTeamId: "",
    games: [],
  };
}

export function defaultPlayoffBracket() {
  return {
    al: {
      qf1: defaultBracketSeries(),
      qf2: defaultBracketSeries(),
      qf3: defaultBracketSeries(),
      qf4: defaultBracketSeries(),
      sf1: defaultBracketSeries(),
      sf2: defaultBracketSeries(),
      lc: defaultBracketSeries(),
    },
    nl: {
      qf1: defaultBracketSeries(),
      qf2: defaultBracketSeries(),
      qf3: defaultBracketSeries(),
      qf4: defaultBracketSeries(),
      sf1: defaultBracketSeries(),
      sf2: defaultBracketSeries(),
      lc: defaultBracketSeries(),
    },
    finals: defaultBracketSeries(),
  };
}

export function makeSafePlayoffBracket(bracket) {
  const defaults = defaultPlayoffBracket();

  const mergeSeries = (series) => ({
    ...defaultBracketSeries(),
    ...(series || {}),
    games: Array.isArray(series?.games) ? series.games : [],
  });

  const safeLeague = (leagueKey) => ({
    qf1: mergeSeries(bracket?.[leagueKey]?.qf1 || defaults[leagueKey].qf1),
    qf2: mergeSeries(bracket?.[leagueKey]?.qf2 || defaults[leagueKey].qf2),
    qf3: mergeSeries(bracket?.[leagueKey]?.qf3 || defaults[leagueKey].qf3),
    qf4: mergeSeries(bracket?.[leagueKey]?.qf4 || defaults[leagueKey].qf4),
    sf1: mergeSeries(bracket?.[leagueKey]?.sf1 || defaults[leagueKey].sf1),
    sf2: mergeSeries(bracket?.[leagueKey]?.sf2 || defaults[leagueKey].sf2),
    lc: mergeSeries(bracket?.[leagueKey]?.lc || defaults[leagueKey].lc),
  });

  return {
    al: safeLeague("al"),
    nl: safeLeague("nl"),
    finals: mergeSeries(bracket?.finals || bracket?.worldSeries || defaults.finals),
  };
}
export function getWinsNeededForSeries() {
  return PLAYOFF_WINS_NEEDED;
}

export function getPlayoffSeries(bracket, seriesId) {
  if (seriesId === "finals" || seriesId === "worldSeries") {
    return bracket.finals || bracket.worldSeries || defaultBracketSeries();
  }

  const [league, key] = seriesId.split("_");
  return bracket?.[league]?.[key] || defaultBracketSeries();
}

export function setPlayoffSeries(bracket, seriesId, nextSeries) {
  if (seriesId === "finals" || seriesId === "worldSeries") {
    return {
      ...bracket,
      finals: nextSeries,
    };
  }

  const [league, key] = seriesId.split("_");

  return {
    ...bracket,
    [league]: {
      ...bracket[league],
      [key]: nextSeries,
    },
  };
}

export function advancePlayoffWinner(bracket, seriesId, winnerTeamId) {
  if (!winnerTeamId) return bracket;

  const next = makeSafePlayoffBracket(bracket);

  const advanceMap = {
    al_qf1: ["al", "sf1", "awayTeamId"],
    al_qf2: ["al", "sf1", "homeTeamId"],
    al_qf3: ["al", "sf2", "awayTeamId"],
    al_qf4: ["al", "sf2", "homeTeamId"],
    al_sf1: ["al", "lc", "awayTeamId"],
    al_sf2: ["al", "lc", "homeTeamId"],
    al_lc: ["finals", null, "awayTeamId"],

    nl_qf1: ["nl", "sf1", "awayTeamId"],
    nl_qf2: ["nl", "sf1", "homeTeamId"],
    nl_qf3: ["nl", "sf2", "awayTeamId"],
    nl_qf4: ["nl", "sf2", "homeTeamId"],
    nl_sf1: ["nl", "lc", "awayTeamId"],
    nl_sf2: ["nl", "lc", "homeTeamId"],
    nl_lc: ["finals", null, "homeTeamId"],
  };

  const target = advanceMap[seriesId];
  if (!target) return next;

  const [league, key, field] = target;

  if (league === "finals") {
    next.finals = {
      ...next.finals,
      [field]: winnerTeamId,
    };
    return next;
  }

  next[league][key] = {
    ...next[league][key],
    [field]: winnerTeamId,
  };

  return next;
}
