import { makeSafePlayoffBracket } from './playoffUtils';
import { buildLeagueRecords } from './recordsUtils';

const pct=(w=0,l=0)=>Number(w||0)+Number(l||0)?Number(w||0)/(Number(w||0)+Number(l||0)):.5;
const chronological=(history=[])=>[...history].sort((a,b)=>{
  const ad=Date.parse(a?.archivedAt||'')||0, bd=Date.parse(b?.archivedAt||'')||0;
  if(ad!==bd)return ad-bd;
  return String(a?.name||'').localeCompare(String(b?.name||''),undefined,{numeric:true});
});
const seasonChampionId=(season={})=>season.championTeamId||makeSafePlayoffBracket(season.playoffBracket).finals?.winnerTeamId||'';
const seasonPlayoffIds=(season={})=>{
  const b=makeSafePlayoffBracket(season.playoffBracket); const ids=new Set();
  ['al','nl'].forEach(l=>['qf1','qf2','qf3','qf4','sf1','sf2','lc'].forEach(k=>{
    const s=b?.[l]?.[k]; if(s?.awayTeamId)ids.add(s.awayTeamId); if(s?.homeTeamId)ids.add(s.homeTeamId);
  }));
  [b?.finals?.awayTeamId,b?.finals?.homeTeamId].filter(Boolean).forEach(id=>ids.add(id));
  return ids;
};
const teamLookup=(history=[],teams=[])=>{
  const map=new Map(teams.map(t=>[t.id,t]));
  history.forEach(s=>(s.teams||[]).forEach(t=>{if(t?.id&&!map.has(t.id))map.set(t.id,t)}));
  return map;
};

export function buildAnniversaryMoments(data={},teams=[]){
  const history=chronological(data.seasonHistory||[]); if(!history.length)return [];
  const map=teamLookup(history,teams); const currentOrdinal=history.length+1;
  const milestones=new Set([1,2,3,5,10,15,20,25,30,40,50]); const rows=[];
  history.forEach((season,index)=>{
    const age=currentOrdinal-(index+1); if(!milestones.has(age))return;
    const champId=seasonChampionId(season); const champ=map.get(champId);
    if(champ)rows.push({id:`ann-title-${season.id||index}`,age,kind:'Championship Anniversary',icon:'🏆',season:season.name||`Season ${index+1}`,team:champ,title:`${age} season${age===1?'':'s'} since ${champ.abbr} won it all`,detail:`${champ.city||''} ${champ.name||champ.abbr}`.trim()+' returns to the championship spotlight.'});
    const b=makeSafePlayoffBracket(season.playoffBracket); const finalists=[b.finals?.awayTeamId,b.finals?.homeTeamId].filter(Boolean).map(id=>map.get(id)).filter(Boolean);
    if(finalists.length===2)rows.push({id:`ann-finals-${season.id||index}`,age,kind:'World Series Anniversary',icon:'⚾',season:season.name||`Season ${index+1}`,title:`${age} season${age===1?'':'s'} since ${finalists[0].abbr} vs ${finalists[1].abbr}`,detail:`The ${season.name||`Season ${index+1}`} championship matchup is back in the league memory.`});
  });
  const milestonesList=data.leagueExtras?.milestones||[];
  milestonesList.forEach((m,i)=>{
    const seasonIndex=history.findIndex(s=>s.name===m.season); if(seasonIndex<0)return;
    const age=currentOrdinal-(seasonIndex+1); if(!milestones.has(age))return;
    rows.push({id:`ann-milestone-${m.id||i}`,age,kind:'Milestone Anniversary',icon:m.icon||'🏅',season:m.season,title:`${age} season${age===1?'':'s'} since ${m.title||'a league milestone'}`,detail:[m.playerName,m.teamAbbr,m.note].filter(Boolean).join(' · ')});
  });
  return rows.sort((a,b)=>b.age-a.age||a.kind.localeCompare(b.kind)).slice(0,30);
}

export function buildFranchiseEraHistory(data={},teams=[]){
  const history=chronological(data.seasonHistory||[]); const map=teamLookup(history,teams); const rows=[];
  map.forEach((team,teamId)=>{
    const entries=history.map((season,index)=>{
      const t=(season.teams||[]).find(x=>x.id===teamId); if(!t)return null;
      const playoffs=seasonPlayoffIds(season).has(teamId); const champion=seasonChampionId(season)===teamId;
      return {season:season.name||`Season ${index+1}`,ordinal:index+1,pct:pct(t.wins,t.losses),wins:Number(t.wins||0),losses:Number(t.losses||0),playoffs,champion};
    }).filter(Boolean);
    const scan=(type,test)=>{
      let run=[]; const flush=()=>{if(run.length>=2){const avg=run.reduce((s,x)=>s+x.pct,0)/run.length; const titles=run.filter(x=>x.champion).length; const po=run.filter(x=>x.playoffs).length; rows.push({id:`${teamId}-${type}-${run[0].ordinal}-${run.at(-1).ordinal}`,team,teamId,type,start:run[0].season,end:run.at(-1).season,seasons:run.length,avgPct:avg,titles,playoffs:po,label:type==='golden'?(titles>=2?'DYNASTY ERA':titles?'GOLDEN ERA':'CONTENDER ERA'):(avg<=.35?'DARK AGE':'LEAN YEARS')});} run=[];};
      entries.forEach(e=>{if(test(e))run.push(e);else flush()}); flush();
    };
    scan('golden',e=>e.champion||e.playoffs||e.pct>=.575);
    scan('dark',e=>!e.playoffs&&e.pct<=.45);
  });
  return rows.sort((a,b)=>a.type===b.type?(b.titles-a.titles||b.seasons-a.seasons||b.avgPct-a.avgPct):(a.type==='golden'?-1:1));
}

export function buildDroughtHistory(data={},teams=[]){
  const records=buildLeagueRecords(data.seasonHistory||[],teams); const rows=[];
  (records.teamStats||[]).forEach(r=>{
    if(r.activeTitleDrought>0)rows.push({id:`title-${r.teamId}`,teamId:r.teamId,team:teams.find(t=>t.id===r.teamId)||r,type:'Championship',seasons:r.activeTitleDrought,severity:r.activeTitleDrought>=5?'historic':r.activeTitleDrought>=3?'serious':'building',label:r.championships?`${r.activeTitleDrought}-season title drought`:'Still chasing first title'});
    if(r.activePlayoffDrought>0)rows.push({id:`playoff-${r.teamId}`,teamId:r.teamId,team:teams.find(t=>t.id===r.teamId)||r,type:'Playoff',seasons:r.activePlayoffDrought,severity:r.activePlayoffDrought>=4?'historic':r.activePlayoffDrought>=2?'serious':'building',label:r.playoffAppearances?`${r.activePlayoffDrought}-season playoff drought`:'Still chasing first playoff berth'});
  });
  return rows.sort((a,b)=>b.seasons-a.seasons||a.type.localeCompare(b.type));
}

function gameLabel(g,teams){const a=teams.find(t=>t.id===g.awayTeamId),h=teams.find(t=>t.id===g.homeTeamId);return `${a?.abbr||'AWY'} ${g.awayScore??'—'} – ${h?.abbr||'HME'} ${g.homeScore??'—'}`;}
export function buildMuseumCollection(data={},teams=[]){
  const history=chronological(data.seasonHistory||[]); const map=teamLookup(history,teams); const artifacts=[];
  history.forEach((season,index)=>{
    const champ=map.get(seasonChampionId(season)); if(!champ)return;
    artifacts.push({id:`museum-title-${season.id||index}`,category:'Championships',display:'hardware',icon:'🏆',title:`${season.name||`Season ${index+1}`} Championship Trophy`,subtitle:`${champ.abbr} · LEAGUE CHAMPION`,detail:`Preserved from the season ${champ.abbr} finished on top of the league.`,season:season.name||`Season ${index+1}`,teamId:champ.id,automatic:true});
  });
  (data.leagueExtras?.milestones||[]).forEach((m,i)=>artifacts.push({id:`museum-milestone-${m.id||i}`,category:'Records & Milestones',display:'plaque',icon:m.icon||'🏅',title:m.title||'Career Milestone',subtitle:[m.playerName,m.teamAbbr].filter(Boolean).join(' · '),detail:m.note||'A preserved milestone from league history.',season:m.season||'Date unknown',automatic:true}));
  (data.leagueExtras?.retiredNumbers||[]).forEach((r,i)=>artifacts.push({id:`museum-retired-${r.id||i}`,category:'Legends',display:'plaque',icon:'🎽',title:`${r.teamAbbr||''} ${r.title||'Retired Number'}`.trim(),subtitle:r.name||'Franchise legend',detail:r.note||'Forever preserved in the rafters.',automatic:true}));
  (data.leagueExtras?.hallOfFame||[]).forEach((h,i)=>artifacts.push({id:`museum-hof-${h.id||i}`,category:'Legends',display:'statue',icon:'🗿',title:`${h.name||'League Legend'} Statue`,subtitle:[h.teamAbbr,'HALL OF FAME'].filter(Boolean).join(' · '),detail:h.note||'Immortalized as one of the defining figures in league history.',season:h.season||'',automatic:true}));
  (data.leagueExtras?.achievements||[]).filter(a=>a?.title).forEach((a,i)=>artifacts.push({id:`museum-achievement-${a.id||i}`,category:'Records & Milestones',display:'plaque',icon:a.icon||'📜',title:a.title,subtitle:[a.playerName,a.teamAbbr].filter(Boolean).join(' · '),detail:a.note||'A permanent achievement plaque from league history.',season:a.season||'',automatic:true}));
  (data.leagueExtras?.manualClassicGames||[]).forEach((g,i)=>artifacts.push({id:`museum-classic-${g.id||i}`,category:'Classic Games',display:'plaque',icon:'🎟️',title:g.title||'Instant Classic',subtitle:g.season||'CLASSIC GAME',detail:g.note||'A game manually preserved as part of league lore.',automatic:true}));
  const finals=(data.games||[]).filter(g=>g?.status==='Final');
  finals.filter(g=>g.walkoffVerified===true||Number(g.inning||9)>=12).slice(-12).forEach((g,i)=>artifacts.push({id:`museum-game-${g.id||g.finalizedAt||i}`,category:'Classic Games',display:'plaque',icon:g.walkoffVerified?'💥':'⏱️',title:g.walkoffVerified?'Walk-Off Artifact':'Extra-Inning Artifact',subtitle:gameLabel(g,teams),detail:g.walkoffVerified?'A verified walk-off preserved from the permanent game log.':`${g.inning} innings of baseball, preserved for the archive.`,season:g.seasonName||data.activeSeasonName||'',automatic:true}));
  (data.leagueExtras?.museumArtifacts||[]).forEach((m,i)=>artifacts.push({id:m.id||`museum-manual-${i}`,category:m.category||'Curator Picks',display:m.display||'plaque',icon:m.icon||'🏛️',title:m.title||'Museum Artifact',subtitle:m.subtitle||m.season||'CURATOR PICK',detail:m.note||m.detail||'',season:m.season||'',automatic:false,createdAt:m.createdAt}));
  const seen=new Set(); return artifacts.filter(a=>{const k=`${a.category}|${a.title}|${a.subtitle}`;if(seen.has(k))return false;seen.add(k);return true;}).sort((a,b)=>Number(a.automatic)-Number(b.automatic)||String(b.season||'').localeCompare(String(a.season||''),undefined,{numeric:true}));
}

export function museumWings(artifacts=[]){
  const order=['Championships','Legends','Records & Milestones','Classic Games','Fan Culture','Oddities','Curator Picks'];
  const map=new Map(); artifacts.forEach(a=>{if(!map.has(a.category))map.set(a.category,[]);map.get(a.category).push(a)});
  return [...map.entries()].sort((a,b)=>{const ai=order.indexOf(a[0]),bi=order.indexOf(b[0]);return (ai<0?99:ai)-(bi<0?99:bi)}).map(([name,items])=>({name,items}));
}
