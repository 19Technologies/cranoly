"use client";
import { useSyncExternalStore } from "react";

const PHONE = "(max-width: 820px)";

function subscribe(onChange: () => void) {
  const mq = matchMedia(PHONE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** True on phone-sized screens (the one-screen-at-a-time layout). False while rendering on the server. */
export function usePhone() {
  return useSyncExternalStore(subscribe, () => matchMedia(PHONE).matches, () => false);
}
