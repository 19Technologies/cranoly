"use client";

import { useVault, vault } from "@/lib/store";
import { languageOf } from "@/lib/languages";
import { useSlider } from "@/lib/useSlider";
import { haptic } from "@/lib/native";

/** For people learning more than one language: which one Practice and the Dictionary show. The pill slides. */
export default function LanguageSwitch() {
  const { settings } = useVault();
  const box = useSlider<HTMLDivElement>(".is-on", settings.learning);
  if (settings.languages.length < 2) return null;
  return (
    <div ref={box} className="lang-switch has-slider" role="radiogroup" aria-label="Language">
      <span className="slider-pill" aria-hidden />
      {settings.languages.map((c) => (
        <button
          key={c}
          role="radio"
          aria-checked={c === settings.learning}
          className={c === settings.learning ? "is-on" : ""}
          onClick={() => {
            if (c !== settings.learning) haptic();
            vault.updateSettings({ learning: c });
          }}
        >
          {languageOf(c).name}
        </button>
      ))}
    </div>
  );
}
