"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ClipboardCopy, ExternalLink } from "lucide-react";
import Sheet from "./Sheet";
import Tumble from "./Tumble";
import { haptic } from "@/lib/native";
import { toast, useVault, vault } from "@/lib/store";
import { setUI, useUI } from "@/lib/ui";
import { LANGUAGES, cardExamples } from "@/lib/languages";
import { titleOf } from "@/lib/vault";
import { useSlider } from "@/lib/useSlider";
import { ASSISTANTS, TASKS, assistantOf, buildPrompt, cleanResult, openUrl, type FormatTask } from "@/lib/format";

const close = () => setUI({ format: null });
const nameOf = (code: string) => LANGUAGES.find((l) => l.code === code)?.name ?? "English";

interface Sent {
  prompt: string;
  /** The assistant opened with the prompt already filled in. */
  filled: boolean;
  /** The prompt made it to the clipboard (null while the copy is still going). */
  copied: boolean | null;
}

function FormatFlow({ noteId }: { noteId: string }) {
  const { notes, settings } = useVault();
  const note = notes[noteId];
  const assistant = assistantOf(settings.assistant);
  const [tasks, setTasks] = useState<FormatTask[]>(["tidy"]);
  const [sent, setSent] = useState<Sent | null>(null);
  const [answer, setAnswer] = useState("");
  const picker = useSlider<HTMLDivElement>(".is-on", `${assistant.id}|${sent ? 2 : 1}`);
  if (!note) return null;
  const empty = !note.content.trim();

  const send = () => {
    const ex = cardExamples(settings.learning, settings.native).both;
    const prompt = buildPrompt({ title: titleOf(note.path), content: note.content }, tasks, {
      learning: nameOf(settings.learning),
      native: nameOf(settings.native),
      word: ex.front,
      meaning: ex.back,
    });
    const { url, filled } = openUrl(assistant, prompt);
    // Copy first, while the tap still counts, then open the assistant. The clipboard is missing on insecure pages.
    const clip = navigator.clipboard as Clipboard | undefined;
    let copying: Promise<boolean>;
    try {
      copying = clip ? clip.writeText(prompt).then(() => true, () => false) : Promise.resolve(false);
    } catch {
      copying = Promise.resolve(false);
    }
    window.open(url, "_blank", "noopener,noreferrer");
    haptic();
    setSent({ prompt, filled, copied: null });
    copying.then((ok) => setSent((s) => s && { ...s, copied: ok }));
  };

  const copyAgain = () => {
    if (!sent) return;
    navigator.clipboard?.writeText(sent.prompt).then(
      () => toast("Prompt copied"),
      () => toast("Couldn’t copy. Select the prompt and copy it."),
    );
  };

  const apply = (how: "replace" | "below") => {
    const before = note.content;
    const text = cleanResult(answer);
    vault.updateNote(note.id, how === "replace" ? text : `${before.replace(/\s+$/, "")}\n\n${text}`);
    haptic("success");
    toast(how === "replace" ? "Note formatted" : "Added to the note", { label: "Undo", run: () => vault.updateNote(note.id, before) });
    close();
  };

  return (
    <Sheet open title={sent ? "Paste the reply" : "Format with AI"} onClose={close} className="add-sheet format-sheet">
      {!sent ? (
        <>
          <p className="add-hint format-lede">
            Pick what to do and an assistant. Cranoly copies a ready prompt with your note and opens the assistant.
          </p>
          <div className="format-tasks" role="group" aria-label="What to do">
            {TASKS.map((t) => {
              const on = tasks.includes(t.id);
              return (
                <button
                  key={t.id}
                  className={`chip${on ? " on" : ""}`}
                  aria-pressed={on}
                  onClick={() => {
                    haptic();
                    setTasks(on ? tasks.filter((x) => x !== t.id) : [...tasks, t.id]);
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <div className="add-field">
            <span>Assistant</span>
            <div ref={picker} className="seg has-slider format-assistants" role="radiogroup" aria-label="Assistant">
              <span className="slider-pill" aria-hidden />
              {ASSISTANTS.map((a) => (
                <button
                  key={a.id}
                  role="radio"
                  aria-checked={a.id === assistant.id}
                  className={a.id === assistant.id ? "is-on" : ""}
                  onClick={() => {
                    if (a.id === assistant.id) return;
                    haptic();
                    vault.updateSettings({ assistant: a.id });
                  }}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>
          <p className="format-fine">
            Your note goes to {assistant.name} only when you tap the button. Cranoly itself runs no AI.
          </p>
          {empty && <p className="add-hint">This note is empty. Write something first.</p>}
          <div className="add-actions">
            <button className="btn btn-primary btn-lg" disabled={!tasks.length || empty} onClick={send}>
              <Tumble label={`Copy prompt & open ${assistant.name}`}>
                <ExternalLink size={17} /> Copy prompt &amp; open {assistant.name}
              </Tumble>
            </button>
          </div>
          <p className="format-fine">
            Rather do it yourself? See the{" "}
            <Link href="/formatting" onClick={close}>
              Formatting guide
            </Link>
            .
          </p>
        </>
      ) : (
        <>
          <p className="add-hint format-lede">
            {sent.filled
              ? `Your note is in ${assistant.name}. When it has answered, copy the reply and paste it here.`
              : `Paste the prompt into ${assistant.name}. Then copy the reply and paste it here.`}
            {sent.filled || sent.copied !== true ? "" : " The prompt is on your clipboard."}
          </p>
          {sent.copied === false && (
            <label className="add-field">
              <span>Couldn’t copy the prompt. Select it and copy it yourself.</span>
              <textarea className="format-prompt" readOnly rows={5} value={sent.prompt} onFocus={(e) => e.currentTarget.select()} />
            </label>
          )}
          <label className="add-field">
            <span>The reply</span>
            <textarea
              autoFocus={sent.copied !== false}
              rows={8}
              value={answer}
              placeholder={`Paste what ${assistant.name} wrote`}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </label>
          <div className="add-actions">
            <button className="btn btn-lg" disabled={!answer.trim()} onClick={() => apply("below")}>
              Add below
            </button>
            <button className="btn btn-primary btn-lg" disabled={!answer.trim()} onClick={() => apply("replace")}>
              <Check size={17} /> Replace note
            </button>
          </div>
          <div className="format-foot">
            <button className="format-link" onClick={() => setSent(null)}>
              <ArrowLeft size={14} /> Back
            </button>
            <button className="format-link" onClick={copyAgain}>
              <ClipboardCopy size={14} /> Copy the prompt again
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}

/** Format: hand the note to Claude, ChatGPT or Gemini with a ready prompt, then paste the reply back. */
export default function FormatSheet() {
  const { format } = useUI();
  if (!format) return null;
  return <FormatFlow key={format.noteId} noteId={format.noteId} />;
}
