import React from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';

export const EditorTabs: React.FC = () => {
  const openTabs = useStore((s) => s.openTabs);
  const activeTabId = useStore((s) => s.activeTabId);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const closeTab = useStore((s) => s.closeTab);

  if (openTabs.length === 0) return null;

  return (
    <div className="flex bg-bg-primary border-b border-bdr overflow-x-auto flex-shrink-0" style={{ minHeight: 36 }}>
      {openTabs.map((tab) => {
        const active = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer border-r border-bdr select-none whitespace-nowrap group transition-colors ${
              active
                ? 'bg-bg-secondary text-txt-primary border-t-2 border-t-accent-blue'
                : 'text-txt-muted hover:bg-bg-hover hover:text-txt-secondary border-t-2 border-t-transparent'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.isDirty && <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />}
            <span>{tab.name}</span>
            <button
              className="ml-1 p-0.5 rounded hover:bg-bg-tertiary opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
