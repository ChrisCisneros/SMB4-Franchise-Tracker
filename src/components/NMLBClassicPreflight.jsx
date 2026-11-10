import React from 'react';
import { buildNMLBClassicPreflight } from '../utils/nmlbClassicUtils';

export default function NMLBClassicPreflight({ data, teams, playoffPicture }) {
  const report = buildNMLBClassicPreflight(data, teams, playoffPicture);
  return <section className={`card v67-classic-preflight ${report.ready ? 'is-ready' : ''}`}>
    <div className="v67-preflight-head"><div><small>V6.7 · NMLB CLASSIC PREFLIGHT</small><h2>{report.ready ? 'THE LEAGUE IS OCTOBER-READY' : 'FINAL LOCK-IN CHECKLIST'}</h2><p>{report.ready ? 'Colors, calendar, finals, field and broadcast identity are ready for Game 1.' : `${report.remaining} item${report.remaining === 1 ? '' : 's'} still need attention before the first postseason pitch.`}</p></div><strong>{report.ready ? '✓ READY' : `${report.remaining} OPEN`}</strong></div>
    <div className="v67-preflight-grid">{report.checks.map((check) => <div key={check.id} className={check.ready ? 'ready' : 'open'}><span>{check.ready ? '✓' : '!'}</span><div><b>{check.label}</b><small>{check.detail}</small></div></div>)}</div>
  </section>;
}
