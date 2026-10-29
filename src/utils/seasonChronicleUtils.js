import { buildV4TeamMetrics } from './v4Utils';
import { currentSeasonDay, anchorRegularFinals } from './seasonCalendarUtils';
import { buildSpecialAchievements } from './playerLegacyUtils';

const num=v=>Number(v||0);
export const seasonNumber=name=>{const m=String(name||'').match(/(\d+)/);return m?Number(m[1]):0};
const snapshotId=(season,week,type='weekly')=>`${String(season||'season').toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${type}-w${week}`;

export function getChronicleWeek(data={},teams=[]){
  const day=currentSeasonDay(data,teams);
  const finals=anchorRegularFinals(data,teams).length;
  const currentWeek=day?.week || (finals>=40?8:Math.max(1,Math.ceil((finals+1)/5)));
  const completedWeek=day ? Math.max(0,day.week-1) : (finals>=40?8:Math.max(0,currentWeek-1));
  return {currentWeek,completedWeek,finals};
}

export function buildChronicleSnapshot(data={},teams=[],playoffPicture=[],opts={}){
  const activeSeason=data.activeSeasonName||'Season 4';
  const {currentWeek,completedWeek}=getChronicleWeek(data,teams);
  const week=Number(opts.week||completedWeek||currentWeek||1);
  const metrics=buildV4TeamMetrics(data,teams,playoffPicture);
  const ordered=[...metrics].sort((a,b)=>a.currentRank-b.currentRank);
  const hot=[...teams].filter(t=>String(t.streak||'').startsWith('W')).sort((a,b)=>num(String(b.streak||'').slice(1))-num(String(a.streak||'').slice(1)))[0]||null;
  const cold=[...teams].filter(t=>String(t.streak||'').startsWith('L')).sort((a,b)=>num(String(b.streak||'').slice(1))-num(String(a.streak||'').slice(1)))[0]||null;
  const achievements=buildSpecialAchievements(data,teams).filter(a=>!a.season||a.season===activeSeason).slice(0,12);
  const extras=data.leagueExtras||{};
  const latestStory=(extras.storylines||[])[0]||null;
  const world=(extras.worldMoments||[])[0]||null;
  const weeklyGames=(data.games||[]).filter(g=>g?.status==='Final'&&(g.seasonName||activeSeason)===activeSeason).slice(-12);
  const bestGame=[...weeklyGames].sort((a,b)=>{
    const ma=Math.abs(num(a.awayScore)-num(a.homeScore));
    const mb=Math.abs(num(b.awayScore)-num(b.homeScore));
    const ea=(a.inning||9)>=10?8:0, eb=(b.inning||9)>=10?8:0;
    return (eb-mb)-(ea-ma);
  })[0]||null;
  return {
    id:opts.id||((opts.type||'weekly')==='weekly'?snapshotId(activeSeason,week,'weekly'):`${snapshotId(activeSeason,week,opts.type||'manual')}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`),
    type:opts.type||'weekly',
    season:activeSeason,
    week,
    label:opts.label||`${activeSeason} · Week ${week}`,
    createdAt:new Date().toISOString(),
    status:opts.status||'draft',
    lockedAt:opts.status==='locked'?new Date().toISOString():'',
    teams:ordered.map(m=>({teamId:m.team.id,abbr:m.team.abbr,wins:num(m.team.wins),losses:num(m.team.losses),runDiff:num(m.team.runDiff),streak:m.team.streak||'',rank:m.currentRank,playoffProbability:Math.round(num(m.playoffProbability)),momentum:Math.round(num(m.momentum))})),
    hotTeam:hot?{teamId:hot.id,abbr:hot.abbr,streak:hot.streak}:null,
    coldTeam:cold?{teamId:cold.id,abbr:cold.abbr,streak:cold.streak}:null,
    storyline:latestStory?{title:latestStory.title,note:latestStory.note||''}:null,
    worldMoment:world?{title:world.title||world.label||'World Moment',detail:world.detail||world.note||''}:null,
    milestones:achievements.map(a=>({id:a.id,playerName:a.playerName,teamAbbr:a.teamAbbr,title:a.title,note:a.note||''})),
    awardRace:(extras.awardRace||[]).map(a=>({id:a.id,award:a.award,category:a.category,leader:a.leader,teamAbbr:a.teamAbbr,stat:a.stat,scope:a.scope||'REGULAR'})),
    bestGame:bestGame?{id:bestGame.id,awayTeamId:bestGame.awayTeamId,homeTeamId:bestGame.homeTeamId,awayScore:num(bestGame.awayScore),homeScore:num(bestGame.homeScore),date:bestGame.date||bestGame.finalizedAt||''}:null,
    checkpoint: week===4?'MIDSEASON':week===8?'REGULAR SEASON FINAL':week>=7?'PENNANT RACE':week===1?'OPENING WEEK':'WEEKLY'
  };
}

export function chronicleSnapshots(data={}){
  return [...(data.leagueExtras?.chronicleSnapshots||[])].sort((a,b)=>(seasonNumber(b.season)-seasonNumber(a.season))||(num(b.week)-num(a.week))||((Date.parse(b.createdAt||'')||0)-(Date.parse(a.createdAt||'')||0)));
}

export function snapshotForWeek(data={},season='',week=0){
  return chronicleSnapshots(data).find(s=>s.season===season&&num(s.week)===num(week)&&s.type==='weekly')||null;
}

export function snapshotReadiness(data={},teams=[]){
  const season=data.activeSeasonName||'Season 4';
  const {completedWeek,currentWeek}=getChronicleWeek(data,teams);
  const snaps=chronicleSnapshots(data).filter(s=>s.season===season&&s.type==='weekly');
  const missing=[];
  for(let w=1;w<=completedWeek;w++)if(!snaps.some(s=>num(s.week)===w))missing.push(w);
  const drafts=snaps.filter(s=>s.status!=='locked');
  return {season,currentWeek,completedWeek,missing,drafts};
}

export function compareSnapshotToCurrent(snapshot,teams=[]){
  if(!snapshot)return [];
  const byId=new Map((snapshot.teams||[]).map(t=>[t.teamId,t]));
  return teams.map(team=>{
    const old=byId.get(team.id); if(!old)return null;
    const dw=num(team.wins)-num(old.wins), dl=num(team.losses)-num(old.losses), dr=num(team.runDiff)-num(old.runDiff);
    return {team,old,winsDelta:dw,lossesDelta:dl,runDiffDelta:dr,changed:dw!==0||dl!==0||dr!==0||String(team.streak||'')!==String(old.streak||'')};
  }).filter(x=>x?.changed).sort((a,b)=>Math.abs(b.winsDelta)+Math.abs(b.lossesDelta)-Math.abs(a.winsDelta)-Math.abs(a.lossesDelta));
}

export const MILESTONE_LADDERS={
  hits:[200,300,400,500,600,750,1000],
  hr:[100,150,200,250,300],
  rbi:[200,300,400,500],
  runs:[200,300,400,500],
  xbh:[100,150,200,250,300],
  sb:[50,75,100,150,200],
  wins:[20,30,40,50,75,100],
  strikeouts:[200,250,300,400,500,750,1000],
  saves:[20,30,40,50,75,100],
  postseasonHits:[25,50,75,100],
  postseasonHr:[10,25,50],
  postseasonRbi:[25,50,75,100],
  postseasonWins:[5,10,15,20],
  postseasonStrikeouts:[50,100,150,200],
  postseasonSaves:[5,10,20,30]
};

export function milestoneGroupKey(item={}){
  const text=`${item.title||''} ${item.note||''}`.toLowerCase();
  if(/postseason/.test(text)&&/home run|\bhr\b|homer/.test(text))return 'postseasonHr';
  if(/postseason/.test(text)&&/hit/.test(text))return 'postseasonHits';
  if(/postseason/.test(text)&&/rbi/.test(text))return 'postseasonRbi';
  if(/postseason/.test(text)&&/strikeout|\bk\b/.test(text))return 'postseasonStrikeouts';
  if(/postseason/.test(text)&&/save/.test(text))return 'postseasonSaves';
  if(/postseason/.test(text)&&/win/.test(text))return 'postseasonWins';
  if(/home run|\bhr\b|homer/.test(text))return 'hr';
  if(/extra.?base|\bxbh\b/.test(text))return 'xbh';
  if(/stolen|\bsb\b/.test(text))return 'sb';
  if(/strikeout|\bk\b/.test(text))return 'strikeouts';
  if(/save/.test(text))return 'saves';
  if(/\bwin/.test(text))return 'wins';
  if(/rbi/.test(text))return 'rbi';
  if(/run/.test(text))return 'runs';
  if(/hit/.test(text))return 'hits';
  return 'other';
}

export function buildMilestoneLadders(data={},teams=[]){
  const all=buildSpecialAchievements(data,teams);
  const grouped=new Map();
  all.forEach(a=>{
    const key=`${a.teamAbbr}|${a.playerName||'Unknown'}|${milestoneGroupKey(a)}`;
    if(!grouped.has(key))grouped.set(key,[]);
    grouped.get(key).push(a);
  });
  return [...grouped.entries()].map(([key,items])=>{
    const [teamAbbr,playerName,stat]=key.split('|');
    const sorted=[...items].sort((a,b)=>{
      const av=num(String(a.title||'').match(/\d+/)?.[0]); const bv=num(String(b.title||'').match(/\d+/)?.[0]);
      return bv-av || ((Date.parse(b.createdAt||'')||0)-(Date.parse(a.createdAt||'')||0));
    });
    return {key,teamAbbr,playerName,stat,latest:sorted[0],items:sorted};
  }).sort((a,b)=>(Date.parse(b.latest?.createdAt||'')||0)-(Date.parse(a.latest?.createdAt||'')||0));
}

export function buildGlobalSearchIndex(data={},teams=[]){
  const extras=data.leagueExtras||{}; const out=[];
  teams.forEach(t=>out.push({id:`team-${t.id}`,type:'Team',title:`${t.city} ${t.name}`,detail:`${t.abbr} · ${t.league} ${t.division}`,tab:'intelligence',teamId:t.id}));
  buildSpecialAchievements(data,teams).forEach(a=>out.push({id:`ach-${a.id}`,type:'Milestone',title:`${a.playerName||'Player'} · ${a.title}`,detail:`${a.teamAbbr} · ${a.season||''}`,tab:'players'}));
  (extras.awards||[]).filter(a=>a?.winner).forEach(a=>out.push({id:`award-${a.id}`,type:'Award',title:`${a.winner} · ${a.award}`,detail:`${a.teamAbbr||''} · ${a.season||''}`,tab:'players'}));
  (extras.manualEvents||[]).forEach(e=>out.push({id:`event-${e.id}`,type:'History',title:e.title||'History Event',detail:`${e.teamAbbr||''} ${e.date||''} ${e.note||''}`.trim(),tab:'records'}));
  (extras.customRecords||[]).forEach(r=>out.push({id:`record-${r.id}`,type:'Record',title:r.title||'Record',detail:`${r.holder||''} ${r.value||''} ${r.note||''}`.trim(),tab:'records'}));
  chronicleSnapshots(data).forEach(s=>out.push({id:`snap-${s.id}`,type:'Snapshot',title:s.label,detail:`${s.status==='locked'?'Locked':'Draft'} · ${s.checkpoint||'Weekly'}`,tab:'snapshots'}));
  (data.seasonHistory||[]).forEach(s=>out.push({id:`season-${s.id}`,type:'Season',title:s.name||'Archived Season',detail:`Champion ${s.championAbbr||'TBD'}`,tab:'snapshots'}));
  return out;
}

export function buildCommissionerInbox(data={},teams=[],playoffPicture=[]){
  const extras=data.leagueExtras||{}; const readiness=snapshotReadiness(data,teams); const items=[];
  readiness.missing.forEach(week=>items.push({id:`snapshot-missing-${week}`,severity:'high',title:`Week ${week} snapshot missing`,detail:'Create the weekly Chronicle checkpoint so the season timeline stays complete.',action:'history'}));
  readiness.drafts.forEach(s=>items.push({id:`snapshot-draft-${s.id}`,severity:'medium',title:`${s.label} ready to review`,detail:'Standings and league context were captured automatically. Lock it when Quick results are current.',action:'history'}));
  const unassigned=(extras.ceremonies||[]).filter(c=>c.status!=='completed'&&!c.gameNumber);
  if(unassigned.length)items.push({id:'ceremonies',severity:'medium',title:`${unassigned.length} ceremony${unassigned.length===1?'':'ies'} unassigned`,detail:'Choose a Game Day or leave them pending until the right moment.',action:'calendar'});
  const schedule=(extras.seasonSchedule||[]); const promos=extras.gameNightSchedule||{};
  const noPromo=schedule.filter(x=>x?.gameNumber&&!promos[String(x.gameNumber)]).slice(0,8);
  if(noPromo.length)items.push({id:'promos',severity:'low',title:`${noPromo.length}+ upcoming games without a theme`,detail:'Optional: add a promotion or let Ballpark Life carry the day.',action:'calendar'});
  const activeSeason=data.activeSeasonName||'Season 4'; const awards=(extras.awards||[]).filter(a=>a?.winner&&(!a.season||a.season===activeSeason));
  if(readiness.completedWeek>=8&&awards.length===0)items.push({id:'awards',severity:'medium',title:'Season awards not finalized',detail:'Only honors you choose will appear in history.',action:'history'});
  const changes=compareSnapshotToCurrent(chronicleSnapshots(data).find(s=>s.status==='locked'&&s.season===activeSeason),teams);
  if(changes.length)items.push({id:'quick-changes',severity:'low',title:`${changes.length} team records changed since last locked snapshot`,detail:'Review the movement before locking the next Chronicle checkpoint.',action:'history'});
  return items;
}
