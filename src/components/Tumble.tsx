import type { ReactNode } from "react";

/**
 * A main button's label that tumbles over like a cube face on hover (CRANOLY.md → Motion → Action Pill).
 * The back face is drawn by CSS from `label`, so the text exists once for screen readers and tests.
 */
export default function Tumble({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="tumble" data-label={label}>
      <span className="tumble-front">{children}</span>
    </span>
  );
}
