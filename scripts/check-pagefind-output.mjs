import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const pagefindDir = join("public", "pagefind");
const requiredFiles = [
  "pagefind-entry.json",
  "pagefind-ui.js",
  "pagefind-ui.css",
  "pagefind-worker.js",
  "wasm.unknown.pagefind",
];

async function assertFileExists(file) {
  const filePath = join(pagefindDir, file);
  const info = await stat(filePath).catch(() => null);

  if (!info?.isFile() || info.size === 0) {
    throw new Error(`Missing or empty Pagefind output: ${filePath}`);
  }

  return info.size;
}

for (const file of requiredFiles) {
  await assertFileExists(file);
}

const entryPath = join(pagefindDir, "pagefind-entry.json");
const entry = JSON.parse(await readFile(entryPath, "utf8"));
const pageCount = Object.values(entry.languages || {}).reduce(
  (total, language) => total + (language.page_count || 0),
  0,
);

if (pageCount <= 0) {
  throw new Error(`Pagefind output has no indexed pages: ${entryPath}`);
}

console.log(`Validated Pagefind output with ${pageCount} indexed pages.`);
