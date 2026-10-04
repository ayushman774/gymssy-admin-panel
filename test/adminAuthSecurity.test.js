import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public Admin registration redirects to login and has no registration implementation", async () => {
  const [routes, login, service, context] = await Promise.all([
    read("src/routes/AppRoutes.jsx"),
    read("src/pages/auth/AdminLogin.jsx"),
    read("src/services/authService.js"),
    read("src/context/AuthContext.jsx"),
  ]);

  assert.match(routes, /path="\/admin\/register" element={<Navigate to="\/admin\/login" replace \/>}/);
  assert.doesNotMatch(routes, /import AdminRegister/);
  assert.doesNotMatch(login, /Create admin account|Need an admin account/);
  assert.doesNotMatch(service, /registerAdmin|create-admin|adminSecret/);
  assert.doesNotMatch(context, /registerAdmin/);
});

test("Admin login and protected Admin routes remain available", async () => {
  const [routes, login] = await Promise.all([
    read("src/routes/AppRoutes.jsx"),
    read("src/pages/auth/AdminLogin.jsx"),
  ]);

  assert.match(routes, /path="\/admin\/login" element={<AdminLogin \/>}/);
  assert.match(routes, /<ProtectedRoute>/);
  assert.match(login, /await login\(values\.email\.trim\(\), values\.password\)/);
});
