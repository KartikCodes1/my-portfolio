import { ImageResponse } from "next/og";
import { links, profile } from "@/content/site";
import { displayUrl } from "@/lib/format";

export const alt = `${profile.name}, ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Colours mirror the tokens in globals.css (satori can't read CSS variables).
const color = {
  bg: "#0a0a0b",
  fg: "#ededea",
  muted: "#a3a3a0",
  subtle: "#808084",
  accent: "#c9ef6e",
  line: "rgba(255, 255, 255, 0.08)",
};

export default function OpengraphImage() {
  const linkedinLabel = displayUrl(links.linkedin);
  // Satori wraps a text node as one block, so the headline is split into words
  // to let the cursor sit right after the last word instead of beside the paragraph.
  const words = profile.headline.split(" ");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 72,
          backgroundColor: color.bg,
          backgroundImage: "radial-gradient(circle at center, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.09) 8%, rgba(255, 255, 255, 0) 9%)",
          backgroundSize: "32px 32px",
          color: color.fg,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 20,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: color.muted,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 10, background: color.accent }} />
          {/* Never availability: a status baked into cached link previews goes stale and can't be corrected. */}
          {profile.focus.join(" · ")}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, lineHeight: 1, letterSpacing: "-0.04em" }}>{profile.name}</div>
          <div style={{ marginTop: 16, fontSize: 36, letterSpacing: "-0.02em", color: color.muted }}>{profile.role}</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              maxWidth: 900,
              marginTop: 40,
              fontSize: 34,
              lineHeight: 1.35,
              letterSpacing: "-0.01em",
              color: "rgba(237, 237, 234, 0.9)",
            }}
          >
            {words.map((word, i) => (
              <span key={i} style={{ marginRight: "0.22em" }}>
                {word}
              </span>
            ))}
            <div style={{ width: 17, height: 36, marginLeft: 2, background: color.accent }} />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: `1px solid ${color.line}`,
            fontSize: 22,
            color: color.subtle,
          }}
        >
          <span>{links.email}</span>
          <span>{linkedinLabel}</span>
        </div>
      </div>
    ),
    size,
  );
}
