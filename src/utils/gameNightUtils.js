import { getSeasonPulse } from './fandomUtils';
import { currentSeasonDay } from './seasonCalendarUtils';

const hash=(s='')=>[...String(s)].reduce((n,c)=>((n*33)^c.charCodeAt(0))>>>0,5381);
const seeded=(s='')=>{const x=Math.sin(hash(s))*10000;return x-Math.floor(x)};

export const GAME_NIGHT_BANK=[
  {id:'opening-day',name:'Opening Day Celebration',icon:'⚾',type:'spectacle',hype:18,attendance:18,merch:'Opening Day Collection',giveaway:'Opening Day bunting, ceremonies and first-game festivities'},
  {id:'all-star',name:'All-Star Break Celebration',icon:'⭐',type:'spectacle',hype:18,attendance:18,merch:'All-Star Collection',giveaway:'Game 20 celebration, league honors and special presentation'},
  {id:'fireworks',name:'Fireworks Night',icon:'🎆',type:'spectacle',hype:12,attendance:10,merch:'Fireworks Night Tee',giveaway:'Postgame fireworks show'},
  {id:'bobblehead',name:'Bobblehead Giveaway',icon:'🗿',type:'giveaway',hype:10,attendance:14,merch:'Limited Bobblehead',giveaway:'First 10,000 fans receive a bobblehead'},
  {id:'cap',name:'Team Cap Giveaway',icon:'🧢',type:'giveaway',hype:8,attendance:10,merch:'Giveaway Cap',giveaway:'First 8,000 fans receive a team cap'},
  {id:'jersey',name:'Replica Jersey Night',icon:'👕',type:'giveaway',hype:14,attendance:16,merch:'Replica Jersey',giveaway:'Replica jersey giveaway while supplies last'},
  {id:'rally-towel',name:'Rally Towel Night',icon:'📣',type:'rivalry',hype:9,attendance:8,merch:'Rally Towel',giveaway:'Rally towel at the gates'},
  {id:'throwback',name:'Throwback Night',icon:'📻',type:'heritage',hype:9,attendance:7,merch:'Throwback Collection',giveaway:'Retro presentation and throwback merch drop'},
  {id:'fan-appreciation',name:'Fan Appreciation Night',icon:'❤️',type:'community',hype:11,attendance:12,merch:'Fan Appreciation Tee',giveaway:'Surprises and thank-you giveaways throughout the game'},
  {id:'kids',name:'Kids Day',icon:'⚾',type:'family',hype:7,attendance:8,merch:'Kids Club Pack',giveaway:'Kids giveaways and family activities'},
  {id:'dog',name:'Bark at the Park',icon:'🐶',type:'community',hype:8,attendance:7,merch:'Ballpark Dog Bandana',giveaway:'Dog-friendly sections and pet bandana giveaway'},
  {id:'heritage',name:'Franchise Heritage Night',icon:'🏛️',type:'heritage',hype:8,attendance:6,merch:'Heritage Series',giveaway:'Celebrating franchise history and alumni'},
  {id:'rivalry',name:'Rivalry Night',icon:'🔥',type:'rivalry',hype:15,attendance:15,merch:'Rivalry Series Tee',giveaway:'Special rivalry presentation and limited merch'},
  {id:'student',name:'College Night',icon:'🎓',type:'community',hype:5,attendance:6,merch:'College Night Tee',giveaway:'Student ticket specials and themed concourse events'},
  {id:'food',name:'Ballpark Bites Night',icon:'🌭',type:'food',hype:6,attendance:5,merch:'Ballpark Bites Mug',giveaway:'Featured food specials around the park'},
  {id:'music',name:'Music Night',icon:'🎵',type:'spectacle',hype:7,attendance:6,merch:'Music Night Tee',giveaway:'Special walk-up playlist and postgame music'},
  {id:'military',name:'Service Appreciation Night',icon:'⭐',type:'community',hype:7,attendance:6,merch:'Appreciation Cap',giveaway:'Special recognition throughout the game'},
  {id:'alumni',name:'Alumni Night',icon:'🏆',type:'heritage',hype:10,attendance:9,merch:'Alumni Collection',giveaway:'Former players honored pregame'},
  {id:'cards',name:'Baseball Card Giveaway',icon:'🃏',type:'giveaway',hype:8,attendance:9,merch:'Team Card Set',giveaway:'Exclusive team card set for early arrivals'},
  {id:'poster',name:'Poster Night',icon:'🖼️',type:'giveaway',hype:5,attendance:5,merch:'Commemorative Poster',giveaway:'Limited poster at the gates'},
  {id:'beanie',name:'Beanie Giveaway',icon:'🧶',type:'giveaway',hype:6,attendance:7,merch:'Team Beanie',giveaway:'Limited team beanie giveaway'},
  {id:'community',name:'Community Night',icon:'🤝',type:'community',hype:5,attendance:5,merch:'Community Series Tee',giveaway:'Local community groups celebrated in-game'},
  {id:'ring-night',name:'Replica Ring Night',icon:'💍',type:'giveaway',hype:17,attendance:18,merch:'Replica Championship Ring',giveaway:'Replica championship ring giveaway while supplies last'},
  {id:'pennant',name:'Pennant Giveaway',icon:'🎏',type:'giveaway',hype:10,attendance:11,merch:'Commemorative Pennant',giveaway:'Limited pennant giveaway at the gates'},
  {id:'heritage-day',name:'Baseball Heritage Day',icon:'📜',type:'heritage',hype:8,attendance:8,merch:'Heritage Collection',giveaway:'Franchise history exhibits, alumni stories and throwback presentation'},
  {id:'first-responders',name:'First Responders Night',icon:'🚒',type:'community',hype:7,attendance:7,merch:'Community Appreciation Cap',giveaway:'Pregame recognition and community presentation'},
  {id:'kids-runs-bases',name:'Kids Run the Bases',icon:'🏃',type:'family',hype:9,attendance:11,merch:'Kids Club Tee',giveaway:'Kids run the bases after the game'},
  {id:'retro-jersey',name:'Retro Jersey Day',icon:'🧥',type:'heritage',hype:11,attendance:10,merch:'Retro Jersey Collection',giveaway:'Throwback uniforms, history features and retro merch'},
  {id:'supporters',name:'Supporters Club Night',icon:'📣',type:'community',hype:8,attendance:9,merch:'Supporters Scarf',giveaway:'Fan groups and supporter sections celebrated around the park'},
  {id:'mascot-birthday',name:'Mascot Birthday',icon:'🎂',type:'family',hype:7,attendance:8,merch:'Mascot Collection',giveaway:'Mascot party, kids activities and special in-game bits'},
  {id:'section-takeover',name:'Bleacher Section Takeover',icon:'🏟️',type:'rivalry',hype:10,attendance:10,merch:'Bleacher Crew Tee',giveaway:'Designated supporter section takeover and chant night'},
  {id:'charity',name:'Charity Night',icon:'💙',type:'community',hype:6,attendance:7,merch:'Community Benefit Tee',giveaway:'Community fundraising and special recognition'},
  {id:'food-festival',name:'Ballpark Food Festival',icon:'🍔',type:'food',hype:9,attendance:10,merch:'Ballpark Bites Pack',giveaway:'Expanded concession specials and fan food voting'},
  {id:'champ-anniversary',name:'Championship Anniversary Night',icon:'🏆',type:'heritage',hype:15,attendance:15,merch:'Anniversary Champions Collection',giveaway:'Championship alumni, trophy display and anniversary presentation'},
  {id:'collector',name:'Collector Night',icon:'🧤',type:'giveaway',hype:9,attendance:9,merch:'Collector Series',giveaway:'Limited collectible, card trading and memorabilia displays'},
  {id:'local-business',name:'Local Business Night',icon:'🏪',type:'community',hype:5,attendance:6,merch:'City Series Tee',giveaway:'Local businesses and neighborhood partners featured in the park'},
  {id:'scorecard',name:'Scorecard Night',icon:'✏️',type:'heritage',hype:5,attendance:5,merch:'Classic Scorebook',giveaway:'Commemorative scorecard and pencils for early arrivals'},
  {id:'mini-trophy',name:'Mini Trophy Giveaway',icon:'🏆',type:'giveaway',hype:14,attendance:15,merch:'Mini Championship Trophy',giveaway:'Mini replica trophy giveaway while supplies last'},
];

export function getScheduledGameNight(data={},gameNumber){
  const schedule=data.leagueExtras?.gameNightSchedule||{};
  const entry=schedule[String(gameNumber)]||null;
  if(!entry)return null;
  const base=GAME_NIGHT_BANK.find(x=>x.id===entry.promoId)||GAME_NIGHT_BANK.find(x=>x.name===entry.name)||null;
  return {...base,...entry,gameNumber:Number(gameNumber)};
}

export function getCurrentGameNight(data={},teams=[]){
  const explicit=Number(data.currentGame?.seasonGameNumber||0);
  const scheduled=explicit>0?explicit:Number(currentSeasonDay(data,teams)?.gameNumber||0);
  if(scheduled>0)return getScheduledGameNight(data,scheduled);
  const pulse=getSeasonPulse(data,teams);
  return getScheduledGameNight(data,pulse.day);
}


export function autoGameNightFor(data={},teams=[],gameNumber){
  const season=data.activeSeasonName||'season';
  const idx=Math.floor(seeded(`${season}-${gameNumber}-promo`)*GAME_NIGHT_BANK.length)%GAME_NIGHT_BANK.length;
  return {...GAME_NIGHT_BANK[idx],gameNumber:Number(gameNumber),source:'auto'};
}

export function buildGameNightCalendar(data={},teams=[]){
  return Array.from({length:40},(_,i)=>{const n=i+1;return getScheduledGameNight(data,n)||{gameNumber:n};});
}


export function autoFillGameNights(data={},teams=[]){
  const out={};
  const opening=GAME_NIGHT_BANK.find(x=>x.id==='opening-day');
  const allstar=GAME_NIGHT_BANK.find(x=>x.id==='all-star');
  out['1']={...opening,gameNumber:1,source:'auto-season'};
  out['20']={...allstar,gameNumber:20,source:'auto-season'};
  const candidateDays=[3,5,8,11,14,17,23,26,29,32,35,38,40];
  candidateDays.forEach((day,i)=>{
    const pool=GAME_NIGHT_BANK.filter(x=>!['opening-day','all-star'].includes(x.id));
    const idx=Math.floor(seeded(`${data.activeSeasonName||'season'}-${day}-${i}`)*pool.length)%pool.length;
    out[String(day)]={...pool[idx],gameNumber:day,source:'auto-season'};
  });
  return out;
}
