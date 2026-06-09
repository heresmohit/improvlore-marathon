import { readFile } from "fs/promises";

// Render from the saved snapshot in events-history.json rather than fetching
// the live calendar. The live endpoint only returns *upcoming* events, so once
// the marathon is past, a fresh fetch would drop the whole lineup. The snapshot
// holds the full, enriched history; regenerate it with:
//   node scripts/reconstructHistory.js
export default async function () {
  const history = JSON.parse(await readFile("./events-history.json", "utf8"));
  const customData = JSON.parse(await readFile("./custom.json", "utf8"));
  return history.concat(customData);
}
