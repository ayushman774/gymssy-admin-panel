import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Admin Dashboard labels the active-listing metric by its actual isActive semantics", async () => {
  const dashboard = await read("src/pages/dashboard/AdminDashboard.jsx");
  assert.match(dashboard, /description="Listings currently marked active"/);
  assert.doesNotMatch(dashboard, /description="Currently live on the marketplace"/);
});
