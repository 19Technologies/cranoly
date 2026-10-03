// Callouts: "> [!tip]" turns a quote into a coloured box with an icon (Obsidian's types and names).
// Colours and icons live in globals.css under [data-callout]. The formatting guide and the Format
// prompt list these, so a type added here shows up in both.

export const CALLOUTS: Array<{ type: string; also: string[]; main?: boolean }> = [
  // The eight everyone uses, each with its own colour and icon (GitHub's five alerts, plus question, example, quote).
  { type: "note", also: [], main: true },
  { type: "tip", also: ["hint"], main: true },
  { type: "important", also: [], main: true },
  { type: "warning", also: ["attention"], main: true },
  { type: "caution", also: [], main: true },
  { type: "question", also: ["help", "faq"], main: true },
  { type: "example", also: [], main: true },
  { type: "quote", also: ["cite"], main: true },
  // The rest of Obsidian's.
  { type: "abstract", also: ["summary", "tldr"] },
  { type: "info", also: [] },
  { type: "todo", also: [] },
  { type: "success", also: ["check", "done"] },
  { type: "failure", also: ["fail", "missing"] },
  { type: "danger", also: ["error"] },
  { type: "bug", also: [] },
];

/** "> [!type]+ Title": the type, how it folds (+ open, - shut, "" doesn't fold) and the title. */
export const CALLOUT_RE = /^\[!([\w-]+)\]([+-]?)[ \t]*([^\n]*)/;

/** The title a callout gets when you don't write one: its type, capitalised. */
export const calloutTitle = (type: string) => type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
