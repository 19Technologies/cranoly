// remark plugin: [[wikilinks]], ==highlights==, #tags, > [!callouts], the properties block and flashcard lines.
import { CALLOUT_RE, calloutTitle } from "./callouts";
import { parseProperties, showDate, type PropertyValue } from "./properties";
import { parseWikiInner } from "./links";

interface MdNode {
  type: string;
  value?: string;
  url?: string;
  children?: MdNode[];
  data?: { hName?: string; hProperties?: Record<string, unknown> };
}

const SKIP = new Set(["code", "inlineCode", "link", "linkReference", "html", "definition", "image"]);
const INLINE_RE = /\[\[([^\[\]\n]+?)\]\]|==([^=\n]+)==|(^|[\s(])#([\p{L}_][\p{L}\p{N}_/-]*)/gu;
const SEPARATOR = /\s(:{2,3})\s/;

const text = (value: string): MdNode => ({ type: "text", value });
const span = (className: string, children: MdNode[], extra: Record<string, unknown> = {}): MdNode => ({
  type: "kbSpan",
  data: { hName: "span", hProperties: { className: [className], ...extra } },
  children,
});

function splitInline(value: string): MdNode[] {
  const out: MdNode[] = [];
  let last = 0;
  for (const m of value.matchAll(INLINE_RE)) {
    let start = m.index!;
    if (m[4] !== undefined) {
      if (/^\d+$/.test(m[4])) continue;
      start += m[3].length; // keep the whitespace before a tag
    }
    if (start > last) out.push(text(value.slice(last, start)));
    if (m[1] !== undefined) {
      const { target, heading, alias } = parseWikiInner(m[1]);
      const label = alias ?? (heading ? `${target} › ${heading}` : target);
      out.push({
        type: "link",
        url: `#wiki/${encodeURIComponent(heading ? `${target}#${heading}` : target)}`,
        children: [text(label)],
      });
    } else if (m[2] !== undefined) {
      out.push({ type: "kbMark", data: { hName: "mark" }, children: [text(m[2])] });
    } else {
      out.push({
        type: "link",
        url: `#tag/${encodeURIComponent(m[4])}`,
        children: [text(`#${m[4]}`)],
        data: { hProperties: { className: ["tag"] } },
      });
    }
    last = m.index! + m[0].length;
  }
  if (last < value.length) out.push(text(value.slice(last)));
  if (!out.length) out.push(text(value));
  // Single line breaks show as breaks, as people expect in notes ("strict line breaks" off).
  return out.flatMap((n) =>
    n.type === "text" && n.value!.includes("\n")
      ? n.value!.split("\n").flatMap((part, i) => (i ? [{ type: "break" }, ...(part ? [text(part)] : [])] : part ? [text(part)] : []))
      : [n],
  );
}

function walkInline(node: MdNode) {
  if (!node.children || SKIP.has(node.type)) return;
  node.children = node.children.flatMap((child) => {
    if (child.type === "text" && child.value) return splitInline(child.value);
    walkInline(child);
    return [child];
  });
}

/** Split a paragraph's inline children into visual lines at "\n". */
function toLines(children: MdNode[]): MdNode[][] {
  const lines: MdNode[][] = [[]];
  for (const c of children) {
    if (c.type === "text" && c.value?.includes("\n")) {
      c.value.split("\n").forEach((part, i) => {
        if (i > 0) lines.push([]);
        if (part) lines[lines.length - 1].push(text(part));
      });
    } else lines[lines.length - 1].push(c);
  }
  return lines;
}

const plain = (nodes: MdNode[]) => nodes.map((n) => (n.type === "text" ? n.value : "\u0000")).join("");

/** Rejoin lines. Next to a card line (a block) a plain newline is kept instead of a <br>. */
const SOFT = (): MdNode => ({ type: "kbNewline", value: "\n" });
const isCard = (l: MdNode[]) => l.length === 1 && l[0].type === "kbSpan";
function joinLines(lines: MdNode[][]): MdNode[] {
  return lines.flatMap((l, i) => (i ? [isCard(l) || isCard(lines[i - 1]) ? SOFT() : text("\n"), ...l] : l));
}

function cardLine(line: MdNode[]): MdNode | null {
  const idx = line.findIndex((n) => n.type === "text" && SEPARATOR.test(n.value!));
  if (idx === -1) return null;
  const node = line[idx];
  const m = SEPARATOR.exec(node.value!)!;
  const before = [...line.slice(0, idx), text(node.value!.slice(0, m.index))];
  const after = [text(node.value!.slice(m.index + m[0].length)), ...line.slice(idx + 1)];
  const two = m[1] === ":::";
  return span("card-line", [
    span("card-front", before),
    span("card-sep", [text(two ? "⇄" : "→")], { title: two ? "Two-way card" : "Card" }),
    span("card-back", after, { tabIndex: 0 }),
  ]);
}

function markCards(node: MdNode) {
  if (!node.children || SKIP.has(node.type)) return;
  if (node.type !== "paragraph") return node.children.forEach(markCards);
  const lines = toLines(node.children);
  const q = lines.findIndex((l) => /^\s*\?{1,2}\s*$/.test(plain(l)));
  if (q > 0 && q < lines.length - 1) {
    node.children = [
      span("card-multi", [
        span("card-front", joinLines(lines.slice(0, q))),
        span("card-sep", [text(plain(lines[q]).trim() === "??" ? "⇅" : "?")]),
        span("card-back", joinLines(lines.slice(q + 1)), { tabIndex: 0 }),
      ]),
    ];
    return;
  }
  let changed = false;
  const out = lines.map((l) => {
    const card = cardLine(l);
    if (card) changed = true;
    return card ? [card] : l;
  });
  if (changed) node.children = joinLines(out);
}

function markCallouts(node: MdNode) {
  if (!node.children || SKIP.has(node.type)) return;
  node.children.forEach(markCallouts);
  if (node.type !== "blockquote") return;
  const para = node.children[0];
  const first = para?.type === "paragraph" ? para.children?.[0] : undefined;
  const m = first?.type === "text" ? CALLOUT_RE.exec(first.value!) : null;
  if (!para || !first || !m) return;
  const kind = m[1].toLowerCase();
  const fold = m[2];
  first.value = first.value!.slice(m[0].length).replace(/^\n/, "");
  if (!first.value) para.children!.shift();
  // "+" and "-" make it fold: a <details> that starts open or shut, its title the <summary>.
  node.data = {
    ...(fold ? { hName: "details" } : {}),
    hProperties: { className: ["callout"], "data-callout": kind, ...(fold === "+" ? { open: true } : {}) },
  };
  node.children.unshift({
    type: "kbCalloutTitle",
    data: { hName: fold ? "summary" : "div", hProperties: { className: ["callout-title"] } },
    children: [text(m[3] || calloutTitle(kind))],
  });
  if (!para.children!.length) node.children.splice(1, 1);
}

/** An element with a tag and class, for building the properties table. */
const el = (hName: string, className: string | null, children: MdNode[]): MdNode => ({
  type: "kbEl",
  data: { hName, hProperties: className ? { className: [className] } : {} },
  children,
});

/** One property's value: tags as tag links, lists as chips, dates in words, "Yes" or "No". */
function valueNodes(key: string, value: PropertyValue): MdNode[] {
  const items = Array.isArray(value) ? value : null;
  if (/^tags?$/i.test(key) && value !== null) {
    return (items ?? String(value).split(/[,\s]+/))
      .map((t) => String(t ?? "").replace(/^#/, "").trim())
      .filter(Boolean)
      .map((tag) => ({
        type: "link",
        url: `#tag/${encodeURIComponent(tag)}`,
        children: [text(`#${tag}`)],
        data: { hProperties: { className: ["tag"] } },
      }));
  }
  if (items) return items.map((item) => el("span", "prop-chip", [text(String(item ?? ""))]));
  if (value === null || value === "") return [];
  return [text(typeof value === "boolean" ? (value ? "Yes" : "No") : typeof value === "string" ? showDate(value) : String(value))];
}

/** The properties block at the top of a note (remark-frontmatter's "yaml" node), drawn as a small table. */
function markProperties(tree: MdNode) {
  const first = tree.children?.[0];
  if (first?.type !== "yaml") return;
  const props = parseProperties(first.value ?? "");
  const body = props
    ? [
        el(
          "dl",
          "properties-list",
          props.map(({ key, value }) => {
            const nodes = valueNodes(key, value);
            return el("div", "properties-row", [el("dt", null, [text(key)]), el("dd", nodes.length ? null : "is-empty", nodes)]);
          }),
        ),
      ]
    : [{ type: "code", value: first.value ?? "" }, el("p", "properties-error", [text("Couldn’t read these properties.")])];
  tree.children![0] = el("div", "properties", [el("div", "properties-title", [text("Properties")]), ...body]);
}

export function remarkWiki(options: { cards?: boolean } = {}) {
  return (tree: MdNode) => {
    markProperties(tree);
    markCallouts(tree);
    if (options.cards) markCards(tree);
    walkInline(tree);
  };
}
