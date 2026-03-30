import React, { useMemo } from 'react';
import { useStore, langFromName, findFile } from '../store/useStore';
import { parseVariables } from '../utils/variableParser';
import { Variable, Box, Braces, FunctionSquare, Hash } from 'lucide-react';

const KindIcon: React.FC<{ kind: string }> = ({ kind }) => {
  switch (kind) {
    case 'function':
      return <FunctionSquare size={13} className="text-purple-400" />;
    case 'class':
      return <Box size={13} className="text-yellow-400" />;
    case 'constant':
      return <Hash size={13} className="text-orange-400" />;
    default:
      return <Braces size={13} className="text-accent-blue" />;
  }
};

export const VariableInspector: React.FC = () => {
  const files = useStore((s) => s.files);
  const openTabs = useStore((s) => s.openTabs);
  const activeTabIdForFile = useStore((s) => s.activeTabId);
  const activeFile = useMemo(() => {
    const tab = openTabs.find((t) => t.id === activeTabIdForFile);
    if (!tab) return null;
    return findFile(files, tab.fileId) ?? null;
  }, [files, openTabs, activeTabIdForFile]);
  const language = activeFile ? langFromName(activeFile.name) : '';
  const content = activeFile?.content ?? '';

  const variables = useMemo(() => parseVariables(content, language), [content, language]);

  if (!activeFile) {
    return (
      <div className="flex items-center justify-center h-full text-txt-muted text-sm">
        Open a file to inspect variables
      </div>
    );
  }

  if (variables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-txt-muted text-sm gap-2">
        <Variable size={32} className="opacity-30" />
        <p>No variables detected</p>
        <p className="text-xs">Supported: Python, JS/TS, Bash, PowerShell</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-bdr text-xs text-txt-muted">
        {variables.length} symbol{variables.length !== 1 ? 's' : ''} in {activeFile.name}
      </div>
      <div className="flex-1 overflow-y-auto">
        {variables.map((v, i) => (
          <div
            key={`${v.name}-${v.line}-${i}`}
            className="flex items-start gap-2 px-3 py-1.5 hover:bg-bg-hover text-sm border-b border-bdr/50"
          >
            <KindIcon kind={v.kind} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-txt-primary font-medium truncate">{v.name}</span>
                <span className="text-[10px] text-txt-muted ml-auto flex-shrink-0">Ln {v.line}</span>
              </div>
              {v.value && (
                <p className="text-xs text-txt-muted truncate mt-0.5">{v.value}</p>
              )}
            </div>
            <span className="text-[10px] bg-bg-tertiary px-1.5 py-0.5 rounded text-txt-muted flex-shrink-0">
              {v.kind}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
