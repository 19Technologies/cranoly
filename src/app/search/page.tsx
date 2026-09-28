"use client";

import SearchPanel from "@/components/SearchPanel";

/** Search as its own screen on phones: find text, filter by #tag, or ask a question. */
export default function SearchPage() {
  return (
    <div className="page page-narrow search-page">
      <h1>Search</h1>
      <SearchPanel autoFocus />
    </div>
  );
}
