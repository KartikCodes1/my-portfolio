/** Fire-and-forget status message, rendered by AppShell's live region. */
export const TOAST_EVENT = "ui:toast";

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent<string>(TOAST_EVENT, { detail: message }));
}
