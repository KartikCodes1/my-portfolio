/**
 * Tiny event bus between independent client islands (header, palette, terminal, work list).
 * ponytail: window events instead of a React context, since the islands share no render tree.
 */

export type UiEvent = "ui:palette-open" | "ui:terminal-open" | "ui:xray-toggle";

export const emit = (name: UiEvent) => window.dispatchEvent(new Event(name));

/** Scrolls to a section and moves focus there for keyboard/screen-reader users. */
export function goToSection(id: string) {
  const el = document.getElementById(id);
  // Sections only exist on the home page; from anywhere else (the 404 page), go there.
  if (!el) {
    // A full document load is intended: this is only reached off the home page, and there is no router outside components.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    location.href = `/#${id}`;
    return;
  }
  history.replaceState(null, "", id === "top" ? location.pathname : `#${id}`);
  el.scrollIntoView({ block: "start" });
  el.focus({ preventScroll: true });
}

/** Opens a case study in the Work section (Work listens for this hash). */
export function openProject(projectId: string) {
  const hash = `#project-${projectId}`;
  if (!document.getElementById(`project-${projectId}-button`)) {
    // Same reasoning as goToSection: a full document load is intended here.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    location.href = `/${hash}`;
    return;
  }
  // Re-assigning the current hash fires no hashchange, so a collapsed case study wouldn't reopen.
  if (location.hash === hash) window.dispatchEvent(new HashChangeEvent("hashchange"));
  else location.hash = hash;
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
