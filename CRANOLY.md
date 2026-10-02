# Cranoly — Style Reference
> a sticker notebook for words, on warm paper

**Theme:** light (Paper) and dark (Graphite)

**Lineage:** a hybrid of SLUSHDESIGN.md (slush.app) and Cranoly's own Tutora-based look. Cranoly keeps its identity: warm Paper, ink, Fraunces, one orange for actions, green for links, and the yellow flashcard. From Slush it takes the discipline: hairline ink outlines, pill controls, soft generous corners, no resting shadows, no gradients, a strict type scale, a shared sticker palette, and above all the **micro-animations**. Motion values are measured from slush.app's own CSS, not guessed.

**Status (Oct 2026):** the **Motion** section is live in the app. Colours, type and shapes describe the **full restyle**, which isn't built yet.

Cranoly should feel like a physical notebook full of stickers: pale paper, crisp ink lines, a few saturated stickers, and one bright yellow card you want to flip. Controls are soft pills cut out with a thin black line. Nothing floats on blurry shadows. Depth comes from outlines, colour and movement. Every touch answers with a small spring: things squish when pressed, selections slide instead of jumping, and labels tumble. The app stays calm enough to write in; the website is allowed to be loud.

## Tokens — Colors

### Paper (light)

| Name | Value | Token | Role |
|------|-------|-------|------|
| Ink | `#16141a` | `--ink` | Text, outlines, filled neutral buttons, the selection bar. Warmer than pure black, the hand-cut line around everything |
| Paper | `#fbf7f0` | `--paper` | App canvas and page background, the warm sheet everything sits on |
| Paper 2 | `#f4eee3` | `--paper-2` | Sidebar, grouped-list background, secondary bands. The warm counterpart of Slush's Concrete Gray |
| White | `#ffffff` | `--white` | Cards, sheets, inputs, ghost-button fills, the back of a flashcard |
| Mist | `#ede7dc` | `--mist` | Disabled fills, quiet tints, empty heatmap days |
| Sky Wash | `#dceeff` | `--sky-wash` | Pale blue band for heroes and marketing sections. Never a control colour |
| Action | `#ff5b3a` | `--action` | **The only action colour:** primary buttons, the current item marker, the streak flame. Ink text on top |
| Link | `#c5e8b2` | `--link-mark` | **Links only:** the soft highlight behind `[[linked words]]`. Link text stays ink, with a `#6fb35a` underline (`--link-line`) |
| Selection | `rgba(0,122,255,.24)` | `--selection` | Selected text, system blue. Nothing else is this blue |
| Danger | `#e5383b` | `--danger` | Delete confirmations and errors only |
| Text muted | `#4b4752` | `--text-muted` | Secondary text, metadata |
| Text faint | `#8c8793` | `--text-faint` | Placeholders, timestamps, hints |

### Sticker set

Shared across both themes. Stickers are **surfaces**, never actions or links. Text on a sticker is always Ink.

| Name | Value | Token | Role |
|------|-------|-------|------|
| Sun | `#ffd731` | `--sun` | The flashcard, the selected note row, word of the day. Cranoly's signature colour |
| Lilac | `#e9ccff` | `--lilac` | Tags, tag nodes on the Map, soft cards |
| Peach | `#ffe1d8` | `--peach` | Warm cards, folder colour, gentle notices |
| Mint | `#c3f6ce` | `--mint` | The app icon, the logo tile, folder colour. Not a success colour |
| Violet | `#5c4ade` | `--violet` | Deep accent: download and voice cards, the Android QR card. White text on top |
| Electric | `#4da2ff` | `--electric` | Decorative stickers and Map folder colour only. **Never** a button, link or state |

### Graphite (dark)

| Name | Value | Token |
|------|-------|-------|
| Ink (text) | `#f4efe6` | `--ink` |
| Paper | `#1b1b1e` | `--paper` |
| Paper 2 | `#212125` | `--paper-2` |
| White (cards) | `#26262b` | `--white` |
| Mist | `#2f2f35` | `--mist` |
| Line (chrome outlines) | `#4a4a52` | `--line` |
| Link | `rgba(197,232,178,.14)` mark, `#c5e8b2` text | `--link-mark`, `--link-text` |
| Selection | `rgba(10,132,255,.42)` | `--selection` |
| Text muted / faint | `#b9b4ac` / `#75717a` | `--text-muted` / `--text-faint` |

In Graphite, stickers keep their colours and their outlines stay **pure ink-black `#16141a`**, so they read as stickers on dark paper. Action orange is unchanged.

## Tokens — Typography

### Fraunces — Display: note titles, page titles, greetings, the flashcard word, marketing headlines · `--font-display`
- **Axes:** `opsz` 144 at display sizes, `SOFT` 100 (always), `WONK` 0 (always)
- **Weights:** 700 (subheads), 750 (app titles), 800 (display and flashcards)
- **Sizes:** 22, 30, 42, 56, 72 px in the app; 96, 160, 240 px on marketing pages
- **Line height:** 1.0 for app titles; 0.9 at 56–88 px; **0.84 at 96 px and up** (Slush's crushed leading, adjusted for a serif's taller ascenders)
- **Letter spacing:** -0.02em at 22–42 px, -0.035em at 56 px and up
- **Role:** Fraunces takes Lateral's place. Slush stacks a heavy grotesk into sculptural blocks; Cranoly does the same with a soft serif, so the words feel friendly but solid. Sentence case, never all caps.

### Instrument Sans — All UI, body, nav, buttons and labels · `--font-ui`
- **Weights:** 400 (note text), 500 (UI text and metadata), 600 (list titles), 700 (buttons, nav, labels)
- **Sizes:** 12, 13, 14, 15, 16, 18 px
- **Line height:** 1.35–1.55
- **Letter spacing:** -0.01em for body; **+0.03em** for buttons, nav and pill labels; +0.032em for uppercase micro labels
- **OpenType features:** `"tnum"` for every number that changes (card counts, streaks, timers), so digits don't jitter
- **Role:** Instrument Sans takes Aeonik Pro's place. Weight 500 does the quiet work and 700 with open tracking gives pill controls breathing room.

### Geist Mono — Card syntax and keyboard hints only · `--font-mono`
- 13 px, weight 500. Used for `::`, `[[`, `⌘K`. Never for prose.

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
|------|--------|--------|------|-------------|----------------|-------|
| caption | Instrument Sans | 500 | 12px | 1.5 | 0 | `--text-caption` |
| ui-sm | Instrument Sans | 500 | 13px | 1.35 | 0 | `--text-ui-sm` |
| ui | Instrument Sans | 500 | 14px | 1.4 | -0.01em | `--text-ui` |
| label | Instrument Sans | 700 | 13–14px | 1 | +0.03em | `--text-label` |
| body | Instrument Sans | 400 | 16px | 1.55 | -0.01em | `--text-body` |
| body-lg | Instrument Sans | 400 | 18px | 1.5 | -0.01em | `--text-body-lg` |
| subheading | Fraunces | 700 | 22px | 1.15 | -0.02em | `--text-subheading` |
| heading-sm | Fraunces | 750 | 30px | 1.05 | -0.02em | `--text-heading-sm` |
| heading | Fraunces | 800 | 42px | 1.0 | -0.02em | `--text-heading` |
| display | Fraunces | 800 | 72px | 0.9 | -0.035em | `--text-display` |
| display-lg | Fraunces | 800 | 160px | 0.84 | -0.035em | `--text-display-lg` (marketing only) |
| display-xl | Fraunces | 800 | 240px | 0.84 | -0.035em | `--text-display-xl` (marketing only) |

## Tokens — Spacing & Shapes

**Base unit:** 4px · **Density:** comfortable in lists, roomy on Home and in sheets

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 4 | 4px | `--space-4` |
| 8 | 8px | `--space-8` |
| 12 | 12px | `--space-12` |
| 16 | 16px | `--space-16` |
| 20 | 20px | `--space-20` |
| 24 | 24px | `--space-24` |
| 32 | 32px | `--space-32` |
| 40 | 40px | `--space-40` |
| 48 | 48px | `--space-48` |
| 64 | 64px | `--space-64` |
| 80 | 80px | `--space-80` |
| 128 | 128px | `--space-128` |

### Border Radius

| Element | Value |
|---------|-------|
| buttons, chips, switches, segmented controls, nav, search fields, toasts | 999px (pill) |
| cards, list groups, note rows, language tiles | 20px |
| sheets, dialogs, the welcome panel | 32px |
| flashcards | 28px |
| text inputs, textareas | 16px |
| icon tiles (logo tile, small square icons) | 12px |

Nothing that holds content goes under 16px. Only tiny icon tiles use 12px.

### Outlines and depth

| Use | Value |
|-----|-------|
| Chrome: inputs, chips, cards, ghost buttons, nav pills, switches | `1px solid var(--ink)` (Graphite: `1px solid var(--line)`) |
| Objects: flashcards, stickers, the primary action button | `2px solid #16141a` |
| Dividers inside a card | `1px solid rgba(22,20,26,.12)` |
| Focus | `2px solid var(--ink)` ring, 2px offset |
| Resting shadow | **none**, except the flashcard: `0 4px 0 #16141a` |
| Hover lift (objects only) | `0 3px 0 #16141a` plus `translate: 0 -1px` |
| Pressed | shadow `0`, `scale: .955` |

### Layout

- **App:** Apple Notes layout. Folders sidebar (260px), notes list (320px), then the note, with the text column capped at 700px. On phones: Home · Notes · ＋ · Practice · Search tab bar, one screen at a time.
- **Marketing:** full-bleed colour bands (Paper → Sky Wash → Paper 2), max width 1440px, 48px section gaps, asymmetric sticker collages.
- **Card padding:** 20–24px · **Element gap:** 4–12px · **Phone gutter:** 16px

## Components

### Action Pill (primary button)
**Role:** the single most important action on a screen: Start, Save, Add word, Start using Cranoly

`--action` fill, Ink text, Instrument Sans 700 at 14–15px with +0.03em, `2px solid #16141a` outline, pill radius. Height 48px (large) or 40px. Hover (pointer devices): the label **tumbles** (see Motion) and the button lifts with a `0 3px 0` pop. Press: `scale: .955`. Disabled: Mist fill, faint text, no motion. One per screen.

### Ink Pill
**Role:** strong neutral action: Done, Edit, toast actions, the selected segment

Ink fill, Paper text, 700 at 13–14px with +0.03em, pill. No outline needed.

### Ghost Pill (secondary button)
**Role:** everything next to the primary: Later, Cancel, Save & add another

White fill, `1px solid var(--ink)`, Ink text 700 with +0.03em, pill, height 40px. Hover fills Paper 2.

### Text Link
**Role:** inline links in notes (`[[Hund]]`) and in UI copy

Ink text with a soft `--link-mark` highlight behind linked words and a 1px `--link-line` underline. Hover: the highlight **wipes in** from the left (see Motion). Green appears nowhere else.

### Round Icon Button
**Role:** compact tools: ＋, ⚙, ⋯, close

40px circle, White fill, `1px solid var(--ink)` on stand-alone buttons (borderless inside toolbars). Hover: ＋ and ⚙ **rotate 90°**, ⋯ nudges, × rotates 90° the other way. Press: `scale: .955`.

### Switch
**Role:** on/off settings (Shuffle decks, Blur answers, Practice reminder)

Track 44×26 pill, `1px solid var(--ink)`. Off: White track, Ink knob. On: Ink track, White knob. Knob 18px, 4px inset. Motion: the knob **springs** across, **stretches** while held, and the track colour eases (see Motion). The label never changes weight.

### Segmented Control
**Role:** one choice out of 2–5: theme (Paper · Graphite · System), language on Home, side-panel tabs

Pill container, Paper 2 fill, `1px solid var(--ink)`, 4px padding. One **selection pill** (Ink fill, Paper text) **slides** to the chosen item. Items are 700 at 13px with +0.03em. The pill never fades between items: it always travels.

### Chip
**Role:** toggleable options and quick picks: starter words, Shuffle / Answer first, Format tasks

36px pill, White fill, `1px solid var(--ink)`, 600 at 14px. On: Sun fill and a small check that **pops** in. Press: `scale: .955`.

### Language Tile
**Role:** picking languages in the welcome

20px-radius card, White fill, `1px solid var(--ink)`, language name 700 with "hello" in that language below it. On: Sun fill and a round Ink check sticker that pops in at the corner.

### Note Row
**Role:** an item in the notes list

20px radius, transparent at rest. Title 700 at 14.5px; date and preview in `--text-muted` at 13px; card count with `tnum`. The selected row sits on a **Sun highlight that glides** from the previous row instead of jumping. Pinned notes show a small pin.

### Flashcard
**Role:** Cranoly's signature object, the yellow card you flip

Sun front, White back, `2px solid #16141a`, 28px radius, **the only resting shadow** (`0 4px 0 #16141a`). Front word in Fraunces 800 at 30–48px with line height 1.0. A speaker button sits under the word. Flip: rotateY 180° on the glide spring.

### Word Sticker
**Role:** decoration on marketing pages and empty states, like Slush's sticker confetti

A pill with a word and its meaning ("perro → dog"), Fraunces 700 at 16–20px, sticker fill, `2px solid #16141a`, rotated between -6° and 6°, never grid-aligned. **In the app, words come from the learner's own language**; fixed examples go stale. On hover a sticker **wobbles** 4° and lifts.

### Selection Bar
**Role:** the bar above selected text: Flashcard · Link | Explain · Hear · …

Ink pill, Paper text 700 at 13px. Flashcard and Link come first, then a 1.5px divider. It **springs in** from the selection (scale .92 → 1, 4px rise), and a Sun hover highlight slides between its buttons.

### Sheet
**Role:** bottom sheets on phones (Add a word, New flashcard, note menu) and dialogs

White, 32px top corners, `1px solid var(--ink)` top edge, a 36×4 Ink grab handle. Rises on the **sheet curve**; the backdrop fades. Menus anchored to a button **spring from the button** with their items arriving 12ms apart.

### Toast
**Role:** confirmations with an optional Undo

Ink pill, Paper text 500 at 14px, Undo as an inverted ghost pill. **Springs up** from the bottom; leaves with a 150ms fade and an 8px drop.

### Phone Tab Bar
**Role:** Home · Notes · ＋ · Practice · Search

White pill bar with `1px solid var(--ink)`, floating 12px above the bottom edge. The active tab sits on a **sliding Paper 2 pill**, and its icon **pops** (scale 1 → 1.12 → 1). The centre ＋ is a 48px Action circle that **rotates 90°** when pressed.

### Map Node
**Role:** a note on the Map (graph view)

A circle filled with its folder's sticker colour, `1px solid var(--ink)`, sized by cards plus links. The open note is Action orange; notes not written yet have a dashed outline and no fill; tags are Lilac rings. Labels are Instrument Sans 600 with a Paper halo. Links are soft ink; hovering a node turns its links green.

### Marquee Strip (marketing only)
Full-bleed Ink band, Paper text 700 at 12px with +0.032em, uppercase, scrolling greetings: HALLO · HOLA · BONJOUR · CIAO · OLÁ · HABARI · こんにちは. Pauses for reduced motion.

### Download Card (marketing only)
20px radius, Violet fill, `2px solid #16141a`: a White QR panel and the label "GET THE APP" in White 700 with +0.032em. On hover, the QR panel slides 1.25em sideways (Slush's QR move).

## Motion

Slush's secret is that motion **lands fast and settles playfully**. Its main curve reaches its target in about a sixth of its duration, overshoots by 14%, and then rocks back into place. Cranoly uses Slush's exact curves for small things, and a gentler glide for anything that travels a long way.

### Principles

1. **Arrive fast, settle slow.** The value reaches its target in under 150ms; the remaining time is the springy settle. Interactions never feel slow, even at 850ms.
2. **Nothing snaps.** Every state change animates: toggles, selections, sheets, counts. The exceptions are typing and the caret.
3. **Selections travel.** When the chosen item changes, one indicator moves from the old item to the new one. It never fades out and in.
4. **Small things bounce, big things glide.** Overshoot scales with distance, so long moves use the gentler glide curve.
5. **Everything pressable squishes.** `scale: .955` on press, sprung back on release. Wide rows (notes, sidebar, menu items) press to `.985`, so a whole row never lurches.
6. **Transform, opacity, colour and clip-path only.** Never animate layout on content, so it stays at 60fps on a budget phone like a Galaxy A23.
7. **Interruptible.** Use transitions, not one-shot animations, wherever a user can change their mind mid-motion.

### Tokens — Curves

| Name | Value | Token | Use |
|------|-------|-------|-----|
| Elastic | `linear(0, 0.5737 7.6%, 0.8382 11.87%, 0.9463 14.19%, 1.0292 16.54%, 1.0886 18.97%, 1.1258 21.53%, 1.137 22.97%, 1.1424 24.48%, 1.1423 26.1%, 1.1366 27.86%, 1.1165 31.01%, 1.0507 38.62%, 1.0219 42.57%, 0.9995 46.99%, 0.9872 51.63%, 0.9842 58.77%, 1.0011 81.26%, 1)` | `--ease-elastic` | Slush's spring: 14% overshoot. Press, knobs, rotations, tumbles, icon moves: anything under ~40px |
| Glide | `linear(0, 0.3336 3%, 0.6 6%, 0.7936 9%, 0.922 12%, 0.9987 15%, 1.0449 19%, 1.0522 24%, 1.0342 30%, 1.0128 37%, 1.0011 45%, 0.9985 55%, 0.9996 68%, 1)` | `--ease-glide` | Cranoly's damped spring: 5% overshoot, on target at 15%. Sliding pills, list highlights, flashcard flips, sheets on desktop |
| Bounce | `linear(0, 1.3, 1, 0.92, 1, 0.99, 1, 1.004, 0.998, 1)` | `--ease-bounce` | Slush's pop: 30% overshoot. Only for tiny appearances: checks, badges, tab icons |
| Snap | `cubic-bezier(0.65, 0.05, 0, 1)` | `--ease-snap` | Slush's wipe: slow start, fast finish. Underline wipes, long list jumps, page wipes |
| Out | `cubic-bezier(0.22, 1, 0.36, 1)` | `--ease-out` | Plain arrivals with no overshoot: fades in, edges of pills moving to the first or last item |
| Color | `cubic-bezier(0.216, 0.62, 0.356, 1)` | `--ease-color` | Slush's colour ease: backgrounds, text and outline colours |
| Sheet | `cubic-bezier(0.32, 0.72, 0, 1)` | `--ease-sheet` | Bottom sheets and drawers on phones |

### Tokens — Durations

| Name | Value | Token | Use |
|------|-------|-------|-----|
| Fade | 150ms | `--dur-fade` | Opacity in and out, leaving toasts, label colour swaps |
| Color | 200ms | `--dur-color` | Background, text and outline colour changes |
| Pop | 420ms | `--dur-pop` | Checks, badges, icon pops (Bounce) |
| Glide | 460ms | `--dur-glide` | Sliding pills and highlights (Glide) |
| Press | 500ms | `--dur-press` | The spring back from a press; switch knobs (Elastic) |
| Sheet | 520ms | `--dur-sheet` | Sheets and drawers |
| Default | 750ms | `--dur-default` | Tumble rotations, hover rotations, wobbles (Elastic) |
| Medium | 850ms | `--dur-medium` | Tumble travel, flashcard flip |
| Long | 1000ms | `--dur-long` | Logo spin only |

### Component motion

| Moment | What moves | Duration · curve | Detail |
|--------|-----------|------------------|--------|
| **Press** any pressable | `scale: .955` (wide rows `.985`) | press · elastic | Down and back on the same spring. Uses the independent `scale` property, so it never fights other transforms |
| **Switch** toggled | knob `translate` 18px | press · elastic | Knob overshoots ~2.5px and rocks back. The track colour changes over color · color |
| **Switch** held | knob `scale: 1.33 1` | press · elastic | The knob stretches towards its travel direction (origin left when off, right when on), like iOS |
| **Segmented / tabs** changed | one pill's edges | glide · glide | The leading edge leaves first and the trailing edge follows 18ms later, so the pill **stretches** by about 40% of the distance, then settles. An edge landing at the container's side uses Out, so it never pokes past it. Moves over 240px use Snap at 420ms with no stretch |
| Segment label | text colour | fade · color, 60ms delay | Swaps as the pill arrives under it |
| **List selection** changed | Sun highlight's top and bottom edges | glide · glide | Same stretch. Jumps over 240px use Snap at 420ms with no stretch. When an edit moves the open note up the list, the highlight travels with it |
| **Tab bar** changed | pill slides; new icon `scale` 1 → 1.12 → 1 | glide · glide; pop · bounce | Haptic selection tick in the Android app |
| **Chip** turned on | fill colour; check `scale` 0 → 1 and `rotate` -25° → 0 | color · color; pop · bounce | Turning off: the check fades out in 150ms (leaving is always faster than arriving) |
| **Language tile** picked | Sun fill; corner check sticker pops | color · color; pop · bounce | — |
| **Action Pill** hover | label tumbles: front face to `rotate: 1 0 0 85deg`, `translate: 0 -0.95em -1.5em`, fading out; back face (text only) springs in from `rotate: 1 0 0 -90deg`, `translate: 0 0.95em -1.5em` | medium (translate) and default (rotate) · elastic; fade 150ms out / 75ms in | Slush's button, applied to the label inside a clipped pill, perspective 500px. Pointer devices only |
| **Round button** hover | ＋ and ⚙ `rotate: 90deg`; × `rotate: -90deg` | press · elastic | — |
| Logo hover | `rotate: 360deg` | long · elastic | — |
| Arrow in a button, hover | `translate: 3px 0` | press · elastic | — |
| **Link** hover | the green mark wipes in, `scale: 0 1 → 1 1` from the left | 400ms · snap | Wipes out to the right on leave |
| **Selection bar** appears | `scale: .92 → 1`, rise 4px, fade | press · elastic | Its hover highlight slides between buttons (glide) |
| **Sheet** opens / closes | `translate` 100% → 0 | sheet · sheet / 280ms · out | Backdrop fades over fade · color |
| **Menu** opens | `scale: .96 → 1` from the button, fade | press · elastic | Items rise 4px with a stagger of 12ms each (max 10) |
| **Toast** arrives / leaves | rise 16px with `scale: .98 → 1` / fade and an 8px drop | press · elastic / fade · out | — |
| **Flashcard** flips | `rotate: y 180deg` | medium · glide | 5% overshoot reads as a real card settling. Next card: rises 12px from `scale: .96` |
| **Count** changes | digits roll vertically | default · elastic | `tnum` so the width doesn't jump |
| **Sticker** hover | `rotate` +4°, `translate: 0 -3px` | default · elastic | Decoration only |
| **Theme** switched | sun ↔ moon icon `rotate: 180deg` while swapping | default · elastic | Colours cross-fade over color · color |

### Choreography rules

- **Leaving is faster than arriving:** about 0.6× the duration, with no overshoot.
- **One overshoot per gesture.** If a pill glides, its label doesn't also bounce.
- **Stagger lists by 12ms per item, at most 10 items**, then the rest arrive together.
- **Don't animate while typing.** The editor, caret and text never move; motion lives around the text.
- **Route changes:** tab screens fade in over 150ms and rise 8px on Out. Opening a note is instant, because writing can't wait.

### Reduced motion

With `prefers-reduced-motion: reduce`: no transforms. Pills and highlights jump into place. Flips, sheets and toasts become 120ms fades, tumbles become plain colour changes, and the marquee pauses. Colour transitions stay, at 120ms.

### Haptics (Android app)

| Moment | Haptic |
|--------|--------|
| Switch toggled | light impact |
| Segment, tab or list selection changed | selection tick |
| Card saved, deck finished | success |
| Delete confirmed | medium impact |

### Recipes

```css
/* Press: every pressable element squishes and springs back. */
.btn, .chip, .icon-btn, .tool, .nl-row, .seg-item {
  transition: scale var(--dur-press) var(--ease-elastic),
              background-color var(--dur-color) var(--ease-color),
              color var(--dur-color) var(--ease-color);
}
.btn:active, .chip:active, .icon-btn:active, .tool:active, .nl-row:active, .seg-item:active { scale: .955; }

/* Switch: the knob springs across and stretches while held. */
.switch-track::after {
  transition: translate var(--dur-press) var(--ease-elastic), scale var(--dur-press) var(--ease-elastic);
  transform-origin: left center;
}
.switch input:checked + .switch-track::after { translate: 18px 0; transform-origin: right center; }
.switch:active .switch-track::after { scale: 1.33 1; }

/* Sliding selection: one pill rides CSS variables set by useSlider() (src/lib/useSlider.ts):
   --sl/--sr/--st/--sb place its edges, --sd-* delay the trailing edges, --se-* pick each edge's curve. */
:where(.has-slider) { position: relative; }
:where(.has-slider) > :where(:not(.slider-pill)) { position: relative; z-index: 1; }
.slider-pill {
  position: absolute; z-index: 0; pointer-events: none;
  left: var(--sl); right: var(--sr); top: var(--st); bottom: var(--sb);
  transition: left var(--s-dur, var(--dur-glide)) var(--se-l, var(--ease-glide)) var(--sd-l, 0ms),
              right var(--s-dur, var(--dur-glide)) var(--se-r, var(--ease-glide)) var(--sd-r, 0ms),
              top var(--s-dur, var(--dur-glide)) var(--se-t, var(--ease-glide)) var(--sd-t, 0ms),
              bottom var(--s-dur, var(--dur-glide)) var(--se-b, var(--ease-glide)) var(--sd-b, 0ms);
}
/* Each container's pill wears what the chosen item used to wear, and the item goes transparent. */
.nl-scroll.has-slider > .slider-pill { background: var(--sun); border-radius: 20px; }
.nl-scroll.has-slider .nl-row.is-active { background: transparent; }

/* Pop: a check or badge appearing. */
@keyframes pop-in { from { scale: 0; rotate: -25deg; } }
.chip.on .chip-check { animation: pop-in var(--dur-pop) var(--ease-bounce); }

/* Link wipe. */
.ed-link { background: linear-gradient(var(--link-mark), var(--link-mark)) no-repeat 0 100% / 0% 100%;
           transition: background-size 400ms var(--ease-snap); }
.ed-link:hover { background-size: 100% 100%; }
```

The link wipe uses a single-colour `linear-gradient` only because `background-size` needs an image. It is a flat fill, not a gradient.

## Do's and Don'ts

### Do
- Keep **orange for the one primary action** (and "current") on each screen; everything else is Ink, White or a sticker colour.
- Keep **green for links only** and **blue for text selection only**.
- Outline controls and cards in `1px` Ink, and objects (flashcards, stickers, the primary button) in `2px`.
- Make every control a pill, and give every content surface a 20–32px radius.
- Animate every state change with the Motion tokens. Selections slide, presses squish, checks pop.
- Use Fraunces 800 with crushed leading (0.84–0.9) for anything 56px and up.
- Use `tnum` for every number that changes.
- Use the learner's own language for any example word in the app.
- On marketing pages, use several sticker colours per screen and alternate colour bands, like Slush.

### Don't
- Don't use blurred shadows or resting shadows. The flashcard's hard pop is the single exception.
- Don't use gradients as colour. Flat fills only.
- Don't use glowing or pulsing dots anywhere. Status markers are solid rules or pills.
- Don't use more than two sticker colours in one app view, and never Electric blue as a control.
- Don't fade between selected items. The indicator must travel. In React, use `useSlider` and a `.slider-pill` inside the container instead of styling the chosen item's own background.
- Don't use Elastic for moves over ~40px (use Glide) or Bounce for anything bigger than an icon.
- Don't animate `width`, `height`, `top` or `left` on content. Use transform-family properties; the slider pill (a tiny absolute element) is the only exception.
- Don't let motion run longer than 1s, or block input while it runs.
- Don't use display sizes above 96px inside the app.
- Don't put fixed German (or any single language) example content on screens all learners see.

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 1 | Paper | `#fbf7f0` | App canvas and note background |
| 2 | Paper 2 | `#f4eee3` | Sidebar, grouped lists, segmented control tracks |
| 3 | White | `#ffffff` | Cards, sheets, inputs, flashcard backs |
| 4 | Sticker surfaces | Sun / Lilac / Peach / Mint | Highlight cards: word of the day, the selected note, Home panels |
| 5 | Ink | `#16141a` | Selection bar, toasts, Ink pills: the "inverted" layer |

## Imagery

No photography and no 3D renders. Cranoly's visual language is the **flashcard** (a yellow, ink-outlined card, often shown as a slightly rotated stack) plus **word stickers** in many languages, scattered and rotated like Slush's stickers. Icons are Lucide at 1.75px stroke and 17–21px, in Ink. The app icon is a black serif "C" on a Mint tile.

## Agent Prompt Guide

Quick Color Reference:
- text: #16141a (Graphite: #f4efe6)
- background: #fbf7f0 / #f4eee3 / #ffffff
- outline: #16141a, 1px for chrome and 2px for objects
- action: #ff5b3a with #16141a text
- links: #c5e8b2 mark, ink text
- stickers: #ffd731, #e9ccff, #ffe1d8, #c3f6ce, #5c4ade, #4da2ff (decorative)

Example Component Prompts:

1. **Primary action:** "A 48px pill, #ff5b3a fill, 2px #16141a outline, label 'Start' in Instrument Sans 700 15px with +0.03em tracking in #16141a. On hover the label tumbles: the front face rotates 85° on the X axis and fades while a copy springs in from -90°, using `--ease-elastic` over 850ms. On press `scale: .955`."

2. **Segmented control:** "Theme picker with Paper · Graphite · System. A pill track in #f4eee3 with a 1px #16141a outline and 4px padding. One #16141a pill sits under the chosen label (Paper-coloured text, 700 13px +0.03em) and slides to a new choice with `--ease-glide` over 460ms. Its leading edge moves first and the trailing edge follows 40ms later."

3. **Notes list:** "Rows with a 20px radius on #fbf7f0: title in Instrument Sans 700 14.5px, a muted 13px date and preview line. The selected row sits on a #ffd731 highlight that glides from the previously selected row with `--ease-glide`. Pressing a row squishes it to .955."

4. **Flashcard:** "A 28px-radius card, #ffd731 front, #ffffff back, 2px #16141a outline, resting `0 4px 0 #16141a` shadow. The word is Fraunces 800 at 44px, line height 1.0, centred. Tapping flips it 180° on the Y axis over 850ms with `--ease-glide`."

5. **Marketing hero:** "A full-bleed #dceeff band. 'Learn words that stick.' in Fraunces 800 at 200px, line height 0.84, -0.035em, #16141a. Word stickers ('perro → dog', 'merci → thank you', 'Hund → dog') float around it in #ffd731, #e9ccff and #c3f6ce with 2px #16141a outlines, rotated between -6° and 6°, wobbling on hover. Below: an Action pill 'Get started' and a Ghost pill 'Get the app'."

## Gradient System

None. Every surface is a flat fill. Depth comes from outlines, colour bands and motion.

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors: Paper */
  --ink: #16141a;
  --paper: #fbf7f0;
  --paper-2: #f4eee3;
  --white: #ffffff;
  --mist: #ede7dc;
  --sky-wash: #dceeff;
  --line: #16141a;
  --action: #ff5b3a;
  --link-mark: #c5e8b2;
  --link-line: #6fb35a;
  --selection: rgba(0, 122, 255, 0.24);
  --danger: #e5383b;
  --text-muted: #4b4752;
  --text-faint: #8c8793;

  /* Sticker set (both themes) */
  --sun: #ffd731;
  --lilac: #e9ccff;
  --peach: #ffe1d8;
  --mint: #c3f6ce;
  --violet: #5c4ade;
  --electric: #4da2ff;

  /* Typography */
  --font-display: "Fraunces", ui-serif, Georgia, serif;
  --font-ui: "Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --text-caption: 12px;
  --text-ui-sm: 13px;
  --text-ui: 14px;
  --text-body: 16px;
  --text-body-lg: 18px;
  --text-subheading: 22px;
  --text-heading-sm: 30px;
  --text-heading: 42px;
  --text-display: 72px;
  --text-display-lg: 160px;
  --text-display-xl: 240px;
  --tracking-label: 0.03em;
  --tracking-display: -0.035em;

  /* Spacing */
  --space-4: 4px;
  --space-8: 8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-20: 20px;
  --space-24: 24px;
  --space-32: 32px;
  --space-40: 40px;
  --space-48: 48px;
  --space-64: 64px;
  --space-80: 80px;
  --space-128: 128px;

  /* Shapes */
  --radius-pill: 999px;
  --radius-card: 20px;
  --radius-sheet: 32px;
  --radius-flashcard: 28px;
  --radius-input: 16px;
  --radius-tile: 12px;
  --outline: 1px solid var(--line);
  --outline-object: 2px solid #16141a;
  --pop-rest: 0 4px 0 #16141a;
  --pop-hover: 0 3px 0 #16141a;

  /* Motion: curves */
  --ease-elastic: linear(0, 0.5737 7.6%, 0.8382 11.87%, 0.9463 14.19%, 1.0292 16.54%, 1.0886 18.97%, 1.1258 21.53%, 1.137 22.97%, 1.1424 24.48%, 1.1423 26.1%, 1.1366 27.86%, 1.1165 31.01%, 1.0507 38.62%, 1.0219 42.57%, 0.9995 46.99%, 0.9872 51.63%, 0.9842 58.77%, 1.0011 81.26%, 1);
  --ease-glide: linear(0, 0.3336 3%, 0.6 6%, 0.7936 9%, 0.922 12%, 0.9987 15%, 1.0449 19%, 1.0522 24%, 1.0342 30%, 1.0128 37%, 1.0011 45%, 0.9985 55%, 0.9996 68%, 1);
  --ease-bounce: linear(0, 1.3, 1, 0.92, 1, 0.99, 1, 1.004, 0.998, 1);
  --ease-snap: cubic-bezier(0.65, 0.05, 0, 1);
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-color: cubic-bezier(0.216, 0.62, 0.356, 1);
  --ease-sheet: cubic-bezier(0.32, 0.72, 0, 1);

  /* Motion: durations */
  --dur-fade: 150ms;
  --dur-color: 200ms;
  --dur-pop: 420ms;
  --dur-glide: 460ms;
  --dur-press: 500ms;
  --dur-sheet: 520ms;
  --dur-default: 750ms;
  --dur-medium: 850ms;
  --dur-long: 1000ms;
}

:root[data-theme="graphite"] {
  --ink: #f4efe6;
  --paper: #1b1b1e;
  --paper-2: #212125;
  --white: #26262b;
  --mist: #2f2f35;
  --line: #4a4a52;
  --link-mark: rgba(197, 232, 178, 0.14);
  --link-line: #c5e8b2;
  --selection: rgba(10, 132, 255, 0.42);
  --text-muted: #b9b4ac;
  --text-faint: #75717a;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-pop: 120ms;
    --dur-glide: 0ms;
    --dur-press: 0ms;
    --dur-sheet: 120ms;
    --dur-default: 0ms;
    --dur-medium: 120ms;
    --dur-long: 0ms;
  }
}
```

In the app, Fraunces runs with `font-variation-settings: "SOFT" 100, "WONK" 0`, and `opsz` at 144 for display sizes.

## Similar Brands

- **Slush (slush.app):** the motion system, outlines, pill controls, sticker palette and poster-sized display type all come from here.
- **Apple Notes:** the app layout: folders, a date-grouped list and a calm editor.
- **Tutora:** Cranoly's original brand: warm paper, ink and orange.
- **Duolingo:** proof that playful motion and stickers can sit inside a serious learning habit, though Cranoly stays quieter and never gamifies with points.
