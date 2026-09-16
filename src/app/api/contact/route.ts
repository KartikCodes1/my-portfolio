import { contactForm, links, profile } from "@/content/site";

const LIMITS = contactForm.limits;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Emails a contact form submission to Kartik through Resend (https://resend.com/docs/api-reference/emails/send-email).
 * Needs RESEND_API_KEY; CONTACT_FROM optionally overrides the sender (its domain must be verified in Resend).
 * Spam protection is a honeypot, strict validation and a same-origin check. There is no rate limiting;
 * if spam gets through, add a Vercel Firewall rate limit rule for /api/contact.
 */
export async function POST(request: Request) {
  // Browsers always send Origin on POST; only accept submissions made from this site's own pages.
  if (!isSameOrigin(request)) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body: unknown = await request.json().catch(() => null);
  const field = (key: string) => {
    const value = body && typeof body === "object" ? (body as Record<string, unknown>)[key] : undefined;
    return typeof value === "string" ? value.trim() : "";
  };

  // Honeypot: hidden from people, often filled by bots. Pretend it worked so they don't retry.
  if (field("website")) return Response.json({ ok: true });

  const name = field("name");
  const email = field("email");
  const company = field("company");
  const topic = field("topic");
  const message = field("message");

  const valid =
    name.length > 0 &&
    name.length <= LIMITS.name &&
    email.length <= LIMITS.email &&
    EMAIL.test(email) &&
    company.length <= LIMITS.company &&
    message.length > 0 &&
    message.length <= LIMITS.message &&
    (topic === "" || contactForm.topics.includes(topic));
  if (!valid) return Response.json({ error: "Please check the form and try again." }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  // Not configured yet: the form falls back to opening the visitor's email app.
  if (!apiKey) return Response.json({ error: "The contact form isn't configured yet." }, { status: 503 });

  const domain = links.email.split("@")[1];
  const lines = [`Name: ${name}`, `Email: ${email}`];
  if (company) lines.push(`Company: ${company}`);
  if (topic) lines.push(`Topic: ${topic}`);
  lines.push("", message);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM ?? `${profile.name} website <contact@${domain}>`,
        to: links.email,
        reply_to: email,
        // Plain text only, so nothing a visitor types is ever rendered as HTML.
        subject: `${topic || "New message"} from ${name}`.replace(/\s+/g, " ").slice(0, 150),
        text: lines.join("\n"),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("Resend rejected contact email", res.status, await res.text());
      return Response.json({ error: "Couldn't send the message." }, { status: 502 });
    }
  } catch (error) {
    console.error("Resend request failed", error);
    return Response.json({ error: "Couldn't send the message." }, { status: 502 });
  }

  return Response.json({ ok: true });
}

function isSameOrigin(request: Request) {
  try {
    // Throws on a missing or opaque ("null") Origin, which is also a rejection.
    return new URL(request.headers.get("origin") ?? "").host === new URL(request.url).host;
  } catch {
    return false;
  }
}
