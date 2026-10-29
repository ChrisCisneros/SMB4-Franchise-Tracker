import { SEASON_LENGTH, WILD_CARD_TEAMS_PER_LEAGUE } from '../config/constants';
import { buildGameRecords, buildHeadToHead, buildTeamGameProfile } from './historyUtils';
import { buildLeagueRecords } from './recordsUtils';
import { makeSafePlayoffBracket } from './playoffUtils';
import { gamesRemaining, winningPctValue } from './standingsUtils';

const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,n));
const teamPct=(t)=>winningPctValue(t||{});
const gp=(t)=>Number(t?.wins||0)+Number(t?.losses||0);
const fmtPct=(n)=>Number.isFinite(n)?n.toFixed(3).replace(/^0/,''):'.000';
const hash=(text='')=>[...String(text)].reduce((n,c)=>((n*31)+c.charCodeAt(0))>>>0,7);

export function buildV4TeamMetrics(data={}, teams=[], playoffPicture=[]) {
  const games=(data.games||[]).filter(g=>g?.status==='Final');
  const teamMap=new Map(teams.map(t=>[t.id,t]));
  const h2h=buildHeadToHead(games,teams,data.seasonHistory||[]);
  const latestSnapshots=[...(data.leagueExtras?.standingsSnapshots||[])].sort((a,b)=>(Date.parse(b.createdAt)||0)-(Date.parse(a.createdAt)||0));
  const prior=latestSnapshots[0];
  const priorRanks=new Map((prior?.teams||[]).map((t,i)=>[t.teamId,t.rank??i+1]));
  const overall=[...teams].sort((a,b)=>teamPct(b)-teamPct(a)||Number(b.runDiff||0)-Number(a.runDiff||0));
  const currentRanks=new Map(overall.map((t,i)=>[t.id,i+1]));

  return teams.map(team=>{
    const profile=buildTeamGameProfile(team.id,games);
    const teamGames=games.filter(g=>g.awayTeamId===team.id||g.homeTeamId===team.id);
    let oppWin=0,oppGames=0;
    teamGames.forEach(g=>{
      const opp=teamMap.get(g.awayTeamId===team.id?g.homeTeamId:g.awayTeamId);
      if(!opp)return; const total=gp(opp); if(!total)return; oppWin+=teamPct(opp); oppGames++;
    });
    const sos=oppGames?oppWin/oppGames:0;
    const recent=[...teamGames].sort((a,b)=>(Date.parse(b.finalizedAt||b.date||'')||0)-(Date.parse(a.finalizedAt||a.date||'')||0)).slice(0,5);
    let recentWins=0,recentRF=0,recentRA=0;
    recent.forEach(g=>{const away=g.awayTeamId===team.id;const rf=Number(away?g.awayScore:g.homeScore)||0;const ra=Number(away?g.homeScore:g.awayScore)||0;recentRF+=rf;recentRA+=ra;if(rf>ra)recentWins++;});
    const streak=String(team.streak||'');
    const streakValue=(streak.startsWith('W')?1:streak.startsWith('L')?-1:0)*Number(streak.slice(1)||0);
    const momentum=clamp(50+(recentWins-2.5)*10+streakValue*4+(recentRF-recentRA)*1.2);
    const picture=playoffPicture.find(p=>p.league===team.league);
    const divisionLeader=picture?.divisionLeaders?.find(t=>t.division===team.division);
    const firstOut=picture?.wildcardTeams?.[WILD_CARD_TEAMS_PER_LEAGUE];
    const cutoff=picture?.cutoffTeam;
    const divisionMagic=divisionLeader?.id===team.id ? Math.max(0,SEASON_LENGTH+1-Number(team.wins||0)-Math.min(...(picture?.leagueTeams||[]).filter(t=>t.division===team.division&&t.id!==team.id).map(t=>Number(t.losses||0)), SEASON_LENGTH)) : null;
    const playoffMagic=firstOut ? Math.max(0,SEASON_LENGTH+1-Number(team.wins||0)-Number(firstOut.losses||0)) : null;
    const elim= cutoff && cutoff.id!==team.id ? Math.max(0,SEASON_LENGTH+1-Number(cutoff.wins||0)-Number(team.losses||0)) : null;
    const remaining=gamesRemaining(team);
    const projectedWins=Number(team.wins||0)+remaining*(gp(team)?teamPct(team):.5);
    const cutoffPace=cutoff ? Number(cutoff.wins||0)+gamesRemaining(cutoff)*(gp(cutoff)?teamPct(cutoff):.5) : SEASON_LENGTH*.5;
    const rdRate=gp(team)?Number(team.runDiff||0)/gp(team):0;
    const projectionScore=(projectedWins-cutoffPace)*13+rdRate*4+(momentum-50)*.35;
    const playoffProbability=clamp(50+projectionScore);
    const previousRank=priorRanks.get(team.id);
    const currentRank=currentRanks.get(team.id);
    const movement=previousRank?previousRank-currentRank:0;
    const homeGames=profile.homeWins+profile.homeLosses,awayGames=profile.awayWins+profile.awayLosses;
    return {team,profile,sos,recentWins,recentGames:recent.length,recentRF,recentRA,momentum,divisionMagic,playoffMagic,eliminationNumber:elim,playoffProbability,projectedWins,currentRank,previousRank,movement,homePct:homeGames?profile.homeWins/homeGames:0,awayPct:awayGames?profile.awayWins/awayGames:0,h2h:h2h.filter(r=>r.teamAId===team.id||r.teamBId===team.id)};
  }).sort((a,b)=>a.currentRank-b.currentRank);
}

export function personalityForMetric(m){
  const t=m.team; const diff=Number(t.runDiff||0); const p=teamPct(t);
  if(m.profile.longestWinStreak>=5) return {title:'Heat Check',icon:'🔥',detail:`${m.profile.longestWinStreak}-game win streak peak`};
  if(m.homePct>=.7 && m.profile.homeWins>=3) return {title:'Home Fortress',icon:'🏠',detail:`${m.profile.homeWins}-${m.profile.homeLosses} at home`};
  if(m.awayPct>=.65 && m.profile.awayWins>=3) return {title:'Road Warriors',icon:'🚌',detail:`${m.profile.awayWins}-${m.profile.awayLosses} away`};
  if(p>=.65 && diff>=20) return {title:'Juggernaut',icon:'💥',detail:'Winning and dominating run differential'};
  if(p>=.55 && diff<0) return {title:'Cardiac Club',icon:'❤️',detail:'Winning despite a negative run differential'};
  if(diff>=25) return {title:'Run Machine',icon:'⚡',detail:`${diff>0?'+':''}${diff} run differential`};
  if(m.momentum>=70) return {title:'Surging',icon:'📈',detail:`Momentum ${Math.round(m.momentum)}`};
  if(m.momentum<=30) return {title:'Searching',icon:'🧊',detail:`Momentum ${Math.round(m.momentum)}`};
  return {title:'Steady',icon:'⚾',detail:`${t.wins||0}-${t.losses||0} · ${fmtPct(p)}`};
}

export function buildGamesThatMatter(currentGame, metrics=[]){
  if(!currentGame?.awayTeamId||!currentGame?.homeTeamId)return null;
  const a=metrics.find(m=>m.team.id===currentGame.awayTeamId),h=metrics.find(m=>m.team.id===currentGame.homeTeamId); if(!a||!h)return null;
  let score=0,reasons=[];
  if(a.team.league===h.team.league){score+=15;reasons.push('same league');}
  if(a.team.division===h.team.division&&a.team.league===h.team.league){score+=25;reasons.push('division matchup');}
  if(Math.abs(a.playoffProbability-h.playoffProbability)<18){score+=12;reasons.push('similar playoff position');}
  if([a,h].some(x=>x.playoffProbability>=35&&x.playoffProbability<=70)){score+=20;reasons.push('bubble implications');}
  if([a,h].some(x=>x.momentum>=70)){score+=8;reasons.push('hot club involved');}
  return {score:clamp(score),reasons,away:a,home:h,label:score>=65?'MUST WATCH':score>=40?'IMPORTANT':'REGULAR'};
}

export function buildWinProbability(currentGame, teams=[]){
  if(!currentGame?.awayTeamId||!currentGame?.homeTeamId)return {home:50,away:50,leverage:'LOW',crowd:50,leverageScore:0};
  const away=teams.find(t=>t.id===currentGame.awayTeamId),home=teams.find(t=>t.id===currentGame.homeTeamId);
  const inning=Math.max(1,Number(currentGame.inning||1));
  const outs=Math.max(0,Math.min(3,Number(currentGame.outs||0)));
  const half=currentGame.half||'Top';
  const battingHome=half==='Bottom';
  const homeLead=Number(currentGame.homeScore||0)-Number(currentGame.awayScore||0);
  if(currentGame.status==='Final'){
    const homeProb=homeLead>0?100:homeLead<0?0:50;
    return {home:homeProb,away:100-homeProb,leverage:'FINAL',crowd:homeLead>0?100:20,leverageScore:0};
  }

  const onFirst=currentGame.bases?.first?1:0;
  const onSecond=currentGame.bases?.second?1:0;
  const onThird=currentGame.bases?.third?1:0;
  const baseThreat=(onFirst*.24)+(onSecond*.42)+(onThird*.64);
  const outPenalty=[1,.76,.42,.12][outs] ?? .12;
  const runnerImpact=baseThreat*outPenalty*(battingHome?1:-1);

  // Measure actual game progress by completed outs, not simply by inning number.
  // This keeps early leads meaningful without making a 2-run third-inning game feel decided.
  const completedOuts=Math.max(0,((inning-1)*6)+(battingHome?3:0)+outs);
  const regulationProgress=clamp(completedOuts/54,0,1);
  const progress=inning>9?1:regulationProgress;

  // A run is worth relatively little early and increasingly more as the final outs disappear.
  // Rough guide: a 2-run lead is only a moderate edge in the 3rd, strong in the 6th,
  // and overwhelming in the 9th unless the tying run is actively threatening.
  let perRunWeight=.20+1.10*Math.pow(progress,1.85);
  if(inning>9)perRunWeight=1.34+Math.min(.22,(inning-10)*.05);
  const scoreLogit=homeLead*perRunWeight;

  // Team quality is a pregame prior, not a live-game bulldozer.
  const homeGames=gp(home),awayGames=gp(away);
  const homePct=homeGames?teamPct(home):.5;
  const awayPct=awayGames?teamPct(away):.5;
  const homeRdRate=homeGames?Number(home?.runDiff||0)/homeGames:0;
  const awayRdRate=awayGames?Number(away?.runDiff||0)/awayGames:0;
  const strength=clamp((homePct-awayPct)*1.15+(homeRdRate-awayRdRate)*.055,-.42,.42);
  const homeField=.09;

  // Baserunners and batting half matter more as the game gets late, but should not create
  // wild early-inning swings by themselves.
  const runnerLogit=runnerImpact*(.18+progress*.62);
  const battingOpportunity=(battingHome?.055:-.015)*(1-progress);
  let logit=scoreLogit+runnerLogit+strength+homeField+battingOpportunity;

  // Late-game survival / walk-off context adds pressure only when the game is actually late.
  if(inning>=9){
    if(battingHome&&homeLead===0)logit+=.28;
    if(outs===2&&battingHome&&homeLead<0)logit-=.15*Math.min(3,Math.abs(homeLead));
    if(outs===2&&!battingHome&&homeLead>0)logit+=.16*Math.min(3,Math.abs(homeLead));
  }

  const logistic=1/(1+Math.exp(-logit));
  const homeProb=clamp(Math.round(logistic*100),1,99);
  const closeness=Math.max(0,1-Math.min(1,Math.abs(homeLead)/4));
  const traffic=Math.min(1,(baseThreat+outs*.14)/1.65);
  const leverageScore=clamp((progress*.54+closeness*.32+traffic*.14)*100);
  const leverage=leverageScore>=82?'EXTREME':leverageScore>=64?'HIGH':leverageScore>=40?'MEDIUM':'LOW';
  const crowd=clamp(48+homeLead*5+(battingHome?baseThreat*10:0)+(progress>=.75?7:0));
  return {home:homeProb,away:100-homeProb,leverage,crowd:Math.round(crowd),leverageScore};
}

export function buildGameExcitement(game){
  if(!game)return {score:0,label:'—',reasons:[]};
  const away=Number(game.awayScore||0),home=Number(game.homeScore||0),margin=Math.abs(away-home),innings=Math.max(9,Number(game.inning||9));
  let score=25,reasons=[];
  if(margin===1){score+=22;reasons.push('one-run game');} else if(margin===2){score+=12;reasons.push('two-run game');}
  if(innings>9){score+=Math.min(25,(innings-9)*7);reasons.push(`${innings} innings`);}
  if(game.walkoffVerified===true){score+=25;reasons.push('walk-off');}
  if(game.gameType==='playoff'){score+=15;reasons.push('postseason');}
  if((away+home)>=15){score+=8;reasons.push('slugfest');}
  score=clamp(score);
  return {score,label:score>=85?'INSTANT CLASSIC':score>=70?'THRILLER':score>=50?'GOOD ONE':'FINAL',reasons};
}

export function buildBestGames(data={},teams=[]){
  const records=buildGameRecords(data.games||[],teams,data.seasonHistory||[]);
  const automatic=records.games.map(g=>({...g,excitement:buildGameExcitement(g)})).sort((a,b)=>b.excitement.score-a.excitement.score);
  const manual=(data.leagueExtras?.manualClassicGames||[]).map(g=>({...g,manual:true,excitement:{score:Number(g.score||95),label:'MANUAL CLASSIC',reasons:[g.note||'Manually preserved classic']}}));
  return [...manual,...automatic].sort((a,b)=>b.excitement.score-a.excitement.score);
}

export function buildCinderellaRuns(history=[]){
  const rows=[];
  history.forEach(season=>{
    const b=makeSafePlayoffBracket(season.playoffBracket); const seeds=new Map();
    ['al','nl'].forEach(l=>[['qf1',1,8],['qf2',4,5],['qf3',3,6],['qf4',2,7]].forEach(([k,a,h])=>{const s=b[l][k];if(s.awayTeamId)seeds.set(s.awayTeamId,a);if(s.homeTeamId)seeds.set(s.homeTeamId,h);}));
    const finalists=[b.finals?.awayTeamId,b.finals?.homeTeamId].filter(Boolean);
    finalists.forEach(id=>{const t=(season.teams||[]).find(x=>x.id===id);const seed=seeds.get(id);if(seed>=5)rows.push({season:season.name,team:t,seed,champion:b.finals?.winnerTeamId===id,type:b.finals?.winnerTeamId===id?'Champion':'World Series'});});
  });
  return rows.sort((a,b)=>Number(b.seed||0)-Number(a.seed||0)||Number(b.champion)-Number(a.champion));
}

export function buildTeamEras(history=[],teams=[]){
  const records=buildLeagueRecords(history,teams); const rows=[];
  records.teamStats.forEach(stat=>{
    const seasons=records.seasonEntries.filter(e=>e.teamId===stat.teamId).sort((a,b)=>(Date.parse(a.archivedAt)||0)-(Date.parse(b.archivedAt)||0));
    let run=[]; const flush=()=>{if(run.length>=2)rows.push({teamId:stat.teamId,abbr:stat.abbr,start:run[0].seasonName,end:run[run.length-1].seasonName,seasons:run.length,playoffs:run.filter(x=>x.madePlayoffs).length,titles:run.filter(x=>x.champion).length});run=[];};
    seasons.forEach(s=>{if(s.madePlayoffs||s.champion)run.push(s);else flush();}); flush();
  });
  return rows.sort((a,b)=>b.titles-a.titles||b.seasons-a.seasons||b.playoffs-a.playoffs);
}

export function buildFirstMilestones(history=[],teams=[]){
  const chronological=[...history].sort((a,b)=>(Date.parse(a.archivedAt)||0)-(Date.parse(b.archivedAt)||0));
  const out=[]; const seen={playoffs:new Set(),pennant:new Set(),title:new Set(),seed:new Set()};
  chronological.forEach(season=>{const b=makeSafePlayoffBracket(season.playoffBracket);const qfIds=new Set(['al','nl'].flatMap(l=>['qf1','qf2','qf3','qf4'].flatMap(k=>[b[l][k]?.awayTeamId,b[l][k]?.homeTeamId]).filter(Boolean)));
    qfIds.forEach(id=>{if(!seen.playoffs.has(id)){seen.playoffs.add(id);out.push({teamId:id,season:season.name,type:'First Playoff Appearance'});}});
    [b.al?.lc?.winnerTeamId,b.nl?.lc?.winnerTeamId].filter(Boolean).forEach(id=>{if(!seen.pennant.has(id)){seen.pennant.add(id);out.push({teamId:id,season:season.name,type:'First League Pennant'});}});
    const cid=season.championTeamId||b.finals?.winnerTeamId;if(cid&&!seen.title.has(cid)){seen.title.add(cid);out.push({teamId:cid,season:season.name,type:'First Championship'});}
  });
  const map=new Map(teams.map(t=>[t.id,t])); history.forEach(s=>(s.teams||[]).forEach(t=>{if(!map.has(t.id))map.set(t.id,t);}));
  return out.map(x=>({...x,team:map.get(x.teamId)}));
}

export function buildLeagueFirsts(history=[],games=[],teams=[]){
  const first=[]; const chronologicalGames=[...(games||[])].filter(g=>g.status==='Final').sort((a,b)=>(Date.parse(a.finalizedAt||a.date||'')||0)-(Date.parse(b.finalizedAt||b.date||'')||0));
  const firstExtra=chronologicalGames.find(g=>Number(g.inning||9)>9); if(firstExtra)first.push({title:'First Recorded Extra-Inning Game',detail:`${firstExtra.date||''} · ${firstExtra.inning} innings`});
  const firstWalk=chronologicalGames.find(g=>g.walkoffVerified===true); if(firstWalk)first.push({title:'First Verified Walk-Off',detail:firstWalk.date||''});
  const firstShut=chronologicalGames.find(g=>Number(g.awayScore||0)===0||Number(g.homeScore||0)===0); if(firstShut)first.push({title:'First Recorded Shutout',detail:firstShut.date||''});
  const oldest=[...history].sort((a,b)=>(Date.parse(a.archivedAt)||0)-(Date.parse(b.archivedAt)||0))[0]; if(oldest)first.unshift({title:'First Archived Champion',detail:`${oldest.championAbbr||'TBD'} · ${oldest.name}`});
  return first;
}

export function buildSeasonGrades(teams=[],history=[]){
  const histAvg=new Map(); const counts=new Map();
  history.forEach(s=>(s.teams||[]).forEach(t=>{histAvg.set(t.id,(histAvg.get(t.id)||0)+teamPct(t));counts.set(t.id,(counts.get(t.id)||0)+1);}));
  return teams.map(t=>{const p=teamPct(t),base=counts.get(t.id)?histAvg.get(t.id)/counts.get(t.id):.5;const delta=p-base;let grade='C';if(delta>=.16)grade='A+';else if(delta>=.10)grade='A';else if(delta>=.05)grade='B+';else if(delta>=.015)grade='B';else if(delta<=-.16)grade='F';else if(delta<=-.10)grade='D';else if(delta<=-.05)grade='C-';return {team:t,grade,delta,baseline:base,pct:p};}).sort((a,b)=>b.delta-a.delta);
}

export function buildRecordChases(teams=[],history=[]){
  const records=buildLeagueRecords(history,teams);
  const bestWins=Math.max(0,...(records.seasonEntries||[]).map(e=>Number(e.wins||0)));
  return [...teams].filter(t=>gp(t)>0).map(t=>({team:t,targetWins:bestWins,needed:Math.max(0,bestWins-Number(t.wins||0)),possible:Number(t.wins||0)+gamesRemaining(t)>=bestWins})).filter(x=>x.possible).sort((a,b)=>a.needed-b.needed).slice(0,8);
}

export function buildTeamOfWeek(metrics=[]){
  return [...metrics].filter(m=>m.recentGames>0).sort((a,b)=>b.recentWins-a.recentWins||(b.recentRF-b.recentRA)-(a.recentRF-a.recentRA))[0]||null;
}

export function buildNoHitWatch(currentGame,teams=[]){
  if(!currentGame?.awayTeamId||!currentGame?.homeTeamId)return [];
  const inning=Number(currentGame.inning||1); if(inning<5)return [];
  const a=teams.find(t=>t.id===currentGame.awayTeamId),h=teams.find(t=>t.id===currentGame.homeTeamId); const out=[];
  if(Number(currentGame.awayHits||0)===0)out.push({pitching:h,batter:a,label:'NO-HIT WATCH',perfect:Number(currentGame.awayErrors||0)===0});
  if(Number(currentGame.homeHits||0)===0)out.push({pitching:a,batter:h,label:'NO-HIT WATCH',perfect:Number(currentGame.homeErrors||0)===0});
  return out.filter(x=>x.pitching&&x.batter);
}

export function buildFakeFanPolls(metrics=[],activeSeason='Season 4'){
  const top=[...metrics].sort((a,b)=>b.playoffProbability-a.playoffProbability||b.momentum-a.momentum).slice(0,4); if(top.length<2)return [];
  const values=top.map(m=>35+m.playoffProbability*.45+m.momentum*.2+(hash(activeSeason+m.team.abbr)%9)); const total=values.reduce((a,b)=>a+b,0)||1;
  const shares=values.map(v=>Math.round(v/total*100)); const adjust=100-shares.reduce((a,b)=>a+b,0); if(shares.length)shares[0]+=adjust;
  return [{question:'Who looks most dangerous right now?',options:top.map((m,i)=>({team:m.team,pct:shares[i]})),votes:1200+(hash(activeSeason)%4200)}];
}

export function buildAnchorPicks(currentGame,metrics=[]){
  if(!currentGame?.awayTeamId||!currentGame?.homeTeamId)return [];
  const a=metrics.find(m=>m.team.id===currentGame.awayTeamId),h=metrics.find(m=>m.team.id===currentGame.homeTeamId);if(!a||!h)return [];
  const anchors=['Maya Cruz','Tommy Lane','Riley Brooks'];
  return anchors.map((name,i)=>{const tilt=(h.playoffProbability-a.playoffProbability)+(h.momentum-a.momentum)*.3;const pick=(tilt+(hash(name+a.team.abbr+h.team.abbr)%21-10))>=0?h:a;return {name,pick:pick.team,reason:pick.momentum>=65?'momentum':pick.playoffProbability>=60?'season form':'matchup lean'};});
}

export function buildTeamNicknames(metrics=[]){
  return metrics.map(m=>{const p=personalityForMetric(m); const names={Juggernaut:'The Machine','Home Fortress':'The Home Guard','Road Warriors':'Road Dogs','Cardiac Club':'The Cardiac Kids','Run Machine':'The Run Factory','Surging':'The Heat Wave','Searching':'The Ice Box','Heat Check':'The Streakers',Steady:'The Steady Hands'};return {team:m.team,nickname:names[p.title]||`The ${m.team.abbr}`,personality:p};});
}
