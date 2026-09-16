import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// The mark is authored on icon.svg's 32-unit grid and scaled up, so both icons stay identical.
const u = size.width / 32;

// One arm of the ">" chevron: a fully rounded bar, which matches the SVG's round caps and join.
// Arm runs from (9,11) to (13.5,16) on the grid: length ~6.73 + 2.5 stroke, angle ~48deg.
function Arm({ centerY, angle }: { centerY: number; angle: number }) {
  const length = 9.23 * u;
  const thickness = 2.5 * u;
  return (
    <div
      style={{
        position: "absolute",
        left: 11.25 * u - length / 2,
        top: centerY * u - thickness / 2,
        width: length,
        height: thickness,
        borderRadius: thickness,
        background: "#ededea",
        transform: `rotate(${angle}deg)`,
      }}
    />
  );
}

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", background: "#0a0a0b" }}>
        <Arm centerY={13.5} angle={48} />
        <Arm centerY={18.5} angle={-48} />
        <div
          style={{
            position: "absolute",
            left: 18 * u,
            top: 9 * u,
            width: 6 * u,
            height: 14 * u,
            borderRadius: 1.5 * u,
            background: "#c9ef6e",
          }}
        />
      </div>
    ),
    size,
  );
}
