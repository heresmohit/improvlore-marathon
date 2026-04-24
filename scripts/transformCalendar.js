export async function transformCalendar(rawData) {

  function toIST(timestr) {
    if (!timestr) return null;
    const utc = new Date(timestr); // ← remove the " UTC" append
    return utc.toLocaleString("en-CA", {
      timeZone: "Asia/Kolkata",
      hour12: false
    }).replace(",", "");
  }

  function toISTTime(timestr) {
    if (!timestr) return null;
    return new Date(timestr).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }

  const data_improv = [];

  for (const topic of rawData.topic_list.topics) {
    const tag = topic.tags.map(tag => tag.name).join(', ');
    if (!tag.toLowerCase().includes("improv")) continue;
    console.log(`Processing topic: ${topic.tags.map(tag => tag.name).join(', ')}`);
    const topic_id = topic.id;
    const slug = topic.slug;
    const date = new Date(topic.event_starts_at);
    const now = new Date();
    if (date < now) continue;

    const detail_url = `https://underline.center/t/${slug}/${topic_id}.json`;
    const detail = await (await fetch(detail_url)).json();
    const first_post = detail.post_stream.posts[0];

    data_improv.push({
      title: topic.title,
      "fancy title": topic.fancy_title,
      excerpt: topic.excerpt,
      full_content: first_post.raw,
      image_url: topic.image_url,
      thumbnails: topic.thumbnails,
      event_starts_at: toIST(topic.event_starts_at),
      event_ends_at: toIST(topic.event_ends_at),
      time: toISTTime(topic.event_starts_at),
      featured_link: topic.featured_link,
      slug,
      url: first_post.event.url,
      learn_more: `https://underline.center/t/${slug}/${topic_id}`,
      venue: "Underline Center, Indiranagar",
      tags: "UC"
    });
  }
  console.log(data_improv)
  return data_improv;
}