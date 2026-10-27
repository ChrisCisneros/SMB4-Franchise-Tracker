import { makeSafePlayoffBracket } from "./playoffUtils";
import { buildLeagueRecords, formatPct } from "./recordsUtils";
import { buildGameRecords, buildHeadToHead, buildTeamHistoryLeaders } from "./historyUtils";
import { buildHistoricGameAlerts } from "./ballparkLifeUtils";

function gamePct(team) {
  const wins = Number(team?.wins || 0);
  const losses = Number(team?.losses || 0);
  const total = wins + losses;
  return total ? wins / total : 0;
}

function teamName(team) {
  return team ? `${team.city ? `${team.city} ` : ""}${team.name || team.abbr}`.trim() : "Unknown team";
}

function seasonTeamName(team) {
  return team ? team.name || team.abbr || "Unknown team" : "Unknown team";
}

function formatArchiveDate(value) {
  if (!value) return "Archived season";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Archived season";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function currentDivisionRace(teams) {
  const races = [];
  ["AL", "NL"].forEach((league) => {
    ["East", "Central", "West"].forEach((division) => {
      const group = teams
        .filter((team) => team.league === league && team.division === division)
        .sort((a, b) => gamePct(b) - gamePct(a) || Number(b.wins || 0) - Number(a.wins || 0) || Number(b.runDiff || 0) - Number(a.runDiff || 0));
      if (group.length < 2) return;
      const [leader, second] = group;
      const gamesPlayed = Number(leader.wins || 0) + Number(leader.losses || 0) + Number(second.wins || 0) + Number(second.losses || 0);
      if (!gamesPlayed) return;
      const gap = ((Number(leader.wins || 0) - Number(second.wins || 0)) + (Number(second.losses || 0) - Number(leader.losses || 0))) / 2;
      races.push({ league, division, leader, second, gap: Math.max(0, gap) });
    });
  });
  return races.sort((a, b) => a.gap - b.gap)[0] || null;
}

function getSeasonPlayoffStats(season) {
  const bracket = makeSafePlayoffBracket(season.playoffBracket);
  const series = [
    ...Object.values(bracket.al || {}),
    ...Object.values(bracket.nl || {}),
    bracket.finals,
  ].filter(Boolean);
  const wins = new Map();
  series.forEach((item) => {
    if (item.awayTeamId) wins.set(item.awayTeamId, (wins.get(item.awayTeamId) || 0) + Number(item.awayWins || 0));
    if (item.homeTeamId) wins.set(item.homeTeamId, (wins.get(item.homeTeamId) || 0) + Number(item.homeWins || 0));
  });
  return [...wins.entries()].sort((a, b) => b[1] - a[1])[0] || null;
}

export function buildNewsFeed(data, teams) {
  const stories = [];
  const activeTeams = Array.isArray(teams) ? teams : [];
  const seasonHistory = Array.isArray(data?.seasonHistory) ? data.seasonHistory : [];
  const teamById = (id) => activeTeams.find((team) => team.id === id);



  const extremeAlerts = buildHistoricGameAlerts(data, activeTeams);
  extremeAlerts.slice(0,3).forEach((alert,index)=>stories.push({
    id:`extreme-${alert.id}-${index}`,
    category:alert.live?'Developing':'League Alert',
    tone:alert.score>=75?'postseason':'current',
    dateLabel:alert.live?'LIVE':'Recent game',
    headline:alert.headline||alert.kicker,
    dek:`${alert.detail}${alert.tags?.length?` · ${alert.tags.join(' · ')}`:''}`,
    teams:[alert.away?.abbr,alert.home?.abbr].filter(Boolean),
  }));

  const lastFinal = data?.lastFinalGame;
  if (lastFinal?.awayTeamId && lastFinal?.homeTeamId) {
    const away = teamById(lastFinal.awayTeamId);
    const home = teamById(lastFinal.homeTeamId);
    const awayScore = Number(lastFinal.awayScore || 0);
    const homeScore = Number(lastFinal.homeScore || 0);
    const winner = awayScore > homeScore ? away : home;
    const loser = awayScore > homeScore ? home : away;
    // Only V2+ verified walk-offs get the walk-off treatment. Older game objects
    // used a too-broad heuristic and may contain false positives.
    const isVerifiedWalkoff = lastFinal.walkoffVerified === true;
    if (away && home && winner && loser) {
      stories.push({
        id: `latest-final-${lastFinal.id || `${lastFinal.awayTeamId}-${lastFinal.homeTeamId}-${lastFinal.date || "game"}`}`,
        category: "Game Final",
        tone: lastFinal.gameType === "playoff" ? "postseason" : "game",
        dateLabel: lastFinal.date || "Latest final",
        headline: isVerifiedWalkoff
          ? `${home.abbr} walks it off against ${away.abbr}`
          : `${winner.abbr} takes the latest final over ${loser.abbr}`,
        dek: `${away.abbr} ${awayScore}, ${home.abbr} ${homeScore}. ${isVerifiedWalkoff ? `${teamName(home)} ended it in walk-off fashion.` : `${teamName(winner)} won by ${Math.abs(awayScore - homeScore)} run${Math.abs(awayScore - homeScore) === 1 ? "" : "s"}.`}`,
        teams: [away.abbr, home.abbr],
      });
    }
  }

  const teamsWithGames = activeTeams.filter((team) => Number(team.wins || 0) + Number(team.losses || 0) > 0);
  if (teamsWithGames.length) {
    const best = [...teamsWithGames].sort((a, b) => gamePct(b) - gamePct(a) || Number(b.wins || 0) - Number(a.wins || 0) || Number(b.runDiff || 0) - Number(a.runDiff || 0))[0];
    const rdKing = [...teamsWithGames].sort((a, b) => Number(b.runDiff || 0) - Number(a.runDiff || 0))[0];
    const race = currentDivisionRace(activeTeams);

    stories.push({
      id: "current-best-record",
      category: "League Watch",
      tone: "current",
      dateLabel: "Current season",
      headline: `${best.abbr} owns the league's best record`,
      dek: `${teamName(best)} sits at ${best.wins}-${best.losses} (${formatPct(gamePct(best))}) with a ${Number(best.runDiff || 0) >= 0 ? "+" : ""}${Number(best.runDiff || 0)} run differential.`,
      teams: [best.abbr],
    });

    if (rdKing && rdKing.id !== best.id) {
      stories.push({
        id: "current-run-diff",
        category: "League Watch",
        tone: "current",
        dateLabel: "Current season",
        headline: `${rdKing.abbr} is setting the pace in run differential`,
        dek: `${teamName(rdKing)} leads the league at ${Number(rdKing.runDiff || 0) >= 0 ? "+" : ""}${Number(rdKing.runDiff || 0)}.`,
        teams: [rdKing.abbr],
      });
    }

    if (race) {
      const gapText = Number.isInteger(race.gap) ? String(race.gap) : race.gap.toFixed(1);
      stories.push({
        id: "current-tightest-division",
        category: "Pennant Race",
        tone: "current",
        dateLabel: "Current season",
        headline: `${race.league} ${race.division} is the league's tightest race`,
        dek: `${race.leader.abbr} leads ${race.second.abbr} by ${gapText} game${race.gap === 1 ? "" : "s"}.`,
        teams: [race.leader.abbr, race.second.abbr],
      });
    }
  }

  const extras = data?.leagueExtras || {};
  (extras.transactions || []).slice(0, 4).forEach((item, index) => stories.push({
    id:`transaction-${item.id || index}`, category:'Transactions', tone:'transaction', dateLabel:item.date || 'League wire',
    headline:item.title || `${item.teamAbbr || 'League'} transaction`,
    dek:item.note || `${item.teamAbbr || 'A club'} made a roster move.`,
    teams:item.teamAbbr ? [item.teamAbbr] : []
  }));
  (extras.injuries || []).slice(0, 3).forEach((item, index) => stories.push({
    id:`injury-${item.id || index}`, category:'Injury Report', tone:'injury', dateLabel:item.date || 'Medical update',
    headline:`${item.name || 'Player'} injury update${item.teamAbbr ? ` for ${item.teamAbbr}` : ''}`,
    dek:item.note || 'Status has been added to the league injury log.',
    teams:item.teamAbbr ? [item.teamAbbr] : []
  }));
  (extras.awards || []).slice(0, 3).forEach((item, index) => stories.push({
    id:`award-${item.id || index}`, category:'Awards', tone:'archive', dateLabel:item.season || 'League honors',
    headline:`${item.winner || 'Winner'} named ${item.award || 'award winner'}`,
    dek:`${item.teamAbbr ? `${item.teamAbbr} · ` : ''}${item.season || 'League award'}.`,
    teams:item.teamAbbr ? [item.teamAbbr] : []
  }));

  seasonHistory.forEach((season, index) => {
    const bracket = makeSafePlayoffBracket(season.playoffBracket);
    const championId = season.championTeamId || bracket.finals?.winnerTeamId;
    const champion = (season.teams || []).find((team) => team.id === championId);
    const finalsAway = (season.teams || []).find((team) => team.id === bracket.finals?.awayTeamId);
    const finalsHome = (season.teams || []).find((team) => team.id === bracket.finals?.homeTeamId);
    const runnerUp = finalsAway?.id === championId ? finalsHome : finalsAway;
    const bestSeasonTeam = [...(season.teams || [])].sort((a, b) => gamePct(b) - gamePct(a) || Number(b.wins || 0) - Number(a.wins || 0) || Number(b.runDiff || 0) - Number(a.runDiff || 0))[0];
    const playoffLeader = getSeasonPlayoffStats(season);
    const playoffLeaderTeam = playoffLeader ? (season.teams || []).find((team) => team.id === playoffLeader[0]) : null;

    if (champion) {
      stories.push({
        id: `archive-title-${season.id || index}`,
        category: "Championship",
        tone: "championship",
        dateLabel: formatArchiveDate(season.archivedAt),
        headline: `${champion.abbr} crowned ${season.name || "season"} World Series champion`,
        dek: runnerUp
          ? `${seasonTeamName(champion)} finished the run by defeating ${runnerUp.abbr} in the World Series.`
          : `${seasonTeamName(champion)} sits at the top of the archived record book for ${season.name || "this season"}.`,
        teams: runnerUp ? [champion.abbr, runnerUp.abbr] : [champion.abbr],
        seasonName: season.name,
      });
    }

    if (bestSeasonTeam) {
      stories.push({
        id: `archive-best-${season.id || index}`,
        category: "Season Recap",
        tone: "archive",
        dateLabel: season.name || formatArchiveDate(season.archivedAt),
        headline: `${bestSeasonTeam.abbr} posted ${season.name || "the season"}'s best regular-season record`,
        dek: `${bestSeasonTeam.wins}-${bestSeasonTeam.losses} (${formatPct(gamePct(bestSeasonTeam))}) with a ${Number(bestSeasonTeam.runDiff || 0) >= 0 ? "+" : ""}${Number(bestSeasonTeam.runDiff || 0)} run differential.`,
        teams: [bestSeasonTeam.abbr],
        seasonName: season.name,
      });
    }

    if (playoffLeaderTeam && playoffLeader?.[1] > 0) {
      stories.push({
        id: `archive-playoff-wins-${season.id || index}`,
        category: "Postseason",
        tone: "postseason",
        dateLabel: season.name || formatArchiveDate(season.archivedAt),
        headline: `${playoffLeaderTeam.abbr} led ${season.name || "the season"} in playoff game wins`,
        dek: `${playoffLeaderTeam.abbr} collected ${playoffLeader[1]} postseason win${playoffLeader[1] === 1 ? "" : "s"} across the archived bracket.`,
        teams: [playoffLeaderTeam.abbr],
        seasonName: season.name,
      });
    }
  });

  if (seasonHistory.length) {
    const records = buildLeagueRecords(seasonHistory, activeTeams);
    const titleLeader = records.leaders.championships || [];
    const playoffWinsLeader = records.leaders.playoffGameWins || [];
    const playoffAppearanceLeader = records.leaders.playoffAppearances || [];

    if (titleLeader.length && Number(titleLeader[0].championships || 0) > 0) {
      stories.push({
        id: "record-title-leader",
        category: "Record Book",
        tone: "record",
        dateLabel: "All-time",
        headline: `${titleLeader.map((row) => row.abbr).join(" / ")} ${titleLeader.length > 1 ? "share" : "owns"} the championship lead`,
        dek: `${titleLeader[0].championships} World Series title${titleLeader[0].championships === 1 ? "" : "s"} in the archived league history.`,
        teams: titleLeader.map((row) => row.abbr),
      });
    }

    if (playoffWinsLeader.length && Number(playoffWinsLeader[0].playoffGameWins || 0) > 0) {
      stories.push({
        id: "record-playoff-wins-leader",
        category: "Record Book",
        tone: "record",
        dateLabel: "All-time",
        headline: `${playoffWinsLeader.map((row) => row.abbr).join(" / ")} ${playoffWinsLeader.length > 1 ? "share" : "holds"} the playoff wins record`,
        dek: `${playoffWinsLeader[0].playoffGameWins} postseason game win${playoffWinsLeader[0].playoffGameWins === 1 ? "" : "s"} across archived brackets.`,
        teams: playoffWinsLeader.map((row) => row.abbr),
      });
    }

    if (playoffAppearanceLeader.length && Number(playoffAppearanceLeader[0].playoffAppearances || 0) > 0) {
      stories.push({
        id: "record-playoff-appearances-leader",
        category: "Record Book",
        tone: "record",
        dateLabel: "All-time",
        headline: `${playoffAppearanceLeader.map((row) => row.abbr).join(" / ")} ${playoffAppearanceLeader.length > 1 ? "share" : "leads"} in playoff appearances`,
        dek: `${playoffAppearanceLeader[0].playoffAppearances} postseason appearance${playoffAppearanceLeader[0].playoffAppearances === 1 ? "" : "s"} in the archived record book.`,
        teams: playoffAppearanceLeader.map((row) => row.abbr),
      });
    }
  }

  const v3GameRecords = buildGameRecords(data?.games || [], activeTeams, seasonHistory);
  if (v3GameRecords.games.length) {
    const blowout = v3GameRecords.biggestBlowout;
    const high = v3GameRecords.highestScoring;
    const long = v3GameRecords.longestGame;
    if (blowout) stories.push({
      id: "v3-record-biggest-blowout", category: "V3 Record Alert", tone: "record", dateLabel: "Game record",
      headline: `${blowout.away?.abbr || "AWY"}-${blowout.home?.abbr || "HME"} game owns the largest V3 margin`,
      dek: `${blowout.away?.abbr || "AWY"} ${blowout.awayScore}, ${blowout.home?.abbr || "HME"} ${blowout.homeScore} — a ${blowout.margin}-run margin on ${blowout.date || "the recorded date"}.`,
      teams: [blowout.away?.abbr, blowout.home?.abbr].filter(Boolean)
    });
    if (high && high.id !== blowout?.id) stories.push({
      id: "v3-record-highest-total", category: "V3 Record Alert", tone: "record", dateLabel: "Game record",
      headline: `${high.totalRuns} combined runs sets the V3 scoring mark`,
      dek: `${high.away?.abbr || "AWY"} ${high.awayScore}, ${high.home?.abbr || "HME"} ${high.homeScore}.`,
      teams: [high.away?.abbr, high.home?.abbr].filter(Boolean)
    });
    if (long && long.innings > 9) stories.push({
      id: "v3-record-longest-game", category: "V3 Record Alert", tone: "record", dateLabel: "Game record",
      headline: `${long.innings}-inning marathon stands as the longest V3 game`,
      dek: `${long.away?.abbr || "AWY"} ${long.awayScore}, ${long.home?.abbr || "HME"} ${long.homeScore}.`,
      teams: [long.away?.abbr, long.home?.abbr].filter(Boolean)
    });
  }


  // --- Living league / facts desk stories ---
  const playedTeams = activeTeams.filter((team) => Number(team.wins || 0) + Number(team.losses || 0) > 0);
  const currentGamesPlayed = playedTeams.length
    ? Math.max(...playedTeams.map((team) => Number(team.wins || 0) + Number(team.losses || 0)))
    : 0;

  if (playedTeams.length) {
    const hottest = [...playedTeams].sort((a, b) => {
      const aStreak = String(a.streak || "");
      const bStreak = String(b.streak || "");
      const aWin = aStreak.startsWith("W") ? Number(aStreak.slice(1) || 0) : 0;
      const bWin = bStreak.startsWith("W") ? Number(bStreak.slice(1) || 0) : 0;
      return bWin - aWin || gamePct(b) - gamePct(a);
    })[0];
    const coldest = [...playedTeams].sort((a, b) => {
      const aStreak = String(a.streak || "");
      const bStreak = String(b.streak || "");
      const aLoss = aStreak.startsWith("L") ? Number(aStreak.slice(1) || 0) : 0;
      const bLoss = bStreak.startsWith("L") ? Number(bStreak.slice(1) || 0) : 0;
      return bLoss - aLoss || gamePct(a) - gamePct(b);
    })[0];

    if (String(hottest?.streak || "").startsWith("W") && Number(String(hottest.streak).slice(1) || 0) >= 2) {
      stories.push({
        id: "hot-team-watch", category: "Hot & Cold", tone: "current", dateLabel: "Current streak", kind: "fact",
        factValue: hottest.streak, factLabel: "Hottest team",
        headline: `${hottest.abbr} is the league's hottest club`,
        dek: `${teamName(hottest)} has won ${String(hottest.streak).slice(1)} straight and sits at ${hottest.wins}-${hottest.losses}.`,
        teams: [hottest.abbr],
      });
    }

    if (String(coldest?.streak || "").startsWith("L") && Number(String(coldest.streak).slice(1) || 0) >= 2) {
      stories.push({
        id: "cold-team-watch", category: "Hot & Cold", tone: "archive", dateLabel: "Current streak", kind: "fact",
        factValue: coldest.streak, factLabel: "Cold spell",
        headline: `${coldest.abbr} is looking to stop the slide`,
        dek: `${teamName(coldest)} has dropped ${String(coldest.streak).slice(1)} straight.`,
        teams: [coldest.abbr],
      });
    }

    const offenseLeader = [...playedTeams].filter((t) => Number(t.runsScored || 0) > 0).sort((a,b) => Number(b.runsScored||0)-Number(a.runsScored||0))[0];
    const preventionLeader = [...playedTeams].filter((t) => Number(t.runsAllowed || 0) > 0).sort((a,b) => Number(a.runsAllowed||0)-Number(b.runsAllowed||0))[0];
    if (offenseLeader) stories.push({
      id: "by-numbers-runs", category: "By the Numbers", tone: "current", dateLabel: "Current season", kind: "fact",
      factValue: String(offenseLeader.runsScored || 0), factLabel: "Runs scored",
      headline: `${offenseLeader.abbr} has produced the most offense`,
      dek: `${teamName(offenseLeader)} leads the league with ${offenseLeader.runsScored || 0} runs scored.`, teams:[offenseLeader.abbr]
    });
    if (preventionLeader) stories.push({
      id: "by-numbers-prevention", category: "By the Numbers", tone: "current", dateLabel: "Current season", kind: "fact",
      factValue: String(preventionLeader.runsAllowed || 0), factLabel: "Runs allowed",
      headline: `${preventionLeader.abbr} has allowed the fewest runs`,
      dek: `${teamName(preventionLeader)} has surrendered only ${preventionLeader.runsAllowed || 0} runs so far.`, teams:[preventionLeader.abbr]
    });

    const milestoneTargets = [10, 20, 30, 40];
    const milestoneCandidates = playedTeams.flatMap((team) => milestoneTargets
      .filter((target) => Number(team.wins || 0) < target && target - Number(team.wins || 0) <= 2)
      .map((target) => ({ team, target, away: target - Number(team.wins || 0) })));
    milestoneCandidates.slice(0, 3).forEach(({team,target,away}) => stories.push({
      id:`milestone-${team.id}-${target}`, category:'Milestone Watch', tone:'current', dateLabel:'Approaching milestone', kind:'fact',
      factValue:`${away} away`, factLabel:`from ${target} wins`,
      headline:`${team.abbr} closing in on win No. ${target}`,
      dek:`${teamName(team)} needs ${away} more win${away===1?'':'s'} to reach ${target} this season.`, teams:[team.abbr]
    }));

    const bestNow = [...playedTeams].sort((a,b)=>gamePct(b)-gamePct(a) || Number(b.wins||0)-Number(a.wins||0))[0];
    if (bestNow && Number(bestNow.wins||0)+Number(bestNow.losses||0) >= 5) {
      const pace = Math.round(gamePct(bestNow) * 40);
      stories.push({
        id:'pace-watch', category:'Race to October', tone:'current', dateLabel:'40-game pace', kind:'fact',
        factValue:`${pace}-win`, factLabel:'Current pace',
        headline:`${bestNow.abbr} is playing at a ${pace}-win pace`,
        dek:`At ${bestNow.wins}-${bestNow.losses}, ${teamName(bestNow)} projects to roughly ${pace} wins over a 40-game season if the current pace holds.`, teams:[bestNow.abbr]
      });
    }
  }

  if (seasonHistory.length) {
    const historyRecords = buildLeagueRecords(seasonHistory, activeTeams);
    const uniqueChamps = new Set(seasonHistory.map((season) => season.championTeamId || makeSafePlayoffBracket(season.playoffBracket).finals?.winnerTeamId).filter(Boolean));
    stories.push({
      id:'fact-unique-champions', category:'Did You Know?', tone:'archive', dateLabel:'League history', kind:'fact',
      factValue:String(uniqueChamps.size), factLabel:'Different champions',
      headline:`${uniqueChamps.size} different team${uniqueChamps.size===1?' has':'s have'} lifted the trophy`,
      dek:`Across ${seasonHistory.length} archived season${seasonHistory.length===1?'':'s'}, the league has crowned ${uniqueChamps.size} unique World Series champion${uniqueChamps.size===1?'':'s'}.`, teams:[]
    });

    const noPlayoffs = historyRecords.lists.noPlayoffs || [];
    if (noPlayoffs.length) stories.push({
      id:'fact-never-playoffs', category:'Did You Know?', tone:'archive', dateLabel:'League history', kind:'fact',
      factValue:String(noPlayoffs.length), factLabel:'Still seeking October',
      headline:`${noPlayoffs.length} franchise${noPlayoffs.length===1?' has':'s have'} never reached the playoffs`,
      dek:`${noPlayoffs.slice(0,8).map((row)=>row.abbr).join(', ')}${noPlayoffs.length>8?' and more':''} are still waiting for a first postseason appearance.`, teams:noPlayoffs.slice(0,5).map((row)=>row.abbr)
    });

    const drought = historyRecords.lists.activeTitleDroughts?.[0];
    if (drought) stories.push({
      id:'history-title-drought', category:'History Lesson', tone:'record', dateLabel:'All-time', kind:'fact',
      factValue:`${drought.activeTitleDrought}`, factLabel:'Season title drought',
      headline:`${drought.abbr} carries the league's longest active title drought`,
      dek:`${drought.abbr} has gone ${drought.activeTitleDrought} archived season${drought.activeTitleDrought===1?'':'s'} without a championship.`, teams:[drought.abbr]
    });

    const allTimeWins = historyRecords.rankings.allTimeWins?.[0];
    if (allTimeWins) stories.push({
      id:'history-alltime-wins', category:'Franchise Spotlight', tone:'record', dateLabel:'All-time', kind:'fact',
      factValue:String(allTimeWins.wins || 0), factLabel:'Archived wins',
      headline:`${allTimeWins.abbr} sits atop the all-time regular-season wins list`,
      dek:`${allTimeWins.abbr} has banked ${allTimeWins.wins || 0} wins across archived seasons.`, teams:[allTimeWins.abbr]
    });

    const bestSeason = historyRecords.singleSeason?.bestSeason;
    if (bestSeason) stories.push({
      id:'history-best-season', category:'History Lesson', tone:'record', dateLabel:bestSeason.seasonName || 'Archived season', kind:'fact',
      factValue:`${bestSeason.wins}-${bestSeason.losses}`, factLabel:'Best season record',
      headline:`${bestSeason.abbr} still owns the best single-season mark`,
      dek:`${bestSeason.abbr} went ${bestSeason.wins}-${bestSeason.losses} in ${bestSeason.seasonName || 'an archived season'}.`, teams:[bestSeason.abbr]
    });
  }

  if (currentGamesPlayed > 0) {
    stories.push({
      id:'league-progress-fact', category:'By the Numbers', tone:'current', dateLabel:'Season progress', kind:'fact',
      factValue:`${Math.min(100, Math.round((currentGamesPlayed / 40) * 100))}%`, factLabel:'Season pace',
      headline:`The league has reached roughly ${Math.min(100, Math.round((currentGamesPlayed / 40) * 100))}% of a 40-game schedule`,
      dek:`The most active clubs have played ${currentGamesPlayed} of 40 games.`, teams:[]
    });
  }


  // --- 24/7 News Network deep-cut story pool ---
  if (playedTeams.length) {
    const sortedByPct = [...playedTeams].sort((a,b)=>gamePct(b)-gamePct(a) || Number(b.wins||0)-Number(a.wins||0) || Number(b.runDiff||0)-Number(a.runDiff||0));
    const best = sortedByPct[0];
    const worst = sortedByPct[sortedByPct.length-1];
    const positiveRD = playedTeams.filter((t)=>Number(t.runDiff||0)>0);
    const negativeRD = playedTeams.filter((t)=>Number(t.runDiff||0)<0);
    const above500 = playedTeams.filter((t)=>gamePct(t)>.5);
    const even500 = playedTeams.filter((t)=>gamePct(t)===.5);
    const totalTeamGames = playedTeams.reduce((n,t)=>n+Number(t.wins||0)+Number(t.losses||0),0);
    const totalRuns = playedTeams.reduce((n,t)=>n+Number(t.runsScored||0),0);
    const avgRuns = totalTeamGames ? totalRuns/totalTeamGames : 0;

    if (best && worst && best.id !== worst.id) stories.push({
      id:'network-parity-spread', category:'By the Numbers', tone:'current', dateLabel:'League snapshot', kind:'fact',
      factValue:`${Math.round((gamePct(best)-gamePct(worst))*100)} pts`, factLabel:'Win-rate spread',
      headline:`${best.abbr} and ${worst.abbr} define the current league spread`,
      dek:`The gap from the best to worst current winning percentage is ${Math.round((gamePct(best)-gamePct(worst))*100)} percentage points.`, teams:[best.abbr,worst.abbr]
    });

    stories.push({
      id:'network-above-500', category:'By the Numbers', tone:'current', dateLabel:'League snapshot', kind:'fact',
      factValue:String(above500.length), factLabel:'Teams above .500',
      headline:`${above500.length} club${above500.length===1?' is':'s are'} currently above .500`,
      dek:`${even500.length ? `${even500.length} more ${even500.length===1?'team is':'teams are'} sitting exactly at .500.` : 'Nobody is sitting exactly at .500 right now.'}`, teams:above500.slice(0,5).map(t=>t.abbr)
    });

    if (avgRuns>0) stories.push({
      id:'network-run-environment', category:'By the Numbers', tone:'current', dateLabel:'Scoring environment', kind:'fact',
      factValue:avgRuns.toFixed(1), factLabel:'Runs per team-game',
      headline:`The current scoring environment is ${avgRuns.toFixed(1)} runs per team-game`,
      dek:`Across all recorded team results so far, clubs are averaging ${avgRuns.toFixed(1)} runs each time they take the field.`, teams:[]
    });

    const lucky = playedTeams.filter((t)=>gamePct(t)>.5 && Number(t.runDiff||0)<0).sort((a,b)=>gamePct(b)-gamePct(a))[0];
    if (lucky) stories.push({
      id:'network-winning-negative-rd', category:'Did You Know?', tone:'current', dateLabel:'Stat oddity', kind:'fact',
      factValue:`${lucky.runDiff}`, factLabel:'Run differential',
      headline:`${lucky.abbr} is winning despite a negative run differential`,
      dek:`${teamName(lucky)} is ${lucky.wins}-${lucky.losses} even though opponents have outscored them overall.`, teams:[lucky.abbr]
    });

    const unlucky = playedTeams.filter((t)=>gamePct(t)<.5 && Number(t.runDiff||0)>0).sort((a,b)=>Number(b.runDiff||0)-Number(a.runDiff||0))[0];
    if (unlucky) stories.push({
      id:'network-losing-positive-rd', category:'Did You Know?', tone:'current', dateLabel:'Stat oddity', kind:'fact',
      factValue:`+${unlucky.runDiff}`, factLabel:'Run differential',
      headline:`${unlucky.abbr} has a positive run differential but a losing record`,
      dek:`${teamName(unlucky)} has outscored opponents overall but is still below .500.`, teams:[unlucky.abbr]
    });

    ['AL','NL'].forEach((league)=>{
      const leagueTeams=[...playedTeams].filter((t)=>t.league===league).sort((a,b)=>gamePct(b)-gamePct(a) || Number(b.wins||0)-Number(a.wins||0) || Number(b.runDiff||0)-Number(a.runDiff||0));
      if (leagueTeams.length>=9) {
        const inTeam=leagueTeams[7], outTeam=leagueTeams[8];
        const gap=((Number(inTeam.wins||0)-Number(outTeam.wins||0))+(Number(outTeam.losses||0)-Number(inTeam.losses||0)))/2;
        stories.push({
          id:`network-${league}-bubble`, category:'Race to October', tone:'current', dateLabel:'Playoff bubble', kind:'fact',
          factValue:Number.isInteger(gap)?`${gap} GB`:`${gap.toFixed(1)} GB`, factLabel:`${league} 8th vs 9th`,
          headline:`${inTeam.abbr} currently holds the last ${league} playoff spot over ${outTeam.abbr}`,
          dek:`The current gap around the ${league} cut line is ${Number.isInteger(gap)?gap:gap.toFixed(1)} game${gap===1?'':'s'}.`, teams:[inTeam.abbr,outTeam.abbr]
        });
      }
      if (leagueTeams.length) {
        const leader=leagueTeams[0];
        stories.push({
          id:`network-${league}-leader`, category:'League Watch', tone:'current', dateLabel:`${league} snapshot`, kind:'fact',
          factValue:`${leader.wins}-${leader.losses}`, factLabel:`Best ${league} record`,
          headline:`${leader.abbr} currently sets the pace in the ${league}`,
          dek:`${teamName(leader)} owns the best current ${league} mark at ${leader.wins}-${leader.losses}.`, teams:[leader.abbr]
        });
      }
    });

    const rdLeader=[...playedTeams].sort((a,b)=>Number(b.runDiff||0)-Number(a.runDiff||0))[0];
    const rdTrailer=[...playedTeams].sort((a,b)=>Number(a.runDiff||0)-Number(b.runDiff||0))[0];
    if (rdLeader && rdTrailer && rdLeader.id!==rdTrailer.id) stories.push({
      id:'network-rd-gap', category:'By the Numbers', tone:'current', dateLabel:'Run differential', kind:'fact',
      factValue:String(Number(rdLeader.runDiff||0)-Number(rdTrailer.runDiff||0)), factLabel:'RD gap',
      headline:`The run-differential gap from ${rdLeader.abbr} to ${rdTrailer.abbr} is ${Number(rdLeader.runDiff||0)-Number(rdTrailer.runDiff||0)} runs`,
      dek:`${rdLeader.abbr} sits at ${Number(rdLeader.runDiff||0)>=0?'+':''}${rdLeader.runDiff||0}; ${rdTrailer.abbr} is at ${Number(rdTrailer.runDiff||0)>=0?'+':''}${rdTrailer.runDiff||0}.`, teams:[rdLeader.abbr,rdTrailer.abbr]
    });
  }

  if (v3GameRecords.games.length) {
    const total=v3GameRecords.games.length;
    const walkoffs=v3GameRecords.walkoffs.length;
    const extras=v3GameRecords.extraInningGames.length;
    const oneRun=v3GameRecords.oneRunGames.length;
    const shutouts=v3GameRecords.shutouts.length;
    stories.push({
      id:'network-v3-game-volume', category:'By the Numbers', tone:'game', dateLabel:'V3 game archive', kind:'fact',
      factValue:String(total), factLabel:'Recorded V3 games',
      headline:`The V3 game archive has grown to ${total} final${total===1?'':'s'}`,
      dek:`Those games include ${oneRun} one-run finish${oneRun===1?'':'es'}, ${extras} extra-inning game${extras===1?'':'s'}, ${walkoffs} walk-off${walkoffs===1?'':'s'} and ${shutouts} shutout${shutouts===1?'':'s'}.`, teams:[]
    });
    if (oneRun) stories.push({
      id:'network-one-run-share', category:'Did You Know?', tone:'game', dateLabel:'V3 game archive', kind:'fact',
      factValue:`${Math.round(oneRun/total*100)}%`, factLabel:'One-run games',
      headline:`${Math.round(oneRun/total*100)}% of recorded V3 games have been decided by one run`,
      dek:`${oneRun} of ${total} permanent V3 finals finished with the teams separated by a single run.`, teams:[]
    });
    if (extras) stories.push({
      id:'network-extra-share', category:'Did You Know?', tone:'game', dateLabel:'V3 game archive', kind:'fact',
      factValue:String(extras), factLabel:'Extra-inning games',
      headline:`The V3 archive already contains ${extras} extra-inning game${extras===1?'':'s'}`,
      dek:`Late drama has pushed ${extras} recorded game${extras===1?'':'s'} beyond nine innings.`, teams:[]
    });
    if (walkoffs) stories.push({
      id:'network-walkoff-count', category:'Did You Know?', tone:'game', dateLabel:'V3 game archive', kind:'fact',
      factValue:String(walkoffs), factLabel:'Walk-off wins',
      headline:`Walk-off count: ${walkoffs}`,
      dek:`The permanent V3 archive has captured ${walkoffs} walk-off finish${walkoffs===1?'':'es'} so far.`, teams:[]
    });

    const rivalries=buildHeadToHead(data?.games||[], activeTeams, seasonHistory);
    const mostPlayed=rivalries[0];
    if (mostPlayed?.teamA && mostPlayed?.teamB) stories.push({
      id:'network-rivalry-volume', category:'Franchise Spotlight', tone:'game', dateLabel:'V3 head-to-head', kind:'fact',
      factValue:String(mostPlayed.games), factLabel:'Recorded meetings',
      headline:`${mostPlayed.teamA.abbr}-${mostPlayed.teamB.abbr} is the busiest V3 head-to-head matchup`,
      dek:`They have met ${mostPlayed.games} time${mostPlayed.games===1?'':'s'} in the permanent game archive, with ${mostPlayed.postseasonGames} postseason meeting${mostPlayed.postseasonGames===1?'':'s'}.`, teams:[mostPlayed.teamA.abbr,mostPlayed.teamB.abbr]
    });

    const historyLeaders=buildTeamHistoryLeaders(data?.games||[], activeTeams);
    const streakLeader=historyLeaders.winStreak?.[0];
    if (streakLeader?.team && Number(streakLeader.longestWinStreak||0)>1) stories.push({
      id:'network-v3-win-streak-record', category:'History Lesson', tone:'record', dateLabel:'V3 game archive', kind:'fact',
      factValue:`W${streakLeader.longestWinStreak}`, factLabel:'Longest recorded streak',
      headline:`${streakLeader.team.abbr} owns the longest winning streak in the V3 archive`,
      dek:`The longest fully recorded winning run currently stands at ${streakLeader.longestWinStreak} games.`, teams:[streakLeader.team.abbr]
    });
  }

  if (seasonHistory.length) {
    const historyRecords2=buildLeagueRecords(seasonHistory, activeTeams);
    const noTrophies=historyRecords2.lists.noChampionships || [];
    const noWS=historyRecords2.lists.noWorldSeries || [];
    const playoffDrought=historyRecords2.lists.activePlayoffDroughts?.[0];
    if (noTrophies.length) stories.push({
      id:'network-no-trophy-count', category:'Did You Know?', tone:'archive', dateLabel:'League history', kind:'fact',
      factValue:String(noTrophies.length), factLabel:'Teams without a trophy',
      headline:`${noTrophies.length} franchise${noTrophies.length===1?' is':'s are'} still chasing a first championship`,
      dek:`${noTrophies.slice(0,8).map(r=>r.abbr).join(', ')}${noTrophies.length>8?' and others':''} remain without a World Series title in the archive.`, teams:noTrophies.slice(0,5).map(r=>r.abbr)
    });
    if (noWS.length) stories.push({
      id:'network-never-ws-count', category:'History Lesson', tone:'archive', dateLabel:'League history', kind:'fact',
      factValue:String(noWS.length), factLabel:'Never reached WS',
      headline:`${noWS.length} franchise${noWS.length===1?' has':'s have'} never reached the World Series`,
      dek:`The road to the final round is still unfinished for ${noWS.slice(0,8).map(r=>r.abbr).join(', ')}${noWS.length>8?' and more':''}.`, teams:noWS.slice(0,5).map(r=>r.abbr)
    });
    if (playoffDrought) stories.push({
      id:'network-playoff-drought', category:'History Lesson', tone:'record', dateLabel:'All-time', kind:'fact',
      factValue:String(playoffDrought.activePlayoffDrought), factLabel:'Season playoff drought',
      headline:`${playoffDrought.abbr} owns the longest active playoff drought`,
      dek:`${playoffDrought.abbr} has gone ${playoffDrought.activePlayoffDrought} archived season${playoffDrought.activePlayoffDrought===1?'':'s'} without reaching October.`, teams:[playoffDrought.abbr]
    });

    const wsApps=historyRecords2.leaders.worldSeriesAppearances || [];
    if (wsApps.length && Number(wsApps[0].worldSeriesAppearances||0)>0) stories.push({
      id:'network-ws-appearance-leader', category:'History Lesson', tone:'record', dateLabel:'All-time', kind:'fact',
      factValue:String(wsApps[0].worldSeriesAppearances), factLabel:'World Series trips',
      headline:`${wsApps.map(r=>r.abbr).join(' / ')} ${wsApps.length>1?'share':'owns'} the World Series appearance lead`,
      dek:`The all-time high is ${wsApps[0].worldSeriesAppearances} trip${wsApps[0].worldSeriesAppearances===1?'':'s'} to the championship round.`, teams:wsApps.slice(0,5).map(r=>r.abbr)
    });

    const divisionTitles=historyRecords2.leaders.divisionTitles || [];
    if (divisionTitles.length && Number(divisionTitles[0].divisionTitles||0)>0) stories.push({
      id:'network-division-title-leader', category:'History Lesson', tone:'record', dateLabel:'All-time', kind:'fact',
      factValue:String(divisionTitles[0].divisionTitles), factLabel:'Division titles',
      headline:`${divisionTitles.map(r=>r.abbr).join(' / ')} ${divisionTitles.length>1?'share':'owns'} the division-title lead`,
      dek:`The franchise record sits at ${divisionTitles[0].divisionTitles} division crown${divisionTitles[0].divisionTitles===1?'':'s'}.`, teams:divisionTitles.slice(0,5).map(r=>r.abbr)
    });

    const oneSeeds=historyRecords2.leaders.topSeeds || historyRecords2.leaders.numberOneSeeds || [];
    if (oneSeeds.length) {
      const value=Number(oneSeeds[0].topSeeds ?? oneSeeds[0].numberOneSeeds ?? oneSeeds[0].oneSeeds ?? 0);
      if (value>0) stories.push({
        id:'network-one-seed-leader', category:'History Lesson', tone:'record', dateLabel:'All-time', kind:'fact',
        factValue:String(value), factLabel:'#1 seeds',
        headline:`${oneSeeds.map(r=>r.abbr).join(' / ')} ${oneSeeds.length>1?'share':'owns'} the #1-seed record`,
        dek:`The most top-seed finishes by one franchise is ${value}.`, teams:oneSeeds.slice(0,5).map(r=>r.abbr)
      });
    }

    const chronological=[...seasonHistory].sort((a,b)=>(Date.parse(a.archivedAt)||0)-(Date.parse(b.archivedAt)||0));
    let repeatCount=0;
    for (let i=1;i<chronological.length;i++) {
      const prev=chronological[i-1].championTeamId||makeSafePlayoffBracket(chronological[i-1].playoffBracket).finals?.winnerTeamId;
      const curr=chronological[i].championTeamId||makeSafePlayoffBracket(chronological[i].playoffBracket).finals?.winnerTeamId;
      if (prev && curr && prev===curr) repeatCount+=1;
    }
    stories.push({
      id:'network-repeat-champions', category:'Did You Know?', tone:'archive', dateLabel:'League history', kind:'fact',
      factValue:String(repeatCount), factLabel:'Back-to-back repeats',
      headline:repeatCount?`The league has seen ${repeatCount} back-to-back championship repeat${repeatCount===1?'':'s'}`:'No champion has repeated in consecutive archived seasons',
      dek:repeatCount?'Dynasty windows are already part of league history.':'Every archived season has ended with a different champion from the year before.', teams:[]
    });
  }

  return stories;
}
