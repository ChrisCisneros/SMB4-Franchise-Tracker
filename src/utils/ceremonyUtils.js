import { makeSafePlayoffBracket } from './playoffUtils';
import { getTeamColorsByAbbr } from '../config/teamColors';

const safeArr=x=>Array.isArray(x)?x:[];
const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`cer-${Date.now()}-${Math.random()}`;

export const CEREMONY_TYPES=[
  {id:'banner',icon:'🎏',name:'League Championship Banner Unveiling',tone:'banner'},
  {id:'rings',icon:'💍',name:'World Series Ring Ceremony',tone:'gold'},
  {id:'trophy',icon:'🏆',name:'World Series Trophy Presentation',tone:'gold'},
  {id:'retired-number',icon:'🔢',name:'Retired Number Ceremony',tone:'legacy'},
  {id:'hall-of-fame',icon:'🏛️',name:'Hall of Fame Induction Night',tone:'legacy'},
  {id:'alumni',icon:'🤝',name:'Alumni Weekend',tone:'legacy'},
  {id:'anniversary',icon:'🎉',name:'Championship Anniversary Night',tone:'gold'},
  {id:'first-pitch',icon:'⚾',name:'Ceremonial First Pitch',tone:'event'},
  {id:'legend',icon:'⭐',name:'Franchise Legend Day',tone:'legacy'},
  {id:'milestone',icon:'📍',name:'Franchise Milestone Ceremony',tone:'event'},
  {id:'tribute',icon:'🕯️',name:'Memorial / Tribute Ceremony',tone:'legacy'},
  {id:'opening-day',icon:'⚾',name:'Opening Day Ceremony',tone:'event'},
  {id:'fan-appreciation',icon:'❤️',name:'Fan Appreciation Ceremony',tone:'event'},
  {id:'reunion',icon:'🤝',name:'Championship Reunion',tone:'gold'},
  {id:'league-award',icon:'🏅',name:'League Award Presentation',tone:'gold'},
  {id:'historic-team',icon:'📜',name:'Historic Team Recognition',tone:'legacy'},
  {id:'custom',icon:'✨',name:'Custom Ceremony',tone:'event'},
];

function archivedSeasonNumber(season={}){
  const explicit=Number(season.seasonNumber||season.number||0); if(explicit>0)return explicit;
  const match=String(season.name||'').match(/season\s*(\d+)/i); return match?Number(match[1]):0;
}
function latestArchivedSeason(history=[]){
  return [...safeArr(history)].sort((a,b)=>{
    const numDiff=archivedSeasonNumber(b)-archivedSeasonNumber(a); if(numDiff)return numDiff;
    return (Date.parse(b?.archivedAt||'')||0)-(Date.parse(a?.archivedAt||'')||0);
  })[0]||null;
}
export function previousSeasonChampions(data={},teams=[]){
  const season=latestArchivedSeason(data.seasonHistory); if(!season)return null;
  const bracket=makeSafePlayoffBracket(season.playoffBracket);
  const seasonTeams=season.teams||[];
  const team=id=>seasonTeams.find(t=>t.id===id)||teams.find(t=>t.id===id)||null;
  const al=team(bracket.al?.lc?.winnerTeamId),nl=team(bracket.nl?.lc?.winnerTeamId),champ=team(season.championTeamId||bracket.finals?.winnerTeamId);
  return {season,al,nl,champ};
}
export function seedOpeningCeremonies(data={},teams=[]){
  const prev=previousSeasonChampions(data,teams); if(!prev)return [];
  const seasonName=data.activeSeasonName||'Current Season'; const events=[];
  const schedule=safeArr(data.leagueExtras?.seasonSchedule);
  const firstMatchupFor=abbr=>schedule.find(x=>String(x?.opponentAbbr||'').toUpperCase()===String(abbr||'').toUpperCase())?.gameNumber||0;
  [prev.al,prev.nl].filter(Boolean).forEach(team=>{
    if(team.id===prev.champ?.id)return;
    const gameNumber=firstMatchupFor(team.abbr);
    events.push({id:uid(),type:'banner',teamId:team.id,teamAbbr:team.abbr,title:`${prev.season.name||'Previous Season'} League Championship Banner Ceremony — ${team.abbr}`,detail:`Celebrating ${team.abbr}'s ${prev.season.name||'previous season'} league championship${gameNumber?` when they meet the calendar club in Game ${gameNumber}`:'; assign this ceremony when that matchup is scheduled'}.`,seasonName,gameNumber,timing:'PREGAME',status:'scheduled',source:'opening-seed',originSeasonName:prev.season.name||'',createdAt:new Date().toISOString()});
  });
  if(prev.champ){
    const gameNumber=firstMatchupFor(prev.champ.abbr);
    events.push({id:uid(),type:'championship-opening',teamId:prev.champ.id,teamAbbr:prev.champ.abbr,title:`${prev.season.name||'Previous Season'} World Series Banner, Trophy & Ring Ceremony — ${prev.champ.abbr}`,detail:`The ${prev.season.name||'previous season'} World Series champions raise their league banner, present the trophy and receive championship rings${gameNumber?` when they meet the calendar club in Game ${gameNumber}`:'; assign this ceremony when that matchup is scheduled'}.`,seasonName,gameNumber,timing:'PREGAME',status:'scheduled',includes:['banner','trophy','rings'],source:'opening-seed',originSeasonName:prev.season.name||'',createdAt:new Date().toISOString()});
  }
  return events;
}
export function buildCeremonyTimeline(data={},teams=[]){
  const list=safeArr(data.leagueExtras?.ceremonies); return [...list].sort((a,b)=>(Number(a.gameNumber||999)-Number(b.gameNumber||999))||String(a.createdAt||'').localeCompare(String(b.createdAt||''))).map(c=>({...c,team:teams.find(t=>t.id===c.teamId)||teams.find(t=>t.abbr===c.teamAbbr)||null}));
}
export function ceremonyForGame(data={},teams=[],gameNumber){return buildCeremonyTimeline(data,teams).filter(c=>Number(c.gameNumber||0)===Number(gameNumber||0))}
export function ceremonyTheme(ceremony){
  const team=ceremony?.team;const colors=getTeamColorsByAbbr(team?.abbr||ceremony?.teamAbbr);return {main:colors.main,alt:colors.alt,border:colors.border,text:colors.text};
}
export function ceremonySocialLines(ceremony,team){
  const abbr=team?.abbr||ceremony?.teamAbbr||'TEAM';
  const type=ceremony?.type;
  if(type==='championship-opening')return [`The rings are out. The trophy is here. ${abbr} gets one more night to celebrate the title.`,`Seeing the championship banner go up in person is unreal.`,`That ring reveal just made the whole building louder.`,`The trophy presentation got a standing ovation before first pitch.`,`New season, same hardware. Everybody wants what ${abbr} has.`];
  if(type==='banner')return [`The banner is going up. That season is officially in the rafters now.`,`Seeing ${abbr}'s league title become permanent hits different.`,`One more banner in the building. Earned.`];
  if(type==='retired-number')return [`That number belongs in the rafters forever.`,`Whole place stood up for that one. What a career.`];
  return [`Special ceremony tonight for ${abbr}. The building feels different already.`,`This is one of those nights fans remember.`];
}
