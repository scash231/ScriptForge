import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
  Sun, Moon, PanelLeft, PanelBottom, Map, WrapText,
  Play, Trash2, Search, Settings, FilePlus, FolderPlus,
  Variable, Zap, Command,
} from 'lucide-react';

interface Cmd {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const open = useStore((s) => s.commandPaletteOpen);
  const toggle = useStore((s) => s.toggleCommandPalette);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const toggleLeftSidebar = useStore((s) => s.toggleLeftSidebar);
  const toggleRightSidebar = useStore((s) => s.toggleRightSidebar);
  const toggleTerminal = useStore((s) => s.toggleTerminal);
  const toggleGlobalSearch = useStore((s) => s.toggleGlobalSearch);
  const toggleSettingsModal = useStore((s) => s.toggleSettingsModal);
  const clearTerminal = useStore((s) => s.clearTerminal);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const setRightSidebarView = useStore((s) => s.setRightSidebarView);

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const commands: Cmd[] = useMemo(
    () => [
      {
        id: 'theme', label: `Toggle Theme (current: ${settings.theme})`,
        shortcut: '', icon: settings.theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />,
        action: () => { toggleTheme(); toggle(); },
      },
      {
        id: 'minimap', label: `Toggle Minimap (${settings.minimap ? 'ON' : 'OFF'})`,
        icon: <Map size={14} />,
        action: () => { updateSettings({ minimap: !settings.minimap }); toggle(); },
      },
      {
        id: 'wordwrap', label: `Toggle Word Wrap (${settings.wordWrap ? 'ON' : 'OFF'})`,
        icon: <WrapText size={14} />,
        action: () => { updateSettings({ wordWrap: !settings.wordWrap }); toggle(); },
      },
      {
        id: 'sidebar', label: 'Toggle Left Sidebar', shortcut: 'Ctrl+B',
        icon: <PanelLeft size={14} />,
        action: () => { toggleLeftSidebar(); toggle(); },
      },
      {
        id: 'rightsidebar', label: 'Toggle Right Sidebar',
        icon: <PanelLeft size={14} className="rotate-180" />,
        action: () => { toggleRightSidebar(); toggle(); },
      },
      {
        id: 'terminal', label: 'Toggle Terminal', shortcut: 'Ctrl+`',
        icon: <PanelBottom size={14} />,
        action: () => { toggleTerminal(); toggle(); },
      },
      {
        id: 'search', label: 'Search in Files', shortcut: 'Ctrl+Shift+F',
        icon: <Search size={14} />,
        action: () => { toggle(); toggleGlobalSearch(); },
      },
      {
        id: 'settings', label: 'Open Settings',
        icon: <Settings size={14} />,
        action: () => { toggle(); toggleSettingsModal(); },
      },
      {
        id: 'clear', label: 'Clear Terminal',
        icon: <Trash2 size={14} />,
        action: () => { clearTerminal(); toggle(); },
      },
      {
        id: 'variables', label: 'Show Variable Inspector',
        icon: <Variable size={14} />,
        action: () => { setRightSidebarView('variables'); useStore.getState().rightSidebarOpen || toggleRightSidebar(); toggle(); },
      },
      {
        id: 'macros', label: 'Show Macro Builder',
        icon: <Zap size={14} />,
        action: () => { setRightSidebarView('macros'); useStore.getState().rightSidebarOpen || toggleRightSidebar(); toggle(); },
      },
    ],
    [settings, toggle, toggleTheme, updateSettings, toggleLeftSidebar, toggleRightSidebar, toggleTerminal, toggleGlobalSearch, toggleSettingsModal, clearTerminal, setRightSidebarView],
  );

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()),
  );

  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => setSelectedIdx(0), [query]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIdx]) {
      filtered[selectedIdx].action();
    } else if (e.key === 'Escape') {
      toggle();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={toggle}>
      <div
        className="glass border border-bdr rounded-xl shadow-2xl w-[500px] max-h-[400px] flex flex-col overflow-hidden glow-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-bdr">
          <Command size={16} className="text-accent-blue flex-shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-txt-primary text-sm outline-none"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                i === selectedIdx
                  ? 'bg-accent-blue/15 text-accent-blue'
                  : 'text-txt-secondary hover:bg-bg-hover hover:text-txt-primary'
              }`}
              onClick={cmd.action}
              onMouseEnter={() => setSelectedIdx(i)}
            >
              <span className="flex-shrink-0">{cmd.icon}</span>
              <span className="flex-1 text-left">{cmd.label}</span>
              {cmd.shortcut && (
                <span className="text-[10px] text-txt-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
                  {cmd.shortcut}
                </span>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-txt-muted text-sm py-4">No matching commands</p>
          )}
        </div>
      </div>
    </div>
  );
};
