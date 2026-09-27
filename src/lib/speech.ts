// "Hear it": pronunciation with the device's own text-to-speech voices. Works offline.
import { plainLine } from "./links";

export const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

function voiceFor(tag: string) {
  const voices = speechSynthesis.getVoices();
  const lang = tag.slice(0, 2).toLowerCase();
  const exact = voices.filter((v) => v.lang.replace("_", "-").toLowerCase() === tag.toLowerCase());
  const close = voices.filter((v) => v.lang.slice(0, 2).toLowerCase() === lang);
  const pick = (list: SpeechSynthesisVoice[]) => list.find((v) => v.localService) ?? list[0];
  return { voice: pick(exact) ?? pick(close), known: voices.length > 0 };
}

/** Speak text in a language. Returns false when the device has no voice for it. */
export function speak(text: string, tag: string) {
  if (!canSpeak()) return false;
  const clean = plainLine(text.replace(/==/g, "")).replace(/\s+/g, " ").trim();
  if (!clean) return true;
  const { voice, known } = voiceFor(tag);
  if (known && !voice) return false;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = voice?.lang ?? tag;
  if (voice) u.voice = voice;
  u.rate = 0.92;
  speechSynthesis.speak(u);
  return true;
}
