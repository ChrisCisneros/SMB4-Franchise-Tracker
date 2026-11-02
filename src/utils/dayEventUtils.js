const hash=(s='')=>[...String(s)].reduce((n,c)=>((n*33)^c.charCodeAt(0))>>>0,5381);

export const OFF_DAY_EVENT_BANK=[
  {id:'concert',name:'Ballpark Concert',icon:'🎤',type:'entertainment',timeType:'NIGHT',location:'IN PARK',detail:'The field becomes a concert venue with food, merch and a full crowd atmosphere.'},
  {id:'movie',name:'Movie at the Ballpark',icon:'🎬',type:'entertainment',timeType:'NIGHT',location:'IN PARK',detail:'Fans spread out around the field and stands for a giant-screen movie night.'},
  {id:'fan-fest',name:'Fan Fest',icon:'🎪',type:'community',timeType:'DAY',location:'IN + AROUND PARK',detail:'Games, booths, photo spots, fan clubs and team history take over the property.'},
  {id:'open-house',name:'Ballpark Open House',icon:'🏟️',type:'community',timeType:'DAY',location:'IN PARK',detail:'Fans explore normally closed ballpark spaces, the warning track and dugout areas.'},
  {id:'youth-clinic',name:'Youth Baseball Clinic',icon:'⚾',type:'community',timeType:'DAY',location:'IN PARK',detail:'Local kids take the field for drills, coaching and team-run baseball activities.'},
  {id:'food-fest',name:'Ballpark Food Festival',icon:'🍔',type:'food',timeType:'AFTERNOON',location:'AROUND PARK',detail:'Concessions and local vendors turn the plaza into a food festival and fan vote.'},
  {id:'street-fair',name:'Stadium District Street Fair',icon:'🎡',type:'community',timeType:'DAY',location:'AROUND PARK',detail:'The blocks around the stadium fill with vendors, music, games and team colors.'},
  {id:'alumni',name:'Alumni Day',icon:'🏆',type:'heritage',timeType:'DAY',location:'IN PARK',detail:'Former players, honors and old footage get a dedicated standalone celebration.'},
  {id:'memorabilia',name:'Memorabilia Convention',icon:'🧢',type:'heritage',timeType:'DAY',location:'IN PARK',detail:'Collectors, traders and team-history displays fill the concourse.'},
  {id:'uniform-reveal',name:'Uniform Reveal',icon:'👕',type:'media',timeType:'EVENING',location:'IN PARK',detail:'A new or throwback look gets a full reveal with photos, merch and immediate discourse.'},
  {id:'radio-townhall',name:'Baseball Radio Town Hall',icon:'📻',type:'media',timeType:'EVENING',location:'AROUND PARK',detail:'Broadcasters, fans and analysts gather for a live off-day call-in show.'},
  {id:'fan-forum',name:'Fan Forum',icon:'🎙️',type:'media',timeType:'EVENING',location:'IN PARK',detail:'Fans, broadcasters and team representatives gather for a live Q&A.'},
  {id:'charity',name:'Community Charity Event',icon:'💙',type:'community',timeType:'DAY',location:'IN + AROUND PARK',detail:'The organization hosts fundraising, community groups and family activities.'},
  {id:'market',name:'Ballpark Market',icon:'🛍️',type:'community',timeType:'DAY',location:'AROUND PARK',detail:'Local makers, collectors and food stands turn the stadium plaza into a market.'},
  {id:'watch-party',name:'League Watch Party',icon:'📺',type:'entertainment',timeType:'EVENING',location:'IN PARK',detail:'The scoreboard carries another major league game while fans gather in the park.'},
  {id:'esports',name:'Ballpark Gaming Tournament',icon:'🎮',type:'entertainment',timeType:'EVENING',location:'IN PARK',detail:'The scoreboard and club spaces host a gaming tournament with fan teams and prizes.'},
  {id:'local-music',name:'Local Music Festival',icon:'🎸',type:'entertainment',timeType:'AFTERNOON',location:'AROUND PARK',detail:'Local acts rotate through stages around the stadium district throughout the day.'},
  {id:'fireworks',name:'Standalone Fireworks Show',icon:'🎆',type:'spectacle',timeType:'NIGHT',location:'IN PARK',detail:'The ballpark opens for food, music and a fireworks show with no game attached.'},
  {id:'family-day',name:'Family Day at the Park',icon:'👨‍👩‍👧',type:'family',timeType:'DAY',location:'IN PARK',detail:'Kids activities, mascot appearances and low-key family events fill the ballpark.'},
  {id:'mascot-fest',name:'Mascot Festival',icon:'🦊',type:'family',timeType:'DAY',location:'IN + AROUND PARK',detail:'Mascot races, photos and completely unnecessary mascot chaos take over the day.'},
  {id:'history-exhibit',name:'Baseball History Exhibit',icon:'📚',type:'heritage',timeType:'DAY',location:'IN PARK',detail:'Museum pieces, old scorecards and classic-game displays open around the concourse.'},
  {id:'champ-anniversary',name:'Championship Anniversary Gathering',icon:'🏆',type:'heritage',timeType:'EVENING',location:'IN PARK',detail:'A past title gets a dedicated anniversary event, alumni appearances and trophy display.'},
  {id:'season-ticket',name:'Season Ticket Member Event',icon:'🎟️',type:'community',timeType:'EVENING',location:'IN PARK',detail:'Members get park access, Q&A sessions, photos and special team-store access.'},
  {id:'job-fair',name:'Stadium District Job Fair',icon:'💼',type:'community',timeType:'DAY',location:'AROUND PARK',detail:'The club and nearby fictional businesses host a community job fair around the stadium.'},
  {id:'art-show',name:'Ballpark Art Show',icon:'🎨',type:'culture',timeType:'AFTERNOON',location:'IN + AROUND PARK',detail:'Baseball art, photography and fan-made pieces fill the concourse and plaza.'},
  {id:'fitness',name:'Run the Ballpark',icon:'🏃',type:'community',timeType:'MORNING',location:'IN + AROUND PARK',detail:'Fans run a course through the stadium district and finish near the field.'},
  {id:'pet-day',name:'Pets at the Park',icon:'🐶',type:'family',timeType:'DAY',location:'AROUND PARK',detail:'Pet-friendly booths, photos and team-bandana chaos take over the plaza.'},
  {id:'trivia',name:'League Trivia Social',icon:'🧠',type:'media',timeType:'EVENING',location:'AROUND PARK',detail:'Fans form teams for league-history trivia hosted by local media personalities.'},
  {id:'card-trade',name:'Baseball Card Trade Day',icon:'🃏',type:'heritage',timeType:'DAY',location:'IN PARK',detail:'Collectors trade cards, giveaways and memorabilia throughout the concourse.'},
  {id:'community-movie',name:'Neighborhood Movie Night',icon:'🍿',type:'community',timeType:'NIGHT',location:'AROUND PARK',detail:'The stadium district hosts an outdoor movie, food stands and fan meetups.'},
  {id:'custom',name:'Custom Off-Day Event',icon:'✨',type:'custom',timeType:'EVENING',location:'IN + AROUND PARK',detail:'Create your own league-world event for this calendar day.'},
];

export function getScheduledDayEvent(data={},slotIndex){
  const map=data.leagueExtras?.dayEventSchedule||{};
  const entry=map[String(Number(slotIndex))]||null;
  if(!entry)return null;
  const base=OFF_DAY_EVENT_BANK.find(x=>x.id===entry.eventId)||OFF_DAY_EVENT_BANK.find(x=>x.name===entry.name)||null;
  return {...base,...entry,slotIndex:Number(slotIndex)};
}

export function autoDayEventFor(data={},slotIndex){
  const pool=OFF_DAY_EVENT_BANK.filter(x=>x.id!=='custom');
  const idx=hash(`${data.activeSeasonName||'season'}-${slotIndex}-offday`)%pool.length;
  return {...pool[idx],slotIndex:Number(slotIndex),source:'auto'};
}

export function dayEventLabel(event){
  if(!event)return 'Open off-day';
  return `${event.icon||'✨'} ${event.name||'Off-Day Event'}`;
}
