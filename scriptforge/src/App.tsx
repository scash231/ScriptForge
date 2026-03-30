import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { EditorTabs } from './components/EditorTabs';
import { CodeEditor } from './components/CodeEditor';
import { RightSidebar } from './components/RightSidebar';
import { TerminalPanel } from './components/TerminalPanel';
import { StatusBar } from './components/StatusBar';
import { CommandPalette } from './components/CommandPalette';
import { SettingsModal } from './components/SettingsModal';
import { GlobalSearch } from './components/GlobalSearch';
import { ResizeHandle } from './components/ResizeHandle';
import { PanelLeft, PanelRight, PanelBottom } from 'lucide-react';

const App: React.FC = () => {
  const settings = useStore((s) => s.settings);
  const leftSidebarOpen = useStore((s) => s.leftSidebarOpen);
  const rightSidebarOpen = useStore((s) => s.rightSidebarOpen);
  const terminalOpen = useStore((s) => s.terminalOpen);
  const leftSidebarWidth = useStore((s) => s.leftSidebarWidth);
  const rightSidebarWidth = useStore((s) => s.rightSidebarWidth);
  const terminalHeight = useStore((s) => s.terminalHeight);
  const setLeftSidebarWidth = useStore((s) => s.setLeftSidebarWidth);
  const setRightSidebarWidth = useStore((s) => s.setRightSidebarWidth);
  const setTerminalHeight = useStore((s) => s.setTerminalHeight);
  const toggleLeftSidebar = useStore((s) => s.toggleLeftSidebar);
  const toggleRightSidebar = useStore((s) => s.toggleRightSidebar);
  const toggleTerminal = useStore((s) => s.toggleTerminal);
  const toggleCommandPalette = useStore((s) => s.toggleCommandPalette);
  const toggleGlobalSearch = useStore((s) => s.toggleGlobalSearch);
  const markTabClean = useStore((s) => s.markTabClean);
  const closeTab = useStore((s) => s.closeTab);
  const activeTabId = useStore((s) => s.activeTabId);

  /* apply theme class */
  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', settings.theme === 'light');
  }, [settings.theme]);

  /* global keyboard shortcuts */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'p') {
        e.preventDefault();
        toggleCommandPalette();
      } else if (ctrl && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        toggleGlobalSearch();
      } else if (ctrl && e.key === 'b') {
        e.preventDefault();
        toggleLeftSidebar();
      } else if (ctrl && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
      } else if (ctrl && e.key === 's') {
        e.preventDefault();
        if (activeTabId) markTabClean(activeTabId);
      } else if (ctrl && e.key === 'w') {
        e.preventDefault();
        if (activeTabId) closeTab(activeTabId);
      } else if (e.key === 'F5') {
        e.preventDefault();
        /* handled by TopBar run button — trigger the click */
        document.querySelector<HTMLButtonElement>('[data-run-btn]')?.click();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleCommandPalette, toggleGlobalSearch, toggleLeftSidebar, toggleTerminal, markTabClean, closeTab, activeTabId]);

  return (
    <div
      className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden"
      style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <TopBar />

      <div className="flex flex-1 overflow-hidden" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* left sidebar */}
        <div
          className="flex-shrink-0 overflow-hidden"
          style={{
            width: leftSidebarOpen ? leftSidebarWidth : 0,
            transition: 'width 0.2s ease',
          }}
        >
          {leftSidebarOpen && <Sidebar />}
        </div>

        {/* left sidebar resize handle */}
        {leftSidebarOpen && (
          <ResizeHandle
            direction="horizontal"
            onResize={(d) => setLeftSidebarWidth(leftSidebarWidth + d)}
          />
        )}

        {/* left collapse button when closed */}
        {!leftSidebarOpen && (
          <button
            className="w-6 flex items-center justify-center bg-bg-secondary border-r border-bdr text-txt-muted hover:text-accent-blue transition-colors flex-shrink-0"
            onClick={toggleLeftSidebar}
            title="Open sidebar"
          >
            <PanelLeft size={14} />
          </button>
        )}

        {/* center: editor + terminal */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <EditorTabs />
          <div className="flex-1 overflow-hidden">
            <CodeEditor />
          </div>

          {/* terminal resize + panel */}
          {terminalOpen && (
            <>
              <ResizeHandle
                direction="vertical"
                onResize={(d) => setTerminalHeight(terminalHeight - d)}
              />
              <div
                className="flex-shrink-0 overflow-hidden"
                style={{ height: terminalHeight }}
              >
                <TerminalPanel />
              </div>
            </>
          )}

          {!terminalOpen && (
            <button
              className="h-6 flex items-center justify-center bg-bg-secondary border-t border-bdr text-txt-muted hover:text-accent-blue transition-colors text-[11px] gap-1 flex-shrink-0"
              onClick={toggleTerminal}
            >
              <PanelBottom size={12} /> Terminal
            </button>
          )}
        </div>

        {/* right sidebar resize handle */}
        {rightSidebarOpen && (
          <ResizeHandle
            direction="horizontal"
            onResize={(d) => setRightSidebarWidth(rightSidebarWidth - d)}
          />
        )}

        {/* right sidebar */}
        <div
          className="flex-shrink-0 overflow-hidden"
          style={{
            width: rightSidebarOpen ? rightSidebarWidth : 0,
            transition: 'width 0.2s ease',
          }}
        >
          {rightSidebarOpen && <RightSidebar />}
        </div>

        {!rightSidebarOpen && (
          <button
            className="w-6 flex items-center justify-center bg-bg-secondary border-l border-bdr text-txt-muted hover:text-accent-blue transition-colors flex-shrink-0"
            onClick={toggleRightSidebar}
            title="Open right panel"
          >
            <PanelRight size={14} />
          </button>
        )}
      </div>

      <StatusBar />

      {/* overlays */}
      <CommandPalette />
      <SettingsModal />
      <GlobalSearch />
    </div>
  );
};

export default App;
