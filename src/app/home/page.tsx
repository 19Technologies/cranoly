"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Flame, Play, Plus, Settings, Volume2 } from "lucide-react";
import { useCards, useVault, vault } from "@/lib/store";
import { languageOf } from "@/lib/languages";
import { forLanguage, notSeenLately, streak } from "@/lib/study";
import { parseDay, useHour, useToday } from "@/lib/useToday";
import { friendlyCard, plainLine } from "@/lib/links";
import { say } from "@/lib/smart";
import { titleOf } from "@/lib/vault";
import { setUI } from "@/lib/ui";

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Home: one clear thing to do (practise), and a way back to what you were doing. */
export default function HomePage() {
  const router = useRouter();
  const { notes, settings, activity, seen, workspace } = useVault();
  const every = useCards();
  const cards = useMemo(() => forLanguage(every, notes, settings), [every, notes, settings]);
  const several = settings.languages.length > 1;
  const today = useToday();
  const hour = useHour();
  const [revealed, setRevealed] = useState(false);
  const lang = languageOf(settings.learning);
  const greeting = hour === null ? "" : lang.greet?.[hour < 12 ? 0 : hour < 18 ? 1 : 2] ?? "Hello";

  const stale = useMemo(() => (today ? notSeenLately(cards, seen, parseDay(today)) : []), [cards, seen, today]);
  const count = Math.min(10, stale.length || cards.length);
  const minutes = Math.max(1, Math.round(count * 0.3));
  const days = today ? streak(activity, parseDay(today)) : 0;
  const doneToday = !!today && (activity[today] ?? 0) > 0;

  const byRecent = useMemo(() => Object.values(notes).sort((a, b) => b.updated - a.updated), [notes]);
  const last = (workspace.active && notes[workspace.active]) || byRecent[0];
  const recent = byRecent.filter((n) => n.id !== last?.id).slice(0, 3);
  const word = useMemo(() => {
    const simple = cards.filter((c) => (c.kind === "basic" || c.kind === "reversed") && c.front.length <= 40 && !c.front.includes("\n"));
    return today && simple.length ? simple[hash(today) % simple.length] : null;
  }, [cards, today]);

  const open = (id: string) => {
    vault.openNote(id);
    router.push("/");
  };
  const preview = (content: string) =>
    content.split("\n").map((l) => friendlyCard(plainLine(l))).find((l) => l && !/^#{1,6}\s|^#\p{L}/u.test(l))?.slice(0, 90) ?? "Empty note";

  return (
    <div className="page home">
      <header className="home-head">
        <div>
          {several ? (
            <div className="home-langs" role="radiogroup" aria-label="Language">
              {settings.languages.map((c) => (
                <button
                  key={c}
                  role="radio"
                  aria-checked={c === settings.learning}
                  className={c === settings.learning ? "is-on" : ""}
                  onClick={() => vault.updateSettings({ learning: c })}
                >
                  {languageOf(c).name}
                </button>
              ))}
            </div>
          ) : (
            <p className="home-lang">{lang.name}</p>
          )}
          <h1>{greeting}!</h1>
        </div>
        <Link href="/settings" className="icon-btn home-gear" aria-label="Settings">
          <Settings size={19} />
        </Link>
      </header>

      {cards.length ? (
        <section className="home-practice">
          <div>
            <h2>{doneToday ? "Practise a little more" : "Practise now"}</h2>
            <p>
              {count} {count === 1 ? "card" : "cards"} · about {minutes} min
            </p>
          </div>
          <Link
            href={`/flashcards/study?${stale.length ? "smart=stale" : "shuffle=1"}&limit=10${several ? `&lang=${settings.learning}` : ""}`}
            className="btn btn-primary btn-lg"
          >
            <Play size={17} /> Start
          </Link>
        </section>
      ) : (
        <section className="home-practice">
          <div>
            <h2>Add your first word</h2>
            <p>Type a {lang.name} word and Cranoly fills in the meaning.</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => setUI({ addWord: { noteId: null, mode: "word" } })}>
            <Plus size={17} /> Add a word
          </button>
        </section>
      )}

      {(days > 0 || doneToday) && (
        <p className="home-streak">
          <Flame size={17} /> {days > 0 ? `${days}-day streak` : ""}
          {doneToday && <span>{days > 0 ? " · " : ""}practised today</span>}
        </p>
      )}

      {last && (
        <section className="home-section">
          <h3>Continue</h3>
          <button className="home-note" onClick={() => open(last.id)}>
            <span>
              <b>{titleOf(last.path)}</b>
              <small>{preview(last.content)}</small>
            </span>
            <ArrowRight size={18} />
          </button>
        </section>
      )}

      {word && (
        <section className="home-section">
          <h3>Word of the day</h3>
          <div className="home-word">
            <button className="home-word-card" onClick={() => setRevealed((r) => !r)} aria-label={revealed ? "Hide the meaning" : "Show the meaning"}>
              <b>{plainLine(word.front)}</b>
              <span>{revealed ? plainLine(word.back) : "Tap to see the meaning"}</span>
            </button>
            <button className="icon-btn" onClick={() => say(word.front, lang)} aria-label="Hear it">
              <Volume2 size={19} />
            </button>
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="home-section">
          <h3>Recent notes</h3>
          {recent.map((n) => (
            <button key={n.id} className="home-note is-small" onClick={() => open(n.id)}>
              <span>
                <b>{titleOf(n.path)}</b>
                <small>{preview(n.content)}</small>
              </span>
            </button>
          ))}
          <Link href="/notes" className="home-all">
            All notes <ArrowRight size={15} />
          </Link>
        </section>
      )}
    </div>
  );
}
