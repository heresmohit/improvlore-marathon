// Recovery generator: rebuilds events-history.json for the 1 May 2026 marathon
// directly from the per-topic detail endpoints (which still serve the real
// title/image/description/cooked) and pins the canonical marathon date+time,
// because the live calendar has since dropped these events and rolled the
// recurring ones forward to later dates.
//
// Run with: node scripts/reconstructHistory.js

import { writeFileSync } from "fs";
import { transformCalendar } from "./transformCalendar.js";

// The 8 marathon events, in running order, with their canonical UTC start/end
// (12:00pm–midnight IST on 1 May 2026) preserved from the original snapshot.
// Topic IDs are resolved live by slug (Discourse serves /t/{slug}.json), so we
// don't hard-code them — they have drifted from the original snapshot.
const MARATHON = [
  { slug: "theatresports-by-improv-lore",                              starts: "2026-05-01T06:30:00.000Z", ends: "2026-05-01T08:00:00.000Z" },
  { slug: "make-friends-with-the-stage-open-stage-jam-by-improv-lore", starts: "2026-05-01T08:30:00.000Z", ends: "2026-05-01T10:30:00.000Z" },
  { slug: "yes-and-dragons-with-improv-lore",                          starts: "2026-05-01T10:00:00.000Z", ends: "2026-05-01T11:30:00.000Z" },
  { slug: "whimsical-wednesday-friday-edition-by-improv-lore",         starts: "2026-05-01T12:00:00.000Z", ends: "2026-05-01T14:00:00.000Z" },
  { slug: "what-is-yes-and-an-introduction-to-improv-by-improv-lore",  starts: "2026-05-01T12:30:00.000Z", ends: "2026-05-01T14:30:00.000Z" },
  { slug: "make-an-improv-song-musical-improv-jam-by-improv-lore",     starts: "2026-05-01T13:30:00.000Z", ends: "2026-05-01T15:30:00.000Z" },
  { slug: "powerpoint-roulette-by-improv-lore",                        starts: "2026-05-01T15:00:00.000Z", ends: "2026-05-01T16:30:00.000Z" },
  { slug: "the-silliest-show-tonight-by-improv-lore",                  starts: "2026-05-01T17:00:00.000Z", ends: "2026-05-01T18:30:00.000Z" },
];

const topics = [];
for (const m of MARATHON) {
  const url = `https://underline.center/t/${m.slug}.json`;
  const d = await (await fetch(url)).json();
  // Synthesise a topic-list entry in the shape transformCalendar expects,
  // forcing the canonical marathon date/tag and reusing the live media+excerpt.
  topics.push({
    id: d.id,
    title: d.title,
    fancy_title: d.fancy_title,
    slug: m.slug,
    excerpt: d.post_stream?.posts?.[0]?.excerpt || d.excerpt || "",
    image_url: d.image_url,
    thumbnails: d.thumbnails,
    featured_link: null,
    event_starts_at: m.starts,
    event_ends_at: m.ends,
    tags: [{ name: "improvathon" }],
  });
  console.log(`Fetched: ${d.title}`);
}

const events = await transformCalendar({ topic_list: { topics } }, { includePast: true });
writeFileSync(new URL("../events-history.json", import.meta.url), JSON.stringify(events, null, 2) + "\n");
console.log(`\nWrote ${events.length} events to events-history.json`);
