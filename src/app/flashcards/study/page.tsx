"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Check, Repeat2, RotateCcw, Shuffle, Volume2, X,
} from "lucide-react";
import { languageOf } from "@/lib/languages";
import { say } from "@/lib/smart";
import { haptic } from "@/lib/native";
import MarkdownView from "@/components/MarkdownView";
import { Card, inDeck } from "@/lib/cards";
import { formatDuration, fromRecentNotes, notSeenLately, shuffled } from "@/lib/study";
import { parseDay, useToday } from "@/lib/useToday";
import { titleOf } from "@/lib/vault";
import { getVault, useCards, useVault, vault } from "@/lib/store";
import { getUI, setUI } from "@/lib/ui";

const KIND_LABEL: Record<Card["kind"], string> = {
  basic: "Card",
  reversed: "Two-way",
  multiline: "Question",
  cloze: "Fill the gap",
};

function Session({ cards: initial, title, shuffle, startWithBack, limit }: {
  cards: Card[];
  title: string;
  shuffle: boolean;
  startWithBack: boolean;
  /** Study only this many (a quick session from Home). Shuffled decks pick them at random. */
  limit: number;
}) {
  const router = useRouter();
  const { notes, settings } = useVault();
  const [cards] = useState(() => {
    if (!limit) return initial;
    return (shuffle ? shuffled(initial) : initial).slice(0, limit);
  });
  const [order, setOrder] = useState(() => (shuffle ? shuffled(cards) : cards));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reversed, setReversed] = useState(startWithBack);
  const [done, setDone] = useState<{ elapsed: number; seen: number } | null>(null);
  const [dx, setDx] = useState(0);
  const [bump, setBump] = useState<"next" | "prev" | null>(null);
  const seen = useRef(new Set<string>());
  const started = useRef(0);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    started.current = Date.now();
  }, []);

  const card = order[index];
  const front = reversed ? card?.back : card?.front;
  const back = reversed ? card?.front : card?.back;

  const flip = useCallback(() => {
    if (!card) return;
    if (!flipped && !seen.current.has(card.id)) {
      seen.current.add(card.id);
      vault.logStudy();
      vault.markSeen(card.id);
    }
    haptic();
    setFlipped(!flipped);
  }, [card, flipped]);

  const move = useCallback(
    (delta: 1 | -1) => {
      if (delta === 1 && index === order.length - 1) {
        haptic("success");
        setDone({ elapsed: Date.now() - started.current, seen: seen.current.size });
        return;
      }
      if (delta === -1 && index === 0) return;
      setFlipped(false);
      setBump(delta === 1 ? "next" : "prev");
      setIndex((i) => i + delta);
    },
    [index, order.length],
  );

  const restart = useCallback(
    (mix: boolean) => {
      setOrder(mix ? shuffled(cards) : cards);
      setIndex(0);
      setFlipped(false);
      setDone(null);
      seen.current = new Set();
      started.current = Date.now();
    },
    [cards],
  );

  /** Back to wherever practice was started from (Home, Practice or a note). */
  const leave = useCallback(() => {
    if (window.history.length > 1) router.back();
    else router.push("/flashcards");
  }, [router]);

  const openSource = useCallback(() => {
    if (!card) return;
    vault.openNote(card.noteId);
    vault.setMode("edit");
    setUI({ pendingLine: card.line });
    router.push("/");
  }, [card, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (getUI().palette || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea")) return;
      const onButton = !!el.closest("button, a");
      if ((e.key === " " || e.key === "Enter") && !onButton && !done) {
        e.preventDefault();
        flip();
      } else if (e.key === "ArrowRight" && !done) move(1);
      else if (e.key === "ArrowLeft" && !done) move(-1);
      else if (e.key === "s") restart(true);
      else if (e.key === "r" && !done) setReversed((r) => !r);
      else if (e.key === "o" && !done) openSource();
      else if (e.key === "Escape") leave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip, move, restart, openSource, leave, done]);

  if (done) {
    return (
      <div className="study-done">
        <div className="hero-art done-art" aria-hidden>
          <span className="bubble b1">Super!</span>
          <span className="bubble b2">Toll gemacht</span>
          <span className="bubble b3">Weiter so!</span>
          <span className="bubble b4">Prima!</span>
        </div>
        <div className="done-badge">
          <Check size={34} strokeWidth={2.5} />
        </div>
        <h1>Deck complete</h1>
        <p>
          You went through <b>{order.length}</b> {order.length === 1 ? "card" : "cards"} in{" "}
          <b>{formatDuration(done.elapsed)}</b>
          {done.seen < order.length && <> and revealed {done.seen} answers</>}.
        </p>
        <div className="btn-row">
          <button className="btn" onClick={() => restart(false)}>
            <RotateCcw size={14} /> Study again
          </button>
          <button className="btn" onClick={() => restart(true)}>
            <Shuffle size={14} /> Shuffle &amp; go again
          </button>
          <button className="btn btn-primary" onClick={leave}>
            Done
          </button>
        </div>
      </div>
    );
  }

  const source = notes[card.noteId];
  // Card fronts are in the language being learned, answers in your own (except fill-the-gap cards).
  const learning = languageOf(settings.learning);
  const own = card.kind === "cloze" ? learning : languageOf(settings.native);
  const frontLang = reversed ? own : learning;
  const backLang = reversed ? learning : own;
  const short = (s: string) => s.replace(/[*_=`[\]]/g, "").length <= 42 && !s.includes("\n");

  return (
    <div className="study">
      <header className="study-bar">
        <button className="btn btn-ghost" onClick={leave}>
          <X size={16} /> Close
        </button>
        <div className="study-title">
          <span>{title}</span>
          <small>
            {index + 1} / {order.length}
          </small>
        </div>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={() => restart(true)} title="Shuffle (S)">
            <Shuffle size={15} /> <span className="hide-sm">Shuffle</span>
          </button>
          <button
            className={`btn btn-ghost${reversed ? " is-on" : ""}`}
            onClick={() => setReversed((r) => !r)}
            aria-pressed={reversed}
            title="Show the answer side first (R)"
          >
            <Repeat2 size={15} /> <span className="hide-sm">Reverse</span>
          </button>
        </div>
      </header>
      <div className="progress" aria-hidden>
        <span style={{ width: `${((index + (flipped ? 1 : 0.5)) / order.length) * 100}%` }} />
      </div>

      <div className="study-stage">
        <div
          key={card.id + String(reversed)}
          className={`flip-wrap${bump ? ` enter-${bump}` : ""}`}
          style={{ transform: dx ? `translateX(${dx}px) rotate(${dx / 28}deg)` : undefined, transition: dx ? "none" : undefined }}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest("button, a")) return;
            drag.current = { x: e.clientX, y: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => drag.current && setDx(e.clientX - drag.current.x)}
          onPointerUp={(e) => {
            if (!drag.current) return;
            const d = e.clientX - drag.current.x;
            const dy = e.clientY - drag.current.y;
            drag.current = null;
            setDx(0);
            if (d < -70) move(1);
            else if (d > 70) move(-1);
            else if (Math.abs(d) < 8 && Math.abs(dy) < 8) flip();
          }}
          onPointerCancel={() => {
            drag.current = null;
            setDx(0);
          }}
        >
          <div
            className={`flip-card${flipped ? " is-flipped" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={flipped ? "Answer shown. Press Space to show the question" : "Press Space to reveal the answer"}
          >
            <div className="face face-front">
              <span className="face-kind">{reversed ? "Reversed" : KIND_LABEL[card.kind]}</span>
              <button className="face-say" onClick={() => say(front, frontLang)} aria-label="Hear the question" title="Hear it">
                <Volume2 size={16} />
              </button>
              <div className={`face-content${short(front) ? " is-short" : ""}`}>
                <MarkdownView content={front} interactive={false} />
              </div>
              <span className="face-hint">
                <span className="hint-touch">Tap to flip</span>
                <span className="hint-keys">Tap or press Space to flip</span>
              </span>
            </div>
            <div className="face face-back">
              <span className="face-kind">Answer</span>
              <button className="face-say" onClick={() => say(back, backLang)} aria-label="Hear the answer" title="Hear it">
                <Volume2 size={16} />
              </button>
              {card.kind !== "cloze" && (
                <div className="face-question">
                  <MarkdownView content={front} interactive={false} />
                </div>
              )}
              <div className={`face-content${short(back) ? " is-short" : ""}`}>
                <MarkdownView content={back} interactive={false} />
              </div>
              {source && (
                <button className="face-source" onClick={openSource} title="Open the note (O)">
                  {titleOf(source.path)} <ArrowUpRight size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="study-controls">
        <button className="btn btn-round" onClick={() => move(-1)} disabled={index === 0} aria-label="Previous card">
          <ArrowLeft size={18} />
        </button>
        <button className="btn btn-primary btn-flip" onClick={flip}>
          {flipped ? "Show question" : "Reveal answer"}
        </button>
        <button className="btn btn-round" onClick={() => move(1)} aria-label={index === order.length - 1 ? "Finish" : "Next card"}>
          {index === order.length - 1 ? <Check size={18} /> : <ArrowRight size={18} />}
        </button>
      </div>
      <div className="study-options">
        <button className="chip" onClick={() => restart(true)}>
          <Shuffle size={15} /> Shuffle
        </button>
        <button className={`chip${reversed ? " on" : ""}`} onClick={() => setReversed((r) => !r)} aria-pressed={reversed}>
          <Repeat2 size={15} /> Answer first
        </button>
      </div>
      <p className="study-keys">
        <kbd>Space</kbd> flip <kbd>←</kbd><kbd>→</kbd> move <kbd>S</kbd> shuffle <kbd>R</kbd> reverse <kbd>O</kbd> open note{" "}
        <kbd>Esc</kbd> exit
      </p>
    </div>
  );
}

function StudyRoute() {
  const params = useSearchParams();
  const { notes, settings } = useVault();
  const all = useCards();
  const deck = params.get("deck");
  const noteId = params.get("note");
  const shuffleParam = params.get("shuffle") === "1";
  const smart = params.get("smart");
  const limit = Number(params.get("limit")) || 0;
  const today = useToday();
  // Smart decks are worked out from the moment you start, so studying doesn't shrink the deck under you.
  const [seenAtStart] = useState(() => getVault().seen);

  const { cards, title } = useMemo(() => {
    if (smart === "stale") return { cards: today ? notSeenLately(all, seenAtStart, parseDay(today)) : [], title: "Not seen lately" };
    if (smart === "recent") return { cards: today ? fromRecentNotes(all, notes, parseDay(today)) : [], title: "From this week’s notes" };
    if (noteId) return { cards: all.filter((c) => c.noteId === noteId), title: notes[noteId] ? titleOf(notes[noteId].path) : "Note" };
    if (deck) return { cards: all.filter((c) => inDeck(c, deck)), title: deck.split("/").join(" / ") };
    return { cards: all, title: "All cards" };
  }, [all, deck, noteId, notes, smart, today, seenAtStart]);

  if (smart && !today) return null;

  if (!cards.length) {
    return (
      <div className="study-done">
        <h1>Nothing to study here</h1>
        <p>This deck has no cards. Write a line like <code>Hallo :: Hello</code> in any note to add one.</p>
        <Link href="/flashcards" className="btn btn-primary">
          Back to decks
        </Link>
      </div>
    );
  }

  return (
    <Session
      key={`${deck}|${noteId}|${shuffleParam}|${smart}|${limit}`}
      cards={cards}
      limit={limit}
      title={limit ? "Practice" : title}
      shuffle={shuffleParam || settings.shuffle}
      startWithBack={settings.startWithBack}
    />
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={null}>
      <StudyRoute />
    </Suspense>
  );
}
