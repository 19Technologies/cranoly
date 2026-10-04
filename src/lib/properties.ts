// Properties: a block of "key: value" lines between two "---" lines at the very top of a note
// (YAML frontmatter). Notes show it as a small table; source mode shows it as typed.
import { JSON_SCHEMA, load } from "js-yaml";

export type PropertyValue = string | number | boolean | null | PropertyValue[];

export interface Frontmatter {
  /** The YAML between the two --- lines. */
  yaml: string;
  /** Lines the block takes, both --- lines included. */
  lines: number;
  /** Characters the block takes, up to and including the line break after the closing ---. */
  length: number;
}

const FENCE = /^---[ \t]*$/;
const CLOSE = /^(?:---|\.\.\.)[ \t]*$/;

/** The properties block at the top of a note, or null when the note doesn't start with one. */
export function frontmatterOf(content: string): Frontmatter | null {
  if (!content.startsWith("---")) return null;
  const lines = content.split("\n");
  if (!FENCE.test(lines[0].replace(/\r$/, ""))) return null;
  for (let i = 1; i < lines.length; i++) {
    if (!CLOSE.test(lines[i].replace(/\r$/, ""))) continue;
    const length = lines.slice(0, i + 1).join("\n").length + (i + 1 < lines.length ? 1 : 0);
    return { yaml: lines.slice(1, i).join("\n"), lines: i + 1, length };
  }
  return null;
}

/** A note's text without its properties block. */
export function bodyOf(content: string) {
  const fm = frontmatterOf(content);
  return fm ? content.slice(fm.length) : content;
}

/** The same text with the properties block's lines blanked out, so line numbers stay the same. */
export function blankFrontmatter(content: string) {
  const fm = frontmatterOf(content);
  if (!fm) return content;
  const lines = content.split("\n");
  for (let i = 0; i < fm.lines; i++) lines[i] = "";
  return lines.join("\n");
}

const flat = (v: unknown): PropertyValue => {
  if (v === null || typeof v === "string" || typeof v === "number" || typeof v === "boolean") return v;
  if (Array.isArray(v)) return v.map(flat);
  return JSON.stringify(v);
};

/**
 * The properties, in the order they're written. Values stay as text (dates too), except plain numbers and
 * true/false. Returns null when the block isn't readable YAML, so the raw lines can be shown instead.
 */
export function parseProperties(yaml: string): Array<{ key: string; value: PropertyValue }> | null {
  if (!yaml.trim()) return [];
  try {
    const data = load(yaml, { schema: JSON_SCHEMA });
    if (data === null || data === undefined) return [];
    if (typeof data !== "object" || Array.isArray(data)) return null;
    return Object.entries(data as Record<string, unknown>).map(([key, value]) => ({ key, value: flat(value) }));
  } catch {
    return null;
  }
}

/** Tags listed in the block ("tags: [German, Class]", a "- German" list, or "tags: German, Class"). */
export function propertyTags(content: string): string[] {
  const fm = frontmatterOf(content);
  if (!fm) return [];
  const props = parseProperties(fm.yaml) ?? [];
  const out: string[] = [];
  for (const { key, value } of props) {
    if (!/^tags?$/i.test(key)) continue;
    const items = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[,\s]+/) : [];
    for (const item of items) {
      const tag = String(item ?? "").trim().replace(/^#/, "");
      if (/^[\p{L}_][\p{L}\p{N}_/-]*$/u.test(tag)) out.push(tag);
    }
  }
  return out;
}

/** "2026-10-4" → "4 Oct 2026" in your locale's order. Anything else comes back unchanged. */
export function showDate(value: string) {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value.trim());
  if (!m) return value;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (date.getMonth() !== Number(m[2]) - 1) return value;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/** Start a note's properties: tags and today's date. Returns the new text and where the cursor goes (after "tags: "). */
export function withProperties(content: string, today: string) {
  if (frontmatterOf(content)) return null;
  const block = `---\ntags: \ncreated: ${today}\n---\n`;
  return { content: block + content, caret: "---\ntags: ".length };
}
