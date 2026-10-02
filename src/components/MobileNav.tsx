"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, House, Layers, Plus, Search } from "lucide-react";
import { useVault } from "@/lib/store";
import { setUI, useUI } from "@/lib/ui";
import { useSlider } from "@/lib/useSlider";
import { haptic } from "@/lib/native";

/** Phone tab bar: the four places you go, with ＋ (add a word) in the middle. The orange pill slides between tabs. */
export default function MobileNav() {
  const { editorFocused } = useUI();
  const { workspace } = useVault();
  const pathname = usePathname();
  const tabs = [
    { href: "/home", label: "Home", icon: <House size={21} />, active: pathname === "/home" },
    { href: "/notes", label: "Notes", icon: <FileText size={21} />, active: pathname === "/notes" || pathname === "/" },
    null,
    { href: "/flashcards", label: "Practice", icon: <Layers size={21} />, active: pathname.startsWith("/flashcards") },
    { href: "/search", label: "Search", icon: <Search size={21} />, active: pathname === "/search" },
  ];
  // Practice gets the whole screen.
  const studying = pathname.startsWith("/flashcards/study");
  const current = tabs.find((t) => t?.active)?.href ?? null;
  const nav = useSlider<HTMLElement>(".mnav-tab.is-active .mnav-icon", `${current}|${studying}`);
  if (studying) return null;

  return (
    <nav ref={nav} className={`mobile-nav has-slider${editorFocused ? " is-hidden" : ""}`} aria-label="Navigation">
      <span className="slider-pill" aria-hidden />
      {tabs.map((t) =>
        t ? (
          <Link
            key={t.href}
            href={t.href}
            className={`mnav-tab${t.active ? " is-active" : ""}`}
            aria-current={t.active ? "page" : undefined}
            onClick={() => !t.active && haptic()}
          >
            <span className="mnav-icon">{t.icon}</span>
            <span>{t.label}</span>
          </Link>
        ) : (
          <button
            key="add"
            className="mnav-add"
            aria-label="Add a word"
            onClick={() => setUI({ addWord: { noteId: pathname === "/" ? workspace.active : null, mode: "word" } })}
          >
            <Plus size={26} strokeWidth={2.4} />
          </button>
        ),
      )}
    </nav>
  );
}
