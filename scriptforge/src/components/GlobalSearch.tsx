import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore, flatFiles } from '../store/useStore';
import type { SearchResult } from '../types';
import { Search, X, FileText, CaseSensitive } from 'lucide-react';

export const GlobalSearch: React.FC = () => {
  const open = useStore((s) => s.globalSearchOpen);
  const toggle = useStore((s) => s.toggleGlobalSearch);
  const files = useStore((s) => s.files);
  const allFiles = useMemo(() => flatFiles(files), [files]);
  const openFile = useStore((s) => s.openFile);
  const [query, setQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results: SearchResult[] = useMemo(() => {
    if (!query.trim()) return [];
    const res: SearchResult[] = [];
    const q = caseSensitive ? query : query.toLowerCase();

    for (const file of allFiles) {
      if (!file.content) continue;
      const lines = file.content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = caseSensitive ? lines[i] : lines[i].toLowerCase();
        if (line.includes(q)) {
          res.push({
            fileId: file.id,
            fileName: file.name,
            line: i + 1,
            text: lines[i],
          });
        }
      }
    }
    return res;
  }, [query, allFiles, caseSensitive]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]" onClick={toggle}>
      <div
        className="glass border border-bdr rounded-xl shadow-2xl w-[560px] max-h-[500px] flex flex-col overflow-hidden glow-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* search bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-bdr">
          <Search size={16} className="text-accent-blue flex-shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-txt-primary text-sm outline-none"
            placeholder="Search in all files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && toggle()}
          />
          <button
            className={`p-1 rounded transition-colors ${caseSensitive ? 'bg-accent-blue/20 text-accent-blue' : 'text-txt-muted hover:text-txt-secondary'}`}
            onClick={() => setCaseSensitive(!caseSensitive)}
            title="Case sensitive"
          >
            <CaseSensitive size={16} />
          </button>
          <button className="p-1 rounded hover:bg-bg-hover text-txt-muted" onClick={toggle}>
            <X size={16} />
          </button>
        </div>

        {/* results */}
        <div className="flex-1 overflow-y-auto">
          {query.trim() && (
            <div className="px-4 py-1.5 text-[11px] text-txt-muted border-b border-bdr">
              {results.length} result{results.length !== 1 ? 's' : ''} in {allFiles.length} files
            </div>
          )}
          {results.map((r, i) => (
            <button
              key={`${r.fileId}-${r.line}-${i}`}
              className="w-full text-left px-4 py-2 hover:bg-bg-hover flex items-start gap-3 border-b border-bdr/30 transition-colors"
              onClick={() => {
                openFile(r.fileId);
                toggle();
              }}
            >
              <FileText size={14} className="text-accent-blue flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-txt-primary font-medium">{r.fileName}</span>
                  <span className="text-txt-muted">Ln {r.line}</span>
                </div>
                <p className="text-xs text-txt-secondary truncate mt-0.5 font-mono">{r.text.trim()}</p>
              </div>
            </button>
          ))}
          {query.trim() && results.length === 0 && (
            <p className="text-center text-txt-muted text-sm py-8">No results found</p>
          )}
        </div>
      </div>
    </div>
  );
};
