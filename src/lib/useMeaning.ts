"use client";
// Looks a word up while you type (after a short pause), for adding cards without any syntax.
import { useEffect, useState } from "react";
import type { Language } from "./languages";
import { lookup, shortMeaning, withArticle } from "./lookup";

export interface Meaning {
  word: string;
  status: "idle" | "loading" | "found" | "missing" | "offline";
  /** The word as it should go on the card, e.g. "der Hund". */
  front?: string;
  meaning?: string;
}

export function useMeaning(word: string, lang: Language, enabled: boolean): Meaning {
  const w = word.trim();
  const [state, setState] = useState<Meaning>({ word: "", status: "idle" });
  useEffect(() => {
    if (!enabled || w.length < 2) return;
    let live = true;
    const timer = setTimeout(() => {
      setState({ word: w, status: "loading" });
      lookup(w, lang).then(
        (r) => live && setState(r ? { word: w, status: "found", front: withArticle(r, lang), meaning: shortMeaning(r) } : { word: w, status: "missing" }),
        () => live && setState({ word: w, status: "offline" }),
      );
    }, 450);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [w, lang, enabled]);
  return state.word === w ? state : { word: w, status: "idle" };
}
