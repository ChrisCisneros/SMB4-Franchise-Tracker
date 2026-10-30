const clean=(s='')=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const hash=(s='')=>[...String(s)].reduce((n,c)=>((n*33)^c.charCodeAt(0))>>>0,5381);

const NIGHT_PALETTES={
  spectacle:['#8b5cf6','#ec4899','#22d3ee'], giveaway:['#2563eb','#7c3aed','#f59e0b'], rivalry:['#dc2626','#f97316','#facc15'],
  heritage:['#92400e','#d97706','#f5deb3'], community:['#0f766e','#2563eb','#22c55e'], family:['#2563eb','#f59e0b','#ec4899'], food:['#ea580c','#eab308','#dc2626']
};
const NIGHT_OVERRIDES={
  fireworks:['#172554','#7c3aed','#f43f5e'], 'opening-day':['#b91c1c','#f8fafc','#1d4ed8'], 'all-star':['#1d4ed8','#f8fafc','#dc2626'],
  dog:['#78350f','#f59e0b','#14b8a6'], hawaiian:['#0f766e','#f97316','#ec4899'], neon:['#111827','#22d3ee','#f0abfc'],
  '80s':['#4c1d95','#ec4899','#22d3ee'], '90s':['#1e3a8a','#facc15','#a855f7'], 'video-game':['#172554','#22c55e','#a78bfa'],
  'champ-anniversary':['#422006','#f59e0b','#fde68a'], 'ring-night':['#3f2a00','#fbbf24','#e2e8f0'], 'mini-trophy':['#422006','#d97706','#fde68a'],
  'city-night':['#0f172a','#2563eb','#f97316'], 'first-responders':['#7f1d1d','#1d4ed8','#f8fafc'], military:['#14532d','#1e3a8a','#f8fafc'],
  healthcare:['#0f766e','#38bdf8','#f8fafc'], charity:['#1e3a8a','#ec4899','#f8fafc'], 'season-finale':['#111827','#f59e0b','#ef4444']
};

function nightPalette(theme={}){
  const id=String(theme?.promo?.id||theme?.id||'regular').replace(/^night-/,'');
  const base=NIGHT_OVERRIDES[id]||NIGHT_PALETTES[theme?.subtype]||['#1d4ed8','#7c3aed','#ec4899'];
  if(NIGHT_OVERRIDES[id])return base;
  // Rotate generic category colors by ID so two community/giveaway nights still do not look identical.
  const shift=(hash(id)%29)-14;
  const bump=(hex,amount)=>{
    const n=parseInt(hex.slice(1),16);
    const r=Math.max(0,Math.min(255,(n>>16)+amount));
    const g=Math.max(0,Math.min(255,((n>>8)&255)+Math.round(amount*.65)));
    const b=Math.max(0,Math.min(255,(n&255)-Math.round(amount*.35)));
    return `#${((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}`;
  };
  return [bump(base[0],shift),bump(base[1],-Math.round(shift*.55)),base[2]];
}


export function resolveBroadcastTheme({data={},teams=[],currentGame={},rivalry=null,promo=null,ceremonies=[],gameNumber=0}={}){
  const away=teams.find(t=>t.id===currentGame?.awayTeamId)||null;
  const home=teams.find(t=>t.id===currentGame?.homeTeamId)||null;
  const activeCeremony=(ceremonies||[]).find(c=>c&&c.status!=='completed')||(ceremonies||[])[0]||null;
  const playoff=currentGame?.gameType==='playoff';
  const championship=playoff&&['finals','worldSeries'].includes(currentGame?.playoffSeriesId);
  const interleague=Boolean(away&&home&&away.league&&home.league&&away.league!==home.league);
  const rivalryMode=Boolean(rivalry&&((rivalry.heat||0)>=35||(rivalry.games||0)>=2));
  const n=Number(gameNumber||currentGame?.seasonGameNumber||0);

  // Precedence is intentional: ceremonies > special nights > postseason > interleague > rivalry > normal.
  if(activeCeremony){
    return {id:`ceremony-${clean(activeCeremony.type||'special')}`,kind:'ceremony',priority:100,label:'CEREMONY BROADCAST',detail:activeCeremony.title||'League ceremony',icon:'✨',ceremony:activeCeremony};
  }
  if(promo){
    const id=clean(promo.id||promo.name||promo.type||'special-night');
    const label=n===1?'OPENING DAY':n===20?'ALL-STAR BREAK':String(promo.name||'Special Night').toUpperCase();
    return {id:`night-${id}`,kind:'special-night',subtype:clean(promo.type||'event'),priority:90,label,detail:promo.giveaway||promo.name||'Special ballpark presentation',icon:promo.icon||'🎟️',promo};
  }
  if(n===1)return {id:'opening',kind:'season-event',priority:85,label:'OPENING DAY BROADCAST',detail:'A new season begins',icon:'⚾'};
  if(n===20)return {id:'allstar',kind:'season-event',priority:85,label:'ALL-STAR BREAK',detail:'Midseason celebration',icon:'⭐'};
  if(championship)return {id:'championship',kind:'postseason',priority:80,label:'CHAMPIONSHIP BROADCAST',detail:'The final stage',icon:'🏆'};
  if(playoff)return {id:'postseason',kind:'postseason',priority:75,label:'POSTSEASON BROADCAST',detail:'October presentation',icon:'🔥'};
  if(interleague)return {id:'interleague',kind:'interleague',priority:65,label:'INTERLEAGUE SHOWCASE',detail:`${away.league} vs ${home.league}`,icon:'⚔️',awayLeague:away.league,homeLeague:home.league};
  if(rivalryMode)return {id:'rivalry',kind:'rivalry',priority:55,label:'RIVALRY BROADCAST',detail:`${Math.round(rivalry?.heat||0)} heat · ${rivalry?.games||0} meetings`,icon:'🔥'};
  return {id:'regular',kind:'regular',priority:10,label:'REGULAR SEASON',detail:data.activeSeasonName||'League broadcast',icon:'⚾'};
}

export function broadcastThemeClasses(theme={}){
  const pattern=hash(theme?.promo?.id||theme?.id||theme?.kind||'regular')%6;
  return [`dashboard-theme-${theme.kind||'regular'}`,`dashboard-theme-${theme.id||'regular'}`,theme.subtype?`dashboard-theme-type-${theme.subtype}`:'',`dashboard-theme-pattern-${pattern}`].filter(Boolean).join(' ');
}

export function broadcastThemeStyle(theme={}){
  const [a,b,c]=nightPalette(theme);
  return {
    '--theme-night-a':a,
    '--theme-night-b':b,
    '--theme-night-c':c,
    '--theme-panel-rgb':'7 13 25',
  };
}

