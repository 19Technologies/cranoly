"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SystemBars, SystemBarsStyle } from "@capacitor/core";
import { getVault, vault } from "@/lib/store";
import { getUI, setUI } from "@/lib/ui";
import { isApp } from "@/lib/native";

/**
 * Android app behaviour: the back button closes what's open, then goes back, and leaves the app
 * from Home; the status bar icons follow the theme.
 */
export default function NativeBridge() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isApp()) return;
    let remove: (() => void) | undefined;
    let live = true;
    import("@capacitor/app").then(async ({ App }) => {
      const handle = await App.addListener("backButton", () => {
        const ui = getUI();
        if (ui.explain) return setUI({ explain: null });
        if (ui.newWords) return setUI({ newWords: null });
        if (ui.addWord) return setUI({ addWord: null });
        if (ui.onboarding) return setUI({ onboarding: false });
        if (ui.palette) return setUI({ palette: null });
        if (ui.sheet) return setUI({ sheet: null });
        if (ui.mobileLeft || ui.mobileRight) return setUI({ mobileLeft: false, mobileRight: false });
        // Home is where the app starts, so back from Home leaves it. Other tabs go back to Home.
        if (pathname === "/home") return App.minimizeApp();
        if (pathname.startsWith("/flashcards/study")) return router.back();
        if (pathname === "/") return getVault().workspace.historyIndex > 0 ? vault.go(-1) : router.push("/notes");
        router.push("/home");
      });
      if (live) remove = () => handle.remove();
      else handle.remove();
    });
    return () => {
      live = false;
      remove?.();
    };
  }, [pathname, router]);

  useEffect(() => {
    if (!isApp()) return;
    const root = document.documentElement;
    // Paper is light, so the status bar needs dark icons; Graphite is the other way round.
    const apply = () =>
      SystemBars.setStyle({ style: root.dataset.theme === "graphite" ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(() => {});
    apply();
    const watch = new MutationObserver(apply);
    watch.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => watch.disconnect();
  }, []);

  return null;
}
