import { makeSafePlayoffBracket } from './playoffUtils';
import { getTeamColorsByAbbr } from '../config/teamColors';

const safeArr=x=>Array.isArray(x)?x:[];
const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`cer-${Date.now()}-${Math.random()}`;

export const CEREMONY_TYPES=[
  {id:'banner',icon:'🎏',name:'League Championship Banner Unveiling',tone:'banner'},
  {id:'rings',icon:'💍',name:'World Series Ring Ceremony',tone:'gold'},
  {id:'trophy',icon:'🏆',name:'World Series Trophy Presentation',tone:'gold'},
  {id:'retired-number',icon:'🔢',name:'Retired Number Ceremony',tone:'legacy'},
  {id:'hall-of-fame',icon:'🏛️',name:'Hall of Fame Induction Night',tone:'legacy'},
  {id:'alumni',icon:'🤝',name:'Alumni Weekend',tone:'legacy'},
  {id:'anniversary',icon:'🎉',name:'Championship Anniversary Night',tone:'gold'},
  {id:'first-pitch',icon:'⚾',name:'Ceremonial First Pitch',tone:'event'},
  {id:'legend',icon:'⭐',name:'Franchise Legend Day',tone:'legacy'},
  {id:'milestone',icon:'📍',name:'Franchise Milestone Ceremony',tone:'event'},
  {id:'tribute',icon:'🕯️',name:'Memorial / Tribute Ceremony',tone:'legacy'},
  {id:'opening-day',icon:'⚾',name:'Opening Day Ceremony',tone:'event'},
  {id:'fan-appreciation',icon:'❤️',name:'Fan Appreciation Ceremony',tone:'event'},
  {id:'reunion',icon:'🤝',name:'Championship Reunion',tone:'gold'},
  {id:'league-award',icon:'🏅',name:'League Award Presentation',tone:'gold'},
  {id:'historic-team',icon:'📜',name:'Historic Team Recognition',tone:'legacy'},
  {id:'custom',icon:'✨',name:'Custom Ceremony',tone:'event'},
];

function archivedSeasonNumber(season={}){
  const explicit=Number(season.seasonNumber||season.number||0); if(explicit>0)return explicit;
  const match=String(season.name||'').match(/season\s*(\d+)/i); return match?Number(match[1]):0;
}
function latestArchivedSeason(history=[]){
  return [...safeArr(history)].sort((a,b)=>{
    const numDiff=archivedSeasonNumber(b)-archivedSeasonNumber(a); if(numDiff)return numDiff;
    return (Date.parse(b?.archivedAt||'')||0)-(Date.parse(a?.archivedAt||'')||0);
  })[0]||null;
}
export function previousSeasonChampions(data={},teams=[]){
  const season=latestArchivedSeason(data.seasonHistory); if(!season)return null;
  const bracket=makeSafePlayoffBracket(season.playoffBracket);
  const seasonTeams=season.teams||[];
  const team=id=>seasonTeams.find(t=>t.id===id)||teams.find(t=>t.id===id)||null;
  const al=team(bracket.al?.lc?.winnerTeamId),nl=team(bracket.nl?.lc?.winnerTeamId),champ=team(season.championTeamId||bracket.finals?.winnerTeamId);
  return {season,al,nl,champ};
}
export function seedOpeningCeremonies(data={},teams=[]){
  const prev=previousSeasonChampions(data,teams); if(!prev)return [];
  const seasonName=data.activeSeasonName||'Current Season'; const events=[];
  [prev.al,prev.nl].filter(Boolean).forEach(team=>{
    if(team.id===prev.champ?.id)return;
    events.push({id:uid(),type:'banner',teamId:team.id,teamAbbr:team.abbr,title:`${prev.season.name||'Previous Season'} League Championship Banner Ceremony — ${team.abbr}`,detail:`Celebrating ${team.abbr}'s ${prev.season.name||'previous season'} league championship. Choose the Game Day or standalone league date when you want the banner raised.`,seasonName,gameNumber:0,timing:'PREGAME',status:'pending',source:'opening-seed',originSeasonName:prev.season.name||'',createdAt:new Date().toISOString()});
  });
  if(prev.champ){
    events.push({id:uid(),type:'championship-opening',teamId:prev.champ.id,teamAbbr:prev.champ.abbr,title:`${prev.season.name||'Previous Season'} World Series Banner, Trophy & Ring Ceremony — ${prev.champ.abbr}`,detail:`The ${prev.season.name||'previous season'} World Series champions raise their World Series banner, present the trophy and receive championship rings. Choose exactly when the full reveal happens.`,seasonName,gameNumber:0,timing:'PREGAME',status:'pending',includes:['banner','trophy','rings'],source:'opening-seed',originSeasonName:prev.season.name||'',createdAt:new Date().toISOString()});
  }
  return events;
}
export function buildCeremonyTimeline(data={},teams=[]){
  const list=safeArr(data.leagueExtras?.ceremonies); return [...list].sort((a,b)=>(Number(a.gameNumber||999)-Number(b.gameNumber||999))||String(a.createdAt||'').localeCompare(String(b.createdAt||''))).map(c=>({...c,team:teams.find(t=>t.id===c.teamId)||teams.find(t=>t.abbr===c.teamAbbr)||null}));
}
export function ceremonyForGame(data={},teams=[],gameNumber){return buildCeremonyTimeline(data,teams).filter(c=>Number(c.gameNumber||0)===Number(gameNumber||0))}
export function ceremonyTheme(ceremony){
  const team=ceremony?.team;const colors=getTeamColorsByAbbr(team?.abbr||ceremony?.teamAbbr);return {main:colors.main,alt:colors.alt,border:colors.border,text:colors.text};
}
export function ceremonySocialLines(ceremony,team){
  const abbr=team?.abbr||ceremony?.teamAbbr||'TEAM';
  const type=ceremony?.type;
  if(type==='championship-opening')return [`The rings are out. The trophy is here. ${abbr} gets one more night to celebrate the title.`,`Seeing the World Series banner go up in person is unreal.`,`That ring reveal just made the whole building louder.`,`The trophy presentation got a standing ovation before first pitch.`,`New season, same hardware. Everybody wants what ${abbr} has.`];
  if(type==='banner')return [`The banner is going up. That season is officially in the rafters now.`,`Seeing ${abbr}'s league title become permanent hits different.`,`One more banner in the building. Earned.`];
  if(type==='retired-number')return [`That number belongs in the rafters forever.`,`Whole place stood up for that one. What a career.`];
  return [`Special ceremony tonight for ${abbr}. The building feels different already.`,`This is one of those nights fans remember.`];
}

const COMMISSIONER_SPEECH_BANK=[
  "Tonight, we do more than celebrate a result. We recognize a club that carried the pressure of a season, answered it, and earned a permanent place in NMLB history.",
  "Every championship begins as a possibility and ends as proof. This team turned months of work into something no standings page can ever take away.",
  "A pennant is not given for promise. A championship is not awarded for potential. These honors are earned, and tonight this club receives what it earned.",
  "The NMLB is built on rivalries, long nights, heartbreak and belief. This team survived all of it, and tonight the league stands together to recognize them.",
  "There are seasons a fan remembers by record, and there are seasons remembered by feeling. This was one of those seasons, and this ceremony makes that memory permanent.",
  "To the players, staff, families and fans who carried this season from Opening Day to its final out: tonight belongs to all of you.",
  "Championships become history only after somebody is brave enough to chase them. This club chased one all the way to the end.",
  "The banner that rises tonight is more than fabric. It is every comeback, every late inning, every road trip and every person who believed before the result was certain.",
  "We spend a season asking who is good enough, tough enough and ready enough. This team answered every question the league could ask.",
  "The NMLB remembers its champions because champions help define the league itself. Tonight, another chapter joins that record.",
  "A season can change in one inning, one swing, one decision. Great teams survive those moments. Championship teams make them their own.",
  "Tonight we honor the standard this club set: compete every day, carry the pressure, and leave the league with no choice but to remember your name.",
  "No championship run belongs to one person. It belongs to a clubhouse, a city and a fanbase that carried the same hope through every uncertain night.",
  "There is no shortcut to this stage. The only road here runs through the entire league, and this team made it to the end of that road.",
  "The celebration will end. The season will move on. But the banner, the record and the memory of what happened will remain.",
  "Tonight is why we play the season. To create a moment large enough that an entire city can point to it years from now and say: we were there.",
  "From the first pitch of the year to the final celebration, this club gave the NMLB a season worth remembering. Tonight, we make sure we never forget it.",
  "Some teams win games. Some teams win moments. This team won enough of both to stand here tonight as champions."
];

const MANAGER_SPEECH_BANK=[
  "This group never needed to be reminded what was at stake. They showed up, trusted each other, and kept finding one more way to win.",
  "I told these players all year that the only game we could control was the next one. Somehow, that simple idea carried us all the way here.",
  "The banner has the team name on it, but every person in this building owns a piece of it. We heard you all season, especially when we needed you most.",
  "There were nights when we looked unbeatable and nights when nothing came easy. What never changed was the belief in that clubhouse.",
  "You remember the celebrations, but I remember the work before the doors opened, the travel, the meetings, the losses that hurt and the way these guys responded.",
  "Nobody in our room ever asked for the easy road. They asked for another chance, another inning and another game. That is why we are standing here.",
  "The best thing about this team was that nobody cared who got the credit. They cared whether the person next to them had what they needed to win.",
  "We knew this fanbase would hold us accountable, and we loved that. You pushed us, you believed in us, and you made this place impossible for opponents when it mattered.",
  "A championship season has a thousand little moments nobody outside the clubhouse sees. I wish every one of you could have seen how much this group wanted it.",
  "When the pressure got louder, this team got calmer. When the games got bigger, they trusted each other more. That is a rare thing to coach.",
  "I could stand here and talk about talent all night. What I am proudest of is the toughness, the patience and the way this team kept answering adversity.",
  "We did not win because every night went according to plan. We won because when the plan broke, somebody always found another way.",
  "To every player who took an at-bat, threw a pitch, made a play or picked up a teammate after a bad night: this belongs to you.",
  "To the fans who stayed loud through the losses, the travel and the nervous innings: this belongs to you just as much as it belongs to us.",
  "I have coached a lot of games. I will remember the way this club looked at each other before the biggest ones for the rest of my life.",
  "Championships are supposed to be difficult. Ours certainly was. That is exactly why this one means what it means.",
  "This group made pressure feel like a privilege. Every big game was another chance to show who we were.",
  "We wanted to give this city something permanent. Look up at that banner. We did.",
  "The season is over, but what these players built together is not. That standard comes with us into every season that follows.",
  "There is nothing I can say that will match the sound this building made when we knew we had done it. I will never forget that sound.",
  "You can count wins, runs and innings. You cannot really measure how much these players cared about each other. That was our edge.",
  "Tonight is a celebration, but it is also a thank you. Thank you to everyone who carried us when the season got heavy.",
  "The next season will ask us to prove ourselves again. Good. But tonight, for one more night, we are going to enjoy what this team earned.",
  "They will remember the trophy and the banner. I will remember the people who made them possible."
];

const FAN_VOICE_BANK=[
  "I watched the whole run and I still cannot believe we get to look up and see that banner forever.",
  "Every stressful ninth inning was worth it for this exact moment.",
  "I brought my family because I wanted them to remember what this building sounded like tonight.",
  "That season belongs to this city now. Nobody can take it away from us.",
  "The second that banner started moving, I got chills. That is our season up there.",
  "I have replayed the final out a hundred times. Seeing the ceremony somehow made it feel real all over again.",
  "We argued about this team all year and now we get to argue about where they rank in history.",
  "The trophy is beautiful, but hearing this crowd when it appeared was even better.",
  "I waited all offseason for tonight. Worth every second.",
  "This is the kind of night that turns kids into fans for life.",
  "You can feel how much the whole city still cares about that run.",
  "I am never going to walk into this park again without looking at that banner first.",
  "They gave us a season we will be talking about for years.",
  "I thought I was done getting emotional about the championship. Apparently not.",
  "That banner is going to be hanging there when we are all telling the next generation about this team.",
  "The whole building knew what was coming and it still exploded when the reveal happened.",
  "This is why you stick with a team through every awful loss. Nights like this.",
  "I do not care what happens next. Nobody can erase what this club already did.",
  "The league can start chasing us again tomorrow. Tonight is ours.",
  "It feels like the season got one final victory lap."
];

function stableCeremonyIndex(seed='',size=1,offset=0){
  const raw=String(seed||'NMLB'); let hash=2166136261;
  for(let i=0;i<raw.length;i++){hash^=raw.charCodeAt(i);hash=Math.imul(hash,16777619)}
  return Math.abs((hash+offset)|0)%Math.max(1,size);
}

export function buildCeremonyScript(ceremony={},team={}){
  const seed=`${ceremony.id||''}|${ceremony.originSeasonName||ceremony.seasonName||''}|${team.abbr||ceremony.teamAbbr||''}|${ceremony.type||''}`;
  const isWorld=ceremony.type==='championship-opening';
  const commissioner=COMMISSIONER_SPEECH_BANK[stableCeremonyIndex(seed,COMMISSIONER_SPEECH_BANK.length,11)];
  const manager=MANAGER_SPEECH_BANK[stableCeremonyIndex(seed,MANAGER_SPEECH_BANK.length,29)];
  const fans=Array.from({length:4},(_,i)=>FAN_VOICE_BANK[stableCeremonyIndex(seed,FAN_VOICE_BANK.length,47+i*13)]);
  return {
    commissioner,
    manager,
    fans,
    opening:isWorld
      ?`The championship season returns to center stage. Tonight ${team.city||team.abbr||'this city'} raises the banner, welcomes home Nicky’s Commissioner’s Trophy and places championship rings into the hands that earned them.`
      :`Tonight ${team.city||team.abbr||'this city'} turns a league championship into something permanent. The pennant earned on the field now rises into the rafters.` ,
    road:`${ceremony.originSeasonName||'That season'} is remembered here as more than a line in the standings. It was the long road that brought ${team.abbr||'this club'} from Opening Day pressure to a championship night no one in the fanbase has to forget.`,
    finale:isWorld
      ?`The banner is raised. Nicky’s Commissioner’s Trophy has returned to the champions. The rings have been revealed. Let the fireworks carry this title into NMLB history.`
      :`The banner is raised, the pennant is permanent, and the fanbase gets one more roar for the team that conquered its league.`
  };
}

