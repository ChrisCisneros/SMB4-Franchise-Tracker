import React, { useEffect, useMemo, useRef, useState } from "react";

const POSITIONS = {
  home: { x: 50, y: 86, label: "HOME" },
  first: { x: 73, y: 63, label: "1B" },
  second: { x: 50, y: 40, label: "2B" },
  third: { x: 27, y: 63, label: "3B" },
};


const BASEPATH_ORDER = ["home", "first", "second", "third"];

function runnerRoute(from, to) {
  if (!POSITIONS[from] || !POSITIONS[to] || from === to) return [];
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
    const distance = Math.hypot(point.x - pos.x, point.y - pos.y);
    if (distance < bestDistance) {
      best = key;
      bestDistance = distance;
    }
  });
  return bestDistance <= 18 ? best : null;
}

export default function LiveField({
  game,
  battingColors,
  interactive = false,
  onRunnerMove,
  onBallDrop,
  onBallResult,
  onToggleBase,
  onClearBall,
  compact = false,
}) {
  const fieldRef = useRef(null);
  const [drag, setDrag] = useState(null);
  const [runnerAnimationId, setRunnerAnimationId] = useState(null);
  const fieldState = game?.fieldState || {};
  const ball = fieldState.ball || { x: 50, y: 86, visible: false, result: "HIT", eventId: 0 };
  const bases = game?.bases || { first: false, second: false, third: false };
  const runnerEvent = fieldState.runnerEvent || null;

  useEffect(() => {
    if (!runnerEvent?.id) return undefined;
    setRunnerAnimationId(runnerEvent.id);
    const timeout = window.setTimeout(() => setRunnerAnimationId(null), 1180);
    return () => window.clearTimeout(timeout);
  }, [runnerEvent?.id]);

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
    if (!interactive) return;
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
  const route = eventFrom && eventTo ? runnerRoute(runnerEvent.from, runnerEvent.to) : [];
  const routeClass = route.length >= 4 ? "route-3" : route.length === 3 ? "route-2" : "route-1";
  const routeStyle = route.length ? {
    "--from-x": `${route[0].x}%`,
    "--from-y": `${route[0].y}%`,
    "--via1-x": `${(route[1] || route[route.length - 1]).x}%`,
    "--via1-y": `${(route[1] || route[route.length - 1]).y}%`,
    "--via2-x": `${(route[2] || route[route.length - 1]).x}%`,
    "--via2-y": `${(route[2] || route[route.length - 1]).y}%`,
    "--to-x": `${route[route.length - 1].x}%`,
    "--to-y": `${route[route.length - 1].y}%`,
  } : {};

  return (
    <div className={`live-field-shell ${compact ? "is-compact" : ""} ${interactive ? "is-interactive" : "is-broadcast"}`} style={fieldVars}>
      <div className="live-field-header">
        <div>
          <span className="live-field-kicker">LIVE FIELD</span>
          <strong>{interactive ? "Drag runners + ball" : "GameCast view"}</strong>
        </div>
        <div className="live-field-status">
          <span>{game?.half || "Top"} {game?.inning || 1}</span>
          {ball?.visible && <b className={`field-result-badge result-${String(ball.result || "HIT").toLowerCase()}`}>{ball.result || "HIT"}</b>}
        </div>
      </div>

      {interactive && (
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
      )}

      <div
        ref={fieldRef}
        className="live-field"
        onPointerMove={moveDrag}
        onPointerUp={finishDrag}
        onPointerCancel={() => setDrag(null)}
      >
        <div className="field-outfield-arc" />
        <div className="field-infield-dirt" />
        <div className="field-foul-line field-foul-left" />
        <div className="field-foul-line field-foul-right" />
        <div className="field-mound">P</div>

        {Object.entries(POSITIONS).map(([key, pos]) => (
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

        {interactive && (
          <div
            className={`field-runner field-batter ${drag?.kind === "runner" && drag.origin === "batter" ? "dragging" : ""}`}
            style={runnerStyle("batter")}
            onPointerDown={(event) => startRunnerDrag("batter", event)}
            title="Drag batter to a base"
          >
            B
          </div>
        )}

        {["first", "second", "third"].map((base) => bases[base] && !(activeRunnerAnimation && runnerEvent?.to === base) && (
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

        {runnerEvent && eventFrom && eventTo && activeRunnerAnimation && (
          <div
            key={runnerEvent.id}
            className={`field-runner-ghost ${routeClass} ${runnerEvent.scored ? "scored" : ""}`}
            style={routeStyle}
          >
            R
          </div>
        )}

        <div
          className={`field-ball ${interactive ? "draggable" : ""} ${drag?.kind === "ball" ? "dragging" : ""} ${ball?.visible || interactive ? "visible" : ""}`}
          style={ballStyle}
          onPointerDown={startBallDrag}
          title={interactive ? "Drag the ball to where the play went" : ball?.result || "Ball"}
        >
          ⚾
          {ball?.visible && <span>{ball.result || "HIT"}</span>}
        </div>
      </div>

      <div className="live-field-footer">
        {interactive ? (
          <><span>Tip: drag a runner to another base. Drop a runner on HOME to score.</span><span>Ball placement is visual only.</span></>
        ) : (
          <><span>{game?.latestPlay || "Waiting for the next play."}</span><span>{ball?.visible ? `${ball.result || "HIT"} location` : "No ball location set"}</span></>
        )}
      </div>
    </div>
  );
}
