import { buildFanClubs, buildMediaUniverse, buildPlayerFanPages } from './livingWorldUtils';
import { buildFanUniverse } from './fandomUtils';
import { buildHeadToHead } from './historyUtils';
import { getCurrentGameNight, getScheduledGameNight } from './gameNightUtils';
import { currentSeasonDay, isCalendarAnchorGame } from './seasonCalendarUtils';
import { ceremonyForGame, ceremonySocialLines } from './ceremonyUtils';
import { pickSocialPhrase } from './socialPhraseBank';
import { analyzeGameMagnitude,buildFanbaseRelationshipNetwork } from './ballparkLifeUtils';

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
  return recent?{game:g,away:getTeam(teams,g.awayTeamId),home:getTeam(teams,g.homeTeamId),ageMs:Number.isFinite(t)?Math.max(0,now-t):0}:null;
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
function freshEvent(e,maxAge=18000){if(!e)return null;const id=Number(e.id||0);return !id||Date.now()-id<=maxAge?e:null}
function explicitEvent(game){return freshEvent(game?.fieldState?.socialEvent)||freshEvent(game?.fieldState?.playEvent)||freshEvent(game?.fieldState?.runnerEvent)||freshEvent(game?.fieldState?.cueEvent)||null}
function eventSide(game){const e=explicitEvent(game);return e?.battingSide||e?.side||null}
function eventBattingTeam(game,away,home){const e=explicitEvent(game);const side=e?.battingSide||e?.side;return side==='away'?away:side==='home'?home:battingTeam(game,away,home)}
function eventFieldingTeam(game,away,home){const e=explicitEvent(game);const side=e?.fieldingSide||(e?.battingSide==='away'?'home':e?.battingSide==='home'?'away':null);return side==='away'?away:side==='home'?home:fieldingTeam(game,away,home)}
function playType(game){const e=explicitEvent(game);if(e?.type)return e.type;const cue=e?.kind;return ['strikeout','calledstrikeout'].includes(cue)?cue:''}
function runnerEvent(game){return freshEvent(game?.fieldState?.runnerEvent)||null}
function runsOnPlay(game){return (game?.fieldState?.playEvent?.runnerMoves||[]).filter(m=>m?.scored).length+(runnerEvent(game)?.scored?1:0)}
function playLabel(type){return ({homerun:'HOME RUN',single:'SINGLE',double:'DOUBLE',triple:'TRIPLE',strikeout:'STRIKEOUT',calledstrikeout:'CALLED STRIKEOUT',doubleplay:'DOUBLE PLAY',caughtstealing:'CAUGHT STEALING',walk:'WALK',hitbypitch:'HBP',error:'ERROR',sacfly:'SAC FLY',fielderschoice:"FIELDER'S CHOICE",flyout:'FLYOUT',groundout:'GROUNDOUT',lineout:'LINEOUT',popup:'POP OUT'})[type]||''}
function eventKey(game){return `${game?.fieldState?.socialEvent?.id||game?.fieldState?.playEvent?.id||game?.fieldState?.runnerEvent?.id||game?.fieldState?.cueEvent?.id||0}-${game?.awayScore}-${game?.homeScore}-${game?.inning}-${game?.half}-${game?.outs}`}
function eventToken(game){const e=explicitEvent(game);return e?.id?`event-${e.id}`:`state-${game?.awayScore}-${game?.homeScore}-${game?.inning}-${game?.half}-${game?.outs}`}
function eventEndedHalf(game){const side=eventSide(game);if(!side)return false;const current=game?.half==='Bottom'?'home':'away';return side!==current&&safe(game?.outs)===0}
function eventInningText(game){const e=explicitEvent(game);const n=safe(e?.inning)||safe(game?.inning)||1;const half=e?.half|| (e?.side==='home'?'Bottom':e?.side==='away'?'Top':game?.half);return `${half==='Bottom'?'Bottom':'Top'} ${n}`}
function eventBeneficiary(game,away,home){
  const e=explicitEvent(game); const explicit=e?.beneficiarySide;
  if(explicit==='away')return away;if(explicit==='home')return home;
  const type=playType(game); const batting=eventBattingTeam(game,away,home); const fielding=eventFieldingTeam(game,away,home);
  if(['single','double','triple','homerun','walk','hitbypitch','error','sacfly'].includes(type)||runsOnPlay(game)>0)return batting;
  if(['flyout','groundout','lineout','popup','strikeout','calledstrikeout','doubleplay','caughtstealing','pickoff1','pickoff2','pickoff3'].includes(type))return fielding;
  if(runnerEvent(game)?.source==='stolen-base')return batting;
  return null;
}
function isBigPlay(game){
  const type=playType(game); const scored=runsOnPlay(game)>0;
  return ['homerun','triple','doubleplay'].includes(type)||scored||Boolean(game?.walkoffCandidate)||(['strikeout','calledstrikeout'].includes(type)&&eventEndedHalf(game))||(late(game)&&close(game)&&['double','strikeout','calledstrikeout','caughtstealing'].includes(type))||(late(game)&&close(game)&&safe(game?.outs)>=2)||(safe(game?.inning)>=10)||Boolean(runnerEvent(game)?.scored);
}
function teamOfficial(team){return {name:`${team.city||''} ${team.name||team.abbr}`.trim(),handle:`@${team.abbr}Baseball`,badge:'✓ OFFICIAL TEAM',team,kind:'team-official',tone:'team-official'};}

function warmupLines(team,foe,rivalry,key){
  const lines=[
    `Game day. ${foe.abbr} is in town and my productivity is officially over.`,
    `Lineup card, snacks, unreasonable confidence. We are ready for ${team.abbr} baseball.`,
    `I have already decided this game will define my entire mood. Very healthy behavior.`,
    `${team.abbr} fans checking in. What are we feeling before first pitch?`,
    `Warmups are underway and I am talking myself into a masterpiece.`,
    `I would like one calm baseball game. I understand this request will be ignored.`,
    `Prediction: ${team.abbr} wins and I spend three hours pretending I was never worried.`,
    `The pregame optimism has reached irresponsible levels.`,
    `Checking in early so I can claim I believed before things got weird.`,
    `Nothing has happened yet and I am already pacing. Baseball is back.`,
    `I need first pitch immediately. The waiting is worse than the actual stress.`,
    `Today's agenda: score first, add on, do not make me learn new forms of anxiety.`,
    `Every fanbase thinks tonight is the night. Ours is obviously correct.`,
    `Pregame take I may regret later: I like this matchup for ${team.abbr}.`,
    `One clean first inning and I promise to become completely reasonable. Probably.`
  ];
  if((rivalry?.heat||0)>=35)lines.push(`${foe.abbr} again. Good. I wanted the stressful version of baseball tonight.`,`Rivalry night means every harmless single will be treated like a declaration of war.`,`Saving screenshots now. Somebody is getting receipts after this one.`);
  return pick(lines,key);
}
function delayLines(team,foe,game,key){
  const reason=game?.delayReason||'Delay';
  const lines=[
    `${reason}. The concourse has officially become the main event for a while.`,
    `${reason} and now everybody is checking the radar, the scoreboard, and their snack situation.`,
    `We have entered the dangerous part of the night where fans start making friends with strangers in line for food.`,
    `Baseball is paused. The group chat absolutely is not.`,
    `Delay update: morale holding, patience questionable, concession spending rising.`,
    `The field is quiet and the stands somehow got louder.`,
    `If this delay lasts much longer, somebody is going to start a full stadium singalong.`,
    `${team.abbr} fans have turned waiting into its own competitive sport.`,
    `Nothing tests a fanbase like being told to sit with its thoughts between pitches.`,
    `The booth is filling time and the internet is doing what it does best: making everything weird.`
  ];
  if(/weather/i.test(reason))lines.push(`Every person in the building is suddenly a meteorologist.`,`Radar screenshots are now the hottest content in ${team.abbr} circles.`);
  if(/ceremony/i.test(reason))lines.push(`Honestly, if the ceremony runs long, let it. Some nights deserve the extra moment.`,`The hardware is getting its time. First pitch can wait a minute.`);
  if(/technical|field/i.test(reason))lines.push(`Somebody somewhere is holding a wrench and feeling tremendous pressure.`,`The grounds crew just became the most important unit in the organization.`);
  return pick(lines,key);
}

function liveLines(team,foe,game,isBatting,key){
  const diff=team.id===game.awayTeamId?safe(game.awayScore)-safe(game.homeScore):safe(game.homeScore)-safe(game.awayScore);
  const type=playType(game); const bases=occupied(game.bases); const runs=runsOnPlay(game); const lines=[]; const ended=eventEndedHalf(game);
  if(type==='homerun'&&isBatting)lines.push(
    `THAT BALL IS GONE. ${team.abbr} INTERNET, PLEASE BE NORMAL FOR FIVE SECONDS.`,
    `NO DOUBTER. I stood up before it landed.`,
    `GOODBYE BASEBALL. HELLO UNREASONABLE CONFIDENCE.`,
    `I am watching that swing twelve more times. Minimum.`,
    `The sound off the bat told the entire story.`,
    `Put that baseball on a missing-person poster.`,
    `That thing left in a HURRY.`,
    `Somebody check on the people who were still finding their seats.`,
    `We are so unbelievably back.`,
    `I have seen enough. Build the statue.`
  );
  if(type==='homerun'&&!isBatting)lines.push(
    `I would like to unsubscribe from home runs hit by ${foe.abbr}.`,
    `That pitch can never be thrown again. Please erase it from the playbook.`,
    `Cool. Great. Love giving baseballs free air travel.`,
    `I knew it was gone immediately and still watched in disbelief.`,
    `Somewhere there was a better pitch selection. We did not choose it.`,
    `I am choosing to blame the dimensions, the weather, and several cosmic forces.`,
    `Well that escalated quickly.`,
    `Can we get the ball back and pretend none of that happened?`
  );
  if(type==='triple'&&isBatting)lines.push(`A TRIPLE??? We are running until the earth stops spinning.`,`Three bags! Baseball needs more triples and specifically more triples for us.`,`That ball found grass and suddenly everybody was sprinting.`,`The outfield gap just became a racetrack.`,`Triples are chaos distilled into one beautiful play.`,`I looked down for one second and suddenly we are standing on third.`);
  if(type==='double'&&isBatting)lines.push(`Two bags. Keep the pressure on.`,`That double opened this inning right up.`,`Gap shot! Now make it hurt.`,`That is exactly the kind of extra-base hit this inning needed.`,`Standing on second and the whole dugout just got louder.`,`Into the gap and suddenly the pressure meter jumped.`);
  if(type==='single'&&isBatting&&runs)lines.push(`BASE HIT. RUN IN. Keep the line moving.`,`That is a beautiful little piece of situational baseball.`,`Nothing fancy. Just put the run on the board.`,`Single, RBI, thank you very much.`,`Put it where they are not and let the scoreboard handle the rest.`,`That is a tiny hit with a very loud consequence.`);
  if(['strikeout','calledstrikeout'].includes(type)&&!isBatting){
    if(ended)lines.push(`K TO END THE INNING. Exhale.`,`STRIKE THREE. INNING OVER. That is how you shut the door.`,`Huge K. Threat erased. Everybody unclench.`,`Needed one pitch. Got one pitch. Side retired.`,`That inning was trying to become a problem. Not anymore.`);
    lines.push(type==='calledstrikeout'?`BACKWARDS K. Paint it and frame it.`:`BIG K. Needed every bit of that.`,`Sit down. Thank you very much.`,`That strikeout had some ATTITUDE on it.`,`Exactly when we needed a punchout.`,`Filthy. Completely unfair. I approve.`,`Two strikes and then goodnight.`,`That at-bat belonged to the defense from the jump.`);
  }
  if(['strikeout','calledstrikeout'].includes(type)&&isBatting){
    if(ended)lines.push(`Stranded them. That one hurts.`,`Ending the inning like THAT is going to bother me for a while.`,`We had a chance and watched it disappear. Cool cool cool.`);
    lines.push(`You cannot leave that at-bat there. Reset and go get the next one.`,`I had a whole rally planned in my head and then that happened.`,`Tip the cap, complain quietly, move on.`,`That was not the ending I ordered for this plate appearance.`,`Okay. New inning, new emotional damage.`,`I would like that at-bat back, please.`);
  }
  if(type==='doubleplay'&&!isBatting)lines.push(`TURN TWO. Absolutely gorgeous.`,`Two for the price of one. Gorgeous baseball.`,`That double play just saved everybody's blood pressure.`,`Pitcher's best friend reporting for duty.`,`ROLL IT. Threat deleted.`,`Six-four-three therapy session.`,`That rally just hit a brick wall shaped like a double play.`,`Nothing calms a stadium like two outs on one ball.`);
  if(type==='doubleplay'&&isBatting)lines.push(`A double play is a personal attack.`,`Nothing makes a rally evaporate faster. Pain.`,`The inning had dreams. The double play had other plans.`,`Delete that ground ball from history.`,`We went from traffic to silence in one ground ball.`,`That is the baseball equivalent of stepping on a rake.`,`I would like to appeal the existence of double plays.`);
  if(type==='caughtstealing'&&!isBatting)lines.push(`THROWN OUT. Do not run on us.`,`Nope. Bag closed.`,`Caught stealing and the vibes improve immediately.`,`That jump was not good enough. Sit down.`,`The catcher just sent a very clear message.`,`Risk assessed. Risk denied.`,`That base was not available for purchase.`);
  if(type==='caughtstealing'&&isBatting)lines.push(`Okay maybe we simply never speak of that steal attempt again.`,`Aggression is fun until the umpire says out.`,`That was ambitious. I will leave it at that.`,`We tested the arm. The arm passed.`,`I support aggression conceptually. Not that specific aggression.`,`That steal attempt has been removed from my personal memory.`);
  if(runnerEvent(game)?.source==='stolen-base'&&isBatting)lines.push(runnerEvent(game)?.scored?`STEALING HOME??? ABSOLUTE CHAOS.`:`TAKE THE BAG. Love the aggression.`,`RUN. RUN. RUN. That is free real estate.`,`Speed changes everything.`);
  if(type==='walk'&&isBatting)lines.push(`Take your base. Make them pay for it.`,`Four balls is a hit in my heart.`,`Free baserunner. I accept this gift.`,`Good eye. Now cash it in.`);
  if(type==='hitbypitch'&&isBatting)lines.push(`Free baserunner. Fine. Put it on the scoreboard.`,`Ow. Also: first base.`,`Not how I wanted the rally to start, but we take those.`);
  if(type==='error'&&isBatting)lines.push(`Pressure creates mistakes. Keep moving.`,`Thank you for the extra out. Please make it expensive.`,`Baseball gods just handed us something. Do not waste it.`);
  if(game.walkoffCandidate&&team.id===game.homeTeamId)lines.push(`DID WE JUST WALK THIS OFF??? THE PLACE IS ERUPTING.`,`EVERYBODY IS RUNNING ONTO THE FIELD. WHAT JUST HAPPENED.`,`BALLGAME. ABSOLUTE SCENES.`);
  if(safe(game.inning)>=10)lines.push(`Extra innings. I have work tomorrow. Nobody involved cares.`,`Free baseball, paid anxiety.`,`We have entered the portion of the evening where every pitch feels illegal.`);
  if(late(game)&&close(game))lines.push(`${inningText(game)}. My heart rate is not league approved.`,`Every pitch has become a referendum on my happiness.`,`This is objectively great baseball and subjectively terrible for me.`);
  if(bases>=2&&isBatting)lines.push(`${bases===3?'BASES LOADED':'Traffic everywhere'} with ${game.outs} out${game.outs===1?'':'s'}. Please cash this in.`,`This inning is begging for the big hit.`,`The table is set. Somebody eat.`);
  if(bases>=2&&!isBatting)lines.push(`There are too many runners on base. I dislike this development.`,`One clean pitch away from peace. Please.`,`This is where I begin negotiating with the baseball gods.`);
  if(diff>=4)lines.push(`I am choosing to enjoy this lead and absolutely not think about baseball's capacity for violence.`,`Comfortable lead. Allegedly.`,`I would like several more insurance runs because I know this sport.`);
  if(diff<=-4)lines.push(`Okay, the comeback starts with one baserunner. I have moved into bargaining.`,`I've seen stranger things. Not many, but stranger things.`,`Just win the next inning. Then lie to me again.`);
  if(diff>0&&late(game))lines.push(`Protect. The. Lead.`,`Six outs feel like sixty.`,`Insurance runs are not optional. They are emotional support.`);
  if(diff<0&&late(game))lines.push(`We need a rally immediately. Not in ten minutes. Now.`,`Someone start the comeback montage.`,`One baserunner. Then another. Do not make this complicated.`);
  if(diff===0&&late(game))lines.push(`Tie game late. Nobody breathe.`,`This is why we watch and also why we age.`,`One swing decides who gets to be unbearable online tonight.`);
  if(!lines.length)lines.push(
    isBatting?`Every pitch feels like something is about to happen.`:`Need a clean inning here. No nonsense.`,
    isBatting?`Work the count. Find a mistake.`:`First-pitch strikes would improve my quality of life.`,
    isBatting?`Just get somebody on and let the inning build itself.`:`No free passes. Make them earn everything.`,
    isBatting?`The rally has to start somewhere.`:`Routine inning. I am asking for one routine inning.`,
    isBatting?`I am once again requesting a baseball into the gap.`:`Attack the zone and let the defense work.`,
    `This game has that weird quiet feeling before something happens.`,
    `Baseball is ninety percent waiting for your next emotional emergency.`
  );
  return pick(lines,key);
}
function postgameLines(team,foe,game,key){
  const won=game.winnerTeamId===team.id||(team.id===game.awayTeamId?safe(game.awayScore)>safe(game.homeScore):safe(game.homeScore)>safe(game.awayScore));
  const lines=won?[
    `WIN COLUMN. ${team.abbr} fans can sleep happy tonight.`,
    `I do not care how pretty it was. Put the W on the board.`,
    `${scoreText(game,getTeam([team,foe],game.awayTeamId),getTeam([team,foe],game.homeTeamId))}. Screenshot it. Save the receipts.`,
    `Postgame mood: highlights on repeat.`,
    `That was stressful for no reason and I loved every second of the ending.`,
    `A win is a win is a win. See everyone in the standings screenshot.`,
    `I will be completely normal about this victory until approximately never.`,
    `Good teams bank wins. Tonight goes in the bank.`,
    `Everybody who said it was over midway through the game: your posts have been archived.`,
    `The vibes have been upgraded to immaculate.`
  ]:[
    `I have prepared a calm and rational postgame response: absolutely not.`,
    `Flush it. Tomorrow exists. Unfortunately so does the box score.`,
    `I will be analyzing every missed chance for the next several hours.`,
    `Not the result. Still our team. See everyone next game.`,
    `I know one loss is one loss. I am still going to stare at the ceiling about it.`,
    `There were at least six moments where I said “this is the inning.” I was incorrect each time.`,
    `Delete the tape, keep the lessons, never mention this to me again.`,
    `Baseball gives and baseball takes. Tonight it mostly took.`,
    `Tomorrow's lineup better arrive angry.`,
    `The postgame show is just going to be me saying “why” for forty minutes.`
  ];
  if(game.walkoff)lines.push(won?`A WALK-OFF. Nobody leave the ballpark. We live here now.`:`Walk-off losses should be illegal.`,won?`I will be watching that ending until next week.`:`That is an exceptionally rude way to lose a baseball game.`);
  return pick(lines,key);
}
const TEAM_OFFICIAL_EXTRA={
  warmHome:[
    `The gates are humming and the first-pitch countdown is officially on.`,
    `Batting practice is wrapping up. Settle in, get loud, and make it feel like home.`,
    `Tonight's office has foul poles, fresh chalk and a whole lot of home colors.`,
    `The scoreboard is lit. The dugout is ready. We are almost there.`,
    `Early arrivals: you understood the assignment.`,
    `The concourse is filling and the bowl is starting to buzz.`,
    `One more look at the field before first pitch. Baseball weather, baseball crowd, baseball time.`,
    `If you are already in your seats, make some noise for warmups.`,
    `Home stand check-in: jerseys on, phones charged, voices ready.`,
    `Tonight starts here. Welcome back to baseball.`
  ],
  warmRoad:[
    `Road whites packed, lineup posted, business trip underway.`,
    `A little visitor-section noise would sound very good right about now.`,
    `New city, same nine innings, same mission.`,
    `We see the visiting jerseys behind the dugout. Keep them coming.`,
    `The hosts have the building. We brought our own energy.`,
    `Pregame from the road: field looks good, club looks loose, first pitch is close.`,
    `Checking in from enemy territory with no plans to be polite on the scoreboard.`,
    `Road crew, send us your view. We know you traveled.`,
    `One ballpark away from home. Still our baseball night.`,
    `The traveling fans found their seats. Time to give them something to cheer about.`
  ],
  wonHome:[`Home cooking. Another W stays in the building.`,`Final out, home win, happy exits.`,`That is how you send a crowd home smiling.`,`The scoreboard gets to wear this one all night.`,`Thanks for bringing the noise from first pitch to final out.`,`A good night at home just became a great one.`,`Protect the park. Mission accomplished.`,`The handshake line looks better after a home win.`,`Put another home victory in the book.`,`We will take that sound from the final out with us.`],
  wonRoad:[`Road work complete. Put the W on the bus.`,`We came in, did the job, and left with the result.`,`Visitor clubhouse music is going to be loud tonight.`,`A road win always travels well.`,`Take the series energy with us.`,`The quietest part of the night was the home crowd after that final out.`,`Business handled away from home.`,`Pack the scorecard. We are bringing this one back with us.`,`The road crew gets rewarded with a win.`,`Nothing like a happy flight after nine innings of work.`],
  lostHome:[`We did not give this crowd the finish it deserved. Back at it next game.`,`The result hurts. The season keeps moving.`,`Not enough tonight. We will see you back here soon.`,`Final out landed the wrong way. Reset starts now.`,`Thank you for staying loud through the last pitch.`,`A tough one under the home lights.`,`We will own the result and get back to work.`,`The building emptied quieter than we wanted.`,`Tonight goes in the lessons column.`,`Not our ending. Still our ballpark. Still our season.`],
  lostRoad:[`Not the road result we came for. Next city, next chance.`,`We leave this one behind and keep moving.`,`Tough finish away from home.`,`The bus ride gets a little quieter tonight.`,`Road loss. Short memory.`,`We had chances. We did not cash enough of them.`,`Not ours tonight, but the trip is not over.`,`File it, learn from it, move forward.`,`The road can be unforgiving. We answer next game.`,`One stop does not define the trip.`],
  slowHome:[`The scoreboard is holding steady. The crowd is not.`,`A little midgame stretch, a lot of baseball still to play.`,`The park has settled into that middle-inning hum.`,`If you are in the building, we want to see your section.`,`Between pitches, take a second and look around. Good baseball night.`,`The bullpen is stirring and the crowd can feel the game tightening.`,`Keep the energy up. There is plenty of night left.`,`Scoreboard check, crowd check, snack check. We keep rolling.`,`The home dugout is locked in. Stay with us.`,`Middle innings at home: where the little things start to matter.`],
  slowRoad:[`Still working on the road. Plenty of outs left.`,`A few visiting jerseys are getting louder by the inning.`,`Road baseball means finding energy wherever you can get it.`,`Stay with us from wherever you are watching.`,`The middle innings are about patience.`,`Visitors' dugout remains very much in this thing.`,`Keep the road feed open. This one still has chapters left.`,`A quiet road inning can turn loud very quickly.`,`We can hear the traveling section every time something starts.`,`Different park, same job: keep applying pressure.`]
};

const TEAM_EVENT_EXTRA={
  homerHome:[`💥 THAT ONE BELONGS TO THE CROWD.`,`🚀 Lifted, launched, landed. Home run.`,`📣 The park just found another volume level.`,`💣 No souvenir section was safe on that one.`,`🔥 One swing, one roar, one trip around the bases.`,`⚾ Touch them all. The home dugout is alive.`,`🌃 Into the night and onto the scoreboard.`,`💥 The hitter knew. The dugout knew. The whole park knew.`,`🚨 Damage done. Home run on the board.`,`📈 Add one to the home run column and several thousand decibels to the building.`],
  homerRoad:[`🤫 That is one way to quiet a road park.`,`🚀 Souvenir delivered to enemy territory.`,`💥 The visitors' dugout just got very loud.`,`📣 Traveling fans, that one was for you.`,`⚾ Around the bases while the building processes what happened.`,`💣 Road power travels just fine.`,`🔥 Big swing, bigger silence.`,`🚨 The road club just changed the scoreboard in a hurry.`,`🌃 Gone under somebody else's lights.`,`📈 Put the run on the board and the pressure on the home side.`],
  triple:[`⚡ All the way to third. No brakes.`,`🏃 Three bases and a dugout on its feet.`,`📣 The gap opened and the runner never stopped.`,`⚡ That ball turned into a footrace.`,`🏃 The rarest kind of loud: triple loud.`,`🔥 First to third base in one swing.`,`📈 Ninety feet from home after a blur around the bases.`,`⚾ The outfield chased. The runner kept going.`,`🚨 Three-bag pressure is officially on.`,`🏃 Speed just changed the entire inning.`],
  double:[`🔥 Into the gap for two.`,`📣 Standing on second with business to finish.`,`⚾ Extra bases earned. Keep the inning moving.`,`📈 A double puts immediate pressure on the next pitch.`,`🚨 Two bags, one swing, inning alive.`,`🔥 The line found grass and the runner found second.`,`⚾ That is how you turn one pitch into scoring position.`,`📣 Gap found. Dugout awake.`,`📈 The offense just moved the leverage needle.`,`🔥 A clean two-base hit and a chance to add on.`],
  rbiSingle:[`📣 A run crosses on the knock.`,`⚾ Put it through, bring one home.`,`📈 Base hit becomes a scoreboard change.`,`🔥 The simple swing does the job.`,`📣 One run home and the inning keeps breathing.`,`⚾ RBI single. Exactly enough.`,`🚨 The line keeps moving and so does the score.`,`📈 Contact, grass, run.`,`🔥 A base hit with a loud consequence.`,`⚾ That is situational hitting paying off.`],
  strikeout:[`🎯 Strike three. Sequence finished.`,`⚡ Another K for the board.`,`🚫 At-bat closed with a punchout.`,`🎯 The pitcher wins the count and the hitter.`,`⚡ Finish pitch landed exactly where it needed to.`,`🚫 No contact on the final word.`,`🎯 One more strikeout in a big spot.`,`⚡ That at-bat ended on the pitcher's terms.`,`🚫 The K column gets another mark.`,`🎯 Attack complete. Next hitter.`],
  doubleplay:[`🧤 Two outs before the ball stops moving.`,`⚡ Rally shortened by two.`,`🧤 Exactly the ground ball the defense wanted.`,`🚫 One pitch, two outs, problem reduced.`,`🧤 Smooth turn. Threat cut down.`,`⚾ The infield just erased two names from the bases.`,`🧤 Fast hands, faster inning.`,`🚨 Double play changes the leverage immediately.`,`🧤 That is the defense helping the pitcher breathe.`,`⚡ Two gone in one motion.`],
  caughtStealing:[`🚫 Door closed at the bag.`,`🧤 Runner tested the battery. Battery won.`,`🚨 Extra base denied.`,`⚡ Throw down, tag down, runner out.`,`🚫 Running game checked.`,`🧤 The defense was ready for it.`,`⚡ Attempt noted. Out recorded.`,`🚫 No free ninety feet tonight.`,`🧤 Pop time meets tag time.`,`🚨 One baserunner removed from the equation.`],
  stolenBase:[`🏃 Ninety feet taken.`,`⚡ The running game is active.`,`🏃 Green light, good jump, safe.`,`📈 Another base earned with the legs.`,`⚡ Speed puts new pressure on the defense.`,`🏃 The runner created scoring position.`,`🚨 Bags are there to be taken.`,`🏃 Jump won, base won.`,`📈 One pitch later, the inning looks different.`,`⚡ Aggression on the bases pays.`],
  sacFly:[`⚾ Out recorded, run delivered.`,`📈 Trade one out for one run.`,`⚾ Deep enough. Job completed.`,`📣 Productive baseball puts a run home.`,`⚾ Runner tags, run scores.`,`📈 Not every RBI needs a hit.`,`⚾ Lifted far enough to do the work.`,`📣 The run matters more than the out.`,`⚾ Simple objective, executed.`,`📈 Sac fly adds one to the board.`],
  multiRun:[`🔥 Multiple runs home and the inning has changed shape.`,`🚨 A crooked number is forming.`,`📈 More than one crosses and the pressure spikes.`,`🔥 The offense just stacked damage.`,`🚨 Two-plus runs on one play will get everyone's attention.`,`📣 This inning is getting expensive.`,`📈 The scoreboard moved more than once.`,`🔥 The lineup is turning traffic into runs.`,`🚨 That play just widened the entire game.`,`📣 A multi-run answer from the offense.`]
};

const MEDIA_EXTRA={
  warmup:[`Pregame read: whichever club controls first-pitch strikes may control the tempo.`,`I am watching the defensive positioning early. There may be a clue in how these clubs attack each other.`,`This matchup has a couple of pressure points that will not show up in the standings.`,`The first trip through the order should tell us a lot about the plan on both sides.`,`There is a difference between a good matchup on paper and a comfortable matchup on the field. We are about to find out which this is.`,`Keep an eye on how aggressively both clubs run tonight.`,`The crowd is already giving this one a little extra voltage.`,`One early crooked number could force both managers off script.`,`The bullpens may matter earlier than usual in this matchup.`,`I have three notes circled before first pitch. By the fourth inning at least two will probably be useless.`],
  postgame:[`The result is final. The interpretation phase has begun.`,`There were two or three moments in that game that will look much bigger on replay.`,`The box score will not fully explain why that game tilted when it did.`,`One club executed the small moments better, and that ended up being the difference.`,`There is a clean headline here, but the underneath story is more interesting.`,`This is the kind of final that changes tomorrow's conversation even if it does not change the standings much.`,`The losing side will remember the missed chances more than the final margin.`,`The winning side did not need perfection. It needed enough good decisions in the right spots.`,`We are going to spend the postgame show arguing about one inning.`,`The final score is simple. Getting there was not.`],
  homerun:[`That was not just a home run; it changed the leverage map immediately.`,`The pitch location will be discussed almost as much as the swing.`,`The dugout reaction told you how much that one mattered.`,`That ball changed the sound of the entire stadium.`,`Power is one thing. Power in that spot is something else.`,`The hitter did not miss the mistake, and the scoreboard punished it instantly.`,`One pitch just forced the opposing dugout to rethink the next few innings.`,`That swing turned a manageable situation into a completely different game script.`,`Watch the next batter now. Momentum is not a stat, but pressure absolutely is.`,`That is a replay the broadcast will keep coming back to.`],
  strikeout:[`That sequence was a clinic in changing eye level.`,`The hitter never got the count back under control.`,`A strikeout in that spot is worth more emotionally than it is on the scorecard.`,`That was conviction from the pitcher from pitch one.`,`The final pitch mattered, but the setup pitches won the at-bat.`,`That is the kind of punchout that can settle an entire defense.`,`No wasted motion there. Attack, expand, finish.`,`The crowd reacted like it understood the leverage immediately.`,`That at-bat narrowed the inning in a hurry.`,`If you are building a pitching plan, clip that sequence.`],
  late:[`Every pitch is carrying a little extra weight now.`,`This is where one bad read on the bases can become the whole postgame story.`,`The game has reached the point where managers are thinking two batters ahead.`,`No comfortable outs left.`,`The next baserunner could completely redraw the inning.`,`Late and close: execution matters more than style now.`,`The bullpen phone, the bench, the defensive alignments — everything is live.`,`There is nowhere to hide a mistake at this stage of the game.`,`One clean inning can feel enormous when the margin is this thin.`,`This is where the game slows down for everyone except the people playing it.`,`You can feel both dugouts waiting for the first opening.`,`Every decision from here is going to look obvious tomorrow and impossible right now.`],
  batter:[`The hitter steps in with the game asking a new question.`,`This plate appearance is about count leverage before it is about contact.`,`Watch the first two pitches here. They may tell us the entire plan.`,`The defense is showing what it fears. Now the hitter has to read it.`,`Another at-bat, another chance to move the pressure somewhere else.`,`The crowd is reacting to every pitch before the umpire finishes the call.`,`There is a lot of information in how they are attacking the hitter right now.`,`This is a good spot to notice whether the hitter is hunting or reacting.`,`The result matters, but so does the quality of this plate appearance.`,`This is where patience and aggression have to somehow coexist.`],
  ambient:[`The quiet innings are often where the next tactical adjustment gets made.`,`Neither side has taken full control of the rhythm yet.`,`The box score is calm. The benches are still gathering information.`,`A game can feel sleepy right before the lineup turns over and everything changes.`,`This is the part of the night where one extra base or one free pass can start to matter.`,`Both clubs are still probing for the weak point.`,`No fireworks right now, but the game state keeps getting more interesting.`,`The next clean scoring chance may be the first one that really sticks.`,`There is still a lot of baseball left for the shape of this game to change.`,`Sometimes the most important inning is the one that keeps the game within reach.`]
};

function teamOfficialLine(team,foe,game,phase,isBatting,state,rivalry,key,bucket,promo){
  const acct=teamOfficial(team);
  const away=getTeam([team,foe],game.awayTeamId), home=getTeam([team,foe],game.homeTeamId);
  const beneficiary=eventBeneficiary(game,away,home); const ours=beneficiary?.id===team.id; const runs=runsOnPlay(game); const type=playType(game);
  const atHome=team.id===game.homeTeamId; const score=scoreText(game,away,home); const diff=team.id===game.awayTeamId?safe(game.awayScore)-safe(game.homeScore):safe(game.homeScore)-safe(game.awayScore);
  const crowdHome=atHome?team:foe;
  if(phase==='warmup'){
    const homeLines=[
      `Gates are open. ${foe.abbr} is here and ${team.abbr} baseball is almost underway.`,
      `The ballpark is filling up. First pitch against ${foe.abbr} is getting close.`,
      `Home colors everywhere. Make this place sound like ours tonight.`,
      `${(rivalry?.heat||0)>=45?'Rivalry night. ':''}Limited game-day ticket inventory remains.`,
      `Warmups are underway. Drop your score prediction and get loud early.`,
      `Pregame roll call: what section are you checking in from?`,
      `Team Store open. Concourse busy. Baseball soon. This is the good part.`,
      `The lights are on and the building is waking up. Welcome home.`,
      ...TEAM_OFFICIAL_EXTRA.warmHome
    ];
    const roadLines=[
      `Road game check-in: ${team.abbr} is in ${crowdHome?.city||crowdHome?.abbr||'enemy territory'} tonight.`,
      `The road uniforms are on. ${team.abbr} vs ${foe.abbr} is next.`,
      `Traveling ${team.abbr} fans, make yourselves heard tonight.`,
      `Warmups from the road. Time to see how quiet we can make this building.`,
      `First pitch is close. Wherever you are watching, bring the road energy.`,
      `The road trip continues. ${foe.abbr} is next on the list.`,
      `Away from home, same objective. Let's play ball.`,
      ...TEAM_OFFICIAL_EXTRA.warmRoad
    ];
    const lines=atHome?homeLines:roadLines;
    if(promo&&atHome)lines.unshift(`${promo.icon||'🎟️'} ${promo.name} tonight. ${promo.giveaway||'Special game-day event'} — arrive early.`);
    return {...acct,id:`${key}-teamofficial-${team.id}`,text:pick(lines,`${key}-warm-${team.id}`),time:'pregame'};
  }
  if(phase==='delay')return null;
  if(phase==='postgame'){
    const won=game.winnerTeamId===team.id||(team.id===game.awayTeamId?safe(game.awayScore)>safe(game.homeScore):safe(game.homeScore)>safe(game.awayScore));
    const wonHome=[`FINAL: ${score}. That's a ${team.abbr} WIN at home.`,`HOME WIN. Thank you for making the building sound like that.`,`Ballgame. The lights stay bright a little longer after a win like this.`,`Another one for the home crowd. Save the scorecard.`,...TEAM_OFFICIAL_EXTRA.wonHome];
    const wonRoad=[`FINAL: ${score}. Road win secured.`,`Quiet building, loud visitors. ${team.abbr} gets it done on the road.`,`Pack the win. Take it with us.`,`That's how you finish a road night.`,...TEAM_OFFICIAL_EXTRA.wonRoad];
    const lostHome=[`FINAL: ${score}. Not the night we wanted. Thank you for staying with us.`,`Final from home. We turn the page.`,`The home crowd deserved a better finish. We'll be back.`,...TEAM_OFFICIAL_EXTRA.lostHome];
    const lostRoad=[`FINAL: ${score}. Road night ends on the wrong side.`,`Final away from home. Reset and move on.`,`Not ours tonight. The road trip continues.`,...TEAM_OFFICIAL_EXTRA.lostRoad];
    return {...acct,id:`${key}-teamofficial-${team.id}`,text:pick(won?(atHome?wonHome:wonRoad):(atHome?lostHome:lostRoad),`${key}-final-${team.id}`),time:'postgame'};
  }
  if(ours){
    const lines=[];
    if(type==='homerun'){
      if(isBatting&&atHome)lines.push(`💥 HOME RUN ${team.abbr}! LISTEN TO THIS PLACE.`,`🚀 GONE. The home crowd knew immediately.`,`💣 BIG FLY AT HOME. This building just erupted.`,`📣 HOME RUN. Everybody in ${team.abbr} colors is on their feet.`,`🌋 THAT ONE IS OUT. Home-field volume: MAXIMUM.`,...TEAM_EVENT_EXTRA.homerHome);
      if(isBatting&&!atHome)lines.push(`💥 ROAD HOME RUN. ${team.abbr} just quieted the building.`,`🚀 GONE. You can hear the traveling ${team.abbr} fans now.`,`💣 BIG FLY ON THE ROAD. That took the air out of the park.`,`🤫 HOME RUN ${team.abbr}. The loudest sound here is coming from the visitors.`,`📣 ROAD POWER. ${team.abbr} leaves the yard in enemy territory.`,...TEAM_EVENT_EXTRA.homerRoad);
    }
    if(type==='triple'&&isBatting)lines.push(`⚡ THREE BAGS. ${team.abbr} is flying.`,`🏃 TRIPLE! The outfield gap never had a chance.`,`⚡ Wheels, chaos, three bases. We'll take it.`,...TEAM_EVENT_EXTRA.triple);
    if(type==='double'&&isBatting)lines.push(`🔥 DOUBLE. ${team.abbr} finds the gap.`,`Two bases and immediate pressure.`,`📣 EXTRA-BASE HIT. The inning has teeth now.`,...TEAM_EVENT_EXTRA.double);
    if(type==='single'&&runs&&isBatting)lines.push(`📣 BASE HIT, RUN HOME.`,`That'll score one. ${team.abbr} cashes in.`,`RBI knock. Keep the line moving.`,...TEAM_EVENT_EXTRA.rbiSingle);
    if(['strikeout','calledstrikeout'].includes(type))lines.push(`K. Big pitch, big out.`,`⚡ STRIKE THREE. ${team.abbr} gets exactly what it needed.`,`🎯 Punchout. Sit down, reset, next hitter.`,`K ON THE BOARD. That sequence was nasty.`,`🚫 Nothing doing. Strike three.`,...TEAM_EVENT_EXTRA.strikeout);
    if(type==='doubleplay')lines.push(`🧤 TURN TWO! Threat erased.`,`ROLL IT. Two outs, one baseball.`,`🧤 DOUBLE PLAY. That inning just changed instantly.`,`Two for the price of one. Beautiful.`,...TEAM_EVENT_EXTRA.doubleplay);
    if(type==='caughtstealing')lines.push(`🚫 CAUGHT STEALING. Not on us.`,`Nope. Runner erased.`,`🚨 RUNNING GAME DENIED.`,...TEAM_EVENT_EXTRA.caughtStealing);
    if(runnerEvent(game)?.source==='stolen-base')lines.push(runnerEvent(game)?.scored?`🏃 STEAL OF HOME! Absolute chaos.`:`🏃 STOLEN BASE. ${team.abbr} is moving.`,...TEAM_EVENT_EXTRA.stolenBase);
    if(type==='sacfly'&&runs)lines.push(`Productive out. Run home.`,`One out, one run. Job done.`,...TEAM_EVENT_EXTRA.sacFly);
    if(runs>=2&&isBatting)lines.push(`🔥 ${runs} RUNS SCORE. The inning belongs to ${team.abbr}.`,`📈 ${runs} across on the play. Keep pouring it on.`,`🚨 MULTI-RUN SWING. ${team.abbr} just changed the shape of this game.`,...TEAM_EVENT_EXTRA.multiRun);
    if(diff>=8&&isBatting)lines.push(`The offense is not taking its foot off the gas.`,`This has turned into a statement night for ${team.abbr}.`);
    if(lines.length)return {...acct,id:`${key}-teamofficial-${team.id}`,text:pick(lines,`${key}-event-${team.id}-${type}-${runs}`),time:'now'};
  }
  const cadence=(hash(team.id)%5+5)%5;
  if(bucket%5===cadence){
    const homeSlow=[`Stay with us. ${score} — ${inningText(game)}.`,`The crowd has been working tonight. Keep it coming.`,`Tag your view from the park. We are collecting the best game-day photos.`,`Midgame check-in from home: ${score}.`,`Concourse report: busy. Ballpark report: louder by the inning.`,`Late-game Team Store pickup remains open through the final innings.`,...TEAM_OFFICIAL_EXTRA.slowHome];
    const roadSlow=[`Road check-in: ${score} — ${inningText(game)}.`,`Traveling ${team.abbr} fans: yes, we hear you.`,`The goal now: make ${crowdHome?.abbr||'the home crowd'} very, very quiet.`,`Midgame from the road: ${score}. Plenty left.`,`Send us your road-game setup. Couch, bar, train, visiting section — all counts.`,`A few pockets of ${team.abbr} colors are making themselves known.`,...TEAM_OFFICIAL_EXTRA.slowRoad];
    const lines=atHome?homeSlow:roadSlow;
    if(promo&&atHome)lines.push(`${promo.icon||'🎟️'} ${promo.name} is happening tonight. ${promo.giveaway||'Check the concourse for details.'}`);
    return {...acct,id:`${key}-teamofficial-${team.id}`,text:pick(lines,`${key}-slow-${team.id}`),time:'live'};
  }
  return null;
}

function officialMoment(game,away,home,brand){
  const type=playType(game); const bt=eventBattingTeam(game,away,home); const ft=eventFieldingTeam(game,away,home);
  if(game?.status==='Final')return `${brand.abbr} FINAL: ${scoreText(game,away,home)}.`;
  if(game?.walkoffCandidate)return `🚨 ${brand.abbr} MOMENT: ${home.abbr} has taken the lead in walk-off territory.`;
  if(type==='homerun')return `💥 ${brand.abbr} HOME RUN: ${bt?.abbr||''} goes deep in the ${eventInningText(game).toLowerCase()}.`;
  if(type==='triple'&&late(game))return `⚡ ${brand.abbr} BIG PLAY: late-game triple for ${bt?.abbr||'the batting club'}.`;
  if(runsOnPlay(game)>=2&&late(game))return `🔥 ${brand.abbr} SWING: ${runsOnPlay(game)} runs score for ${bt?.abbr||'the offense'} in the ${eventInningText(game).toLowerCase()}.`;
  if(['strikeout','calledstrikeout'].includes(type)&&late(game)&&close(game))return `⚡ ${brand.abbr} CLUTCH K: ${ft?.abbr||'the defense'} gets a huge strikeout in the ${eventInningText(game).toLowerCase()}.`;
  if(type==='doubleplay'&&late(game))return `🧤 ${brand.abbr} TURN TWO: ${ft?.abbr||'the defense'} escapes with a massive double play.`;
  if(runnerEvent(game)?.source==='stolen-base'&&runnerEvent(game)?.scored)return `🚨 ${brand.abbr} CHAOS: a steal of home changes the game.`;
  if(safe(game?.inning)>=10)return `🌙 ${brand.abbr} EXTRA INNINGS: ${away.abbr} and ${home.abbr} are still going.`;
  if(late(game)&&String(game?.lastAnnouncement||'').startsWith('Score update:'))return `📣 ${brand.abbr} SCORE UPDATE: ${scoreText(game,away,home)} in the ${eventInningText(game).toLowerCase()}.`;
  if(late(game)&&close(game)&&safe(game?.outs)===2&&occupied(game?.bases)>=2)return `👀 ${brand.abbr} HIGH LEVERAGE: ${scoreText(game,away,home)}, ${inningText(game)}, two outs and traffic on the bases.`;
  const battingHits=game?.half==='Top'?safe(game.awayHits):safe(game.homeHits);
  const oppHits=game?.half==='Top'?safe(game.homeHits):safe(game.awayHits);
  if(safe(game?.inning)>=6&&oppHits===0&&battingHits>=0)return `👀 ${brand.abbr} WATCH: a no-hit bid is still alive through ${Math.max(1,safe(game.inning)-1)} completed innings.`;
  return '';
}

function nowForAudience(bucket,phase){return bucket*(phase==='live'?7000:phase==='delay'?11000:14000)}
function liveWatchingCount(phase,game,awayState,homeState,rivalry,bucket,promo,data){
  const heat=safe(awayState?.marketHeat)+safe(homeState?.marketHeat);
  const hype=safe(awayState?.hype)+safe(homeState?.hype);
  const season=Math.max(1,Number(String(data?.activeSeasonName||'Season 3').match(/\d+/)?.[0]||3));
  const growth=Math.pow(1.55,Math.max(0,season-3));
  let viewers=(18000+heat*520+hype*250+safe(rivalry?.heat)*620)*growth;
  if(game?.gameType==='playoff')viewers+=120000*growth;
  if(late(game)&&close(game))viewers+=55000*growth;
  if(safe(game?.inning)>=9&&close(game))viewers+=45000*growth;
  if(safe(game?.inning)>=10)viewers+=70000*growth;
  if(isBigPlay(game))viewers+=35000*growth;
  if(game?.walkoffCandidate)viewers+=85000*growth;
  if(occupied(game?.bases)>=2&&late(game))viewers+=22000*growth;
  if(safe(rivalry?.heat)>=75)viewers+=90000*growth;
  if(phase==='warmup')viewers*=.58;
  if(phase==='postgame')viewers*=.72;
  if(promo)viewers+=(safe(promo.attendance)*1400+safe(promo.hype)*900)*growth;
  const watchPhase=(hash(`${game?.awayTeamId}-${game?.homeTeamId}`)%628)/100;
  const jitter=.985+Math.sin(nowForAudience(bucket,phase)/26000+watchPhase)*.025+Math.sin(nowForAudience(bucket,phase)/76000+watchPhase*.7)*.012;
  return Math.max(Math.round(18000*growth),Math.round(viewers*jitter/500)*500);
}


function ambientGameDayPost(team,foe,phase,bucket,slot,promo){
  const categories=['stadium','home','work','food','merch','family','travel','casual','oldhead','newfan','superstition','pets','parking','gates','seats','vendor','localbiz','mascot','foulball','watchparty','transit','uniforms','autograph','seasonticket','photos','wave','scoreboard','callin','concourse','restroom','scorekeeper','optimism','doomer','neighbors','commuteHome','memories','friends','heckler','broadcast','tickets','offbeat','quiet'];
  let category=categories[(hash(`${team.id}-${bucket}-${slot}`)+bucket+slot)%categories.length];
  if(promo?.id==='dog')category='pets';
  if(promo?.type==='giveaway')category=slot%3===0?'reseller':slot%3===1?'collector':'merch';
  const identities={
    stadium:['Upper Deck Correspondent',`@Section${100+((hash(team.id)+slot)%300)}`,'AT THE PARK'],
    home:['Couch Scorekeeper',`@${team.abbr}FromHome`,'WATCHING AT HOME'],
    work:['Definitely Working',`@BoxScoreAtWork`,'SCORE CHECKER'],
    food:['Ballpark Bites',`@BallparkBites`,'FOOD ACCOUNT'],
    merch:[`${team.abbr} Gear Watch`,`@${team.abbr}Closet`,'MERCH COLLECTOR'],
    family:['Baseball Family',`@FirstPitchFamily`,'FAMILY SECTION'],
    travel:[`${team.abbr} Road Crew`,`@${team.abbr}RoadCrew`,'TRAVELING FANS'],
    casual:['Casual Score Check',`@JustCheckingScore`,'CASUAL FAN'],
    oldhead:['Old School Bleachers',`@ScorebookForever`,'OLD-HEAD'],
    newfan:['New to Baseball',`@LearningTheGame`,'NEW FAN'],
    superstition:[`${team.abbr} Rally Rituals`,`@DontMoveTheHat`,'SUPERSTITIOUS'],
    pets:['Ballpark Dogs',`@DogsLoveBaseball`,'PET ACCOUNT'],
    parking:['Lot C Dispatch',`@ParkingLotBaseball`,'PARKING LOT'],
    gates:['Gate Line Report',`@GateLineReport`,'AT THE GATES'],
    seats:['Section Neighbors',`@SectionNeighbors`,'IN THE SEATS'],
    reseller:['Giveaway Market',`@GateFlippers`,'RESELLER WATCH'],
    collector:['Promo Collector',`@GiveawayTracker`,'COLLECTOR'],
    vendor:['Concourse Vendor',`@HotDogGuy118`,'STADIUM VENDOR'],
    localbiz:['Neighborhood Baseball',`@LocalGameDay`,'LOCAL BUSINESS'],
    mascot:['Mascot Watch',`@MascotWatch`,'MASCOT DESK'],
    foulball:['Foul Ball Patrol',`@FoulBallPatrol`,'BALLPARK CHAOS'],
    watchparty:['Watch Party',`@GameOnEveryScreen`,'WATCH PARTY'],
    transit:['Transit to the Park',`@TrainFullOfJerseys`,'GETTING THERE'],
    uniforms:['Uniform Department',`@UniformDiscourse`,'UNIFORM NERD'],
    autograph:['Rail Crew',`@PregameAutographs`,'AUTOGRAPH HUNTER'],
    seasonticket:['Same Seats Society',`@SameSeatsEveryGame`,'SEASON TICKET HOLDER'],
    photos:['Ballpark Frames',`@BallparkFrames`,'STADIUM PHOTOGRAPHY'],
    wave:['Wave Discourse',`@WaveDebate`,'IMPORTANT NONSENSE'],
    scoreboard:['Big Screen Watch',`@ScoreboardMoments`,'IN-GAME ENTERTAINMENT'],
    callin:['Postgame Call-In',`@PhoneLinesOpen`,'RADIO CALLER'],
    concourse:['Concourse Report',`@ConcourseLoop`,'AROUND THE PARK'],
    restroom:['Inning Break Mission',`@MadeItBack`,'STADIUM LIFE'],
    scorekeeper:['Scorebook Society',`@PencilAndBoxscore`,'SCOREKEEPER'],
    optimism:[`${team.abbr} Hope Department`,`@OneRallyAway`,'OPTIMIST'],
    doomer:[`${team.abbr} Doom Line`,`@SeenEnoughStillWatching`,'DOOMER'],
    neighbors:['Section Group Chat',`@RowMates`,'SEAT NEIGHBORS'],
    commuteHome:['Ride Home Radio',`@StillInTheCar`,'COMMUTE'],
    memories:['Baseball Memory Bank',`@RememberThatGame`,'LEAGUE MEMORY'],
    friends:['Group Chat Baseball',`@MutedForJinxing`,'GROUP CHAT'],
    heckler:['Bleacher Microphone',`@SectionHeckler`,'HECKLER'],
    broadcast:['Broadcast Watch',`@BoothAndReplay`,'TV WATCHER'],
    tickets:['Ticket Watch',`@LastMinuteSeats`,'TICKET TALK'],
    promo:['Promo Night People',`@GiveawayLine`,'PROMO NIGHT'],
    offbeat:['Baseball Side Quest',`@BetweenInnings`,'OFFBEAT'],
    quiet:['The Cheap Seats',`@CheapSeatsChat`,'FAN CHAT'],
  };
  const [name,handle,badge]=identities[category]||identities.quiet;
  let text=pickSocialPhrase(category,`${team.id}-${foe.id}-${slot}`,bucket);
  if(promo&&phase!=='postgame'&&slot===0)text=`${promo.icon||'🎟️'} ${promo.name}: ${promo.giveaway||'special game-day event'}. ${text}`;
  return {id:`ambient-${bucket}-${team.id}-${slot}-${category}`,kind:'fan',name,handle,badge,team,text,tone:'neutral',time:phase==='warmup'?'pregame':'live'};
}

export function buildGameDaySocial(data={},teams=[],playoffPicture=[],now=Date.now()){
  const game=data.currentGame||{}; const matchup=liveMatchup(game,teams); const recent=recentFinal(data,teams,now);
  let phase='idle', activeGame=null, away=null, home=null;
  if(matchup.away&&matchup.home){activeGame=game;away=matchup.away;home=matchup.home;phase=game.status==='Delay'?'delay':game.status==='Live'?'live':'warmup';}
  else if(recent?.away&&recent?.home){activeGame=recent.game;away=recent.away;home=recent.home;phase='postgame';}
  if(!activeGame||!away||!home)return {phase:'idle',posts:[],awayPosts:[],homePosts:[],leaguePosts:[],away:null,home:null,brand:getLeagueBrand(data),watching:0};

  const brand=getLeagueBrand(data); const bucket=Math.floor(now/(phase==='live'?7000:phase==='delay'?11000:14000));
  const postgameAgeMs=phase==='postgame'?safe(recent?.ageMs):0;
  const postgameStage=phase!=='postgame'?'':postgameAgeMs<5*60*1000?'REACTION CHAOS':postgameAgeMs<15*60*1000?'CELEBRATION + BLAME':postgameAgeMs<30*60*1000?'POSTGAME ANALYSIS':'MEMES + RECEIPTS';
  const seasonSlot=currentSeasonDay(data,teams);
  const anchorGame=(activeGame.gameType||'regular')!=='playoff'&&isCalendarAnchorGame(activeGame,data,teams);
  const socialGameNumber=anchorGame?Number(activeGame.seasonGameNumber||seasonSlot?.gameNumber||0):0;
  const promo=socialGameNumber?getScheduledGameNight(data,socialGameNumber):null;
  const ceremonies=socialGameNumber?ceremonyForGame(data,teams,socialGameNumber):[];
  const universe=buildFanUniverse(data,teams,playoffPicture); const clubs=buildFanClubs(data,teams,playoffPicture); const media=buildMediaUniverse(); const playerPages=buildPlayerFanPages(data,teams);
  const rivalries=buildHeadToHead(data.games||[],teams,data.seasonHistory||[]);
  const rivalry=rivalries.find(r=>(r.teamAId===away.id&&r.teamBId===home.id)||(r.teamAId===home.id&&r.teamBId===away.id));
  const fanRelationship=buildFanbaseRelationshipNetwork(data,teams).find(r=>[r.teamAId,r.teamBId].includes(away.id)&&[r.teamAId,r.teamBId].includes(home.id));
  const teamStates=new Map(universe.teamStates.map(x=>[x.team.id,x]));
  const awayState=teamStates.get(away.id); const homeState=teamStates.get(home.id);
  const keyBase=`${phase}-${bucket}-${eventKey(activeGame)}-${away.id}-${home.id}`;

  function teamPosts(team,foe){
    const clubPool=clubs.filter(c=>c.team.id===team.id); const state=teamStates.get(team.id); const eventTeam=eventBattingTeam(activeGame,away,home); const isBatting=(explicitEvent(activeGame)?eventTeam:battingTeam(activeGame,away,home))?.id===team.id;
    const posts=[];
    shuffle(clubPool,`${keyBase}-${team.id}`).slice(0,2).forEach((club,i)=>{
      const baseText=phase==='warmup'?warmupLines(team,foe,rivalry,`${keyBase}-warm-${team.id}-${i}`):phase==='delay'?delayLines(team,foe,activeGame,`${keyBase}-delay-${team.id}-${i}`):phase==='postgame'?postgameLines(team,foe,activeGame,`${keyBase}-post-${team.id}-${i}`):liveLines(team,foe,activeGame,isBatting,`${keyBase}-live-${team.id}-${i}`);
      const text=baseText;
      posts.push({id:`${keyBase}-${club?.id||team.id}-${i}`,kind:'fan',name:club?.name||`${team.abbr} Fans`,handle:club?.handle||`@${team.abbr}Fans`,badge:club?.voice||club?.archetype?.label||'Fan Page',team,text,tone:phase==='live'&&isBigPlay(activeGame)?'spicy':state?.approval<35?'down':'neutral',time:phase==='warmup'?'pregame':phase==='postgame'?'postgame':'live'});
    });
    const officialTeamPost=teamOfficialLine(team,foe,activeGame,phase,isBatting,state,rivalry,keyBase,bucket,promo);
    if(officialTeamPost)posts.unshift(officialTeamPost);
    if(phase==='warmup'){
      const teamCeremonies=ceremonies.filter(c=>c.teamId===team.id||c.teamAbbr===team.abbr);
      teamCeremonies.slice(0,1).forEach((c,ci)=>{
        posts.unshift({id:`${keyBase}-cer-${team.id}-${ci}`,kind:'fan',name:`${team.abbr} Ceremony Watch`,handle:`@${team.abbr}Rafters`,badge:'CEREMONY NIGHT',team,text:pick(ceremonySocialLines(c,team),`${keyBase}-cerline-${team.id}`),tone:'up',time:'pregame'});
        const officialAcct=teamOfficial(team);
        const officialLines=c.type==='championship-opening'
          ? [`Tonight, we raise the banner, welcome the trophy home, and present the championship rings. Be in your seats early.`,`Championship night. Banner. Trophy. Rings. One more celebration before first pitch.`,`The title lives forever. Tonight we put it in the rafters and put rings on the hands that earned it.`]
          : [`Tonight's pregame ceremony: ${c.title}. Please be in your seats early.`,`A piece of ${team.abbr} history joins the ballpark tonight: ${c.title}.`,`The rafters get a little more history tonight. ${c.title} begins before first pitch.`];
        posts.unshift({...officialAcct,id:`${keyBase}-cer-official-${team.id}-${ci}`,text:pick(officialLines,`${keyBase}-cer-official-line-${team.id}`),time:'pregame'});
      });
    }
    if(phase==='delay'){const officialAcct=teamOfficial(team);posts.unshift({...officialAcct,id:`${keyBase}-delay-official-${team.id}`,text:`${activeGame.delayReason||'Game delay'}: we will update everyone as soon as play can resume. Thanks for hanging with us.`,time:'delay'});}
    const playerCandidates=playerPages.filter(p=>p.team?.id===team.id);
    if(playerCandidates.length&&phase==='live'&&(playType(activeGame)||runnerEvent(activeGame))){
      const p=pick(playerCandidates,`${keyBase}-player-${team.id}`); const type=playType(activeGame);
      posts.push({id:`${keyBase}-stan-${team.id}`,kind:'player',name:p.name,handle:p.handle,badge:'Player Fan Page',team,text:type==='homerun'&&isBatting?`${p.player.name} agenda is being pushed with EXTREME force right now.`:type.includes('strikeout')?`Baseball is cruel. We remain on the ${p.player.name} agenda.`:`Posting ${p.player.name} propaganda through every pitch.`,tone:'up',time:'live'});
    }
    if(phase!=='postgame'&&['FRIENDLY','ALLIES'].includes(fanRelationship?.label))posts.push({id:`${keyBase}-friendly-${team.id}`,kind:'rivalry',name:`${team.abbr} Fan Diplomacy`,handle:`@${team.abbr}GoodTerms`,badge:`🤝 ${fanRelationship.label}`,team,text:pick([`${foe.abbr} fans, we may disagree for nine innings, but you people are alright.`,`Temporary truce with ${foe.abbr}. We have bigger enemies to complain about.`,fanRelationship?.commonEnemy?`Reminder that ${team.abbr} and ${foe.abbr} can always agree on one thing: beating ${fanRelationship.commonEnemy.abbr}.`:`This is one of the rare matchups where the mentions are mostly civilized.`,`Respectfully: good luck, ${foe.abbr}. Not too much luck.`,`Friendly fanbases until first pitch. After that, all bets are off.`],`${keyBase}-friendly-line-${team.id}`),tone:'neutral',time:'live'});
    else if((rivalry?.games||0)>0&&phase!=='postgame')posts.push({id:`${keyBase}-rival-${team.id}`,kind:'rivalry',name:`${team.abbr} Rivalry Department`,handle:`@${team.abbr}RivalryDept`,badge:`${Math.round(Math.max(rivalry?.heat||25,fanRelationship?.hostility||0))} HEAT`,team,text:pick([`${foe.abbr} fans are already in our mentions. Beautiful.`,`This matchup has exactly the correct amount of mutual disrespect.`,`Saving receipts from ${foe.abbr} fans for later.`,`I see ${foe.abbr} fans getting confident. Interesting choice.`,`If we win, I am going directly to the receipts folder.`,`Division games should come with a warning label.`,`Nothing personal, ${foe.abbr}. Actually, never mind. Very personal.`,`The group chat has declared this a must-win for reasons nobody can defend.`,fanRelationship?.hostility>=60?`Nobody in this fanbase has forgotten what ${foe.abbr} did last time.`:`The history is starting to pile up in this matchup.`],`${keyBase}-chirp-${team.id}`),tone:'spicy',time:'live'});
    if(phase!=='postgame'&&!isBigPlay(activeGame))posts.push(ambientGameDayPost(team,foe,phase,bucket,hash(team.id)%3,promo));
    return posts;
  }

  let awayPosts=teamPosts(away,home); let homePosts=teamPosts(home,away); const leaguePosts=[];
  // Conversation texture: a small number of posts visibly reply/quote the other side.
  // This is deterministic per feed bucket so threads feel stable instead of flickering every render.
  const awayAnchor=awayPosts.find(p=>p.kind==='fan'||p.kind==='rivalry');
  const homeAnchor=homePosts.find(p=>p.kind==='fan'||p.kind==='rivalry');
  if(awayAnchor&&homeAnchor&&(safe(rivalry?.heat)>=28||phase==='live')){
    if(bucket%3===0){
      homePosts=homePosts.map((p,i)=>i===0?{...p,replyTo:awayAnchor.handle,quotedText:awayAnchor.text}:p);
    }else if(bucket%3===1){
      awayPosts=awayPosts.map((p,i)=>i===0?{...p,replyTo:homeAnchor.handle,quotedText:homeAnchor.text}:p);
    }
  }
  const official=officialMoment({...activeGame,status:phase==='postgame'?'Final':activeGame.status},away,home,brand);
  const magnitude=analyzeGameMagnitude(activeGame,teams);
  if(magnitude.score>=60&&phase==='live')leaguePosts.push({id:`${keyBase}-extreme`,kind:'league',name:brand.name,handle:brand.handle,badge:magnitude.score>=75?'🚨 LEAGUE ALERT':'👀 DEVELOPING',team:null,text:`${magnitude.headline}. ${scoreText(activeGame,away,home)} — ${eventInningText(activeGame)}.`,tone:'official',time:'now'});
  if(official&&(phase==='postgame'||isBigPlay(activeGame)||safe(activeGame.inning)>=6))leaguePosts.push({id:`${keyBase}-official`,kind:'league',name:brand.name,handle:brand.handle,badge:'✓ OFFICIAL',team:null,text:official,tone:'official',time:'now'});
  if(phase==='delay')leaguePosts.push({id:`${keyBase}-official-delay`,kind:'league',name:brand.name,handle:brand.handle,badge:'⏸ DELAY',team:null,text:`${activeGame.delayReason||'Game delay'} in ${away.abbr} at ${home.abbr}. The league feed will stay with the ballpark until play resumes.`,tone:'official',time:'delay'});
  if(phase==='warmup')leaguePosts.push({id:`${keyBase}-official-warm`,kind:'league',name:brand.name,handle:brand.handle,badge:'✓ OFFICIAL',team:null,text:`Game day: ${away.abbr} at ${home.abbr}. Warmups are underway.${promo?` ${promo.icon||'🎟️'} ${promo.name} tonight.`:''}${ceremonies.length?` ${ceremonies[0].title} is part of tonight's pregame program.`:''}`,tone:'official',time:'pregame'});
  if(phase==='postgame'&&!official)leaguePosts.push({id:`${keyBase}-official-final`,kind:'league',name:brand.name,handle:brand.handle,badge:'✓ OFFICIAL',team:null,text:`FINAL: ${scoreText(activeGame,away,home)}.`,tone:'official',time:'postgame'});

  shuffle(media,`${keyBase}-media`).slice(0,2).forEach((m,i)=>{
    const winner=winningTeam(activeGame,away,home); const batter=currentBatter(activeGame,data); const type=playType(activeGame);
    const text=phase==='warmup'?pick([`${away.abbr}-${home.abbr} has my attention tonight. Watch the first two innings for the tone.`,`Pregame question: which fanbase is going to be louder by the third inning?`,`The records tell one story. The first inning usually tells us whether the game agrees.`,`Watch the middle innings tonight — this matchup has late-game tension written all over it.`,`I want to see which club controls the strike zone first.`,...MEDIA_EXTRA.warmup],`${keyBase}-m-${i}`):phase==='postgame'?pick([`${winner?.abbr||'One side'} got the result. Now comes the overreaction cycle.`,`The final score is settled. The arguments about what it means are just beginning.`,`One game, several storylines, and about twelve hours of takes coming next.`,...MEDIA_EXTRA.postgame],`${keyBase}-postmedia-${i}`):type==='homerun'?pick([`That swing changed the temperature in this game immediately.`,`You could feel the entire game tilt on contact.`,`That is the kind of swing that rewrites a postgame show.`,`The crowd knew before the ball finished traveling.`,`One swing just changed every conversation around this game.`,`That is the kind of contact that makes analysts throw away their notes.`,...MEDIA_EXTRA.homerun],`${keyBase}-hrmedia-${i}`):['strikeout','calledstrikeout'].includes(type)?pick([`That was a high-quality strikeout in a spot that demanded one.`,`Big pitch, clean execution, and the inning looks completely different now.`,`That at-bat is going to show up in every leverage recap tonight.`,`You could feel the hitter running out of answers in that sequence.`,`That strikeout mattered beyond one out — it changed the emotional shape of the inning.`,`Execution under pressure. That is the whole story of that at-bat.`,...MEDIA_EXTRA.strikeout],`${keyBase}-kmedia-${i}`):late(activeGame)&&close(activeGame)?pick([`${inningText(activeGame)} and one swing can flip everything. This is the good stuff.`,`Every decision is magnified now.`,`The margin for a mistake has disappeared.`,...MEDIA_EXTRA.late],`${keyBase}-latemedia-${i}`):batter?pick([`${batter.name} at the plate. This is where the fanbase starts bargaining with the baseball gods.`,`Another plate appearance, another little leverage puzzle.`,`The crowd is waiting for one pitch to react.`,...MEDIA_EXTRA.batter],`${keyBase}-battermedia-${i}`):pick([`The game is settling into its shape. Somebody will break it.`,`Not every inning is loud. These are the innings that set up the loud ones.`,`Both sides are still looking for the sequence that changes the night.`,...MEDIA_EXTRA.ambient],`${keyBase}-ambientmedia-${i}`);
    leaguePosts.push({id:`${keyBase}-media-${m.id}`,kind:'media',name:m.name,handle:m.handle,badge:`${m.role} · ${m.show}`,team:null,text,tone:m.style==='hot'?'spicy':'media',time:'live'});
  });

  const watching=liveWatchingCount(phase,activeGame,awayState,homeState,rivalry,bucket,promo,data);
  const bigMoment=isBigPlay(activeGame);
  const beneficiary=eventBeneficiary(activeGame,away,home);
  const primary=beneficiary?.id===away.id?awayPosts:beneficiary?.id===home.id?homePosts:[];
  const secondary=beneficiary?.id===away.id?homePosts:beneficiary?.id===home.id?awayPosts:[];
  const officialLeague=leaguePosts.filter(p=>p.kind==='league');
  const mediaPosts=leaguePosts.filter(p=>p.kind==='media');
  const streamPosts=bigMoment
    ? [...officialLeague,...primary.filter(p=>p.kind!=='rivalry'),...secondary.filter(p=>p.kind==='fan'),...mediaPosts,...primary.filter(p=>p.kind==='rivalry'),...secondary.filter(p=>p.kind!=='fan')]
    : shuffle([...awayPosts,...homePosts,...leaguePosts],`${keyBase}-all`);
  const posts=shuffle([...awayPosts,...homePosts,...leaguePosts],`${keyBase}-all`);
  // Chatter is intentionally continuous instead of a fixed baseline + big-moment switch.
  // A play creates a surge that eases away over a couple of minutes instead of falling off a cliff,
  // while close games, baserunners, inning leverage and a small deterministic crowd drift keep the meter alive.
  const rawEvent=activeGame?.fieldState?.socialEvent||activeGame?.fieldState?.playEvent||activeGame?.fieldState?.runnerEvent||activeGame?.fieldState?.cueEvent||null;
  const rawEventTime=Number(rawEvent?.id||0);
  const eventAge=rawEventTime>1_000_000_000_000?Math.max(0,now-rawEventTime):Number.POSITIVE_INFINITY;
  const eventStrength=rawEventTime?clamp(Math.exp(-eventAge/95000),0,1):0;
  const scoreGap=Math.abs(safe(activeGame.awayScore)-safe(activeGame.homeScore));
  const inning=safe(activeGame.inning)||1;
  const traffic=occupied(activeGame.bases);
  const leveragePressure=(phase==='live'?Math.max(0,inning-4)*1.7:0)+(phase==='live'&&scoreGap<=2?6:0)+(phase==='live'&&scoreGap<=1?4:0)+(phase==='live'?traffic*2.2:0)+(phase==='live'&&safe(activeGame.outs)===2&&traffic?2.5:0);
  const eventSurge=(bigMoment?18:6)*eventStrength+(magnitude.score>=65?7*eventStrength:0);
  const driftPhase=(hash(`${away.id}-${home.id}-chatter`)%628)/100;
  const drift=Math.sin(now/24000+driftPhase)*2.8+Math.sin(now/72000+driftPhase*.63)*2.2;
  const quietInningRelief=phase==='live'&&eventStrength<.18&&traffic===0&&scoreGap>=4?-4:0;
  const chatterScore=clamp(Math.round(18+Math.min(30,watching/1500)+safe(rivalry?.heat)*.18+(phase==='live'?6:0)+(phase==='delay'?9:0)+Math.max(0,(magnitude.score-45)*.22)+leveragePressure+eventSurge+drift+quietInningRelief),0,100);
  const chatterHeat=chatterScore>=90?'CHAOS':chatterScore>=74?'HOT':chatterScore>=58?'BUZZING':chatterScore>=38?'ACTIVE':'QUIET';
  return {phase,game:activeGame,away,home,rivalry,brand,promo,ceremonies,gameNumber:socialGameNumber,postgameStage,postgameAgeMs,posts,streamPosts,awayPosts,homePosts,leaguePosts,score:scoreText(activeGame,away,home),inning:(phase==='live'||phase==='delay')?inningText(activeGame):'',play:playLabel(playType(activeGame)),isBigMoment:bigMoment,watching,chatterScore,chatterHeat,eventToken:eventToken(activeGame),streamKey:keyBase,shouldAmbientPost:phase!=='live'||bucket%2===0};
}
