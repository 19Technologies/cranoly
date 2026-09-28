"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Dices, FolderPlus, GitFork, Layers, MoreHorizontal, Plus, Search, SquareTerminal } from "lucide-react";
import Sheet from "@/components/Sheet";
import { cardsOf, useVault, vault } from "@/lib/store";
import { friendlyCard, plainLine } from "@/lib/links";
import { folderOf, isoDay, titleOf } from "@/lib/vault";
import { useToday } from "@/lib/useToday";
import { setUI } from "@/lib/ui";

/** Notes, most recently edited first. Tap to open. */
export default function NotesPage() {
  const router = useRouter();
  const { notes } = useVault();
  const today = useToday();
  const [filter, setFilter] = useState("");
  const [more, setMore] = useState(false);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cardsOf(notes)) m.set(c.noteId, (m.get(c.noteId) ?? 0) + 1);
    return m;
  }, [notes]);
  const list = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return Object.values(notes)
      .filter((n) => !q || n.path.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .sort((a, b) => b.updated - a.updated);
  }, [notes, filter]);

  const when = (t: number) => {
    const day = isoDay(new Date(t));
    if (!today) return "";
    if (day === today) return "Today";
    const y = new Date(`${today}T12:00:00`);
    y.setDate(y.getDate() - 1);
    if (day === isoDay(y)) return "Yesterday";
    return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  };
  const preview = (content: string) =>
    content.split("\n").map((l) => friendlyCard(plainLine(l))).find((l) => l && !/^#{1,6}\s|^#\p{L}/u.test(l))?.slice(0, 100) ?? "Empty note";
  const open = (id: string) => {
    vault.openNote(id);
    router.push("/");
  };
  const run = (fn: () => void) => () => {
    setMore(false);
    fn();
  };

  return (
    <div className="page notes-page">
      <header className="list-head">
        <h1>Notes</h1>
        <button className="icon-btn" aria-label="More" onClick={() => setMore(true)}>
          <MoreHorizontal size={20} />
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            setUI({ pendingRename: vault.createNote() });
            router.push("/");
          }}
        >
          <Plus size={16} /> New note
        </button>
      </header>
      {Object.keys(notes).length > 4 && (
        <label className="list-filter">
          <Search size={16} />
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter notes" aria-label="Filter notes" />
        </label>
      )}
      {list.length ? (
        <ul className="note-list">
          {list.map((n) => (
            <li key={n.id}>
              <button className="note-row" onClick={() => open(n.id)}>
                <span className="note-row-top">
                  <b>{titleOf(n.path)}</b>
                  <small>{when(n.updated)}</small>
                </span>
                <span className="note-row-preview">{preview(n.content)}</span>
                <span className="note-row-meta">
                  {folderOf(n.path) && <span>{folderOf(n.path)}</span>}
                  {counts.get(n.id) ? (
                    <span className="note-row-cards">
                      <Layers size={12} /> {counts.get(n.id)}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="list-empty">{filter ? `No notes match “${filter}”.` : "No notes yet. Tap New note, or ＋ to add a word."}</p>
      )}

      <Sheet open={more} onClose={() => setMore(false)} title="Notes">
        <div className="sheet-list">
          <button className="sheet-item" onClick={run(() => { vault.openDaily(); router.push("/"); })}>
            <CalendarDays size={18} /> <span>Today’s page</span>
          </button>
          <button className="sheet-item" onClick={run(() => router.push("/graph"))}>
            <GitFork size={18} /> <span>Map of your notes</span>
          </button>
          <button className="sheet-item" onClick={run(() => { vault.openRandom(); router.push("/"); })}>
            <Dices size={18} /> <span>Random note</span>
          </button>
          <button className="sheet-item" onClick={run(() => { vault.createFolder(); setUI({ mobileLeft: true, leftView: "files" }); })}>
            <FolderPlus size={18} /> <span>New folder</span>
          </button>
          <button className="sheet-item" onClick={run(() => setUI({ palette: "commands" }))}>
            <SquareTerminal size={18} /> <span>All commands</span>
          </button>
        </div>
      </Sheet>
    </div>
  );
}
