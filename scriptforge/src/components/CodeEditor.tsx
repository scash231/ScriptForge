import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useStore, langFromName, findFile } from '../store/useStore';
import { FileCode2 } from 'lucide-react';

let ahkRegistered = false;

export const CodeEditor: React.FC = () => {
  const files = useStore((s) => s.files);
  const openTabs = useStore((s) => s.openTabs);
  const activeTabIdForFile = useStore((s) => s.activeTabId);
  const activeFile = useMemo(() => {
    const tab = openTabs.find((t) => t.id === activeTabIdForFile);
    if (!tab) return null;
    return findFile(files, tab.fileId) ?? null;
  }, [files, openTabs, activeTabIdForFile]);
  const activeTabId = useStore((s) => s.activeTabId);
  const settings = useStore((s) => s.settings);
  const updateFileContent = useStore((s) => s.updateFileContent);
  const markTabClean = useStore((s) => s.markTabClean);
  const setCursorPos = useStore((s) => s.setCursorPos);
  const importFile = useStore((s) => s.importFile);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  const language = activeFile ? langFromName(activeFile.name) : 'plaintext';
  const theme = settings.theme === 'dark' ? 'vs-dark' : 'vs';

  const handleMount: OnMount = (ed, monaco) => {
    editorRef.current = ed;

    if (!ahkRegistered) {
      ahkRegistered = true;
      monaco.languages.register({ id: 'autohotkey' });
      monaco.languages.setMonarchTokensProvider('autohotkey', {
        tokenizer: {
          root: [
            [/;.*$/, 'comment'],
            [/#\w+/, 'keyword'],
            [/\b(if|else|return|loop|while|for|break|continue|goto|gosub)\b/i, 'keyword'],
            [/\b(MsgBox|Send|Click|Sleep|Run|WinActivate|WinClose|InputBox|FileAppend)\b/i, 'support.function'],
            [/"[^"]*"/, 'string'],
            [/\b\d+\b/, 'number'],
            [/::|:/, 'delimiter'],
            [/[{}()]/, 'delimiter.bracket'],
          ],
        },
      } as any);
    }

    ed.onDidChangeCursorPosition((e) => {
      setCursorPos(e.position.lineNumber, e.position.column);
    });
  };

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (!activeFile || value === undefined) return;
      updateFileContent(activeFile.id, value);

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        if (activeTabId) markTabClean(activeTabId);
      }, 1500);
    },
    [activeFile, activeTabId, updateFileContent, markTabClean],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = () => {
          importFile(file.name, reader.result as string);
        };
        reader.readAsText(file);
      }
    },
    [importFile],
  );

  if (!activeFile) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center text-txt-muted bg-bg-primary"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <FileCode2 size={64} className="mb-4 opacity-30" />
        <p className="text-lg mb-1">No file open</p>
        <p className="text-sm">Open a file from the sidebar or drop files here</p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-hidden"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <Editor
        key={activeFile.id}
        height="100%"
        language={language}
        theme={theme}
        value={activeFile.content ?? ''}
        onChange={handleChange}
        onMount={handleMount}
        options={{
          fontSize: settings.fontSize,
          fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
          fontLigatures: true,
          minimap: { enabled: settings.minimap },
          wordWrap: settings.wordWrap ? 'on' : 'off',
          lineNumbers: 'on',
          bracketPairColorization: { enabled: true },
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          folding: true,
          foldingStrategy: 'indentation',
          renderLineHighlight: 'all',
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          padding: { top: 8 },
          automaticLayout: true,
        }}
      />
    </div>
  );
};
