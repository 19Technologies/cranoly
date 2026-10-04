// In-app voices: natural text-to-speech with Piper (MIT, by Rhasspy) running on the device with
// ONNX Runtime. A language's voice is downloaded once, together with a shared engine, into the
// app's own storage, so "Hear it" sounds the same on every phone, needs no system settings and
// works offline. Nothing is bundled with the app: it all comes from public CDNs on first download.
import { useSyncExternalStore } from "react";
import { LANGUAGES, languageOf, type Language } from "./languages";

const ORT = "https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.18.0/";
const PIPER = "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize";
const VOICES = "https://huggingface.co/diffusionstudio/piper-voices/resolve/main/";
const CACHE = "cranoly-voices-v1";

/** The engine every voice shares (downloaded with the first voice). */
const ENGINE = [
  { url: ORT + "ort.wasm.min.js", bytes: 142_930, type: "text/javascript" },
  { url: ORT + "ort-wasm-simd.wasm", bytes: 10_595_041, type: "application/wasm" },
  { url: PIPER + ".js", bytes: 120_714, type: "text/javascript" },
  { url: PIPER + ".wasm", bytes: 635_212, type: "application/wasm" },
  { url: PIPER + ".data", bytes: 18_077_249, type: "application/octet-stream" },
];
export const ENGINE_MB = 29;

const modelUrl = (lang: Language) => VOICES + encodeURI(lang.model!.path) + ".onnx";
const configUrl = (lang: Language) => modelUrl(lang) + ".json";

/* ------------------------------------------------------------------ */
/* State the settings and onboarding screens show                      */
/* ------------------------------------------------------------------ */

export interface VoiceState {
  status: "none" | "waiting" | "downloading" | "ready" | "error";
  /** 0 to 1 while downloading. */
  progress: number;
  error?: string;
}

let states: Record<string, VoiceState> = {};
const listeners = new Set<() => void>();
const EMPTY: Record<string, VoiceState> = {};

function setState(code: string, next: VoiceState) {
  states = { ...states, [code]: next };
  listeners.forEach((l) => l());
}

let checked = false;
/** Find the voices already on this device (once per app start). */
async function refresh() {
  if (checked || typeof caches === "undefined") return;
  checked = true;
  try {
    const cache = await caches.open(CACHE);
    for (const lang of LANGUAGES) {
      if (!lang.model || states[lang.code]) continue;
      const [model, config] = await Promise.all([cache.match(modelUrl(lang)), cache.match(configUrl(lang))]);
      if (model && config) setState(lang.code, { status: "ready", progress: 1 });
    }
  } catch {
    /* storage unavailable: voices just show as not downloaded */
  }
}

// Look as soon as the app starts, so the first "Hear it" already knows which voices are here.
if (typeof window !== "undefined") void refresh();

export function useVoices() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      void refresh();
      return () => listeners.delete(l);
    },
    () => states,
    () => EMPTY,
  );
}

export const voiceStatus = (code: string): VoiceState["status"] => states[code]?.status ?? "none";
export const voiceReady = (code: string) => voiceStatus(code) === "ready";

/* ------------------------------------------------------------------ */
/* Downloads                                                           */
/* ------------------------------------------------------------------ */

async function fetchInto(cache: Cache, url: string, type: string, onBytes: (n: number) => void) {
  if (await cache.match(url)) return;
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`download failed (${res.status})`);
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.length;
    onBytes(value.length);
  }
  // Kept in memory rather than as a Blob: large blobs can fail when the disk is nearly full.
  const data = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    data.set(c, at);
    at += c.length;
  }
  await cache.put(url, new Response(data, { headers: { "Content-Type": type } }));
}

// One download at a time: gentler on slow connections, and the engine is only fetched once.
let queue: Promise<unknown> = Promise.resolve();
const pending = new Map<string, Promise<void>>();

async function run(lang: Language) {
  const cache = await caches.open(CACHE);
  const missing = [];
  for (const f of ENGINE) if (!(await cache.match(f.url))) missing.push(f);
  const total = missing.reduce((n, f) => n + f.bytes, 0) + lang.model!.mb * 1_000_000;
  let done = 0;
  let last = 0;
  const tick = (n: number) => {
    done += n;
    const now = performance.now();
    if (now - last < 120) return;
    last = now;
    setState(lang.code, { status: "downloading", progress: Math.min(0.99, done / total) });
  };
  setState(lang.code, { status: "downloading", progress: 0 });
  for (const f of missing) await fetchInto(cache, f.url, f.type, tick);
  await fetchInto(cache, configUrl(lang), "application/json", tick);
  await fetchInto(cache, modelUrl(lang), "application/octet-stream", tick);
  setState(lang.code, { status: "ready", progress: 1 });
}

/** Download a language's voice (and the engine, the first time). Safe to call repeatedly. */
export function downloadVoice(code: string) {
  const lang = languageOf(code);
  if (!lang.model) return Promise.reject(new Error("no voice"));
  if (voiceReady(code)) return Promise.resolve();
  const running = pending.get(code);
  if (running) return running;
  // Ask the browser not to clear the app's storage when space runs low (protects notes too).
  void navigator.storage?.persist?.().catch(() => false);
  setState(code, { status: "waiting", progress: 0 });
  const job = queue.then(() => run(lang));
  queue = job.catch(() => {});
  const tracked = job.catch((e: unknown) => {
    const full = e instanceof DOMException && e.name === "QuotaExceededError";
    setState(code, {
      status: "error",
      progress: 0,
      error: full ? "Not enough space on this device." : "Couldn’t download. Check your connection and try again.",
    });
    throw e;
  });
  tracked.catch(() => {}).finally(() => pending.delete(code));
  pending.set(code, tracked);
  return tracked;
}

export async function removeVoice(code: string) {
  const lang = languageOf(code);
  if (!lang.model) return;
  if (loaded?.code === code) {
    loaded.session.release?.();
    loaded = null;
  }
  const cache = await caches.open(CACHE);
  await Promise.all([cache.delete(modelUrl(lang)), cache.delete(configUrl(lang))]);
  setState(code, { status: "none", progress: 0 });
  // The last voice takes the shared engine with it.
  if (!LANGUAGES.some((l) => l.model && states[l.code]?.status === "ready")) {
    await Promise.all(ENGINE.map((f) => cache.delete(f.url)));
  }
}

/* ------------------------------------------------------------------ */
/* Speaking                                                            */
/* ------------------------------------------------------------------ */

/* eslint-disable @typescript-eslint/no-explicit-any -- the engine is loaded at runtime from a CDN */
interface Engine {
  ort: any;
  createPhonemize: (options: object) => Promise<any>;
  piperWasm: string;
  piperData: string;
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("engine"));
    document.head.appendChild(s);
  });
}

let engine: Promise<Engine> | null = null;
function loadEngine() {
  engine ??= (async () => {
    const cache = await caches.open(CACHE);
    const urls = await Promise.all(
      ENGINE.map(async (f) => {
        const hit = await cache.match(f.url);
        if (!hit) throw new Error("engine missing");
        return URL.createObjectURL(new Blob([await hit.arrayBuffer()], { type: f.type }));
      }),
    );
    const [ortJs, ortWasm, piperJs, piperWasm, piperData] = urls;
    await loadScript(ortJs);
    await loadScript(piperJs);
    const w = window as any;
    w.ort.env.wasm.numThreads = 1;
    w.ort.env.wasm.wasmPaths = { "ort-wasm-simd.wasm": ortWasm, "ort-wasm.wasm": ORT + "ort-wasm.wasm" };
    return { ort: w.ort, createPhonemize: w.createPiperPhonemize, piperWasm, piperData };
  })();
  engine.catch(() => (engine = null));
  return engine;
}

/** Text → phoneme ids, using one espeak-ng instance for every call. */
let phonemizer: Promise<(text: string, voice: string) => Promise<number[]>> | null = null;
function getPhonemizer(e: Engine) {
  phonemizer ??= (async () => {
    let answer: ((ids: number[]) => void) | null = null;
    const mod = await e.createPhonemize({
      print: (line: string) => answer?.(JSON.parse(line).phoneme_ids),
      printErr: () => {},
      locateFile: (file: string) => (file.endsWith(".wasm") ? e.piperWasm : file.endsWith(".data") ? e.piperData : file),
    });
    return (text: string, voice: string) =>
      new Promise<number[]>((resolve) => {
        answer = resolve;
        mod.callMain(["-l", voice, "--input", JSON.stringify([{ text }]), "--espeak_data", "/espeak-ng-data"]);
      });
  })();
  phonemizer.catch(() => (phonemizer = null));
  return phonemizer;
}

/** Only one voice is kept in memory at a time (each is a large model). */
let loaded: { code: string; session: any; config: any } | null = null;
async function sessionFor(lang: Language, e: Engine) {
  if (loaded?.code === lang.code) return loaded;
  loaded?.session.release?.();
  loaded = null;
  const cache = await caches.open(CACHE);
  const [configRes, modelRes] = await Promise.all([cache.match(configUrl(lang)), cache.match(modelUrl(lang))]);
  if (!configRes || !modelRes) throw new Error("voice missing");
  const config = await configRes.json();
  const session = await e.ort.InferenceSession.create(await modelRes.arrayBuffer(), { executionProviders: ["wasm"] });
  loaded = { code: lang.code, session, config };
  return loaded;
}

async function synthesize(text: string, lang: Language) {
  const e = await loadEngine();
  const toIds = await getPhonemizer(e);
  const { session, config } = await sessionFor(lang, e);
  const ids = await toIds(text, config.espeak.voice);
  const { noise_scale, length_scale, noise_w } = config.inference;
  const feeds: Record<string, unknown> = {
    input: new e.ort.Tensor("int64", ids, [1, ids.length]),
    input_lengths: new e.ort.Tensor("int64", [ids.length]),
    scales: new e.ort.Tensor("float32", [noise_scale, length_scale, noise_w]),
  };
  if (Object.keys(config.speaker_id_map ?? {}).length) feeds.sid = new e.ort.Tensor("int64", [0]);
  const out = await session.run(feeds);
  return { pcm: out.output.data as Float32Array, rate: config.audio.sample_rate as number };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Calls share one engine instance, so they run one after another.
let chain: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>) {
  const p = chain.then(fn);
  chain = p.catch(() => {});
  return p;
}

const recent = new Map<string, { pcm: Float32Array; rate: number }>();
let audio: AudioContext | null = null;
let playing: AudioBufferSourceNode | null = null;

/** Call inside the tap handler, before anything async: browsers only allow sound after a tap. */
export function unlockAudio() {
  audio ??= new AudioContext();
  if (audio.state === "suspended") void audio.resume();
}

/** Speak with the downloaded voice for this language. Rejects if it isn't downloaded. */
export async function speakNatural(text: string, code: string) {
  const lang = languageOf(code);
  if (!lang.model || !voiceReady(code)) throw new Error("no voice");
  const key = `${code}|${text}`;
  let clip = recent.get(key);
  if (!clip) {
    clip = await serial(() => synthesize(text, lang));
    recent.set(key, clip);
    if (recent.size > 40) recent.delete(recent.keys().next().value!);
  }
  unlockAudio();
  const ctx = audio!;
  const buffer = ctx.createBuffer(1, clip.pcm.length, clip.rate);
  buffer.copyToChannel(clip.pcm as Float32Array<ArrayBuffer>, 0);
  playing?.stop();
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(ctx.destination);
  src.start();
  playing = src;
}

/** Total size of a download for these languages, in MB, counting the engine if it's still needed. */
export function downloadSize(codes: string[]) {
  const langs = codes.map(languageOf).filter((l) => l.model && !voiceReady(l.code));
  if (!langs.length) return 0;
  const engineNeeded = !LANGUAGES.some((l) => voiceReady(l.code));
  return langs.reduce((n, l) => n + l.model!.mb, engineNeeded ? ENGINE_MB : 0);
}
