"use client";

import { Check, Download, Loader2, RotateCcw, Trash2, Volume2 } from "lucide-react";
import { languageOf } from "@/lib/languages";
import { downloadVoice, removeVoice, useVoices, type VoiceState } from "@/lib/voices";
import { say } from "@/lib/smart";
import { toast } from "@/lib/store";

function status(state: VoiceState | undefined, mb: number) {
  switch (state?.status) {
    case "ready":
      return "Ready · works offline";
    case "waiting":
      return "Waiting…";
    case "downloading":
      return `Downloading… ${Math.round(state.progress * 100)}%`;
    case "error":
      return state.error ?? "Couldn’t download";
    default:
      return `${mb} MB`;
  }
}

/**
 * One row per language: its voice, download progress, and a way to hear or remove it.
 * `offer` shows a Download button on each row (onboarding has one button for all of them).
 */
export default function VoiceList({ codes, removable = false, offer = true }: { codes: string[]; removable?: boolean; offer?: boolean }) {
  const voices = useVoices();
  return (
    <ul className="voice-list">
      {codes.map((code) => {
        const lang = languageOf(code);
        const state = voices[code];
        const busy = state?.status === "downloading" || state?.status === "waiting";
        return (
          <li key={code} className={`voice-row${state?.status === "ready" ? " is-ready" : ""}`}>
            <span className="voice-text">
              <b>
                {lang.name}
                {lang.model?.name && <small> · {lang.model.name}</small>}
              </b>
              <span className={state?.status === "error" ? "voice-error" : undefined}>
                {lang.model ? status(state, lang.model.mb) : "Uses this device’s voice"}
              </span>
              {busy && (
                <span className="voice-progress" aria-hidden>
                  <i style={{ width: `${Math.round((state?.progress ?? 0) * 100)}%` }} />
                </span>
              )}
            </span>
            {lang.model && state?.status === "ready" && (
              <>
                <button className="icon-btn voice-btn" onClick={() => say(lang.hello, lang)} aria-label={`Hear the ${lang.name} voice`}>
                  <Volume2 size={17} />
                </button>
                {removable && (
                  <button
                    className="icon-btn voice-btn"
                    onClick={() => removeVoice(code).then(() => toast(`Removed the ${lang.name} voice`))}
                    aria-label={`Remove the ${lang.name} voice`}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                {!removable && <Check size={18} className="voice-done" aria-label="Downloaded" />}
              </>
            )}
            {lang.model && busy && <Loader2 size={17} className="spin voice-done" aria-hidden />}
            {lang.model && ((offer && (!state || state.status === "none")) || state?.status === "error") && (
              <button className="btn btn-sm" onClick={() => downloadVoice(code).catch(() => {})}>
                {state?.status === "error" ? <RotateCcw size={14} /> : <Download size={14} />}
                {state?.status === "error" ? "Try again" : "Download"}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
