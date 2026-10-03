// Callouts: "> [!tip]" turns a quote into a coloured box with an icon (Obsidian's types and names).
// Colours and icons live in globals.css under [data-callout]. The formatting guide and the Format
// prompt list these, so a type added here shows up in both.

export const CALLOUTS: Array<{ type: string; also: string[] }> = [
  { type: "note", also: [] },
  { type: "abstract", also: ["summary", "tldr"] },
  { type: "info", also: [] },
  { type: "todo", also: [] },
  { type: "tip", also: ["hint", "important"] },
  { type: "success", also: ["check", "done"] },
  { type: "question", also: ["help", "faq"] },
  { type: "warning", also: ["caution", "attention"] },
  { type: "failure", also: ["fail", "missing"] },
  { type: "danger", also: ["error"] },
  { type: "bug", also: [] },
  { type: "example", also: [] },
  { type: "quote", also: ["cite"] },
];

/** "> [!type]+ Title": the type, how it folds (+ open, - shut, "" doesn't fold) and the title. */
export const CALLOUT_RE = /^\[!([\w-]+)\]([+-]?)[ \t]*([^\n]*)/;

/** The title a callout gets when you don't write one: its type, capitalised. */
export const calloutTitle = (type: string) => type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
