// "Ask my notes", on the device: a question is matched against every paragraph in the vault
// (BM25 ranking with light stemming) and the best passages come back as answers.
import { Note, titleOf } from "./vault";
import { plainLine } from "./links";

export interface Passage {
  note: Note;
  line: number;
  text: string;
  score: number;
}

const QUESTION_WORDS =
  "what which who whom whose when where why how did do does done is are was were be can could should would will shall about tell show find me my mine i we our you your the a an of to in on for with and or there that this these those any some all learn learned learnt learning know knew note notes wrote write written say said mean means meaning was welche welcher welches wer wie wo wann warum habe hast hat ich mir mich über zu der die das ein eine und oder ist sind".split(
    " ",
  );

/** Lower-case, drop accents, and trim common endings so "datives" finds "Dativ". */
export function stem(word: string) {
  const w = word.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  for (const suffix of ["ing", "ed", "es", "en", "er", "e", "s"]) {
    if (w.length - suffix.length >= 4 && w.endsWith(suffix)) return w.slice(0, -suffix.length);
  }
  return w;
}

const tokens = (text: string) => [...text.matchAll(/\p{L}[\p{L}\p{M}\p{N}'’-]*|\p{N}+/gu)].map((m) => m[0]);

/** Question → search terms. Empty when the question has nothing specific to look for. */
export function questionTerms(question: string, extraStopWords: string[] = []) {
  const stop = new Set([...QUESTION_WORDS, ...extraStopWords]);
  return [...new Set(tokens(question).filter((t) => !stop.has(t.toLowerCase()) && t.length > 1).map(stem))];
}

/** Paragraphs, plus list items and flashcard lines on their own. */
function passages(note: Note) {
  const out: Array<{ line: number; text: string }> = [];
  let block: string[] = [];
  let start = 0;
  let fence = false;
  const flush = () => {
    if (block.length) out.push({ line: start, text: block.join(" ") });
    block = [];
  };
  note.content.split("\n").forEach((raw, i) => {
    if (/^\s*```/.test(raw)) fence = !fence;
    const line = plainLine(raw);
    const single = /^\s*([-*+]|\d+[.)])\s/.test(raw) || /\s:{2,3}\s/.test(raw) || /^#{1,6}\s/.test(raw);
    if (!line || fence || single) {
      flush();
      if (line && !fence) out.push({ line: i, text: line.replace(/^#{1,6}\s+/, "") });
      return;
    }
    if (!block.length) start = i;
    block.push(line);
  });
  flush();
  return out;
}

export function ask(question: string, notes: Note[], extraStopWords: string[] = [], limit = 3): Passage[] {
  const terms = questionTerms(question, extraStopWords);
  if (!terms.length) return [];
  const docs = notes.flatMap((note) =>
    passages(note).map((p) => ({ ...p, note, stems: tokens(p.text).map(stem), title: tokens(titleOf(note.path)).map(stem) })),
  );
  if (!docs.length) return [];
  const matches = (s: string, t: string) => s === t || (s.length >= 5 && t.length >= 5 && (s.startsWith(t) || t.startsWith(s)));
  const avg = docs.reduce((n, d) => n + d.stems.length, 0) / docs.length;
  const df = new Map(terms.map((t) => [t, docs.filter((d) => d.stems.some((s) => matches(s, t))).length]));
  const k1 = 1.2;
  const b = 0.75;
  return docs
    .map((d) => {
      let score = 0;
      let covered = 0;
      for (const t of terms) {
        const tf = d.stems.filter((s) => matches(s, t)).length;
        const inTitle = d.title.some((s) => matches(s, t));
        if (tf || inTitle) covered++;
        if (inTitle) score += 0.8;
        if (!tf) continue;
        const n = df.get(t)!;
        const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
        score += (idf * tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * d.stems.length) / avg));
      }
      // Passages that answer more of the question beat ones that repeat one word.
      return { note: d.note, line: d.line, text: d.text, score: score * (covered / terms.length) };
    })
    .filter((p) => p.score > 0)
    .sort((a, b2) => b2.score - a.score)
    .slice(0, limit);
}

/** Does this search look like a question rather than keywords? */
export const isQuestion = (q: string) => /\?\s*$/.test(q) || q.trim().split(/\s+/).length >= 4;
