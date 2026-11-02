import { getSeasonPulse, buildFanUniverse } from './fandomUtils';
import { buildFanClubs } from './livingWorldUtils';
import { buildHotColdBoard, buildFakePodcasts, buildOnThisDateMoments } from './mediaMemoryUtils';
import { buildMediaOutlets, buildFranchiseReputations, buildStadiumFolklore, buildPredictionReceipts } from './lifeSystemsUtils';
import { buildBallparkDirectory, buildCityBuzz, buildHistoricGameAlerts } from './ballparkLifeUtils';
import { buildSeasonCalendar, currentLeagueDay, currentSeasonDay } from './seasonCalendarUtils';
import { getScheduledDayEvent } from './dayEventUtils';
import { getPlayoffMarker } from './standingsUtils';

const n=v=>Number(v||0);
const gp=t=>n(t?.wins)+n(t?.losses);
const pct=t=>gp(t)?n(t.wins)/gp(t):0;
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const hash=(s='')=>[...String(s)].reduce((h,c)=>((h*33)^c.charCodeAt(0))>>>0,5381);
const pick=(arr,key='')=>arr?.length?arr[hash(key)%arr.length]:'';
const uniq=(arr,key=x=>x)=>{const seen=new Set();return arr.filter(x=>{const k=key(x);if(seen.has(k))return false;seen.add(k);return true;});};
const finalGames=data=>(data.games||[]).filter(g=>g?.status==='Final');
const teamMap=teams=>new Map(teams.map(t=>[t.id,t]));
const maxWins=t=>n(t.wins)+Math.max(0,40-gp(t));
const scoreDiff=g=>Math.abs(n(g.awayScore)-n(g.homeScore));

function standingsRows(teams=[],playoffPicture=[]){
  return teams.map(team=>{
    const picture=playoffPicture.find(p=>p.league===team.league);
    const leader=picture?.divisionLeaders?.find(t=>t.division===team.division);
    const marker=picture?getPlayoffMarker(team,picture,leader):'';
    return {team,picture,leader,marker};
  });
}

function phaseForHour(hour){
  if(hour<11)return {id:'morning',label:'MORNING EDITION',tone:'Yesterday settles. Today begins.'};
  if(hour<16)return {id:'afternoon',label:'AFTERNOON DESK',tone:'Travel, previews and arguments take over.'};
  if(hour<21)return {id:'pregame',label:'PRIMETIME BUILDUP',tone:'The league is turning toward first pitch.'};
  return {id:'late',label:'LATE NIGHT EDITION',tone:'Finals, reactions, receipts and tomorrow.'};
}

function activeWeekLabel(pulse){
  if(pulse.week>=8)return 'FINAL WEEK';
  if(pulse.week>=7)return 'PENNANT RACE';
  if(pulse.week>=5)return 'SECOND HALF';
  if(pulse.week===4)return 'MIDSEASON';
  return 'REGULAR SEASON';
}

export function buildRecurringFanCharacters(data={},teams=[],playoffPicture=[]){
  const clubs=buildFanClubs(data,teams,playoffPicture);
  const universe=buildFanUniverse(data,teams,playoffPicture);
  const archetypeNames={diehard:'LIFER',optimist:'BELIEVER',doomer:'DOOMER',numbers:'NUMBERS NERD',troll:'RECEIPTS DESK',historian:'ARCHIVIST',merch:'COLLECTOR',radio:'CALLER',skeptic:'SKEPTIC',chaos:'CHAOS AGENT',superstition:'SUPERSTITIOUS',rivalry:'RIVALRY SICKO',softie:'BASEBALL SOFTIE',meme:'MEME ACCOUNT'};
  return clubs.slice(0,Math.min(teams.length*2,48)).map((club,i)=>{
    const state=universe.teamStates.find(x=>x.team.id===club.team.id);
    const seed=hash(`${club.id}-${data.activeSeasonName||'season'}`);
    const followers=Math.round((club.followers||1200)*(1+(state?.marketHeat||50)/180));
    const accuracy=42+(seed%37);
    const reputation=state?.approval>=70?'BELOVED':state?.approval<35?'UNDER FIRE':seed%5===0?'INFAMOUS':'KNOWN REGULAR';
    const runningJoke=pick([
      'Never predicts a comfortable win.',
      'Has been banned from saying “easy series.”',
      'Posts the same lucky-seat photo before every home game.',
      'Keeps screenshots of absolutely everything.',
      'Claims the bullpen can sense their fear.',
      'Turns every two-game streak into a historical thesis.',
      'Has one jersey they refuse to wash during winning streaks.',
      'Will apologize for a bad take only after being tagged twelve times.'
    ],`${club.id}-joke`);
    return {...club,followers,accuracy,reputation,runningJoke,identity:archetypeNames[club.archetype?.id]||club.archetype?.label||'FAN ACCOUNT',memoryDepth:2+(seed%7),replyHeat:clamp(30+(seed%45)+(state?.hype||0)*.25)};
  }).sort((a,b)=>b.followers-a.followers);
}

export function buildFanConversationWeb(data={},teams=[],playoffPicture=[]){
  const chars=buildRecurringFanCharacters(data,teams,playoffPicture);
  const universe=buildFanUniverse(data,teams,playoffPicture);
  const rivalries=universe.rivalries||[];
  const rows=[];
  chars.slice(0,22).forEach((a,i)=>{
    const same=chars.find((b,j)=>j!==i&&b.team.id===a.team.id);
    const rivalry=rivalries.find(r=>r.teamAId===a.team.id||r.teamBId===a.team.id);
    const foeId=rivalry?(rivalry.teamAId===a.team.id?rivalry.teamBId:rivalry.teamAId):null;
    const foe=chars.find(b=>b.team.id===foeId);
    const b=foe||same||chars[(i+5)%chars.length];
    if(!b||b.id===a.id)return;
    const sameTeam=a.team.id===b.team.id;
    const heat=clamp((sameTeam?28:52)+(rivalry?.heat||0)*.35+(hash(`${a.id}-${b.id}`)%24));
    const relation=sameTeam?pick(['GROUP CHAT','MUTUALS','REPLY GUYS','BALLPARK FRIENDS'],a.id):heat>=78?pick(['ACTIVE BEEF','RECEIPTS WAR','BLOCKED-ISH','ARCHRIVALS'],a.id):pick(['BANTER','SIDE-EYE','FRIENDLY FIRE','RIVAL MUTUALS'],a.id);
    const prompt=pick([
      `${a.handle} tagged ${b.handle}: “You still standing by that prediction?”`,
      `${b.handle} replied to ${a.handle}: “I saved this post for a reason.”`,
      `${a.handle} asked ${b.handle}: “Serious question: who do you trust in a one-run ninth?”`,
      `${b.handle} quote-posted ${a.handle}: “This aged in record time.”`,
      `${a.handle} and ${b.handle} are arguing about which fanbase is actually more nervous.`,
      `${a.handle} invited ${b.handle} to settle the argument at the next series.`
    ],`${a.id}-${b.id}-${gp(a.team)}-${gp(b.team)}`);
    rows.push({a,b,relation,heat,prompt});
  });
  return uniq(rows,x=>[x.a.id,x.b.id].sort().join('|')).slice(0,14);
}

export function buildCityMoodBoard(data={},teams=[],playoffPicture=[]){
  const universe=buildFanUniverse(data,teams,playoffPicture);
  const reputations=buildFranchiseReputations(data,teams);
  const cityBuzz=buildCityBuzz(data,teams);
  return universe.teamStates.map(state=>{
    const rep=reputations.find(x=>x.team.id===state.team.id);
    const buzz=cityBuzz.find(x=>x.team.id===state.team.id);
    const record=pct(state.team);
    const hope=clamp(Math.round(record*55+(state.hype||50)*.28+(state.approval||50)*.17));
    const anxiety=clamp(Math.round((100-hope)*.42+(state.hype||50)*.45+(gp(state.team)>=28?18:4)));
    const mood=hope>=78?'CHAMPIONSHIP DREAMING':hope>=62?'BELIEVING':hope>=48?'CAUTIOUSLY HOPEFUL':hope>=30?'RESTLESS':'GALLOW HUMOR';
    const climate=anxiety>=80?'WHITE-KNUCKLE':state.hype>=78?'ELECTRIC':state.approval<35?'HOSTILE':hope>=65?'BUZZING':'WATCHFUL';
    return {team:state.team,hope,anxiety,mood,climate,buzz:buzz?.buzz||buzz?.label||state.atmosphere,era:rep?.era||'OPEN ERA'};
  }).sort((a,b)=>b.hope-a.hope);
}

export function buildLeagueChaos(data={},teams=[],playoffPicture=[]){
  const games=finalGames(data).slice(-24);
  const close=games.filter(g=>scoreDiff(g)<=2).length;
  const extras=games.filter(g=>n(g.inning||g.innings)>9).length;
  const walkoffs=games.filter(g=>g.walkoff).length;
  const standings=[...teams].sort((a,b)=>pct(b)-pct(a));
  const spread=standings.length?Math.abs(pct(standings[0])-pct(standings[standings.length-1])):0;
  const streaks=teams.reduce((s,t)=>s+(n(String(t.streak||'').slice(1))>=4?1:0),0);
  const chaos=clamp(Math.round(28+close*2.3+extras*5+walkoffs*6+streaks*2+(1-spread)*22));
  const drama=clamp(Math.round(22+close*2+walkoffs*8+(teams.filter(t=>gp(t)>=28&&maxWins(t)>=Math.max(...teams.filter(x=>x.league===t.league).map(x=>n(x.wins)))).length)*1.5));
  const label=chaos>=85?'ABSOLUTE NONSENSE':chaos>=70?'HIGH CHAOS':chaos>=50?'SIMMERING':chaos>=30?'ORDERLY-ISH':'SUSPICIOUSLY CALM';
  return {chaos,drama,label,detail:`${close} of the last ${games.length||0} finals were within two runs · ${walkoffs} walk-offs · ${extras} extra-inning games.`};
}

export function buildSeriesAndTravel(data={},teams=[]){
  const games=finalGames(data);
  const map=teamMap(teams);
  return teams.map(team=>{
    const recent=games.filter(g=>g.awayTeamId===team.id||g.homeTeamId===team.id).slice(-6);
    const road=recent.filter(g=>g.awayTeamId===team.id).length;
    const home=recent.length-road;
    const wins=recent.filter(g=>g.awayTeamId===team.id?n(g.awayScore)>n(g.homeScore):n(g.homeScore)>n(g.awayScore)).length;
    const last=recent[recent.length-1];
    const lastOpp=last?map.get(last.awayTeamId===team.id?last.homeTeamId:last.awayTeamId):null;
    const tripLabel=road>=4?'ROAD TRIP':home>=4?'HOMESTAND':road>home?'ON THE ROAD':'HOME STRETCH';
    const mood=wins>=5?'ROLLING':wins>=3?'STEADY':wins<=1?'GRINDING':'MIXED';
    return {team,tripLabel,mood,recentRecord:`${wins}-${recent.length-wins}`,lastOpp,lastSix:recent};
  });
}

export function buildParkLifeLedger(data={},teams=[]){
  const directory=buildBallparkDirectory(data,teams);
  const folklore=buildStadiumFolklore(data,teams);
  const games=finalGames(data);
  return directory.map(entry=>{
    const team=entry.team;
    const home=games.filter(g=>g.homeTeamId===team.id);
    const wins=home.filter(g=>n(g.homeScore)>n(g.awayScore)).length;
    const walkoffs=home.filter(g=>g.walkoff).length;
    const high=home.slice().sort((a,b)=>(n(b.homeScore)+n(b.awayScore))-(n(a.homeScore)+n(a.awayScore)))[0];
    const lore=folklore.find(x=>x.team.id===team.id);
    const reputation=walkoffs>=3?'WALK-OFF FACTORY':home.length>=8&&wins/home.length>=.7?'HOME FORTRESS':home.length>=8&&wins/home.length<=.35?'VISITOR FRIENDLY':pick(['LOUD HOUSE','OLD-SCHOOL PARK','CHAOS YARD','NIGHT-GAME FAVORITE','BASEBALL TEMPLE'],team.id);
    return {...entry,reputation,homeRecord:`${wins}-${home.length-wins}`,walkoffs,signature:high?`${high.awayScore}-${high.homeScore} vs ${(teamMap(teams).get(high.awayTeamId)||{}).abbr||'AWY'}`:'Waiting for its signature game',legend:lore?.legend||'Lore forming'};
  });
}

export function buildLeagueHistoryEchoes(data={},teams=[]){
  const games=finalGames(data);
  const history=data.seasonHistory||[];
  const echoes=[];
  const currentTop=[...teams].sort((a,b)=>pct(b)-pct(a)||n(b.runDiff)-n(a.runDiff))[0];
  const hot=[...teams].sort((a,b)=>n(String(b.streak||'').slice(1))-n(String(a.streak||'').slice(1)))[0];
  if(currentTop)echoes.push({label:'HISTORICAL COMP',title:`${currentTop.abbr} is setting the current pace`,detail:history.length?`The archive now has ${history.length} completed season${history.length===1?'':'s'} to compare against.`:'This season is writing the first comparison point.'});
  if(hot&&String(hot.streak||'').startsWith('W'))echoes.push({label:'STREAK ECHO',title:`${hot.abbr} ${hot.streak} has entered memory territory`,detail:'Every additional win increases the chance this run becomes a future “remember when?” reference.'});
  const dramatic=games.filter(g=>g.walkoff||scoreDiff(g)<=1||n(g.inning||g.innings)>9).slice(-1)[0];
  if(dramatic){const map=teamMap(teams);echoes.push({label:'YOU HAD TO BE THERE',title:`${map.get(dramatic.awayTeamId)?.abbr||'AWY'} ${dramatic.awayScore} – ${map.get(dramatic.homeTeamId)?.abbr||'HME'} ${dramatic.homeScore}`,detail:dramatic.walkoff?'A walk-off already living in the league memory bank.':n(dramatic.inning||dramatic.innings)>9?'An extra-inning night people will keep bringing up.':'A one-run game that refuses to disappear from the conversation.'});}
  return echoes.slice(0,5);
}

export function buildClinchAftermath(data={},teams=[],playoffPicture=[]){
  const rows=standingsRows(teams,playoffPicture);
  const out=[];
  rows.forEach(({team,marker})=>{
    if(['z','y','w','x'].includes(marker)){
      const label=marker==='z'?'#1 SEED LOCKED':marker==='y'?'DIVISION CLINCHED':marker==='w'?'WILD CARD CLINCHED':'PLAYOFF BERTH CLINCHED';
      out.push({team,type:'clinch',label,phase:'CELEBRATION WAVE',detail:pick([
        `${team.city} is in celebration mode. The conversation has already shifted from “if” to “how far?”`,
        `Merch, radio, fan accounts and local media have all flipped into postseason mode.`,
        `The clinch is no longer a standings symbol — it is the city's lead baseball story.`
      ],`${team.id}-${marker}`)});
    } else if(marker==='e'){
      out.push({team,type:'eliminated',label:'ELIMINATED',phase:'AFTERMATH',detail:pick([
        `The first wave is frustration. The next story is whether ${team.abbr} can ruin somebody else's season.`,
        `${team.city} has moved from pennant math to reflection, blame and spoiler talk.`,
        `The season is no longer about qualifying. It is about pride, final memories and making rivals miserable.`
      ],`${team.id}-e`)});
    }
  });
  return out;
}

export function buildMediaUniverseV6(data={},teams=[],playoffPicture=[]){
  const outlets=buildMediaOutlets(data,teams,playoffPicture);
  const podcasts=buildFakePodcasts(data,teams,playoffPicture);
  const receipts=buildPredictionReceipts(data,teams);
  const recurringShows=[
    {show:'Around the Diamond',slot:'Morning',voice:'League-wide recap',hook:'What changed overnight and what matters next.'},
    {show:'Numbers Game',slot:'Afternoon',voice:'Analytics',hook:'Awards, probabilities, streak sustainability and record chases.'},
    {show:'Bleacher Noise',slot:'Drive Time',voice:'Fan culture',hook:'Calls, grudges, memes, events and the loudest fanbases.'},
    {show:'October Watch',slot:'Prime Time',voice:'Pennant race',hook:'Clinches, eliminations, scoreboard watching and postseason paths.'},
    {show:'The Night Cap',slot:'Late Night',voice:'Receipts',hook:'Bad predictions, quote-posts and everything that aged terribly.'},
  ];
  return {outlets,podcasts,receipts,shows:recurringShows};
}

export function buildWeeklyShow(data={},teams=[],playoffPicture=[]){
  const pulse=getSeasonPulse(data,teams);
  const {hot,cold}=buildHotColdBoard(teams);
  const games=finalGames(data).slice(-20);
  const gameOfWeek=games.slice().sort((a,b)=>{
    const sa=(a.walkoff?20:0)+(n(a.inning||a.innings)>9?12:0)+(10-scoreDiff(a));
    const sb=(b.walkoff?20:0)+(n(b.inning||b.innings)>9?12:0)+(10-scoreDiff(b));return sb-sa;
  })[0];
  const map=teamMap(teams);
  return {
    title:`Week ${pulse.week} — ${activeWeekLabel(pulse)}`,
    dek:pick(['The standings tightened, the internet overreacted and somebody saved a receipt.','Another week of baseball created more questions than answers.','The league calendar keeps moving, and every day is starting to carry consequences.'],`${pulse.week}-${data.activeSeasonName}`),
    segments:[
      hot[0]?{label:'TEAM OF THE WEEK',title:`${hot[0].abbr} ${hot[0].streak||''}`.trim(),detail:`${hot[0].wins}-${hot[0].losses} · ${n(hot[0].runDiff)>=0?'+':''}${n(hot[0].runDiff)} RD`}:null,
      cold[0]?{label:'ROUGH WEEK',title:cold[0].abbr,detail:`${cold[0].streak||'Searching for traction'} · pressure rising`}:null,
      gameOfWeek?{label:'GAME OF THE WEEK',title:`${map.get(gameOfWeek.awayTeamId)?.abbr||'AWY'} ${gameOfWeek.awayScore} – ${map.get(gameOfWeek.homeTeamId)?.abbr||'HME'} ${gameOfWeek.homeScore}`,detail:gameOfWeek.walkoff?'Walk-off finish':n(gameOfWeek.inning||gameOfWeek.innings)>9?'Extra-inning drama':'The score stayed tight enough to matter'}:null,
      {label:'NEXT EPISODE',title:`Week ${Math.min(8,pulse.week+1)}`,detail:pulse.week>=7?'Every result now has postseason consequences.':'New events, new arguments, new opportunities for chaos.'}
    ].filter(Boolean)
  };
}

export function buildMeaningfulGames(data={},teams=[],playoffPicture=[]){
  const rows=standingsRows(teams,playoffPicture);
  const active=rows.filter(x=>!['z','y','w','x','e'].includes(x.marker)&&gp(x.team)>=26);
  return active.slice().sort((a,b)=>maxWins(a.team)-maxWins(b.team)).slice(0,6).map((x,i)=>({
    team:x.team,
    label:i<2?'ELIMINATION WATCH':'SCOREBOARD WATCH',
    detail:`${x.team.abbr} is ${40-gp(x.team)} game${40-gp(x.team)===1?'':'s'} from the end of its schedule with a maximum of ${maxWins(x.team)} wins.`,
    urgency:clamp(58+(gp(x.team)-26)*3)
  }));
}

export function buildEventAftermath(data={},teams=[]){
  const day=currentLeagueDay(data,teams);
  const event=getScheduledDayEvent(data,day?.slotIndex);
  const extras=data.leagueExtras||{};
  const schedule=extras.dayEventSchedule||{};
  const calendar=buildSeasonCalendar(data,teams);
  const items=[];
  Object.entries(schedule).forEach(([slot,v])=>{
    const idx=n(slot);
    if(!v||idx>n(day?.slotIndex))return;
    const age=n(day?.slotIndex)-idx;
    if(age>4)return;
    const cal=calendar[idx];
    const name=v.name||v.title||v.label||'Ballpark event';
    items.push({name,age,label:age===0?'HAPPENING TODAY':age===1?'LAST NIGHT':'STILL BUZZING',detail:age===0?`Fans are arriving, posting and turning ${name} into today's local baseball story.`:`${name} is still generating photos, reviews and “do this again next year” posts.`,day:cal?.dayNumber||idx+1});
  });
  if(event&&!items.some(x=>x.name===(event.name||event.title)))items.unshift({name:event.name||event.title||'Ballpark event',age:0,label:'HAPPENING TODAY',detail:'The park is active even without a game.',day:day?.dayNumber});
  return items.slice(0,5);
}

export function buildPreviouslyOn(data={},teams=[],playoffPicture=[]){
  const games=finalGames(data).slice(-5);
  const map=teamMap(teams);
  const rows=[];
  games.slice(-3).reverse().forEach(g=>{
    const aw=map.get(g.awayTeamId),hm=map.get(g.homeTeamId);
    const winner=n(g.awayScore)>n(g.homeScore)?aw:hm;
    rows.push({label:g.walkoff?'WALK-OFF':'RECENT FINAL',title:`${aw?.abbr||'AWY'} ${g.awayScore} – ${hm?.abbr||'HME'} ${g.homeScore}`,detail:`${winner?.abbr||'The winner'} left the night with the result. ${g.walkoff?'The ending is still all over the timeline.':scoreDiff(g)<=1?'It stayed tight enough to linger.':'The reaction has already moved into analysis mode.'}`});
  });
  buildClinchAftermath(data,teams,playoffPicture).slice(0,2).forEach(x=>rows.unshift({label:x.label,title:`${x.team.abbr} · ${x.phase}`,detail:x.detail}));
  return rows.slice(0,5);
}

export function buildV6LivingLeague(data={},teams=[],playoffPicture=[],now=Date.now()){
  const pulse=getSeasonPulse(data,teams);
  const today=currentLeagueDay(data,teams)||currentSeasonDay(data,teams);
  const dayEvent=getScheduledDayEvent(data,today?.slotIndex);
  const universe=buildFanUniverse(data,teams,playoffPicture);
  const moods=buildCityMoodBoard(data,teams,playoffPicture);
  const chaos=buildLeagueChaos(data,teams,playoffPicture);
  const fans=buildRecurringFanCharacters(data,teams,playoffPicture);
  const conversations=buildFanConversationWeb(data,teams,playoffPicture);
  const travel=buildSeriesAndTravel(data,teams);
  const parkLedger=buildParkLifeLedger(data,teams);
  const aftermath=buildClinchAftermath(data,teams,playoffPicture);
  const weekly=buildWeeklyShow(data,teams,playoffPicture);
  const media=buildMediaUniverseV6(data,teams,playoffPicture);
  const echoes=buildLeagueHistoryEchoes(data,teams);
  const meaningful=buildMeaningfulGames(data,teams,playoffPicture);
  const eventAftermath=buildEventAftermath(data,teams);
  const previous=buildPreviouslyOn(data,teams,playoffPicture);
  const onThisDay=buildOnThisDateMoments(data,teams);
  const alerts=buildHistoricGameAlerts(data,teams);
  const namedGames=buildNamedGames(data,teams);
  const emergingTraditions=buildEmergingTraditions(data,teams);
  const spoilerBoard=buildSpoilerBoard(data,teams,playoffPicture);
  const cultureAwards=buildLeagueCultureAwardsV6(data,teams,playoffPicture);
  const timeCapsule=buildSeasonTimeCapsule(data,teams,playoffPicture);
  const fanLetters=buildFanLetters(data,teams,playoffPicture);
  const phase=phaseForHour(new Date(now).getHours());
  const activeGames=teams.reduce((s,t)=>s+gp(t),0)/2;
  const headline=aftermath[0]?.type==='clinch'?`${aftermath[0].team.abbr} has changed the postseason map`:aftermath[0]?.type==='eliminated'?`${aftermath[0].team.abbr} enters spoiler season`:dayEvent?`${dayEvent.name||dayEvent.title} owns today's ballpark calendar`:meaningful[0]?`${meaningful[0].team.abbr} enters a pressure day`:`Week ${pulse.week} keeps moving`;
  const topMood=moods[0];
  const hottestTopic=pick([
    topMood?`${topMood.team.abbr} hope is at ${topMood.hope}/100`:null,
    universe.rivalries?.[0]?`${universe.rivalries[0].teamA?.abbr}/${universe.rivalries[0].teamB?.abbr} rivalry heat`:null,
    chaos.chaos>=70?`League chaos has reached ${chaos.chaos}/100`:null,
    dayEvent?dayEvent.name||dayEvent.title:null
  ].filter(Boolean),`${pulse.week}-${today?.slotIndex}`);
  return {
    version:'6.0',
    phase,pulse,today,dayEvent,headline,hottestTopic,activeGames,
    chaos,moods,fans,conversations,travel,parkLedger,aftermath,weekly,media,echoes,meaningful,eventAftermath,previous,onThisDay,alerts,namedGames,emergingTraditions,spoilerBoard,cultureAwards,timeCapsule,fanLetters,
    leagueMood:universe.leagueMood,
    todayLabel:today?`MONTH ${today.month||Math.floor((today.slotIndex||0)/28)+1} · DAY ${today.dayInMonth||((today.slotIndex||0)%28)+1}`:`WEEK ${pulse.week}`,
    tomorrow:buildSeasonCalendar(data,teams).find(x=>n(x.slotIndex)>n(today?.slotIndex)&&x.gameNumber)||null,
  };
}

export function buildNamedGames(data={},teams=[]){
  const map=teamMap(teams);
  return finalGames(data).map(g=>{
    const aw=map.get(g.awayTeamId),hm=map.get(g.homeTeamId);
    const total=n(g.awayScore)+n(g.homeScore), margin=scoreDiff(g), inn=n(g.inning||g.innings||9);
    let name='';
    if(g.walkoff)name=pick([`The Walk-Off at ${hm?.abbr||'Home'}`,`The Last Swing Game`,`The Night Nobody Left Early`],g.id);
    else if(inn>9)name=pick([`The Extra-Inning Marathon`,`The Long Night at ${hm?.abbr||'Home'}`,`The Game That Would Not End`],g.id);
    else if(total>=18)name=pick([`The Run Avalanche`,`The Scoreboard Meltdown`,`The Everybody Hit Game`],g.id);
    else if(margin>=9)name=pick([`The ${margin}-Run Statement`,`The Blowout at ${hm?.abbr||'Home'}`,`The No-Mercy Game`],g.id);
    else if(margin===1)name=pick([`The One-Run Squeeze`,`The Hold-Your-Breath Game`,`The Final-Out Game`],g.id);
    if(!name)return null;
    return {game:g,name,label:g.walkoff?'YOU HAD TO BE THERE':inn>9?'MARATHON MEMORY':total>=18?'CHAOS CLASSIC':'LEAGUE MEMORY',score:`${aw?.abbr||'AWY'} ${g.awayScore} – ${hm?.abbr||'HME'} ${g.homeScore}`};
  }).filter(Boolean).slice(-8).reverse();
}

export function buildEmergingTraditions(data={},teams=[]){
  const schedule=data.leagueExtras?.dayEventSchedule||{};
  const counts={};
  Object.values(schedule).filter(Boolean).forEach(e=>{const name=e.name||e.title||e.label;if(!name)return;counts[name]=(counts[name]||0)+1;});
  const rows=Object.entries(counts).map(([name,count])=>({name,count,status:count>=3?'TRADITION ESTABLISHED':count===2?'TRADITION BUILDING':'NEW RITUAL',detail:count>=3?`${name} has happened often enough to become part of the league calendar's identity.`:count===2?`Fans are starting to ask whether ${name} comes back next season.`:`The first edition is now part of the season memory.`}));
  if(!rows.length){const day=getScheduledDayEvent(data,currentLeagueDay(data,teams)?.slotIndex);if(day)rows.push({name:day.name||day.title,count:1,status:'NEW RITUAL',detail:'Today could be the beginning of something that returns every season.'});}
  return rows.sort((a,b)=>b.count-a.count).slice(0,6);
}

export function buildSpoilerBoard(data={},teams=[],playoffPicture=[]){
  return standingsRows(teams,playoffPicture).filter(x=>x.marker==='e').map(x=>({team:x.team,label:'SPOILER MODE',detail:pick([`${x.team.abbr} cannot qualify, but it can still wreck somebody else's path.`,`The postseason dream is over. The rivalry opportunities are not.`,`Pride, final home dates and making contenders uncomfortable now define the stretch run.`],`${x.team.id}-spoiler`),energy:clamp(45+n(String(x.team.streak||'').slice(1))*5)})).slice(0,8);
}

export function buildLeagueCultureAwardsV6(data={},teams=[],playoffPicture=[]){
  const moods=buildCityMoodBoard(data,teams,playoffPicture);
  const chars=buildRecurringFanCharacters(data,teams,playoffPicture);
  const parks=buildParkLifeLedger(data,teams);
  const chaos=buildLeagueChaos(data,teams,playoffPicture);
  const mostAnxious=[...moods].sort((a,b)=>b.anxiety-a.anxiety)[0];
  const loudest=[...moods].sort((a,b)=>b.hope+b.anxiety-(a.hope+a.anxiety))[0];
  const celeb=chars[0];
  const park=[...parks].sort((a,b)=>b.walkoffs-a.walkoffs)[0];
  return [
    loudest?{award:'Loudest Baseball City',winner:loudest.team.abbr,detail:`Hope ${loudest.hope} · Anxiety ${loudest.anxiety}`} : null,
    mostAnxious?{award:'Most Emotionally Unsafe Fanbase',winner:mostAnxious.team.abbr,detail:`Anxiety ${mostAnxious.anxiety}/100`} : null,
    celeb?{award:'Fan Account Main Character',winner:celeb.handle,detail:`${celeb.followers.toLocaleString()} followers · ${celeb.reputation}`} : null,
    park?{award:'Ballpark Drama Leader',winner:park.team.abbr,detail:`${park.walkoffs} tracked walk-offs · ${park.reputation}`} : null,
    {award:'League Nonsense Index',winner:`${chaos.chaos}/100`,detail:chaos.label}
  ].filter(Boolean);
}

export function buildSeasonTimeCapsule(data={},teams=[],playoffPicture=[]){
  const moods=buildCityMoodBoard(data,teams,playoffPicture);
  const chars=buildRecurringFanCharacters(data,teams,playoffPicture);
  const chaos=buildLeagueChaos(data,teams,playoffPicture);
  const hot=[...teams].sort((a,b)=>pct(b)-pct(a)||n(b.runDiff)-n(a.runDiff))[0];
  const event=getScheduledDayEvent(data,currentLeagueDay(data,teams)?.slotIndex);
  const tag=hot?`#${hot.abbr}${String(hot.streak||'Baseball').replace(/[^A-Za-z0-9]/g,'')}`:'#SMBLeague';
  return {season:data.activeSeasonName||'Current Season',topTeam:hot?.abbr||'—',leagueMood:moods[0]?.mood||'FORMING',chaos:chaos.chaos,mainCharacter:chars[0]?.handle||'—',event:event?.name||event?.title||'No featured event today',hashtag:tag,summary:`If the season froze today: ${hot?.abbr||'the leader'} owns the pace, ${chars[0]?.handle||'the fanbase'} owns the timeline, and league chaos sits at ${chaos.chaos}/100.`};
}

export function buildFanLetters(data={},teams=[],playoffPicture=[]){
  const moods=buildCityMoodBoard(data,teams,playoffPicture);
  return moods.slice(0,4).map((x,i)=>({team:x.team,from:pick(['A season-ticket holder','A first-time fan','A parent in the upper deck','A fan who has seen too many late innings'],`${x.team.id}-${i}`),text:x.hope>=70?`I keep telling myself not to get ahead of it, but this season is starting to feel like one we'll talk about for years.`:x.anxiety>=70?`I know the numbers say there is still baseball left. I also know this team has trained me not to relax until the final out.`:`The best part has been having somewhere to go, somebody to argue with, and another game on the calendar.`}));
}
