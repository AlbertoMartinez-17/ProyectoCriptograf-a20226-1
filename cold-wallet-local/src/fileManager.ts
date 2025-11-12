import * as fs from "fs";
import * as path from "path";

const BASE_DIRS = ["inbox", "outbox", "verified"];

function ensureDirs() {
  for (const dir of BASE_DIRS) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

function saveTxToOutbox(signedTx: object): string {
  ensureDirs();
  const filename = path.join(
    "outbox",
    `tx_${Date.now()}_${Math.random().toString(16).slice(2)}.json`
  );
  fs.writeFileSync(filename, JSON.stringify(signedTx, null, 2), "utf-8");
  return filename;
}

function loadInbox(): object[] {
  ensureDirs();
  const files = fs.readdirSync("inbox").filter(f => f.endsWith(".json"));
  return files.map(f => {
    const content = fs.readFileSync(path.join("inbox", f), "utf-8");
    return JSON.parse(content);
  });
}

function moveToVerified(filename: string) {
  ensureDirs();
  const src = path.join("inbox", filename);
  const dest = path.join("verified", filename);
  fs.renameSync(src, dest);
}

module.exports = {
  ensureDirs,
  saveTxToOutbox,
  loadInbox,
  moveToVerified
};
