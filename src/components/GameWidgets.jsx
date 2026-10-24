import React from "react";

export function BaseDiamond({ bases, colors }) {
  const baseStyle = colors
    ? {
        "--base-main": colors.main,
        "--base-border": colors.border,
        "--base-text": colors.text,
      }
    : {};

  return (
    <div className="diamond-wrap" style={baseStyle}>
      <div className={`base second ${bases.second ? "occupied" : ""}`}></div>
      <div className={`base first ${bases.first ? "occupied" : ""}`}></div>
      <div className={`base third ${bases.third ? "occupied" : ""}`}></div>
      <div className="base home occupied home-plate"></div>
    </div>
  );
}

export function ChallengeBars({ count }) {
  const safe = Math.max(0, Math.min(2, Number(count) || 0));

  return (
    <div className="challenge-bars">
      <span className={`challenge-bar ${safe >= 1 ? "is-on" : "is-off"}`}></span>
      <span className={`challenge-bar ${safe >= 2 ? "is-on" : "is-off"}`}></span>
    </div>
  );
}



export function CountControls({ currentGame, updateCount, incrementPitchCount }) {
  const activePitchCount = currentGame.half === "Top" ? currentGame.homePitchCount : currentGame.awayPitchCount;

  return (
    <div className="single-line-counts">
      <div className="compact-count-card">
        <div className="count-card-title">Balls</div>
        <div className="stacked-counter">
          <button onClick={() => updateCount("balls", 1)}>+</button>
          <div className="counter-value">{currentGame.balls}</div>
          <button onClick={() => updateCount("balls", -1)}>-</button>
        </div>
      </div>

      

      <div className="compact-count-card strike-card">
        <div className="count-card-title">Strikes</div>
        <div className="strike-action-grid">
          <button onClick={() => updateCount("swinging", 1)}>Swinging</button>
          <button onClick={() => updateCount("called", 1)}>Called</button>
          <button onClick={() => updateCount("foul", 1)}>Foul</button>
          <button onClick={() => updateCount("strikes", -1)} className="danger-lite">- Strike</button>
        </div>
        <div className="counter-value big-counter">{currentGame.strikes}</div>
        <div className="count-card-subtitle">Pitch Count</div>
        <div className="pitch-count-row">
          <button onClick={() => incrementPitchCount(-1)}>-</button>
          <div className="counter-value pitch-counter">{activePitchCount}</div>
          <button onClick={() => incrementPitchCount(1)}>+</button>
          <button onClick={() => incrementPitchCount(5)}>+5</button>
        </div>
      </div>

      <div className="compact-count-card">
        <div className="count-card-title">Outs</div>
        <div className="stacked-counter">
          <button onClick={() => updateCount("outs", 1)}>+</button>
          <div className="counter-value">{currentGame.outs}</div>
          <button onClick={() => updateCount("outs", -1)}>-</button>
        </div>
      </div>
    </div>
  );
}
