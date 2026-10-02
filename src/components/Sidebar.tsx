"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FilePlus2, Folder, FolderPen, FolderPlus, GitFork, House, Layers, Moon, Notebook, PanelLeft, Plus, ScanText, Search, Settings, Sun,
  Trash2,
} from "lucide-react";
import Logo from "./Logo";
import Sheet, { type Anchor } from "./Sheet";
import { LearnButton } from "./Onboarding";
import { allFolders, inFolder, toast, useCards, useVault, vault } from "@/lib/store";
import { titleOf } from "@/lib/vault";
import { setUI, useUI } from "@/lib/ui";
import { useSlider } from "@/lib/useSlider";

function FolderName({ path, onDone }: { path: string; onDone: () => void }) {
  const [value, setValue] = useState(titleOf(path));
  const commit = (name: string | null) => {
    const err = name !== null && name.trim() && name.trim() !== titleOf(path) ? vault.renameFolder(path, name) : null;
    if (err) toast(err);
    onDone();
  };
  return (
    <input
      className="sb-input"
      autoFocus
      value={value}
      aria-label="Folder name"
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit(value);
        if (e.key === "Escape") commit(null);
      }}
      onBlur={() => commit(value)}
    />
  );
}

export function ThemeToggle({ className = "icon-btn" }: { className?: string }) {
  const { settings } = useVault();
  const dark =
    settings.theme === "graphite" ||
    (settings.theme === "system" && typeof window !== "undefined" && document.documentElement.dataset.theme === "graphite");
  return (
    <button
      className={`${className} theme-toggle`}
      aria-label={dark ? "Switch to Paper (light)" : "Switch to Graphite (dark)"}
      title={dark ? "Paper theme" : "Graphite theme"}
      onClick={() => vault.updateSettings({ theme: dark ? "paper" : "graphite" })}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

/** Folders and places, as in the Apple Notes sidebar. */
export default function Sidebar() {
  const state = useVault();
  const { notes, workspace } = state;
  const { renameFolder } = useUI();
  const cards = useCards().length;
  const router = useRouter();
  const pathname = usePathname();
  const [drop, setDrop] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ path: string; at: Anchor } | null>(null);
  const folders = useMemo(() => allFolders(state), [state]);
  const counts = useMemo(() => {
    const list = Object.values(notes);
    return new Map(["", ...folders].map((f) => [f, list.filter((n) => inFolder(n.path, f)).length]));
  }, [notes, folders]);

  const closeDrawer = () => setUI({ mobileLeft: false });
  const show = (path: string) => {
    vault.showFolder(path, { select: true });
    closeDrawer();
    if (pathname !== "/") router.push("/");
  };
  const newFolder = (parent = "") => setUI({ renameFolder: vault.createFolder(parent) });
  // Each group's highlight slides to the chosen place or folder.
  const placesNav = useSlider<HTMLElement>(".sb-item.is-active", pathname);
  const foldersBox = useSlider<HTMLDivElement>(".sb-item.is-active", `${pathname}|${workspace.folder}|${folders.join("\n")}`);

  const places = [
    { href: "/home", label: "Home", icon: <House size={17} />, active: pathname === "/home" },
    { href: "/flashcards", label: "Practice", icon: <Layers size={17} />, active: pathname.startsWith("/flashcards"), count: cards },
    { href: "/graph", label: "Map", icon: <GitFork size={17} />, active: pathname === "/graph" },
    { href: "/search", label: "Search", icon: <Search size={17} />, active: pathname === "/search" },
  ];

  const folderRow = (path: string, depth: number) => {
    const on = pathname === "/" && workspace.folder === path;
    if (path && renameFolder === path) {
      return (
        <div key={path} className="sb-item is-editing" style={{ paddingLeft: 10 + depth * 14 }}>
          <Folder size={17} />
          <FolderName path={path} onDone={() => setUI({ renameFolder: null })} />
        </div>
      );
    }
    return (
      <button
        key={path || "(all)"}
        className={`sb-item${on ? " is-active" : ""}${drop === path ? " is-drop" : ""}`}
        style={{ paddingLeft: 10 + depth * 14 }}
        title={path || "All notes"}
        onClick={() => show(path)}
        onContextMenu={(e) => {
          if (!path) return;
          e.preventDefault();
          setMenu({ path, at: { x: e.clientX, y: e.clientY } });
        }}
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes("text/graphite-note")) return;
          e.preventDefault();
          setDrop(path);
        }}
        onDragLeave={() => setDrop((d) => (d === path ? null : d))}
        onDrop={(e) => {
          e.preventDefault();
          setDrop(null);
          const id = e.dataTransfer.getData("text/graphite-note");
          const err = id ? vault.moveNote(id, path) : null;
          if (err) toast(err);
        }}
      >
        {path ? <Folder size={17} /> : <Notebook size={17} />}
        <span>{path ? titleOf(path) : "All notes"}</span>
        <small>{counts.get(path) ?? 0}</small>
      </button>
    );
  };

  return (
    <aside className="sidebar-left" aria-label="Folders">
      <div className="sb-head">
        <Link href="/home" className="sb-brand" onClick={closeDrawer}>
          <Logo size={24} /> Cranoly
        </Link>
        <button
          className="icon-btn"
          aria-label="Hide folders"
          title="Hide folders (⌘\)"
          onClick={() => {
            vault.setPanel("leftOpen", false);
            closeDrawer();
          }}
        >
          <PanelLeft size={17} />
        </button>
      </div>

      <div className="sb-body">
        <nav ref={placesNav} className="sb-group has-slider" aria-label="Places">
          <span className="slider-pill" aria-hidden />
          {places.map((p) => (
            <Link key={p.href} href={p.href} className={`sb-item${p.active ? " is-active" : ""}`} onClick={closeDrawer}>
              {p.icon}
              <span>{p.label}</span>
              {p.count ? <small>{p.count}</small> : null}
            </Link>
          ))}
          <button className="sb-item" onClick={() => setUI({ addWord: { noteId: pathname === "/" ? workspace.active : null, mode: "word" }, mobileLeft: false })}>
            <Plus size={17} />
            <span>Add a word</span>
          </button>
          <button className="sb-item" onClick={() => setUI({ scan: { noteId: pathname === "/" ? workspace.active : null }, mobileLeft: false })}>
            <ScanText size={17} />
            <span>Scan text</span>
          </button>
        </nav>

        <div className="sb-label">
          <span>Folders</span>
          <button className="icon-btn" aria-label="New folder" title="New folder" onClick={() => newFolder()}>
            <FolderPlus size={15} />
          </button>
        </div>
        <div ref={foldersBox} className="sb-group has-slider">
          <span className="slider-pill" aria-hidden />
          {folderRow("", 0)}
          {folders.map((f) => folderRow(f, f.split("/").length - 1))}
        </div>
      </div>

      <div className="sb-foot">
        <LearnButton className="sb-item" text="Learn the basics" />
        <div className="sb-foot-row">
          <Link href="/settings" className={`sb-item${pathname === "/settings" ? " is-active" : ""}`} onClick={closeDrawer}>
            <Settings size={17} />
            <span>Settings</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <Sheet open={!!menu} anchor={menu?.at ?? null} onClose={() => setMenu(null)} title={menu ? titleOf(menu.path) : undefined}>
        {menu && (
          <div className="sheet-list">
            <button
              className="sheet-item"
              onClick={() => {
                setMenu(null);
                setUI({ pendingRename: vault.createNote({ folder: menu.path }) });
                if (pathname !== "/") router.push("/");
              }}
            >
              <FilePlus2 size={16} />
              <span>New note here</span>
            </button>
            <button
              className="sheet-item"
              onClick={() => {
                setMenu(null);
                newFolder(menu.path);
              }}
            >
              <FolderPlus size={16} />
              <span>New folder inside</span>
            </button>
            <button
              className="sheet-item"
              onClick={() => {
                setMenu(null);
                setUI({ renameFolder: menu.path });
              }}
            >
              <FolderPen size={16} />
              <span>Rename</span>
            </button>
            <span className="menu-sep" />
            <button
              className="sheet-item is-danger"
              onClick={() => {
                setMenu(null);
                vault.deleteFolder(menu.path);
              }}
            >
              <Trash2 size={16} />
              <span>Delete folder and its notes</span>
            </button>
          </div>
        )}
      </Sheet>
    </aside>
  );
}
