import { buildFanUniverse, weeklyMediaPackage } from './fandomUtils';
import { buildHeadToHead } from './historyUtils';
import { buildTicketMarket, buildTeamCultureProfiles, buildWorldState } from './cultureUtils';
import { currentSeasonDay, scheduleEntryLabel } from './seasonCalendarUtils';

const safe=n=>Number(n||0);
const gp=t=>safe(t?.wins)+safe(t?.losses);
const pct=t=>gp(t)?safe(t.wins)/gp(t):0;
const hash=(s='')=>[...String(s)].reduce((n,c)=>((n*33)^c.charCodeAt(0))>>>0,5381);
const pick=(arr,key='')=>arr?.length?arr[hash(key)%arr.length]:'';
const fmtPct=n=>Number.isFinite(n)?n.toFixed(3).replace(/^0/,''):'.000';
const streakValue=t=>{const s=String(t?.streak||'').toUpperCase();return {raw:s,type:s[0]||'',n:Number(s.slice(1)||0)}};

export function buildHotColdBoard(teams=[]){
  const hot=teams.filter(t=>streakValue(t).type==='W'&&streakValue(t).n>0).sort((a,b)=>streakValue(b).n-streakValue(a).n||pct(b)-pct(a)).slice(0,5);
  const cold=teams.filter(t=>streakValue(t).type==='L'&&streakValue(t).n>0).sort((a,b)=>streakValue(b).n-streakValue(a).n||pct(a)-pct(b)).slice(0,5);
  return {hot,cold};
}

export function buildTicketForecast(data={},teams=[],playoffPicture=[]){
  const market=buildTicketMarket(data,teams,playoffPicture);
  const slot=currentSeasonDay(data,teams);
  const anchor=teams.find(t=>t.abbr===(data.leagueExtras?.calendarAnchorTeamAbbr||'SF'))||teams[0];
  const row=market.find(x=>x.team.id===anchor?.id)||market[0]||null;
  const schedule=slot?.schedule;
  const opponent=teams.find(t=>t.abbr===schedule?.opponentAbbr);
  const rivalry=buildHeadToHead(data.games||[],teams,data.seasonHistory||[]).find(r=>(r.teamAId===anchor?.id&&r.teamBId===opponent?.id)||(r.teamBId===anchor?.id&&r.teamAId===opponent?.id));
  let demand=safe(row?.demand);
  if(rivalry?.postseasonGames)demand=Math.min(100,demand+12);
  if(slot?.promo)demand=Math.min(100,demand+safe(slot.promo.attendance)*3+safe(slot.promo.hype)*2);
  const label=demand>=90?'SELLOUT WATCH':demand>=76?'VERY HIGH':demand>=58?'HIGH':demand>=40?'STEADY':'EASY TICKET';
  return {team:anchor,opponent,slot,demand:Math.round(demand),label,roadInvasion:row?.roadInvasion||0,selloutStreak:row?.selloutStreak||0};
}

export function buildFansTalkingAbout(data={},teams=[],playoffPicture=[]){
  const universe=buildFanUniverse(data,teams,playoffPicture);
  const world=buildWorldState(data,teams,playoffPicture,Date.now());
  const {hot,cold}=buildHotColdBoard(teams);
  const topics=[];
  if(hot[0])topics.push({icon:'🔥',label:`${hot[0].abbr} ${hot[0].streak}`,detail:'The league is watching the hottest current streak.'});
  if(cold[0])topics.push({icon:'🥶',label:`${cold[0].abbr} ${cold[0].streak}`,detail:'Doomposting levels are rising.'});
  if(universe.rivalries?.[0])topics.push({icon:'⚔️',label:`${universe.rivalries[0].teamA?.abbr} vs ${universe.rivalries[0].teamB?.abbr}`,detail:`${Math.round(universe.rivalries[0].heat||0)} rivalry heat`});
  if(world.promo)topics.push({icon:world.promo.icon||'🎟️',label:world.promo.name,detail:world.promo.giveaway||'Tonight\'s promotion'});
  (world.trending||[]).slice(0,3).forEach(tag=>topics.push({icon:'#',label:tag,detail:'Trending around the league'}));
  return topics.slice(0,6);
}

export function buildChatterHeat(data={},teams=[],playoffPicture=[],social=null){
  const universe=buildFanUniverse(data,teams,playoffPicture);
  const top=Math.max(0,...universe.teamStates.map(x=>safe(x.hype)));
  const rivalry=safe(social?.rivalry?.heat||universe.rivalries?.[0]?.heat);
  const viewers=safe(social?.watching);
  let score=22+top*.25+rivalry*.22+Math.min(28,viewers/1200)+(social?.isBigMoment?24:0)+(social?.phase==='live'?8:0);
  score=Math.max(0,Math.min(100,Math.round(score)));
  const label=score>=90?'CHAOS':score>=74?'HOT':score>=58?'BUZZING':score>=38?'ACTIVE':'QUIET';
  return {score,label};
}

export function buildAroundLeagueTonight(data={},teams=[],playoffPicture=[]){
  const {hot,cold}=buildHotColdBoard(teams);
  const universe=buildFanUniverse(data,teams,playoffPicture);
  const rows=[];
  hot.slice(0,2).forEach(t=>rows.push({type:'HOT',icon:'🔥',title:`${t.abbr} has won ${streakValue(t).n} straight`,detail:`${t.wins}-${t.losses} · ${fmtPct(pct(t))}`}));
  cold.slice(0,2).forEach(t=>rows.push({type:'COLD',icon:'🥶',title:`${t.abbr} has lost ${streakValue(t).n} straight`,detail:`${t.wins}-${t.losses}`}));
  universe.rivalries?.slice(0,2).forEach(r=>rows.push({type:'RIVALRY',icon:'⚔️',title:`${r.teamA?.abbr} / ${r.teamB?.abbr}`,detail:`${Math.round(r.heat||0)} heat · ${r.games||0} tracked games`}));
  const best=[...teams].sort((a,b)=>pct(b)-pct(a)||safe(b.runDiff)-safe(a.runDiff))[0];
  if(best)rows.push({type:'RACE',icon:'📈',title:`${best.abbr} sets the current pace`,detail:`${best.wins}-${best.losses} · ${safe(best.runDiff)>=0?'+':''}${safe(best.runDiff)} RD`});
  return rows.slice(0,6);
}

export function buildSeasonScrapbook(data={},teams=[]){
  const out=[];
  (data.games||[]).filter(g=>g?.status==='Final').slice(0,40).forEach(g=>{
    const away=teams.find(t=>t.id===g.awayTeamId),home=teams.find(t=>t.id===g.homeTeamId);
    const tags=[];
    if(g.walkoff)tags.push('WALK-OFF'); if(safe(g.inning)>9||safe(g.innings)>9)tags.push('EXTRAS'); if(Math.abs(safe(g.awayScore)-safe(g.homeScore))===1)tags.push('ONE-RUN'); if(!safe(g.awayScore)||!safe(g.homeScore))tags.push('SHUTOUT');
    out.push({id:`game-${g.id}`,kind:'GAME',icon:'⚾',title:`${away?.abbr||'AWY'} ${safe(g.awayScore)} – ${home?.abbr||'HME'} ${safe(g.homeScore)}`,detail:`${g.seasonName||data.activeSeasonName||'Season'}${tags.length?` · ${tags.join(' · ')}`:''}`,date:g.finalizedAt||g.date||'',score:10+tags.length*15+safe(g.excitementScore)});
  });
  (data.leagueExtras?.ceremonies||[]).forEach(c=>out.push({id:`cer-${c.id}`,kind:'CEREMONY',icon:'✨',title:c.title,detail:c.detail||`${c.teamAbbr||'League'} ceremony`,date:c.createdAt||'',score:55}));
  (data.leagueExtras?.worldMoments||[]).forEach(m=>out.push({id:`world-${m.id}`,kind:'WORLD',icon:m.icon||'🌎',title:m.title||'World Moment',detail:m.detail||m.type||'',date:m.createdAt||'',score:35}));
  (data.leagueExtras?.manualEvents||[]).forEach(m=>out.push({id:`manual-${m.id}`,kind:'HISTORY',icon:'📚',title:m.title||m.event||'League Memory',detail:m.note||m.detail||'',date:m.date||m.createdAt||'',score:45}));
  return out.sort((a,b)=>(Date.parse(b.date)||b.score)-(Date.parse(a.date)||a.score)).slice(0,60);
}

export function buildTeamVibes(data={},teams=[],playoffPicture=[]){
  const profiles=buildTeamCultureProfiles(data,teams,playoffPicture);
  const universe=buildFanUniverse(data,teams,playoffPicture);
  return profiles.map(p=>{
    const state=universe.teamStates.find(x=>x.team.id===p.team.id)||{};
    const s=streakValue(p.team);
    const vibe=s.type==='W'&&s.n>=4?'ON FIRE':s.type==='L'&&s.n>=4?'SPIRALING':state.mood||'STEADY';
    return {...p,vibe,approval:state.approval||50,marketHeat:state.marketHeat||50,atmosphere:state.atmosphere||'GOOD CROWD',nickname:state.personality?.title||p.identity};
  });
}

export function buildRivalryTimeline(data={},teams=[]){
  const games=(data.games||[]).filter(g=>g?.status==='Final');
  const rivalries=buildHeadToHead(games,teams,data.seasonHistory||[]);
  return rivalries.slice(0,12).map(r=>{
    const related=games.filter(g=>[g.awayTeamId,g.homeTeamId].includes(r.teamAId)&&[g.awayTeamId,g.homeTeamId].includes(r.teamBId)).slice(0,10).map(g=>({id:g.id,date:g.finalizedAt||g.date||'',score:`${teams.find(t=>t.id===g.awayTeamId)?.abbr||'AWY'} ${g.awayScore} – ${teams.find(t=>t.id===g.homeTeamId)?.abbr||'HME'} ${g.homeScore}`,tags:[g.gameType==='playoff'?'POSTSEASON':'REGULAR',g.walkoff?'WALK-OFF':'',safe(g.inning)>9?'EXTRAS':''].filter(Boolean)}));
    return {...r,events:related};
  });
}

export function buildFakePodcasts(data={},teams=[],playoffPicture=[]){
  const pkg=weeklyMediaPackage(data,teams,playoffPicture);
  const {hot,cold}=buildHotColdBoard(teams);
  const rival=buildFanUniverse(data,teams,playoffPicture).rivalries?.[0];
  const week=pkg.pulse.week;
  return [
    {show:'Around the Diamond',episode:`Week ${week}: Who is real?`,host:'Maya Cruz',topics:[hot[0]?`${hot[0].abbr} heat check`:'Early-season form',cold[0]?`${cold[0].abbr} concern meter`:'Who needs a response','The standings story nobody is talking about']},
    {show:'Extra Innings AM',episode:'The Baseball Internet Has Thoughts',host:'Tommy Lane',topics:[rival?`${rival.teamA?.abbr}/${rival.teamB?.abbr} rivalry temperature`:'Best current rivalry','Fan confidence vs reality','Tonight\'s ticket buzz']},
    {show:'The Long Read',episode:'How this season is becoming itself',host:'Renee Park',topics:['Season memory book','Franchise trajectory','What this week may mean later']},
  ];
}

export function buildDynamicAds(data={},teams=[],playoffPicture=[]){
  const forecast=buildTicketForecast(data,teams,playoffPicture);
  const world=buildWorldState(data,teams,playoffPicture,Date.now());
  const anchor=forecast.team;
  const ads=[];
  if(anchor)ads.push({id:'tickets',kicker:'TICKETS',title:`${forecast.label}: ${anchor.abbr} game day`,copy:`Demand ${forecast.demand}/100${forecast.opponent?` · ${scheduleEntryLabel(forecast.slot?.schedule)}`:''}`,cta:'SEE GAME DAY'});
  if(world.promo)ads.push({id:'promo',kicker:'TONIGHT',title:`${world.promo.icon||'🎟️'} ${world.promo.name}`,copy:world.promo.giveaway||'Special ballpark event',cta:'EVENT GUIDE'});
  ads.push({id:'network',kicker:'SMB NETWORK+',title:'Every storyline. Every argument.',copy:'Pregame, postgame, podcasts and the live fan wire.',cta:'WATCH NOW'});
  ads.push({id:'local',kicker:'DIAMOND DOG GRILL',title:'Win tonight, fries tomorrow.',copy:'A fictional local sponsor proudly fueling unreasonable baseball opinions.',cta:'GAME DAY SPECIAL'});
  return ads;
}

export function buildOnThisDateMoments(data={},teams=[]){
  const today=new Date();const mmdd=`${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const moments=[];
  (data.games||[]).filter(g=>String(g.finalizedAt||g.date||'').slice(5,10)===mmdd).forEach(g=>moments.push({title:`${teams.find(t=>t.id===g.awayTeamId)?.abbr||'AWY'} ${g.awayScore} – ${teams.find(t=>t.id===g.homeTeamId)?.abbr||'HME'} ${g.homeScore}`,detail:`${g.seasonName||'Season'} · ${g.gameType==='playoff'?'Postseason':'Regular season'}`}));
  (data.leagueExtras?.manualEvents||[]).filter(e=>String(e.date||e.createdAt||'').slice(5,10)===mmdd).forEach(e=>moments.push({title:e.title||'League memory',detail:e.note||e.detail||''}));
  return moments.slice(0,8);
}

export function buildFanbaseGrudges(data={},teams=[]){
  const archivedGames=(data.seasonHistory||[]).flatMap(s=>s?.games||[]);
  const h2h=buildHeadToHead([...(data.games||[]),...archivedGames],teams,data.seasonHistory||[]);
  const byPair=new Map(h2h.map(r=>[[r.teamAId,r.teamBId].sort().join('|'),r]));
  const rows=[];
  for(let i=0;i<teams.length;i++)for(let j=i+1;j<teams.length;j++){
    const a=teams[i],b=teams[j];
    const key=[a.id,b.id].sort().join('|');
    const r=byPair.get(key)||{teamAId:a.id,teamBId:b.id,teamA:a,teamB:b,aWins:0,bWins:0,games:0,postseasonGames:0,meetings:[]};
    const sameDivision=a.league===b.league&&a.division===b.division;
    const sameLeague=a.league===b.league;
    const close=r.games?1-Math.abs(safe(r.aWins)-safe(r.bWins))/Math.max(1,r.games):0;
    const meetingHeat=safe(r.games)*7+safe(r.postseasonGames)*20+close*(r.games?22:0);
    const structural=sameDivision?30:sameLeague?14:5;
    const streakSpice=(String(a.streak||'').startsWith('W')||String(b.streak||'').startsWith('W'))?3:0;
    const intensity=Math.min(100,Math.round(structural+meetingHeat+streakSpice));
    const label=intensity>=82?'PERSONAL':intensity>=62?'HEATED':intensity>=40?'GRUDGE':intensity>=20?'TENSE':'BANTER';
    const reason=safe(r.postseasonGames)?`${r.postseasonGames} postseason meeting${r.postseasonGames===1?'':'s'}`:sameDivision?(r.games?`Division rivals · ${r.games} tracked meeting${r.games===1?'':'s'}`:'Division rivals — history waiting to happen'):r.games?`${r.games} tracked meeting${r.games===1?'':'s'}`:sameLeague?'League familiarity':'Interleague side-eye';
    rows.push({...r,teamA:r.teamA||a,teamB:r.teamB||b,intensity,label,reason});
  }
  return rows.sort((a,b)=>b.intensity-a.intensity||b.postseasonGames-a.postseasonGames||b.games-a.games);
}

export function buildHonorInterviews(data={}){
  const extras=data.leagueExtras||{};
  const people=[...(extras.retiredNumbers||[]).map(x=>({name:x.name,team:x.teamAbbr,occasion:`#${x.title||''} retirement`})),...(extras.hallOfFame||[]).map(x=>({name:x.name,team:x.teamAbbr,occasion:'Hall of Fame induction'}))];
  return people.slice(0,8).map((p,i)=>({id:`interview-${i}-${p.name}`,name:p.name,team:p.team,occasion:p.occasion,quote:pick([
    'You never really understand what a place means to you until you see everyone back together again.',
    'The wins were great. The people are what I remember most.',
    'Seeing the banner and hearing that crowd again brought everything back at once.',
    'I am proud that this little piece of history gets to stay with the franchise.'
  ],`${p.name}-${p.occasion}`)}));
}

export function buildMilestoneCeremonySuggestions(data={},teams=[]){
  const suggestions=[];
  teams.forEach(t=>{
    const gpNow=gp(t);
    if(gpNow&&gpNow%10===0)suggestions.push({team:t,title:`${gpNow}-Game Season Milestone`,detail:`${t.abbr} reaches game ${gpNow} of the current season.`});
    if(safe(t.wins)&&safe(t.wins)%10===0)suggestions.push({team:t,title:`${t.wins}-Win Milestone`,detail:`Recognize ${t.abbr}'s ${t.wins}th win of the season.`});
  });
  return suggestions.slice(0,8);
}

export function buildWeeklyMediaRoundup(data={},teams=[],playoffPicture=[]){
  const pkg=weeklyMediaPackage(data,teams,playoffPicture);const {hot,cold}=buildHotColdBoard(teams);const universe=buildFanUniverse(data,teams,playoffPicture);
  return {week:pkg.pulse.week,phase:pkg.pulse.phase,teamOfWeek:pkg.teamOfWeek?.team||null,hot:hot[0]||null,cold:cold[0]||null,rivalry:universe.rivalries?.[0]||null,headline:pkg.teamOfWeek?`${pkg.teamOfWeek.team.abbr} owns the week`:'The week is still taking shape'};
}
