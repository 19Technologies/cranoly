"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, House, Layers, Plus, Search } from "lucide-react";
import { useVault } from "@/lib/store";
import { setUI, useUI } from "@/lib/ui";

/** Phone tab bar: the four places you go, with ＋ (add a word) in the middle. */
export default function MobileNav() {
  const { editorFocused } = useUI();
  const { workspace } = useVault();
  const pathname = usePathname();
  // Practice gets the whole screen.
  if (pathname.startsWith("/flashcards/study")) return null;

  const tabs = [
    { href: "/home", label: "Home", icon: <House size={21} />, active: pathname === "/home" },
    { href: "/notes", label: "Notes", icon: <FileText size={21} />, active: pathname === "/notes" || pathname === "/" },
    null,
    { href: "/flashcards", label: "Practice", icon: <Layers size={21} />, active: pathname.startsWith("/flashcards") },
    { href: "/search", label: "Search", icon: <Search size={21} />, active: pathname === "/search" },
  ];

  return (
    <nav className={`mobile-nav${editorFocused ? " is-hidden" : ""}`} aria-label="Navigation">
      {tabs.map((t) =>
        t ? (
          <Link key={t.href} href={t.href} className={`mnav-tab${t.active ? " is-active" : ""}`} aria-current={t.active ? "page" : undefined}>
            {t.icon}
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
