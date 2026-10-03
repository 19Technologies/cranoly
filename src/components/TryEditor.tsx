"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Bold, Heading2, Italic, ListChecks } from "lucide-react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { indentUnit } from "@codemirror/language";
import { continueList, indent, pairBrackets, toggleLinePrefix, wrap } from "@/lib/cm";
import { livePreview } from "@/lib/live-preview";
import { indexOf, useVault } from "@/lib/store";

/**
 * A practice editor for the Formatting guide: the notes editor's own live preview and toolbar buttons,
 * with nothing saved. "Start over" puts the sample back.
 */
export default function TryEditor({ sample, resetKey }: { sample: string; resetKey: number }) {
  const { notes } = useVault();
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const index = useRef(indexOf(notes));
  const first = useRef(sample);
  const latest = useRef(sample);

  useEffect(() => {
    index.current = indexOf(notes);
  }, [notes]);

  useEffect(() => {
    latest.current = sample;
  }, [sample]);

  useEffect(() => {
    const v = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: first.current,
        extensions: [
          keymap.of([
            { key: "Enter", run: continueList },
            { key: "Tab", run: (ed) => indent(ed, false), shift: (ed) => indent(ed, true) },
            { key: "Mod-b", run: (ed) => wrap(ed, "**") },
            { key: "Mod-i", run: (ed) => wrap(ed, "*") },
            ...historyKeymap,
            ...defaultKeymap,
          ]),
          history(),
          pairBrackets,
          indentUnit.of("\t"),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ spellcheck: "false", autocapitalize: "sentences", "aria-label": "Try formatting here" }),
          livePreview((target) => !!index.current.resolve(target)),
        ],
      }),
    });
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
  }, []);

  // "Start over": the parent bumps resetKey.
  useEffect(() => {
    const v = view.current;
    if (!resetKey || !v) return;
    const text = latest.current;
    v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: text }, selection: { anchor: text.length } });
    v.focus();
  }, [resetKey]);

  const tool = (label: string, run: (v: EditorView) => void, icon: ReactNode) => (
    <button
      type="button"
      className="tool"
      aria-label={label}
      title={label}
      // Keep focus (and the phone keyboard) in the box.
      onPointerDown={(e) => e.preventDefault()}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        const v = view.current;
        if (!v) return;
        run(v);
        v.focus();
      }}
    >
      {icon}
    </button>
  );

  return (
    <div className="try">
      <div className="try-tools" role="toolbar" aria-label="Formatting">
        {tool("Heading", (v) => toggleLinePrefix(v, "## ", /^#{1,6} /), <Heading2 size={18} />)}
        {tool("Bold", (v) => wrap(v, "**"), <Bold size={18} />)}
        {tool("Italic", (v) => wrap(v, "*"), <Italic size={18} />)}
        {tool("Checklist", (v) => toggleLinePrefix(v, "- [ ] ", /^\s*[-*+] \[[ xX]\] /), <ListChecks size={18} />)}
        {tool("Highlight (fill-the-gap card)", (v) => wrap(v, "=="), <span className="tool-text tool-mark">==</span>)}
      </div>
      <div className="editor try-editor" ref={host} />
    </div>
  );
}
