import React from 'react';

export default function NMLBCommissionersTrophy({champion=null,season=''}){
  return <div className={`nmlb64-trophy ${champion?'is-awarded':''}`} style={champion?{'--champ-main':champion.colors?.main||champion.main||'#7c3aed','--champ-alt':champion.colors?.alt||champion.alt||'#f7d774'}:{}}>
    <div className="nmlb64-trophy-halo"/>
    <svg viewBox="0 0 240 300" role="img" aria-label="Nicky's Commissioner's Trophy">
      <defs>
        <linearGradient id="nmlbCupGold" x1="0" x2="1"><stop offset="0" stopColor="#8c6a18"/><stop offset=".32" stopColor="#fff2a3"/><stop offset=".58" stopColor="#c99a2d"/><stop offset="1" stopColor="#fff0a0"/></linearGradient>
        <radialGradient id="nmlbBall" cx="45%" cy="35%"><stop offset="0" stopColor="#fffef7"/><stop offset="1" stopColor="#cbbf9f"/></radialGradient>
      </defs>
      <ellipse cx="120" cy="267" rx="70" ry="16" fill="#050208" opacity=".8"/>
      <path d="M55 48h130c-4 75-24 118-65 137C79 166 59 123 55 48Z" fill="url(#nmlbCupGold)" stroke="#fff2a3" strokeWidth="4"/>
      <path d="M55 62C22 67 27 124 70 132" fill="none" stroke="url(#nmlbCupGold)" strokeWidth="13"/>
      <path d="M185 62c33 5 28 62-15 70" fill="none" stroke="url(#nmlbCupGold)" strokeWidth="13"/>
      <circle cx="120" cy="96" r="39" fill="url(#nmlbBall)" stroke="#1f0554" strokeWidth="5"/>
      <path d="M97 67c12 10 18 48 2 61M143 67c-12 10-18 48-2 61" fill="none" stroke="#b3262d" strokeWidth="3" strokeDasharray="4 5"/>
      <text x="120" y="103" textAnchor="middle" fontSize="20" fontWeight="900" fill="#1f0554">NMLB</text>
      <path d="M108 181h24v44h-24z" fill="url(#nmlbCupGold)"/>
      <path d="M79 220h82l20 39H59z" fill="#110520" stroke="url(#nmlbCupGold)" strokeWidth="5"/>
      <text x="120" y="241" textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff">COMMISSIONER'S</text>
      <text x="120" y="253" textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff">TROPHY</text>
    </svg>
    <small>NICKY'S COMMISSIONER'S TROPHY</small>
    {champion?<><strong>{champion.abbr} · NMLB WORLD CHAMPIONS</strong><span>{season}</span></>:<><strong>ONE TROPHY. ONE CLUB.</strong><span>THE ROAD ENDS HERE.</span></>}
  </div>;
}
