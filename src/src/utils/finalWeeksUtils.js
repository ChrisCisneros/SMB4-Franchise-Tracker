import { divisionEliminationNumber, getPostseasonStatus, wildCardEliminationNumber } from './standingsUtils';

const n=v=>Number(v||0);
const gp=t=>n(t?.wins)+n(t?.losses);

export function stretchRunPhase(data={},teams=[]){
  const avg=teams.length?teams.reduce((s,t)=>s+gp(t),0)/teams.length:0;
  const playoffStarted=(data.games||[]).some(g=>g?.gameType==='playoff') || Boolean(data.playoffBracket?.al?.qf1?.awayTeamId||data.playoffBracket?.nl?.qf1?.awayTeamId||data.playoffBracket?.finals?.awayTeamId);
  const seasonComplete=teams.length>0&&teams.every(t=>gp(t)>=40);
  if(playoffStarted)return {id:'postseason',label:'NMLB POSTSEASON',tag:'NO TOMORROW',detail:'Every score moves the road to the Commissioner’s Trophy.',week:8};
  if(seasonComplete)return {id:'selection',label:'SELECTION SHOW',tag:'THE FIELD IS SET',detail:'The regular season is complete. Seeds, matchups and locked predictions take center stage.',week:8};
  if(avg>=35)return {id:'final-week',label:'NMLB FINAL WEEK',tag:'EVERY SCORE MATTERS',detail:'Clinch paths, elimination math and scoreboard watching own the league.',week:8};
  if(avg>=30)return {id:'push',label:'THE PUSH',tag:'ROAD TO OCTOBER',detail:'Week 7 turns every bubble result into a league-wide consequence.',week:7};
  return {id:'regular',label:'REGULAR SEASON',tag:'THE RACE IS BUILDING',detail:'The pennant picture is still taking shape.',week:Math.max(1,Math.ceil(avg/5)||1)};
}

export function buildProjectedField(playoffPicture=[]){
  return (playoffPicture||[]).map(p=>{
    const leaders=p.divisionLeaders||[];
    const leaderIds=new Set(leaders.map(t=>t.id));
    const wild=(p.wildcardTeams||[]).filter(t=>!leaderIds.has(t.id)).slice(0,Math.max(0,8-leaders.length));
    const seeds=[...leaders,...wild].slice(0,8);
    return {league:p.league,seeds:seeds.map((team,i)=>({seed:i+1,team,status:getPostseasonStatus(team,p)}))};
  });
}

export function buildStretchRunBoard(data={},teams=[],playoffPicture=[]){
  const phase=stretchRunPhase(data,teams);
  const pressure=[]; const clinched=[]; const eliminated=[]; const divisionOut=[];
  (playoffPicture||[]).forEach(p=>(p.leagueTeams||[]).forEach(team=>{
    const status=getPostseasonStatus(team,p);
    const divE=divisionEliminationNumber(team,p);
    const wcE=wildCardEliminationNumber(team,p);
    if(['z','y','x','w'].includes(status.marker))clinched.push({team,picture:p,status});
    if(status.marker==='e')eliminated.push({team,picture:p,status});
    else if(divE==='E')divisionOut.push({team,picture:p,status});
    const values=[divE,wcE].filter(v=>typeof v==='number');
    if(values.some(v=>v<=3))pressure.push({team,picture:p,status,divE,wcE,pressure:Math.min(...values)});
  }));
  pressure.sort((a,b)=>a.pressure-b.pressure || n(b.team.wins)-n(a.team.wins));
  const field=buildProjectedField(playoffPicture);
  const current=data.currentGame||data.activeGame||{};
  const liveIds=new Set([current.awayTeamId,current.homeTeamId].filter(Boolean));
  const livePressure=pressure.filter(x=>liveIds.has(x.team.id));
  const raceNightCount=new Set(pressure.map(x=>x.team.id)).size;
  return {
    phase,field,pressure,clinched,eliminated,divisionOut,
    raceNight:{active:phase.id==='push'||phase.id==='final-week',pressureTeams:raceNightCount,livePressure,possibleClinches:pressure.filter(x=>x.pressure===1).length,possibleEliminations:pressure.filter(x=>x.pressure===1).length},
    bubble:pressure.filter(x=>!['e','z','y'].includes(x.status.marker)).slice(0,8)
  };
}

export function postseasonGamePressure(game={},seriesMemory=[]){
  if(game?.gameType!=='playoff')return null;
  const series=seriesMemory.find(x=>x.id===game.playoffSeriesId)||null;
  const target=game.playoffSeriesId==='finals'||game.playoffSeriesId==='worldSeries'?4:2;
  const aw=series?.awayWins||0, hw=series?.homeWins||0, max=Math.max(aw,hw);
  const elimination=max===target-1;
  const tied=aw===hw;
  return {
    label:elimination?(target===4?'CHAMPIONSHIP POINT':'SEASON ON THE LINE'):tied?'SWING GAME':'PLAYOFF GAME',
    detail:elimination?'One result can end a season tonight.':tied?'The series balance can change with one game.':'Every inning adds to the series memory.',
    series
  };
}
