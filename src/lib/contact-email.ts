/**
 * The notification email Kartik receives for each contact form message.
 * Styled like the site, but with inline styles and tables because email clients ignore
 * stylesheets, CSS variables and web fonts. No imports, so `pnpm check:email` can run it directly in Node.
 */

export type ContactMessage = { name: string; email: string; company: string; topics: string[]; message: string };
export type EmailBrand = { ownerName: string; initials: string; siteHost: string; siteUrl: string };

// Mirrors the tokens in globals.css.
const C = {
  bg: "#0a0a0b",
  surface: "#111113",
  line: "#232326",
  lineStrong: "#2e2e32",
  fg: "#ededea",
  muted: "#a3a3a0",
  subtle: "#808084",
  accent: "#c9ef6e",
  accentInk: "#0a0a0b",
  accentSoft: "#1d2216",
};
const SANS = "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export function renderContactEmail(msg: ContactMessage, brand: EmailBrand, sentAt = new Date()) {
  // Header values must stay on one line.
  const topicSummary =
    msg.topics.length === 0 ? "New message" : msg.topics.length === 1 ? msg.topics[0] : `${msg.topics[0]} and ${msg.topics.length - 1} more`;
  const subject = `${topicSummary} from ${msg.name}`.replace(/\s+/g, " ").slice(0, 150);
  const when = `${sentAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST`;
  const firstName = msg.name.split(/\s+/)[0];

  const lines = [`Name: ${msg.name}`, `Email: ${msg.email}`];
  if (msg.company) lines.push(`Company: ${msg.company}`);
  if (msg.topics.length) lines.push(`${msg.topics.length === 1 ? "Topic" : "Topics"}: ${msg.topics.join(", ")}`);
  lines.push("", msg.message, "", `Sent ${when} from the contact form on ${brand.siteHost}. Reply to this email to answer ${firstName} directly.`);
  const text = lines.join("\n");

  const e = {
    name: escapeHtml(msg.name),
    firstName: escapeHtml(firstName),
    email: escapeHtml(msg.email),
    company: escapeHtml(msg.company),
    message: escapeHtml(msg.message).replace(/\r?\n/g, "<br>"),
    preheader: escapeHtml(msg.message.replace(/\s+/g, " ").slice(0, 110)),
    replyHref: escapeHtml(`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${subject}`)}`),
  };

  const label = (text: string) =>
    `<td valign="top" style="padding:10px 16px 10px 0;width:92px;font-family:${MONO};font-size:11px;line-height:18px;letter-spacing:0.08em;text-transform:uppercase;color:${C.subtle};">${text}</td>`;
  const row = (name: string, value: string) =>
    `<tr>${label(name)}<td valign="top" style="padding:10px 0;font-family:${SANS};font-size:15px;line-height:20px;color:${C.fg};word-break:break-word;">${value}</td></tr>`;
  const divider = `<tr><td colspan="2" style="height:1px;line-height:1px;font-size:1px;background:${C.line};">&nbsp;</td></tr>`;

  const details = [
    row("Name", e.name),
    row("Email", `<a href="${e.replyHref}" style="color:${C.fg};text-decoration:underline;text-decoration-color:${C.lineStrong};">${e.email}</a>`),
    msg.company ? row("Company", e.company) : "",
    msg.topics.length
      ? row(
          msg.topics.length === 1 ? "Topic" : "Topics",
          msg.topics
            .map(
              (topic) =>
                `<span style="display:inline-block;margin:0 6px 6px 0;padding:3px 10px;border:1px solid #4d5c2c;border-radius:6px;background:${C.accentSoft};font-size:14px;color:${C.fg};">${escapeHtml(topic)}</span>`,
            )
            .join(""),
        )
      : "",
  ]
    .filter(Boolean)
    .join(divider);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${e.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.bg}" style="background:${C.bg};">
<tr><td align="center" style="padding:32px 16px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

<tr><td style="padding:0 2px 18px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="font-family:${SANS};font-size:14px;font-weight:600;color:${C.fg};">
      <span style="display:inline-block;padding:5px 6px;border:1px solid ${C.lineStrong};border-radius:6px;font-family:${MONO};font-size:11px;font-weight:400;line-height:11px;vertical-align:middle;">${escapeHtml(brand.initials)}</span>
      <span style="vertical-align:middle;">&nbsp;${escapeHtml(brand.ownerName)}</span>
    </td>
    <td align="right" style="font-family:${MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${C.subtle};">05 &middot; Contact</td>
  </tr></table>
</td></tr>

<tr><td bgcolor="${C.surface}" style="background:${C.surface};border:1px solid ${C.line};border-radius:12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="padding:12px 24px;border-bottom:1px solid ${C.line};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="font-family:${MONO};font-size:12px;color:${C.muted};">
          <span style="display:inline-block;width:6px;height:6px;border-radius:3px;background:${C.accent};vertical-align:middle;"></span>&nbsp; New message
        </td>
        <td align="right" style="font-family:${MONO};font-size:12px;color:${C.subtle};">POST /contact</td>
      </tr></table>
    </td></tr>

    <tr><td style="padding:28px 24px 8px;">
      <p style="margin:0;font-family:${MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${C.subtle};">${when}</p>
      <h1 style="margin:12px 0 0;font-family:${SANS};font-size:26px;line-height:30px;font-weight:600;letter-spacing:-0.02em;color:${C.fg};">${e.name} sent you a message</h1>
    </td></tr>

    <tr><td style="padding:16px 24px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${details}</table>
    </td></tr>

    <tr><td style="padding:16px 24px 0;">
      <p style="margin:0 0 10px;font-family:${MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${C.subtle};">Message</p>
      <div style="padding:16px 18px;border:1px solid ${C.line};border-radius:8px;background:${C.bg};font-family:${SANS};font-size:15px;line-height:24px;color:${C.fg};word-break:break-word;">${e.message}</div>
    </td></tr>

    <tr><td style="padding:24px 24px 28px;">
      <a href="${e.replyHref}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:${C.accent};font-family:${SANS};font-size:15px;font-weight:600;color:${C.accentInk};text-decoration:none;">Reply to ${e.firstName} &rarr;</a>
    </td></tr>
  </table>
</td></tr>

<tr><td style="padding:20px 2px 0;font-family:${MONO};font-size:11px;line-height:18px;color:${C.subtle};">
  Sent from the contact form on <a href="${escapeHtml(brand.siteUrl)}" style="color:${C.muted};text-decoration:none;">${escapeHtml(brand.siteHost)}</a>.<br>
  Replying to this email goes straight to ${e.firstName}.
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, text, html };
}
