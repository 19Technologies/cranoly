"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, FileText, Plus, Search } from "lucide-react";
import { getVault, useVault, vault } from "@/lib/store";
import { setUI, useUI } from "@/lib/ui";
import { useSlider } from "@/lib/useSlider";
import { haptic } from "@/lib/native";
import { canGo, go, placePath, useTrail } from "@/lib/trail";

const exists = (id: string) => !!getVault().notes[id];

/**
 * Phone bar: ‹ back, Notes, ＋ (add a word), Search, › forward. Icons only. The orange pill slides
 * between Notes and Search; the arrows walk through the places you've been, like a browser.
 */
export default function MobileNav() {
  const { editorFocused } = useUI();
  const { workspace } = useVault();
  const pathname = usePathname();
  const router = useRouter();
  // -1 until the page is live (the server has no trail): the arrows start grey, as the server drew them.
  const live = useTrail() >= 0;
  const tabs = [
    { href: "/notes", label: "Notes", icon: <FileText size={21} />, active: pathname === "/notes" || pathname === "/" },
    { href: "/search", label: "Search", icon: <Search size={21} />, active: pathname === "/search" },
  ];
  // Practice gets the whole screen.
  const studying = pathname.startsWith("/flashcards/study");
  const current = tabs.find((t) => t.active)?.href ?? null;
  const nav = useSlider<HTMLElement>(".mnav-tab.is-active .mnav-icon", `${current}|${studying}`);
  if (studying) return null;

  const step = (delta: -1 | 1) => {
    haptic();
    go(delta, {
      here: placePath(pathname, window.location.search),
      push: (path) => router.push(path),
      openNote: (id) => vault.openNote(id),
      showFolder: (folder) => vault.showFolder(folder),
      exists,
    });
  };
  const tab = (t: (typeof tabs)[number]) => (
    <Link
      key={t.href}
      href={t.href}
      className={`mnav-tab${t.active ? " is-active" : ""}`}
      aria-label={t.label}
      title={t.label}
      aria-current={t.active ? "page" : undefined}
      onClick={() => !t.active && haptic()}
    >
      <span className="mnav-icon">{t.icon}</span>
    </Link>
  );

  return (
    <nav ref={nav} className={`mobile-nav has-slider${editorFocused ? " is-hidden" : ""}`} aria-label="Navigation">
      <span className="slider-pill" aria-hidden />
      <button className="mnav-arrow is-back" aria-label="Back" title="Back" disabled={!live || !canGo(-1, exists)} onClick={() => step(-1)}>
        <ChevronLeft size={24} strokeWidth={2.3} />
      </button>
      {tab(tabs[0])}
      <button
        className="mnav-add"
        aria-label="Add a word"
        title="Add a word"
        onClick={() => setUI({ addWord: { noteId: pathname === "/" ? workspace.active : null, mode: "word" } })}
      >
        <Plus size={23} strokeWidth={2.4} />
      </button>
      {tab(tabs[1])}
      <button className="mnav-arrow is-forward" aria-label="Forward" title="Forward" disabled={!live || !canGo(1, exists)} onClick={() => step(1)}>
        <ChevronRight size={24} strokeWidth={2.3} />
      </button>
    </nav>
  );
}
