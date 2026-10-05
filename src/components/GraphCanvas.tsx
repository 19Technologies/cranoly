"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ForceGraphMethods } from "react-force-graph-2d";
import { GraphData, GraphNode, rememberPositions } from "@/lib/graph";
import { cssVar, withAlpha } from "@/lib/theme";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

type Methods = ForceGraphMethods<GraphNode>;

export default function GraphCanvas({
  data,
  activeId,
  query = "",
  compact = false,
  onNodeClick,
}: {
  data: GraphData;
  activeId?: string | null;
  query?: string;
  compact?: boolean;
  onNodeClick: (node: GraphNode, e: MouseEvent) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const fg = useRef<Methods | undefined>(undefined);
  const hover = useRef<string | null>(null);
  const fitted = useRef(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const g = fg.current;
    if (!g) return;
    g.d3Force("charge")?.strength(compact ? -90 : -140);
    g.d3Force("link")?.distance(compact ? 42 : 60);
  }, [compact, data, size.width]);

  const q = query.trim().toLowerCase();

  const isLit = (id: string) => {
    const h = hover.current;
    if (!h) return true;
    return id === h || !!data.neighbours.get(h)?.has(id);
  };

  // Small dots, like stars: half the size they used to be. Busy notes are a little bigger.
  const radius = (n: GraphNode) => (compact ? 1.5 : 1.6) + Math.sqrt(n.degree) * (compact ? 0.5 : 0.7);

  // Each top-level folder gets its own colour from the --mm palette; notes at the top level use --mm-0.
  const folders = [...new Set(data.nodes.flatMap((n) => (n.folder ? [n.folder] : [])))].sort();
  const colourOf = (node: GraphNode) => {
    if (node.kind === "tag") return cssVar("--mm-tag", "#e088f2");
    if (node.kind === "ghost") return cssVar("--mm-ghost", "#5b648f");
    if (!node.folder) return cssVar("--mm-0", "#94a5f9");
    return cssVar(`--mm-${(folders.indexOf(node.folder) % 8) + 1}`, "#a677f8");
  };

  // Flat dots on a dark background: saturated colours, faint lines; the open note is the brightest; hovered links turn green.
  const drawNode = (node: GraphNode, ctx: CanvasRenderingContext2D, scale: number) => {
    const focused = cssVar("--mm-focus", "#ffffff");
    const text = cssVar("--mm-label", "#e6e8ff");
    const x = node.x ?? 0;
    const y = node.y ?? 0;
    const isOpen = node.noteId !== undefined && node.noteId === activeId;
    const r = radius(node) * (isOpen ? 1.6 : 1);
    const hovered = hover.current === node.id;
    const lit = isLit(node.id);
    const matches = !q || node.label.toLowerCase().includes(q);
    const dim = (!lit || !matches) && !isOpen;

    ctx.save();
    ctx.globalAlpha = dim ? 0.18 : 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = hovered || isOpen || (q && matches && node.kind === "note") ? focused : colourOf(node);
    ctx.fill();

    const showLabel = hovered || (hover.current && lit) || (q && matches) || scale > (compact ? 1.6 : 1.3);
    if (showLabel && !dim) {
      const fontSize = Math.max(10.5 / scale, 1.8);
      ctx.font = `${hovered ? 600 : 400} ${fontSize}px ${cssVar("--font-ui", "system-ui")}, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = withAlpha(text, hovered || isOpen ? 0.95 : 0.7);
      ctx.fillText(node.label, x, y + r + 2 / scale + 1);
    }
    ctx.restore();
  };

  const linkColor = (link: { source?: unknown; target?: unknown }) => {
    const s = (link.source as GraphNode)?.id;
    const t = (link.target as GraphNode)?.id;
    const line = cssVar("--mm-line", "rgba(170, 180, 255, 0.16)");
    // Links are the only thing drawn in green.
    if (hover.current && (s === hover.current || t === hover.current)) return cssVar("--mm-hot", "#c5e8b2");
    // Lines that aren't the hovered note's fade further while one is hovered.
    if (hover.current) return line.replace(/[\d.]+\)$/, (a) => `${Number(a.slice(0, -1)) * 0.4})`);
    return line;
  };

  return (
    <div ref={wrap} className={`graph-canvas${compact ? " is-compact" : ""}`}>
      {size.width > 0 && (
        <ForceGraph2D
          ref={fg as never}
          graphData={data as never}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          nodeRelSize={4}
          nodeVal={(n) => radius(n as GraphNode) / 2}
          nodeLabel={() => ""}
          nodeCanvasObject={(n, ctx, scale) => drawNode(n as GraphNode, ctx, scale)}
          nodePointerAreaPaint={(n, color, ctx) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            // The tap target stays finger-sized while the dot is small.
            ctx.arc(n.x ?? 0, n.y ?? 0, radius(n as GraphNode) + 6, 0, Math.PI * 2);
            ctx.fill();
          }}
          linkColor={linkColor as never}
          linkWidth={(l) => {
            const s = ((l as { source: GraphNode }).source as GraphNode)?.id;
            const t = ((l as { target: GraphNode }).target as GraphNode)?.id;
            return hover.current && (s === hover.current || t === hover.current) ? 1.2 : 0.7;
          }}
          autoPauseRedraw={false}
          cooldownTicks={compact ? 80 : 160}
          warmupTicks={compact ? 30 : 0}
          d3VelocityDecay={0.32}
          onEngineStop={() => {
            rememberPositions(data.nodes);
            if (compact || !fitted.current) fg.current?.zoomToFit(400, compact ? 44 : 120);
            fitted.current = true;
          }}
          onNodeHover={(n) => {
            hover.current = n ? (n as GraphNode).id : null;
            if (wrap.current) wrap.current.style.cursor = n ? "pointer" : "grab";
          }}
          onNodeClick={(n, e) => onNodeClick(n as GraphNode, e)}
          enableZoomInteraction={!compact || ((e: MouseEvent) => e.ctrlKey || e.metaKey)}
        />
      )}
    </div>
  );
}
