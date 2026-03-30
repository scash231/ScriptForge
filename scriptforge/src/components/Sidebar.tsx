import React from 'react';
import { useStore } from '../store/useStore';
import { FileTree } from './FileTree';
import { SnippetLibrary } from './SnippetLibrary';
import { Files, Code2 } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const view = useStore((s) => s.leftSidebarView);
  const setView = useStore((s) => s.setLeftSidebarView);

  return (
    <div className="h-full flex flex-col bg-bg-secondary border-r border-bdr">
      {/* view switcher */}
      <div className="flex border-b border-bdr flex-shrink-0">
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition-colors ${
            view === 'files'
              ? 'text-accent-blue border-b-2 border-accent-blue'
              : 'text-txt-muted hover:text-txt-secondary'
          }`}
          onClick={() => setView('files')}
        >
          <Files size={14} /> Explorer
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition-colors ${
            view === 'snippets'
              ? 'text-accent-blue border-b-2 border-accent-blue'
              : 'text-txt-muted hover:text-txt-secondary'
          }`}
          onClick={() => setView('snippets')}
        >
          <Code2 size={14} /> Snippets
        </button>
      </div>

      {/* content */}
      <div className="flex-1 overflow-hidden">
        {view === 'files' ? <FileTree /> : <SnippetLibrary />}
      </div>
    </div>
  );
};
