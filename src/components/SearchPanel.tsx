"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Hash, MessageCircleQuestion, Search, X } from "lucide-react";
import { titleOf, folderOf } from "@/lib/vault";
import { getVault, indexOf, useVault, vault } from "@/lib/store";
import { ask, isQuestion, questionTerms, stem } from "@/lib/ask";
import { languageOf } from "@/lib/languages";
import { plainLine } from "@/lib/links";
import { setUI, useUI } from "@/lib/ui";

/** Highlight words whose stem matches a question term ("datives" → "Dativ"). */
function highlightStems(text: string, stems: string[]) {
  if (!stems.length) return text;
  return text.split(/(\p{L}[\p{L}\p{M}'’-]*)/u).map((part, i) => {
    if (i % 2 === 0) return part;
    const s = stem(part);
    const hit = stems.some((t) => s === t || (s.length >= 5 && t.length >= 5 && (s.startsWith(t) || t.startsWith(s))));
    return hit ? <mark key={i}>{part}</mark> : part;
  });
}

function highlight(text: string, terms: string[]) {
  if (!terms.length) return text;
  const re = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return text.split(re).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part));
}

export default function SearchPanel({ autoFocus = false }: { autoFocus?: boolean }) {
  const { notes, settings } = useVault();
  const { searchQuery } = useUI();
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const index = indexOf(notes);

  useEffect(() => {
    if (autoFocus) input.current?.focus();
  }, [autoFocus]);

  const { tagFilters, terms } = useMemo(() => {
    const words = searchQuery.trim().split(/\s+/).filter(Boolean);
    return {
      tagFilters: words.filter((w) => w.startsWith("#") && w.length > 1).map((w) => w.slice(1).toLowerCase()),
      terms: words.filter((w) => !w.startsWith("#")).map((w) => w.toLowerCase()),
    };
  }, [searchQuery]);

  const results = useMemo(() => {
    if (!tagFilters.length && !terms.length) return [];
    return Object.values(notes)
      .filter((n) => {
        const tags = (index.noteTags.get(n.id) ?? []).map((t) => t.toLowerCase());
        if (!tagFilters.every((f) => tags.some((t) => t === f || t.startsWith(f + "/")))) return false;
        const hay = (n.path + "\n" + n.content).toLowerCase();
        return terms.every((t) => hay.includes(t));
      })
      .map((n) => {
        const lines = n.content
          .split("\n")
          .filter((l) => l.trim() && terms.some((t) => l.toLowerCase().includes(t)))
          .slice(0, 3);
        const titleHit = terms.some((t) => n.path.toLowerCase().includes(t));
        return { note: n, lines, score: (titleHit ? 10 : 0) + lines.length };
      })
      .sort((a, b) => b.score - a.score);
  }, [notes, index, tagFilters, terms]);

  // Questions ("what did I learn about the dative?") get the best-matching passages as answers.
  const question = isQuestion(searchQuery) && !tagFilters.length;
  const answers = useMemo(() => {
    if (!question) return [];
    const stop = [...languageOf(settings.learning).common, ...languageOf(settings.native).common];
    return ask(searchQuery, Object.values(notes), stop);
  }, [question, searchQuery, notes, settings.learning, settings.native]);
  const answerTerms = useMemo(() => (question ? questionTerms(searchQuery) : []), [question, searchQuery]);

  const openAt = (id: string, line: number) => {
    vault.openNote(id);
    if (getVault().workspace.mode !== "read") setUI({ pendingLine: line });
    setUI({ mobileLeft: false });
    if (pathname !== "/") router.push("/");
  };

  const tags = useMemo(
    () => [...index.tags.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])),
    [index],
  );

  const open = (id: string, e: React.MouseEvent) => {
    vault.openNote(id, { newTab: e.metaKey || e.ctrlKey });
    setUI({ mobileLeft: false });
    if (pathname !== "/") router.push("/");
  };

  return (
    <div className="search-panel">
      <label className="search-box">
        <Search size={14} />
        <input
          ref={input}
          value={searchQuery}
          placeholder="Search, #tag, or ask a question"
          onChange={(e) => setUI({ searchQuery: e.target.value })}
          onKeyDown={(e) => e.key === "Escape" && setUI({ searchQuery: "" })}
        />
        {searchQuery && (
          <button className="icon-btn" aria-label="Clear search" onClick={() => setUI({ searchQuery: "" })}>
            <X size={13} />
          </button>
        )}
      </label>

      {searchQuery.trim() ? (
        <div className="search-results">
          {question && (
            <div className="answers">
              <div className="panel-caption">
                <MessageCircleQuestion size={13} /> From your notes
              </div>
              {answers.map((a) => (
                <button key={`${a.note.id}:${a.line}`} className="answer" onClick={() => openAt(a.note.id, a.line)}>
                  <span className="answer-text">{highlightStems(a.text.slice(0, 220), answerTerms)}</span>
                  <span className="answer-source">{titleOf(a.note.path)}</span>
                </button>
              ))}
              {!answers.length && <p className="panel-empty">Nothing in your notes answers that yet.</p>}
            </div>
          )}
          {(!question || results.length > 0) && (
            <div className="panel-caption">
              {results.length} {results.length === 1 ? "note" : "notes"}
            </div>
          )}
          {results.map(({ note, lines }) => (
            <button key={note.id} className="search-result" onClick={(e) => open(note.id, e)}>
              <span className="search-result-title">{highlight(titleOf(note.path), terms)}</span>
              {folderOf(note.path) && <span className="search-result-path">{folderOf(note.path)}</span>}
              {lines.map((l, i) => (
                <span key={i} className="search-result-line">
                  {highlight(plainLine(l).slice(0, 140), terms)}
                </span>
              ))}
            </button>
          ))}
          {!results.length && !question && <p className="panel-empty">Nothing matches “{searchQuery.trim()}”.</p>}
        </div>
      ) : (
        <div className="tag-list">
          <div className="panel-caption">Tags</div>
          {tags.map(([tag, ids]) => (
            <button key={tag} className="tag-row" onClick={() => setUI({ searchQuery: `#${tag}` })}>
              <Hash size={12} />
              <span>{tag}</span>
              <span className="tree-badge">{ids.length}</span>
            </button>
          ))}
          {!tags.length && <p className="panel-empty">Add #tags to your notes to group them.</p>}
        </div>
      )}
    </div>
  );
}
