import test from "node:test";
import assert from "node:assert/strict";
import {
  createClearedProviderSessionState,
  fetchProviderProfileState,
  restoreProviderSessionState,
  synchronizeProviderProfileUpdate,
} from "../src/utils/providerSession.js";

const account = { id: "provider-1", role: "business", name: "Asha", phone: "111" };
const profile = { _id: "profile-1", businessName: "Asha Fitness" };

test("restores an authenticated provider account and profile", async () => {
  const result = await restoreProviderSessionState({
    token: "token",
    getCurrentProvider: async () => account,
    getProviderProfile: async () => profile,
  });
  assert.deepEqual(result, { provider: account, token: "token", providerProfile: profile, profileError: "" });
});

test("keeps an authenticated provider when profile lookup returns 404", async () => {
  const result = await restoreProviderSessionState({
    token: "token",
    getCurrentProvider: async () => account,
    getProviderProfile: async () => { throw Object.assign(new Error("Provider profile not found"), { status: 404 }); },
  });
  assert.equal(result.provider, account);
  assert.equal(result.providerProfile, null);
  assert.equal(result.profileError, "");
});

test("rejects invalid or expired authentication", async () => {
  await assert.rejects(
    restoreProviderSessionState({
      token: "expired",
      getCurrentProvider: async () => { throw Object.assign(new Error("Authentication token expired"), { status: 401 }); },
      getProviderProfile: async () => profile,
    }),
    (error) => error.status === 401,
  );
});

test("preserves account state and exposes profile server failure", async () => {
  const result = await restoreProviderSessionState({
    token: "token",
    getCurrentProvider: async () => account,
    getProviderProfile: async () => { throw Object.assign(new Error("Failed to fetch provider profile"), { status: 500 }); },
  });
  assert.equal(result.provider, account);
  assert.equal(result.providerProfile, null);
  assert.equal(result.profileError, "Failed to fetch provider profile");
});

test("successful login profile hydration uses the same profile loader", async () => {
  const result = await fetchProviderProfileState("new-token", async (token) => {
    assert.equal(token, "new-token");
    return profile;
  });
  assert.deepEqual(result, { providerProfile: profile, profileError: "" });
});

test("profile update synchronizes account fields without discarding account state", () => {
  const result = synchronizeProviderProfileUpdate(account, {
    user: { name: "Asha Updated", phone: "222" },
    providerProfile: { ...profile, bio: "Updated" },
  });
  assert.deepEqual(result.provider, { ...account, name: "Asha Updated", phone: "222" });
  assert.equal(result.providerProfile.bio, "Updated");
  assert.equal(result.profileError, "");
});

test("logout state clears account, profile, token, and profile error", () => {
  assert.deepEqual(createClearedProviderSessionState(), {
    provider: null,
    providerProfile: null,
    token: null,
    profileError: "",
  });
});
