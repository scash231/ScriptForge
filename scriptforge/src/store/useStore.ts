import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FileNode, Tab, Macro, MacroAction, TerminalLine, Settings, MacroActionType, MacroActionDefaults as Defaults } from '../types';
import { MacroActionDefaults } from '../types';

let _nextId = Date.now();
const uid = () => `id_${_nextId++}`;

/* ── tree helpers ─────────────────────────────────── */

export function findFile(nodes: FileNode[], id: string): FileNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const f = findFile(n.children, id);
      if (f) return f;
    }
  }
  return null;
}

function updateInTree(nodes: FileNode[], id: string, fn: (n: FileNode) => FileNode): FileNode[] {
  return nodes.map((n) => {
    if (n.id === id) return fn(n);
    if (n.children) return { ...n, children: updateInTree(n.children, id, fn) };
    return n;
  });
}

function removeFromTree(nodes: FileNode[], id: string): FileNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => (n.children ? { ...n, children: removeFromTree(n.children, id) } : n));
}

function addToParent(nodes: FileNode[], parentId: string | null, child: FileNode): FileNode[] {
  if (parentId === null) return [...nodes, child];
  return nodes.map((n) => {
    if (n.id === parentId && n.type === 'folder')
      return { ...n, children: [...(n.children || []), child] };
    if (n.children) return { ...n, children: addToParent(n.children, parentId, child) };
    return n;
  });
}

export function flatFiles(nodes: FileNode[]): FileNode[] {
  const out: FileNode[] = [];
  for (const n of nodes) {
    if (n.type === 'file') out.push(n);
    if (n.children) out.push(...flatFiles(n.children));
  }
  return out;
}

/* ── language helper ──────────────────────────────── */

export function langFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    py: 'python', js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
    sh: 'shell', bash: 'shell', ps1: 'powershell', ahk: 'autohotkey',
    json: 'json', md: 'markdown', html: 'html', css: 'css', xml: 'xml',
    yaml: 'yaml', yml: 'yaml', sql: 'sql', txt: 'plaintext',
  };
  return map[ext] ?? 'plaintext';
}

/* ── default project files ────────────────────────── */

const defaultFiles: FileNode[] = [
  {
    id: 'root', name: 'my-project', type: 'folder', parentId: null, children: [
      {
        id: 'src', name: 'src', type: 'folder', parentId: 'root', children: [
          {
            id: 'main-py', name: 'main.py', type: 'file', parentId: 'src',
            content: `# ScriptForge — Welcome Script
import os
import sys

def greet(name: str) -> str:
    """Return a greeting message."""
    return f"Hello, {name}! Welcome to ScriptForge."

def main():
    user = os.getenv("USER", "Developer")
    message = greet(user)
    print(message)

    features = [
        "Monaco Editor with IntelliSense",
        "Multi-language support",
        "Macro Builder",
        "Integrated Terminal",
        "Variable Inspector",
    ]

    for i, feature in enumerate(features, 1):
        print(f"  {i}. {feature}")

if __name__ == "__main__":
    main()
`,
          },
          {
            id: 'utils-js', name: 'utils.js', type: 'file', parentId: 'src',
            content: `// Utility functions for ScriptForge

/**
 * Debounce a function call
 */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const API_BASE = "https://api.example.com";

async function fetchData(endpoint) {
  const response = await fetch(\`\${API_BASE}/\${endpoint}\`);
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  return response.json();
}

console.log("Utilities loaded");
console.log("formatBytes(1536):", formatBytes(1536));
`,
          },
        ],
      },
      {
        id: 'scripts', name: 'scripts', type: 'folder', parentId: 'root', children: [
          {
            id: 'build-sh', name: 'build.sh', type: 'file', parentId: 'scripts',
            content: `#!/bin/bash
# Build script for the project

echo "Starting build process..."

BUILD_DIR="./dist"
SRC_DIR="./src"

if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
    echo "Cleaned previous build."
fi

mkdir -p "$BUILD_DIR"
cp -r "$SRC_DIR"/* "$BUILD_DIR"/

echo "Build completed successfully!"
`,
          },
          {
            id: 'deploy-ps1', name: 'deploy.ps1', type: 'file', parentId: 'scripts',
            content: `# PowerShell deployment script
param(
    [string]$Environment = "staging",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "Deploying to $Environment..." -ForegroundColor Cyan

$config = @{
    staging    = @{ Server = "stage.example.com"; Port = 8080 }
    production = @{ Server = "prod.example.com"; Port = 443 }
}

if (-not $config.ContainsKey($Environment)) {
    Write-Error "Unknown environment: $Environment"
    exit 1
}

$target = $config[$Environment]
Write-Host "Target: $($target.Server):$($target.Port)" -ForegroundColor Green
Write-Host "Deployment complete!" -ForegroundColor Green
`,
          },
        ],
      },
      {
        id: 'readme', name: 'README.md', type: 'file', parentId: 'root',
        content: `# My Project

Welcome to **ScriptForge**! This is your workspace.

## Getting Started

Create new files and folders using the sidebar.
Use the integrated terminal to run your scripts.

## Features

- Multi-language editing
- Macro builder
- Variable inspector
- Snippet library
`,
      },
    ],
  },
];

/* ── store ────────────────────────────────────────── */

export interface AppState {
  files: FileNode[];
  openTabs: Tab[];
  activeTabId: string | null;
  settings: Settings;

  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  terminalOpen: boolean;
  leftSidebarWidth: number;
  rightSidebarWidth: number;
  terminalHeight: number;

  leftSidebarView: 'files' | 'snippets';
  rightSidebarView: 'variables' | 'macros';

  macros: Macro[];
  activeMacroId: string | null;
  isRecording: boolean;

  terminalLines: TerminalLine[];

  globalSearchOpen: boolean;
  commandPaletteOpen: boolean;
  settingsModalOpen: boolean;
  saveStatus: 'saved' | 'unsaved';

  editorLine: number;
  editorCol: number;

  /* actions */
  openFile: (fileId: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  markTabClean: (tabId: string) => void;
  createFile: (parentId: string, name: string, type: 'file' | 'folder') => void;
  deleteFile: (fileId: string) => void;
  renameFile: (fileId: string, name: string) => void;
  importFile: (name: string, content: string) => void;

  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  toggleTerminal: () => void;
  setLeftSidebarWidth: (w: number) => void;
  setRightSidebarWidth: (w: number) => void;
  setTerminalHeight: (h: number) => void;
  setLeftSidebarView: (v: 'files' | 'snippets') => void;
  setRightSidebarView: (v: 'variables' | 'macros') => void;

  updateSettings: (s: Partial<Settings>) => void;
  toggleTheme: () => void;

  createMacro: (name: string) => void;
  deleteMacro: (id: string) => void;
  setActiveMacro: (id: string | null) => void;
  addMacroAction: (macroId: string, type: MacroActionType) => void;
  removeMacroAction: (macroId: string, actionId: string) => void;
  updateMacroAction: (macroId: string, actionId: string, params: Record<string, string>) => void;
  toggleMacroActionCollapse: (macroId: string, actionId: string) => void;
  moveMacroAction: (macroId: string, actionId: string, dir: -1 | 1) => void;
  setMacroShortcut: (macroId: string, shortcut: string) => void;
  toggleRecording: () => void;

  addTerminalLine: (text: string, type: TerminalLine['type']) => void;
  clearTerminal: () => void;

  toggleGlobalSearch: () => void;
  toggleCommandPalette: () => void;
  toggleSettingsModal: () => void;

  setCursorPos: (line: number, col: number) => void;

  /* selectors */
  getActiveFile: () => FileNode | null;
  getAllFiles: () => FileNode[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      files: defaultFiles,
      openTabs: [],
      activeTabId: null,
      settings: { theme: 'dark', fontSize: 14, wordWrap: false, minimap: true },

      leftSidebarOpen: true,
      rightSidebarOpen: false,
      terminalOpen: true,
      leftSidebarWidth: 260,
      rightSidebarWidth: 280,
      terminalHeight: 200,

      leftSidebarView: 'files',
      rightSidebarView: 'variables',

      macros: [],
      activeMacroId: null,
      isRecording: false,

      terminalLines: [{ id: uid(), text: 'ScriptForge Terminal ready.', type: 'info' }],

      globalSearchOpen: false,
      commandPaletteOpen: false,
      settingsModalOpen: false,
      saveStatus: 'saved' as const,
      editorLine: 1,
      editorCol: 1,

      /* ── file / tab actions ── */

      openFile: (fileId) => {
        const state = get();
        const file = findFile(state.files, fileId);
        if (!file || file.type !== 'file') return;
        const existing = state.openTabs.find((t) => t.fileId === fileId);
        if (existing) {
          set({ activeTabId: existing.id });
        } else {
          const tab: Tab = { id: uid(), fileId, name: file.name, isDirty: false };
          set({ openTabs: [...state.openTabs, tab], activeTabId: tab.id });
        }
      },

      closeTab: (tabId) => {
        const state = get();
        const idx = state.openTabs.findIndex((t) => t.id === tabId);
        const next = state.openTabs.filter((t) => t.id !== tabId);
        let newActive = state.activeTabId;
        if (state.activeTabId === tabId) {
          newActive = next.length > 0 ? next[Math.min(idx, next.length - 1)].id : null;
        }
        set({ openTabs: next, activeTabId: newActive });
      },

      setActiveTab: (tabId) => set({ activeTabId: tabId }),

      updateFileContent: (fileId, content) => {
        set((s) => ({
          files: updateInTree(s.files, fileId, (n) => ({ ...n, content })),
          openTabs: s.openTabs.map((t) => (t.fileId === fileId ? { ...t, isDirty: true } : t)),
          saveStatus: 'unsaved' as const,
        }));
      },

      markTabClean: (tabId) =>
        set((s) => ({
          openTabs: s.openTabs.map((t) => (t.id === tabId ? { ...t, isDirty: false } : t)),
          saveStatus: 'saved' as const,
        })),

      createFile: (parentId, name, type) => {
        const child: FileNode = {
          id: uid(),
          name,
          type,
          parentId,
          ...(type === 'folder' ? { children: [] } : { content: '' }),
        };
        set((s) => ({ files: addToParent(s.files, parentId, child) }));
      },

      deleteFile: (fileId) => {
        set((s) => ({
          files: removeFromTree(s.files, fileId),
          openTabs: s.openTabs.filter((t) => t.fileId !== fileId),
          activeTabId:
            s.openTabs.find((t) => t.fileId === fileId)?.id === s.activeTabId
              ? s.openTabs.filter((t) => t.fileId !== fileId)[0]?.id ?? null
              : s.activeTabId,
        }));
      },

      renameFile: (fileId, name) =>
        set((s) => ({
          files: updateInTree(s.files, fileId, (n) => ({ ...n, name })),
          openTabs: s.openTabs.map((t) => (t.fileId === fileId ? { ...t, name } : t)),
        })),

      importFile: (name, content) => {
        const id = uid();
        const node: FileNode = { id, name, type: 'file', parentId: 'root', content };
        set((s) => ({ files: addToParent(s.files, 'root', node) }));
        get().openFile(id);
      },

      /* ── panels ── */

      toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
      toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
      toggleTerminal: () => set((s) => ({ terminalOpen: !s.terminalOpen })),
      setLeftSidebarWidth: (w) => set({ leftSidebarWidth: Math.max(180, Math.min(500, w)) }),
      setRightSidebarWidth: (w) => set({ rightSidebarWidth: Math.max(200, Math.min(500, w)) }),
      setTerminalHeight: (h) => set({ terminalHeight: Math.max(80, Math.min(600, h)) }),
      setLeftSidebarView: (v) => set({ leftSidebarView: v }),
      setRightSidebarView: (v) => set({ rightSidebarView: v }),

      /* ── settings ── */

      updateSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s } })),
      toggleTheme: () =>
        set((s) => ({
          settings: { ...s.settings, theme: s.settings.theme === 'dark' ? 'light' : 'dark' },
        })),

      /* ── macros ── */

      createMacro: (name) => {
        const m: Macro = { id: uid(), name, shortcut: '', actions: [] };
        set((s) => ({ macros: [...s.macros, m], activeMacroId: m.id }));
      },
      deleteMacro: (id) =>
        set((s) => ({
          macros: s.macros.filter((m) => m.id !== id),
          activeMacroId: s.activeMacroId === id ? null : s.activeMacroId,
        })),
      setActiveMacro: (id) => set({ activeMacroId: id }),
      addMacroAction: (macroId, type) => {
        const action: MacroAction = {
          id: uid(),
          type,
          params: { ...MacroActionDefaults[type] },
          collapsed: false,
        };
        set((s) => ({
          macros: s.macros.map((m) =>
            m.id === macroId ? { ...m, actions: [...m.actions, action] } : m,
          ),
        }));
      },
      removeMacroAction: (macroId, actionId) =>
        set((s) => ({
          macros: s.macros.map((m) =>
            m.id === macroId ? { ...m, actions: m.actions.filter((a) => a.id !== actionId) } : m,
          ),
        })),
      updateMacroAction: (macroId, actionId, params) =>
        set((s) => ({
          macros: s.macros.map((m) =>
            m.id === macroId
              ? {
                  ...m,
                  actions: m.actions.map((a) =>
                    a.id === actionId ? { ...a, params: { ...a.params, ...params } } : a,
                  ),
                }
              : m,
          ),
        })),
      toggleMacroActionCollapse: (macroId, actionId) =>
        set((s) => ({
          macros: s.macros.map((m) =>
            m.id === macroId
              ? {
                  ...m,
                  actions: m.actions.map((a) =>
                    a.id === actionId ? { ...a, collapsed: !a.collapsed } : a,
                  ),
                }
              : m,
          ),
        })),
      moveMacroAction: (macroId, actionId, dir) =>
        set((s) => ({
          macros: s.macros.map((m) => {
            if (m.id !== macroId) return m;
            const i = m.actions.findIndex((a) => a.id === actionId);
            if (i < 0) return m;
            const j = i + dir;
            if (j < 0 || j >= m.actions.length) return m;
            const arr = [...m.actions];
            [arr[i], arr[j]] = [arr[j], arr[i]];
            return { ...m, actions: arr };
          }),
        })),
      setMacroShortcut: (macroId, shortcut) =>
        set((s) => ({
          macros: s.macros.map((m) => (m.id === macroId ? { ...m, shortcut } : m)),
        })),
      toggleRecording: () => set((s) => ({ isRecording: !s.isRecording })),

      /* ── terminal ── */

      addTerminalLine: (text, type) =>
        set((s) => ({ terminalLines: [...s.terminalLines, { id: uid(), text, type }] })),
      clearTerminal: () =>
        set({ terminalLines: [{ id: uid(), text: 'Terminal cleared.', type: 'info' }] }),

      /* ── UI toggles ── */

      toggleGlobalSearch: () => set((s) => ({ globalSearchOpen: !s.globalSearchOpen, commandPaletteOpen: false })),
      toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen, globalSearchOpen: false })),
      toggleSettingsModal: () => set((s) => ({ settingsModalOpen: !s.settingsModalOpen })),

      setCursorPos: (line, col) => set({ editorLine: line, editorCol: col }),

      /* ── selectors ── */

      getActiveFile: () => {
        const s = get();
        const tab = s.openTabs.find((t) => t.id === s.activeTabId);
        if (!tab) return null;
        return findFile(s.files, tab.fileId) ?? null;
      },
      getAllFiles: () => flatFiles(get().files),
    }),
    {
      name: 'scriptforge-storage',
      version: 2,
      partialize: (s) => ({
        files: s.files,
        settings: s.settings,
        macros: s.macros,
        leftSidebarOpen: s.leftSidebarOpen,
        rightSidebarOpen: s.rightSidebarOpen,
        terminalOpen: s.terminalOpen,
        leftSidebarWidth: s.leftSidebarWidth,
        rightSidebarWidth: s.rightSidebarWidth,
        terminalHeight: s.terminalHeight,
        openTabs: s.openTabs,
        activeTabId: s.activeTabId,
      }),
    },
  ),
);
