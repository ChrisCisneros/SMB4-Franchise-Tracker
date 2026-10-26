import { buildFanClubs, buildMediaUniverse, buildPlayerFanPages } from './livingWorldUtils';
import { buildFanUniverse } from './fandomUtils';
import { buildHeadToHead } from './historyUtils';

const hash=(s='')=>[...String(s)].reduce((n,c)=>((n*33)^c.charCodeAt(0))>>>0,5381);
const seeded=(s='')=>{const x=Math.sin(hash(s))*10000;return x-Math.floor(x)};
const pick=(arr,key)=>arr?.length?arr[Math.floor(seeded(key)*arr.length)%arr.length]:'';
const shuffle=(arr,key)=>[...arr].sort((a,b)=>seeded(`${key}-${a.id||a.handle||a.name}`)-seeded(`${key}-${b.id||b.handle||b.name}`));
const safe=n=>Number(n||0);
const occupied=b=>['first','second','third'].filter(k=>b?.[k]).length;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

export function getLeagueBrand(data={}){
  return {
    name:data.leagueExtras?.officialLeagueName||'Super Mega Baseball League',
    abbr:data.leagueExtras?.officialLeagueAbbr||'SMBL',
    handle:`@${data.leagueExtras?.officialLeagueAbbr||'SMBL'}`,
  };
}

function getTeam(teams,id){return teams.find(t=>t.id===id)||null}
function liveMatchup(game,teams){return {away:getTeam(teams,game?.awayTeamId),home:getTeam(teams,game?.homeTeamId)}}
function recentFinal(data,teams,now){
  const g=data.lastFinalGame;
  if(!g?.awayTeamId||!g?.homeTeamId)return null;
  const t=Date.parse(g.finalizedAt||g.date||'');
  const recent=!Number.isFinite(t)||now-t<45*60*1000;
  return recent?{game:g,away:getTeam(teams,g.awayTeamId),home:getTeam(teams,g.homeTeamId)}:null;
}
function currentBatter(game,data){
  const ids=game?.half==='Bottom'?game.homeLineup:game?.awayLineup;
  const idx=game?.half==='Bottom'?safe(game.homeBatterIndex):safe(game?.awayBatterIndex);
  const id=Array.isArray(ids)?ids[idx%Math.max(1,ids.length)]:'';
  return (data.players||[]).find(p=>p.id===id)||null;
}
function scoreText(game,away,home){return `${away?.abbr||'AWY'} ${safe(game?.awayScore)} – ${home?.abbr||'HME'} ${safe(game?.homeScore)}`}
function inningText(game){const n=safe(game?.inning)||1;return `${game?.half==='Bottom'?'Bottom':'Top'} ${n}`}
function late(game){return safe(game?.inning)>=7}
function close(game){return Math.abs(safe(game?.awayScore)-safe(game?.homeScore))<=2}
function battingTeam(game,away,home){return game?.half==='Bottom'?home:away}
function fieldingTeam(game,away,home){return game?.half==='Bottom'?away:home}
function winningTeam(game,away,home){return safe(game?.awayScore)>safe(game?.homeScore)?away:safe(game?.homeScore)>safe(game?.awayScore)?home:null}
function playType(game){return game?.fieldState?.playEvent?.type||''}
function runnerEvent(game){return game?.fieldState?.runnerEvent||null}
function runsOnPlay(game){return (game?.fieldState?.playEvent?.runnerMoves||[]).filter(m=>m?.scored).length+(runnerEvent(game)?.scored?1:0)}
function playLabel(type){return ({homerun:'HOME RUN',single:'SINGLE',double:'DOUBLE',triple:'TRIPLE',strikeout:'STRIKEOUT',calledstrikeout:'CALLED STRIKEOUT',doubleplay:'DOUBLE PLAY',caughtstealing:'CAUGHT STEALING',walk:'WALK',hitbypitch:'HBP',error:'ERROR',sacfly:'SAC FLY',fielderschoice:"FIELDER'S CHOICE",flyout:'FLYOUT',groundout:'GROUNDOUT',lineout:'LINEOUT',popup:'POP OUT'})[type]||''}
function eventKey(game){return `${game?.fieldState?.playEvent?.id||game?.fieldState?.runnerEvent?.id||game?.fieldState?.cueEvent?.id||0}-${game?.awayScore}-${game?.homeScore}-${game?.inning}-${game?.half}-${game?.outs}`}
function eventBeneficiary(game,away,home){
  const type=playType(game); const batting=battingTeam(game,away,home); const fielding=fieldingTeam(game,away,home);
  if(['single','double','triple','homerun','walk','hitbypitch','error','sacfly'].includes(type)||runsOnPlay(game)>0)return batting;
  if(['flyout','groundout','lineout','popup','strikeout','calledstrikeout','doubleplay','caughtstealing','pickoff1','pickoff2','pickoff3'].includes(type))return fielding;
  if(runnerEvent(game)?.source==='stolen-base')return batting;
  return null;
}
function isBigPlay(game){
  const type=playType(game); const scored=runsOnPlay(game)>0;
  return ['homerun','triple','doubleplay'].includes(type)||scored||Boolean(game?.walkoffCandidate)||(late(game)&&close(game)&&['double','strikeout','calledstrikeout','caughtstealing'].includes(type))||(late(game)&&close(game)&&safe(game?.outs)>=2)||(safe(game?.inning)>=10)||Boolean(runnerEvent(game)?.scored);
}
function teamOfficial(team){return {name:`${team.city||''} ${team.name||team.abbr}`.trim(),handle:`@${team.abbr}Baseball`,badge:'✓ OFFICIAL TEAM',team,kind:'team-official',tone:'team-official'};}

function warmupLines(team,foe,rivalry,key){
  const lines=[
    `Game day. ${foe.abbr} is in town and my productivity is officially over.`,
    `Lineup card, snacks, unreasonable confidence. We are ready for ${team.abbr} baseball.`,
    `I have already decided this game will define my entire mood. Very healthy behavior.`,
    `${team.abbr} fans checking in. What are we feeling before first pitch?`,
    `Warmups are underway and I am talking myself into a masterpiece.`
  ];
  if((rivalry?.heat||0)>=35)lines.push(`${foe.abbr} again. Good. I wanted the stressful version of baseball tonight.`);
  return pick(lines,key);
}
function liveLines(team,foe,game,isBatting,key){
  const diff=team.id===game.awayTeamId?safe(game.awayScore)-safe(game.homeScore):safe(game.homeScore)-safe(game.awayScore);
  const type=playType(game); const bases=occupied(game.bases); const runs=runsOnPlay(game); const lines=[];
  if(type==='homerun'&&isBatting)lines.push(`THAT BALL IS GONE. ${team.abbr} TWITTER, PLEASE BE NORMAL FOR FIVE SECONDS.`);
  if(type==='homerun'&&!isBatting)lines.push(`I would like to unsubscribe from home runs hit by ${foe.abbr}.`);
  if(type==='triple'&&isBatting)lines.push(`A TRIPLE??? We are running until the earth stops spinning.`);
  if(type==='double'&&isBatting&&late(game))lines.push(`That double just changed the whole inning. Keep pushing.`);
  if(type==='single'&&isBatting&&runs)lines.push(`BASE HIT. RUN IN. Keep the line moving.`);
  if(['strikeout','calledstrikeout'].includes(type)&&!isBatting)lines.push(type==='calledstrikeout'?`BACKWARDS K. Paint it and frame it.`:`BIG K. Needed every bit of that.`);
  if(['strikeout','calledstrikeout'].includes(type)&&isBatting)lines.push(`You cannot leave that at-bat there. Reset and go get the next one.`);
  if(type==='doubleplay'&&!isBatting)lines.push(`TURN TWO. Absolutely gorgeous.`);
  if(type==='doubleplay'&&isBatting)lines.push(`A double play is a personal attack.`);
  if(type==='caughtstealing'&&!isBatting)lines.push(`THROWN OUT. Do not run on us.`);
  if(type==='caughtstealing'&&isBatting)lines.push(`Okay maybe we simply never speak of that steal attempt again.`);
  if(runnerEvent(game)?.source==='stolen-base'&&isBatting)lines.push(runnerEvent(game)?.scored?`STEALING HOME??? ABSOLUTE CHAOS.`:`TAKE THE BAG. Love the aggression.`);
  if(type==='walk'&&isBatting)lines.push(`Take your base. Make them pay for it.`);
  if(type==='hitbypitch'&&isBatting)lines.push(`Free baserunner. Fine. Put it on the scoreboard.`);
  if(type==='error'&&isBatting)lines.push(`Pressure creates mistakes. Keep moving.`);
  if(game.walkoffCandidate&&team.id===game.homeTeamId)lines.push(`DID WE JUST WALK THIS OFF??? THE PLACE IS ERUPTING.`);
  if(safe(game.inning)>=10)lines.push(`Extra innings. I have work tomorrow. Nobody involved cares.`);
  if(late(game)&&close(game))lines.push(`${inningText(game)}. ${scoreText(game,getTeam([team,foe],game.awayTeamId),getTeam([team,foe],game.homeTeamId))}. My heart rate is not league approved.`);
  if(bases>=2&&isBatting)lines.push(`${bases===3?'BASES LOADED':'Traffic everywhere'} with ${game.outs} out${game.outs===1?'':'s'}. Please cash this in.`);
  if(bases>=2&&!isBatting)lines.push(`There are too many runners on base. I dislike this development.`);
  if(diff>=4)lines.push(`I am choosing to enjoy this lead and absolutely not think about baseball's capacity for violence.`);
  if(diff<=-4)lines.push(`Okay, the comeback starts with one baserunner. I have moved into bargaining.`);
  if(diff>0&&late(game))lines.push(`Protect. The. Lead.`);
  if(diff<0&&late(game))lines.push(`We need a rally immediately. Not in ten minutes. Now.`);
  if(diff===0&&late(game))lines.push(`Tie game late. Nobody breathe.`);
  if(!lines.length)lines.push(isBatting?`Every pitch feels like something is about to happen.`:`Need a clean inning here. No nonsense.`);
  return pick(lines,key);
}
function postgameLines(team,foe,game,key){
  const won=game.winnerTeamId===team.id||(team.id===game.awayTeamId?safe(game.awayScore)>safe(game.homeScore):safe(game.homeScore)>safe(game.awayScore));
  const lines=won?[
    `WIN COLUMN. ${team.abbr} fans can sleep happy tonight.`,
    `I do not care how pretty it was. Put the W on the board.`,
    `${scoreText(game,getTeam([team,foe],game.awayTeamId),getTeam([team,foe],game.homeTeamId))}. Screenshot it. Save the receipts.`,
    `Postgame mood: highlights on repeat.`
  ]:[
    `I have prepared a calm and rational postgame response: absolutely not.`,
    `Flush it. Tomorrow exists. Unfortunately so does the box score.`,
    `I will be analyzing every missed chance for the next several hours.`,
    `Not the result. Still our team. See everyone next game.`
  ];
  if(game.walkoff)lines.push(won?`A WALK-OFF. Nobody leave the ballpark. We live here now.`:`Walk-off losses should be illegal.`);
  return pick(lines,key);
}

function teamOfficialLine(team,foe,game,phase,isBatting,state,rivalry,key,bucket){
  const acct=teamOfficial(team); const type=playType(game); const beneficiary=eventBeneficiary(game,getTeam([team,foe],game.awayTeamId),getTeam([team,foe],game.homeTeamId)); const ours=beneficiary?.id===team.id; const runs=runsOnPlay(game);
  if(phase==='warmup'){
    const promo=[
      `Tonight's matchup is set: ${foe.abbr} vs ${team.abbr}. Gates are open — come make some noise.`,
      `Game day gear is live in the ${team.abbr} Team Store. Rep the colors from first pitch to final out.`,
      `${(rivalry?.heat||0)>=45?'Rivalry night. ':''}Limited game-day ticket inventory is available now.`,
      `Warmups are underway. Drop your score prediction below and get ready for ${team.abbr} baseball.`
    ];
    return {...acct,id:`${key}-teamofficial-${team.id}`,text:pick(promo,`${key}-promo`),time:'pregame'};
  }
  if(phase==='postgame'){
    const won=game.winnerTeamId===team.id||(team.id===game.awayTeamId?safe(game.awayScore)>safe(game.homeScore):safe(game.homeScore)>safe(game.awayScore));
    const lines=won?[
      `FINAL: ${scoreText(game,getTeam([team,foe],game.awayTeamId),getTeam([team,foe],game.homeTeamId))}. That's a ${team.abbr} WIN.`,
      `W secured. Highlights are rolling and the ${team.abbr} postgame collection is live in the Team Store.`
    ]:[
      `FINAL: ${scoreText(game,getTeam([team,foe],game.awayTeamId),getTeam([team,foe],game.homeTeamId))}. We'll be back.`,
      `Final from the ballpark. Thank you to every ${team.abbr} fan who showed up and stayed loud.`
    ];
    return {...acct,id:`${key}-teamofficial-${team.id}`,text:pick(lines,`${key}-final`),time:'postgame'};
  }
  if(ours){
    const lines=[];
    if(isBatting&&String(game?.lastAnnouncement||'').startsWith('Score update:'))lines.push(`📣 RUNS ON THE BOARD. ${team.abbr} changes the score in the ${inningText(game).toLowerCase()}.`);
    if(type==='homerun')lines.push(`💥 HOME RUN ${team.abbr}! That one is GONE.`);
    if(type==='triple')lines.push(`⚡ THREE BAGS. ${team.abbr} is flying around the bases.`);
    if(type==='double'&&(late(game)||runs))lines.push(`🔥 DOUBLE! ${team.abbr} puts pressure on with a big extra-base hit.`);
    if(type==='single'&&runs)lines.push(`📣 BASE HIT, RUN SCORES. ${team.abbr} delivers.`);
    if(['strikeout','calledstrikeout'].includes(type))lines.push(`K. Big pitch, big out. ${team.abbr} gets it done.`);
    if(type==='doubleplay')lines.push(`🧤 TURN TWO! ${team.abbr} erases the threat.`);
    if(type==='caughtstealing')lines.push(`🚫 CAUGHT STEALING. Not today.`);
    if(runnerEvent(game)?.source==='stolen-base')lines.push(runnerEvent(game)?.scored?`🏃 STEAL OF HOME! ${team.abbr} catches everyone sleeping.`:`🏃 STOLEN BASE. ${team.abbr} is on the move.`);
    if(type==='sacfly'&&runs)lines.push(`Productive out, run home. ${team.abbr} adds one.`);
    if(runs>=2)lines.push(`🔥 ${runs} runs cross on the play. The inning belongs to ${team.abbr}.`);
    if(lines.length)return {...acct,id:`${key}-teamofficial-${team.id}`,text:pick(lines,`${key}-event`),time:'now'};
  }
  const cadence=(hash(team.id)%5+5)%5;
  if(bucket%5===cadence){
    const slow=[
      `Stay with us. ${scoreText(game,getTeam([team,foe],game.awayTeamId),getTeam([team,foe],game.homeTeamId))} — ${inningText(game)}.`,
      `${team.abbr} game-day merch is available now in the Team Store.`,
      `${state?.atmosphere||'GAME DAY'} energy tonight. Keep it loud, ${team.abbr} fans.`
    ];
    return {...acct,id:`${key}-teamofficial-${team.id}`,text:pick(slow,`${key}-slow`),time:'live'};
  }
  return null;
}

function officialMoment(game,away,home,brand){
  const type=playType(game); const bt=battingTeam(game,away,home); const ft=fieldingTeam(game,away,home);
  if(game?.status==='Final')return `${brand.abbr} FINAL: ${scoreText(game,away,home)}.`;
  if(game?.walkoffCandidate)return `🚨 ${brand.abbr} MOMENT: ${home.abbr} has taken the lead in walk-off territory.`;
  if(type==='homerun')return `💥 ${brand.abbr} HOME RUN: ${bt?.abbr||''} goes deep in the ${inningText(game).toLowerCase()}.`;
  if(type==='triple'&&late(game))return `⚡ ${brand.abbr} BIG PLAY: late-game triple for ${bt?.abbr||'the batting club'}.`;
  if(runsOnPlay(game)>=2&&late(game))return `🔥 ${brand.abbr} SWING: ${runsOnPlay(game)} runs score for ${bt?.abbr||'the offense'} in the ${inningText(game).toLowerCase()}.`;
  if(['strikeout','calledstrikeout'].includes(type)&&late(game)&&close(game))return `⚡ ${brand.abbr} CLUTCH K: ${ft?.abbr||'the defense'} gets a huge strikeout in the ${inningText(game).toLowerCase()}.`;
  if(type==='doubleplay'&&late(game))return `🧤 ${brand.abbr} TURN TWO: ${ft?.abbr||'the defense'} escapes with a massive double play.`;
  if(runnerEvent(game)?.source==='stolen-base'&&runnerEvent(game)?.scored)return `🚨 ${brand.abbr} CHAOS: a steal of home changes the game.`;
  if(safe(game?.inning)>=10)return `🌙 ${brand.abbr} EXTRA INNINGS: ${away.abbr} and ${home.abbr} are still going.`;
  if(late(game)&&String(game?.lastAnnouncement||'').startsWith('Score update:'))return `📣 ${brand.abbr} SCORE UPDATE: ${scoreText(game,away,home)} in the ${inningText(game).toLowerCase()}.`;
  if(late(game)&&close(game)&&safe(game?.outs)===2&&occupied(game?.bases)>=2)return `👀 ${brand.abbr} HIGH LEVERAGE: ${scoreText(game,away,home)}, ${inningText(game)}, two outs and traffic on the bases.`;
  const battingHits=game?.half==='Top'?safe(game.awayHits):safe(game.homeHits);
  const oppHits=game?.half==='Top'?safe(game.homeHits):safe(game.awayHits);
  if(safe(game?.inning)>=6&&oppHits===0&&battingHits>=0)return `👀 ${brand.abbr} WATCH: a no-hit bid is still alive through ${Math.max(1,safe(game.inning)-1)} completed innings.`;
  return '';
}

function liveWatchingCount(phase,game,awayState,homeState,rivalry,bucket){
  const heat=safe(awayState?.marketHeat)+safe(homeState?.marketHeat);
  const hype=safe(awayState?.hype)+safe(homeState?.hype);
  let viewers=1400+heat*115+hype*45+safe(rivalry?.heat)*135;
  if(game?.gameType==='playoff')viewers+=18000;
  if(late(game)&&close(game))viewers+=11000;
  if(safe(game?.inning)>=9&&close(game))viewers+=7000;
  if(safe(game?.inning)>=10)viewers+=8500;
  if(isBigPlay(game))viewers+=6500;
  if(game?.walkoffCandidate)viewers+=12000;
  if(occupied(game?.bases)>=2&&late(game))viewers+=3500;
  if(phase==='warmup')viewers*=.48;
  if(phase==='postgame')viewers*=.68;
  const jitter=.94+seeded(`watch-${bucket}-${game?.awayTeamId}-${game?.homeTeamId}`)*.14;
  return Math.max(250,Math.round(viewers*jitter/25)*25);
}

export function buildGameDaySocial(data={},teams=[],playoffPicture=[],now=Date.now()){
  const game=data.currentGame||{}; const matchup=liveMatchup(game,teams); const recent=recentFinal(data,teams,now);
  let phase='idle', activeGame=null, away=null, home=null;
  if(matchup.away&&matchup.home){activeGame=game;away=matchup.away;home=matchup.home;phase=game.status==='Live'||game.status==='Delay'?'live':'warmup';}
  else if(recent?.away&&recent?.home){activeGame=recent.game;away=recent.away;home=recent.home;phase='postgame';}
  if(!activeGame||!away||!home)return {phase:'idle',posts:[],awayPosts:[],homePosts:[],leaguePosts:[],away:null,home:null,brand:getLeagueBrand(data),watching:0};

  const brand=getLeagueBrand(data); const bucket=Math.floor(now/(phase==='live'?7000:14000));
  const universe=buildFanUniverse(data,teams,playoffPicture); const clubs=buildFanClubs(data,teams,playoffPicture); const media=buildMediaUniverse(); const playerPages=buildPlayerFanPages(data,teams);
  const rivalries=buildHeadToHead(data.games||[],teams,data.seasonHistory||[]);
  const rivalry=rivalries.find(r=>(r.teamAId===away.id&&r.teamBId===home.id)||(r.teamAId===home.id&&r.teamBId===away.id));
  const teamStates=new Map(universe.teamStates.map(x=>[x.team.id,x]));
  const awayState=teamStates.get(away.id); const homeState=teamStates.get(home.id);
  const keyBase=`${phase}-${bucket}-${eventKey(activeGame)}-${away.id}-${home.id}`;

  function teamPosts(team,foe){
    const clubPool=clubs.filter(c=>c.team.id===team.id); const state=teamStates.get(team.id); const isBatting=battingTeam(activeGame,away,home)?.id===team.id;
    const posts=[];
    shuffle(clubPool,`${keyBase}-${team.id}`).slice(0,2).forEach((club,i)=>{
      const text=phase==='warmup'?warmupLines(team,foe,rivalry,`${keyBase}-warm-${team.id}-${i}`):phase==='postgame'?postgameLines(team,foe,activeGame,`${keyBase}-post-${team.id}-${i}`):liveLines(team,foe,activeGame,isBatting,`${keyBase}-live-${team.id}-${i}`);
      posts.push({id:`${keyBase}-${club?.id||team.id}-${i}`,kind:'fan',name:club?.name||`${team.abbr} Fans`,handle:club?.handle||`@${team.abbr}Fans`,badge:club?.archetype?.label||'Fan Page',team,text,tone:phase==='live'&&isBigPlay(activeGame)?'spicy':state?.approval<35?'down':'neutral',time:phase==='warmup'?'pregame':phase==='postgame'?'postgame':'live'});
    });
    const officialTeamPost=teamOfficialLine(team,foe,activeGame,phase,isBatting,state,rivalry,keyBase,bucket);
    if(officialTeamPost)posts.unshift(officialTeamPost);
    const playerCandidates=playerPages.filter(p=>p.team?.id===team.id);
    if(playerCandidates.length&&phase==='live'&&(playType(activeGame)||runnerEvent(activeGame))){
      const p=pick(playerCandidates,`${keyBase}-player-${team.id}`); const type=playType(activeGame);
      posts.push({id:`${keyBase}-stan-${team.id}`,kind:'player',name:p.name,handle:p.handle,badge:'Player Fan Page',team,text:type==='homerun'&&isBatting?`${p.player.name} agenda is being pushed with EXTREME force right now.`:type.includes('strikeout')?`Baseball is cruel. We remain on the ${p.player.name} agenda.`:`Posting ${p.player.name} propaganda through every pitch.`,tone:'up',time:'live'});
    }
    if((rivalry?.games||0)>0&&phase!=='postgame')posts.push({id:`${keyBase}-rival-${team.id}`,kind:'rivalry',name:`${team.abbr} Rivalry Department`,handle:`@${team.abbr}RivalryDept`,badge:`${Math.round(rivalry?.heat||25)} HEAT`,team,text:pick([`${foe.abbr} fans are already in our mentions. Beautiful.`,`This matchup has exactly the correct amount of mutual disrespect.`,`Saving receipts from ${foe.abbr} fans for later.`],`${keyBase}-chirp-${team.id}`),tone:'spicy',time:'live'});
    return posts;
  }

  const awayPosts=teamPosts(away,home); const homePosts=teamPosts(home,away); const leaguePosts=[];
  const official=officialMoment({...activeGame,status:phase==='postgame'?'Final':activeGame.status},away,home,brand);
  if(official&&(phase==='postgame'||isBigPlay(activeGame)||safe(activeGame.inning)>=6))leaguePosts.push({id:`${keyBase}-official`,kind:'league',name:brand.name,handle:brand.handle,badge:'✓ OFFICIAL',team:null,text:official,tone:'official',time:'now'});
  if(phase==='warmup')leaguePosts.push({id:`${keyBase}-official-warm`,kind:'league',name:brand.name,handle:brand.handle,badge:'✓ OFFICIAL',team:null,text:`Game day: ${away.abbr} at ${home.abbr}. Warmups are underway.`,tone:'official',time:'pregame'});
  if(phase==='postgame'&&!official)leaguePosts.push({id:`${keyBase}-official-final`,kind:'league',name:brand.name,handle:brand.handle,badge:'✓ OFFICIAL',team:null,text:`FINAL: ${scoreText(activeGame,away,home)}.`,tone:'official',time:'postgame'});

  shuffle(media,`${keyBase}-media`).slice(0,2).forEach((m,i)=>{
    const winner=winningTeam(activeGame,away,home); const batter=currentBatter(activeGame,data); const type=playType(activeGame);
    const text=phase==='warmup'?pick([`${away.abbr}-${home.abbr} has my attention tonight. Watch the first two innings for the tone.`,`Pregame question: which fanbase is going to be louder by the third inning?`],`${keyBase}-m-${i}`):phase==='postgame'?`${winner?.abbr||'One side'} got the result. Now comes the overreaction cycle.`:type==='homerun'?`That swing changed the temperature in this game immediately.`:late(activeGame)&&close(activeGame)?`${inningText(activeGame)} and one swing can flip everything. This is the good stuff.`:batter?`${batter.name} at the plate. This is where the fanbase starts bargaining with the baseball gods.`:`The game is settling into its shape. Somebody will break it.`;
    leaguePosts.push({id:`${keyBase}-media-${m.id}`,kind:'media',name:m.name,handle:m.handle,badge:`${m.role} · ${m.show}`,team:null,text,tone:m.style==='hot'?'spicy':'media',time:'live'});
  });

  const watching=liveWatchingCount(phase,activeGame,awayState,homeState,rivalry,bucket);
  const posts=shuffle([...awayPosts,...homePosts,...leaguePosts],`${keyBase}-all`);
  return {phase,game:activeGame,away,home,rivalry,brand,posts,awayPosts,homePosts,leaguePosts,score:scoreText(activeGame,away,home),inning:phase==='live'?inningText(activeGame):'',play:playLabel(playType(activeGame)),isBigMoment:isBigPlay(activeGame),watching};
}
