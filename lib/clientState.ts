import { useSyncExternalStore } from "react";

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );
}

const neverChanges = () => () => {};
let webgl: boolean | null = null;

function readWebGL() {
  if (webgl === null) {
    try {
      const probe = document.createElement("canvas");
      webgl = !!(probe.getContext("webgl2") || probe.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

/** null enquanto no servidor — o canvas só monta depois da hidratação. */
export function useWebGL() {
  return useSyncExternalStore(neverChanges, readWebGL, () => null);
}
