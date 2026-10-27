import { pickSocialPhrase } from './socialPhraseBank';
import { buildFanUniverse, getSeasonPulse, NETWORK_PERSONALITIES } from './fandomUtils';
import { buildHeadToHead } from './historyUtils';
import { currentSeasonDay, normalizeSeasonCalendar } from './seasonCalendarUtils';

const hash=(s='')=>[...String(s)].reduce((n,c)=>((n*33)^c.charCodeAt(0))>>>0,5381);
const seeded=(s='')=>{const x=Math.sin(hash(s))*10000;return x-Math.floor(x)};
const pick=(arr,key)=>arr[Math.floor(seeded(key)*arr.length)%arr.length];
const gp=t=>Number(t?.wins||0)+Number(t?.losses||0);
const pct=t=>gp(t)?Number(t.wins||0)/gp(t):.5;
const safe=n=>Number(n||0);
const shuffle=(arr,key)=>[...arr].sort((a,b)=>seeded(`${key}-${a.id||a.handle||a.name}`)-seeded(`${key}-${b.id||b.handle||b.name}`));

const FAN_ARCHETYPES=[
  {id:'diehard',label:'Diehard',icon:'🧢'},
  {id:'optimist',label:'Eternal Optimist',icon:'☀️'},
  {id:'doomer',label:'Doomer',icon:'🌧️'},
  {id:'numbers',label:'Stat Nerd',icon:'📊'},
  {id:'troll',label:'Troll Account',icon:'🧌'},
  {id:'historian',label:'Old Head',icon:'📚'},
  {id:'merch',label:'Merch Hunter',icon:'🛍️'},
  {id:'radio',label:'Call-In Regular',icon:'📻'},
];

const TEAM_PAGE_NAMES=['Bleacher Society','Section 117','Faithful Forever','The Dugout','Upper Deck Union','Diamond District','Left Field Loud','The Ninth Inning'];
const PLAYER_PAGE_NAMES=['Appreciation Society','Fan Club','Truthers','Propaganda Dept.','Highlight Archive','Hive','Believers'];

function teamHandle(team,i=0){
  const stem=String(team?.abbr||'SMB').replace(/[^A-Z0-9]/gi,'');
  return `@${stem}${['Faithful','Bleachers','Central','Nation','Talk','Diehards','Daily','Clubhouse'][i%8]}`;
}

export function buildFanClubs(data={},teams=[],playoffPicture=[]){
  const {teamStates}=buildFanUniverse(data,teams,playoffPicture);
  return teamStates.flatMap((state,idx)=>{
    const base=hash(state.team.id||state.team.abbr);
    return [0,1,2,3].map(i=>({
      id:`club-${state.team.id}-${i}`,
      team:state.team,
      name:`${state.team.abbr} ${TEAM_PAGE_NAMES[(base+i*3)%TEAM_PAGE_NAMES.length]}`,
      handle:teamHandle(state.team,i),
      archetype:FAN_ARCHETYPES[(base+i)%FAN_ARCHETYPES.length],
      followers:Math.round(1400+state.marketHeat*185+state.history.titles*5200+i*730),
      bio:[`Independent ${state.team.abbr} fan page. Scoreboard watching, receipts, and unreasonable optimism.`,`For ${state.team.abbr} fans who remember everything and forgive almost nothing.`,`Stats, lineup debates, ballpark chatter and the occasional terrible prediction.`,`Unofficial supporters group. Road trips, rituals, memes and way too much emotional investment.`][i%4],
      mood:state.mood,
      heat:state.marketHeat,
    }));
  });
}

function playerTotals(p={}){
  return {
    hits:safe(p.careerHits??p.hits??p.seasonHits),
    ab:safe(p.careerAB??p.ab??p.seasonAB),
    hr:safe(p.careerHR??p.hr??p.seasonHR),
    wins:safe(p.careerPitchingWins??p.pitchingWins??p.seasonPitchingWins),
    losses:safe(p.careerPitchingLosses??p.pitchingLosses??p.seasonPitchingLosses),
  };
}

export function buildPlayerFanPages(data={},teams=[]){
  const teamMap=new Map(teams.map(t=>[t.id,t]));
  return (data.players||[]).map((p,i)=>{
    const t=teamMap.get(p.teamId); const s=playerTotals(p);
    const impact=s.hr*5+s.hits*.7+s.wins*7;
    const pageType=PLAYER_PAGE_NAMES[hash(p.id||p.name)%PLAYER_PAGE_NAMES.length];
    const slug=String(p.name||'Player').replace(/[^a-z0-9]/gi,'');
    return {id:`playerfan-${p.id||i}`,player:p,team:t,name:`${p.name} ${pageType}`,handle:`@${slug}${['Hive','StanClub','Highlights','Truthers'][i%4]}`,followers:Math.round(320+impact*42+seeded(p.name)*2200),impact,stats:s};
  }).sort((a,b)=>b.impact-a.impact);
}

export function buildMediaUniverse(){
  return [
    ...NETWORK_PERSONALITIES.map((x,i)=>({...x,type:'analyst',handle:`@SMB${x.name.split(' ')[0]}`,show:['Numbers Desk','Clubhouse Live','October Watch','Hot Take Line'][i]})),
    {id:'jo-santos',name:'Jo Santos',role:'League Reporter',style:'reporter',initials:'JS',type:'reporter',handle:'@JoSantosSMB',show:'Around the League'},
    {id:'vince',name:'Vince Calder',role:'Radio Host',style:'radio',initials:'VC',type:'radio',handle:'@VinceAfterDark',show:'Extra Innings AM'},
    {id:'nina',name:'Nina Vale',role:'Features Writer',style:'culture',initials:'NV',type:'writer',handle:'@NinaOnBaseball',show:'The Long Read'},
    {id:'cole',name:'Cole Briggs',role:'Debate Host',style:'hot',initials:'CB',type:'host',handle:'@ColeTakes',show:'Diamond Debate'},
  ];
}

function rivalryForTeam(rivalries,teamId){return rivalries.filter(r=>r.teamAId===teamId||r.teamBId===teamId).sort((a,b)=>b.heat-a.heat)[0]}
function otherTeam(r,teamId){return r?.teamAId===teamId?r.teamB:r?.teamBId===teamId?r.teamA:null}

function teamPost(state,key,rival){
  const t=state.team; const streak=t.streak||''; const rivalTeam=otherTeam(rival,t.id);
  const winPct=pct(t);
  const options=[];
  if(state.mood==='EUPHORIC'||state.mood==='BUZZING') options.push(`I am trying to be normal about ${t.abbr} and it is simply not happening.`);
  if(state.mood==='FURIOUS'||state.mood==='HOPELESS') options.push(`I have seen enough. I will be back tomorrow because apparently I enjoy suffering.`);
  if(streak.startsWith('W')) options.push(`${streak} and suddenly everybody remembers where their ${t.abbr} hat is.`);
  if(streak.startsWith('L')) options.push(`${streak}. Please stop asking me if I am okay.`);
  if(safe(t.runDiff)>8) options.push(`Run differential truthers, this is your moment. ${t.abbr} is cooking.`);
  if(safe(t.runDiff)<-8) options.push(`The run differential is a cry for help.`);
  if(rivalTeam&&rival?.heat>=40) options.push(`${rivalTeam.abbr} fans are in the mentions again. Rent is due on the first.`);
  if(winPct>.62) options.push(`Keep calling it a hot start. We will keep stacking wins.`);
  if(winPct<.38) options.push(`New strategy: score more runs than the other team. Someone forward this to the clubhouse.`);
  options.push(`Baseball has ruined my ability to have a normal evening and I would not change a thing.`,`The group chat has become unusable and first pitch is still hours away.`,`I bought one piece of merch and now I apparently represent the entire franchise.`,`Some days the score matters. Some days I just want to sit in the park and hear the crowd.`,`This fanbase can turn one harmless Tuesday into a civic event.`);
  return pick(options,key);
}

function rivalChirp(state,rival,key){
  const foe=otherTeam(rival,state.team.id); if(!foe)return null;
  const lines=[
    `${foe.abbr} fans bookmarked one win like it was a championship parade. Adorable.`,
    `Friendly reminder that every ${state.team.abbr}-${foe.abbr} game is a completely reasonable time to lose your mind.`,
    `${foe.abbr} in our replies before breakfast. Rivalry week behavior.`,
    `I respect ${foe.abbr} exactly enough to enjoy beating them more.`,
    `Somebody check on the ${foe.abbr} group chat. It got very quiet.`
  ]; return pick(lines,key);
}

function analystPost(person,state,key){
  const t=state.team;
  const byStyle={
    analytics:[`${t.abbr}'s profile is louder than the record: RD ${safe(t.runDiff)>=0?'+':''}${safe(t.runDiff)}, momentum ${Math.round(state.momentum)}.`,`I care less about vibes than underlying quality, and ${t.abbr} has my attention.`],
    momentum:[`You can feel the energy around ${t.abbr} right now. Momentum is real until baseball decides it isn't.`,`I am buying the ${t.abbr} heat check. Do not make me regret this.`],
    history:[`${t.abbr} has ${state.history.titles} title${state.history.titles===1?'':'s'} in the archive. History changes how pressure feels.`,`Every season writes on top of the last one. ${t.abbr} knows that better than most.`],
    chaos:[`My analysis is simple: baseball is weird, ${t.abbr} is interesting, and I want maximum nonsense.`,`I have changed my mind three times and first pitch has not happened yet.`],
    reporter:[`${t.abbr} fan mood is ${state.mood.toLowerCase()}, and you can feel the temperature rising around this club.`],
    radio:[`LINES ARE OPEN. ${t.abbr} fans, tell me why I should believe. Or panic. Your choice.`],
    culture:[`Winning is one thing. Becoming part of the league's mythology is another. ${t.abbr} is building a story.`],
    hot:[`${t.abbr} IS EITHER A FUTURE CHAMPION OR A COMPLETE MIRAGE. There is no third option on television.`]
  };
  return pick(byStyle[person.style]||byStyle.reporter,key);
}

export function buildLivingFeed(data={},teams=[],playoffPicture=[],now=Date.now(),selectedTeamId=''){
  const pulse=getSeasonPulse(data,teams);
  const {teamStates,rivalries,leagueMood}=buildFanUniverse(data,teams,playoffPicture);
  const fanClubs=buildFanClubs(data,teams,playoffPicture);
  const playerPages=buildPlayerFanPages(data,teams);
  const media=buildMediaUniverse();
  const bucket=Math.floor(now/12000);
  const selected=teamStates.find(x=>x.team.id===selectedTeamId);
  const focus=selected?[selected,...shuffle(teamStates.filter(x=>x.team.id!==selectedTeamId),`focus-${bucket}`).slice(0,5)]:shuffle(teamStates,`teams-${bucket}`).slice(0,7);
  const posts=[];

  focus.forEach((state,i)=>{
    const club=pick(fanClubs.filter(c=>c.team.id===state.team.id),`club-${bucket}-${state.team.id}`);
    const rival=rivalryForTeam(rivalries,state.team.id);
    posts.push({id:`team-${bucket}-${state.team.id}-${i}`,kind:'fan',handle:club?.handle||teamHandle(state.team,i),name:club?.name||`${state.team.abbr} Fans`,team:state.team,text:teamPost(state,`teamtext-${bucket}-${state.team.id}`,rival),tone:state.approval>=60?'up':state.approval<38?'down':'neutral',badge:club?.archetype?.label||'Fan Page',time:'now'});
    if(rival&&rival.heat>=35&&i<4){const chirp=rivalChirp(state,rival,`chirp-${bucket}-${state.team.id}`);if(chirp)posts.push({id:`rival-${bucket}-${state.team.id}`,kind:'rivalry',handle:`@${state.team.abbr}RivalryDept`,name:`${state.team.abbr} Rivalry Department`,team:state.team,text:chirp,tone:'spicy',badge:`${rival.label} · ${Math.round(rival.heat)} HEAT`,time:'now'});}
  });

  shuffle(media,`media-${bucket}`).slice(0,4).forEach((m,i)=>{const state=focus[i%focus.length]||teamStates[0];if(state)posts.push({id:`media-${bucket}-${m.id}`,kind:'media',handle:m.handle,name:m.name,team:state.team,text:analystPost(m,state,`mediatxt-${bucket}-${m.id}`),tone:m.style==='hot'?'spicy':'media',badge:`${m.role} · ${m.show}`,time:'live'});});

  shuffle(playerPages,`players-${bucket}`).slice(0,3).forEach((p,i)=>{
    const s=p.stats; const stat=s.hr?`${s.hr} HR`:s.hits?`${s.hits} H`:s.wins?`${s.wins} W`:'the vibes';
    const txt=pick([`${p.player.name} appreciation post. That is it. That is the post.`,`The ${p.player.name} agenda remains undefeated. We have ${stat} worth of receipts.`,`If ${p.player.name} has a million fans, I am one. If there is one, it is me.`,`Posting ${p.player.name} propaganda until morale improves.`],`player-${bucket}-${p.id}`);
    posts.push({id:`player-${bucket}-${p.id}`,kind:'player',handle:p.handle,name:p.name,team:p.team,text:txt,tone:'up',badge:`PLAYER FAN PAGE · ${p.followers.toLocaleString()} followers`,time:'now'});
  });

  const currentSlot=currentSeasonDay(data,teams)?.slotIndex;
  const calendar=normalizeSeasonCalendar(data);
  const promoSchedule=data.leagueExtras?.gameNightSchedule||{};
  const resellerWindowOpen=Number.isInteger(currentSlot)&&calendar.some((gameNumber,slotIndex)=>{
    const promo=gameNumber?promoSchedule[String(gameNumber)]:null;
    const age=currentSlot-slotIndex;
    return promo?.type==='giveaway'&&age>=0&&age<=2;
  });
  const ambientCats=['stadium','home','work','food','merch','family','travel','casual','oldhead','newfan','superstition','pets','radio','parking','gates','seats','concourse','restroom','scorekeeper','optimism','doomer','neighbors','commuteHome','memories','friends','heckler','broadcast','tickets','offbeat',...(resellerWindowOpen?['reseller']:[]),'collector','vendor','localbiz','mascot','foulball','watchparty','transit','uniforms','autograph','seasonticket','photos','wave','scoreboard','callin','quiet'];
  shuffle(focus,`ambient-${bucket}`).slice(0,4).forEach((state,i)=>{
    const cat=ambientCats[(hash(`${state.team.id}-${bucket}-${i}`)+bucket+i)%ambientCats.length];
    const identities={stadium:['Upper Deck Dispatch','@UpperDeckDispatch','AT THE PARK'],home:['Couch Crew','@CouchCrew','WATCHING AT HOME'],work:['Definitely Working','@BoxScoreAtWork','SCORE CHECKER'],food:['Ballpark Bites','@BallparkBites','FOOD ACCOUNT'],merch:['Jersey Closet','@JerseyCloset','MERCH COLLECTOR'],family:['Baseball Family','@FirstPitchFamily','FAMILY SECTION'],travel:['Road Trip Baseball','@RoadTripBaseball','TRAVELING FAN'],casual:['Just Checking In','@JustCheckingScore','CASUAL FAN'],oldhead:['Scorebook Forever','@ScorebookForever','OLD-HEAD'],newfan:['Learning Baseball','@LearningTheGame','NEW FAN'],superstition:['Rally Rituals','@DontMoveTheHat','SUPERSTITIOUS'],pets:['Ballpark Dogs','@DogsLoveBaseball','PET ACCOUNT'],radio:['Call-In Line','@LateNightBaseball','RADIO CALLER'],parking:['Lot C Dispatch','@ParkingLotBaseball','PARKING LOT'],gates:['Gate Line Report','@GateLineReport','AT THE GATES'],seats:['Section Neighbors','@SectionNeighbors','IN THE SEATS'],reseller:['Giveaway Market','@GateFlippers','RESELLER WATCH'],collector:['Promo Collector','@GiveawayTracker','COLLECTOR'],vendor:['Concourse Vendor','@HotDogGuy118','STADIUM VENDOR'],localbiz:['Neighborhood Baseball','@LocalGameDay','LOCAL BUSINESS'],mascot:['Mascot Watch','@MascotWatch','MASCOT DESK'],foulball:['Foul Ball Patrol','@FoulBallPatrol','BALLPARK CHAOS'],watchparty:['Watch Party','@GameOnEveryScreen','WATCH PARTY'],transit:['Transit to the Park','@TrainFullOfJerseys','GETTING THERE'],uniforms:['Uniform Department','@UniformDiscourse','UNIFORM NERD'],autograph:['Rail Crew','@PregameAutographs','AUTOGRAPH HUNTER'],seasonticket:['Same Seats Society','@SameSeatsEveryGame','SEASON TICKET HOLDER'],photos:['Ballpark Frames','@BallparkFrames','STADIUM PHOTOGRAPHY'],wave:['Wave Discourse','@WaveDebate','IMPORTANT NONSENSE'],scoreboard:['Big Screen Watch','@ScoreboardMoments','IN-GAME ENTERTAINMENT'],callin:['Postgame Call-In','@PhoneLinesOpen','RADIO CALLER'],concourse:['Concourse Loop','@ConcourseLoop','AROUND THE PARK'],restroom:['Inning Break Mission','@MadeItBack','STADIUM LIFE'],scorekeeper:['Scorebook Society','@PencilAndBoxscore','SCOREKEEPER'],optimism:['Hope Department','@OneRallyAway','OPTIMIST'],doomer:['Doom Line','@SeenEnoughStillWatching','DOOMER'],neighbors:['Section Group Chat','@RowMates','SEAT NEIGHBORS'],commuteHome:['Ride Home Radio','@StillInTheCar','COMMUTE'],memories:['Baseball Memory Bank','@RememberThatGame','LEAGUE MEMORY'],friends:['Group Chat Baseball','@MutedForJinxing','GROUP CHAT'],heckler:['Bleacher Microphone','@SectionHeckler','HECKLER'],broadcast:['Broadcast Watch','@BoothAndReplay','TV WATCHER'],tickets:['Ticket Watch','@LastMinuteSeats','TICKET TALK'],offbeat:['Baseball Side Quest','@BetweenInnings','OFFBEAT'],quiet:['Cheap Seats Chat','@CheapSeatsChat','FAN CHAT']};
    const [name,handle,badge]=identities[cat]||identities.quiet;
    posts.push({id:`ambient-${bucket}-${state.team.id}-${cat}`,kind:'fan',handle,name,team:state.team,text:pickSocialPhrase(cat,`${state.team.id}-${i}`,bucket),tone:'neutral',badge,time:'now'});
  });

  const latest=(data.games||[]).filter(g=>g?.status==='Final').slice(-1)[0];
  if(latest){const aw=teams.find(t=>t.id===latest.awayTeamId),hm=teams.find(t=>t.id===latest.homeTeamId);const winner=safe(latest.awayScore)>safe(latest.homeScore)?aw:hm;posts.push({id:`final-${bucket}`,kind:'league',handle:'@SMBAfterFinal',name:'After Final',team:winner,text:`${aw?.abbr||'AWY'} ${latest.awayScore}, ${hm?.abbr||'HME'} ${latest.homeScore}. The replies are already a disaster.`,tone:'media',badge:'POSTGAME WIRE',time:'final'});}
  posts.push({id:`league-${bucket}`,kind:'league',handle:'@LeagueGroupChat',name:'The League Group Chat',team:null,text:`Current league mood: ${leagueMood}. Week ${pulse.week}, Day ${pulse.dayInWeek}. Everybody has a take.`,tone:'neutral',badge:'LEAGUE CHAT',time:'live'});
  return shuffle(posts,`feed-${bucket}`).slice(0,18);
}

export function buildFanTraditions(data={},teams=[],playoffPicture=[]){
  const {teamStates}=buildFanUniverse(data,teams,playoffPicture);
  const traditionNames=['Rally Towel Night','Wear the Colors','Bleacher Takeover','Lucky Cap Night','The Seventh-Inning Roar','No Sitting After Six','Home Run Horn','Two-Out Thunder'];
  return teamStates.map((s,i)=>({
    team:s.team,
    tradition:traditionNames[hash(s.team.id)%traditionNames.length],
    loyalty:Math.round(Math.min(100,42+s.history.playoffs*7+s.history.titles*10+(100-s.bandwagon)*.18)),
    identity:s.history.titles>=2?'Championship Standard':s.history.playoffs>=2?'October-Hungry':s.approval<35?'Long-Suffering Faithful':s.marketHeat>70?'Baseball-Crazy Town':'Loyal Locals',
    crowd:s.atmosphere,
  }));
}

export function buildLegacyDebates(data={},teams=[],playoffPicture=[],now=Date.now()){
  const {teamStates,rivalries}=buildFanUniverse(data,teams,playoffPicture); const bucket=Math.floor(now/180000);
  const best=[...teamStates].sort((a,b)=>(b.history.titles*50+b.actual*20+b.momentum*.1)-(a.history.titles*50+a.actual*20+a.momentum*.1))[0];
  const hottest=[...teamStates].sort((a,b)=>b.momentum-a.momentum)[0];
  const rival=rivalries[0];
  const debates=[];
  if(best)debates.push({label:'LEGACY DEBATE',question:`Is ${best.team.abbr} becoming the league's defining franchise?`,sideA:'Absolutely',sideB:'Not yet'});
  if(hottest)debates.push({label:'HEAT CHECK',question:`Are you buying the ${hottest.team.abbr} surge?`,sideA:'Buy',sideB:'Sell'});
  if(rival)debates.push({label:'RIVALRY DESK',question:`Has ${rival.teamA.abbr} vs ${rival.teamB.abbr} become must-watch baseball?`,sideA:'Appointment TV',sideB:'Needs more history'});
  return debates.map((d,i)=>({...d,a:45+Math.round(seeded(`${bucket}-${i}`)*35),id:`debate-${i}`})).map(d=>({...d,b:100-d.a}));
}
