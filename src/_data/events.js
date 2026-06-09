import { readFile } from "fs/promises";

// The marathon is over, so the site is a static archive: render the events
// straight from events-history.json (the saved, enriched lineup) plus any
// extras in custom.json. Edit those JSON files directly to change the schedule.
export default async function () {
  const history = JSON.parse(await readFile("./events-history.json", "utf8"));
  const customData = JSON.parse(await readFile("./custom.json", "utf8"));
  return history.concat(customData);
}
