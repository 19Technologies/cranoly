"use client";

import { useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import MarkdownView from "@/components/MarkdownView";
import TryEditor from "@/components/TryEditor";
import { CALLOUTS } from "@/lib/callouts";
import { cardExamples, languageOf } from "@/lib/languages";
import { useVault } from "@/lib/store";

interface Row {
  /** What you type. */
  type: string;
  /** What it does, when that isn't obvious from how it looks. */
  note?: string;
  /** The button or shortcut that types it for you. */
  how?: string;
  /** Draw card lines the way notes show them (Hallo → Hello). */
  cards?: boolean;
}

interface Section {
  title: string;
  intro?: string;
  rows: Row[];
  /** Anything that follows the rows. */
  more?: ReactNode;
}

/** Every callout type, drawn as it looks, with the other names that give the same box. */
function CalloutTypes() {
  return (
    <div className="fmt-callouts">
      <h3>All the callout types</h3>
      <p className="fmt-intro">Put any of these between [! and ]. Names on the same box look the same.</p>
      <ul>
        {CALLOUTS.map((c) => (
          <li key={c.type}>
            <MarkdownView content={`> [!${c.type}] ${c.type}`} interactive={false} />
            {c.also.length > 0 && <span className="fmt-also">also {c.also.join(", ")}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Rows({ rows }: { rows: Row[] }) {
  return (
    <>
      <div className="fmt-head" aria-hidden>
        <span>You type</span>
        <span>You get</span>
      </div>
      <ul className="fmt-rows">
        {rows.map((r) => (
          <li key={r.type} className="fmt-row">
            <pre className="fmt-type">{r.type}</pre>
            <MarkdownView className="fmt-get" content={r.type} cards={r.cards} interactive={false} />
            {(r.note || r.how) && (
              <p className="fmt-note">
                {r.note}
                {r.note && r.how && " "}
                {r.how && <span className="fmt-how">{r.how}</span>}
              </p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

/** Everything you can write in a note, each with what it turns into, plus a box to try it in. */
export default function FormattingPage() {
  const { settings } = useVault();
  const lang = languageOf(settings.learning);
  const ex = cardExamples(settings.learning, settings.native);
  const [resetKey, setResetKey] = useState(0);
  const sample = [
    `## My ${lang.name} words`,
    `**${ex.one.front}** means *${ex.one.back}*.`,
    `- [ ] Learn ${ex.both.front}`,
    ex.both.code,
    "",
  ].join("\n");

  const sections: Section[] = [
    {
      title: "Text",
      rows: [
        { type: "**bold**", how: "⌘B, or B above the keyboard." },
        { type: "*italic*", how: "⌘I, or I above the keyboard." },
        { type: "~~crossed out~~" },
        { type: "==highlight==", note: "Also makes a fill-the-gap card.", how: "== above the keyboard." },
        { type: "`code`" },
      ],
    },
    {
      title: "Headings",
      rows: [
        { type: "# Big title" },
        { type: "## Section", how: "The heading button above the keyboard." },
        { type: "### Smaller section" },
      ],
    },
    {
      title: "Lists",
      rows: [
        { type: "- Bullet\n- Another bullet" },
        { type: "1. First\n2. Second" },
        { type: "- [ ] To do\n- [x] Done", how: "The checklist button above the keyboard." },
        { type: "- Main point\n\t- Indented point", how: "Tab, or the indent button above the keyboard." },
      ],
    },
    {
      title: "Quotes, lines and code",
      rows: [
        { type: "> An example sentence" },
        {
          type: `> [!tip]\n> **${ex.one.front}** means *${ex.one.back}*.`,
          note: "A callout: a quote that becomes a coloured box. The word between [! and ] picks the colour and icon.",
        },
        {
          type: "> [!warning] False friends\n> Some words look like English but mean something else.",
          note: "Text after the type becomes the title.",
        },
        {
          type: `> [!question]- ${ex.question.front}\n> ${ex.question.back}`,
          note: "A - after the type folds it shut, so you can test yourself. Tap the title to open it. A + folds it but starts open.",
        },
        { type: "---", note: "A line across the note." },
        { type: "```\nA block of code\n```" },
      ],
      more: <CalloutTypes />,
    },
    {
      title: "Links and tags",
      rows: [
        { type: "[[Verbs]]", note: "Links to another note. If it doesn’t exist yet, pick Create note.", how: "Link in the selection bar." },
        { type: "[Wiktionary](https://www.wiktionary.org)", note: "A link to a website." },
        { type: "#grammar", note: "A tag, for grouping notes by topic." },
      ],
    },
    {
      title: "Flashcards",
      intro: "Any line can be a card. Answer first in practice flips any card the other way.",
      rows: [
        {
          type: ex.one.code,
          note: `One card. Shows ${ex.one.front}, you answer ${ex.one.back}.`,
          how: "Flashcard in the selection bar, or ＋.",
          cards: true,
        },
        {
          type: ex.both.code,
          note: "Two cards. One asks the meaning, one asks the word.",
          how: "Or turn on Practise both ways in ＋.",
          cards: true,
        },
        { type: ex.gap.code, note: `Fill the gap. Hides ${ex.gap.hidden}, you fill it in.`, cards: true },
        { type: ex.question.code, note: "A long question. The line with ? splits it from the answer.", cards: true },
        { type: ex.question.code.replace("\n?\n", "\n??\n"), note: "With ?? the long question works both ways.", cards: true },
        { type: "#flashcards/Travel", note: "Puts the note’s cards in a deck called Travel." },
      ],
    },
  ];

  return (
    <div className="page page-narrow fmt-page">
      <header className="page-header">
        <p className="eyebrow">
          <span className="dot" /> Help
        </p>
        <h1>Formatting guide</h1>
        <p className="page-lede">
          Notes use Markdown, a few symbols that turn into headings, lists and more. Type them yourself, or use the buttons
          above the keyboard on your phone.
        </p>
      </header>

      <section className="card-panel">
        <div className="card-panel-head">
          <h2>Try it</h2>
          <button className="btn" onClick={() => setResetKey((k) => k + 1)}>
            <RotateCcw size={14} /> Start over
          </button>
        </div>
        <p className="fmt-intro">Type here and watch the formatting appear. Nothing you type here is saved.</p>
        <TryEditor sample={sample} resetKey={resetKey} />
      </section>

      {sections.map((s) => (
        <section key={s.title} className="card-panel">
          <div className="card-panel-head">
            <h2>{s.title}</h2>
          </div>
          {s.intro && <p className="fmt-intro">{s.intro}</p>}
          <Rows rows={s.rows} />
          {s.more}
        </section>
      ))}
    </div>
  );
}
