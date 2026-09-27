// Languages Cranoly knows how to speak, look up and check.

export interface Language {
  code: string;
  name: string;
  /** BCP 47 tag for the device's text-to-speech voices. */
  voice: string;
  /** LanguageTool language, or null when grammar checking isn't available. */
  grammar: string | null;
  /** Articles for grammatical gender (m / f / n), shown in front of nouns. */
  articles?: Partial<Record<"m" | "f" | "n", string>>;
  /** Very common words that are never worth a flashcard on their own. */
  common: string[];
}

export const LANGUAGES: Language[] = [
  {
    code: "de", name: "German", voice: "de-DE", grammar: "de-DE", articles: { m: "der", f: "die", n: "das" },
    common: "der die das den dem des ein eine einen einem einer eines und oder aber ist sind war bin bist hat habe haben ich du er sie es wir ihr mich mir dich dir sich uns euch mein dein sein nicht kein keine zu zum zur mit von vom für auf an am im in ins aus bei nach so wie was wer wo da dass auch noch schon nur sehr ja nein".split(" "),
  },
  {
    code: "fr", name: "French", voice: "fr-FR", grammar: "fr", articles: { m: "le", f: "la" },
    common: "le la les l un une des du de d et ou mais est sont suis es a ai as ont je tu il elle on nous vous ils elles me te se ne pas en dans sur pour par avec que qui ce cette ces mon ma mes son sa ses au aux y oui non très".split(" "),
  },
  {
    code: "es", name: "Spanish", voice: "es-ES", grammar: "es", articles: { m: "el", f: "la" },
    common: "el la los las un una unos unas y o pero es son soy eres está están estoy yo tú él ella nosotros vosotros ellos ellas me te se no en de del al con por para que mi mis tu tus su sus muy sí".split(" "),
  },
  {
    code: "it", name: "Italian", voice: "it-IT", grammar: "it", articles: { m: "il", f: "la" },
    common: "il lo la i gli le un uno una e o ma è sono sei ho hai ha io tu lui lei noi voi loro mi ti si non in di da del della con per che chi mio mia tuo tua suo sua molto sì".split(" "),
  },
  {
    code: "pt", name: "Portuguese", voice: "pt-PT", grammar: "pt-PT", articles: { m: "o", f: "a" },
    common: "o a os as um uma e ou mas é são sou estou está eu tu ele ela nós vós eles elas me te se não em de do da no na com por para que meu minha teu tua seu sua muito sim".split(" "),
  },
  { code: "nl", name: "Dutch", voice: "nl-NL", grammar: "nl", articles: { m: "de", f: "de", n: "het" }, common: "de het een en of maar is zijn ben ik jij je hij zij ze wij we jullie niet in op aan van met voor dat die wat ja nee".split(" ") },
  { code: "sv", name: "Swedish", voice: "sv-SE", grammar: "sv", common: "en ett och eller men är var jag du han hon vi ni de inte i på av med för att som det den ja nej".split(" ") },
  { code: "pl", name: "Polish", voice: "pl-PL", grammar: "pl-PL", common: "i a ale lub jest są jestem ja ty on ona my wy oni nie w na z do że to tak".split(" ") },
  { code: "ru", name: "Russian", voice: "ru-RU", grammar: "ru-RU", common: "и а но или это я ты он она мы вы они не в на с к по что как да нет".split(" ") },
  { code: "uk", name: "Ukrainian", voice: "uk-UA", grammar: "uk-UA", common: "і й а але або це я ти він вона ми ви вони не в у на з до що як так ні".split(" ") },
  { code: "ja", name: "Japanese", voice: "ja-JP", grammar: "ja-JP", common: [] },
  { code: "zh", name: "Chinese", voice: "zh-CN", grammar: "zh-CN", common: [] },
  { code: "ko", name: "Korean", voice: "ko-KR", grammar: null, common: [] },
  { code: "ar", name: "Arabic", voice: "ar-SA", grammar: "ar", common: [] },
  { code: "tr", name: "Turkish", voice: "tr-TR", grammar: null, common: "ve veya ama bir bu şu o ben sen biz siz onlar değil ile için da de mi evet hayır".split(" ") },
  { code: "sw", name: "Swahili", voice: "sw-KE", grammar: null, common: "na ya wa za la kwa ni si mimi wewe yeye sisi ninyi wao katika hii huu ndiyo hapana".split(" ") },
  {
    code: "en", name: "English", voice: "en-US", grammar: "en-US",
    common: "the a an and or but is are was were am be been i you he she it we they me him her us them my your his its our their not no yes in on at of to for with from by as that this these those what who how".split(" "),
  },
];

export const languageOf = (code: string) => LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];

/** The device's language, as one of ours (falls back to English). */
export function deviceLanguage() {
  if (typeof navigator === "undefined") return "en";
  const code = navigator.language?.slice(0, 2).toLowerCase();
  return LANGUAGES.some((l) => l.code === code) ? code : "en";
}
