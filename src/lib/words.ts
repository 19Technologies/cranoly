// "Cards from anything", all on the device: word lists become flashcards, and any text can be
// mined for words you don't have cards for yet.
import type { Card } from "./cards";
import type { Language } from "./languages";
import { bodyOf, frontmatterOf } from "./properties";

const BULLET = /^\s*(?:[-*+]\s+|\d+[.)]\s+)/;

/** "Hund = dog", "Hund - dog", "Hund: dog", "Hund<tab>dog" (and long dashes) → ["Hund", "dog"]. */
export function pairOf(line: string): [string, string] | null {
  if (/\s:{2,3}(\s|$)/.test(line) || /^\s*(#|>|```)/.test(line)) return null;
  const body = line.replace(BULLET, "");
  const m = /^(.+?)(?:\t+|\s+[-–—=]\s+|\s*[–—]\s*|\s*=\s*|:\s+|\s*;\s*)(.+)$/.exec(body);
  if (!m) return null;
  const front = m[1].trim();
  const back = m[2].trim();
  const words = (s: string) => s.split(/\s+/).length;
  if (!front || !back || front.length > 60 || back.length > 80 || words(front) > 6 || words(back) > 10) return null;
  if (/[.!?]$/.test(front)) return null; // a sentence, not a word
  return [front, back];
}

/** How many lines of `text` are word pairs, if it looks like a word list (0 if it doesn't). */
export function wordListSize(text: string) {
  // "title: Hold On" in a properties block reads like a pair, but isn't one.
  const lines = bodyOf(text).split("\n").filter((l) => l.trim());
  if (lines.length < 2) return 0;
  const pairs = lines.filter((l) => pairOf(l)).length;
  return pairs >= 2 && pairs / lines.length >= 0.7 ? pairs : 0;
}

/** Rewrite each word-pair line as a flashcard, leaving other lines alone. */
export function toCards(text: string) {
  const fm = frontmatterOf(text);
  const head = fm ? text.slice(0, fm.length) : "";
  return head + text.slice(head.length)
    .split("\n")
    .map((line) => {
      const pair = pairOf(line);
      return pair ? `${pair[0]} :: ${pair[1]}` : line;
    })
    .join("\n");
}

/** Every word already on a card, lower-cased, so new-word lists skip them. */
export function knownWords(cards: Card[]) {
  const known = new Set<string>();
  for (const c of cards) {
    for (const m of `${c.front} ${c.back}`.matchAll(/\p{L}[\p{L}\p{M}'’-]*/gu)) known.add(m[0].toLowerCase());
  }
  return known;
}

/** Words in `text` worth learning: not on a card yet, not very common, each once, in reading order. */
export function newWords(text: string, known: Set<string>, lang: Language, max = 40) {
  const common = new Set(lang.common);
  const prose = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`\n]*`/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/(?<=^|\s)#[\p{L}_][\p{L}\p{N}_/-]*/gu, " ")
    .split("\n")
    .map((line) => line.replace(/\s:{2,3}(\s.*)?$/, "")) // cards: only the front is in the language being learned
    .join("\n");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of prose.matchAll(/\p{L}[\p{L}\p{M}'’-]*/gu)) {
    const word = m[0].replace(/['’-]+$/, "");
    const key = word.toLowerCase();
    if (word.length < 2 || seen.has(key) || common.has(key) || known.has(key)) continue;
    seen.add(key);
    out.push(word);
    if (out.length >= max) break;
  }
  return out;
}
