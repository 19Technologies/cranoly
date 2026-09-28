# Cranoly

A linked-notes vault for learning languages, in the style of Obsidian. You write flashcards directly inside your notes. It runs in the browser on desktop, and installs on phones as an app that works offline.

## Features

- **Wikilinks**: `[[Note]]`, `[[Note|alias]]` and `[[Note#Heading]]` render inline. Hover over a link to preview the note. Clicking a link to a note that doesn't exist yet creates it.
- **Backlinks, outgoing links, outline and a local graph** in the right sidebar.
- **Graph view**: nodes are sized by how many links they have. Tags and unresolved links can be shown as their own nodes. Hovering a node highlights its neighbours, and clicking it opens the note.
- **Editor** built on CodeMirror 6 with Obsidian-style Live Preview: `[[links]]`, bold, headings and tasks render in place and show their syntax only while the cursor is on them. `[[` autocomplete, list continuation, Tab to indent, undo/redo. Three views: read, edit, and split.
- **Files**: folders, drag-and-drop between them, and inline renaming. Renaming a note updates every link that points to it. Deleting asks for confirmation inline and can be undone.
- **Command palette** (`⌘K`), **quick switcher** (`⌘O`), full-text and `#tag` search (`⌘⇧F`), daily notes.
- **Flashcards**: notes are turned into decks automatically. Study by flipping cards, swiping, or using the keyboard. A heatmap and a streak track your study days.
- **Smart tools** for the language you're learning (set it in Settings → Language):
  - **Explain**: select a word to see its meanings, examples and gender from Wiktionary, and save it as a card in one tap.
  - **Hear it**: pronunciation with the device's own voices, in the editor and on flashcards.
  - **Check my writing**: LanguageTool underlines spelling and grammar mistakes; tap one to fix it, or fix it and save it as a card.
  - **Cards from anything**: pasted word lists ("Hund – dog") turn into cards, and **Find new words** lists every word in a text you don't have a card for yet.
  - **Ask your notes**: type a question in search and get the best-matching passages back.
  - **Unlinked mentions** in the backlinks panel, and **smart decks** ("Not seen lately", "From this week's notes").
  - Explain and Check are the only features that go online, and only for the word or text you chose, when you tap. They can be turned off.
- Everything is stored in `localStorage`. You can export and import the vault as JSON from Settings.

## On your phone

Cranoly follows the Obsidian mobile app's layout:

- Swipe right anywhere on a note to open the file explorer. Swipe left to open links, cards and outline. The drawers follow your finger.
- The bottom bar has back, forward, **+** (new note), a tab switcher, and a menu with graph, flashcards, daily note, search, commands and settings.
- While you're editing, a toolbar sits above the keyboard with undo/redo, `[[link]]`, `::` (new card), `#tag`, checklist, heading, bold, italic, `==cloze==` and indent buttons.
- Long-press a file or folder to rename, move, study or delete it. Pull down at the top of a note to open the command palette.

**Installing it:** open the site on your phone. In Safari tap **Share → Add to Home Screen**. In Chrome use **Install app** (also under Settings → Install the app). Once installed it opens full-screen, and after the first visit it works offline.

## Android app

The Android app is the same code, packaged with [Capacitor](https://capacitorjs.com). Inside the app the Android back button closes sheets and goes back, the status bar follows the theme, and flipping or saving a card gives a small vibration.

```bash
npm run apk   # static export → android/app/build/outputs/apk/debug/app-debug.apk
```

You need the Android SDK and JDK 21. On a machine with only JDK 17, add `java.release=17` to `android/local.properties` (it isn't committed): Capacitor's code builds fine as Java 17.

## Writing flashcards

| Syntax | Result |
| --- | --- |
| `Hallo :: Hello` | One card |
| `der Hund ::: the dog` | Two cards, one in each direction |
| `Ich ==bin== müde.` | Cloze card (the highlighted part is hidden) |
| `Question` / `?` / `Answer` on separate lines | Multi-line card (`??` makes two cards, one in each direction) |
| `#flashcards/Travel` anywhere in a note | Sends that note's cards to the "Travel" deck |

Without a `#flashcards/…` tag, a card's deck is the note's folder. Lines inside code blocks are ignored.

## Development

```bash
npm install
npm run dev     # http://localhost:3000 (the offline service worker only runs in production builds)
npm run lint
npm run build
```

Built with Next.js 16 (App Router), React 19, `react-markdown` + `remark-gfm`, and `react-force-graph-2d`.

| Path | What it contains |
| --- | --- |
| `src/lib/` | Data model and seed vault, link index, card parser, store, custom remark plugin |
| `src/components/` | App shell, file tree, editor, markdown view, graph canvas, command palette |
| `src/app/` | Routes: `/`, `/graph`, `/flashcards`, `/flashcards/study`, `/settings`, plus `manifest.ts` and icons |
| `public/sw.js` | Offline service worker |
