import React, { useEffect, useMemo, useRef, useState } from "react";

const POSITIONS = {
  home: { x: 50, y: 86, label: "HOME" },
  first: { x: 73, y: 63, label: "1B" },
  second: { x: 50, y: 40, label: "2B" },
  third: { x: 27, y: 63, label: "3B" },
  pitcher: { x: 50, y: 62, label: "P" },
};

const BASEPATH_ORDER = ["home", "first", "second", "third"];

function runnerRoute(from, to, fullCycle = false) {
  if (!POSITIONS[from] || !POSITIONS[to]) return [];
  if (from === to && !fullCycle) return [];
  if (from === "home" && to === "home" && fullCycle) {
    return [POSITIONS.home, POSITIONS.first, POSITIONS.second, POSITIONS.third, POSITIONS.home];
  }

  const start = BASEPATH_ORDER.indexOf(from);
  const end = BASEPATH_ORDER.indexOf(to);
  if (start < 0 || end < 0) return [POSITIONS[from], POSITIONS[to]];

  const route = [POSITIONS[from]];
  let index = start;
  let guard = 0;
  while (index !== end && guard < BASEPATH_ORDER.length) {
    index = (index + 1) % BASEPATH_ORDER.length;
    route.push(POSITIONS[BASEPATH_ORDER[index]]);
    guard += 1;
  }
  return route;
}

const BALL_RESULTS = [
  ["HIT", "Hit"],
  ["1B", "1B"],
  ["2B", "2B"],
  ["3B", "3B"],
  ["HR", "HR"],
  ["OUT", "Out"],
  ["ERROR", "Error"],
  ["FOUL", "Foul"],
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function pointerPercent(event, rect) {
  return {
    x: clamp(((event.clientX - rect.left) / rect.width) * 100, 5, 95),
    y: clamp(((event.clientY - rect.top) / rect.height) * 100, 8, 94),
  };
}

function closestBase(point) {
  let best = null;
  let bestDistance = Infinity;
  Object.entries(POSITIONS).forEach(([key, pos]) => {
    if (key === "pitcher") return;
    const distance = Math.hypot(point.x - pos.x, point.y - pos.y);
    if (distance < bestDistance) {
      best = key;
      bestDistance = distance;
    }
  });
  return bestDistance <= 18 ? best : null;
}

function routeVars(move) {
  const route = runnerRoute(move.from, move.to, move.fullCycle);
  if (!route.length) return { route, className: "route-1", style: {} };
  const last = route[route.length - 1];
  const p1 = route[1] || last;
  const p2 = route[2] || last;
  const p3 = route[3] || last;
  return {
    route,
    className: route.length >= 5 ? "route-4" : route.length === 4 ? "route-3" : route.length === 3 ? "route-2" : "route-1",
    style: {
      "--from-x": `${route[0].x}%`,
      "--from-y": `${route[0].y}%`,
      "--via1-x": `${p1.x}%`,
      "--via1-y": `${p1.y}%`,
      "--via2-x": `${p2.x}%`,
      "--via2-y": `${p2.y}%`,
      "--via3-x": `${p3.x}%`,
      "--via3-y": `${p3.y}%`,
      "--to-x": `${last.x}%`,
      "--to-y": `${last.y}%`,
    },
  };
}

function ballMotion(type) {
  if (["groundout", "fielderschoice", "doubleplay", "error"].includes(type)) return "ground";
  if (["lineout"].includes(type)) return "liner";
  if (type === "single") return "single";
  if (type === "double") return "double";
  if (type === "triple") return "triple";
  if (type === "homerun") return "homer";
  if (["flyout", "sacfly"].includes(type)) return "fly";
  if (type === "popup") return "popup";
  return "standard";
}

function runnerPhaseDelay(type) {
  if (["groundout", "fielderschoice", "doubleplay", "error"].includes(type)) return 1380;
  if (type === "lineout") return 1280;
  if (type === "single") return 1420;
  if (type === "double") return 1520;
  if (type === "triple") return 1620;
  if (["flyout", "sacfly"].includes(type)) return 1720;
  if (type === "popup") return 1660;
  if (type === "homerun") return 1840;
  return 1450;
}

export default function LiveField({
  game,
  battingColors,
  interactive = false,
  onRunnerMove = undefined,
  onRunnerRemove = undefined,
  onBallDrop = undefined,
  onBallResult = undefined,
  onToggleBase = undefined,
  onClearBall = undefined,
  onAdvanceAll = undefined,
  compact = false,
}) {
  const fieldRef = useRef(null);
  const [drag, setDrag] = useState(null);
  const [runnerAnimationId, setRunnerAnimationId] = useState(null);
  const [playPhase, setPlayPhase] = useState("idle");
  const fieldState = game?.fieldState || {};
  const ball = fieldState.ball || { x: 50, y: 86, visible: false, result: "HIT", eventId: 0 };
  const bases = game?.bases || { first: false, second: false, third: false };
  const runnerEvent = fieldState.runnerEvent || null;
  const playEvent = fieldState.playEvent || null;

  useEffect(() => {
    if (!runnerEvent?.id) return undefined;
    setRunnerAnimationId(runnerEvent.id);
    const timeout = window.setTimeout(() => setRunnerAnimationId(null), 1180);
    return () => window.clearTimeout(timeout);
  }, [runnerEvent?.id]);

  useEffect(() => {
    if (!playEvent?.id) {
      setPlayPhase("idle");
      return undefined;
    }

    const kind = playEvent.kind || "batted";
    setPlayPhase(kind === "runner" ? "runners" : kind === "log-only" ? "settle" : "pitch");
    const timers = [];

    if (kind === "batted") {
      const runnersAt = runnerPhaseDelay(playEvent.type);
      timers.push(window.setTimeout(() => setPlayPhase("contact"), 360));
      timers.push(window.setTimeout(() => setPlayPhase("flight"), 560));
      timers.push(window.setTimeout(() => setPlayPhase("runners"), runnersAt));
      timers.push(window.setTimeout(() => setPlayPhase("settle"), runnersAt + 1450));
    } else if (kind === "pitch") {
      timers.push(window.setTimeout(() => setPlayPhase("contact"), 420));
      timers.push(window.setTimeout(() => setPlayPhase("runners"), 650));
      timers.push(window.setTimeout(() => setPlayPhase("settle"), 1850));
    } else if (kind === "pickoff") {
      timers.push(window.setTimeout(() => setPlayPhase("flight"), 360));
      timers.push(window.setTimeout(() => setPlayPhase("settle"), 1150));
    } else if (kind === "runner") {
      timers.push(window.setTimeout(() => setPlayPhase("settle"), 1450));
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [playEvent?.id]);

  const fieldVars = useMemo(() => ({
    "--runner-main": battingColors?.main || "#f8fafc",
    "--runner-border": battingColors?.border || battingColors?.alt || "#ffffff",
    "--runner-text": battingColors?.text || "#ffffff",
  }), [battingColors]);

  const startRunnerDrag = (origin, event) => {
    if (!interactive) return;
    event.preventDefault();
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDrag({ kind: "runner", origin, pointerId: event.pointerId, ...pointerPercent(event, rect) });
  };

  const startBallDrag = (event) => {
    if (!interactive || playPhase !== "idle" && playPhase !== "settle") return;
    event.preventDefault();
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDrag({ kind: "ball", pointerId: event.pointerId, ...pointerPercent(event, rect) });
  };

  const moveDrag = (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDrag((prev) => ({ ...prev, ...pointerPercent(event, rect) }));
  };

  const finishDrag = (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) {
      setDrag(null);
      return;
    }
    const point = pointerPercent(event, rect);
    if (drag.kind === "runner") {
      const destination = closestBase(point);
      if (destination && destination !== (drag.origin === "batter" ? "home" : drag.origin)) {
        onRunnerMove?.(drag.origin, destination);
      }
    } else if (drag.kind === "ball") {
      onBallDrop?.(point.x, point.y);
    }
    setDrag(null);
  };

  const runnerStyle = (origin) => {
    if (drag?.kind === "runner" && drag.origin === origin) {
      return { left: `${drag.x}%`, top: `${drag.y}%` };
    }
    const key = origin === "batter" ? "home" : origin;
    return { left: `${POSITIONS[key].x}%`, top: `${POSITIONS[key].y}%` };
  };

  const ballStyle = drag?.kind === "ball"
    ? { left: `${drag.x}%`, top: `${drag.y}%` }
    : { left: `${ball.x ?? 50}%`, top: `${ball.y ?? 86}%` };

  const eventFrom = runnerEvent?.from && POSITIONS[runnerEvent.from] ? POSITIONS[runnerEvent.from] : null;
  const eventTo = runnerEvent?.to && POSITIONS[runnerEvent.to] ? POSITIONS[runnerEvent.to] : null;
  const activeRunnerAnimation = Boolean(runnerEvent?.id && runnerAnimationId === runnerEvent.id);
  const manualRoute = eventFrom && eventTo ? routeVars({ from: runnerEvent.from, to: runnerEvent.to, fullCycle: runnerEvent.fullCycle }) : null;

  const playMoves = Array.isArray(playEvent?.runnerMoves) ? playEvent.runnerMoves : [];
  const playingRunners = playPhase === "runners";
  const hiddenPlayBases = new Set(playingRunners
    ? playMoves.flatMap((move) => [move.from, !move.out && move.to !== "home" ? move.to : null]).filter((base) => ["first", "second", "third"].includes(base))
    : []);

  const playBallPosition = (() => {
    if (!playEvent || ["idle", "settle"].includes(playPhase)) return null;
    if (playEvent.kind === "runner" || playEvent.kind === "log-only") return null;
    if (playPhase === "pitch") return POSITIONS.pitcher;
    if (playPhase === "contact") return POSITIONS.home;
    return { x: playEvent.targetX ?? ball.x ?? 50, y: playEvent.targetY ?? ball.y ?? 30 };
  })();
  const playMotion = ballMotion(playEvent?.type);
  const targetX = Number(playEvent?.targetX ?? ball.x ?? 50);
  const targetY = Number(playEvent?.targetY ?? ball.y ?? 30);
  const midX = (50 + targetX) / 2;
  const naturalMidY = (86 + targetY) / 2;
  const arcLift = playMotion === "homer" ? 34 : playMotion === "popup" ? 38 : playMotion === "fly" ? 28 : playMotion === "triple" ? 23 : playMotion === "double" ? 18 : playMotion === "single" ? 10 : playMotion === "liner" ? 5 : 0;
  const ballAnimationVars = {
    "--ball-target-x": `${targetX}%`,
    "--ball-target-y": `${targetY}%`,
    "--ball-mid-x": `${midX}%`,
    "--ball-mid-y": `${Math.max(7, naturalMidY - arcLift)}%`,
    "--ball-late-x": `${midX + (targetX - midX) * 0.55}%`,
    "--ball-late-y": `${targetY + 6}%`,
  };

  return (
    <div className={`live-field-shell ${compact ? "is-compact" : ""} ${interactive ? "is-interactive" : "is-broadcast"}`} style={fieldVars}>
      <div className="live-field-header">
        <div>
          <span className="live-field-kicker">LIVE FIELD</span>
          <strong>{interactive ? "GameCast operator field" : "GameCast view"}</strong>
        </div>
        <div className="live-field-status">
          <span>{game?.half || "Top"} {game?.inning || 1}</span>
          {ball?.visible && <b className={`field-result-badge result-${String(ball.result || "HIT").toLowerCase()}`}>{ball.result || "HIT"}</b>}
        </div>
      </div>

      {interactive && (
        <>
          <div className="field-result-toolbar">
            {BALL_RESULTS.map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={(ball.result || "HIT") === value ? "active" : ""}
                onClick={() => onBallResult?.(value)}
              >
                {label}
              </button>
            ))}
            <button type="button" className="field-clear-ball" onClick={onClearBall}>Clear Ball</button>
          </div>
          <div className="field-runner-tools">
            <button type="button" className="advance-all-button" onClick={onAdvanceAll}>Advance Everyone +1</button>
            <span>Moves the batter to 1B and every occupied runner up one base.</span>
            <div className="field-remove-runner-group">
              {["first", "second", "third"].filter((base) => bases[base]).map((base) => (
                <button type="button" key={base} className="remove-runner-button" onClick={() => onRunnerRemove?.(base)}>
                  Remove {POSITIONS[base].label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div
        ref={fieldRef}
        className={`live-field play-phase-${playPhase}`}
        onPointerMove={moveDrag}
        onPointerUp={finishDrag}
        onPointerCancel={() => setDrag(null)}
      >
        <div className="field-warning-track" />
        <div className="field-outfield-arc" />
        <div className="field-infield-dirt" />
        <div className="field-grass-diamond" />
        <div className="field-foul-line field-foul-left" />
        <div className="field-foul-line field-foul-right" />
        <div className="field-mound">P</div>

        {Object.entries(POSITIONS).filter(([key]) => key !== "pitcher").map(([key, pos]) => (
          <button
            type="button"
            key={key}
            className={`field-base field-base-${key} ${key !== "home" && bases[key] ? "occupied" : ""}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onClick={() => interactive && key !== "home" && onToggleBase?.(key)}
            title={interactive && key !== "home" ? `Click to toggle ${pos.label}` : pos.label}
          >
            <span>{pos.label}</span>
          </button>
        ))}

        {interactive && !playingRunners && (
          <div
            className={`field-runner field-batter ${drag?.kind === "runner" && drag.origin === "batter" ? "dragging" : ""}`}
            style={runnerStyle("batter")}
            onPointerDown={(event) => startRunnerDrag("batter", event)}
            title="Drag batter to a base"
          >
            B
          </div>
        )}

        {["first", "second", "third"].map((base) => bases[base] && !hiddenPlayBases.has(base) && !(activeRunnerAnimation && runnerEvent?.to === base) && (
          <div
            key={base}
            className={`field-runner ${drag?.kind === "runner" && drag.origin === base ? "dragging" : ""}`}
            style={runnerStyle(base)}
            onPointerDown={(event) => startRunnerDrag(base, event)}
            title={interactive ? `Drag runner from ${POSITIONS[base].label}` : `Runner on ${POSITIONS[base].label}`}
          >
            R
          </div>
        ))}

        {runnerEvent && manualRoute?.route.length > 0 && activeRunnerAnimation && (
          <div
            key={runnerEvent.id}
            className={`field-runner-ghost ${manualRoute.className} ${runnerEvent.scored ? "scored" : ""}`}
            style={manualRoute.style}
          >
            R
          </div>
        )}

        {playingRunners && playMoves.map((move, index) => {
          const routed = routeVars(move);
          if (!routed.route.length) return null;
          return (
            <div
              key={`${playEvent.id}-${index}`}
              className={`field-runner-ghost field-play-runner ${routed.className} ${move.scored ? "scored" : ""} ${move.out ? "runner-out" : ""}`}
              style={{ ...routed.style, "--runner-delay": `${index * 70}ms` }}
            >
              {move.batter ? "B" : "R"}
            </div>
          );
        })}

        {playBallPosition && (
          <div
            key={`play-ball-${playEvent?.id}`}
            className={`field-play-ball phase-${playPhase} motion-${playMotion}`}
            style={{ left: `${playBallPosition.x}%`, top: `${playBallPosition.y}%`, ...ballAnimationVars }}
          >
            ⚾
          </div>
        )}

        <div
          className={`field-ball ${interactive ? "draggable" : ""} ${drag?.kind === "ball" ? "dragging" : ""} ${ball?.visible || interactive ? "visible" : ""} ${playBallPosition ? "is-playing" : ""}`}
          style={ballStyle}
          onPointerDown={startBallDrag}
          title={interactive ? "Drag the ball to the play destination" : ball?.result || "Ball"}
        >
          ⚾
          {ball?.visible && <span>{ball.result || "HIT"}</span>}
        </div>
      </div>

      <div className="live-field-footer">
        {interactive ? (
          <><span>Drag the ball to the destination, then use Start Play below.</span><span>The ball resets automatically after 7 seconds.</span></>
        ) : (
          <><span>{game?.latestPlay || "Waiting for the next play."}</span><span>{playPhase !== "idle" && playPhase !== "settle" ? "Play in motion" : ball?.visible ? `${ball.result || "HIT"} location` : "Ready"}</span></>
        )}
      </div>
    </div>
  );
}
