"use client";

import { useEffect, useRef } from "react";

const RADIUS = 170; // pointer influence, CSS px
const PUSH = 7; // max displacement away from the pointer, CSS px
const DOT = 2; // dot diameter, CSS px (scaled by DPR through the transform)
const BASE_ALPHA = 0.1;
const HOT_ALPHA = 0.85;
const BASE_RGB = [237, 237, 234] as const;
const ACCENT_RGB = [201, 239, 110] as const;
const WAVE_ALPHA = 0.05;
const WAVE_LENGTH = 560; // measured along the diagonal, CSS px
const WAVE_PERIOD = 9000; // ms
const EASE_MS = 120; // time constant of each dot's lerp toward its target
const IDLE_FRAME_MS = 33; // once everything has settled only the wave moves: ~30fps is plenty

const TAU = Math.PI * 2;
const WAVE_K = TAU / (WAVE_LENGTH * Math.SQRT2);
const BASE_FILL = `rgb(${BASE_RGB.join(" ")})`;

// Strongest toward the top right, fading out at the edges and behind the headline (lower left).
const MASK = "radial-gradient(ellipse 80% 75% at 78% 26%, #000 0%, rgb(0 0 0 / 0.55) 42%, transparent 80%)";

/** Decorative dot grid behind the hero. Listens to pointer events on the parent section. */
export function HeroField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.closest("section");
    const ctx = canvas?.getContext("2d");
    if (!canvas || !section || !ctx) return;

    // One still frame for reduced motion, and on touch-only devices: with no cursor to react to,
    // the idle wave would just spend battery.
    const still = matchMedia("(prefers-reduced-motion: reduce), (hover: none)");

    let width = 0;
    let height = 0;
    let dpr = 1;
    let count = 0;
    let homeX = new Float32Array(0);
    let homeY = new Float32Array(0);
    let offX = new Float32Array(0);
    let offY = new Float32Array(0);
    let heat = new Float32Array(0);

    let pointerX = 0; // client coordinates; converted to canvas space per frame so scrolling stays correct
    let pointerY = 0;
    let pointerActive = false;

    let raf = 0;
    let lastDraw = 0;
    let settled = true;
    let onScreen = true;

    function layout() {
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);

      const spacing = window.innerWidth < 640 ? 22 : 28;
      const cols = Math.floor(width / spacing) + 1;
      const rows = Math.floor(height / spacing) + 1;
      // Center the grid and keep home positions on whole CSS pixels so resting dots stay crisp.
      const x0 = Math.round((width - (cols - 1) * spacing) / 2);
      const y0 = Math.round((height - (rows - 1) * spacing) / 2);

      count = cols * rows;
      homeX = new Float32Array(count);
      homeY = new Float32Array(count);
      offX = new Float32Array(count);
      offY = new Float32Array(count);
      heat = new Float32Array(count);
      for (let r = 0, i = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++, i++) {
          homeX[i] = x0 + c * spacing;
          homeY[i] = y0 + r * spacing;
        }
      }
    }

    /** Steps every dot toward its target and paints. Returns true while anything is still moving. */
    function draw(now: number, dt: number, animated: boolean) {
      // Frame-rate independent easing; static frames snap straight to rest.
      const k = animated ? 1 - Math.exp(-dt / EASE_MS) : 1;
      const tracking = animated && pointerActive;
      let px = 0;
      let py = 0;
      if (tracking) {
        const rect = canvas!.getBoundingClientRect();
        px = pointerX - rect.left;
        py = pointerY - rect.top;
      }
      const phase = (now / WAVE_PERIOD) * TAU;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, width, height);
      ctx!.fillStyle = BASE_FILL;
      let tinted = false;
      let moving = tracking;

      for (let i = 0; i < count; i++) {
        const hx = homeX[i];
        const hy = homeY[i];

        let tx = 0;
        let ty = 0;
        let th = 0;
        if (tracking) {
          const dx = hx - px;
          const dy = hy - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < RADIUS * RADIUS) {
            const d = Math.sqrt(d2);
            const f = 1 - d / RADIUS;
            th = f * f * (3 - 2 * f); // smoothstep falloff
            const push = d > 0 ? (PUSH * th) / d : 0;
            tx = dx * push;
            ty = dy * push;
          }
        }

        offX[i] += (tx - offX[i]) * k;
        offY[i] += (ty - offY[i]) * k;
        heat[i] += (th - heat[i]) * k;
        const h = heat[i];
        if (!moving && (Math.abs(offX[i]) > 0.02 || Math.abs(offY[i]) > 0.02 || h > 0.002)) moving = true;

        let alpha = BASE_ALPHA + h * (HOT_ALPHA - BASE_ALPHA);
        if (animated) {
          const s = 0.5 + 0.5 * Math.sin((hx + hy) * WAVE_K - phase);
          alpha += WAVE_ALPHA * s * s * s; // cubed: narrow bands instead of a uniform shimmer
        }

        // Only the dots closest to the pointer pick up the accent.
        const mix = h > 0.45 ? (h - 0.45) / 0.55 : 0;
        if (mix > 0.01) {
          const r = BASE_RGB[0] + (ACCENT_RGB[0] - BASE_RGB[0]) * mix;
          const g = BASE_RGB[1] + (ACCENT_RGB[1] - BASE_RGB[1]) * mix;
          const b = BASE_RGB[2] + (ACCENT_RGB[2] - BASE_RGB[2]) * mix;
          ctx!.fillStyle = `rgb(${r | 0} ${g | 0} ${b | 0})`;
          tinted = true;
        } else if (tinted) {
          ctx!.fillStyle = BASE_FILL;
          tinted = false;
        }

        // Squares instead of arcs: they look identical at 2px and are much cheaper to fill.
        const size = DOT + h * 0.75;
        ctx!.globalAlpha = alpha > 1 ? 1 : alpha;
        ctx!.fillRect(hx + offX[i] - size / 2, hy + offY[i] - size / 2, size, size);
      }

      ctx!.globalAlpha = 1;
      return moving;
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (settled && now - lastDraw < IDLE_FRAME_MS) return;
      const dt = Math.min(now - lastDraw, 100);
      lastDraw = now;
      settled = !draw(now, dt, true);
    }

    function sync() {
      const run = onScreen && !document.hidden && !still.matches;
      if (run && !raf) {
        lastDraw = performance.now() - IDLE_FRAME_MS;
        raf = requestAnimationFrame(frame);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      if (still.matches) draw(0, 0, false);
    }

    const onPointer = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerActive = true;
      settled = false;
    };
    // Fires for mouse exits and after a touch ends or turns into a scroll.
    const onPointerLeave = () => {
      pointerActive = false;
    };

    const resizeObserver = new ResizeObserver(() => {
      layout();
      // Resizing clears the canvas; repaint now so there is no blank frame.
      draw(performance.now(), 0, !still.matches);
    });
    try {
      // Also fires when only the DPR changes (e.g. window dragged to another display).
      resizeObserver.observe(canvas, { box: "device-pixel-content-box" });
    } catch {
      resizeObserver.observe(canvas);
    }

    const intersectionObserver = new IntersectionObserver((entries) => {
      // Entries are queued oldest first; after a fast fling only the last one is current.
      onScreen = entries[entries.length - 1].isIntersecting;
      sync();
    });
    intersectionObserver.observe(section);

    section.addEventListener("pointermove", onPointer, { passive: true });
    section.addEventListener("pointerdown", onPointer, { passive: true });
    section.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", sync);
    still.addEventListener("change", sync);

    sync();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      section.removeEventListener("pointermove", onPointer);
      section.removeEventListener("pointerdown", onPointer);
      section.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", sync);
      still.removeEventListener("change", sync);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
      style={{ maskImage: MASK }}
    />
  );
}
