"use client";

import NoteList from "@/components/NoteList";

/** The Notes screen on phones: pinned first, then by date, as in Apple Notes. */
export default function NotesPage() {
  return (
    <div className="page notes-page">
      <NoteList variant="page" />
    </div>
  );
}
