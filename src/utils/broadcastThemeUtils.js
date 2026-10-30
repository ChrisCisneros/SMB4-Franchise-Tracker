const clean=(s='')=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

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
  return [`dashboard-theme-${theme.kind||'regular'}`,`dashboard-theme-${theme.id||'regular'}`,theme.subtype?`dashboard-theme-type-${theme.subtype}`:''].filter(Boolean).join(' ');
}
