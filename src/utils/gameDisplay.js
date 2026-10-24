export function getDisplayGameState(currentGame, inningBanner) {
  if (currentGame.status === "Final") {
    const finalInning = Number(currentGame.inning || 9);
    return finalInning > 9 ? `F/${finalInning}` : "Final";
  }
  if (currentGame.status === "Not Started") {
    return "Warmup";
  }
  if (currentGame.inningStatus) {
    return currentGame.inningStatus;
  }
  if (inningBanner) {
    return inningBanner;
  }
  return `${currentGame.half} ${currentGame.inning}`;
}

export function renderInningCell(side, inningNumber, currentGame) {
 const value =
  (side === "away"
    ? currentGame.awayInnings[inningNumber - 1]
    : currentGame.homeInnings[inningNumber - 1]) ?? 0;

  const currentInning = Number(currentGame.inning || 1);

  if (currentGame.status === "Final") {
    if (inningNumber > currentInning) return "";
    return value === 0 ? "0" : String(value);
  }

  if (inningNumber < currentInning) return value === 0 ? "0" : String(value);
  if (inningNumber > currentInning) return "";
  if (side === "away") return value === 0 ? "0" : String(value);
  if (currentGame.half === "Bottom") return value === 0 ? "0" : String(value);

  return "";
}

export function getVisibleInnings(game) {
  const currentInning = Math.max(1, Number(game?.inning || 1));

  const lastVisibleInning = Math.max(12, currentInning);
  const firstVisibleInning = Math.max(1, lastVisibleInning - 11);

  return Array.from(
    { length: 12 },
    (_, index) => firstVisibleInning + index
  );
}

