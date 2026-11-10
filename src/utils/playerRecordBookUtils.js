export const PLAYER_RECORD_DEFS = [
  { id: 'hr', label: 'Home Runs', short: 'HR', icon: '💥' },
  { id: 'strikeouts', label: 'Strikeouts', short: 'K', icon: '☄️' },
  { id: 'hits', label: 'Hits', short: 'H', icon: '⚾' },
  { id: 'stolenBases', label: 'Stolen Bases', short: 'SB', icon: '⚡' },
  { id: 'saves', label: 'Saves', short: 'SV', icon: '🔒' },
  { id: 'wins', label: 'Pitching Wins', short: 'W', icon: '🏆' },
];

export function playerRecordRows(records = [], stat) {
  return records
    .filter((row) => row?.stat === stat)
    .sort((a, b) => Number(a.rank || 99) - Number(b.rank || 99) || Number(b.value || 0) - Number(a.value || 0))
    .slice(0, 3)
    .map((row, index) => ({ ...row, rank: Number(row.rank || index + 1) }));
}

export function normalizedPlayerRecordRows(records = []) {
  return PLAYER_RECORD_DEFS.flatMap((def) => playerRecordRows(records, def.id));
}

export function recordStatusLabel(row) {
  return String(row?.recordStatus || 'SET').toUpperCase();
}
