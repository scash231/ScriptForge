import React, { useState, useMemo } from 'react';
import { snippets, snippetCategories, type Snippet } from '../utils/snippets';
import { useStore, langFromName, findFile } from '../store/useStore';
import { Code2, ChevronDown, ChevronRight, Plus } from 'lucide-react';

export const SnippetLibrary: React.FC = () => {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(snippetCategories));
  const [filter, setFilter] = useState('');
  const files = useStore((s) => s.files);
  const openTabs = useStore((s) => s.openTabs);
  const activeTabIdForFile = useStore((s) => s.activeTabId);
  const activeFile = useMemo(() => {
    const tab = openTabs.find((t) => t.id === activeTabIdForFile);
    if (!tab) return null;
    return findFile(files, tab.fileId) ?? null;
  }, [files, openTabs, activeTabIdForFile]);
  const updateFileContent = useStore((s) => s.updateFileContent);

  const activeLang = activeFile ? langFromName(activeFile.name) : '';

  const filtered = snippets.filter(
    (s) =>
      (filter === '' || s.label.toLowerCase().includes(filter.toLowerCase()) || s.category.toLowerCase().includes(filter.toLowerCase())) &&
      (activeLang === '' || s.language === activeLang || activeLang === 'plaintext'),
  );

  const toggleCat = (cat: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const insertSnippet = (snippet: Snippet) => {
    if (!activeFile) return;
    const content = (activeFile.content ?? '') + '\n' + snippet.code;
    updateFileContent(activeFile.id, content);
  };

  const categories = [...new Set(filtered.map((s) => s.category))];

  return (
    <div className="flex flex-col h-full">
      <div className="p-2">
        <input
          className="w-full bg-bg-tertiary text-txt-primary text-sm px-2 py-1 rounded border border-bdr"
          placeholder="Filter snippets..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto px-1">
        {categories.map((cat) => (
          <div key={cat} className="mb-1">
            <button
              className="flex items-center gap-1 w-full px-2 py-1 text-xs font-medium text-txt-muted hover:text-txt-secondary uppercase tracking-wider"
              onClick={() => toggleCat(cat)}
            >
              {expandedCats.has(cat) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              {cat}
            </button>
              {expandedCats.has(cat) && (
                <div className="overflow-hidden">
                  {filtered
                    .filter((s) => s.category === cat)
                    .map((snippet) => (
                      <div
                        key={snippet.id}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-bg-hover rounded mx-1 group"
                        onClick={() => insertSnippet(snippet)}
                        title={`Insert ${snippet.label}`}
                      >
                        <Code2 size={13} className="text-accent-blue flex-shrink-0" />
                        <span className="flex-1 text-txt-secondary group-hover:text-txt-primary truncate">
                          {snippet.label}
                        </span>
                        <span className="text-[10px] text-txt-muted">{snippet.language}</span>
                        <Plus size={12} className="opacity-0 group-hover:opacity-100 text-accent-blue transition-opacity" />
                      </div>
                    ))}
                </div>
              )}
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-center text-txt-muted text-sm py-4">No matching snippets</p>
        )}
      </div>
    </div>
  );
};
