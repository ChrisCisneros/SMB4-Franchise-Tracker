import React,{useMemo,useState} from 'react';

export default function NMLBAwardsShow({data,onClose}){
  const awards=useMemo(()=>{
    const winners=(data.leagueExtras?.awards||[]).filter(x=>x?.winner);
    return winners.map(x=>({...x,name:x.award,person:x.winner}));
  },[data]);
  const [index,setIndex]=useState(0); const [revealed,setRevealed]=useState(false);
  const item=awards[index];
  if(!item)return <div className="nmlb-awards-backdrop"><section className="nmlb-awards-stage"><button onClick={onClose}>×</button><small>NMLB AWARDS NIGHT</small><h1>The stage is ready.</h1><p>Finalize award winners in NMLB Center first. The race board remains the nominees/pre-show desk until then.</p></section></div>;
  const next=()=>{if(!revealed){setRevealed(true);return;} if(index<awards.length-1){setIndex(index+1);setRevealed(false);} else onClose?.();};
  return <div className="nmlb-awards-backdrop"><section className="nmlb-awards-stage"><button className="nmlb-awards-close" onClick={onClose}>×</button><div className="nmlb-awards-lights"/><small>NMLB AWARDS NIGHT · {data.activeSeasonName||'CURRENT SEASON'}</small><h1>{item.name}</h1><p>{item.category||item.scope||'LEAGUE HONOR'}</p><div className={`nmlb-awards-envelope ${revealed?'is-open':''}`}>{revealed?<><span>{item.icon||'🏆'}</span><strong>{item.person}</strong><b>{item.teamAbbr||'NMLB'}</b><em>{item.note||item.stat||'A season worthy of the stage.'}</em></>:<><span>✦</span><strong>AND THE HONOR GOES TO…</strong></>}</div><button className="nmlb-awards-next" onClick={next}>{revealed?(index===awards.length-1?'CLOSE THE SHOW':'NEXT AWARD'):'REVEAL'}</button><footer>{index+1} / {awards.length}</footer></section></div>;
}
