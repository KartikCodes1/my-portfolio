// Checks that the contact notification email escapes visitor input. Run: pnpm check:email
// (Node strips the TypeScript types from the imported file itself; no build step needed.)
import assert from "node:assert/strict";
import { renderContactEmail } from "../src/lib/contact-email.ts";

const brand = { ownerName: "Kartik Parmar", initials: "KP", siteHost: "www.kartikcodes.io", siteUrl: "https://www.kartikcodes.io" };
const hostile = {
  name: "<script>alert(1)</script> Eve",
  email: 'eve"onmouseover="x@example.com',
  company: "<img src=x onerror=alert(1)>",
  topics: ["Backend system or API", "<i>Full-stack web app</i>"],
  message: "First line\n<b>not bold</b>\r\nThird line",
};

const { subject, html, text } = renderContactEmail(hostile, brand, new Date("2026-09-17T10:00:00Z"));

assert.ok(!html.includes("<script>"), "script tag must be escaped");
assert.ok(!html.includes("<img src=x"), "img tag must be escaped");
assert.ok(!html.includes("<b>not bold</b>"), "message markup must be escaped");
assert.ok(!html.includes('"onmouseover="'), "quotes in the email must not break out of attributes");
assert.ok(html.includes("&lt;script&gt;"), "escaped name is still shown");
assert.ok(html.includes("First line<br>&lt;b&gt;not bold&lt;/b&gt;<br>Third line"), "newlines become <br>");
assert.ok(!/[\r\n]/.test(subject), "subject is a single line");
assert.ok(subject.startsWith("Backend system or API and 1 more from"), "subject summarises multiple topics");
assert.ok(!html.includes("<i>Full-stack web app</i>") && html.includes("&lt;i&gt;Full-stack web app&lt;/i&gt;"), "each topic is escaped");
assert.ok(text.includes("Topics: Backend system or API, <i>Full-stack web app</i>"), "plain text lists all topics");
const noTopics = renderContactEmail({ ...hostile, topics: [] }, brand);
assert.ok(noTopics.subject.startsWith("New message from") && !noTopics.html.includes(">Topic"), "no topics: generic subject and no topic row");
assert.ok(text.includes("<b>not bold</b>"), "plain-text version keeps the original characters");
assert.ok(html.includes("17 Sept 2026") || html.includes("17 Sep 2026"), "timestamp is formatted in IST");

console.log("contact email checks passed");
