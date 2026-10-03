import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Netlify serves Admin and Provider direct routes through the SPA entry point", async () => {
  const config = await readFile(new URL("../netlify.toml", import.meta.url), "utf8");

  assert.match(config, /publish\s*=\s*"dist"/);
  assert.match(config, /from\s*=\s*"\/\*"/);
  assert.match(config, /to\s*=\s*"\/index\.html"/);
  assert.match(config, /status\s*=\s*200/);
});
