import React, { useState } from "react";
import { teamOptionLabel } from "../utils/standingsUtils";
import { renderInningCell } from "../utils/gameDisplay";
import LiveField from "../components/LiveField";

export default function LivePage({ ctx }) {
  const [showSetup, setShowSetup] = useState(true);
  const [showMoments, setShowMoments] = useState(false);
  const [showFieldMode, setShowFieldMode] = useState(false);
  const { adjustLiveInning, awayColors, awayTeam, battingBaseColors, bigMomentBanner, changeBoxStat, changeScore, clearFieldBall, currentGame, cycleLiveLook, dropFieldBall, finalizeGame, homeColors, homeTeam, isPlayoffLiveGame, isWorldSeriesGame, liveAwayLookLabel, liveHomeLookLabel, liveLeaderClass, liveTeamRecordLabel, moveFieldRunner, numberedTeams, playoffBroadcastVars, playoffSeriesDropdownLabel, playoffSeriesOptions, resetBallStrikeCount, resetCurrentMatch, resetLiveCountAndBases, scoreFlashSide, setLiveHalf, setMidEndInningStatus, toggleOutDot, triggerLiveMoment, undoLastPlay, updateBases, updateCount, updateCurrentGame, updateFieldBallResult } = ctx;

  return (
    <div className="live-ipad-page">
        <div className="card live-ipad-card">
          <div className="live-ipad-header-row">
            <div>
              <h2>Live Scoring</h2>
              <p className="muted">Big-button SMB controller for live games and postseason.</p>
            </div>
    
            <div className="inline-buttons">
      <button className="danger-lite" onClick={resetCurrentMatch}>
        Reset Full Game
      </button>
    </div>
          </div>

          <div className="live-operator-bar">
            <div className="live-operator-matchup">
              <span className={`operator-status-dot status-${String(currentGame.status || "not-started").toLowerCase().replace(/\s+/g, "-")}`}></span>
              <strong>{awayTeam?.abbr || "AWY"} {currentGame.awayScore} – {currentGame.homeScore} {homeTeam?.abbr || "HME"}</strong>
              <span>{currentGame.inningStatus || `${currentGame.half} ${currentGame.inning}`}</span>
              <span>{currentGame.balls}-{currentGame.strikes} · {currentGame.outs} out{currentGame.outs === 1 ? "" : "s"}</span>
            </div>
            <div className="live-operator-actions">
              <button onClick={undoLastPlay}>↶ Undo</button>
              <button onClick={resetBallStrikeCount}>Reset Count</button>
              <button onClick={() => setShowSetup((value) => !value)}>{showSetup ? "Hide Setup" : "Game Setup"}</button>
              <button className={showFieldMode ? "field-mode-toggle active" : "field-mode-toggle"} onClick={() => setShowFieldMode((value) => !value)}>{showFieldMode ? "Hide Field" : "Field Mode"}</button>
              <button className="live-finalize-shortcut" onClick={finalizeGame}>Finalize</button>
            </div>
          </div>

          <div className="big-moment-slot">
      {bigMomentBanner && (
        <div className={`big-moment-banner ${scoreFlashSide ? `big-moment-${scoreFlashSide}` : ""}`}>
          {bigMomentBanner}
        </div>
      )}
    </div>
    
          {showSetup && (
          <div className="live-top-setup live-top-setup-operator">
            <div>
              <label>Away Team</label>
              <select
                value={currentGame.awayTeamId}
                onChange={(e) => updateCurrentGame("awayTeamId", e.target.value)}
              >
                <option value="">Select away team</option>
                {numberedTeams.map((team) => (
                  <option value={team.id} key={team.id}>
                    {`${team.listNumber}. ${teamOptionLabel(team)}`}
                  </option>
                ))}
              </select>
            </div>
    
            <div>
              <label>Home Team</label>
              <select
                value={currentGame.homeTeamId}
                onChange={(e) => updateCurrentGame("homeTeamId", e.target.value)}
              >
                <option value="">Select home team</option>
                {numberedTeams.map((team) => (
                  <option value={team.id} key={team.id}>
                    {`${team.listNumber}. ${teamOptionLabel(team)}`}
                  </option>
                ))}
              </select>
            </div>
    
            <div>
              <label>Date</label>
              <input
                type="date"
                value={currentGame.date}
                onChange={(e) => updateCurrentGame("date", e.target.value)}
              />
            </div>
    
            <div>
              <label>Status</label>
              <select
                value={currentGame.status}
                onChange={(e) => updateCurrentGame("status", e.target.value)}
              >
                <option>Not Started</option>
                <option>Live</option>
                <option>Mid-Inning</option>
                <option>Final</option>
                <option>Warmup</option>
                <option>Delay</option>
              </select>
            </div>
    
            <div>
              <label>Game Type</label>
              <select
                value={currentGame.gameType || "regular"}
                onChange={(e) => {
                  updateCurrentGame("gameType", e.target.value);
                  if (e.target.value === "regular") updateCurrentGame("playoffSeriesId", "");
                }}
              >
                <option value="regular">Regular Season</option>
                <option value="playoff">Playoff</option>
              </select>
            </div>
    
            <div>
              <label>Playoff Series</label>
              <select
                value={currentGame.playoffSeriesId || ""}
                disabled={(currentGame.gameType || "regular") !== "playoff"}
                onChange={(e) => updateCurrentGame("playoffSeriesId", e.target.value)}
              >
                <option value="">Select series</option>
                {playoffSeriesOptions.map((series) => (
                  <option key={series.id} value={series.id}>
                    {playoffSeriesDropdownLabel(series)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          )}
    
          <div
      className={`ipad-live-scorebug ${liveLeaderClass} ${scoreFlashSide ? `scorebug-flash-${scoreFlashSide}` : ""} ${isPlayoffLiveGame ? "playoff-broadcast-bg" : ""}`}
      style={playoffBroadcastVars}
    >
            <div className="ipad-score-team">
              <div
                className="ipad-team-abbr"
                style={{
                  background: awayColors.gradient
                    ? `linear-gradient(135deg, ${awayColors.main}, ${awayColors.alt})`
                    : awayColors.main,
                  borderColor: awayColors.border,
                  color: awayColors.text,
                }}
              >
                <span className="ipad-team-abbr-text">
      {awayTeam ? awayTeam.abbr : "AWY"}
    </span>
    <small className="ipad-team-record">
      {liveTeamRecordLabel("away", awayTeam)}
    </small>
              </div>
              <button className="ipad-look-switch-button" onClick={() => cycleLiveLook("away")}>
      {liveAwayLookLabel}
    </button>
              <div className="ipad-score-buttons">
                <button onClick={() => changeScore("away", -1)}>-</button>
                <span>{currentGame.awayScore}</span>
                <button onClick={() => changeScore("away", 1)}>+</button>
              </div>
              <div className="ipad-box-stat-grid">
      <div>
        <span>H</span>
        <div>
          <button onClick={() => changeBoxStat("away", "Hits", -1)}>-</button>
          <strong>{currentGame.awayHits}</strong>
          <button onClick={() => changeBoxStat("away", "Hits", 1)}>+</button>
        </div>
      </div>
    
      <div>
        <span>E</span>
        <div>
          <button onClick={() => changeBoxStat("away", "Errors", -1)}>-</button>
          <strong>{currentGame.awayErrors}</strong>
          <button onClick={() => changeBoxStat("away", "Errors", 1)}>+</button>
        </div>
      </div>
    </div>
            </div>
    
            <div className="ipad-center-status">
            {isWorldSeriesGame(currentGame) && (
      <div className="world-series-trophy">🏆</div>
    )}
              <div className="ipad-big-score">
                <span>{currentGame.awayScore}</span>
                <span className="ipad-score-dash">-</span>
                <span>{currentGame.homeScore}</span>
              </div>
    
              <div className="ipad-inning-display">
      {["Live", "Warmup", "Delay", "Final"].includes(currentGame.status)
        ? `${currentGame.status} · ${currentGame.inningStatus || `${currentGame.half} ${currentGame.inning}`}`
        : currentGame.inningStatus || `${currentGame.half} ${currentGame.inning}`}
    </div>
    
              <div className="ipad-count-line">
                <strong>{currentGame.balls}</strong>
                <span>B</span>
                <span className="ipad-count-separator">-</span>
                <strong>{currentGame.strikes}</strong>
                <span>S</span>
              </div>
    
              <div className="ipad-out-dots">
                {[1, 2].map((outNumber) => (
                  <button
                    key={outNumber}
                    type="button"
                    className={currentGame.outs >= outNumber ? "out-dot active" : "out-dot"}
                    onClick={() => toggleOutDot(outNumber)}
                    aria-label={`${outNumber} out`}
                  />
                ))}
              </div>
    
              <button className="ipad-third-out-button" onClick={() => updateCount("outs", 1)}>
                + Out / Next Half
              </button>
            </div>
    
            <div className="ipad-score-team">
              <div
                className="ipad-team-abbr"
                style={{
                  background: homeColors.gradient
                    ? `linear-gradient(135deg, ${homeColors.main}, ${homeColors.alt})`
                    : homeColors.main,
                  borderColor: homeColors.border,
                  color: homeColors.text,
                }}
              >
                <span className="ipad-team-abbr-text">
      {homeTeam ? homeTeam.abbr : "HME"}
    </span>
    <small className="ipad-team-record">
      {liveTeamRecordLabel("home", homeTeam)}
    </small>
              </div>
              <button className="ipad-look-switch-button" onClick={() => cycleLiveLook("home")}>
      {liveHomeLookLabel}
    </button>
              <div className="ipad-score-buttons">
                <button onClick={() => changeScore("home", -1)}>-</button>
                <span>{currentGame.homeScore}</span>
                <button onClick={() => changeScore("home", 1)}>+</button>
              </div>
              <div className="ipad-box-stat-grid">
      <div>
        <span>H</span>
        <div>
          <button onClick={() => changeBoxStat("home", "Hits", -1)}>-</button>
          <strong>{currentGame.homeHits}</strong>
          <button onClick={() => changeBoxStat("home", "Hits", 1)}>+</button>
        </div>
      </div>
    
      <div>
        <span>E</span>
        <div>
          <button onClick={() => changeBoxStat("home", "Errors", -1)}>-</button>
          <strong>{currentGame.homeErrors}</strong>
          <button onClick={() => changeBoxStat("home", "Errors", 1)}>+</button>
        </div>
      </div>
    </div>
            </div>
          </div>
    
          <div className="ipad-linescore-card">
            <div className="ipad-linescore-row ipad-linescore-head">
              <span>Team</span>
              {Array.from({ length: 12 }, (_, i) => (
                <span key={`head-${i}`}>{i + 1}</span>
              ))}
              <span>R</span>
              <span>H</span>
              <span>E</span>
            </div>
    
            <div className="ipad-linescore-row">
              <span>{awayTeam ? awayTeam.abbr : "AWY"}</span>
              {Array.from({ length: 12 }, (_, i) => (
                <span key={`away-${i}`}>{renderInningCell("away", i + 1, currentGame)}</span>
              ))}
              <span>{currentGame.awayScore}</span>
              <span>{currentGame.awayHits}</span>
              <span>{currentGame.awayErrors}</span>
            </div>
    
            <div className="ipad-linescore-row">
              <span>{homeTeam ? homeTeam.abbr : "HME"}</span>
              {Array.from({ length: 12 }, (_, i) => (
                <span key={`home-${i}`}>{renderInningCell("home", i + 1, currentGame)}</span>
              ))}
              <span>{currentGame.homeScore}</span>
              <span>{currentGame.homeHits}</span>
              <span>{currentGame.homeErrors}</span>
            </div>
          </div>
    
          {showFieldMode && (
            <LiveField
              game={currentGame}
              battingColors={battingBaseColors}
              interactive
              onRunnerMove={moveFieldRunner}
              onBallDrop={dropFieldBall}
              onBallResult={updateFieldBallResult}
              onToggleBase={updateBases}
              onClearBall={clearFieldBall}
            />
          )}

          <div className="live-pitch-deck">
            <div className="live-pitch-deck-status">
              <span className="operator-label">Pitch / Count</span>
              <strong>{currentGame.balls}-{currentGame.strikes}</strong>
              <small>{currentGame.outs} out{currentGame.outs === 1 ? "" : "s"}</small>
            </div>
            <button className="pitch-ball" onClick={() => updateCount("balls", 1)}>Ball</button>
            <button className="pitch-called" onClick={() => updateCount("called", 1)}>Called Strike</button>
            <button className="pitch-swing" onClick={() => updateCount("swinging", 1)}>Swinging</button>
            <button className="pitch-foul" onClick={() => updateCount("foul", 1)}>Foul</button>
            <button onClick={() => updateCount("outs", 1)}>+ Out / Advance</button>
            <button onClick={resetBallStrikeCount}>Reset B/S</button>
            <button onClick={resetLiveCountAndBases}>Clear Count + Bases</button>
            <button onClick={undoLastPlay}>↶ Undo</button>
          </div>

          <div className="ipad-control-grid">
            <div className="ipad-control-card">
              <h3>Balls</h3>
              <div className="ipad-stepper">
                <button onClick={() => updateCount("balls", -1)}>-</button>
                <strong>{currentGame.balls}</strong>
                <button onClick={() => updateCount("balls", 1)}>+</button>
              </div>
            </div>
    
            <div className="ipad-control-card">
              <h3>Strikes</h3>
              <div className="ipad-stepper">
                <button onClick={() => updateCount("strikes", -1)}>-</button>
                <strong>{currentGame.strikes}</strong>
                <button onClick={() => updateCount("strikes", 1)}>+</button>
                <button
      type="button"
      className="ipad-count-reset-button"
      onClick={resetBallStrikeCount}
    >
      Reset Balls / Strikes
    </button>
              </div>
            </div>
    
            <div className="ipad-control-card">
              <h3>Inning</h3>
              <div className="ipad-stepper">
                <button onClick={() => adjustLiveInning(-1)}>-</button>
                <strong>{currentGame.inning}</strong>
                <button onClick={() => adjustLiveInning(1)}>+</button>
              </div>
    
              <div className="ipad-half-buttons">
                <button
                  className={currentGame.half === "Top" && !currentGame.inningStatus ? "active-ipad-button" : ""}
                  onClick={() => setLiveHalf("Top")}
                >
                  ▲ Top
                </button>
                <button onClick={setMidEndInningStatus}>— Mid/End</button>
                <button
                  className={currentGame.half === "Bottom" && !currentGame.inningStatus ? "active-ipad-button" : ""}
                  onClick={() => setLiveHalf("Bottom")}
                >
                  ▼ Bottom
                </button>
              </div>
            </div>
    
            <div className="ipad-control-card ipad-bases-card">
              <h3>Bases</h3>
              <div
      className="ipad-base-diamond"
      style={{
        "--base-main": battingBaseColors.main,
        "--base-border": battingBaseColors.border,
        "--base-text": battingBaseColors.text,
      }}
    >
                <button
                  className={`ipad-base ipad-base-second ${currentGame.bases.second ? "occupied" : ""}`}
                  onClick={() => updateBases("second")}
                >
                  2B
                </button>
                <button
                  className={`ipad-base ipad-base-third ${currentGame.bases.third ? "occupied" : ""}`}
                  onClick={() => updateBases("third")}
                >
                  3B
                </button>
                <button
                  className={`ipad-base ipad-base-first ${currentGame.bases.first ? "occupied" : ""}`}
                  onClick={() => updateBases("first")}
                >
                  1B
                </button>
              </div>
            </div>
          </div>
    <div className="live-secondary-tools">
      <button className="live-secondary-toggle" onClick={() => setShowMoments((value) => !value)}>
        {showMoments ? "Hide Broadcast Moments" : "Broadcast Moments"}
      </button>
      {showMoments && (
        <div className="ipad-big-moment-actions">
          <button onClick={() => triggerLiveMoment("homeRun")}>Home Run</button>
          <button onClick={() => triggerLiveMoment("clutchHit")}>Clutch Hit</button>
          <button onClick={() => triggerLiveMoment("strikeout")}>Big Strikeout</button>
          <button onClick={() => triggerLiveMoment("doublePlay")}>Double Play</button>
          <button onClick={() => triggerLiveMoment("walkOff")}>Walk-Off</button>
        </div>
      )}
    </div>
          <div className="ipad-extra-actions live-game-status-actions">
            <span className="operator-label">Game Status</span>
            {["Warmup", "Live", "Delay", "Final"].map((status) => (
              <button
                key={status}
                className={currentGame.status === status ? "is-active-status" : ""}
                onClick={() => updateCurrentGame("status", status)}
              >
                {status === "Final" ? "Mark Final" : status}
              </button>
            ))}
            <button className="live-finalize-primary" onClick={finalizeGame}>Finalize & Save Game</button>
          </div>
        </div>
      </div>
  );
}
