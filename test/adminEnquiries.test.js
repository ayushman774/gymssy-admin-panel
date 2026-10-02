import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ENQUIRY_INTENT_OPTIONS, ENQUIRY_STATUS_OPTIONS, ENQUIRY_TARGET_OPTIONS, formatEnquiryDate } from "../src/utils/adminEnquiry.js";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Admin Enquiries routes use the existing Admin protected route", async () => {
  const source = await read("src/routes/AppRoutes.jsx");
  assert.match(source, /path="\/admin\/enquiries"[\s\S]*?<ProtectedRoute>[\s\S]*?<AdminLayout title="Enquiries">/);
  assert.match(source, /path="\/admin\/enquiries\/:id"[\s\S]*?<ProtectedRoute>[\s\S]*?<AdminLayout title="Enquiry Details">/);
  const adminRoute = source.slice(source.indexOf('path="/admin/enquiries"'), source.indexOf('path="/admin/enquiries/:id"'));
  assert.doesNotMatch(adminRoute, /ProviderProtectedRoute/);
});

test("Admin sidebar exposes the global Enquiries inbox", async () => {
  const source = await read("src/components/admin/AdminSidebar.jsx");
  assert.match(source, /label: "Enquiries", to: "\/admin\/enquiries"/);
});

test("Admin enquiry service is read-only and uses the centralized authenticated client", async () => {
  const source = await read("src/services/adminEnquiryService.js");
  assert.match(source, /apiRequest/); assert.match(source, /\/api\/admin\/enquiries/); assert.match(source, /\/summary/); assert.match(source, /encodeURIComponent/);
  assert.doesNotMatch(source, /method: "(?:POST|PUT|PATCH|DELETE)"/);
  assert.match(source, /true\)/);
});

test("Admin inbox provides backend URL filters, summary, paging, and operational states", async () => {
  const source = await read("src/pages/admin/AdminEnquiries.jsx");
  for (const marker of ["useSearchParams", "getAdminEnquirySummary", "status", "intent", "assignment", "targetType", "search", "limit: PAGE_SIZE", "No enquiries have been submitted yet.", "No enquiries match these filters.", "Unable to load enquiries", "Retry", "No provider assigned"]) assert.match(source, new RegExp(marker.replaceAll(".", "\\.")));
  assert.match(source, /next\.set\("page", "1"\)/); assert.match(source, /pagination\?\.pages > 1/); assert.doesNotMatch(source, /fake|demo lead|sample enquiry/i);
});

test("Admin detail renders snapshots, contexts, diagnostics, and no lifecycle mutation", async () => {
  const source = await read("src/pages/admin/AdminEnquiryDetail.jsx");
  for (const marker of ["mailto:", "tel:", "membershipName", "className", "Historical Enquiry Listing", "Current listing availability", "Ownership changed", "No provider assigned", "Opening this record does not mark it viewed", "Lifecycle status can only be advanced"]) assert.match(source, new RegExp(marker));
  assert.doesNotMatch(source, /updateAdminEnquiryStatus|Mark Contacted|Close Enquiry/i);
});

test("Admin filter constants match the shared backend contract", () => {
  assert.deepEqual(ENQUIRY_STATUS_OPTIONS, ["submitted", "viewed", "contacted", "closed"]);
  assert.deepEqual(ENQUIRY_INTENT_OPTIONS, ["general", "membership", "class", "trial", "training", "consultation"]);
  assert.deepEqual(ENQUIRY_TARGET_OPTIONS, ["gym", "trainer", "nutritionist"]);
  assert.equal(formatEnquiryDate(null), "—");
});

test("Admin Dashboard adds only a compact backend-derived enquiry summary", async () => {
  const source = await read("src/pages/dashboard/AdminDashboard.jsx");
  assert.match(source, /getAdminEnquirySummary/); assert.match(source, /enquirySummary\.submitted/); assert.match(source, /enquirySummary\.unassigned/); assert.match(source, /to="\/admin\/enquiries"/);
});
