// "Scan text": reads the text in a photo with Tesseract (Apache-2.0), running on the device.
// Nothing is bundled with the app: the scanner (about 4 MB) and a small file per language
// (1–2 MB) come from public CDNs the first time, then the browser keeps them. The photo itself
// never leaves the device.
import type { Language } from "./languages";

const TESSERACT = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
const LANG_PATH = "https://tessdata.projectnaptha.com/4.0.0_fast";

export type ScanProgress = (status: string, progress: number) => void;

/* eslint-disable @typescript-eslint/no-explicit-any -- Tesseract is loaded at runtime from a CDN */
let script: Promise<void> | null = null;
function loadTesseract() {
  script ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = TESSERACT;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("scanner"));
    document.head.appendChild(s);
  });
  script.catch(() => (script = null));
  return script;
}

const STATUS: Record<string, string> = {
  "loading tesseract core": "Getting the scanner ready…",
  "initializing tesseract": "Getting the scanner ready…",
  "loading language traineddata": "Getting the language files…",
  "initializing api": "Almost ready…",
  "recognizing text": "Reading…",
};

// One scanner stays ready for the next photo, as long as the languages don't change.
let report: ScanProgress = () => {};
let current: { langs: string; worker: Promise<any> } | null = null;
function workerFor(langs: string) {
  if (current?.langs !== langs) {
    const old = current;
    const worker = (async () => {
      await loadTesseract();
      return (window as any).Tesseract.createWorker(langs, 1, {
        langPath: LANG_PATH,
        logger: (m: { status: string; progress?: number }) => report(STATUS[m.status] ?? "Getting the scanner ready…", m.progress ?? 0),
      });
    })();
    current = { langs, worker };
    worker.catch(() => {
      if (current?.worker === worker) current = null;
    });
    old?.worker.then((w) => w.terminate()).catch(() => {});
  }
  return current!.worker;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Phone photos are huge: 2000 px on the long side reads just as well, and much faster. */
async function prepare(file: Blob): Promise<Blob | HTMLCanvasElement> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas;
  } catch {
    return file;
  }
}

/**
 * Tidy what the scanner read: join words split across lines, and rejoin lines that were only
 * broken by the width of the page. Word lists (short lines, or "word – meaning") keep their lines.
 */
export function tidy(raw: string) {
  const text = raw
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/ [-–—]{2,} /g, " – ")
    .replace(/(\p{L})[-¬]\n(?=\p{Ll})/gu, "$1");
  const lines = text.split("\n").map((l) => l.trim());
  const filled = lines.filter(Boolean);
  if (!filled.length) return "";
  const listy = filled.filter((l) => l.length < 32 || /\s[–—=:-]\s|\S\s*[=:]\s*\S/.test(l)).length / filled.length > 0.6;
  if (listy) return filled.join("\n");
  return lines
    .join("\n")
    .split(/\n{2,}/)
    .map((p) => p.split("\n").join(" ").trim())
    .filter(Boolean)
    .join("\n\n");
}

/** Read the text in a photo, in these languages (the one being learned, and your own). */
export async function scanText(file: Blob, languages: Language[], onProgress: ScanProgress) {
  const langs = [...new Set(languages.map((l) => l.ocr))].join("+");
  report = onProgress;
  onProgress("Getting the scanner ready…", 0);
  try {
    const [worker, image] = await Promise.all([workerFor(langs), prepare(file)]);
    const { data } = await worker.recognize(image);
    return tidy(data.text as string);
  } finally {
    report = () => {};
  }
}
