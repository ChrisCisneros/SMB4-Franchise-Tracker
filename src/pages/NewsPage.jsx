import React, { useMemo, useState } from "react";
import { buildNewsFeed } from "../utils/newsUtils";

const FILTERS = ["All", "Current", "Postseason", "Record Book", "Archive"];

function storyBucket(story) {
  if (["Game Final", "League Watch", "Pennant Race"].includes(story.category)) return "Current";
  if (["Championship", "Postseason"].includes(story.category)) return "Postseason";
  if (story.category === "Record Book") return "Record Book";
  return "Archive";
}

function StoryMeta({ story }) {
  return (
    <div className="news-story-topline">
      <span className="news-category-pill">{story.category}</span>
      <span className="news-date">{story.dateLabel}</span>
    </div>
  );
}

function TeamTags({ story }) {
  if (!story.teams?.length) return null;

  return (
    <div className="news-team-row">
      {story.teams.map((abbr) => (
        <span key={`${story.id}-${abbr}`}>{abbr}</span>
      ))}
    </div>
  );
}

function LeadStory({ story }) {
  return (
    <article className={`news-lead-story news-tone-${story.tone || "archive"}`}>
      <div className="news-lead-overlay" />
      <div className="news-lead-content">
        <StoryMeta story={story} />
        <div className="news-breaking-label">Top Story</div>
        <h3>{story.headline}</h3>
        <p>{story.dek}</p>
        <TeamTags story={story} />
      </div>
    </article>
  );
}

function SideStory({ story }) {
  return (
    <article className={`news-side-story news-tone-${story.tone || "archive"}`}>
      <StoryMeta story={story} />
      <h3>{story.headline}</h3>
      <p>{story.dek}</p>
      <TeamTags story={story} />
    </article>
  );
}

function HeadlineStory({ story }) {
  return (
    <article className={`news-headline-row news-tone-${story.tone || "archive"}`}>
      <div className="news-headline-copy">
        <StoryMeta story={story} />
        <h3>{story.headline}</h3>
        <p>{story.dek}</p>
      </div>
      <TeamTags story={story} />
    </article>
  );
}

export default function NewsPage({ ctx }) {
  const { data, teams } = ctx;
  const [filter, setFilter] = useState("All");

  const stories = useMemo(() => buildNewsFeed(data, teams), [data, teams]);
  const filtered = filter === "All"
    ? stories
    : stories.filter((story) => storyBucket(story) === filter);

  const lead = filtered[0] || null;
  const sideStories = filtered.slice(1, 3);
  const latestStories = filtered.slice(3);

  const archiveCount = stories.filter((story) => {
    const bucket = storyBucket(story);
    return bucket === "Archive" || bucket === "Postseason";
  }).length;
  const recordCount = stories.filter((story) => storyBucket(story) === "Record Book").length;
  const currentCount = stories.filter((story) => storyBucket(story) === "Current").length;

  return (
    <div className="news-page">
      <section className="news-masthead card">
        <div className="news-brand-block">
          <div className="news-network-mark">SMB</div>
          <div>
            <div className="news-kicker">SMB4 League Network</div>
            <h2>League News</h2>
            <p>The latest from around the franchise: races, postseason history, champions, and the record book.</p>
          </div>
        </div>

        <div className="news-masthead-stats">
          <div><strong>{currentCount}</strong><span>Current</span></div>
          <div><strong>{archiveCount}</strong><span>History</span></div>
          <div><strong>{recordCount}</strong><span>Records</span></div>
        </div>
      </section>

      {!!stories.length && (
        <div className="news-ticker" aria-label="Top league headline">
          <span className="news-ticker-label">Latest</span>
          <strong>{stories[0].headline}</strong>
          <span className="news-ticker-date">{stories[0].dateLabel}</span>
        </div>
      )}

      <div className="news-toolbar">
        <div className="news-section-title">
          <span>Newsroom</span>
          <strong>{filter === "All" ? "Top Stories" : filter}</strong>
        </div>

        <div className="news-filter-row">
          {FILTERS.map((item) => (
            <button
              key={item}
              className={filter === item ? "news-filter-active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {!lead ? (
        <div className="card news-empty-state">
          <div className="news-kicker">News Desk</div>
          <h3>No headlines in this section yet.</h3>
          <p className="muted">As games are played and seasons are archived, this section will fill itself in.</p>
        </div>
      ) : (
        <>
          <section className="news-top-grid">
            <LeadStory story={lead} />

            <div className="news-side-stack">
              {sideStories.length ? (
                sideStories.map((story) => <SideStory key={story.id} story={story} />)
              ) : (
                <aside className="news-desk-note card">
                  <div className="news-kicker">News Desk</div>
                  <h3>The league now has a memory.</h3>
                  <p>Championships and record-book stories stay in the feed while current-season stories update as the league changes.</p>
                  <p className="muted">Full game-by-game news will become possible once finalized-game history is added.</p>
                </aside>
              )}
            </div>
          </section>

          {!!latestStories.length && (
            <section className="news-latest-section">
              <div className="news-section-heading">
                <div>
                  <div className="news-kicker">Around the League</div>
                  <h3>Latest Headlines</h3>
                </div>
                <span>{latestStories.length} stor{latestStories.length === 1 ? "y" : "ies"}</span>
              </div>

              <div className="news-headline-list">
                {latestStories.map((story) => (
                  <HeadlineStory key={story.id} story={story} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
