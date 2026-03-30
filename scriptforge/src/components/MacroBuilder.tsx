import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { exportMacroAsPython, exportMacroAsJS } from '../utils/macroExporter';
import type { MacroActionType } from '../types';
import { MacroActionLabels, MacroActionDefaults } from '../types';
import {
  Plus, Trash2, ChevronDown, ChevronRight, ArrowUp, ArrowDown,
  Play, Download, Circle, Square, MousePointer, Type, Clock,
  Globe, Terminal, GitBranch, Repeat, Keyboard, Zap,
} from 'lucide-react';

const actionIcons: Record<MacroActionType, React.ReactNode> = {
  click: <MousePointer size={14} />,
  type: <Type size={14} />,
  wait: <Clock size={14} />,
  openUrl: <Globe size={14} />,
  runScript: <Terminal size={14} />,
  ifElse: <GitBranch size={14} />,
  loop: <Repeat size={14} />,
  keystroke: <Keyboard size={14} />,
};

const allActionTypes = Object.keys(MacroActionLabels) as MacroActionType[];

export const MacroBuilder: React.FC = () => {
  const macros = useStore((s) => s.macros);
  const activeMacroId = useStore((s) => s.activeMacroId);
  const isRecording = useStore((s) => s.isRecording);
  const {
    createMacro, deleteMacro, setActiveMacro,
    addMacroAction, removeMacroAction, updateMacroAction,
    toggleMacroActionCollapse, moveMacroAction, setMacroShortcut,
    toggleRecording, importFile,
  } = useStore();

  const [newMacroName, setNewMacroName] = useState('');
  const [showAddAction, setShowAddAction] = useState(false);
  const [exportLang, setExportLang] = useState<'python' | 'js'>('python');

  const activeMacro = macros.find((m) => m.id === activeMacroId);

  const handleCreate = () => {
    const name = newMacroName.trim() || `Macro ${macros.length + 1}`;
    createMacro(name);
    setNewMacroName('');
  };

  const handleExport = () => {
    if (!activeMacro) return;
    const code = exportLang === 'python'
      ? exportMacroAsPython(activeMacro)
      : exportMacroAsJS(activeMacro);
    const ext = exportLang === 'python' ? '.py' : '.js';
    importFile(`${activeMacro.name.replace(/\s+/g, '_')}${ext}`, code);
  };

  return (
    <div className="flex flex-col h-full text-sm">
      {/* macro list */}
      <div className="p-2 border-b border-bdr">
        <div className="flex gap-1 mb-2">
          <input
            className="flex-1 bg-bg-tertiary text-txt-primary px-2 py-1 rounded border border-bdr text-xs"
            placeholder="New macro name..."
            value={newMacroName}
            onChange={(e) => setNewMacroName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button
            className="px-2 py-1 bg-accent-blue text-white rounded text-xs hover:bg-accent-hover transition-colors"
            onClick={handleCreate}
          >
            <Plus size={14} />
          </button>
        </div>

        {/* record button */}
        <button
          className={`w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
            isRecording
              ? 'bg-red-500/20 text-red-400 border border-red-500/50'
              : 'bg-bg-tertiary text-txt-secondary hover:bg-bg-hover border border-bdr'
          }`}
          onClick={toggleRecording}
        >
          {isRecording ? <Square size={12} /> : <Circle size={12} className="text-red-400" />}
          {isRecording ? 'Stop Recording' : 'Record Macro'}
        </button>

        {isRecording && activeMacro && (
          <p className="text-[11px] text-yellow-400 mt-1 text-center">
            Recording to "{activeMacro.name}" — click actions below to add steps
          </p>
        )}
      </div>

      {/* macro tabs */}
      <div className="flex overflow-x-auto border-b border-bdr flex-shrink-0">
        {macros.map((m) => (
          <button
            key={m.id}
            className={`px-3 py-1.5 text-xs whitespace-nowrap border-r border-bdr transition-colors ${
              m.id === activeMacroId
                ? 'bg-bg-secondary text-accent-blue'
                : 'text-txt-muted hover:bg-bg-hover hover:text-txt-secondary'
            }`}
            onClick={() => setActiveMacro(m.id)}
          >
            <Zap size={10} className="inline mr-1" />
            {m.name}
          </button>
        ))}
      </div>

      {/* active macro detail */}
      {activeMacro ? (
        <div className="flex-1 overflow-y-auto">
          {/* shortcut */}
          <div className="p-2 border-b border-bdr">
            <label className="text-[11px] text-txt-muted block mb-1">Keyboard Shortcut</label>
            <input
              className="w-full bg-bg-tertiary text-txt-primary px-2 py-1 rounded border border-bdr text-xs"
              placeholder="e.g. Ctrl+Shift+1"
              value={activeMacro.shortcut}
              onChange={(e) => setMacroShortcut(activeMacro.id, e.target.value)}
            />
          </div>

          {/* actions */}
          <div className="p-2">
              {activeMacro.actions.map((action, idx) => (
                <div
                  key={action.id}
                  className="mb-2 border border-bdr rounded-md overflow-hidden bg-bg-tertiary/50"
                >
                  {/* header */}
                  <div className="flex items-center gap-2 px-2 py-1.5 bg-bg-tertiary">
                    <button onClick={() => toggleMacroActionCollapse(activeMacro.id, action.id)}>
                      {action.collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    </button>
                    <span className="text-accent-blue">{actionIcons[action.type]}</span>
                    <span className="flex-1 text-xs text-txt-primary font-medium">
                      {MacroActionLabels[action.type]}
                    </span>
                    <button
                      className="p-0.5 hover:bg-bg-hover rounded disabled:opacity-30"
                      disabled={idx === 0}
                      onClick={() => moveMacroAction(activeMacro.id, action.id, -1)}
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      className="p-0.5 hover:bg-bg-hover rounded disabled:opacity-30"
                      disabled={idx === activeMacro.actions.length - 1}
                      onClick={() => moveMacroAction(activeMacro.id, action.id, 1)}
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      className="p-0.5 hover:bg-bg-hover rounded text-red-400"
                      onClick={() => removeMacroAction(activeMacro.id, action.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* params */}
                  {!action.collapsed && (
                    <div className="p-2 space-y-1.5">
                      {Object.entries(action.params).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2">
                          <label className="text-[11px] text-txt-muted w-16 flex-shrink-0 capitalize">
                            {key}
                          </label>
                          {val === 'true' || val === 'false' ? (
                            <button
                              className={`px-2 py-0.5 rounded text-[11px] border ${
                                val === 'true'
                                  ? 'bg-accent-blue/20 border-accent-blue text-accent-blue'
                                  : 'bg-bg-tertiary border-bdr text-txt-muted'
                              }`}
                              onClick={() =>
                                updateMacroAction(activeMacro.id, action.id, {
                                  [key]: val === 'true' ? 'false' : 'true',
                                })
                              }
                            >
                              {val === 'true' ? 'ON' : 'OFF'}
                            </button>
                          ) : (
                            <input
                              className="flex-1 bg-bg-primary text-txt-primary px-2 py-0.5 rounded border border-bdr text-xs"
                              value={val}
                              onChange={(e) =>
                                updateMacroAction(activeMacro.id, action.id, {
                                  [key]: e.target.value,
                                })
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

            {/* add action */}
            <div className="relative">
              <button
                className="w-full py-1.5 border border-dashed border-bdr rounded text-xs text-txt-muted hover:text-accent-blue hover:border-accent-blue transition-colors flex items-center justify-center gap-1"
                onClick={() => setShowAddAction(!showAddAction)}
              >
                <Plus size={12} /> Add Action
              </button>
              {showAddAction && (
                <div className="absolute z-20 bottom-full mb-1 left-0 right-0 glass border border-bdr rounded-md shadow-xl py-1 max-h-48 overflow-y-auto">
                  {allActionTypes.map((t) => (
                    <button
                      key={t}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-bg-hover flex items-center gap-2 text-txt-secondary hover:text-txt-primary"
                      onClick={() => {
                        addMacroAction(activeMacro.id, t);
                        setShowAddAction(false);
                      }}
                    >
                      <span className="text-accent-blue">{actionIcons[t]}</span>
                      {MacroActionLabels[t]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* export */}
          {activeMacro.actions.length > 0 && (
            <div className="p-2 border-t border-bdr mt-auto">
              <div className="flex gap-1">
                <select
                  className="bg-bg-tertiary text-txt-primary text-xs px-2 py-1.5 rounded border border-bdr flex-1"
                  value={exportLang}
                  onChange={(e) => setExportLang(e.target.value as 'python' | 'js')}
                >
                  <option value="python">Python</option>
                  <option value="js">JavaScript</option>
                </select>
                <button
                  className="px-3 py-1.5 bg-accent-blue text-white rounded text-xs hover:bg-accent-hover transition-colors flex items-center gap-1"
                  onClick={handleExport}
                >
                  <Download size={12} /> Export
                </button>
              </div>
            </div>
          )}

          {/* delete */}
          <div className="p-2 border-t border-bdr">
            <button
              className="w-full py-1.5 text-xs text-red-400 border border-red-400/30 rounded hover:bg-red-400/10 transition-colors"
              onClick={() => deleteMacro(activeMacro.id)}
            >
              Delete Macro
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-txt-muted text-xs p-4 text-center">
          Create a macro to get started. Macros let you automate sequences of actions.
        </div>
      )}
    </div>
  );
};
