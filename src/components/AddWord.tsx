"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, FilePlus2, ListPlus, Loader2, ScanText, Volume2 } from "lucide-react";
import Sheet from "./Sheet";
import Tumble from "./Tumble";
import { haptic } from "@/lib/native";
import { toast, useVault, vault, wordsNoteTitle } from "@/lib/store";
import { useVoiceWarmup } from "@/lib/voices";
import { languageOf } from "@/lib/languages";
import { useMeaning } from "@/lib/useMeaning";
import { pairOf } from "@/lib/words";
import { say } from "@/lib/smart";
import { titleOf } from "@/lib/vault";
import { setUI, useUI } from "@/lib/ui";

const close = () => setUI({ addWord: null });

/** Which note new words go to: the one you're in, or the words note ("My words"). */
function NotePicker({ value, onChange }: { value: string | null; onChange: (id: string | null) => void }) {
  const { notes, settings } = useVault();
  const words = wordsNoteTitle(settings);
  const list = Object.values(notes)
    .filter((n) => n.path !== words)
    .sort((a, b) => titleOf(a.path).localeCompare(titleOf(b.path)));
  return (
    <label className="add-target">
      <span>Save to</span>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">{words}</option>
        {list.map((n) => (
          <option key={n.id} value={n.id}>
            {titleOf(n.path)}
          </option>
        ))}
      </select>
    </label>
  );
}

/** "Practise both ways": also make the card that shows the meaning and asks for the word (saved as ":::"). */
function BothWays({ on, onChange, hint }: { on: boolean; onChange: (on: boolean) => void; hint: ReactNode }) {
  return (
    <label className="add-both">
      <span className="setting-text">
        <b>Practise both ways</b>
        <span>{hint}</span>
      </span>
      <span className="switch">
        <input
          type="checkbox"
          checked={on}
          onChange={(e) => {
            haptic();
            onChange(e.target.checked);
          }}
        />
        <span className="switch-track" />
      </span>
    </label>
  );
}

const short = (t: string) => (t.length > 32 ? `${t.slice(0, 31).trimEnd()}…` : t);

/** One word. Opened from a selection ("Flashcard"), it starts with that word and saves just that word. */
function WordForm({ noteId, initial }: { noteId: string | null; initial?: string }) {
  const { settings } = useVault();
  const lang = languageOf(settings.learning);
  useVoiceWarmup(lang.code);
  const [word, setWord] = useState(initial ?? "");
  const [typed, setTyped] = useState<string | null>(null);
  const [target, setTarget] = useState(noteId);
  const [added, setAdded] = useState(0);
  const [bothWays, setBothWays] = useState(false);
  const wordInput = useRef<HTMLInputElement>(null);
  const found = useMeaning(word, lang, settings.onlineLookups);
  const meaning = typed ?? (found.status === "found" ? found.meaning ?? "" : "");
  const front = found.status === "found" && found.front ? found.front : word.trim();
  const ready = !!word.trim() && !!meaning.trim();

  const save = (again: boolean) => {
    if (!ready) return;
    vault.addCard(front, meaning, target, bothWays);
    haptic("success");
    if (again) {
      setAdded((n) => n + 1);
      setWord("");
      setTyped(null);
      wordInput.current?.focus();
    } else {
      toast(added ? `Added ${added + 1} words` : `Added “${front}”${bothWays ? " both ways" : ""}`);
      close();
    }
  };

  return (
    <>
      <label className="add-field">
        <span>{lang.name} word or phrase</span>
        <span className="add-input">
          <input
            ref={wordInput}
            autoFocus
            value={word}
            placeholder={lang.starter?.[0] ?? "Word"}
            enterKeyHint="next"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => {
              setWord(e.target.value);
              setTyped(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && document.getElementById("add-meaning")?.focus()}
          />
          {word.trim() && (
            <button type="button" className="icon-btn" onClick={() => say(front, lang)} aria-label="Hear it">
              <Volume2 size={18} />
            </button>
          )}
        </span>
      </label>
      <label className="add-field">
        <span>
          Meaning
          {found.status === "loading" && <Loader2 size={13} className="spin" />}
          {found.status === "found" && typed === null && <em>filled in from Wiktionary</em>}
        </span>
        <input
          id="add-meaning"
          value={meaning}
          placeholder={found.status === "loading" ? "Looking it up…" : "What it means"}
          enterKeyHint="done"
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save(!initial)}
        />
      </label>
      {front !== word.trim() && word.trim() && <p className="add-hint">Saved as <b>{front}</b>, with its article.</p>}
      <BothWays
        on={bothWays}
        onChange={setBothWays}
        hint={
          ready
            ? `Adds a second card that shows “${short(meaning.trim())}” and asks for “${short(front)}”.`
            : "Adds a second card that shows the meaning and asks for the word."
        }
      />
      <NotePicker value={target} onChange={setTarget} />
      <div className="add-actions">
        {!initial && (
          <button className="btn btn-lg" onClick={() => save(true)} disabled={!ready}>
            Save &amp; add another
          </button>
        )}
        <button className="btn btn-primary btn-lg" onClick={() => save(false)} disabled={!ready}>
          <Tumble label="Save">
            <Check size={17} /> Save
          </Tumble>
        </button>
      </div>
      {added > 0 && <p className="add-hint">{added} added so far.</p>}
    </>
  );
}

function ListForm({ noteId }: { noteId: string | null }) {
  const [text, setText] = useState("");
  const [target, setTarget] = useState(noteId);
  const [bothWays, setBothWays] = useState(false);
  const pairs = text.split("\n").map(pairOf).filter((p): p is [string, string] => !!p);
  const add = () => {
    if (!pairs.length) return;
    vault.addCards(pairs, target, bothWays);
    haptic("success");
    toast(`Added ${pairs.length} ${pairs.length === 1 ? "word" : "words"}${bothWays ? " both ways" : ""}`);
    close();
  };
  return (
    <>
      <label className="add-field">
        <span>Paste your words, one pair per line</span>
        <textarea
          autoFocus
          rows={7}
          value={text}
          placeholder={"Hund = dog\nKatze = cat\nHaus = house"}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <p className="add-hint">
        {text.trim() ? (
          <>
            Found <b>{pairs.length}</b> {pairs.length === 1 ? "pair" : "pairs"}. Use a dash, “=”, “:” or a tab between the word
            and its meaning.
          </>
        ) : (
          "Copied from a textbook, a spreadsheet or a website: anything with a word and its meaning on each line."
        )}
      </p>
      <BothWays
        on={bothWays}
        onChange={setBothWays}
        hint="Each pair also gets a card that shows the meaning and asks for the word."
      />
      <NotePicker value={target} onChange={setTarget} />
      <div className="add-actions">
        <button className="btn btn-primary btn-lg" onClick={add} disabled={!pairs.length}>
          <Check size={17} /> Add {pairs.length || ""} {pairs.length === 1 ? "word" : "words"}
        </button>
      </div>
    </>
  );
}

/** The ＋ sheet: the quickest way to add words, with no syntax to learn. */
export default function AddWord() {
  const { addWord } = useUI();
  const router = useRouter();
  if (!addWord) return null;
  const list = addWord.mode === "list";
  const picked = !list && addWord.word;
  return (
    <Sheet open title={list ? "Paste a word list" : picked ? "New flashcard" : "Add a word"} onClose={close} className="add-sheet">
      {list ? (
        <ListForm key="list" noteId={addWord.noteId} />
      ) : (
        <WordForm key={`word:${addWord.word ?? ""}`} noteId={addWord.noteId} initial={addWord.word} />
      )}
      {!picked && (
        <div className="add-other">
          <button onClick={() => setUI({ addWord: { ...addWord, mode: list ? "word" : "list" } })}>
            <ListPlus size={16} /> {list ? "Add one word" : "Paste a list"}
          </button>
          <button onClick={() => setUI({ addWord: null, scan: { noteId: addWord.noteId } })}>
            <ScanText size={16} /> Scan a page
          </button>
          <button
            onClick={() => {
              close();
              setUI({ pendingRename: vault.createNote() });
              router.push("/");
            }}
          >
            <FilePlus2 size={16} /> New note
          </button>
        </div>
      )}
    </Sheet>
  );
}
