// Format: hand a note to Claude, ChatGPT or Gemini with a ready prompt, then paste the answer back.
// Cranoly runs no AI itself. The note leaves the device only when the learner taps the button,
// and only to the assistant they picked.
import type { Assistant } from "./vault";

export type FormatTask = "tidy" | "arrange" | "summary" | "cards";

export const TASKS: Array<{ id: FormatTask; label: string; ask: (native: string) => string }> = [
  {
    id: "tidy",
    label: "Tidy up",
    ask: () => "Tidy it up: add clear headings and turn runs of items into lists. Keep my wording.",
  },
  {
    id: "arrange",
    label: "Arrange by topic",
    ask: () => "Arrange it by topic, so related parts sit together under headings.",
  },
  {
    id: "summary",
    label: "Add a short summary",
    ask: (native) => `Add a summary of two or three sentences at the top, written in ${native}.`,
  },
  {
    id: "cards",
    label: "Make flashcards",
    ask: (native) =>
      `At the end, under a heading "Cards", add one line for each word or phrase worth learning, written as "word :: meaning" with the meaning in ${native}.`,
  },
];

export const ASSISTANTS: Array<{ id: Assistant; name: string; home: string; link?: (prompt: string) => string }> = [
  { id: "claude", name: "Claude", home: "https://claude.ai/new", link: (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}` },
  { id: "chatgpt", name: "ChatGPT", home: "https://chatgpt.com/", link: (p) => `https://chatgpt.com/?q=${encodeURIComponent(p)}` },
  // Gemini has no link that fills in a prompt, so it goes by clipboard only.
  { id: "gemini", name: "Gemini", home: "https://gemini.google.com/app" },
];

/** Longer links get cut off by some browsers and assistants; then the prompt goes by clipboard only. */
export const MAX_LINK = 6000;

export const assistantOf = (id: string | undefined) => ASSISTANTS.find((a) => a.id === id) ?? ASSISTANTS[0];

/** Where to send the learner: the assistant with the prompt filled in when the link isn't too long, else its home page. */
export function openUrl(assistant: (typeof ASSISTANTS)[number], prompt: string) {
  const link = assistant.link?.(prompt);
  return link && link.length <= MAX_LINK ? { url: link, filled: true } : { url: assistant.home, filled: false };
}

export function buildPrompt(
  note: { title: string; content: string },
  tasks: FormatTask[],
  lang: { learning: string; native: string },
) {
  const asks = TASKS.filter((t) => tasks.includes(t.id)).map((t) => `- ${t.ask(lang.native)}`);
  return [
    `Please format this note from my language notebook. I'm learning ${lang.learning}, and my own language is ${lang.native}.`,
    "",
    "What to do:",
    ...asks,
    "",
    "Rules:",
    "- Keep every language exactly as I wrote it. Don't translate or correct anything unless a task above asks for it.",
    '- Keep these exactly as they are: flashcard lines with "::" or ":::", lines that are only "?" or "??", ==highlights==, [[links]] and #tags.',
    "- Use only this Markdown: # headings, **bold**, *italic*, ~~strikethrough~~, - lists, 1. numbered lists, - [ ] checklists, > quotes, --- lines and `code`.",
    "- Reply with only the formatted note, in Markdown. No introduction, no explanation, no code block around it.",
    "",
    `The note is called "${note.title}":`,
    "",
    note.content.trim(),
  ].join("\n");
}

/** The pasted answer, without the code fence or chatty lines assistants like to add. */
export function cleanResult(text: string) {
  let t = text.replace(/\r\n?/g, "\n").trim();
  // "Here is your formatted note:" and friends, on a line of their own at the top.
  t = t.replace(/^(?:sure|certainly|of course|here(?:'s| is| are))\b[^\n]*:[ \t]*\n+/i, "");
  // "Let me know if…" at the bottom.
  t = t.replace(/\n+(?:let me know|i hope|feel free|hope this)[^\n]*$/i, "");
  // The whole note wrapped in a code block (```markdown … ```).
  t = /^```[\w-]*\n([\s\S]*?)\n?```$/.exec(t.trim())?.[1] ?? t;
  return `${t.trim()}\n`;
}
