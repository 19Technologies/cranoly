"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The graph view is now the Mind Map. Old links land there.
export default function GraphRedirect() {
  const router = useRouter();
  useEffect(() => router.replace("/mind-map"), [router]);
  return null;
}
