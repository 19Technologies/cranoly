"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Home was removed: the app starts on the notes list. Old links and bookmarks land there.
export default function HomeRedirect() {
  const router = useRouter();
  useEffect(() => router.replace("/notes"), [router]);
  return null;
}
