import React from 'react';
import { useStore } from '../store/useStore';
import { VariableInspector } from './VariableInspector';
import { MacroBuilder } from './MacroBuilder';
import { Variable, Zap } from 'lucide-react';

export const RightSidebar: React.FC = () => {
  const view = useStore((s) => s.rightSidebarView);
  const setView = useStore((s) => s.setRightSidebarView);

  return (
    <div className="h-full flex flex-col bg-bg-secondary border-l border-bdr">
      {/* view switcher */}
      <div className="flex border-b border-bdr flex-shrink-0">
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition-colors ${
            view === 'variables'
              ? 'text-accent-blue border-b-2 border-accent-blue'
              : 'text-txt-muted hover:text-txt-secondary'
          }`}
          onClick={() => setView('variables')}
        >
          <Variable size={14} /> Variables
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition-colors ${
            view === 'macros'
              ? 'text-accent-blue border-b-2 border-accent-blue'
              : 'text-txt-muted hover:text-txt-secondary'
          }`}
          onClick={() => setView('macros')}
        >
          <Zap size={14} /> Macros
        </button>
      </div>

      {/* content */}
      <div className="flex-1 overflow-hidden">
        {view === 'variables' ? <VariableInspector /> : <MacroBuilder />}
      </div>
    </div>
  );
};
