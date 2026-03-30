import React, { useState, useRef, useEffect } from 'react';
import { useStore, langFromName } from '../store/useStore';
import { runScript } from '../utils/scriptRunner';
import {
  Zap, Play, Settings, ChevronDown,
  FilePlus, FolderPlus, Download, Save,
  Undo2, Redo2, Search, Scissors,
  PanelLeft, PanelBottom, PanelRight, Map, WrapText,
  Circle, HelpCircle, Keyboard, Info,
} from 'lucide-react';

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
}

const MenuDropdown: React.FC<{ label: string; items: MenuItem[]; onClose: () => void }> = ({
  label,
  items,
  onClose,
}) => {
  return (
    <div className="absolute top-full left-0 mt-0.5 glass border border-bdr rounded-md shadow-xl py-1 min-w-[200px] z-50">
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="border-t border-bdr my-1" />
        ) : (
          <button
            key={i}
            className="w-full flex items-center gap-3 px-3 py-1.5 text-xs text-txt-secondary hover:bg-bg-hover hover:text-txt-primary transition-colors"
            onClick={() => {
              item.action?.();
              onClose();
            }}
          >
            {item.icon && <span className="w-4 flex-shrink-0">{item.icon}</span>}
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && (
              <span className="text-[10px] text-txt-muted">{item.shortcut}</span>
            )}
          </button>
        ),
      )}
    </div>
  );
};

export const TopBar: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    toggleLeftSidebar, toggleRightSidebar, toggleTerminal,
    toggleGlobalSearch, toggleCommandPalette, toggleSettingsModal,
    settings, updateSettings, toggleTheme,
    getActiveFile, addTerminalLine, terminalOpen,
    createFile, importFile,
  } = useStore();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRun = () => {
    const file = getActiveFile();
    if (!file || !file.content) {
      addTerminalLine('No file open to run.', 'stderr');
      return;
    }
    if (!terminalOpen) useStore.getState().toggleTerminal();

    addTerminalLine(`\n▶ Running ${file.name}...`, 'info');
    const result = runScript(file.content, file.name);

    for (const line of result.output) {
      addTerminalLine(line, 'stdout');
    }
    for (const line of result.errors) {
      addTerminalLine(line, 'stderr');
    }
    addTerminalLine(`✓ Finished in ${result.duration.toFixed(1)}ms`, 'info');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = () => {
      if (!input.files) return;
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const reader = new FileReader();
        reader.onload = () => importFile(file.name, reader.result as string);
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const menus: { label: string; items: MenuItem[] }[] = [
    {
      label: 'File',
      items: [
        { label: 'New File', icon: <FilePlus size={13} />, shortcut: 'Ctrl+N', action: () => createFile('root', 'untitled.js', 'file') },
        { label: 'New Folder', icon: <FolderPlus size={13} />, action: () => createFile('root', 'new-folder', 'folder') },
        { divider: true, label: '' },
        { label: 'Import File...', icon: <Download size={13} />, action: handleImport },
        { divider: true, label: '' },
        { label: 'Save', icon: <Save size={13} />, shortcut: 'Ctrl+S', action: () => {
          const tab = useStore.getState().openTabs.find(t => t.id === useStore.getState().activeTabId);
          if (tab) useStore.getState().markTabClean(tab.id);
        }},
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', icon: <Undo2 size={13} />, shortcut: 'Ctrl+Z' },
        { label: 'Redo', icon: <Redo2 size={13} />, shortcut: 'Ctrl+Y' },
        { divider: true, label: '' },
        { label: 'Find & Replace', icon: <Search size={13} />, shortcut: 'Ctrl+H' },
        { label: 'Search in Files', icon: <Search size={13} />, shortcut: 'Ctrl+Shift+F', action: () => toggleGlobalSearch() },
        { divider: true, label: '' },
        { label: 'Command Palette', icon: <Scissors size={13} />, shortcut: 'Ctrl+P', action: () => toggleCommandPalette() },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Toggle Sidebar', icon: <PanelLeft size={13} />, shortcut: 'Ctrl+B', action: () => toggleLeftSidebar() },
        { label: 'Toggle Right Panel', icon: <PanelRight size={13} />, action: () => toggleRightSidebar() },
        { label: 'Toggle Terminal', icon: <PanelBottom size={13} />, shortcut: 'Ctrl+`', action: () => toggleTerminal() },
        { divider: true, label: '' },
        { label: `Minimap (${settings.minimap ? 'ON' : 'OFF'})`, icon: <Map size={13} />, action: () => updateSettings({ minimap: !settings.minimap }) },
        { label: `Word Wrap (${settings.wordWrap ? 'ON' : 'OFF'})`, icon: <WrapText size={13} />, action: () => updateSettings({ wordWrap: !settings.wordWrap }) },
      ],
    },
    {
      label: 'Run',
      items: [
        { label: 'Run Script', icon: <Play size={13} />, shortcut: 'F5', action: handleRun },
        { label: 'Record Macro', icon: <Circle size={13} />, action: () => {
          useStore.getState().toggleRecording();
          if (!useStore.getState().rightSidebarOpen) toggleRightSidebar();
          useStore.getState().setRightSidebarView('macros');
        }},
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'Keyboard Shortcuts', icon: <Keyboard size={13} />, action: () => {
          addTerminalLine('Keyboard Shortcuts:', 'info');
          addTerminalLine('  Ctrl+P       Command Palette', 'stdout');
          addTerminalLine('  Ctrl+S       Save', 'stdout');
          addTerminalLine('  Ctrl+B       Toggle Sidebar', 'stdout');
          addTerminalLine('  Ctrl+`       Toggle Terminal', 'stdout');
          addTerminalLine('  Ctrl+Shift+F Search in Files', 'stdout');
          addTerminalLine('  Ctrl+H       Find & Replace', 'stdout');
          addTerminalLine('  Ctrl+W       Close Tab', 'stdout');
          addTerminalLine('  F5           Run Script', 'stdout');
        }},
        { divider: true, label: '' },
        { label: 'About ScriptForge', icon: <Info size={13} />, action: () => {
          addTerminalLine('ScriptForge v1.0.0 — Modern Script Editor & Macro Builder', 'info');
        }},
      ],
    },
  ];

  return (
    <div className="h-10 bg-bg-secondary border-b border-bdr flex items-center px-2 gap-1 select-none flex-shrink-0">
      {/* logo */}
      <div className="flex items-center gap-2 px-2 mr-2">
        <Zap size={18} className="text-accent-blue" />
        <span className="text-sm font-bold text-txt-primary tracking-tight">ScriptForge</span>
      </div>

      {/* menus */}
      <div ref={menuRef} className="flex items-center gap-0.5">
        {menus.map((menu) => (
          <div key={menu.label} className="relative">
            <button
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                openMenu === menu.label
                  ? 'bg-bg-hover text-txt-primary'
                  : 'text-txt-secondary hover:bg-bg-hover hover:text-txt-primary'
              }`}
              onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
              onMouseEnter={() => openMenu && setOpenMenu(menu.label)}
            >
              {menu.label}
            </button>
            {openMenu === menu.label && (
              <MenuDropdown
                label={menu.label}
                items={menu.items}
                onClose={() => setOpenMenu(null)}
              />
            )}
          </div>
        ))}
      </div>

      {/* spacer */}
      <div className="flex-1" />

      {/* run button */}
      <button
        data-run-btn
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-md transition-colors mr-1"
        onClick={handleRun}
      >
        <Play size={13} fill="currentColor" /> Run
      </button>

      {/* settings */}
      <button
        className="p-1.5 rounded hover:bg-bg-hover text-txt-muted hover:text-txt-primary transition-colors"
        onClick={toggleSettingsModal}
      >
        <Settings size={16} />
      </button>
    </div>
  );
};
