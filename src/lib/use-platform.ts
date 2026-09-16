import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
const getServerSnapshot = () => false;

/** true on Apple platforms (⌘ shortcuts). Server render and hydration assume non-Apple. */
export function useIsApple() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
