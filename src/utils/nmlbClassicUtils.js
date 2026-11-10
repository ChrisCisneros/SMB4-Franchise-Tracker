import { getTeamColorsByAbbr } from '../config/teamColors';
import { calendarSummary } from './seasonCalendarUtils';

export function buildNMLBClassicPreflight(data = {}, teams = [], playoffPicture = []) {
  const colorsReady = teams.filter((team) => getTeamColorsByAbbr(team.abbr)?.main).length;
  const finals = (data.games || []).filter((game) => game?.status === 'Final' && (game.gameType || 'regular') !== 'playoff').length;
  const calendar = calendarSummary(data);
  const playoffTeams = (playoffPicture || []).flatMap((picture) => picture.leagueTeams || []).filter((team) => ['x', 'y', 'w', 'z'].includes(String(team.marker || '').toLowerCase())).length;
  const checks = [
    { id: 'colors', label: 'Playoff color palette', detail: `${colorsReady}/${teams.length} clubs have themed colors`, ready: teams.length > 0 && colorsReady === teams.length },
    { id: 'calendar', label: 'Season calendar', detail: `${calendar.scheduled}/40 game days scheduled`, ready: calendar.scheduled >= 40 },
    { id: 'finals', label: 'Regular-season finals', detail: `${finals} finalized regular-season games in the archive`, ready: finals >= 40 },
    { id: 'field', label: 'Postseason field', detail: playoffTeams ? `${playoffTeams} clubs currently marked for October` : 'Seeds still need to be locked', ready: playoffTeams > 0 },
    { id: 'brand', label: 'NMLB Classic broadcast', detail: 'NMLB Network identity is active', ready: (data.leagueExtras?.officialLeagueAbbr || 'NMLB') === 'NMLB' },
  ];
  return { checks, ready: checks.every((check) => check.ready), remaining: checks.filter((check) => !check.ready).length };
}
