import React, { useMemo } from 'react';
import { useStore, langFromName, findFile } from '../store/useStore';
import { Sun, Moon, CheckCircle, AlertCircle } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const files = useStore((s) => s.files);
  const openTabs = useStore((s) => s.openTabs);
  const activeTabIdForFile = useStore((s) => s.activeTabId);
  const activeFile = useMemo(() => {
    const tab = openTabs.find((t) => t.id === activeTabIdForFile);
    if (!tab) return null;
    return findFile(files, tab.fileId) ?? null;
  }, [files, openTabs, activeTabIdForFile]);
  const settings = useStore((s) => s.settings);
  const editorLine = useStore((s) => s.editorLine);
  const editorCol = useStore((s) => s.editorCol);
  const saveStatus = useStore((s) => s.saveStatus);
  const toggleTheme = useStore((s) => s.toggleTheme);

  const lang = activeFile ? langFromName(activeFile.name) : 'plaintext';
  const size = activeFile?.content ? new TextEncoder().encode(activeFile.content).length : 0;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="h-6 bg-bg-secondary border-t border-bdr flex items-center justify-between px-3 text-[11px] text-txt-muted select-none flex-shrink-0">
      <div className="flex items-center gap-4">
        {saveStatus === 'saved' ? (
          <span className="flex items-center gap-1 text-green-400">
            <CheckCircle size={12} /> Saved
          </span>
        ) : (
          <span className="flex items-center gap-1 text-yellow-400">
            <AlertCircle size={12} /> Unsaved changes
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {activeFile && (
          <>
            <span>
              Ln {editorLine}, Col {editorCol}
            </span>
            <span>{formatSize(size)}</span>
            <span>UTF-8</span>
            <span className="uppercase text-accent-blue">{lang}</span>
          </>
        )}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1 hover:text-txt-primary transition-colors"
          title="Toggle theme"
        >
          {settings.theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
          {settings.theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>
    </div>
  );
};
