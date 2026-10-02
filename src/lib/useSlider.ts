"use client";

import { useLayoutEffect, useRef } from "react";

/** Where the pill sits: insets from the container's padding box. */
interface Box {
  l: number;
  t: number;
  r: number;
  b: number;
}

/** Jumps longer than this snap instead of stretching (CRANOLY.md → Motion → List selection). */
const LONG = 240;
/** How long the trailing edge waits, so the pill stretches as it travels (about 40% of the distance). */
const LAG = 18;
/** An edge landing this close to the container's inside stops without overshooting past it. */
const NEAR = 8;

/** The element's box inside `box`, from layout offsets (unaffected by a press squish in progress). */
function boxOf(el: HTMLElement, box: HTMLElement): Box | null {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== box) {
    x += node.offsetLeft;
    y += node.offsetTop;
    const parent = node.offsetParent as HTMLElement | null;
    if (parent && parent !== box) {
      x += parent.clientLeft;
      y += parent.clientTop;
    }
    node = parent;
  }
  if (node !== box) return null;
  return { l: x, t: y, r: box.clientWidth - x - el.offsetWidth, b: box.clientHeight - y - el.offsetHeight };
}

/**
 * A selection pill that travels between items instead of jumping. Put the returned ref on the
 * container (class `has-slider`) with `<span className="slider-pill" aria-hidden />` inside it;
 * `selector` finds the chosen item and `key` changes whenever the choice (or the items' order) does.
 * The leading edge moves first and the trailing edge follows, so the pill stretches, then settles.
 */
export function useSlider<T extends HTMLElement>(selector: string, key: unknown) {
  const ref = useRef<T>(null);
  const last = useRef<Box | null>(null);

  useLayoutEffect(() => {
    const box = ref.current;
    if (!box) return;
    const s = box.style;
    const set = (name: string, value: string) => s.setProperty(name, value);

    const place = (animate: boolean) => {
      const el = box.querySelector<HTMLElement>(selector);
      const next = el ? boxOf(el, box) : null;
      if (!next) {
        box.dataset.slider = "off";
        last.current = null;
        return;
      }
      const prev = last.current;
      const moving = animate && !!prev && box.dataset.slider === "on";
      if (moving) {
        const dx = (next.l - next.r - (prev.l - prev.r)) / 2;
        const dy = (next.t - next.b - (prev.t - prev.b)) / 2;
        const far = Math.hypot(dx, dy) > LONG;
        set("--sd-l", !far && dx > 0 ? `${LAG}ms` : "0ms");
        set("--sd-r", !far && dx < 0 ? `${LAG}ms` : "0ms");
        set("--sd-t", !far && dy > 0 ? `${LAG}ms` : "0ms");
        set("--sd-b", !far && dy < 0 ? `${LAG}ms` : "0ms");
        const ease = (inset: number) => (far ? "var(--ease-snap)" : inset <= NEAR ? "var(--ease-out)" : "var(--ease-glide)");
        set("--se-l", ease(next.l));
        set("--se-r", ease(next.r));
        set("--se-t", ease(next.t));
        set("--se-b", ease(next.b));
        set("--s-dur", far ? "420ms" : "var(--dur-glide)");
      }
      set("--sl", `${next.l}px`);
      set("--sr", `${next.r}px`);
      set("--st", `${next.t}px`);
      set("--sb", `${next.b}px`);
      last.current = next;
      if (moving) return;
      // First placement, or the container changed size: put the pill there without travelling.
      box.dataset.slider = "set";
      requestAnimationFrame(() => {
        if (box.dataset.slider === "set") box.dataset.slider = "on";
      });
    };

    place(true);
    // The container or the chosen item changed size (a resize, fonts arriving): re-place, no travel.
    const ro = new ResizeObserver(() => {
      const el = box.querySelector<HTMLElement>(selector);
      const now = el ? boxOf(el, box) : null;
      const was = last.current;
      if (now && was && now.l === was.l && now.t === was.t && now.r === was.r && now.b === was.b) return;
      place(false);
    });
    ro.observe(box);
    const chosen = box.querySelector<HTMLElement>(selector);
    if (chosen) ro.observe(chosen);
    return () => ro.disconnect();
  }, [selector, key]);

  return ref;
}
