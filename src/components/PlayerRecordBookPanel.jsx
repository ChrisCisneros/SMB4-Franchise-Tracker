import React, { useMemo, useState } from 'react';
import { PLAYER_RECORD_DEFS, normalizedPlayerRecordRows, playerRecordRows, recordStatusLabel } from '../utils/playerRecordBookUtils';

const blankRow = () => ({ holder: '', value: '', teamAbbr: '', season: '', recordStatus: 'SET' });

function recordSeason(row) {
  return [recordStatusLabel(row), row?.season].filter(Boolean).join(' · ');
}

function RecordCard({ def, rows }) {
  const leader = rows[0];
  return <article className="v66-player-record-card">
    <div className="v66-player-record-card-head"><span>{def.icon}</span><div><small>ALL-TIME {def.label.toUpperCase()}</small><h3>{leader?.holder || 'Record not entered'}</h3></div></div>
    <strong className="v66-player-record-leader-value">{leader ? Number(leader.value || 0).toLocaleString() : '—'}</strong>
    <div className="v66-player-record-meta">{leader ? <><b>{recordSeason(leader)}</b><span>{leader.teamAbbr || 'LEAGUE'}</span></> : <span>Add the first record-book entry</span>}</div>
    <div className="v66-player-record-podium">
      {[1, 2].map((rank) => { const row = rows[rank]; return <div key={rank}><span>{rank + 1}</span>{row ? <><strong>{row.holder}</strong><b>{Number(row.value || 0).toLocaleString()}</b><small>{recordSeason(row)}{row.teamAbbr ? ` · ${row.teamAbbr}` : ''}</small></> : <em>Open slot</em>}</div>; })}
    </div>
  </article>;
}

export default function PlayerRecordBookPanel({ records = [], controlsUnlocked = false, saveExtras, readOnly = false }) {
  const [selectedStat, setSelectedStat] = useState('hr');
  const [draftRows, setDraftRows] = useState(() => [0, 1, 2].map((index) => playerRecordRows(records, 'hr')[index] ? { ...blankRow(), ...playerRecordRows(records, 'hr')[index] } : blankRow()));
  const selectedDef = PLAYER_RECORD_DEFS.find((def) => def.id === selectedStat) || PLAYER_RECORD_DEFS[0];
  const boards = useMemo(() => PLAYER_RECORD_DEFS.map((def) => ({ def, rows: playerRecordRows(records, def.id) })), [records]);

  const loadCategory = (stat) => {
    setSelectedStat(stat);
    const rows = playerRecordRows(records, stat);
    setDraftRows([0, 1, 2].map((index) => rows[index] ? { ...blankRow(), ...rows[index] } : blankRow()));
  };

  const saveCategory = () => {
    if (!controlsUnlocked || !saveExtras) return;
    const otherRecords = records.filter((row) => row?.stat !== selectedStat || !PLAYER_RECORD_DEFS.some((def) => def.id === row.stat));
    const nextRows = draftRows.filter((row) => String(row.holder || '').trim() && Number(row.value) > 0).map((row, index) => ({
      ...row,
      id: row.id || crypto.randomUUID(),
      stat: selectedStat,
      label: selectedDef.label,
      rank: index + 1,
      holder: String(row.holder).trim(),
      value: Number(row.value),
      teamAbbr: String(row.teamAbbr || '').trim().toUpperCase(),
      season: String(row.season || '').trim(),
      recordStatus: recordStatusLabel(row),
      updatedAt: new Date().toISOString(),
    }));
    saveExtras({ majorPlayerRecords: [...otherRecords, ...nextRows] });
  };

  const updateDraft = (index, key, value) => setDraftRows((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));

  return <section className={`v66-player-record-book ${readOnly ? 'read-only' : ''}`}>
    <div className="v66-player-record-book-head"><div><small>THE IMMORTALS · V6.6 RECORD BOOK</small><h3>All-Time Player Records</h3><p>Ranked leaders, record status and the season each mark was set, broken or expanded.</p></div><strong>TOP 3</strong></div>
    <div className="v66-player-record-board">{boards.map(({ def, rows }) => <RecordCard key={def.id} def={def} rows={rows} />)}</div>
    {!readOnly && controlsUnlocked && <div className="v66-player-record-editor">
      <div className="v66-player-record-editor-head"><div><small>RECORD BOOK INPUT</small><h4>Update a category</h4></div><select value={selectedStat} onChange={(event) => loadCategory(event.target.value)}>{PLAYER_RECORD_DEFS.map((def) => <option key={def.id} value={def.id}>{def.label}</option>)}</select></div>
      <div className="v66-player-record-input-grid"><div className="v66-record-input-labels"><span>Rank</span><span>Player</span><span>Value</span><span>Team</span><span>Season</span><span>Status</span></div>{draftRows.map((row, index) => <div className="v66-record-input-row" key={index}><b>#{index + 1}</b><input value={row.holder} onChange={(event) => updateDraft(index, 'holder', event.target.value)} placeholder={index === 0 ? 'Current leader' : 'Second / third'} /><input type="number" min="1" value={row.value} onChange={(event) => updateDraft(index, 'value', event.target.value)} placeholder="Total" /><input value={row.teamAbbr} onChange={(event) => updateDraft(index, 'teamAbbr', event.target.value)} placeholder="Team" /><input value={row.season} onChange={(event) => updateDraft(index, 'season', event.target.value)} placeholder="Season" /><select value={row.recordStatus} onChange={(event) => updateDraft(index, 'recordStatus', event.target.value)}><option>SET</option><option>EXPANDED</option><option>BROKEN</option></select></div>)}</div>
      <button type="button" onClick={saveCategory}>Save {selectedDef.label} Top 3</button>
    </div>}
  </section>;
}
