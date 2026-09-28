"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2, Plus, Volume2 } from "lucide-react";
import { useVault, vault } from "@/lib/store";
import { LANGUAGES, languageOf } from "@/lib/languages";
import { useMeaning } from "@/lib/useMeaning";
import { haptic } from "@/lib/native";
import { say } from "@/lib/smart";

const HELLO: Record<string, string> = {
  de: "Hallo", es: "Hola", fr: "Bonjour", en: "Hello", it: "Ciao", pt: "Olá", nl: "Hallo", sv: "Hej", pl: "Cześć",
  ru: "Привет", uk: "Привіт", ja: "こんにちは", zh: "你好", ko: "안녕하세요", ar: "مرحبا", tr: "Merhaba", sw: "Jambo",
};
const FEATURED = ["de", "es", "fr", "en", "it", "pt", "ja", "sw"];

function Dots({ step }: { step: number }) {
  return (
    <div className="wc-dots" aria-label={`Step ${step + 1} of 3`}>
      {[0, 1, 2].map((i) => (
        <i key={i} className={i <= step ? "is-on" : ""} />
      ))}
    </div>
  );
}

/** Step 1: pick the language. One tap moves on. */
function PickLanguage({ onPick }: { onPick: () => void }) {
  const { settings } = useVault();
  const pick = (code: string) => {
    vault.updateSettings({ learning: code });
    onPick();
  };
  return (
    <>
      <h1 className="wc-title">What are you learning?</h1>
      <div className="wc-langs">
        {FEATURED.map((code) => (
          <button key={code} className="wc-lang" onClick={() => pick(code)}>
            <b>{languageOf(code).name}</b>
            <span>{HELLO[code]}</span>
          </button>
        ))}
      </div>
      <label className="wc-more">
        <span>Something else?</span>
        <select value="" onChange={(e) => e.target.value && pick(e.target.value)}>
          <option value="">More languages…</option>
          {LANGUAGES.filter((l) => !FEATURED.includes(l.code)).map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      </label>
      <label className="wc-speak">
        <span>I speak</span>
        <select value={settings.native} onChange={(e) => vault.updateSettings({ native: e.target.value })}>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

/** Step 2: add a first word. The meaning fills itself in. */
function FirstWord({ onAdded, onSkip }: { onAdded: (front: string, back: string) => void; onSkip: () => void }) {
  const { settings } = useVault();
  const lang = languageOf(settings.learning);
  const [word, setWord] = useState("");
  const [typed, setTyped] = useState<string | null>(null);
  const found = useMeaning(word, lang, settings.onlineLookups);
  const meaning = typed ?? (found.status === "found" ? found.meaning ?? "" : "");
  const front = found.status === "found" && found.front ? found.front : word.trim();
  const add = () => {
    if (!word.trim() || !meaning.trim()) return;
    vault.addCard(front, meaning);
    haptic("success");
    onAdded(front, meaning.trim());
  };
  return (
    <>
      <h1 className="wc-title">Add your first {lang.name} word.</h1>
      <p className="wc-text">Type any word. Cranoly finds what it means and turns it into a flashcard.</p>
      {lang.starter && (
        <div className="wc-chips">
          {lang.starter.map((w) => (
            <button key={w} className={`chip${word === w ? " on" : ""}`} onClick={() => { setWord(w); setTyped(null); }}>
              {w}
            </button>
          ))}
        </div>
      )}
      <div className="wc-form">
        <input
          className="wc-input"
          value={word}
          placeholder={`A ${lang.name} word`}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          onChange={(e) => {
            setWord(e.target.value);
            setTyped(null);
          }}
        />
        <div className="wc-meaning">
          <input
            className="wc-input"
            value={meaning}
            placeholder={found.status === "loading" ? "Looking it up…" : "Meaning"}
            enterKeyHint="done"
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          {found.status === "loading" && <Loader2 size={16} className="spin" />}
        </div>
        {front !== word.trim() && word.trim() && <p className="wc-fine">It will be saved as <b>{front}</b>.</p>}
      </div>
      <div className="wc-foot">
        <button className="btn btn-ghost btn-lg" onClick={onSkip}>
          Skip for now
        </button>
        <button className="btn btn-primary btn-lg" onClick={add} disabled={!word.trim() || !meaning.trim()}>
          <Plus size={17} /> Add word
        </button>
      </div>
    </>
  );
}

/** Step 3: flip the card you just made. */
function TryIt({ card, onDone }: { card: { front: string; back: string } | null; onDone: () => void }) {
  const { settings } = useVault();
  const lang = languageOf(settings.learning);
  const [flipped, setFlipped] = useState(false);
  if (!card) {
    return (
      <>
        <h1 className="wc-title">You’re all set.</h1>
        <ul className="wc-tips">
          <li><b>＋</b> adds a word. The meaning fills itself in.</li>
          <li><b>Practice</b> shows your cards. Tap to flip, swipe for the next.</li>
          <li><b>Notes</b> are for everything else: lessons, texts, ideas.</li>
        </ul>
        <div className="wc-foot">
          <button className="btn btn-primary btn-lg" onClick={onDone}>
            Start using Cranoly <ArrowRight size={17} />
          </button>
        </div>
      </>
    );
  }
  return (
    <>
      <h1 className="wc-title">{flipped ? "That’s it!" : "Now try it."}</h1>
      <p className="wc-text">
        {flipped ? "Look, think, flip. That’s all practice is. Add words any time with ＋." : "Say what it means in your head, then tap the card."}
      </p>
      <button
        className={`wc-card${flipped ? " is-flipped" : ""}`}
        onClick={() => {
          haptic();
          setFlipped((f) => !f);
        }}
        aria-label={flipped ? `Answer: ${card.back}` : `Card: ${card.front}. Tap to flip`}
      >
        <span className="wc-face wc-front">{card.front}</span>
        <span className="wc-face wc-back">{card.back}</span>
      </button>
      <button className="wc-say" onClick={() => say(card.front, lang)}>
        <Volume2 size={16} /> Hear it
      </button>
      <div className="wc-foot">
        <button className="btn btn-primary btn-lg" onClick={onDone} disabled={!flipped}>
          <Check size={17} /> Start using Cranoly
        </button>
      </div>
    </>
  );
}

function Flow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [card, setCard] = useState<{ front: string; back: string } | null>(null);
  const finish = () => {
    vault.updateSettings({ onboarded: true });
    router.push("/home");
  };
  return (
    <div className="wc-layer" data-no-swipe role="dialog" aria-modal="true" aria-label="Welcome to Cranoly">
      <div className="wc-card-panel">
        <div className="wc-top">
          <Dots step={step} />
          <button className="wc-skip" onClick={finish}>
            Skip
          </button>
        </div>
        <div className="wc-body" key={step}>
          {step === 0 && <PickLanguage onPick={() => setStep(1)} />}
          {step === 1 && (
            <FirstWord
              onAdded={(front, back) => {
                setCard({ front, back });
                setStep(2);
              }}
              onSkip={() => setStep(2)}
            />
          )}
          {step === 2 && <TryIt card={card} onDone={finish} />}
        </div>
      </div>
    </div>
  );
}

/** First launch: language, first word, first card. Shown once. */
export default function Welcome() {
  const { ready, settings } = useVault();
  return ready && !settings.onboarded ? <Flow /> : null;
}
