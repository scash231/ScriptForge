import React, { useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { Trash2, Copy, Terminal } from 'lucide-react';

export const TerminalPanel: React.FC = () => {
  const terminalLines = useStore((s) => s.terminalLines);
  const clearTerminal = useStore((s) => s.clearTerminal);
  const addTerminalLine = useStore((s) => s.addTerminalLine);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const copyOutput = useCallback(() => {
    const text = terminalLines.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(text);
    addTerminalLine('Output copied to clipboard.', 'info');
  }, [terminalLines, addTerminalLine]);

  const handleInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = (e.target as HTMLInputElement).value.trim();
      if (!val) return;
      addTerminalLine(`$ ${val}`, 'stdout');

      if (val === 'clear') {
        clearTerminal();
      } else if (val === 'help') {
        addTerminalLine('Available commands: clear, help, echo <text>, date', 'info');
      } else if (val.startsWith('echo ')) {
        addTerminalLine(val.slice(5), 'stdout');
      } else if (val === 'date') {
        addTerminalLine(new Date().toString(), 'stdout');
      } else {
        addTerminalLine(`Command not found: ${val.split(' ')[0]}`, 'stderr');
      }

      (e.target as HTMLInputElement).value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* toolbar */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-bdr flex-shrink-0">
        <div className="flex items-center gap-2 text-xs text-txt-muted">
          <Terminal size={13} className="text-accent-blue" />
          <span className="font-medium">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-1 rounded hover:bg-bg-hover text-txt-muted hover:text-txt-primary transition-colors"
            onClick={copyOutput}
            title="Copy output"
          >
            <Copy size={13} />
          </button>
          <button
            className="p-1 rounded hover:bg-bg-hover text-txt-muted hover:text-txt-primary transition-colors"
            onClick={clearTerminal}
            title="Clear terminal"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* output */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-1 font-mono text-xs leading-5">
        {terminalLines.map((line) => (
          <div
            key={line.id}
            className={
              line.type === 'stderr'
                ? 'text-red-400'
                : line.type === 'info'
                ? 'text-accent-blue'
                : 'text-txt-primary'
            }
          >
            {line.text}
          </div>
        ))}
      </div>

      {/* input */}
      <div className="flex items-center px-3 py-1 border-t border-bdr flex-shrink-0 gap-2">
        <span className="text-accent-blue text-xs font-mono">$</span>
        <input
          ref={inputRef}
          className="flex-1 bg-transparent text-txt-primary text-xs font-mono border-none outline-none"
          placeholder="Type a command..."
          onKeyDown={handleInput}
        />
      </div>
    </div>
  );
};
