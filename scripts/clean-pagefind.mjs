import { readdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

const pagefindOutput = resolve("public", "pagefind");

await Promise.all([
  rm(join(pagefindOutput, "index"), { recursive: true, force: true }),
  rm(join(pagefindOutput, "fragment"), { recursive: true, force: true }),
  rm(join(pagefindOutput, "pagefind-entry.json"), { force: true }),
]);

let files = [];
try {
  files = await readdir(pagefindOutput);
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }
}

await Promise.all(
  files
    .filter((file) => file.endsWith(".pf_meta"))
    .map((file) => rm(join(pagefindOutput, file), { force: true })),
);
