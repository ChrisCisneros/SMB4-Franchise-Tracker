import React, { useMemo } from "react";
import { buildLeagueRecords, formatPct } from "../utils/recordsUtils";

function LeaderNames({ rows, valueKey, suffix = "" }) {
  if (!rows?.length) return <span className="records-empty-inline">No archived result yet</span>;
  const value = rows[0]?.[valueKey] ?? 0;
  return (
    <>
      <strong>{rows.map((row) => row.abbr).join(" · ")}</strong>
      <span>{value}{suffix}</span>
    </>
  );
}

function RecordCard({ eyebrow, title, children, detail }) {
  return (
    <div className="record-spotlight-card">
      <div className="record-eyebrow">{eyebrow}</div>
      <h3>{title}</h3>
      <div className="record-spotlight-value">{children}</div>
      {detail && <p>{detail}</p>}
    </div>
  );
}

function RankingTable({ title, rows, value, note }) {
  return (
    <div className="card records-table-card">
      <div className="records-section-heading">
        <div>
          <div className="records-section-kicker">Leaderboard</div>
          <h3>{title}</h3>
        </div>
        {note && <span className="records-table-note">{note}</span>}
      </div>
      {rows.length === 0 ? (
        <p className="muted">No qualifying archived seasons yet.</p>
      ) : (
        <div className="records-ranking-list">
          {rows.map((row, index) => (
            <div className="records-ranking-row" key={`${title}-${row.teamId}`}>
              <span className="records-rank">{index + 1}</span>
              <span className="records-team-block">
                <strong>{row.abbr}</strong>
                <small>{row.name}</small>
              </span>
              <strong className="records-ranking-value">{value(row)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamPillList({ title, subtitle, rows, emptyText = "Nobody yet." }) {
  return (
    <div className="card records-list-card">
      <div className="records-section-kicker">Franchise Tracker</div>
      <h3>{title}</h3>
      <p className="muted">{subtitle}</p>
      {rows.length ? (
        <div className="records-team-pills">
          {rows.map((row) => (
            <span key={`${title}-${row.teamId}`} className="records-team-pill">
              {row.abbr}
            </span>
          ))}
        </div>
      ) : (
        <div className="records-all-clear">{emptyText}</div>
      )}
    </div>
  );
}

function SingleSeasonCard({ label, entry, formatter }) {
  return (
    <div className="records-season-card">
      <span>{label}</span>
      {entry ? (
        <>
          <strong>{entry.abbr}</strong>
          <b>{formatter(entry)}</b>
          <small>{entry.seasonName}</small>
        </>
      ) : (
        <em>No data</em>
      )}
    </div>
  );
}

export default function LeagueRecordsPage({ ctx }) {
  const { data, teams } = ctx;
  const records = useMemo(
    () => buildLeagueRecords(data.seasonHistory || [], teams || []),
    [data.seasonHistory, teams]
  );

  if (!records.seasons.length) {
    return (
      <div className="records-page">
        <div className="card records-empty-state">
          <div className="records-section-kicker">League Records</div>
          <h2>The record book is waiting for its first archived season.</h2>
          <p className="muted">
            Archive a completed season from Season History and this page will build itself automatically.
          </p>
        </div>
      </div>
    );
  }

  const s = records.singleSeason;

  return (
    <div className="records-page">
      <section className="records-hero card">
        <div>
          <div className="records-hero-kicker">SMB4 League Record Book</div>
          <h2>League Records</h2>
          <p>
            Every championship, playoff run, dynasty, drought, and ridiculous season preserved from the archive.
          </p>
        </div>
        <div className="records-hero-stats">
          <div><strong>{records.summary.seasonsArchived}</strong><span>Seasons</span></div>
          <div><strong>{records.summary.championsCrowned}</strong><span>Champions</span></div>
          <div><strong>{records.summary.teamsTracked}</strong><span>Franchises</span></div>
        </div>
      </section>

      <section className="records-spotlight-grid">
        <RecordCard eyebrow="Championships" title="Most World Series Wins">
          <LeaderNames rows={records.leaders.championships} valueKey="championships" />
        </RecordCard>
        <RecordCard eyebrow="October" title="Most Playoff Appearances">
          <LeaderNames rows={records.leaders.playoffAppearances} valueKey="playoffAppearances" />
        </RecordCard>
        <RecordCard eyebrow="Postseason" title="Most Playoff Game Wins">
          <LeaderNames rows={records.leaders.playoffGameWins} valueKey="playoffGameWins" />
        </RecordCard>
        <RecordCard eyebrow="Dynasty" title="Longest World Series Streak">
          <LeaderNames rows={records.leaders.longestWsStreak} valueKey="longestWsStreak" suffix=" seasons" />
        </RecordCard>
      </section>

      <section className="card records-single-season-wrap">
        <div className="records-section-heading">
          <div>
            <div className="records-section-kicker">Single-Season Records</div>
            <h3>Best, Worst & Wildest Seasons</h3>
          </div>
        </div>
        <div className="records-season-grid">
          <SingleSeasonCard label="Best Record" entry={s.bestSeason} formatter={(x) => `${x.wins}-${x.losses} (${formatPct(x.pct)})`} />
          <SingleSeasonCard label="Worst Record" entry={s.worstSeason} formatter={(x) => `${x.wins}-${x.losses} (${formatPct(x.pct)})`} />
          <SingleSeasonCard label="Best Run Differential" entry={s.bestRunDiffSeason} formatter={(x) => `${x.runDiff > 0 ? "+" : ""}${x.runDiff}`} />
          <SingleSeasonCard label="Worst Run Differential" entry={s.worstRunDiffSeason} formatter={(x) => `${x.runDiff}`} />
          <SingleSeasonCard label="Most Runs Scored" entry={s.mostRunsSeason} formatter={(x) => `${x.runsScored}`} />
          <SingleSeasonCard label="Fewest Runs Allowed" entry={s.fewestRunsAllowedSeason} formatter={(x) => `${x.runsAllowed}`} />
          <SingleSeasonCard label="Fewest Runs Scored" entry={s.fewestRunsSeason} formatter={(x) => `${x.runsScored}`} />
          <SingleSeasonCard label="Most Runs Allowed" entry={s.mostRunsAllowedSeason} formatter={(x) => `${x.runsAllowed}`} />
        </div>
      </section>

      <section className="records-tables-grid">
        <RankingTable title="World Series Titles" rows={records.rankings.championships} value={(r) => r.championships} />
        <RankingTable title="World Series Appearances" rows={records.rankings.wsAppearances} value={(r) => r.wsAppearances} />
        <RankingTable title="Playoff Appearances" rows={records.rankings.playoffAppearances} value={(r) => r.playoffAppearances} />
        <RankingTable title="Playoff Game Wins" rows={records.rankings.playoffGameWins} value={(r) => r.playoffGameWins} />
        <RankingTable title="Playoff Series Wins" rows={records.rankings.playoffSeriesWins} value={(r) => r.playoffSeriesWins} />
        <RankingTable title="Division Titles" rows={records.rankings.divisionTitles} value={(r) => r.divisionTitles} />
        <RankingTable title="#1 Seeds" rows={records.rankings.topSeeds} value={(r) => r.topSeeds} />
        <RankingTable title="All-Time Regular Season Wins" rows={records.rankings.allTimeWins} value={(r) => r.wins} />
        <RankingTable title="All-Time Regular Season Win %" rows={records.rankings.allTimePct} value={(r) => formatPct(r.regularSeasonPct)} note="Archived seasons only" />
        <RankingTable title="Postseason Win %" rows={records.rankings.playoffPct} value={(r) => formatPct(r.playoffPct)} note="Game wins from archived brackets" />
      </section>

      <section className="records-achievement-grid">
        <TeamPillList
          title="Still Searching"
          subtitle="Teams with no playoff appearance in the archived record book."
          rows={records.lists.noPlayoffs}
          emptyText="Every franchise has reached the postseason."
        />
        <TeamPillList
          title="No Trophy Yet"
          subtitle="Teams still looking for their first World Series title."
          rows={records.lists.noTrophy}
          emptyText="Everybody has a ring. Absolute chaos."
        />
        <TeamPillList
          title="Never Reached the World Series"
          subtitle="Teams that have not won a league pennant yet."
          rows={records.lists.neverWorldSeries}
          emptyText="Every franchise has been to the World Series."
        />
        <TeamPillList
          title="Perfect Attendance"
          subtitle="Teams that have made the playoffs in every archived season."
          rows={records.lists.perfectPlayoffAttendance}
          emptyText="Nobody has made every postseason."
        />
      </section>

      <section className="records-drought-grid">
        <RankingTable
          title="Active Playoff Droughts"
          rows={records.lists.activePlayoffDroughts}
          value={(r) => `${r.activePlayoffDrought} season${r.activePlayoffDrought === 1 ? "" : "s"}`}
        />
        <RankingTable
          title="Active Championship Droughts"
          rows={records.lists.activeTitleDroughts}
          value={(r) => `${r.activeTitleDrought} season${r.activeTitleDrought === 1 ? "" : "s"}`}
        />
      </section>
    </div>
  );
}
