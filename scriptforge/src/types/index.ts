export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  parentId: string | null;
}

export interface Tab {
  id: string;
  fileId: string;
  name: string;
  isDirty: boolean;
}

export type MacroActionType =
  | 'click'
  | 'type'
  | 'wait'
  | 'openUrl'
  | 'runScript'
  | 'ifElse'
  | 'loop'
  | 'keystroke';

export interface MacroAction {
  id: string;
  type: MacroActionType;
  params: Record<string, string>;
  collapsed: boolean;
}

export interface Macro {
  id: string;
  name: string;
  shortcut: string;
  actions: MacroAction[];
}

export interface TerminalLine {
  id: string;
  text: string;
  type: 'stdout' | 'stderr' | 'info';
}

export interface Settings {
  theme: 'dark' | 'light';
  fontSize: number;
  wordWrap: boolean;
  minimap: boolean;
}

export interface VariableInfo {
  name: string;
  kind: 'variable' | 'function' | 'class' | 'constant';
  line: number;
  value?: string;
}

export interface SearchResult {
  fileId: string;
  fileName: string;
  line: number;
  text: string;
}

export const MacroActionLabels: Record<MacroActionType, string> = {
  click: 'Click',
  type: 'Type Text',
  wait: 'Wait',
  openUrl: 'Open URL',
  runScript: 'Run Script',
  ifElse: 'If / Else',
  loop: 'Loop',
  keystroke: 'Keystroke',
};

export const MacroActionDefaults: Record<MacroActionType, Record<string, string>> = {
  click: { x: '0', y: '0', button: 'left' },
  type: { text: '', delay: '50' },
  wait: { duration: '1000' },
  openUrl: { url: 'https://' },
  runScript: { path: '' },
  ifElse: { condition: '', thenAction: '', elseAction: '' },
  loop: { count: '5', type: 'for' },
  keystroke: { key: '', ctrl: 'false', alt: 'false', shift: 'false' },
};
