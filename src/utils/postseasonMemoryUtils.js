function finalPlayoffGames(data={}){
  const season=data.activeSeasonName||'Season';
  return (data.games||[]).filter(g=>g&&g.status==='Final'&&g.gameType==='playoff'&&(!g.seasonName||g.seasonName===season));
}
function teamMap(teams=[]){return new Map((teams||[]).map(t=>[t.id,t]));}
function scoreFor(game,side){return Number(side==='away'?game.awayScore:game.homeScore)||0;}
function winnerId(game){return scoreFor(game,'away')>scoreFor(game,'home')?game.awayTeamId:game.homeTeamId;}
function seriesLabel(id=''){
  if(id==='finals'||id==='worldSeries')return 'World Series';
  const league=id.startsWith('al_')?'AL':id.startsWith('nl_')?'NL':'';
  if(id.includes('_qf'))return `${league} Quarterfinals`;
  if(id.includes('_sf'))return `${league}DS`;
  if(id.includes('_lc'))return `${league}CS`;
  return 'Postseason Series';
}
function bracketSeries(data,id){
  const root=data.playoffBracket||{};
  if(root?.[id])return root[id];
  const stack=[root];
  while(stack.length){const node=stack.pop();if(!node||typeof node!=='object')continue;if(node.id===id)return node;for(const v of Object.values(node)){if(v&&typeof v==='object')stack.push(v)}}
  return null;
}
function gameDrama(game){
  const a=scoreFor(game,'away'),h=scoreFor(game,'home'),margin=Math.abs(a-h),total=a+h;
  let score=44+Math.max(0,22-margin*5)+Math.min(14,total*1.2);
  if(margin===1)score+=12;
  if(game.innings&&Number(game.innings)>9)score+=8;
  return Math.max(35,Math.min(99,Math.round(score)));
}
export function buildPostseasonSeriesMemory(data={},teams=[]){
  const map=teamMap(teams), groups=new Map();
  finalPlayoffGames(data).forEach(g=>{const id=g.playoffSeriesId||'postseason';if(!groups.has(id))groups.set(id,[]);groups.get(id).push(g)});
  return [...groups.entries()].map(([id,games])=>{
    games.sort((a,b)=>(Date.parse(a.date||a.createdAt||0)||0)-(Date.parse(b.date||b.createdAt||0)||0));
    const wins={}; games.forEach(g=>{const w=winnerId(g);wins[w]=(wins[w]||0)+1});
    const last=games.at(-1), series=bracketSeries(data,id)||{};
    const awayId=series.awayTeamId||games[0]?.awayTeamId, homeId=series.homeTeamId||games[0]?.homeTeamId;
    const away=map.get(awayId),home=map.get(homeId),aw=wins[awayId]||0,hw=wins[homeId]||0;
    const leader=aw===hw?null:(aw>hw?away:home), trailer=aw===hw?null:(aw>hw?home:away);
    const lastWinner=map.get(last?winnerId(last):null), lastMargin=last?Math.abs(scoreFor(last,'away')-scoreFor(last,'home')):0;
    const winner=map.get(series.winnerTeamId)||null;
    const avgDrama=games.length?Math.round(games.reduce((n,g)=>n+gameDrama(g),0)/games.length):0;
    const close=games.filter(g=>Math.abs(scoreFor(g,'away')-scoreFor(g,'home'))<=2).length;
    const rating=Math.min(10,Math.max(5,Number((5.7+games.length*.55+close*.45+avgDrama/100).toFixed(1))));
    let narrative=games.length?`${lastWinner?.abbr||'A club'} took the latest game${lastMargin<=2?' in a pressure finish':''}.`:'Series awaiting first pitch.';
    if(winner)narrative=`${winner.abbr} closed the series and owns the final word.`;
    else if(leader)narrative+=` ${leader.abbr} holds the edge over ${trailer?.abbr||'the opposition'}, ${Math.max(aw,hw)}-${Math.min(aw,hw)}.`;
    else if(games.length)narrative+=' The series is level and the pressure resets.';
    return {id,label:seriesLabel(id),games,away,home,awayWins:aw,homeWins:hw,leader,winner,lastWinner,avgDrama,rating,narrative,turningPoint:[...games].sort((a,b)=>gameDrama(b)-gameDrama(a))[0]||null};
  }).sort((a,b)=>b.games.length-a.games.length);
}
export function buildPostseasonNightlyShow(data={},teams=[]){
  const map=teamMap(teams), games=finalPlayoffGames(data);
  if(!games.length)return null;
  const latest=[...games].sort((a,b)=>(Date.parse(b.date||b.createdAt||0)||0)-(Date.parse(a.date||a.createdAt||0)||0))[0];
  const stamp=latest.date||latest.createdAt||'';
  const same=games.filter(g=>(g.date||g.createdAt||'')===stamp);
  const best=[...same].sort((a,b)=>gameDrama(b)-gameDrama(a))[0]||latest;
  const w=map.get(winnerId(best)), l=map.get(winnerId(best)===best.awayTeamId?best.homeTeamId:best.awayTeamId);
  return {date:stamp,games:same,bestGame:best,bestDrama:gameDrama(best),headline:`${w?.abbr||'Winner'} owns the night`,detail:`${w?.abbr||'The winner'} beat ${l?.abbr||'the opposition'} ${scoreFor(best,'away')}-${scoreFor(best,'home')} in the night's highest-drama game.`,series:buildPostseasonSeriesMemory(data,teams).slice(0,4)};
}
export function buildAnalystReputation(data={},teams=[]){
  const locked=data.leagueExtras?.nmlbLockedPredictions;
  const analysts=locked?.analysts||[]; if(!analysts.length)return [];
  const champId=data.championTeamId||data.playoffBracket?.finals?.winnerTeamId;
  const map=teamMap(teams), champ=map.get(champId);
  return analysts.map(a=>{
    let score=0; if(champ&&a.champion===champ.abbr)score+=3;
    const alive=new Set((teams||[]).filter(t=>!t.postseasonEliminated).map(t=>t.abbr));
    const pickAlive=alive.has(a.champion);
    if(pickAlive)score+=1;
    return {...a,score,verdict:champ?(a.champion===champ.abbr?'NAILED THE CHAMPION':'MISSED THE CHAMPION'):(pickAlive?'PICK STILL ALIVE':'PICK IN TROUBLE')};
  }).sort((a,b)=>b.score-a.score);
}
export function buildPostseasonMythology(data={},teams=[]){
  const map=teamMap(teams), games=finalPlayoffGames(data), stats=new Map();
  games.forEach(g=>[g.awayTeamId,g.homeTeamId].forEach(id=>{if(!stats.has(id))stats.set(id,{gp:0,w:0,closeW:0,runs:0});const s=stats.get(id);s.gp++;s.runs+=id===g.awayTeamId?scoreFor(g,'away'):scoreFor(g,'home');if(winnerId(g)===id){s.w++;if(Math.abs(scoreFor(g,'away')-scoreFor(g,'home'))<=2)s.closeW++;}}));
  return [...stats.entries()].map(([id,s])=>{const team=map.get(id);let label='POSTSEASON TESTED';if(s.gp>=2&&s.w===s.gp)label='TEAM OF DESTINY';else if(s.closeW>=2)label='PRESSURE PROOF';else if(s.gp>=2&&s.w===0)label='POSTSEASON HEARTBREAK';else if(s.w>s.gp/2)label='OCTOBER RISER';return {team,label,detail:`${s.w}-${s.gp-s.w} this postseason · ${s.closeW} close-game wins`};}).filter(x=>x.team).sort((a,b)=>a.label.localeCompare(b.label));
}
export function buildHistoricalComparisons(data={},teams=[]){
  const history=data.seasonHistory||[]; if(!history.length)return [];
  return (teams||[]).map(team=>{
    const gp=Number(team.wins||0)+Number(team.losses||0); if(!gp)return null;
    let best=null;
    history.forEach(season=>{const old=(season.teams||[]).find(t=>t.abbr===team.abbr);if(!old)return;const oldGp=Number(old.wins||0)+Number(old.losses||0);if(!oldGp)return;const currentPct=Number(team.wins||0)/gp, oldPct=Number(old.wins||0)/oldGp, delta=currentPct-oldPct;if(!best||Math.abs(delta)<Math.abs(best.delta))best={season:season.seasonName||season.name||'Past season',old,delta};});
    if(!best)return null;return {team,season:best.season,detail:`Through ${gp} games, ${team.abbr} is ${best.delta>=0?'ahead of':'behind'} its ${best.season} winning pace by ${Math.abs(best.delta*100).toFixed(1)} points.`};
  }).filter(Boolean).slice(0,6);
}
export function buildPostseasonMemoryCards(data={},teams=[]){
  const map=teamMap(teams);
  return finalPlayoffGames(data).map(g=>{const w=map.get(winnerId(g)),l=map.get(winnerId(g)===g.awayTeamId?g.homeTeamId:g.awayTeamId),drama=gameDrama(g);return {id:`memory-${g.id}`,game:g,importance:drama>=90?'YOU HAD TO BE THERE':drama>=80?'INSTANT CLASSIC':drama>=68?'POSTSEASON MEMORY':'PLAYOFF NIGHT',headline:`${w?.abbr||'Winner'} ${scoreFor(g,'away')}-${scoreFor(g,'home')} ${l?.abbr||''}`,detail:`${seriesLabel(g.playoffSeriesId)} · Drama ${drama}/100`,drama};}).sort((a,b)=>b.drama-a.drama);
}
export function buildPostseasonRivalryHeat(data={},teams=[]){
  const map=teamMap(teams), pairs=new Map();
  const all=[...finalPlayoffGames(data)];
  (data.seasonHistory||[]).forEach(season=>(season.games||[]).filter(g=>g?.status==='Final'&&g.gameType==='playoff').forEach(g=>all.push(g)));
  all.forEach(g=>{const ids=[g.awayTeamId,g.homeTeamId].sort();if(!ids[0]||!ids[1])return;const key=ids.join('|');if(!pairs.has(key))pairs.set(key,{ids,games:0,close:0,meetings:new Set()});const p=pairs.get(key);p.games++;if(Math.abs(scoreFor(g,'away')-scoreFor(g,'home'))<=2)p.close++;p.meetings.add(g.playoffSeriesId||g.seasonName||'postseason');});
  return [...pairs.values()].map(p=>{const a=map.get(p.ids[0]),b=map.get(p.ids[1]);const heat=Math.min(100,28+p.games*9+p.close*8+p.meetings.size*7);return {a,b,heat,label:heat>=80?'WHITE HOT':heat>=60?'HEATING UP':heat>=45?'PERSONAL':'BUILDING',detail:`${p.games} postseason games · ${p.close} decided by 2 or fewer`};}).filter(x=>x.a&&x.b).sort((a,b)=>b.heat-a.heat).slice(0,8);
}
