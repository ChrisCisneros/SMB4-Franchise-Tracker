import { SEASON_LENGTH, WILD_CARD_TEAMS_PER_LEAGUE } from '../config/constants';
import { buildFanUniverse, buildMerch, getSeasonPulse } from './fandomUtils';
import { buildV4TeamMetrics } from './v4Utils';
import { getPostseasonStatus, isDivisionEliminated, sortStandingsTeams, divisionEliminationNumber, wildCardEliminationNumber, hasClinchedDivision, hasClinchedTopLeagueSeed } from './standingsUtils';

const n=v=>Number(v||0);
const gp=t=>n(t?.wins)+n(t?.losses);
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));

export function buildPlayoffPictureFromTeams(data={},teams=[]){
  return (data.leagues||['AL','NL']).map(league=>{
    const leagueTeams=(teams||[]).filter(t=>t.league===league);
    const divisionLeaders=(data.divisions||['East','Central','West']).map(division=>{
      const group=sortStandingsTeams(leagueTeams.filter(t=>t.division===division));
      return group[0]?{...group[0],division}:null;
    }).filter(Boolean);
    const seededDivisionLeaders=sortStandingsTeams(divisionLeaders);
    const ids=new Set(seededDivisionLeaders.map(t=>t.id));
    const wildcardTeams=sortStandingsTeams(leagueTeams.filter(t=>!ids.has(t.id)));
    return {league,leagueTeams,divisionLeaders:seededDivisionLeaders,wildcardTeams,cutoffTeam:wildcardTeams[WILD_CARD_TEAMS_PER_LEAGUE-1]||null};
  });
}

export function captureRaceTransitions(data={},beforeTeams=[],afterTeams=[]){
  const before=buildPlayoffPictureFromTeams(data,beforeTeams);
  const after=buildPlayoffPictureFromTeams(data,afterTeams);
  const events=[];
  for(const picture of after){
    const prior=before.find(p=>p.league===picture.league);
    for(const team of picture.leagueTeams||[]){
      const oldTeam=(prior?.leagueTeams||[]).find(t=>t.id===team.id)||team;
      const oldStatus=getPostseasonStatus(oldTeam,prior||picture);
      const nextStatus=getPostseasonStatus(team,picture);
      const oldDivOut=isDivisionEliminated(oldTeam,prior||picture);
      const nextDivOut=isDivisionEliminated(team,picture);
      const oldTop=hasClinchedTopLeagueSeed(oldTeam,prior||picture);
      const nextTop=hasClinchedTopLeagueSeed(team,picture);
      const oldDivision=hasClinchedDivision(oldTeam,prior||picture);
      const nextDivision=hasClinchedDivision(team,picture);
      const stamp=new Date().toISOString();
      const base={createdAt:stamp,teamId:team.id,teamAbbr:team.abbr,league:picture.league,division:team.division,record:`${team.wins}-${team.losses}`};
      if(nextDivision&&!oldDivision) events.push({...base,id:`race-${Date.now()}-${team.id}-y`,marker:'y',label:'DIVISION CLINCHED',headline:`${team.abbr} clinches the ${picture.league} ${team.division}`,detail:`${team.abbr} has mathematically secured the division crown.`,major:true});
      if(nextTop&&!oldTop) events.push({...base,id:`race-${Date.now()}-${team.id}-z`,marker:'z',label:'NO. 1 SEED CLINCHED',headline:`${team.abbr} locks the ${picture.league} No. 1 seed`,detail:`${team.abbr} has mathematically secured the league's top seed.`,major:true});
      if(['x','w','e'].includes(nextStatus.marker)&&nextStatus.marker!==oldStatus.marker){
        const map={w:['WILD CARD CLINCHED',`${team.abbr} clinches a ${picture.league} Wild Card berth`],x:['PLAYOFF BERTH CLINCHED',`${team.abbr} punches its ticket to October`],e:['POSTSEASON ELIMINATION',`${team.abbr} is eliminated from postseason contention`]};
        const [label,headline]=map[nextStatus.marker];
        events.push({...base,id:`race-${Date.now()}-${team.id}-${nextStatus.marker}`,marker:nextStatus.marker,label,headline,detail:nextStatus.detail,major:false});
      }
      if(nextDivOut&&!oldDivOut&&nextStatus.marker!=='e') events.push({...base,id:`race-${Date.now()}-${team.id}-divout`,marker:'E-DIV',label:'DIVISION ELIMINATION',headline:`${team.abbr} is eliminated from the ${picture.league} ${team.division} race`,detail:'The division path is closed, but the Wild Card remains alive.',major:false});
    }
  }
  return events;
}

export function buildFinalWeekCommand(data={},teams=[],playoffPicture=[]){
  const pulse=getSeasonPulse(data,teams);
  const rows=[]; let claimed=0; let eliminated=0;
  for(const picture of playoffPicture||[]){
    for(const team of picture.leagueTeams||[]){
      const status=getPostseasonStatus(team,picture);
      const divE=divisionEliminationNumber(team,picture);
      const wcE=wildCardEliminationNumber(team,picture);
      if(['z','y','x','w'].includes(status.marker)) claimed++;
      if(status.marker==='e') eliminated++;
      let label='IN THE HUNT',detail='Still writing the path to October',tone='live';
      if(status.marker==='z'){label='NO. 1 SEED LOCKED';detail='League path secured';tone='clinched';}
      else if(status.marker==='y'){label='DIVISION CHAMPION';detail='Division race is over';tone='clinched';}
      else if(status.marker==='x'||status.marker==='w'){label='OCTOBER BOUND';detail=status.label;tone='clinched';}
      else if(status.marker==='e'){label='ELIMINATED';detail='Postseason path is closed';tone='out';}
      else {
        const nums=[divE,wcE].filter(v=>typeof v==='number');
        const pressure=nums.length?Math.min(...nums):99;
        if(pressure===1){label='SEASON ON THE LINE';detail='One result can change everything';tone='danger';}
        else if(pressure<=3){label='HIGH PRESSURE';detail=`Race number: ${pressure}`;tone='pressure';}
        else if(isDivisionEliminated(team,picture)){label='WILD CARD OR BUST';detail='Division route is closed';tone='pressure';}
      }
      const divisionLeader=(picture.divisionLeaders||[]).find(x=>x.division===team.division)||null;
      const firstOut=(picture.wildcardTeams||[])[WILD_CARD_TEAMS_PER_LEAGUE]||null;
      const isDivisionLeader=divisionLeader?.id===team.id;
      const inWildCard=(picture.wildcardTeams||[]).slice(0,WILD_CARD_TEAMS_PER_LEAGUE).some(x=>x.id===team.id);
      const divisionRivals=(picture.leagueTeams||[]).filter(x=>x.division===team.division&&x.id!==team.id);
      const divisionMagic=isDivisionLeader&&divisionRivals.length
        ? Math.max(0,...divisionRivals.map(r=>SEASON_LENGTH+1-n(team.wins)-n(r.losses)))
        : null;
      const berthMagic=(isDivisionLeader||inWildCard)&&firstOut
        ? Math.max(0,SEASON_LENGTH+1-n(team.wins)-n(firstOut.losses))
        : null;
      let watchTeam=null;
      if(!['z','y','x','w','e'].includes(status.marker)){
        if(!isDivisionLeader&&divisionLeader) watchTeam=divisionLeader;
        else if(firstOut&&firstOut.id!==team.id) watchTeam=firstOut;
      }
      rows.push({team,picture,status,divE,wcE,divisionMagic,berthMagic,watchTeam,label,detail,tone,gamesLeft:Math.max(0,SEASON_LENGTH-gp(team))});
    }
  }
  const totalSpots=Math.min(16,(playoffPicture||[]).reduce((s,p)=>s+Math.min(8,(p.leagueTeams||[]).length),0));
  const unresolved=Math.max(0,totalSpots-claimed);
  const pressure=[...rows].filter(r=>['danger','pressure'].includes(r.tone)).sort((a,b)=>Math.min(typeof a.divE==='number'?a.divE:99,typeof a.wcE==='number'?a.wcE:99)-Math.min(typeof b.divE==='number'?b.divE:99,typeof b.wcE==='number'?b.wcE:99));
  let events=(data.leagueExtras?.raceEvents||[]).slice(0,12);
  if(!events.length&&data.lastFinalGame?.winnerTeamId){
    const winnerRow=rows.find(r=>r.team.id===data.lastFinalGame.winnerTeamId);
    if(winnerRow){
      const derived=[];
      if(hasClinchedDivision(winnerRow.team,winnerRow.picture)) derived.push({id:`derived-${winnerRow.team.id}-y`,teamId:winnerRow.team.id,teamAbbr:winnerRow.team.abbr,marker:'y',label:'DIVISION CLINCHED',headline:`${winnerRow.team.abbr} clinches the ${winnerRow.picture.league} ${winnerRow.team.division}`,detail:`Latest final: ${data.lastFinalGame.awayScore}-${data.lastFinalGame.homeScore}`,record:`${winnerRow.team.wins}-${winnerRow.team.losses}`,major:true});
      if(hasClinchedTopLeagueSeed(winnerRow.team,winnerRow.picture)) derived.push({id:`derived-${winnerRow.team.id}-z`,teamId:winnerRow.team.id,teamAbbr:winnerRow.team.abbr,marker:'z',label:'NO. 1 SEED CLINCHED',headline:`${winnerRow.team.abbr} locks the ${winnerRow.picture.league} No. 1 seed`,detail:`Latest final: ${data.lastFinalGame.awayScore}-${data.lastFinalGame.homeScore}`,record:`${winnerRow.team.wins}-${winnerRow.team.losses}`,major:true});
      if(!derived.length&&['x','w'].includes(winnerRow.status.marker)) derived.push({id:`derived-${winnerRow.team.id}-${winnerRow.status.marker}`,teamId:winnerRow.team.id,teamAbbr:winnerRow.team.abbr,marker:winnerRow.status.marker,label:winnerRow.status.label.toUpperCase(),headline:`${winnerRow.team.abbr} · ${winnerRow.status.detail}`,detail:`Latest final: ${data.lastFinalGame.awayScore}-${data.lastFinalGame.homeScore}`,record:`${winnerRow.team.wins}-${winnerRow.team.losses}`,major:false});
      events=derived;
    }
  }
  return {pulse,rows,claimed,totalSpots,unresolved,eliminated,pressure,events,selectionReady:unresolved===0&&totalSpots>0};
}

export function buildPostseasonReadiness(data={},teams=[],playoffPicture=[]){
  const metrics=buildV4TeamMetrics(data,teams,playoffPicture);
  return metrics.map(m=>{
    const picture=(playoffPicture||[]).find(p=>p.league===m.team.league);
    const status=getPostseasonStatus(m.team,picture);
    const pct=gp(m.team)?n(m.team.wins)/gp(m.team):.5;
    const streak=String(m.team.streak||'');
    const streakBoost=streak.startsWith('W')?Math.min(10,n(streak.slice(1))*2):streak.startsWith('L')?-Math.min(10,n(streak.slice(1))*2):0;
    const score=Math.round(clamp(30+pct*35+clamp(n(m.team.runDiff),-50,50)*.28+(n(m.momentum)-50)*.22+streakBoost+(['z','y'].includes(status.marker)?12:['x','w'].includes(status.marker)?7:0)));
    const label=score>=85?'OCTOBER READY':score>=72?'DANGEROUS':score>=58?'LIVE THREAT':score>=44?'VOLATILE':'NEEDS A RUN';
    return {...m,status,readiness:score,label};
  }).sort((a,b)=>b.readiness-a.readiness);
}

export function buildLeaguePulse65(data={},teams=[],playoffPicture=[]){
  const fans=buildFanUniverse(data,teams,playoffPicture);
  const ready=buildPostseasonReadiness(data,teams,playoffPicture);
  const command=buildFinalWeekCommand(data,teams,playoffPicture);
  const merch=buildMerch(data,teams,playoffPicture);
  const loud=[...fans.teamStates].sort((a,b)=>b.marketHeat-a.marketHeat)[0];
  const underdog=[...fans.teamStates].filter(x=>x.actual<.55&&x.actual>.4).sort((a,b)=>b.momentum-a.momentum)[0];
  const hotMerch=[...merch].sort((a,b)=>n(b.sales7d)-n(a.sales7d))[0]||merch[0];
  const rivalry=fans.rivalries?.[0];
  return {
    leagueMood:fans.leagueMood,
    hottestStory:command.events[0]?.headline||(ready[0]?`${ready[0].team.abbr} is setting the October pace`:'The league is waiting for its next defining moment'),
    loudest:loud,
    pressure:command.pressure[0]||null,
    underdog,
    hotMerch,
    rivalry,
    readiness:ready.slice(0,5),
  };
}

const FAN_PERSONAS=[
  ['The Believer','@NeverOverUntilItsOver','OPTIMIST'],['The Doomer','@SeenThisMovie','DOOMER'],['The Scorebook','@PencilNeverLies','OLD-HEAD'],['The Numbers Fan','@RunDiffEnjoyer','STATS NERD'],['The Heckler','@SectionNoise','TRASH TALKER'],['The Collector','@TicketStubVault','COLLECTOR']
];
export function buildFanInteractions65(data={},teams=[],playoffPicture=[]){
  const {teamStates}=buildFanUniverse(data,teams,playoffPicture);
  const latest=(data.games||[]).filter(g=>g?.status==='Final')[0]||data.lastFinalGame||null;
  const winner=latest?teams.find(t=>t.id===latest.winnerTeamId):null;
  const loser=latest?teams.find(t=>t.id===latest.loserTeamId):null;
  const personas=FAN_PERSONAS.map((p,i)=>{
    const state=teamStates[(i+(winner?teams.findIndex(t=>t.id===winner.id):0)+teamStates.length)%Math.max(1,teamStates.length)]||teamStates[0];
    const team=state?.team;
    const lines=[`${team?.abbr||'NMLB'} fans are acting like this is completely normal. It is not.`,`${team?.abbr||'NMLB'} discourse is going to be unbearable tonight.`,`${team?.abbr||'NMLB'} needs one clean week and I will start believing.`,`${team?.abbr||'NMLB'} has me checking the standings after every final.`];
    return {id:`persona-${i}`,name:p[0],handle:p[1],role:p[2],team,text:lines[(i+n(team?.wins))%lines.length]};
  });
  const calls=[];
  if(winner) calls.push({caller:'Marty from the upper deck',team:winner,text:`I do not care how it looked. ${winner.abbr} got the win and I am printing the playoff bracket.`});
  if(loser) calls.push({caller:'Jess on Line 2',team:loser,text:`Somebody explain why ${loser.abbr} keeps making every game feel like a dental procedure.`});
  const pressure=buildFinalWeekCommand(data,teams,playoffPicture).pressure[0];
  if(pressure) calls.push({caller:'Anonymous nervous season-ticket holder',team:pressure.team,text:`Do not tell me the odds. Just tell me what ${pressure.team.abbr} has to do tonight.`});
  return {personas,calls,reactions:[
    {emoji:'🔥',label:'WE ARE SO BACK',count:18+n(winner?.wins)*3},
    {emoji:'😬',label:'I HATE THIS',count:12+n(pressure?.team?.losses)*2},
    {emoji:'📊',label:'SHOW ME THE MATH',count:9+teamStates.length},
    {emoji:'🧢',label:'BUYING THE HAT',count:7+n(winner?.wins)}
  ]};
}

export function buildWeeklyRituals65(data={},teams=[],playoffPicture=[]){
  const fans=buildFanUniverse(data,teams,playoffPicture);
  const finals=(data.games||[]).filter(g=>g?.status==='Final').slice(0,20);
  const team=[...fans.teamStates].sort((a,b)=>b.momentum-a.momentum)[0];
  const heartbreak=[...finals].sort((a,b)=>Math.abs(n(a.awayScore)-n(a.homeScore))-Math.abs(n(b.awayScore)-n(b.homeScore)))[0];
  const biggest=[...finals].sort((a,b)=>Math.abs(n(b.awayScore)-n(b.homeScore))-Math.abs(n(a.awayScore)-n(a.homeScore)))[0];
  return [
    {label:'TEAM OF THE WEEK',value:team?.team?.abbr||'—',detail:team?`${team.momentum} momentum · ${team.mood}`:'Waiting for games'},
    {label:'MOMENT OF THE WEEK',value:biggest?`${teams.find(t=>t.id===biggest.winnerTeamId)?.abbr||'NMLB'} statement win`:'—',detail:biggest?`${biggest.awayScore}-${biggest.homeScore}`:'Waiting for a defining game'},
    {label:'HEARTBREAK OF THE WEEK',value:heartbreak?`${teams.find(t=>t.id===heartbreak.loserTeamId)?.abbr||'NMLB'}`:'—',detail:heartbreak?'One of those losses fans remember':'No heartbreak logged yet'},
    {label:'COLD TAKE OF THE WEEK',value:'The receipts folder is open',detail:'Analyst predictions never disappear in the NMLB.'},
    {label:'QUOTE OF THE WEEK',value:'“Every score matters now.”',detail:`Week ${getSeasonPulse(data,teams).week} league mood`}
  ];
}

export function buildCollectibles65(data={},teams=[]){
  const products=[];
  const latest=(data.games||[]).filter(g=>g?.status==='Final')[0];
  const events=(data.leagueExtras?.raceEvents||[]).slice(0,6);
  if(latest){const a=teams.find(t=>t.id===latest.awayTeamId),h=teams.find(t=>t.id===latest.homeTeamId),w=teams.find(t=>t.id===latest.winnerTeamId);products.push({id:`scorecard-${latest.id}`,type:'SCORECARD',name:`${a?.abbr||'AWY'} vs ${h?.abbr||'HME'} Replica Scorecard`,tag:'MOMENT DROP',description:`Commemorative ${latest.awayScore}-${latest.homeScore} final scorecard.`,rarity:'LIMITED'});products.push({id:`ticket-${latest.id}`,type:'TICKET STUB',name:'Latest Final Ticket Stub',tag:'ARCHIVE DROP',description:'A digital keepsake from the latest completed game.',rarity:'ARCHIVE'});products.push({id:`poster-${latest.id}`,type:'POSTER',name:`${w?.abbr||'NMLB'} Final Score Poster`,tag:'GAME POSTER',description:`Broadcast-style poster preserving the ${a?.abbr||'AWY'} ${latest.awayScore} – ${h?.abbr||'HME'} ${latest.homeScore} final.`,rarity:'LIMITED'});if(Number(latest.margin||0)>=8||latest.walkoffVerified)products.push({id:`ball-${latest.id}`,type:'COMMEMORATIVE BALL',name:`${w?.abbr||'NMLB'} ${latest.walkoffVerified?'Walk-Off':'Statement Win'} Ball`,tag:'INSTANT CLASSIC',description:'A shelf piece created because this final was too loud to disappear into the schedule.',rarity:'RARE'});products.push({id:`tee-${latest.id}`,type:'MOMENT TEE',name:`${w?.abbr||'NMLB'} We Were There Tee`,tag:'48-HOUR DROP',description:'A short-run shirt built around the latest final and the fan reaction it created.',rarity:'LIMITED'});}
  events.forEach(e=>products.push({id:`event-${e.id}`,type:'PIN',name:`${e.teamAbbr} ${e.label} Pin`,tag:'RACE DROP',description:e.headline,rarity:e.major?'LIMITED':'SEASONAL'}));
  return products;
}

export function buildFranchiseScrapbook65(data={},teams=[]){
  const games=(data.games||[]).filter(g=>g?.status==='Final');
  return teams.map(team=>{
    const tg=games.filter(g=>g.awayTeamId===team.id||g.homeTeamId===team.id);
    const biggest=[...tg].sort((a,b)=>{
      const am=Math.abs(n(a.awayScore)-n(a.homeScore)),bm=Math.abs(n(b.awayScore)-n(b.homeScore));return bm-am;
    })[0];
    const latest=tg[0];
    const events=(data.leagueExtras?.raceEvents||[]).filter(e=>e.teamId===team.id).slice(0,3);
    return {team,headline:events[0]?.headline||`${team.abbr} season scrapbook`,record:`${team.wins}-${team.losses}`,latest,biggest,events,identity:n(team.runDiff)>=30?'RUN-DIFFERENTIAL MONSTER':String(team.streak||'').startsWith('W')&&n(String(team.streak).slice(1))>=4?'HEAT CHECK':n(team.wins)>=25?'CONTENDER':'STILL WRITING IT'};
  });
}
