# Cranoly Style Reference
> a sticker notebook for words, on warm paper

**Theme:** light (Paper) and dark (Graphite)

**Lineage:** Cranoly's own look comes from the Tutora brand: warm paper, ink outlines, hard "pop" shadows, one orange, pastel tints, Fraunces and Instrument Sans, and the yellow flashcard. From slush.app (SLUSHDESIGN.md) it takes **only the micro-animations**. The curves and timings are measured from slush.app's own CSS, not guessed.

**Decided 3 October 2026:** a full Slush-style restyle was compared side by side with today's look and turned down. It had hairline outlines, no shadows, and a new palette and type scale. Keep Cranoly's look as written here, and borrow motion only. Everything in this file is live in the app. `src/app/globals.css` is the source of truth for every value.

Cranoly feels like a paper notebook with stickers on it: warm cream pages, black ink outlines, and bright cut-out pieces that cast a small hard shadow, like card lifted off the page. Orange marks the main thing to do and where you are. Yellow marks what's chosen and what you're learning. Green is only for links. Every touch answers with a small spring: things squish when pressed, selections slide instead of jumping, and main buttons' labels tumble. The app stays calm enough to write in.

## Colours

### Paper (light)

| Name | Value | Token | Role |
|------|-------|-------|------|
| Paper | `#fbf7f0` | `--background-primary` | App canvas, notes, phone sheets |
| Paper 2 | `#f4eee3` | `--background-secondary`, `--paper-2` | Sidebar and panels, switch and progress tracks, desktop dialogs, the phone edit toolbar |
| Card | `#ffffff` | `--card` | Buttons, cards, menus, fields, the flashcard's question side |
| Ink | `#16141a` | `--text-normal`, `--edge`, `--pop-color` | Text, outlines and hard shadows. Also `--accent`: the toast and the selection bar |
| Orange | `#ff5b3a` | `--brand` | **The main action and "where you are":** primary buttons, the active tab's pill, switches when on, the progress bar, the streak flame. Ink text on top (`--brand-ink`) |
| Orange hover | `#ff6f52` | `--brand-hover` | Primary buttons on hover |
| Orange soft | `#ffe1d8` | `--brand-soft` | Focus ring on fields, pressed rows in phone sheets and toolbars |
| Sun | `#ffd84d` | `--sun` | **What's chosen and what you're learning:** the flashcard's answer side, the selected note, chosen language and folder pills, chosen chips and language tiles, the phone ＋ button, the selection bar's hover |
| Sky | `#cfe3ff` | `--sky` | Word of the day (Dictionary), tags |
| Lilac | `#e4dbff` | `--lilac` | Tags (the default tag colour) |
| Peach | `#ffe1d8` | `--peach` | Tags, warm tints |
| Link mark | `#c5e8b2` | `--link-mark` | **Links only:** the highlighter stroke under linked words. Hover: `#b3dd9d` (`--link-mark-hover`). Link text stays ink |
| Link line | `rgba(111,179,90,.55)` | `--link-underline` | Dashed underline of links to notes not written yet |
| Selection | `rgba(0,122,255,.24)` | `--selection` | Selected text, system blue. Nothing else is this blue |
| Danger | `#e5383b` | `--text-error` | Delete buttons, errors, writing issues |
| Text muted | `#4b4752` | `--text-muted` | Secondary text, metadata, unchosen tab labels |
| Text faint | `#8c8793` | `--text-faint` | Placeholders, counts, hints |
| Border | `#e8e2d8` | `--background-modifier-border` | Hairlines between rows |
| Border strong | `#d6cec1` | `--background-modifier-border-hover` | Resting outline of chips, fields, search and unchosen pills. Turns ink on hover or focus |
| Border focus | `#bdb3a4` | `--background-modifier-border-focus` | Desktop dialog outline, dashed "add" outlines |
| Wash | `rgba(22,20,26,.06)` | `--background-modifier-hover` | Hover fills, segmented-control tracks |
| Wash strong | `rgba(22,20,26,.10)` | `--background-modifier-active` | The sidebar's selected row |

### Graphite (dark)

| Name | Value | Token |
|------|-------|-------|
| Paper | `#1b1b1e` | `--background-primary` |
| Paper 2 | `#212125` (tracks `#2a2a30`) | `--background-secondary` (`--paper-2`) |
| Card | `#26262b` | `--card` |
| Text | `#f4efe6` · muted `#b9b4ac` · faint `#75717a` | `--text-normal` · `--text-muted` · `--text-faint` |
| Edge (outlines) | `#4a4a52` | `--edge` |
| Pop shadow | `#000000` | `--pop-color` |
| Accent (toast, selection bar) | `#f4efe6` with `#16141a` text | `--accent`, `--text-on-accent` |
| Orange soft | `rgba(255,91,58,.18)` | `--brand-soft` |
| Link | `#c5e8b2` text over a `rgba(197,232,178,.14)` mark | `--link-text`, `--link-mark` |
| Selection | `rgba(10,132,255,.42)` | `--selection` |
| Borders | `#313136` · `#3a3a40` · `#4a4a52` | `--background-modifier-border` · `-hover` · `-focus` |

Orange, Sun, Sky, Lilac and Peach are the same in both themes. Text on them is always ink (`--tint-ink`, `#16141a`), even in Graphite.

### Mind Map and heatmap

The Mind Map is a night sky: small, saturated dots, one colour per top-level folder, on deep space in Graphite and a pale twilight wash in Paper. No glow, halos or twinkling: the feel comes from the sky and the colour.

| Use | Paper | Graphite | Token |
|-----|-------|----------|-------|
| Notes at the top level | `#4055dd` | `#94a5f9` | `--mm-0` |
| Folders, in order (violet, amber, sky, pink, teal, coral, indigo, cyan) | `#7e40e7` `#e58c06` `#0b8ecb` `#e2288b` `#109e8b` `#e83d30` `#4949df` `#0aa1b8` | `#a677f8` `#fac038` `#45bff7` `#f66fb7` `#23e7cc` `#f76e64` `#7b7bf4` `#25d8f4` | `--mm-1` … `--mm-8` |
| Tag | `#b739d0` | `#e088f2` | `--mm-tag` |
| Not written yet | `#abafc4` | `#5b648f` | `--mm-ghost` |
| Open or hovered note | `#1d1a17` | `#ffffff` | `--mm-focus` |
| Link line | `rgba(60,50,120,.14)` | `rgba(170,180,255,.16)` | `--mm-line` (hovered links turn link green) |
| Sky | lavender into cream, faint peach and lavender clouds, a few grey specks | indigo into near black, violet and teal nebula washes, two scattered star tiles | `--mm-sky` (`--mm-panel` for the small map in the side panel, without stars) |
| Practice heatmap | `#ebe4d8` `#ffd2c6` `#ffab95` `#ff8467` `#ff5b3a` | `#2a2a30`, then orange at 30 / 50 / 75 / 100% | `--heat-0` … `--heat-4` |

Dots are 1.6px across plus 0.7px for every square root of a note's links (the open note is 1.6 times bigger); the tap area stays 6px wider than the dot. Labels are 10.5px at 70% and appear when you zoom in or hover.

## Typography

### Fraunces · `--font-heading`
- **Used for:** headings, titles and the flashcard word
- **Axes:** `"SOFT" 100, "WONK" 0` everywhere (set on `body`), for the roundest, friendliest letters
- **Weights:** 700 (small headings), 750 (note titles, section headings), 800 (greetings, welcome titles, card titles, flashcard words)
- **Letter spacing:** -0.03em by default; -0.04em on the largest sizes; -0.02em on small ones
- **Line height:** 1 to 1.02 for titles
- **Role:** the voice of the app. Sentence case, never all caps

### Instrument Sans · `--font-text`
- **Used for:** everything that isn't a heading: UI, note text, buttons and labels
- **Size:** 14.5px for UI; 16px for note text (`--font-text-size`); 12 to 13px for small text (`--font-ui-smaller`, `--font-ui-small`)
- **Weights:** 500 (fields), 550 (sidebar rows), 600 (chips, toasts), 650 (buttons, segmented items, tab labels, the selection bar), 700 (labels, the chosen sidebar row, language pills), 750 (Flashcard and Link in the selection bar)
- **Labels:** section labels are 13px 700 uppercase with +0.06em tracking, in muted ink. The flashcard's kind label is 12px 700 uppercase with +0.08em
- **Numbers that change** (counts, streaks, timers) use tabular figures (`font-variant-numeric: tabular-nums`), so digits don't jitter

### Geist Mono · `--font-monospace`
- **Used for:** code and keyboard hints only

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Where |
|------|--------|--------|------|-------------|----------------|-------|
| note title | Fraunces | 750 | 42px | 1 | -0.03em | `.inline-title` |
| welcome title | Fraunces | 800 | 30 to 40px (`clamp(30px, 8vw, 40px)`) | 1.02 | -0.04em | `.wc-title` |
| flashcard word | Fraunces | 800 | 34 to 48px (`clamp(34px, 5vw, 48px)`) | 1 | -0.04em | short answers on the card |
| word of the day | Fraunces | 700 | 24px |  | -0.03em | the Dictionary |
| dictionary word | Fraunces | 700 | 17px |  | -0.01em | Dictionary rows; the article (der, la…) in faint 600 |
| letter | Fraunces | 800 | 20px |  | -0.02em | the Dictionary's sticky A to Z headers |
| Mind Map title | Fraunces | 800 | 26px |  | -0.03em | over the sky, top left |
| language name | Fraunces | 700 | 19px |  | -0.02em | welcome tiles |
| practice bar | Fraunces | 750 | 18px |  | -0.02em | the deck name while practising |
| note text | Instrument Sans | 400 | 16px |  | 0 | the editor |
| ui | Instrument Sans | 500 | 14.5px |  | 0 | everywhere else |
| button | Instrument Sans | 650 | 14px (large 16px) | 1 | 0 | `.btn` |
| label | Instrument Sans | 700 | 12 to 13px | 1 | +0.06em, uppercase | Word of the day, Properties |
| small | Instrument Sans | 500 | 12 to 13px |  | 0 | metadata, hints |

## Spacing and shapes

**Spacing:** no fixed scale; gaps and padding step through 6, 8, 10, 12, 14, 16, 18 and 22px · **Density:** comfortable in lists, roomy in the welcome

### Border Radius

| Element | Value |
|---------|-------|
| buttons, chips, switches, search, toasts, the selection bar, the phone tab bar, round icon buttons, language and folder pills | 999px (pill) |
| flashcards in practice | 28px |
| phone sheets | 30px top corners |
| the welcome flashcard | 24px |
| the word of the day card, language tiles | 18px |
| the Properties card, callouts | 16px |
| menus, the segmented track | 16px |
| rows in phone sheets | 14px |
| notes-list rows, segmented items, selects, desktop dialogs | 12px |
| sidebar rows | 10px |
| side-panel tabs | 9px |
| tags | 8px |

### Outlines and depth

| Use | Value |
|-----|-------|
| Things you press and cards that pop: buttons, the word of the day card, language tiles, flashcards, menus, the tab bar, toasts, the selection bar, the ＋ button | `2px solid var(--edge)` |
| Small controls: switch track and knob, tags, the progress bar, chosen pills and chips | `1.5px solid var(--edge)` |
| Resting chips, search, fields and unchosen pills | `1.5px solid var(--background-modifier-border-hover)`, turning ink on hover or focus |
| Row dividers, the phone edit toolbar's top edge | `1px solid var(--background-modifier-border)` |
| Focus on fields and search | ink outline plus a `0 0 0 3px var(--brand-soft)` ring |
| Small pop | `0 3px 0 var(--pop-color)` (`--pop-sm`): primary buttons, toasts, the selection bar, language tiles, the ＋ button |
| Pop | `0 4px 0 var(--pop-color)` (`--pop`): the tab bar, primary buttons on hover |
| Large pop | `5px 5px 0 var(--pop-color)` (`--pop-lg`): menus, the command palette, hover previews |
| Flashcard | `6px 6px 0 var(--pop-color)` on the face you can see |
| Soft shadows | Only two: the segmented control's chosen item (`0 1px 0` plus an 8px blur) and desktop dialogs (`--shadow-l`) |

Shadows are hard: no blur, offset straight down or down-right, in pure ink, so pieces look like card stock lifted off the page.

### Layout

- **App:** Apple Notes layout. Sidebar (236px), notes list (320px), then the note, with the text column capped at 700px, plus an optional side panel (300px). On phones (820px and narrower) it opens on the Notes screen and shows one screen at a time, with a floating Notes · ＋ · Search tab bar; the ☰ button on Notes slides in the sidebar as a drawer.
- **Sidebar order:** Folders first (All Notes, then your folders), a hairline, then Mind Map, Practice, Dictionary, Search, Add a word and Scan text. Learn the basics and Settings sit at the foot.
- **Dictionary:** the narrow page column; sticky letter headers, hairline rows.
- **Card padding:** 14 to 22px · **Element gap:** 6 to 12px · **Phone gutter:** 16px

## Components

### Primary Button
**Role:** the main action on a screen: Start, Get started, Continue, Save, Add word, Start using Cranoly

Orange fill, ink text, `2px` ink outline, pill. 40px tall with 20px sides (large: 52px, 16px text), Instrument Sans 650 at 14px. Resting `0 3px 0` hard shadow. Hover: lighter orange, a 1px lift onto `0 4px 0`, and on pointer devices the label **tumbles** (see Motion). Press: drops 2px onto `0 1px 0` and **squishes** to .955.

### Secondary Button
**Role:** everything next to the primary: Later, Cancel, Close

White card fill, `2px` ink outline, ink text, pill, no shadow at rest. Hover lifts 1px onto `0 3px 0`. Press drops back and squishes.

### Ghost and Danger Buttons
Ghost: no fill or outline; hover is the 6% ink wash; when on, it gets a white fill and ink outline. Danger: `#e5383b` fill, white text, `0 3px 0`. Danger outline: red text and a red outline.

### Round Icon Button
**Role:** compact tools: ＋, ⚙, ⋯, close, speaker

Round (999px): 48px beside the word of the day, 52px around the flashcard, 32px in panel toolbars, 42px on the phone Notes header (☰, ⋯, new note). Stand-alone ones (the speaker) are white with a `1.5px` ink outline. Hover: ＋ and ⚙ **turn 90°**.

### Chip
**Role:** quick picks and toggles: starter words in the welcome, Shuffle and Answer first in practice

36px pill, white fill, `1.5px #d6cec1` outline that turns ink on hover, 600 at 14px. On: Sun fill with an ink outline, and the chip **pops**.

### Language and Folder Pills
**Role:** switching language on Practice and the Dictionary (`.lang-switch`), and folders on the phone notes list

32 to 34px pills, 650 to 700 at 13.5 to 14px, muted text, `1.5px #d6cec1` outline. The chosen one sits on a **Sun pill with an ink outline that slides** from the previous choice.

### Tag
Lilac by default (or Sun, Sky, Peach), `1.5px` ink outline, 8px radius, 700 at 0.8em. Clickable tags lift 1px onto `0 2px 0` on hover.

### Segmented Control
**Role:** one choice out of two to four: theme (Paper · Graphite · System), side-panel tabs

A track in the 6% ink wash with a 16px radius and 4px padding (side-panel tabs: 12px, 3px). Items are 650, muted, with a 12px radius. The chosen item is a **white card with a soft shadow that slides** to the new choice; its label turns ink as the card arrives.

### Switch
**Role:** on/off settings (Shuffle decks, Blur answers, …)

Track 44×26 pill in Paper 2 with a `1.5px` ink outline. Knob 19px, white, with its own `1.5px` ink outline. On: orange track, white knob. Motion: the knob **springs** across and **stretches** while held.

### Search and Fields
Search: 38px pill, white, `1.5px #d6cec1` outline. Selects and inputs: 40px, 12px radius, same outline. Focus: ink outline plus a 3px orange-soft ring.

### Text Link
**Role:** `[[linked words]]` in notes and links in copy

Ink text with a mint highlighter stroke over its lower 42% (`linear-gradient(transparent 58%, var(--link-mark) 58%)`). Hover fills the whole word in the darker mint. A link to a note not written yet is at 60% opacity with a dashed green underline. Green appears nowhere else.

### Note Row
**Role:** an item in the notes list

12px radius, 9 to 10px padding, a hairline between rows (hidden next to the selected row). Title 700, then the preview in muted ink and the date and counts in faint 12px. The selected row sits on a **Sun highlight that glides** from the previous row instead of jumping.

### Sidebar Row
34px tall, 10px radius, 550 at 14.5px with a muted icon and a faint count. Selected: 700 weight on a 10% ink wash that **glides** between rows.

### Read / Edit Button
**Role:** switching a note between reading and editing. It names where it takes you: **Edit** while reading, **Read** while editing (⌘E).

Laptop: the first thing in the note toolbar, a 32px secondary pill with an icon (pencil or open book) and the word at 13px. Phone: the ink pill at the top right of the note, text only. The new word **springs in** from below when it changes. In source mode a Sun "Source" chip sits beside it; tapping the chip returns to the live preview.

### Properties Card
**Role:** a note's properties (the `---` block at the top), drawn as a small table in reading view and live preview

White card, `1.5px` resting outline, 16px radius, 12px 16px padding. A 12px uppercase muted "Properties" label, then rows split by hairlines: the key muted in the left 30%, the value in ink. Tags are tag chips, lists are small Paper 2 chips, dates read in words, an empty value reads "Empty" in faint ink. Tapping it in the editor shows the YAML as typed, in the code font with keys in 650 ink.

### Card Arrow
The arrow on a flashcard line (→, or ⇄ both ways) is quiet: a small chip in a dull neutral grey (`--sep-bg` `#e9e7e3`, Graphite `#303036`) with grey text (`--sep-ink`) and a `1.5px` hairline. In the editor it's grey text. Never Sun or orange.

### Dictionary
- **Word of the day:** Sky, `2px` ink outline, 18px radius, the word in Fraunces at 24px, its meaning hidden until tapped; a round speaker button beside it.
- **Rows:** the word in Fraunces 17px (its article faint), the meaning muted below, a speaker at the end; hairline dividers; filed under sticky letter headers by the word, not its article.

### Language Tile
**Role:** picking languages in the welcome

White card, `2px` ink outline, 18px radius, `0 3px 0`. Language name in Fraunces 19px with "hello" in that language below it, muted. On: Sun fill and a round ink check that **pops** in at the corner. Press drops 2px onto its shadow.

### Flashcard
**Role:** Cranoly's signature object

Question side white, answer side Sun (ink text). `2px` ink outline, 28px radius in practice (24px in the welcome), and a `6px 6px 0` hard shadow on the face you can see. Short answers are Fraunces 800 at 34 to 48px. Cloze gaps are dashed ink boxes on Paper 2. A large “Reveal answer” button sits between 52px round previous and next buttons. It **flips** on the glide spring.

### Progress Bar
10px pill in Paper 2 with a `1.5px` ink outline. The fill is orange with an ink right edge.

### Selection Bar
**Role:** the bar above selected text: Flashcard · Link | Explain · Hear · …

Ink pill (white in Graphite), `2px` ink outline, `0 3px 0`, 4px padding. Buttons are 30px pills, 650 at 13px; hover turns them Sun with ink text. Flashcard and Link come first at 750, then a 1.5px divider. It **springs in** from the selection.

### Edit Toolbar (phones)
A full-width bar above the keyboard in Paper 2 with a hairline top edge. Tools are round, ink, and turn orange-soft when pressed. Flashcard and Link are labelled at the front.

### Menu
White, `2px` ink outline, 16px radius, 6px padding, `5px 5px 0`. **Springs from its button** with its items arriving 12ms apart.

### Sheet
**Role:** bottom sheets on phones (Add a word, New flashcard, the note menu) and dialogs on desktop

Phones: Paper, a `2px` ink top edge, 30px top corners, an ink grab handle; rows have a 14px radius and turn orange-soft when pressed. It **rises** on the sheet curve. Desktop: a dialog in Paper 2 with a 1px outline, 12px radius and a soft shadow; it **springs in**.

### Toast
**Role:** confirmations with an optional Undo

Ink pill (white in Graphite), `2px` ink outline, `0 3px 0`, 600. The action is Sun-coloured text (dark orange `#b54708` in Graphite). It **springs up** from the bottom.

### Phone Tab Bar
**Role:** Notes · ＋ · Search (everything else is in the ☰ drawer on the Notes screen)

A white pill bar, 66px tall and up to 420px wide, with a `2px` ink outline and `0 4px 0`, floating 12px above the bottom edge. Tab labels are 11px 650 and muted. The active tab's icon sits on an **orange pill that slides** between tabs, and the icon **pops**. The centre ＋ is a 54px Sun circle with a `2px` ink outline and `0 3px 0`; it drops 2px and **turns 90°** when pressed.

### Eyebrow
14px 600 muted text with an 18×3px solid rule before it. Never a dot.

## Motion

Slush's secret is that motion **lands fast and settles playfully**. Its main curve reaches its target in about a sixth of its duration, overshoots by 14%, then rocks back into place. Cranoly uses Slush's exact curves for small things, and a gentler glide for anything that travels a long way.

### Principles

1. **Arrive fast, settle slow.** The value reaches its target in under 150ms; the remaining time is the springy settle. Interactions never feel slow, even at 850ms.
2. **Nothing snaps.** Every state change animates: toggles, selections, sheets, menus. The exceptions are typing and the caret.
3. **Selections travel.** When the chosen item changes, one indicator moves from the old item to the new one. It never fades out and in.
4. **Small things bounce, big things glide.** Overshoot shrinks with distance, so long moves use the gentler glide curve.
5. **Everything pressable squishes.** `scale: .955` on press, sprung back on release. Wide rows (notes, sidebar, sheet rows) press to `.985`, so a whole row never lurches. Buttons still drop onto their shadow as well; the squish rides on top.
6. **Transform, opacity and colour only.** Never animate layout on content, so it stays at 60fps on a budget phone like a Galaxy A23.
7. **Interruptible.** Use transitions, not one-shot animations, wherever a user can change their mind mid-motion.

### Curves

| Name | Value | Token | Use |
|------|-------|-------|-----|
| Elastic | `linear(0, 0.5737 7.6%, 0.8382 11.87%, 0.9463 14.19%, 1.0292 16.54%, 1.0886 18.97%, 1.1258 21.53%, 1.137 22.97%, 1.1424 24.48%, 1.1423 26.1%, 1.1366 27.86%, 1.1165 31.01%, 1.0507 38.62%, 1.0219 42.57%, 0.9995 46.99%, 0.9872 51.63%, 0.9842 58.77%, 1.0011 81.26%, 1)` | `--ease-elastic` | Slush's spring, with 14% overshoot. Presses, knobs, rotations, tumbles, menus, toasts: anything that moves under ~40px |
| Glide | `linear(0, 0.3336 3%, 0.6 6%, 0.7936 9%, 0.922 12%, 0.9987 15%, 1.0449 19%, 1.0522 24%, 1.0342 30%, 1.0128 37%, 1.0011 45%, 0.9985 55%, 0.9996 68%, 1)` | `--ease-glide` | Cranoly's damped spring: 5% overshoot, on target at 15%. Sliding pills, list highlights, flashcard flips |
| Bounce | `linear(0, 1.3, 1, 0.92, 1, 0.99, 1, 1.004, 0.998, 1)` | `--ease-bounce` | Slush's pop, with 30% overshoot. Only for tiny appearances: checks, chips, tab icons |
| Snap | `cubic-bezier(0.65, 0.05, 0, 1)` | `--ease-snap` | Slush's wipe: slow start, fast finish. Long jumps of a sliding pill |
| Out | `cubic-bezier(0.22, 1, 0.36, 1)` | `--ease-out` | Plain arrivals with no overshoot: menu items, pill edges landing at the side of their container. Also `--ease` |
| Color | `cubic-bezier(0.216, 0.62, 0.356, 1)` | `--ease-color` | Slush's colour ease: backgrounds, text and outline colours |
| Sheet | `cubic-bezier(0.32, 0.72, 0, 1)` | `--ease-sheet` | Bottom sheets on phones |

Browsers without `linear()` (before Chrome 113 or Safari 17.2) get the nearest `cubic-bezier` for Elastic, Glide and Bounce.

### Durations

| Name | Value | Token | Use |
|------|-------|-------|-----|
| Fade | 150ms | `--dur-fade` | Opacity, label colour swaps, backdrops |
| Color | 200ms | `--dur-color` | Background, text and outline colour changes |
| Pop | 420ms | `--dur-pop` | Checks, chips and icon pops (Bounce) |
| Glide | 460ms | `--dur-glide` | Sliding pills and highlights (Glide) |
| Press | 500ms | `--dur-press` | The spring back from a press; switch knobs; menus, toasts and dialogs arriving (Elastic) |
| Sheet | 520ms | `--dur-sheet` | Bottom sheets |
| Default | 750ms | `--dur-default` | Tumble turns, the theme icon (Elastic) |
| Medium | 850ms | `--dur-medium` | Tumble travel, the flashcard flip |
| Long | 1000ms | `--dur-long` | The logo spin only |

### Component motion

| Moment | What moves | Duration · curve | Detail |
|--------|-----------|------------------|--------|
| **Press** anything pressable | `scale: .955` (wide rows `.985`) | press · elastic | Down and back on the same spring. Uses the independent `scale` property, so it adds to a button's own 2px drop instead of fighting it |
| **Switch** toggled | knob `translate: 18px 0` | press · elastic | The knob overshoots ~2.5px and rocks back. The track turns orange over color · color |
| **Switch** held | knob `scale: 1.3 1` | press · elastic | The knob stretches towards its travel (origin left when off, right when on), like iOS |
| **Segmented control or side-panel tabs** changed | the white chosen card's edges | glide · glide | The leading edge leaves first and the trailing edge follows 18ms later, so the card **stretches** by about 40% of the distance, then settles. An edge landing at the container's side uses Out, so it never pokes past. Moves over 240px use Snap at 420ms with no stretch |
| Label under a moving pill | text colour | fade · color, 60ms delay | Swaps as the pill arrives under it |
| **Notes list** selection changed | the Sun highlight's top and bottom edges | glide · glide | The same stretch; long jumps snap. When an edit moves the open note up the list, the highlight travels with it |
| **Sidebar** selection changed | the grey highlight | glide · glide | The same stretch |
| **Language pills, phone folder pills** changed | the Sun pill | glide · glide | The same stretch |
| **Read / Edit** button | the new word rises 55% and fades in | pop · elastic | The same spring in the tour's demo |
| **Tab bar** changed | the orange pill slides under the new icon; the icon pops from `scale: .7` | glide · glide; pop · bounce | A light haptic tap in the Android app |
| **Chip** turned on | Sun fill; the chip pops from `scale: .92` | color · color; pop · bounce |  |
| **Language tile** picked | Sun fill; the corner check pops in from `scale: 0` and `rotate: -25deg` | color · color; pop · bounce |  |
| **Primary button** hover (pointer devices) | label tumbles: the front face goes to `rotate: 1 0 0 85deg`, `translate: 0 -0.95em -1.5em` and fades; the back face (CSS text only) springs in from `rotate: 1 0 0 -90deg`, `translate: 0 0.95em -1.5em` | medium (travel) and default (turn) · elastic; fade 150ms out, 75ms in | Slush's button, applied to the label inside a clipped pill with 500px perspective. On Start, Add a word, Get started, Continue, Download, Add word, Save, New note and Start using Cranoly |
| **Round button** hover | ＋ and ⚙ `rotate: 90deg` | press · elastic | The phone ＋ also turns when pressed |
| Logo hover | `rotate: 360deg` | long · elastic |  |
| Arrow in a button or row, hover | `translate: 3px 0` | press · elastic |  |
| **Theme** switched | the theme icon spins in from `rotate: -120deg`, `scale: .6` | default · elastic | Colours change over color · color |
| **Selection bar** appears | `scale: .92 → 1` from its bottom centre, fading in | press · elastic |  |
| **Dialog** opens (desktop) | `scale: .96 → 1`, fading in | press · elastic | The backdrop fades over 150ms |
| **Sheet** opens (phones) | rises from below the screen | sheet · sheet |  |
| **Menu** opens | `scale: .94 → 1` from its top-left corner, fading in | press · elastic | Items rise 4px over 320ms on Out, 12ms apart; the tenth item onwards arrives together |
| **Toast** arrives | rises 14px from `scale: .96`, fading in | press · elastic |  |
| **Flashcard** flips | `rotateY(180deg)` | medium · glide | In practice and in the welcome. The 5% overshoot reads as a real card settling |

### Choreography rules

- **Leaving is faster than arriving:** about 0.6× the duration, with no overshoot.
- **One overshoot per gesture.** If a pill glides, its label doesn't also bounce.
- **Stagger lists by 12ms per item, at most 10 items**, then the rest arrive together.
- **Don't animate while typing.** The editor, caret and text never move; motion lives around the text. Opening a note is instant, because writing can't wait.

### Reduced motion

With `prefers-reduced-motion: reduce`, every animation and transition drops to 0.01ms and every delay to 0. Pills and highlights jump into place, and main buttons' labels stay still.

### Haptics (Android app)

| Moment | Haptic |
|--------|--------|
| Switch toggled; theme, language, tab or folder changed; flashcard flipped; a language picked in the welcome | light tap |
| A card saved (Add word, the word sheet, new words, scan), a deck finished, the first word added in the welcome | success |

### Recipes

```css
/* Press: everything pressable squishes and springs back (the full list is in globals.css → Motion). */
:is(.btn, .chip, .icon-btn, .tool, .seg button, .dict-row, .wc-lang) {
  transition:
    scale var(--dur-press) var(--ease-elastic),
    transform 0.12s var(--ease),
    box-shadow 0.12s var(--ease),
    background-color var(--dur-color) var(--ease-color),
    color var(--dur-color) var(--ease-color),
    border-color var(--dur-color) var(--ease-color);
}
:is(.btn, .chip, .icon-btn, .tool, .seg button, .dict-row, .wc-lang):active:not(:disabled) { scale: 0.955; }
:is(.sb-item, .nl-row, .sheet-item, .deck-row):active:not(:disabled) { scale: 0.985; }

/* Switch: the knob springs across and stretches while held. */
.switch-track::after {
  transform-origin: left center;
  transition: translate var(--dur-press) var(--ease-elastic), scale var(--dur-press) var(--ease-elastic),
              background-color var(--dur-color) var(--ease-color);
}
.switch input:checked + .switch-track::after { translate: 18px 0; transform-origin: right center; }
.switch:active .switch-track::after { scale: 1.3 1; }

/* Sliding selection: one pill rides CSS variables set by useSlider() (src/lib/useSlider.ts).
   --sl/--sr/--st/--sb place its edges, --sd-* delay the trailing edges, --se-* pick each edge's curve. */
:where(.has-slider) { position: relative; }
:where(.has-slider) > :where(:not(.slider-pill)) { position: relative; z-index: 1; }
.slider-pill {
  position: absolute; z-index: 0; pointer-events: none;
  top: var(--st, 0); right: var(--sr, 0); bottom: var(--sb, 0); left: var(--sl, 0);
  transition: left var(--s-dur, var(--dur-glide)) var(--se-l, var(--ease-glide)) var(--sd-l, 0ms),
              right var(--s-dur, var(--dur-glide)) var(--se-r, var(--ease-glide)) var(--sd-r, 0ms),
              top var(--s-dur, var(--dur-glide)) var(--se-t, var(--ease-glide)) var(--sd-t, 0ms),
              bottom var(--s-dur, var(--dur-glide)) var(--se-b, var(--ease-glide)) var(--sd-b, 0ms);
}
/* Each container's pill wears what the chosen item used to wear, and the item goes transparent. */
.nl-scroll.has-slider > .slider-pill { background: var(--sun); border-radius: 12px; }
.nl-scroll.has-slider .nl-row.is-active { background: transparent; }

/* Pops: a check or a chip appearing. */
@keyframes pop-in { from { scale: 0; rotate: -25deg; } }
@keyframes chip-on { from { scale: 0.92; } }
.wc-lang-check { animation: pop-in var(--dur-pop) var(--ease-bounce); }
.chip.on { animation: chip-on var(--dur-pop) var(--ease-bounce); }
```

In React, put a pill first inside the container and hand the hook a selector for the chosen item and a key that changes with the choice:

```tsx
const seg = useSlider<HTMLDivElement>(".is-on", settings.theme);

<div ref={seg} className="seg has-slider" role="radiogroup" aria-label="Theme">
  <span className="slider-pill" aria-hidden />
  {options.map((o) => (
    <button key={o.id} role="radio" aria-checked={settings.theme === o.id} className={settings.theme === o.id ? "is-on" : ""}>
      {o.label}
    </button>
  ))}
</div>
```

Main buttons get the tumbling label with `<Tumble label="Start">…</Tumble>` (src/components/Tumble.tsx). The text exists once, so screen readers read it once.

## Do's and Don'ts

### Do
- Keep **orange for the main action** and for "where you are" (the active tab, switches that are on, progress).
- Use **Sun for what's chosen or being learned**: the answer side, the selected note, chosen pills and chips.
- Keep **green for links only** and **blue for selected text only**.
- Outline what you press in `2px` ink and give it a hard pop shadow; small controls get `1.5px`.
- Make every control a pill.
- Animate every state change with the Motion tokens. Selections slide, presses squish, checks pop.
- Use tabular figures for every number that changes.
- Use the learner's own language for any example word in the app.

### Don't
- Don't switch to Slush's look: no hairline-only outlines, no shadowless buttons, no new palette or type scale. Borrow its motion only.
- Don't use blurred shadows on cards or buttons. Shadows are hard and ink-coloured; the two soft exceptions are listed above.
- Don't use gradients as colour. The two exceptions: the link highlighter (its hard stop reads as a flat stroke) and the Mind Map's sky.
- Don't use glowing or pulsing dots anywhere. Markers are solid rules or pills.
- Don't put anything but ink text on Sun, Sky, Lilac or Peach, in either theme.
- Don't fade between selected items. The indicator must travel. In React, use `useSlider` and a `.slider-pill` in the container instead of styling the chosen item's own background.
- Don't use Elastic for moves over ~40px (use Glide), or Bounce for anything bigger than an icon or chip.
- Don't animate `width`, `height`, `top` or `left` on content. The slider pill (a tiny absolute element) is the only exception.
- Don't let motion run longer than 1s, block input, or move anything while someone types.
- Don't put fixed German (or any single language) example content on screens all learners see.

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 1 | Paper | `#fbf7f0` | App canvas, notes, phone sheets |
| 2 | Paper 2 | `#f4eee3` | Sidebar, panels, tracks, desktop dialogs |
| 3 | Card | `#ffffff` | Buttons, cards, menus, fields, the flashcard's question side |
| 4 | Tints | Sun / Sky / Lilac / Peach | Chosen things, word of the day, tags, the flashcard's answer side |
| 5 | Ink | `#16141a` | Toasts and the selection bar: the inverted layer |

## Imagery

No photography and no 3D renders. Cranoly's signature object is the **flashcard**: a white card with an ink outline and a hard shadow that flips to yellow. Icons are Lucide line icons in ink or muted ink. The app icon is a black serif "C" on a mint tile.

## Agent Prompt Guide

Quick Color Reference:
- text: #16141a (Graphite: #f4efe6)
- background: #fbf7f0 / #f4eee3 / #ffffff
- outline and shadow: #16141a, 2px on pressables and cards, 1.5px on small controls; hard shadows 0 3px 0 / 0 4px 0 / 5px 5px 0
- action: #ff5b3a with #16141a text
- chosen: #ffd84d with #16141a text
- tints: #cfe3ff, #e4dbff, #ffe1d8
- links: #c5e8b2 highlighter under ink text

Example Component Prompts:

1. **Primary button:** "A 40px pill, #ff5b3a fill, 2px #16141a outline, a hard 0 3px 0 #16141a shadow, label 'Start' in Instrument Sans 650 14px in #16141a. Hover: #ff6f52, a 1px lift onto 0 4px 0, and the label tumbles: the front face rotates 85° on the X axis and fades while a copy springs in from -90°, on `--ease-elastic` over 850ms. Press: drop 2px onto 0 1px 0 and squish to .955."

2. **Segmented control:** "Theme picker with Paper · Graphite · System. A track in rgba(22,20,26,.06) with a 16px radius and 4px padding. Items are Instrument Sans 650 in #4b4752 with a 12px radius. The chosen one sits on a white card with a 0 1px 0 #d6cec1 line and a soft 8px shadow, and the card slides to a new choice with `--ease-glide` over 460ms: its leading edge moves first and the trailing edge follows 18ms later."

3. **Notes list:** "Rows with a 12px radius on #fbf7f0, separated by 1px #e8e2d8 hairlines: title in Instrument Sans 700, a muted date and preview line. The selected row sits on a #ffd84d highlight that glides from the previously selected row with `--ease-glide`. Pressing a row squishes it to .985."

4. **Flashcard:** "A 28px-radius white card with a 2px #16141a outline and a hard 6px 6px 0 #16141a shadow. The word is Fraunces 800 at 44px, line height 1, -0.04em, centred. Tapping flips it 180° on the Y axis over 850ms with `--ease-glide` to a #ffd84d answer side."

5. **Mind Map:** "A full-bleed night sky: a radial gradient from #13122b to #05050c with faint violet and teal nebula washes and scattered 1px stars. Notes are flat dots about 2 to 4px across in saturated colours (one per folder: #a677f8, #fac038, #45bff7, #f66fb7), joined by 0.7px lines in rgba(170,180,255,.16). No glow. The title 'Mind Map' in Fraunces 800 at 26px, top left, in #f1f0ff."

## Gradient System

None, except two: the link highlighter (a hard-stop gradient that draws a flat mint stroke under linked words) and the Mind Map's sky. Every other surface is a flat fill. Depth comes from ink outlines, hard shadows and motion.

## Quick Start

### CSS Custom Properties

The key tokens, for pages built outside the app. The app's full set is at the top of `src/app/globals.css`.

```css
:root {
  /* Colors: Paper */
  --background-primary: #fbf7f0;
  --background-secondary: #f4eee3;
  --paper-2: #f4eee3;
  --card: #ffffff;
  --text-normal: #16141a;
  --text-muted: #4b4752;
  --text-faint: #8c8793;
  --text-error: #e5383b;
  --edge: #16141a;
  --pop-color: #16141a;
  --tint-ink: #16141a;
  --brand: #ff5b3a;
  --brand-hover: #ff6f52;
  --brand-ink: #16141a;
  --brand-soft: #ffe1d8;
  --sun: #ffd84d;
  --sky: #cfe3ff;
  --lilac: #e4dbff;
  --peach: #ffe1d8;
  --link-mark: #c5e8b2;
  --link-mark-hover: #b3dd9d;
  --selection: rgba(0, 122, 255, 0.24);
  --background-modifier-border: #e8e2d8;
  --background-modifier-border-hover: #d6cec1;
  --background-modifier-hover: rgba(22, 20, 26, 0.06);
  --background-modifier-active: rgba(22, 20, 26, 0.1);

  /* Depth */
  --pop-sm: 0 3px 0 var(--pop-color);
  --pop: 0 4px 0 var(--pop-color);
  --pop-lg: 5px 5px 0 var(--pop-color);

  /* Type */
  --font-heading: "Fraunces", ui-serif, Georgia, serif;
  --font-text: "Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-monospace: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-text-size: 16px;

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
  --background-primary: #1b1b1e;
  --background-secondary: #212125;
  --paper-2: #2a2a30;
  --card: #26262b;
  --text-normal: #f4efe6;
  --text-muted: #b9b4ac;
  --text-faint: #75717a;
  --edge: #4a4a52;
  --pop-color: #000000;
  --brand-soft: rgba(255, 91, 58, 0.18);
  --link-mark: rgba(197, 232, 178, 0.14);
  --link-mark-hover: rgba(197, 232, 178, 0.26);
  --selection: rgba(10, 132, 255, 0.42);
  --background-modifier-border: #313136;
  --background-modifier-border-hover: #3a3a40;
  --background-modifier-hover: rgba(255, 255, 255, 0.07);
  --background-modifier-active: rgba(255, 255, 255, 0.11);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    animation-delay: 0s !important;
    transition-delay: 0s !important;
  }
}
```

Fraunces runs with `font-variation-settings: "SOFT" 100, "WONK" 0` on `body`.

## Similar Brands

- **Tutora:** Cranoly's original brand, and the source of its look: warm paper, ink outlines, hard pop shadows, orange, and pastel chips.
- **Slush (slush.app):** the source of the motion only: the spring curves, sliding selections, the press squish and the tumbling labels.
- **Apple Notes:** the app layout: folders, a date-grouped list and a calm editor.
