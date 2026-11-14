import React, { useMemo, useState } from 'react';
import { getTeamColorsByAbbr } from '../config/teamColors';

const normalize = value => String(value || '').trim().toLowerCase();

function hardwareFor(item) {
  const text = normalize(`${item?.award || ''} ${item?.title || ''}`);
  if (/mvp|award|cy young|rookie|gold glove|silver/.test(text)) return { icon: '🏆', type: 'TROPHY' };
  if (/world series|championship|ring|title/.test(text)) return { icon: '💍', type: 'RING' };
  if (/crown/.test(text)) return { icon: '👑', type: 'CROWN' };
  return { icon: '⚾', type: 'MILESTONE BALL' };
}

export default function PlayerHardwareVault({ data = {}, teams = [] }) {
  const [selectedId, setSelectedId] = useState('');
  const extras = data.leagueExtras || {};
  const rows = useMemo(() => {
    const byPlayer = new Map();
    const add = (name, item, teamAbbr = '') => {
      if (!name) return;
      const key = normalize(name);
      if (!byPlayer.has(key)) byPlayer.set(key, { id: key, name, teamAbbr, hardware: [] });
      byPlayer.get(key).hardware.push({ ...item, ...hardwareFor(item) });
    };
    (extras.awards || []).filter(x => x?.winner).forEach(x => add(x.winner, x, x.teamAbbr));
    (extras.achievements || []).filter(x => x?.playerName).forEach(x => add(x.playerName, x, x.teamAbbr));
    (data.players || []).filter(x => x?.name && (Number(x.careerHR || 0) >= 100 || Number(x.careerHits || 0) >= 200)).forEach(x => add(x.name, { title: Number(x.careerHR || 0) >= 100 ? `${x.careerHR} Career Home Runs` : `${x.careerHits} Career Hits`, season: data.activeSeasonName, generated: true }, teams.find(t => t.id === x.teamId)?.abbr));
    return [...byPlayer.values()].sort((a, b) => b.hardware.length - a.hardware.length || a.name.localeCompare(b.name));
  }, [data, extras.awards, extras.achievements, teams]);
  const selected = rows.find(row => row.id === selectedId) || rows[0];
  return <section className="card player-hardware-vault">
    <div className="player-vault-header"><div><div className="v4-kicker">PLAYER HARDWARE & CARD VAULT</div><h2>Players Who Own The Moment</h2><p>A starting framework for trophies, rings, crowns, milestone baseballs, and future collectible cards. Add players as the NMLB universe grows.</p></div><div className="player-vault-stats"><span><b>{rows.length}</b> players</span><span><b>{rows.reduce((sum, row) => sum + row.hardware.length, 0)}</b> pieces</span><span><b>1/1</b> card-ready</span></div></div>
    <div className="player-vault-layout"><div className="player-vault-list">{rows.length ? rows.map(row => <button type="button" key={row.id} className={selected?.id === row.id ? 'active' : ''} onClick={() => setSelectedId(row.id)}><span className="player-vault-avatar">{row.name.slice(0, 1).toUpperCase()}</span><span><strong>{row.name}</strong><small>{row.teamAbbr || 'NMLB'} · {row.hardware.length} piece{row.hardware.length === 1 ? '' : 's'}</small></span><b>→</b></button>) : <div className="player-vault-empty">No player hardware yet. Awards and milestones entered through the League Office will automatically populate this room.</div>}</div>{selected && <div className="player-locker" style={{ '--locker-main': getTeamColorsByAbbr(selected.teamAbbr).main, '--locker-border': getTeamColorsByAbbr(selected.teamAbbr).border }}><div className="player-locker-sign"><small>{selected.teamAbbr || 'NMLB'} · PLAYER LOCKER</small><h3>{selected.name}</h3><span>{selected.hardware.length} pieces of hardware</span></div><div className="player-locker-shelves">{selected.hardware.map((item, index) => <article key={`${item.title || item.award}-${index}`} className="player-hardware-piece"><div className="hardware-object">{item.icon}</div><strong>{item.award || item.title}</strong><small>{item.type} · {item.season || data.activeSeasonName || 'NMLB archive'}</small>{item.generated && <em>FOUNDATION CARD</em>}</article>)}</div><div className="player-card-skeleton"><span>COLLECTIBLE CARD SKELETON</span><strong>{selected.name}</strong><small>Future card art · rarity · serial number · pull history</small><b>1/1 READY TO DESIGN</b></div></div>}</div>
  </section>;
}
