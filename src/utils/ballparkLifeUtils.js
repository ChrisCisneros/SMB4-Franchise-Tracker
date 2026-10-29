import { currentSeasonDay, scheduleEntryLabel } from './seasonCalendarUtils';
import { buildFanbaseGrudges } from './mediaMemoryUtils';

const n=v=>Number(v||0);
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const hash=(s='')=>[...String(s)].reduce((h,c)=>((h*33)^c.charCodeAt(0))>>>0,5381);
const pick=(arr,key='')=>arr?.length?arr[hash(key)%arr.length]:'';
const teamById=(teams,id)=>teams.find(t=>t.id===id)||null;
const pairKey=(a,b)=>[a,b].sort().join('|');

export const BALLPARK_EVENT_BANK={
  pregame:[
    ['🎤','Pregame Live Music','A local act takes over the plaza before gates settle in.'],
    ['✍️','Autograph Rail','Fans line the rail for a pregame autograph session.'],
    ['📻','Radio Row','Local radio broadcasts live from outside the park.'],
    ['🎟️','Season Ticket Meetup','Regulars gather before first pitch for a members event.'],
    ['⚾','Ceremonial First Pitch','A community guest gets the ceremonial first pitch.'],
    ['🎶','Anthem Spotlight','Tonight’s anthem gets a featured ballpark introduction.'],
    ['📸','Fan Photo Walk','The concourse turns into an unofficial photo tour.'],
    ['🏟️','Open Gates Festival','Food, music and fan activities start early around the park.'],
    ['👨‍👩‍👧','First Game Welcome','Families pick up first-game certificates and take photos at the gate.'],
    ['🌭','Concession Debut','A brand-new fictional ballpark food item gets its first reviews.'],
    ['🚌','Visiting Fan Meetup','Traveling supporters gather before entering enemy territory.'],
    ['🧢','Game Day Merch Drop','A limited team-store release sends collectors toward the gates early.'],
  ],
  ingame:[
    ['🏃','Mascot Race','The mascot race becomes tonight’s extremely serious side competition.'],
    ['📹','Fan Cam','The video board starts hunting for the loudest section.'],
    ['👕','T-Shirt Toss','Sections start lobbying aggressively for free shirts.'],
    ['🧠','Scoreboard Trivia','The crowd gets a baseball trivia challenge between innings.'],
    ['🔊','Noise Meter','The stadium tries to break its own noise meter.'],
    ['🎂','Scoreboard Shoutouts','Birthdays and anniversaries take over the big screen.'],
    ['⬆️','Seat Upgrade','A random group gets upgraded to better seats.'],
    ['🎁','Lucky Row','One section wins a surprise ballpark giveaway.'],
    ['🎵','Singalong','The whole park gets dragged into a between-inning singalong.'],
    ['🏆','Community Spotlight','A local youth or community group gets recognized on the field.'],
    ['🍔','Concession Challenge','A sponsor contest turns a food item into tonight’s side quest.'],
    ['💃','Dance Cam','The scoreboard creates exactly the kind of clips social media will reuse later.'],
    ['💍','Scoreboard Proposal','A proposal takes over the video board and instantly divides the internet.'],
    ['⚾','Foul Ball Moment','A catch, drop or kid-with-a-baseball moment becomes section-level folklore.'],
    ['🦊','Mascot Antics','The mascot causes a completely unnecessary amount of between-inning drama.'],
    ['🎖️','Service Recognition','A community or service recognition gets a standing ovation.'],
  ],
  postgame:[
    ['🎆','Fireworks','Fans stay in their seats for a postgame fireworks show.'],
    ['🚁','Drone Show','A postgame drone display takes over the sky above the park.'],
    ['🎸','Postgame Concert','The field becomes a stage after the final out.'],
    ['🏃','Kids Run the Bases','Families stay late so kids can take a lap around the bases.'],
    ['✍️','Postgame Autographs','A limited autograph session keeps part of the concourse open late.'],
    ['🎥','Movie Night','The scoreboard becomes a giant movie screen after the game.'],
    ['🧡','Fan Appreciation','Extra prizes and thank-yous continue after the final.'],
    ['✨','Laser Show','The lights go down and a postgame laser show takes over the field.'],
    ['🎉','Street Party','A major win spills into the plaza and nearby fictional businesses.'],
    ['🍻','Road Fan Celebration','Traveling fans claim a nearby fictional bar after a road win.'],
  ],
  offday:[
    ['🎪','Fan Fest','The stadium opens for games, booths, photos and fan clubs.'],
    ['🏟️','Ballpark Open House','Fans wander the park without a game happening.'],
    ['🧢','Memorabilia Convention','Collectors, sellers and team history take over the concourse.'],
    ['📚','Championship Anniversary','A past title gets a dedicated anniversary program.'],
    ['🤝','Community Day','The club hosts a local community event at the park.'],
    ['⚾','Youth Clinic','Kids take the field for a team-run baseball clinic.'],
    ['🎬','Stadium Movie Night','The video board hosts a standalone movie experience.'],
    ['🎙️','Fan Forum','Broadcasters and fans gather for a live Q&A.'],
    ['👕','Merchandise Launch','A new fictional collection drops at the team store.'],
    ['🎭','Mascot Festival','Mascot nonsense becomes the entire point of the day.'],
    ['📻','Radio Special','Local media fills the off-day with a live baseball town hall.'],
    ['🏅','Alumni Day','Former honorees and club history get a standalone celebration.'],
    ['🗓️','Schedule Release Night','The next stretch of the season gets a full media-and-fan reveal.'],
    ['👕','Uniform Reveal','A new or throwback look gets unveiled with maximum online discourse.'],
    ['🚶','Stadium Tour Day','Fans explore the dugout, warning track and normally closed ballpark spaces.'],
    ['🏆','League Awards Show','The league turns an off-day into a celebration of baseball and culture.'],
    ['🥎','Alumni Softball Game','Legends and honorees come back for a low-stakes exhibition.'],
    ['🎊','Championship Parade','A title celebration takes over the fictional city around the club.'],
  ],
};

export function analyzeGameMagnitude(game={},teams=[]){
  if(!game?.awayTeamId||!game?.homeTeamId)return {score:0,tier:'ROUTINE',tags:[],headline:'',nickname:''};
  const away=teamById(teams,game.awayTeamId),home=teamById(teams,game.homeTeamId);
  const a=n(game.awayScore),h=n(game.homeScore),margin=Math.abs(a-h),total=a+h;
  const awayInnings=Array.isArray(game.awayInnings)?game.awayInnings.map(n):[];
  const homeInnings=Array.isArray(game.homeInnings)?game.homeInnings.map(n):[];
  let maxInning=0,maxSide='',maxInningNo=0;
  awayInnings.forEach((r,i)=>{if(r>maxInning){maxInning=r;maxSide=away?.abbr||'AWY';maxInningNo=i+1}});
  homeInnings.forEach((r,i)=>{if(r>maxInning){maxInning=r;maxSide=home?.abbr||'HME';maxInningNo=i+1}});
  const extras=n(game.inning||game.innings)>9;
  const shutout=(a===0||h===0)&&(a+h>0);
  const oneRun=margin===1;
  let score=8;
  score+=Math.min(36,margin*2.2)+Math.max(0,total-10)*1.35+Math.max(0,maxInning-4)*6;
  if(extras)score+=15;if(game.walkoff)score+=24;if(shutout&&margin>=8)score+=10;if(oneRun)score+=7;
  const tags=[];
  if(maxInning>=14)tags.push('14-RUN INNING'); else if(maxInning>=10)tags.push('10+ RUN INNING'); else if(maxInning>=7)tags.push('MONSTER INNING');
  if(margin>=15)tags.push('EXTREME BLOWOUT'); else if(margin>=10)tags.push('BLOWOUT');
  if(total>=20)tags.push('20+ RUN GAME'); if(game.walkoff)tags.push('WALK-OFF'); if(extras)tags.push('EXTRAS'); if(shutout)tags.push('SHUTOUT'); if(oneRun)tags.push('ONE-RUN');
  score=clamp(Math.round(score));
  const tier=score>=90?'LEGENDARY':score>=74?'HISTORIC':score>=56?'CLASSIC':score>=36?'MEMORABLE':'ROUTINE';
  const winner=a>h?away:h>a?home:null,loser=a>h?home:h>a?away:null;
  let headline='';
  if(maxInning>=10)headline=`${maxSide} erupts for ${maxInning} runs in the ${ordinal(maxInningNo)} inning`;
  else if(margin>=15)headline=`${winner?.abbr||'One club'} turns the night into a ${margin}-run demolition`;
  else if(total>=20)headline=`${away?.abbr||'AWY'} and ${home?.abbr||'HME'} combine for ${total} runs`;
  else if(game.walkoff)headline=`${home?.abbr||'Home'} ends it in walk-off fashion`;
  else if(extras)headline=`${away?.abbr||'AWY'}-${home?.abbr||'HME'} refuses to end after nine`;
  else if(tier!=='ROUTINE')headline=`${winner?.abbr||'The winner'} leaves a mark on the night`;
  const nickname=maxInning>=12?`The ${maxInning}-Run ${ordinal(maxInningNo)}`:margin>=15?'The Demolition':game.walkoff?'The Walk-Off Night':extras&&n(game.inning||game.innings)>=12?'The Marathon':total>=20?'The Track Meet':'';
  return {score,tier,tags,headline,nickname,maxInning,maxInningNo,maxSide,margin,total,winner,loser,away,home};
}

function ordinal(v){const n=Number(v)||0;const s=n%100;return `${n}${s>=11&&s<=13?'th':n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th'}`;}

export function buildHistoricGameAlerts(data={},teams=[]){
  const rows=[];
  const live=data.currentGame;
  if(live?.awayTeamId&&live?.homeTeamId&&(live.status==='Live'||live.status==='Delay')){
    const m=analyzeGameMagnitude(live,teams);
    if(m.score>=50||m.maxInning>=8||m.margin>=12)rows.push({id:'live-extreme',live:true,...m,kicker:m.score>=74?'🚨 SMBL ALERT':'👀 DEVELOPING',detail:`${m.away?.abbr||'AWY'} ${n(live.awayScore)} – ${m.home?.abbr||'HME'} ${n(live.homeScore)} · ${live.half==='Bottom'?'Bottom':'Top'} ${n(live.inning)||1}`});
  }
  const finals=(data.games||[]).filter(g=>g?.status==='Final').slice(0,12);
  finals.forEach(g=>{const m=analyzeGameMagnitude(g,teams);if(m.score>=56)rows.push({id:`final-${g.id}`,live:false,game:g,...m,kicker:m.tier==='LEGENDARY'?'🏛️ LEAGUE HISTORY':'📰 GAME AFTERLIFE',detail:`${m.away?.abbr||'AWY'} ${n(g.awayScore)} – ${m.home?.abbr||'HME'} ${n(g.homeScore)}${m.nickname?` · ${m.nickname}`:''}`});});
  return rows.sort((a,b)=>(b.live-a.live)||b.score-a.score).slice(0,8);
}

export function buildBallparkLife(data={},teams=[],playoffPicture=[],now=Date.now()){
  const slot=currentSeasonDay(data,teams);
  const game=data.currentGame||{};
  const live=game.status==='Live'||game.status==='Delay';
  const home=teamById(teams,live?game.homeTeamId:null)||teams.find(t=>t.abbr===(data.leagueExtras?.calendarAnchorTeamAbbr||'SF'))||teams[0];
  const away=teamById(teams,live?game.awayTeamId:null);
  const gameNo=n(game.seasonGameNumber)||n(slot?.gameNumber);
  const key=`${home?.id}-${gameNo}-${slot?.week}-${slot?.weekday}-${Math.floor(now/3600000)}`;
  const manual=(data.leagueExtras?.ballparkEvents||[]).filter(e=>!e.gameNumber||n(e.gameNumber)===gameNo).slice(0,5);
  const pre=BALLPARK_EVENT_BANK.pregame[(hash(`${key}-pre`)%BALLPARK_EVENT_BANK.pregame.length)];
  const ingame=BALLPARK_EVENT_BANK.ingame[(hash(`${key}-mid`)%BALLPARK_EVENT_BANK.ingame.length)];
  const post=BALLPARK_EVENT_BANK.postgame[(hash(`${key}-post`)%BALLPARK_EVENT_BANK.postgame.length)];
  const off=BALLPARK_EVENT_BANK.offday[(hash(`${key}-off`)%BALLPARK_EVENT_BANK.offday.length)];
  const make=(x,phase,source='generated')=>({id:`${phase}-${x[1]}-${gameNo}`,phase,icon:x[0],title:x[1],detail:x[2],source});
  const isOff=!slot?.gameNumber&&!live;
  let events=isOff?[make(off,'OFF-DAY')]:[make(pre,'PREGAME'),make(ingame,'IN-GAME'),make(post,'POSTGAME')];
  if(slot?.promo)events.unshift({id:`promo-${gameNo}`,phase:'PREGAME',icon:slot.promo.icon||'🎟️',title:slot.promo.name,detail:slot.promo.giveaway||'Special game-day event',source:'promotion'});
  manual.forEach(e=>events.unshift({id:e.id,phase:e.phase||'PREGAME',icon:e.icon||'✨',title:e.title||'Ballpark Event',detail:e.detail||'',source:'manual'}));
  const phase=live?'IN-GAME':isOff?'OFF-DAY':'PREGAME';
  return {home,away,gameNumber:gameNo,slot,isOff,phase,label:isOff?'OFF-DAY BASEBALL WORLD':`${home?.abbr||'HOME'} BALLPARK LIFE`,events,timeline:events.filter(e=>isOff||['PREGAME','IN-GAME','POSTGAME'].includes(e.phase))};
}

export function buildCrowdPersonality(data={},teams=[],teamId){
  const team=teamById(teams,teamId)||teams[0];
  if(!team)return null;
  const seed=hash(team.id);
  const types=['LOUD FROM THE GATES','LATE-INNING VOLCANO','OLD-SCHOOL HOSTILE','FAMILY CHAOS','RALLY-DRIVEN','CONCOURSE PARTY','NERVOUSLY LOUD'];
  const type=types[seed%types.length];
  return {team,type,loudness:48+(seed%49),booFactor:20+((seed>>3)%61),travelRespect:24+((seed>>5)%68),ritual:pick(['stands on two strikes late','starts a clap from the outfield','boos pickoff attempts immediately','turns every replay into a referendum','sings through pitching changes','gets louder when trailing'],`${team.id}-crowd`)};
}

export function buildCityBuzz(data={},teams=[]){
  return teams.map(t=>{const gp=n(t.wins)+n(t.losses),p=gp?n(t.wins)/gp:.5;const st=String(t.streak||'');const sn=n(st.slice(1));let score=35+p*35+Math.max(0,n(t.runDiff))*.2+(st[0]==='W'?sn*5:st[0]==='L'?-sn*2:0);score=clamp(Math.round(score));return {team:t,score,label:score>=85?'OBSESSED':score>=70?'BASEBALL FEVER':score>=55?'BUZZING':score>=40?'INTERESTED':'QUIET'};}).sort((a,b)=>b.score-a.score);
}

export function buildFanbaseRelationshipNetwork(data={},teams=[]){
  const grudges=buildFanbaseGrudges(data,teams);
  const byPair=new Map(grudges.map(g=>[pairKey(g.teamAId,g.teamBId),g]));
  const rows=[];
  for(let i=0;i<teams.length;i++)for(let j=i+1;j<teams.length;j++){
    const a=teams[i],b=teams[j];const g=byPair.get(pairKey(a.id,b.id));
    const commonEnemies=teams.filter(c=>c.id!==a.id&&c.id!==b.id).map(c=>({team:c,ga:byPair.get(pairKey(a.id,c.id))?.intensity||0,gb:byPair.get(pairKey(b.id,c.id))?.intensity||0})).filter(x=>x.ga>=45&&x.gb>=45).sort((x,y)=>(y.ga+y.gb)-(x.ga+x.gb));
    let affinity=commonEnemies.length?28+Math.min(38,commonEnemies[0].ga*.25+commonEnemies[0].gb*.25):0;
    if(a.league!==b.league)affinity+=8;
    const hostility=g?.intensity||0;
    affinity=Math.max(0,Math.round(affinity-hostility*.45));
    let label='NEUTRAL',score=0,reason='No strong relationship yet';
    if(hostility>=82){label='PERSONAL';score=hostility;reason=g.reason}
    else if(hostility>=62){label='HEATED';score=hostility;reason=g.reason}
    else if(hostility>=40){label='GRUDGE';score=hostility;reason=g.reason}
    else if(hostility>=22){label='TENSE';score=hostility;reason=g.reason}
    else if(affinity>=50){label='ALLIES';score=affinity;reason=commonEnemies[0]?`Shared enemy: ${commonEnemies[0].team.abbr}`:'Fanbases keep finding common ground'}
    else if(affinity>=28){label='FRIENDLY';score=affinity;reason=commonEnemies[0]?`They can agree on disliking ${commonEnemies[0].team.abbr}`:'Surprisingly good vibes'}
    rows.push({teamA:a,teamB:b,teamAId:a.id,teamBId:b.id,label,score,hostility,affinity,reason,commonEnemy:commonEnemies[0]?.team||null});
  }
  return rows.sort((a,b)=>Math.max(b.hostility,b.affinity)-Math.max(a.hostility,a.affinity));
}

export function buildRevengeWatch(data={},teams=[]){
  const finals=(data.games||[]).filter(g=>g?.status==='Final');
  const pairs=new Map();
  finals.forEach(g=>{const m=analyzeGameMagnitude(g,teams);if(m.margin<8)return;const key=pairKey(g.awayTeamId,g.homeTeamId);const winner=n(g.awayScore)>n(g.homeScore)?g.awayTeamId:g.homeTeamId;const loser=winner===g.awayTeamId?g.homeTeamId:g.awayTeamId;const x=pairs.get(key)||{key,winner,loser,count:0,severe:0,maxMargin:0,last:g};x.count++;if(m.margin>=12)x.severe++;x.maxMargin=Math.max(x.maxMargin,m.margin);x.last=x.last||g;pairs.set(key,x)});
  return [...pairs.values()].filter(x=>x.count>=1).map(x=>({ ...x,winnerTeam:teamById(teams,x.winner),loserTeam:teamById(teams,x.loser),label:x.count>=3||x.severe>=2?'REVENGE GAME':x.count>=2?'UNFINISHED BUSINESS':'PAYBACK WATCH',heat:clamp(35+x.count*14+x.severe*12+x.maxMargin)})).sort((a,b)=>b.heat-a.heat).slice(0,8);
}

export function buildConsequenceChains(data={},teams=[]){
  return buildHistoricGameAlerts(data,teams).filter(x=>!x.live).slice(0,5).map(x=>({id:`chain-${x.id}`,source:x.headline||x.detail,steps:[`${x.tier} game enters league memory`,x.margin>=10?`${x.loser?.abbr||'Losing fanbase'} humiliation rises`:'Fan conversation spikes',`${x.away?.abbr||'AWY'}–${x.home?.abbr||'HME'} relationship gets hotter`,x.nickname?`Fans start calling it “${x.nickname}”`:'Media keeps the result in circulation','Next meeting carries more ticket and revenge heat']}));
}

export function buildCulturalAwards(data={},teams=[]){
  const finals=(data.games||[]).filter(g=>g?.status==='Final');
  const mags=finals.map(g=>({g,m:analyzeGameMagnitude(g,teams)})).sort((a,b)=>b.m.score-a.m.score);
  const biggest=mags[0];
  const grudges=buildFanbaseGrudges(data,teams);
  return [
    {award:'Game Everyone Remembers',winner:biggest?`${biggest.m.away?.abbr} ${biggest.g.awayScore} – ${biggest.m.home?.abbr} ${biggest.g.homeScore}`:'Still waiting',detail:biggest?.m.nickname||biggest?.m.tier||'—'},
    {award:'Wildest Inning',winner:biggest?.m.maxInning?`${biggest.m.maxSide} · ${biggest.m.maxInning} runs`:'Still waiting',detail:biggest?.m.maxInningNo?`${ordinal(biggest.m.maxInningNo)} inning`:'—'},
    {award:'Pettiest Rivalry',winner:grudges[0]?`${grudges[0].teamA?.abbr} / ${grudges[0].teamB?.abbr}`:'Still waiting',detail:grudges[0]?.label||'—'},
    {award:'Take That Aged Worst',winner:'SMB media desk',detail:'The receipts folder remains open.'},
  ];
}

const PARK_WORDS_A=['Harbor','Crown','Summit','Liberty','Foundry','Riverside','Union','Pioneer','Victory','Gateway','Heritage','Skyline','Civic','Frontier','Bayfront','Monument'];
const PARK_WORDS_B=['Park','Field','Ballpark','Yard','Grounds','Stadium'];
const SIGNATURE_FOODS=['Loaded garlic fries','Smoked stadium dogs','Grandstand nachos','Chili helmet fries','Caramel corn sundae','Fire-roasted sausage','Loaded tater basket','Ballpark pretzel melt','Street-taco trio','Double-stack stadium burger'];
const FAMOUS_SECTIONS=['The Loud Corner','The Rail','Right Field Rowdies','The Upper Deck Crew','The Bleacher Block','The Home Run Porch','The Grandstand','The Rally Deck'];

export function buildBallparkProfile(data={},team){
  if(!team)return null;
  const override=data.leagueExtras?.ballparks?.[team.id]||{};
  const seed=hash(team.id||team.abbr||team.name);
  const city=team.city||team.abbr||'League';
  const autoName=`${city} ${PARK_WORDS_A[seed%PARK_WORDS_A.length]} ${PARK_WORDS_B[(seed>>4)%PARK_WORDS_B.length]}`;
  const capacity=30000+(seed%10001);
  const crowd=buildCrowdPersonality(data,[team],team.id);
  return {
    team,
    name:override.name||autoName,
    capacity:Math.max(28000,Math.min(45000,Number(override.capacity)||capacity)),
    signatureFood:override.signatureFood||SIGNATURE_FOODS[(seed>>6)%SIGNATURE_FOODS.length],
    famousSection:override.famousSection||FAMOUS_SECTIONS[(seed>>9)%FAMOUS_SECTIONS.length],
    tradition:override.tradition||crowd?.ritual||'gets louder late',
    atmosphere:override.atmosphere||crowd?.type||'BASEBALL CROWD',
    opened:override.opened||`Season ${1+(seed%3)}`,
  };
}

export function buildBallparkDirectory(data={},teams=[]){
  return teams.map(t=>buildBallparkProfile(data,t)).filter(Boolean);
}

const WEATHER_CONDITIONS=['Clear','Partly Cloudy','High Clouds','Crisp & Clear','Warm & Clear','Breezy','Mild','Cool & Clear'];
const WIND_DIRECTIONS=['N','NE','E','SE','S','SW','W','NW'];
export function buildGameConditions(data={},game={},homeTeam=null,awayTeam=null){
  if(!homeTeam)return null;
  const gameNo=n(game?.seasonGameNumber)||n(currentSeasonDay(data,[homeTeam,awayTeam].filter(Boolean))?.gameNumber)||1;
  const key=`${data.activeSeasonName||'season'}-${homeTeam.id||homeTeam.abbr}-${awayTeam?.id||awayTeam?.abbr||'visitor'}-${gameNo}-${game?.id||game?.date||''}`;
  const seed=hash(key);
  const condition=game?.status==='Delay'?'Cloudy / Delay Watch':WEATHER_CONDITIONS[seed%WEATHER_CONDITIONS.length];
  const tempF=56+(seed%33);
  const windMph=2+((seed>>4)%16);
  const windDirection=WIND_DIRECTIONS[(seed>>8)%WIND_DIRECTIONS.length];
  const firstPitch=['Day game','Late afternoon','Under the lights'][(seed>>11)%3];
  const humidity=34+((seed>>13)%43);
  return {condition,tempF,windMph,windDirection,firstPitch,humidity,summary:`${tempF}°F · ${condition}`,wind:`${windDirection} ${windMph} mph`};
}

export function buildAttendanceForecast(data={},teams=[],homeTeamId,awayTeamId,promo=null,rivalry=null){
  const home=teamById(teams,homeTeamId)||teams[0];
  const away=teamById(teams,awayTeamId);
  const park=buildBallparkProfile(data,home);
  if(!park)return null;
  const gp=n(home?.wins)+n(home?.losses); const pct=gp?n(home.wins)/gp:.5;
  const streak=String(home?.streak||''); const streakN=n(streak.slice(1));
  let demand=34+pct*34+Math.max(0,n(home?.runDiff))*.22+safePromo(promo,'attendance')*1.35+safePromo(promo,'hype')*.75+n(rivalry?.heat)*.28;
  if(streak[0]==='W')demand+=streakN*3.5;
  if(away){const ag=n(away.wins)+n(away.losses);demand+=(ag?n(away.wins)/ag:.5)*10;}
  demand=clamp(Math.round(demand));
  const pctFull=Math.max(.48,Math.min(1.02,.43+demand*.006));
  const projected=Math.min(park.capacity,Math.round(park.capacity*pctFull/25)*25);
  const roadShare=Math.max(4,Math.min(32,Math.round(5+(away?((n(away.wins)+1)/(n(away.wins)+n(away.losses)+2))*12:0)+(n(rivalry?.heat)||0)*.08)));
  const cg=data.currentGame||{}; const active=cg.homeTeamId===home?.id&&cg.awayTeamId===away?.id&&['Live','Delay','Final'].includes(cg.status);
  const actual=active?Math.min(park.capacity,Math.max(0,Math.round(projected*(.965+(hash(`${cg.id||cg.date||'game'}-${home?.id}`)%71)/1000)/25)*25)):null;
  return {home,away,park,demand,projected,actual,pctFull:Math.round((actual||projected)/park.capacity*100),roadShare,label:demand>=90?'SELLOUT WATCH':demand>=78?'VERY HIGH':demand>=64?'HIGH':demand>=48?'STEADY':'EASY TICKET'};
}
function safePromo(p,key){return Number(p?.[key]||0)}

export function audienceScaleForSeason(data={}){
  const text=String(data.activeSeasonName||'Season 3');
  const season=Math.max(1,Number(text.match(/\d+/)?.[0]||3));
  return {season,baseGrowth:Math.pow(1.55,Math.max(0,season-3)),leagueMaturity:Math.min(2.4,1+Math.max(0,season-3)*.22)};
}
