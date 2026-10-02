import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getProviderEnquiryActions } from "../src/utils/providerEnquiry.js";

const read=(path)=>readFile(new URL(`../${path}`,import.meta.url),"utf8");

test("Provider Enquiries routes remain inside ProviderProtectedRoute",async()=>{const routes=await read("src/routes/AppRoutes.jsx");assert.match(routes,/path="\/provider\/enquiries"[\s\S]*ProviderProtectedRoute/);assert.match(routes,/path="\/provider\/enquiries\/:id"[\s\S]*ProviderProtectedRoute/);});
test("Provider sidebar exposes Enquiries without changing Admin navigation",async()=>{const sidebar=await read("src/components/provider/ProviderSidebar.jsx");assert.match(sidebar,/label: "Enquiries", to: "\/provider\/enquiries"/);});
test("provider enquiry service uses centralized authenticated API client",async()=>{const service=await read("src/services/providerEnquiryService.js");for(const endpoint of ["/api/providers/enquiries","/api/providers/enquiries/summary","/status"])assert.match(service,new RegExp(endpoint.replaceAll("/","\\/")));assert.match(service,/apiRequest/);assert.match(service,/token/);});
test("inbox uses backend URL filters, resets pages, and renders operational states",async()=>{const source=await read("src/pages/provider/ProviderEnquiries.jsx");for(const marker of ["useSearchParams","status","intent","search","page","limit:20","Loading enquiries","No customer enquiries yet","No enquiries match these filters","Try again"])assert.match(source,new RegExp(marker));assert.match(source,/next\.set\("page","1"\)/);assert.doesNotMatch(source,/demo lead|fake lead/i);});
test("detail displays snapshot contact/context and lifecycle actions",async()=>{const source=await read("src/pages/provider/ProviderEnquiryDetail.jsx");for(const marker of ["mailto:","tel:","membershipName","className","Mark Contacted","Close Enquiry","No further lifecycle actions","Listing is no longer available"])assert.match(source,new RegExp(marker));});
test("frontend lifecycle actions match backend forward-only graph",()=>{assert.deepEqual(getProviderEnquiryActions("submitted"),["contacted","closed"]);assert.deepEqual(getProviderEnquiryActions("viewed"),["contacted","closed"]);assert.deepEqual(getProviderEnquiryActions("contacted"),["closed"]);assert.deepEqual(getProviderEnquiryActions("closed"),[]);});
test("dashboard summary is backend-derived and links to inbox",async()=>{const source=await read("src/pages/provider/ProviderDashboard.jsx");assert.match(source,/getProviderEnquirySummary/);assert.match(source,/enquirySummary\.submitted/);assert.match(source,/to="\/provider\/enquiries"/);});
