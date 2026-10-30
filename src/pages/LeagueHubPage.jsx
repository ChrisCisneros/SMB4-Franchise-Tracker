import React, { useEffect, useMemo, useState } from 'react';
import { buildLeagueRecords, formatPct } from '../utils/recordsUtils';
import {
  buildDynasties, buildOnThisDay, buildPowerRankings, buildRivalries,
  buildSeasonPreview, buildTeamProfile, buildTimeline
} from '../utils/universeUtils';
import {
  buildGameRecords, buildHeadToHead, buildPlayerCareerBoard,
  buildSeasonComparisons, buildTeamGameProfile, buildTeamHistoryLeaders
} from '../utils/historyUtils';
import { buildAnalystRecords, buildCultureAwards, buildCultureDebates, buildCultureTrends, buildFanSurvey, buildGameThreadArchive, buildGiveawayMarket, buildLocalBusinesses, buildSocialGrowth, buildTeamCultureProfiles, buildTicketMarket } from '../utils/cultureUtils';
import { buildPlayerFanPages } from '../utils/livingWorldUtils';
import { buildRivalryTimeline,buildSeasonScrapbook,buildTeamVibes } from '../utils/mediaMemoryUtils';
import { buildDefiningMoments,buildFranchiseReputations,buildStadiumFolklore,buildTeamTraditionFiles } from '../utils/lifeSystemsUtils';
import { achievementsForTeam, awardsForTeam, SEASON_AWARD_TYPES } from '../utils/playerLegacyUtils';

const TABS = [
  ['profiles','Team Profiles'],['scrapbook','Season Scrapbook'],['living-lore','Living Lore'],['culture','Culture & Lore'],['power','Power Rankings'],['games','Game Archive'],['careers','Player Careers'],
  ['awards','Awards'],['timeline','Timeline'],['dynasty','Dynasties & Trophies'],['rivalries','Rivalries'],
  ['hall','Hall of Fame'],['operations','League Operations'],['compare','Season Compare'],
  ['season','Season Preview / Recap'],['today','On This Day']
 ];

const OPERATION_SECTIONS = [
  {key:'transactions',title:'Transactions',button:'Add Transaction',prompts:[['date','Date:'],['teamAbbr','Team abbreviation:'],['title','Move / transaction:'],['note','Details:']]},
  {key:'injuries',title:'Injury History',button:'Add Injury',prompts:[['date','Date:'],['teamAbbr','Team abbreviation:'],['name','Player:'],['note','Injury / status:']]},
  {key:'managers',title:'Manager History',button:'Add Manager',prompts:[['season','Season:'],['teamAbbr','Team abbreviation:'],['name','Manager name:'],['note','Note / result:']]},
  {key:'prospects',title:'Draft & Prospects',button:'Add Prospect',prompts:[['season','Season / draft year:'],['teamAbbr','Team abbreviation:'],['name','Prospect name:'],['note','Draft slot / scouting note:']]},
  {key:'rebrands',title:'Rebrands / Relocations',button:'Add Rebrand',prompts:[['date','Date / season:'],['teamAbbr','Current abbreviation:'],['title','Old → new identity:'],['note','Details:']]},
  {key:'retiredNumbers',title:'Retired Numbers',button:'Retire Number',prompts:[['date','Date / season:'],['teamAbbr','Team abbreviation:'],['name','Player / honoree:'],['title','Number:'],['note','Reason:']]},
];

function Pill({ children }) { return <span className="universe-pill">{children}</span>; }
function Empty({ children }) { return <div className="universe-empty">{children}</div>; }
function TeamScore({ game }) {
  return <strong>{game.away?.abbr || 'AWY'} {game.awayScore} – {game.home?.abbr || 'HME'} {game.homeScore}</strong>;
}
function avg(h,ab){ return Number(ab||0) ? (Number(h||0)/Number(ab||0)).toFixed(3).replace(/^0/,'') : '.000'; }

export default function LeagueHubPage({ ctx }) {
  const { teams, data, playoffPicture=[], controlsUnlocked, setData, syncLeagueExtrasToFirebase, syncActiveSeasonNameToFirebase, lastFinalGame } = ctx;
  const [tab,setTab] = useState('profiles');
  const [teamId,setTeamId] = useState(teams[0]?.id || '');
  const [compareIds,setCompareIds] = useState(['','']);
  const [playerId,setPlayerId] = useState('');
  useEffect(() => { if (!teamId && teams[0]?.id) setTeamId(teams[0].id); }, [teamId, teams]);

  const history = data.seasonHistory || [];
  const games = data.games || [];
  const extras = {
    awards:[], hallOfFame:[], transactions:[], injuries:[], managers:[], rebrands:[],
    retiredNumbers:[], prospects:[], milestones:[], openingDay:'', seasonTagline:'', powerRankSnapshots:[], ...(data.leagueExtras || {})
  };
  const records = useMemo(()=>buildLeagueRecords(history,teams),[history,teams]);
  const rankings = useMemo(()=>buildPowerRankings(teams),[teams]);
  const profile = useMemo(()=>buildTeamProfile(teamId,teams,history),[teamId,teams,history]);
  const teamGames = useMemo(()=>buildTeamGameProfile(teamId,games),[teamId,games]);
  const timeline = useMemo(()=>buildTimeline(history),[history]);
  const dynasties = useMemo(()=>buildDynasties(history,teams),[history,teams]);
  const archivedRivalries = useMemo(()=>buildRivalries(history,teams),[history,teams]);
  const liveRivalries = useMemo(()=>buildHeadToHead(games,teams,history),[games,teams,history]);
  const rivalries = liveRivalries.length ? liveRivalries : archivedRivalries;
  const franchiseReputations = useMemo(()=>buildFranchiseReputations(data,teams),[data,teams]);
  const stadiumFolklore = useMemo(()=>buildStadiumFolklore(data,teams),[data,teams]);
  const traditionFiles = useMemo(()=>buildTeamTraditionFiles(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const definingMoments = useMemo(()=>buildDefiningMoments(data,teams),[data,teams]);
  const preview = useMemo(()=>buildSeasonPreview(history,teams),[history,teams]);
  const archiveToday = useMemo(()=>buildOnThisDay(history,lastFinalGame,teams),[history,lastFinalGame,teams]);
  const gameRecords = useMemo(()=>buildGameRecords(games,teams,history),[games,teams,history]);
  const careerBoard = useMemo(()=>buildPlayerCareerBoard(data.players || [],history),[data.players,history]);
  const teamHistoryLeaders = useMemo(()=>buildTeamHistoryLeaders(games,teams),[games,teams]);
  const seasons = useMemo(()=>buildSeasonComparisons(history),[history]);
  const cultureProfiles = useMemo(()=>buildTeamCultureProfiles(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const socialGrowth = useMemo(()=>buildSocialGrowth(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const ticketMarket = useMemo(()=>buildTicketMarket(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const playerFanPages = useMemo(()=>buildPlayerFanPages(data,teams),[data,teams]);
  const cultureAwards = useMemo(()=>buildCultureAwards(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const cultureTrends = useMemo(()=>buildCultureTrends(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const fanSurvey = useMemo(()=>buildFanSurvey(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const cultureThreads = useMemo(()=>buildGameThreadArchive(data,teams),[data,teams]);
  const collectorVault = useMemo(()=>buildGiveawayMarket(data,teams,{mode:'vault'}),[data,teams]);
  const localBusinesses = useMemo(()=>buildLocalBusinesses(teams),[teams]);
  const analystRecords = useMemo(()=>buildAnalystRecords(data,teams),[data,teams]);
  const cultureDebates = useMemo(()=>buildCultureDebates(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const teamCulture = cultureProfiles.find(x=>x.team.id===teamId)||null;
  const teamSocial = socialGrowth.find(x=>x.team.id===teamId)||null;
  const teamTickets = ticketMarket.find(x=>x.team.id===teamId)||null;
  const scrapbook=useMemo(()=>buildSeasonScrapbook(data,teams),[data,teams]);
  const rivalryTimelines=useMemo(()=>buildRivalryTimeline(data,teams),[data,teams]);
  const teamVibes=useMemo(()=>buildTeamVibes(data,teams,playoffPicture),[data,teams,playoffPicture]);
  const teamVibe=teamVibes.find(x=>x.team.id===teamId)||null;
  const selectedTeam=teams.find(t=>t.id===teamId)||null;
  const teamAchievements=useMemo(()=>achievementsForTeam(data,teams,teamId),[data,teams,teamId]);
  const teamAwards=useMemo(()=>awardsForTeam(data,selectedTeam?.abbr||''),[data,selectedTeam?.abbr]);
  useEffect(()=>{ if (!playerId && careerBoard[0]?.id) setPlayerId(careerBoard[0].id); },[playerId,careerBoard]);
  const selectedCareer = careerBoard.find(p=>p.id===playerId) || null;
  const selectedPlayerSeasons = history.flatMap(season => (season.players || []).filter(p=>p.id===playerId).map(p=>({...p,seasonName:season.name,seasonId:season.id})));
  const selectedPlayerFanPage = playerFanPages.find(x=>x.player?.id===playerId)||null;

  const teamMap = useMemo(()=>new Map(teams.map(t=>[t.id,t])),[teams]);
  const thisDayGames = useMemo(() => {
    const now = new Date();
    const mmdd = `${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    return gameRecords.games.filter(g => String(g.date||'').slice(5) === mmdd);
  },[gameRecords]);

  const saveExtras = (next) => { setData((p)=>({...p,leagueExtras:next})); syncLeagueExtrasToFirebase?.(next); };
  const addSimple = (key, prompts) => {
    const row = { id:crypto.randomUUID(), createdAt:new Date().toISOString() };
    for (const [field,label,initial=''] of prompts) {
      const value = window.prompt(label,initial);
      if (value === null) return;
      row[field] = value.trim();
    }
    saveExtras({...extras,[key]:[row,...(extras[key]||[])]});
  };
  const removeExtra = (key,id) => {
    if (!window.confirm('Remove this league-history entry?')) return;
    saveExtras({...extras,[key]:(extras[key]||[]).filter(x=>x.id!==id)});
  };

  const addAward = () => { const menu=SEASON_AWARD_TYPES.map((a,i)=>`${i+1}. ${a.name} — ${a.category}`).join('\n'); const raw=window.prompt(`Choose award number:\n${menu}`,'1'); if(raw===null)return; const def=SEASON_AWARD_TYPES[Math.max(0,Math.min(SEASON_AWARD_TYPES.length-1,Number(raw||1)-1))]; const winner=window.prompt(`${def.name} winner:`,''); if(!winner)return; const teamAbbr=String(window.prompt('Team abbreviation:','')||'').toUpperCase(); const note=window.prompt('Optional stat / note:','')||''; const row={id:crypto.randomUUID(),createdAt:new Date().toISOString(),season:data.activeSeasonName||'Season 4',awardId:def.id,award:def.name,category:def.category,icon:def.icon,winner,teamAbbr,note}; saveExtras({...extras,awards:[row,...(extras.awards||[])]}); }; 
  const addHall = () => addSimple('hallOfFame', [['name','Hall of Fame / Legends name:'],['teamAbbr','Primary team abbreviation (optional):'],['note','Why are they a legend?']]);
  const savePowerSnapshot = () => {
    const snapshot = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      season: data.activeSeasonName || 'Season 4',
      rankings: rankings.map((team,index)=>({teamId:team.id,rank:index+1,score:team.powerScore}))
    };
    saveExtras({...extras,powerRankSnapshots:[snapshot,...(extras.powerRankSnapshots||[])].slice(0,50)});
  };
  const previousPowerSnapshot = extras.powerRankSnapshots?.[0] || null;
  const movementFor = (teamId,currentRank) => {
    const old = previousPowerSnapshot?.rankings?.find(r=>r.teamId===teamId)?.rank;
    if (!old) return {text:'NEW',className:'new'};
    const delta = old-currentRank;
    if (delta>0) return {text:`▲ ${delta}`,className:'up'};
    if (delta<0) return {text:`▼ ${Math.abs(delta)}`,className:'down'};
    return {text:'—',className:'same'};
  };
  const renameSeason = () => {
    const next = window.prompt('Active season name:', data.activeSeasonName || 'Season 4');
    if (!next || !next.trim()) return;
    const clean = next.trim();
    setData((prev)=>({...prev,activeSeasonName:clean}));
    syncActiveSeasonNameToFirebase?.(clean);
  };
  const setSeasonPresentation = () => {
    const openingDay = window.prompt('Opening Day date (YYYY-MM-DD, blank to clear):', extras.openingDay || '') ?? extras.openingDay;
    const seasonTagline = window.prompt('Season tagline / branding line:', extras.seasonTagline || '') ?? extras.seasonTagline;
    saveExtras({...extras,openingDay:openingDay.trim(),seasonTagline:seasonTagline.trim()});
  };

  const comparison = compareIds.map(id=>seasons.find(s=>s.id===id));

  return <div className="universe-page v3-universe">
    <div className="card universe-hero v3-universe-hero">
      <div><div className="universe-kicker">SMB4 FRANCHISE CENTRAL · VERSION 5</div><h2>League Universe</h2><p>The permanent baseball database: games, careers, franchises, trophies, records, people and league history.</p></div>
      <div className="universe-hero-stats"><Pill>{records.summary.seasonsArchived} archived seasons</Pill><Pill>{gameRecords.games.length} permanent games</Pill><Pill>{records.summary.teamsTracked} franchises</Pill><Pill>{careerBoard.length} tracked players</Pill></div>
    </div>
    <div className="universe-tabs v3-tab-rail">{TABS.map(([id,label])=><button key={id} className={tab===id?'active-tab':''} onClick={()=>setTab(id)}>{label}</button>)}</div>

    {tab==='profiles' && <div className="universe-section">
      <div className="card profile-selector"><div><h3>Franchise Profile</h3><p className="muted">Permanent franchise history plus V4 living-league data.</p></div><select value={teamId} onChange={(e)=>setTeamId(e.target.value)}>{[...teams].sort((a,b)=>a.abbr.localeCompare(b.abbr)).map(t=><option key={t.id} value={t.id}>{t.abbr} — {t.city} {t.name}</option>)}</select><div className="profile-team-picker">{[...teams].sort((a,b)=>a.abbr.localeCompare(b.abbr)).map(t=><button key={t.id} className={teamId===t.id?'active-tab':''} onClick={()=>setTeamId(t.id)}>{t.abbr}</button>)}</div></div>
      {profile?.teamId ? <>
        <div className="card franchise-profile-hero v3-profile-hero"><div className="profile-abbr">{profile.abbr}</div><div><div className="universe-kicker">FRANCHISE DATABASE</div><h2>{profile.city} {profile.name}</h2><p>{profile.league} {profile.division}</p></div><div className="profile-trophy-count">🏆 {profile.championships || 0}</div></div>
        {(profile.championships||profile.leagueChampionships||teamAchievements.length||teamAwards.length||(extras.retiredNumbers||[]).some(x=>String(x.teamAbbr||'').toUpperCase()===String(profile.abbr||'').toUpperCase())||teamGames.biggestWin)&&<div className="card leaguehub-team-legacy"><div className="universe-section-title"><div><div className="universe-kicker">TEAM LEGACY</div><h3>What This Franchise Leaves Behind</h3></div></div><div className="leaguehub-team-legacy-grid">{profile.championships>0&&<div><span>World Titles</span><strong>{profile.championships}</strong></div>}{profile.leagueChampionships>0&&<div><span>League Pennants</span><strong>{profile.leagueChampionships}</strong></div>}{teamAchievements.length>0&&<div><span>Player Milestones</span><strong>{teamAchievements.length}</strong><small>{teamAchievements[0]?.playerName} · {teamAchievements[0]?.title}</small></div>}{teamAwards.length>0&&<div><span>Player Awards</span><strong>{teamAwards.length}</strong><small>{teamAwards[0]?.winner} · {teamAwards[0]?.award}</small></div>}{(extras.retiredNumbers||[]).filter(x=>String(x.teamAbbr||'').toUpperCase()===String(profile.abbr||'').toUpperCase()).length>0&&<div><span>Retired Numbers</span><strong>{(extras.retiredNumbers||[]).filter(x=>String(x.teamAbbr||'').toUpperCase()===String(profile.abbr||'').toUpperCase()).length}</strong></div>}{teamGames.biggestWin&&<div><span>Signature Win</span><strong>{teamGames.biggestWin.teamScore}-{teamGames.biggestWin.opponentScore}</strong><small>largest recorded V3/V4 win</small></div>}</div></div>}
        {teamCulture&&<div className="card leaguehub-culture-strip"><div><small>FAN CULTURE</small><strong>{teamVibe?.vibe||teamCulture.identity}</strong><span>{teamCulture.mood} · Hype {Math.round(teamCulture.hype||0)} · {teamVibe?.nickname||teamCulture.identity}</span></div><div><small>CULT HERO</small><strong>{teamCulture.hero?.name||'Still emerging'}</strong><span>{teamCulture.hero?`${teamCulture.hero.seasonHR||0} HR · ${teamCulture.hero.seasonHits||0} H`:'The fanbase is waiting for one.'}</span></div><div><small>PUBLIC ENEMY</small><strong>{teamCulture.villain?.name||teamCulture.hatedOpponent?.abbr||'Nobody yet'}</strong><span>{teamCulture.hatedOpponent?`${teamCulture.hatedOpponent.abbr} rivalry heat`:'No grudge has taken hold.'}</span></div><div><small>SOCIAL + TICKETS</small><strong>{teamSocial?teamSocial.followers.toLocaleString():'—'} followers</strong><span>{teamTickets?`${teamTickets.label} demand · ${teamTickets.roadInvasion}% road presence`:'Market still forming'}</span></div></div>}
        {(teamAchievements.length>0||teamAwards.length>0)&&<div className="card leaguehub-player-legacy"><div className="universe-section-title"><div><h3>Player Honors & Milestones</h3><p className="muted">Only preserved milestones and actually-awarded honors appear here.</p></div></div><div className="leaguehub-legacy-grid">{teamAchievements.map(a=><article key={a.id}><span>{a.icon||'🏅'}</span><small>{a.season}</small><strong>{a.playerName||'Player Milestone'}</strong><b>{a.title}</b><p>{a.note}</p></article>)}{teamAwards.map(a=><article key={a.id}><span>{a.icon||'🏆'}</span><small>{a.season}</small><strong>{a.winner}</strong><b>{a.award}</b><p>{a.note||a.category||''}</p></article>)}</div></div>}
        <div className="universe-stat-grid">
          {[['All-Time Record',`${profile.wins||0}-${profile.losses||0}`],['V3 Games',teamGames.games.length],['Playoff Apps',profile.playoffAppearances||0],['World Series',profile.wsAppearances||0],['Titles',profile.championships||0],['League Pennants',profile.leagueChampionships||0],['Playoff Wins',profile.playoffGameWins||0],['V3 Home',`${teamGames.homeWins}-${teamGames.homeLosses}`],['V3 Away',`${teamGames.awayWins}-${teamGames.awayLosses}`],['Best W Streak',teamGames.longestWinStreak||0],['Division Titles',profile.divisionTitles||0],['#1 Seeds',profile.topSeeds||0],['V3 Run Diff',`${teamGames.runsFor-teamGames.runsAgainst>=0?'+':''}${teamGames.runsFor-teamGames.runsAgainst}`]].map(([k,v])=><div className="card universe-stat" key={k}><span>{k}</span><strong>{v}</strong></div>)}
        </div>
        {profile.seasons.some(s=>s.champion || s.leagueChampion) && <div className="card franchise-banner-wall">
          <div className="universe-section-title"><div><div className="universe-kicker">FRANCHISE BANNER WALL</div><h3>Championship Hardware</h3></div><div className="banner-count-pills"><span>🏆 {profile.championships||0} World</span><span>⚾ {profile.leagueChampionships||0} League</span></div></div>
          <div className="banner-strip">
            {profile.seasons.filter(s=>s.champion).map(s=><div className="championship-banner world-banner" key={`world-${s.seasonId}`}><span>WORLD CHAMPIONS</span><strong>{profile.abbr}</strong><small>{s.seasonName}</small></div>)}
            {profile.seasons.filter(s=>s.leagueChampion).map(s=><div className={`championship-banner league-banner league-${String(s.leagueChampionLeague||'').toLowerCase()}`} key={`league-${s.seasonId}`}><span>{s.leagueChampionLeague} CHAMPIONS</span><strong>{profile.abbr}</strong><small>{s.seasonName}</small></div>)}
          </div>
        </div>}
        {profile.seasons.length > 0 && <div className="card franchise-trend-card"><div className="universe-section-title"><div><h3>Franchise Trend</h3><p className="muted">Regular-season wins by archived season. Hover a bar for the exact record.</p></div></div><div className="franchise-trend-chart">{[...profile.seasons].reverse().map(s=><div className="trend-column" key={s.seasonId} title={`${s.seasonName}: ${s.wins}-${s.losses}, RD ${s.runDiff>=0?'+':''}${s.runDiff}`}><div className={`trend-bar ${s.champion?'champion':''}`} style={{height:`${Math.max(8,Math.min(100,(s.wins/40)*100))}%`}}><span>{s.wins}</span></div><small>{String(s.seasonName||'').replace('Season ','S')}</small></div>)}</div></div>}
        <div className="universe-two-col"><div className="card"><h3>Season by Season</h3><div className="universe-scroll-list">{profile.seasons.length ? profile.seasons.map(s=><div className="universe-list-row" key={s.seasonId}><strong>{s.champion?'🏆 ':''}{s.seasonName}</strong><span>{s.wins}-{s.losses} · {formatPct(s.pct)} · RD {s.runDiff>=0?'+':''}{s.runDiff}</span></div>) : <Empty>No archived seasons for this franchise yet.</Empty>}</div></div><div className="card"><h3>Recent V3 Games</h3><div className="universe-scroll-list">{teamGames.games.length ? teamGames.games.slice(0,12).map(g=><div className="universe-list-row" key={g.id}><span>{g.date} · {g.gameType==='playoff'?'POST':'REG'}</span><strong>{g.awayTeamId===teamId?`${g.awayScore}-${g.homeScore}`:`${g.homeScore}-${g.awayScore}`}</strong></div>) : <Empty>Season 4 games will begin filling this history automatically.</Empty>}</div></div></div>
        <div className="universe-two-col"><div className="card"><h3>V3 Franchise Game Records</h3><div className="profile-record-grid"><div><span>Home</span><strong>{teamGames.homeWins}-{teamGames.homeLosses}</strong></div><div><span>Away</span><strong>{teamGames.awayWins}-{teamGames.awayLosses}</strong></div><div><span>Longest W Streak</span><strong>{teamGames.longestWinStreak}</strong></div><div><span>Longest L Streak</span><strong>{teamGames.longestLossStreak}</strong></div><div><span>Biggest Win</span><strong>{teamGames.biggestWin?`${teamGames.biggestWin.teamScore}-${teamGames.biggestWin.opponentScore}`:'—'}</strong></div><div><span>Biggest Loss</span><strong>{teamGames.biggestLoss?`${teamGames.biggestLoss.teamScore}-${teamGames.biggestLoss.opponentScore}`:'—'}</strong></div></div></div><div className="card"><h3>Retired Numbers</h3><div className="retired-number-wall">{(extras.retiredNumbers||[]).filter(x=>String(x.teamAbbr||'').toUpperCase()===String(profile.abbr||'').toUpperCase()).length ? (extras.retiredNumbers||[]).filter(x=>String(x.teamAbbr||'').toUpperCase()===String(profile.abbr||'').toUpperCase()).map(x=><div className="retired-number" key={x.id}><strong>#{x.title||'—'}</strong><span>{x.name}</span><small>{x.date}</small></div>) : <Empty>No retired numbers logged yet.</Empty>}</div></div></div>
      </> : <Empty>Select a franchise.</Empty>}
    </div>}

    {tab==='scrapbook' && <div className="universe-section season-scrapbook-page">
      <div className="card scrapbook-hero"><div><div className="universe-kicker">SEASON MEMORY BOOK</div><h2>{data.activeSeasonName||'Current Season'} Scrapbook</h2><p>Finals, ceremonies, world moments and manually saved memories collected into one browseable season diary.</p></div><b>{scrapbook.length} memories</b></div>
      <div className="scrapbook-grid">{scrapbook.length?scrapbook.map((x,i)=><article className={`card scrapbook-card kind-${x.kind.toLowerCase()}`} key={x.id}><span>{x.icon}</span><small>{x.kind} · MEMORY {String(i+1).padStart(2,'0')}</small><h3>{x.title}</h3><p>{x.detail}</p></article>):<Empty>Play/finalize games and schedule ceremonies to fill the scrapbook.</Empty>}</div>
    </div>}

    {tab==='culture' && <div className="universe-section league-culture-lore">
      <div className="card culture-lore-hero"><div><div className="universe-kicker">LIVING LEAGUE ARCHIVE</div><h2>Culture & Lore</h2><p>Not just what happened — what the league remembers, argues about, collects and turns into mythology.</p></div><div><b>{cultureTrends.length}</b><span>active trends</span></div></div>
      <div className="culture-lore-grid">
        <div className="card"><h3>Trending Around the League</h3>{cultureTrends.map(t=><div className="culture-lore-row" key={t.tag}><div><strong>{t.tag}</strong><small>{t.status}</small></div><p>{t.detail}</p></div>)}</div>
        <div className="card"><h3>Fan Culture Awards</h3>{cultureAwards.map(a=><div className="culture-lore-row" key={a.award}><div><strong>{a.award}</strong><small>{a.value}</small></div><p>{a.winner?.team?.abbr||a.winner?.abbr||'—'}</p></div>)}</div>
      </div>
      <div className="culture-lore-grid">
        <div className="card"><h3>Annual Fan Survey</h3>{fanSurvey.map(x=><div className="culture-survey-row" key={x.q}><span>{x.q}</span><strong>{x.winner}</strong><small>{x.detail}</small></div>)}</div>
        <div className="card"><h3>Collector Vault</h3>{collectorVault.length?collectorVault.slice(0,10).map(x=><div className="culture-collector-row" key={`${x.gameNumber}-${x.id||x.name}`}><span>{x.icon||'🎁'}</span><div><strong>Game {x.gameNumber} · {x.name}</strong><small>{x.scarcity} · {x.listings} simulated listings</small></div><b>{x.marketValue}</b></div>):<Empty>Schedule giveaway nights to start the collector market.</Empty>}</div>
      </div>
      <section className="card"><div className="universe-section-title"><div><h3>Rivalry Lore</h3><p className="muted">The league slowly gives recurring matchups a cultural identity of their own.</p></div></div><div className="culture-rivalry-wall">{rivalries.slice(0,12).map((r,i)=>{const a=r.teamA||teamMap.get(r.teamAId),b=r.teamB||teamMap.get(r.teamBId);const sameDivision=a&&b&&a.league===b.league&&a.division===b.division;const rivalryKey=[a?.id||'',b?.id||''].sort().join('-');const name=(extras.rivalryNames||{})[rivalryKey]||`${a?.abbr||'A'}–${b?.abbr||'B'} ${sameDivision?'Division Feud':'Series'}`;return <article key={`${r.teamAId}-${r.teamBId}-${i}`}><small>{Math.round(r.heat||0)} HEAT · {r.games||0} GAMES</small><h4>{name}</h4><p>{a?.abbr||'A'} vs {b?.abbr||'B'}{r.postseasonGames?` · ${r.postseasonGames} postseason meetings`:''}</p></article>})}</div></section>
      <section className="card"><h3>Game Threads That Became Lore</h3><div className="culture-thread-wall">{cultureThreads.length?cultureThreads.map(x=><article key={x.id}><small>{x.label}</small><strong>{x.score}</strong><span>{x.peak.toLocaleString()} peak viewers · Drama {x.drama}</span></article>):<Empty>Finalized games will start filling the league's cultural memory.</Empty>}</div></section>
      <div className="culture-lore-grid">
        <section className="card"><h3>Analyst Pick Records</h3>{analystRecords.map(a=><div className="culture-analyst-record" key={a.id}><div><strong>{a.name}</strong><small>{a.style}</small></div><b>{a.wins}-{a.losses}</b><span>{a.wins+a.losses?`${Math.round(a.pct*100)}% correct`:'Waiting for finals'}</span></div>)}</section>
        <section className="card"><h3>Diamond Debate</h3>{cultureDebates.length?cultureDebates.map((d,i)=><div className="culture-debate-row" key={`${d.topic}-${i}`}><small>{d.topic}</small><strong>{d.title}</strong><p>{d.detail}</p></div>):<Empty>The league is being suspiciously reasonable right now.</Empty>}</section>
      </div>
      <section className="card"><h3>Local Baseball Ecosystem</h3><div className="culture-business-wall">{localBusinesses.slice(0,12).map(b=><article key={b.id}><strong>{b.name}</strong><small>{b.type} · {b.team.abbr}</small><p>{b.text}</p></article>)}</div></section>
    </div>}

    {tab==='power' && <div className="card"><div className="universe-section-title"><div><h3>Power Rankings</h3><p className="muted">Live formula: record + run differential + current streak. Save snapshots to track movement week to week.</p></div><div className="inline-buttons"><Pill>{data.activeSeasonName || 'Season 4'}</Pill>{controlsUnlocked&&<button onClick={savePowerSnapshot}>Save Ranking Snapshot</button>}</div></div>{previousPowerSnapshot&&<p className="muted small-text">Movement vs snapshot from {new Date(previousPowerSnapshot.date).toLocaleDateString()}.</p>}<div className="power-list">{rankings.map((t,i)=>{const move=movementFor(t.id,i+1);return <div className="power-row power-row-v3" key={t.id}><span className="power-rank">{i+1}</span><strong>{t.abbr}</strong><span>{t.wins}-{t.losses}</span><span>RD {Number(t.runDiff||0)>=0?'+':''}{t.runDiff||0}</span><span>{t.streak || '—'}</span><small>{t.powerScore.toFixed(1)}</small><b className={`power-move ${move.className}`}>{move.text}</b></div>})}</div></div>}

    {tab==='games' && <div className="universe-section">
      <div className="universe-stat-grid game-record-grid">
        <div className="card universe-stat"><span>Permanent Games</span><strong>{gameRecords.games.length}</strong></div>
        <div className="card universe-stat"><span>Postseason Games</span><strong>{gameRecords.postseasonGames.length}</strong></div>
        <div className="card universe-stat"><span>Extra-Inning Games</span><strong>{gameRecords.extraInningGames.length}</strong></div>
        <div className="card universe-stat"><span>Walk-Offs</span><strong>{gameRecords.walkoffs.length}</strong></div>
        <div className="card universe-stat"><span>Biggest Margin</span><strong>{gameRecords.biggestBlowout ? gameRecords.biggestBlowout.margin : '—'}</strong></div>
        <div className="card universe-stat"><span>Highest Total</span><strong>{gameRecords.highestScoring ? gameRecords.highestScoring.totalRuns : '—'}</strong></div>
        <div className="card universe-stat"><span>Highest Team Score</span><strong>{gameRecords.highestTeamScore ? gameRecords.highestTeamScore.runs : '—'}</strong></div>
        <div className="card universe-stat"><span>One-Run Games</span><strong>{gameRecords.oneRunGames.length}</strong></div>
      </div>
      <div className="v3-history-leaders">{[['Most V3 Wins',teamHistoryLeaders.wins[0]],['Longest W Streak',teamHistoryLeaders.winStreak[0]],['Most V3 Playoff Wins',teamHistoryLeaders.playoffWins[0]],['Best V3 Run Diff',teamHistoryLeaders.runDiff[0]]].map(([label,row])=><div className="card" key={label}><span>{label}</span><strong>{row?.team?.abbr||'—'}</strong><small>{label.includes('Streak')?`${row?.longestWinStreak||0} games`:label.includes('Run Diff')?`${(row?.runsFor||0)-(row?.runsAgainst||0)>=0?'+':''}${(row?.runsFor||0)-(row?.runsAgainst||0)}`:label.includes('Playoff')?`${row?.playoffWins||0} wins`:`${row?.wins||0} wins`}</small></div>)}</div>
      <div className="universe-two-col"><div className="card"><h3>Game Records</h3>{gameRecords.biggestBlowout ? <><div className="record-feature-row"><span>Biggest Blowout</span><TeamScore game={gameRecords.biggestBlowout}/><small>{gameRecords.biggestBlowout.margin}-run margin · {gameRecords.biggestBlowout.date}</small></div><div className="record-feature-row"><span>Highest Scoring</span><TeamScore game={gameRecords.highestScoring}/><small>{gameRecords.highestScoring.totalRuns} combined runs · {gameRecords.highestScoring.date}</small></div><div className="record-feature-row"><span>Longest Game</span><TeamScore game={gameRecords.longestGame}/><small>{gameRecords.longestGame.innings} innings · {gameRecords.longestGame.date}</small></div>{gameRecords.highestTeamScore&&<div className="record-feature-row"><span>Most Runs by One Team</span><strong>{gameRecords.highestTeamScore.team?.abbr||'TBD'} · {gameRecords.highestTeamScore.runs}</strong><small>vs {gameRecords.highestTeamScore.opponent?.abbr||'TBD'} · {gameRecords.highestTeamScore.game.date}</small></div>}</> : <Empty>Finalize the first Version 3 game to start the permanent record book.</Empty>}</div><div className="card"><h3>Schedule / Result Archive</h3><div className="universe-scroll-list game-archive-list">{gameRecords.games.length ? gameRecords.games.map(g=><div className="game-archive-row" key={g.id}><div><small>{g.date} · {g.seasonName || 'Legacy'} · {g.gameType==='playoff'?'POSTSEASON':'REGULAR'}</small><TeamScore game={g}/></div><span>{g.innings>9?`${g.innings} inn.`:'Final'}</span></div>) : <Empty>No permanent games yet.</Empty>}</div></div></div>
    </div>}

    {tab==='careers' && <div className="universe-section">
      <div className="universe-stat-grid career-leader-cards">
        <div className="card universe-stat"><span>Career Hits Leader</span><strong>{[...careerBoard].sort((a,b)=>b.careerHits-a.careerHits)[0]?.name || '—'}</strong><small>{[...careerBoard].sort((a,b)=>b.careerHits-a.careerHits)[0]?.careerHits || 0} H</small></div>
        <div className="card universe-stat"><span>Career HR Leader</span><strong>{[...careerBoard].sort((a,b)=>b.careerHR-a.careerHR)[0]?.name || '—'}</strong><small>{[...careerBoard].sort((a,b)=>b.careerHR-a.careerHR)[0]?.careerHR || 0} HR</small></div>
        <div className="card universe-stat"><span>Pitching Wins Leader</span><strong>{[...careerBoard].sort((a,b)=>b.careerPitchingWins-a.careerPitchingWins)[0]?.name || '—'}</strong><small>{[...careerBoard].sort((a,b)=>b.careerPitchingWins-a.careerPitchingWins)[0]?.careerPitchingWins || 0} W</small></div>
        <div className="card universe-stat"><span>Current AVG Leader</span><strong>{[...careerBoard].filter(p=>p.seasonAB>0).sort((a,b)=>b.seasonAvg-a.seasonAvg)[0]?.name || '—'}</strong><small>{avg([...careerBoard].filter(p=>p.seasonAB>0).sort((a,b)=>b.seasonAvg-a.seasonAvg)[0]?.seasonHits,[...careerBoard].filter(p=>p.seasonAB>0).sort((a,b)=>b.seasonAvg-a.seasonAvg)[0]?.seasonAB)}</small></div>
      </div>
      <div className="card"><div className="universe-section-title"><div><h3>Player Career Center</h3><p className="muted">Version 3 permanently tracks batting and pitcher decisions from Season 4 forward.</p></div><Pill>Tracking begins V3</Pill></div><div className="career-table"><div className="career-row career-head"><span>Player</span><span>Team</span><span>Season H/AB</span><span>AVG</span><span>Career H/AB</span><span>HR</span><span>W-L</span></div>{careerBoard.length ? careerBoard.map(p=><button className={`career-row career-button-row ${playerId===p.id?'selected':''}`} key={p.id} onClick={()=>setPlayerId(p.id)}><strong>{p.name}</strong><span>{teamMap.get(p.teamId)?.abbr||'FA'}</span><span>{p.seasonHits}/{p.seasonAB}</span><span>{avg(p.seasonHits,p.seasonAB)}</span><span>{p.careerHits}/{p.careerAB}</span><span>{p.careerHR}</span><span>{p.careerPitchingWins}-{p.careerPitchingLosses}</span></button>) : <Empty>Add players to begin career tracking.</Empty>}</div></div>
      {selectedCareer && <><div className="card leaguehub-player-fandom"><div><small>PLAYER FAN CULTURE</small><h3>{selectedPlayerFanPage?.name||`${selectedCareer.name} Fan Watch`}</h3><p>{selectedPlayerFanPage?.handle||'Fan page still forming'} · {selectedPlayerFanPage?`${selectedPlayerFanPage.followers.toLocaleString()} followers`:'No dedicated following yet'}</p></div><div><span>POPULARITY SIGNAL</span><strong>{selectedPlayerFanPage?Math.min(100,Math.round(35+selectedPlayerFanPage.impact*1.8)):35}</strong><small>{selectedPlayerFanPage?.impact>20?'CULT-HERO BUZZ':selectedPlayerFanPage?.impact>8?'GROWING':'EARLY FOLLOWING'}</small></div></div><div className="universe-two-col"><div className="card player-career-profile"><div className="universe-kicker">CAREER PROFILE</div><h2>{selectedCareer.name}</h2><p>{teamMap.get(selectedCareer.teamId)?.abbr||'Free Agent'} · #{selectedCareer.number||'—'}</p><div className="player-stat-matrix">{[['AVG',avg(selectedCareer.careerHits,selectedCareer.careerAB)],['H',selectedCareer.careerHits],['2B',selectedCareer.careerDoubles],['3B',selectedCareer.careerTriples],['HR',selectedCareer.careerHR],['BB',selectedCareer.careerWalks],['K',selectedCareer.careerStrikeouts],['HBP',selectedCareer.careerHBP],['Pitch W',selectedCareer.careerPitchingWins],['Pitch L',selectedCareer.careerPitchingLosses]].map(([k,v])=><div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div></div><div className="card"><h3>Archived Seasons</h3><div className="universe-scroll-list">{selectedPlayerSeasons.length?selectedPlayerSeasons.map(p=><div className="universe-list-row" key={`${p.seasonId}-${p.id}`}><strong>{p.seasonName}</strong><span>{p.seasonHits||0}/{p.seasonAB||0} · {p.seasonHR||0} HR · {p.seasonPitchingWins||0}-{p.seasonPitchingLosses||0}</span></div>):<Empty>Season 4 will become the first archived player season in Version 3.</Empty>}</div></div></div></>}
    </div>}

    {tab==='living-lore' && <div className="universe-section">
      <section className="card universe-section-title"><div><h3>Living League Lore</h3><p className="muted">The reputations, traditions, folklore and season memories that make this league feel older than the current scoreboard.</p></div><Pill>Always evolving</Pill></section>
      <div className="living-lore-grid">
        <article className="card"><h3>Franchise Reputation Board</h3><div className="universe-scroll-list">{franchiseReputations.slice(0,12).map(r=><div className="universe-list-row lore-rep-row" key={r.team.id}><strong>{r.team.abbr} · {r.era}</strong><span>{r.labels.join(' · ')}</span><small>{r.score}/100 reputation</small></div>)}</div></article>
        <article className="card"><h3>Season-Defining Moments</h3><div className="universe-scroll-list">{definingMoments.length?definingMoments.map(m=><div className="universe-list-row" key={m.id}><strong>#{m.rank} {m.tier} · {m.title}</strong><span>{m.detail}</span></div>):<Empty>The season is still waiting for its first defining memory.</Empty>}</div></article>
      </div>
      <div className="living-lore-grid">
        <article className="card"><h3>Ballpark Folklore</h3><div className="universe-scroll-list">{stadiumFolklore.slice(0,10).map(f=><div className="lore-file" key={f.team.id}><strong>{f.team.abbr} · {f.legend}</strong><p>{f.lore[0]}</p><small>{f.superstition}</small></div>)}</div></article>
        <article className="card"><h3>Traditions & Rituals</h3><div className="universe-scroll-list">{traditionFiles.slice(0,10).map(t=><div className="lore-file" key={t.team.id}><strong>{t.team.abbr} · {t.chant}</strong><p>{t.ritual}</p><small>{t.postWin}</small></div>)}</div></article>
      </div>
    </div>}

    {tab==='awards' && <div className="card"><div className="universe-section-title"><div><h3>Season Awards</h3><p className="muted">Permanent award shelf for the league honors you actually award. Unused categories stay invisible.</p></div>{controlsUnlocked && <button onClick={addAward}>Add Award</button>}</div><div className="award-grid">{(extras.awards||[]).some(a=>a&&a.winner) ? (extras.awards||[]).filter(a=>a&&a.winner).map(a=><div className="award-card" key={a.id}><span>{a.season}</span><h4>{a.award}</h4><strong>{a.winner}</strong><small>{a.teamAbbr}</small>{controlsUnlocked&&<button className="tiny-danger" onClick={()=>removeExtra('awards',a.id)}>×</button>}</div>) : <Empty>No awards entered yet.</Empty>}</div></div>}

    {tab==='timeline' && <div className="card"><h3>League Timeline</h3><div className="timeline-list">{timeline.length ? timeline.map((e,i)=><div className="timeline-item" key={`${e.seasonName}-${i}`}><span className="timeline-dot"/><div><small>{e.seasonName}</small><h4>{e.title}</h4><p>{e.detail}</p></div></div>) : <Empty>Archive a season to begin the timeline.</Empty>}</div></div>}

    {tab==='dynasty' && <div className="universe-two-col"><div className="card"><h3>Dynasty Tracker</h3><div className="universe-scroll-list">{dynasties.map((d,i)=><div className="universe-list-row" key={d.teamId}><strong>#{i+1} {d.abbr}</strong><span>{d.championships} titles · {d.wsAppearances} WS · {d.playoffAppearances} playoffs</span></div>)}</div></div><div className="card"><h3>Trophy Case</h3><div className="trophy-grid">{records.rankings.championships.length ? records.rankings.championships.map(t=><div className="trophy-team" key={t.teamId}><div className="trophy-abbr">{t.abbr}</div><div>{Array.from({length:t.championships}).map((_,i)=><span key={i}>🏆</span>)}</div><small>{t.championships} championship{t.championships===1?'':'s'}</small></div>) : <Empty>No champions archived yet.</Empty>}</div></div></div>}

    {tab==='rivalries' && <div className="universe-section"><div className="card"><div className="universe-section-title"><div><h3>Rivalry Center</h3><p className="muted">Every permanent meeting adds another chapter — and now the chapters are visible.</p></div><Pill>{liveRivalries.length?'Full V3 head-to-head':'Archived postseason mode'}</Pill></div><div className="rivalry-grid">{rivalries.length ? rivalries.slice(0,30).map(r=><div className="rivalry-card" key={`${r.teamAId}-${r.teamBId}`}><div className="rivalry-matchup"><strong>{r.teamA?.abbr||'TBD'}</strong><span>vs</span><strong>{r.teamB?.abbr||'TBD'}</strong></div>{'games' in r && liveRivalries.length ? <><p>{r.games} games · {r.postseasonGames} postseason</p><small>Series: {r.aWins}-{r.bWins} · Runs: {r.runsA}-{r.runsB}</small></> : <><p>{r.meetings} playoff meeting{r.meetings===1?'':'s'} · {r.games} games</p><small>Series: {r.seriesA}-{r.seriesB} · Games: {r.aWins}-{r.bWins}</small></>}</div>) : <Empty>No rivalry history yet.</Empty>}</div></div><section className="card rivalry-timeline-section"><div className="universe-section-title"><div><h3>Rivalry Timeline</h3><p className="muted">Recent meetings from the hottest tracked rivalries.</p></div></div><div className="rivalry-timeline-scroll">{rivalryTimelines.slice(0,6).map(r=><article key={`${r.teamAId}-${r.teamBId}`}><strong>{r.teamA?.abbr} vs {r.teamB?.abbr}</strong><small>{r.games} games · {r.postseasonGames||0} postseason</small>{r.events.slice(0,4).map(e=><span key={e.id}><b>{e.score}</b><em>{e.tags.join(' · ')}</em></span>)}</article>)}</div></section></div>}

    {tab==='hall' && <div className="card"><div className="universe-section-title"><div><h3>Hall of Fame & Legends</h3><p className="muted">A permanent home for retired stars, iconic managers, or franchise legends.</p></div>{controlsUnlocked && <button onClick={addHall}>Induct Legend</button>}</div><div className="hall-grid">{(extras.hallOfFame||[]).length ? extras.hallOfFame.map(h=><div className="hall-card" key={h.id}><div className="hall-plaque">★</div><h4>{h.name}</h4><strong>{h.teamAbbr}</strong><p>{h.note}</p>{controlsUnlocked&&<button className="tiny-danger" onClick={()=>removeExtra('hallOfFame',h.id)}>×</button>}</div>) : <Empty>No inductees yet.</Empty>}</div></div>}

    {tab==='operations' && <div className="universe-section">
      <div className="card universe-section-title"><div><h3>League Operations Archive</h3><p className="muted">Transactions, injuries, managers, prospects, rebrands and retired numbers — all preserved as league history.</p></div><Pill>Manual historical log</Pill></div>
      <div className="operations-grid">
        {OPERATION_SECTIONS.map(({key,title,button,prompts})=><div className="card operations-card" key={key}><div className="operations-card-head"><h3>{title}</h3>{controlsUnlocked&&<button onClick={()=>addSimple(key,prompts)}>{button}</button>}</div><div className="universe-scroll-list">{(extras[key]||[]).length ? extras[key].map(x=><div className="ops-entry" key={x.id}><div><small>{x.date||x.season||''} {x.teamAbbr?`· ${x.teamAbbr}`:''}</small><strong>{x.title||x.name}</strong><p>{x.note}</p></div>{controlsUnlocked&&<button className="tiny-danger" onClick={()=>removeExtra(key,x.id)}>×</button>}</div>) : <Empty>No entries yet.</Empty>}</div></div>)}
      </div>
    </div>}

    {tab==='compare' && <div className="universe-section"><div className="card"><div className="universe-section-title"><div><h3>Season Comparison Lab</h3><p className="muted">Put any two archived seasons side by side.</p></div></div><div className="compare-selectors">{[0,1].map(i=><select key={i} value={compareIds[i]} onChange={e=>setCompareIds(prev=>prev.map((v,j)=>j===i?e.target.value:v))}><option value="">Choose season {i+1}</option>{seasons.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>)}</div></div>{comparison[0]&&comparison[1] ? <div className="season-compare-grid">{comparison.map(s=><div className="card season-compare-card" key={s.id}><div className="universe-kicker">{s.name}</div><h2>🏆 {s.championAbbr}</h2><div className="compare-stat"><span>Best team</span><strong>{s.bestTeam?.abbr||'—'} {s.bestTeam?`${s.bestTeam.wins}-${s.bestTeam.losses}`:''}</strong></div><div className="compare-stat"><span>League runs</span><strong>{s.totalRuns}</strong></div><div className="compare-stat"><span>Franchises</span><strong>{s.teamCount}</strong></div><div className="compare-meter-block"><span>Best-team wins</span><div className="compare-meter"><i style={{width:`${Math.min(100,((s.bestTeam?.wins||0)/40)*100)}%`}} /></div></div><div className="compare-meter-block"><span>League runs</span><div className="compare-meter alt"><i style={{width:`${Math.min(100,(s.totalRuns/Math.max(...seasons.map(x=>x.totalRuns||1)))*100)}%`}} /></div></div></div>)}</div> : <Empty>Select two archived seasons.</Empty>}</div>}

    {tab==='season' && <div className="universe-two-col"><div className="card season-preview-card"><div className="universe-kicker">{data.activeSeasonName || 'Season 4'} PREVIEW</div><div className="operations-card-head"><h3>Season Preview</h3>{controlsUnlocked&&<div className="inline-buttons"><button onClick={renameSeason}>Rename Season</button><button onClick={setSeasonPresentation}>Season Settings</button></div>}</div>{extras.seasonTagline&&<div className="season-tagline">“{extras.seasonTagline}”</div>}{extras.openingDay&&<p>Opening Day: <strong>{extras.openingDay}</strong></p>}{preview.latest ? <><p>Defending champion</p><div className="season-feature-team">🏆 {preview.champion?.abbr || 'TBD'}</div><p>All-time title leader: <strong>{preview.titleLeader?.abbr || '—'}</strong></p><p>Longest active title drought: <strong>{preview.droughtLeader ? `${preview.droughtLeader.abbr} (${preview.droughtLeader.activeTitleDrought})` : '—'}</strong></p><p>Permanent V3 games: <strong>{gameRecords.games.length}</strong></p></> : <Empty>Archive a completed season to unlock the preview.</Empty>}</div><div className="card"><div className="universe-kicker">LATEST ARCHIVE</div><h3>Season Recap</h3>{preview.latest ? <><h2>{preview.latest.name}</h2><p>Champion: <strong>{preview.champion?.abbr || 'TBD'}</strong></p><p>{preview.latest.teams?.length || 0} franchises archived.</p><p>{preview.latest.games?.length || 0} games attached to the season snapshot.</p><div className="inline-buttons"><button onClick={()=>ctx.setPage?.('history')}>Open Full Season History</button><button onClick={()=>window.print()}>Print Season Almanac</button></div></> : <Empty>No season recap available yet.</Empty>}</div></div>}

    {tab==='today' && <div className="card"><h3>On This Day</h3><p className="muted">V4 checks permanent game history as well as archived season events.</p><div className="timeline-list">{[...thisDayGames.map(g=>({title:`${g.away?.abbr||'AWY'} ${g.awayScore} – ${g.home?.abbr||'HME'} ${g.homeScore}`,detail:`${g.seasonName||'Season'} · ${g.gameType==='playoff'?'Postseason':'Regular season'} · ${g.innings} innings`})),...archiveToday].length ? [...thisDayGames.map(g=>({title:`${g.away?.abbr||'AWY'} ${g.awayScore} – ${g.home?.abbr||'HME'} ${g.homeScore}`,detail:`${g.seasonName||'Season'} · ${g.gameType==='playoff'?'Postseason':'Regular season'} · ${g.innings} innings`})),...archiveToday].map((x,i)=><div className="timeline-item" key={i}><span className="timeline-dot"/><div><h4>{x.title}</h4><p>{x.detail}</p></div></div>) : <Empty>No league events landed on this date yet.</Empty>}</div></div>}
  </div>;
}
