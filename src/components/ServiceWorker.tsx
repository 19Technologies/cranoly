"use client";

import { useEffect } from "react";
import { setUI } from "@/lib/ui";
import { isApp } from "@/lib/native";

/** Registers the offline service worker and remembers the browser's install prompt. */
export default function ServiceWorker() {
  useEffect(() => {
    // The Android app already has every file on the device, so it doesn't need the offline cache.
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator && !isApp()) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setUI({ installPrompt: e as InstallPromptEvent });
    };
    const onInstalled = () => setUI({ installPrompt: null });
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  return null;
}

export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
