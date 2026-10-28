const MILESTONE_RE=/(career|milestone|home run|homer|\bhr\b|cycle|hit|strikeout|stolen base|save|win|no-hitter|perfect game)/i;

export const SEASON_AWARD_TYPES=[
  {id:'diamond-crown',name:'Diamond Crown',category:'Most Valuable Player',icon:'👑'},
  {id:'iron-arm',name:'Iron Arm Award',category:'Best ERA',icon:'🛡️'},
  {id:'long-ball-crown',name:'Long Ball Crown',category:'Most Home Runs',icon:'💥'},
  {id:'ace-year',name:'Ace of the Year',category:'Most Pitching Wins',icon:'♠️'},
  {id:'silver-cleats',name:'Silver Cleats Award',category:'Most Stolen Bases',icon:'⚡'},
  {id:'batting-laureate',name:'Batting Laureate',category:'Best Batting Average',icon:'🎯'},
  {id:'runmaker',name:'Runmaker Award',category:'Most RBI',icon:'🔥'},
  {id:'fireball',name:'Fireball Award',category:'Most Strikeouts',icon:'☄️'},
  {id:'final-out',name:'Final Out Award',category:'Best Closer / Most Saves',icon:'🔒'},
  {id:'golden-web',name:'Golden Web',category:'Best Defensive Player',icon:'🕸️'},
  {id:'rising-star',name:'Rising Star Award',category:'Best Rookie / Breakout',icon:'🌟'},
  {id:'mound-king',name:'Mound King',category:'Best Overall Pitcher',icon:'⛰️'},
  {id:'october-flame',name:'October Flame',category:'Best Postseason Performance',icon:'🔥'},
  {id:'peoples-player',name:"People's Player",category:'Fan Favorite',icon:'🫶'},
  {id:'second-wind',name:'Second Wind Award',category:'Comeback Player',icon:'🌬️'},
];

export function buildSpecialAchievements(data={},teams=[]){
  const extras=data.leagueExtras||{};
  const teamByAbbr=new Map((teams||[]).map(t=>[String(t.abbr||'').toUpperCase(),t]));
  const manual=(extras.achievements||[]).map(x=>({
    id:x.id,
    source:'achievement',
    playerName:x.playerName||x.holder||'',
    teamAbbr:String(x.teamAbbr||'').toUpperCase(),
    title:x.title||'Achievement',
    note:x.note||'',
    season:x.season||data.activeSeasonName||'Season',
    createdAt:x.createdAt||'',
    icon:x.icon||'⭐',
  }));
  const history=(extras.manualEvents||[]).filter(x=>!x.linkedAchievementId&&MILESTONE_RE.test(`${x.title||''} ${x.note||''}`)).map(x=>({
    id:`history-${x.id}`,
    source:'history',
    playerName:x.playerName||extractPlayerName(x.title,x.note),
    teamAbbr:String(x.teamAbbr||'').toUpperCase(),
    title:x.title||'Player Milestone',
    note:x.note||'',
    season:x.date||data.activeSeasonName||'Season',
    createdAt:x.createdAt||'',
    icon:'🏅',
  }));
  return [...manual,...history].map(x=>({...x,team:teamByAbbr.get(x.teamAbbr)||null})).sort((a,b)=>(Date.parse(b.createdAt||'')||0)-(Date.parse(a.createdAt||'')||0));
}

function extractPlayerName(title='',note=''){
  const text=`${title} ${note}`;
  const m=text.match(/^([A-Z][A-Za-z'.-]+(?:\s+[A-Z][A-Za-z'.-]+){1,3})\s+(?:hit|recorded|reached|earned)/);
  if(m?.[1])return m[1];
  const milestone=String(title||'').match(/^(.+?)\s+(?:\d+(?:st|nd|rd|th)?\s+)?(?:career\s+)?(?:home run|homer|hr|hit|win|strikeout|stolen base|save)/i);
  return milestone?.[1]?.trim()||'';
}

export function achievementsForTeam(data={},teams=[],teamId=''){
  const team=(teams||[]).find(t=>t.id===teamId);
  if(!team)return [];
  return buildSpecialAchievements(data,teams).filter(x=>x.teamAbbr===team.abbr);
}

export function awardsForTeam(data={},teamAbbr=''){
  return (data.leagueExtras?.awards||[]).filter(x=>x&&x.winner&&String(x.teamAbbr||'').toUpperCase()===String(teamAbbr||'').toUpperCase());
}
