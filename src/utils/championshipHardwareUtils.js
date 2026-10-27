import { getTeamColorsByAbbr } from '../config/teamColors';
import { makeSafePlayoffBracket } from './playoffUtils';

const safeArr=x=>Array.isArray(x)?x:[];
const seasonNumber=s=>{
  const n=Number(s?.seasonNumber||s?.number||0); if(n>0)return n;
  const m=String(s?.name||'').match(/season\s*(\d+)/i); return m?Number(m[1]):0;
};
const isNearWhite=(hex='')=>{
  const h=String(hex).replace('#',''); if(h.length!==6)return false;
  const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
  return Number.isFinite(r)&&r>225&&g>225&&b>225;
};
export function hardwareTheme(abbr){
  const c=getTeamColorsByAbbr(abbr);
  let main=c.main,accent=c.alt,border=c.border,text=c.text;
  if(isNearWhite(main)){
    const candidates=[c.alt,c.border].filter(Boolean).filter(x=>!isNearWhite(x));
    main=candidates[0]||'#111827';
    accent=candidates[1]||'#f4f4f5';
    border=c.border&&!isNearWhite(c.border)?c.border:accent;
    text='#ffffff';
  }
  if(String(abbr||'').toUpperCase()==='NYY'){main='#132448';accent='#C4CED3';border='#ffffff';text='#ffffff';}
  return {main,accent,border,text};
}
export function buildChampionshipHardware(data={},teams=[]){
  const history=[...safeArr(data.seasonHistory)].sort((a,b)=>seasonNumber(a)-seasonNumber(b));
  const latestNum=Math.max(0,...history.map(seasonNumber));
  const completions=safeArr(data.leagueExtras?.ceremonyCompletions);
  const completeKey=(seasonName,teamAbbr,type)=>completions.some(c=>String(c.originSeasonName||c.seasonName||'')===String(seasonName||'')&&String(c.teamAbbr||'').toUpperCase()===String(teamAbbr||'').toUpperCase()&&safeArr(c.revealed).includes(type));
  return history.map((season,index)=>{
    const bracket=makeSafePlayoffBracket(season.playoffBracket);
    const seasonTeams=season.teams||[];
    const team=id=>seasonTeams.find(t=>t.id===id)||teams.find(t=>t.id===id)||null;
    const al=team(bracket.al?.lc?.winnerTeamId),nl=team(bracket.nl?.lc?.winnerTeamId),champ=team(season.championTeamId||bracket.finals?.winnerTeamId);
    const name=season.name||`Season ${seasonNumber(season)||index+1}`;
    const newest=seasonNumber(season)===latestNum;
    const entry={id:season.id||`season-${index}`,name,number:seasonNumber(season)||index+1,newest,al,nl,champ,hardware:[]};
    [[al,'AMERICAN LEAGUE'],[nl,'NATIONAL LEAGUE']].forEach(([t,leagueLabel])=>{if(!t)return;entry.hardware.push({id:`${entry.id}-${t.id}-banner`,type:'banner',team:t,seasonName:name,leagueLabel,theme:hardwareTheme(t.abbr),revealed:!newest||completeKey(name,t.abbr,'banner')});});
    if(champ){
      entry.hardware.push({id:`${entry.id}-${champ.id}-trophy`,type:'trophy',team:champ,seasonName:name,leagueLabel:'WORLD SERIES',theme:hardwareTheme(champ.abbr),revealed:!newest||completeKey(name,champ.abbr,'trophy')});
      entry.hardware.push({id:`${entry.id}-${champ.id}-rings`,type:'rings',team:champ,seasonName:name,leagueLabel:'WORLD SERIES',theme:hardwareTheme(champ.abbr),revealed:!newest||completeKey(name,champ.abbr,'rings')});
    }
    return entry;
  });
}
export function ceremonyRevealTypes(c){
  if(c?.type==='championship-opening')return ['banner','trophy','rings'];
  if(c?.type==='banner')return ['banner'];
  if(c?.type==='rings')return ['rings'];
  if(c?.type==='trophy')return ['trophy'];
  return [];
}
