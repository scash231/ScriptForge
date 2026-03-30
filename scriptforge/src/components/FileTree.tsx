import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { FileNode } from '../types';
import {
  Folder, FolderOpen, FileText, ChevronRight, ChevronDown,
  FilePlus, FolderPlus, Trash2, Pencil, Check, X,
} from 'lucide-react';

interface TreeNodeProps {
  node: FileNode;
  depth: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, depth }) => {
  const [expanded, setExpanded] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [creating, setCreating] = useState<'file' | 'folder' | null>(null);
  const [newName, setNewName] = useState(node.name);
  const [createName, setCreateName] = useState('');
  const [showCtx, setShowCtx] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const createRef = useRef<HTMLInputElement>(null);

  const openFile = useStore((s) => s.openFile);
  const deleteFile = useStore((s) => s.deleteFile);
  const renameFile = useStore((s) => s.renameFile);
  const createFile = useStore((s) => s.createFile);
  const activeTabId = useStore((s) => s.activeTabId);
  const openTabs = useStore((s) => s.openTabs);

  const isActiveFile =
    node.type === 'file' && openTabs.find((t) => t.id === activeTabId)?.fileId === node.id;

  useEffect(() => {
    if (renaming && inputRef.current) inputRef.current.focus();
  }, [renaming]);

  useEffect(() => {
    if (creating && createRef.current) createRef.current.focus();
  }, [creating]);

  const commitRename = () => {
    if (newName.trim() && newName !== node.name) renameFile(node.id, newName.trim());
    setRenaming(false);
  };

  const commitCreate = () => {
    if (createName.trim() && creating) {
      createFile(node.id, createName.trim(), creating);
    }
    setCreating(null);
    setCreateName('');
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowCtx(true);
    const close = () => {
      setShowCtx(false);
      document.removeEventListener('click', close);
    };
    document.addEventListener('click', close);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-0.5 cursor-pointer select-none group text-sm transition-colors ${
          isActiveFile ? 'bg-accent-blue/15 text-accent-blue' : 'hover:bg-bg-hover text-txt-secondary hover:text-txt-primary'
        }`}
        style={{ paddingLeft: depth * 16 + 8 }}
        onClick={() => {
          if (node.type === 'folder') setExpanded(!expanded);
          else openFile(node.id);
        }}
        onContextMenu={handleContextMenu}
      >
        {node.type === 'folder' ? (
          <>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {expanded ? (
              <FolderOpen size={14} className="text-yellow-400 flex-shrink-0" />
            ) : (
              <Folder size={14} className="text-yellow-400 flex-shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5" />
            <FileText size={14} className="text-accent-blue flex-shrink-0" />
          </>
        )}

        {renaming ? (
          <form
            className="flex items-center gap-1 flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              commitRename();
            }}
          >
            <input
              ref={inputRef}
              className="bg-bg-tertiary text-txt-primary text-sm px-1 rounded flex-1 border border-accent-blue"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setRenaming(false);
                  setNewName(node.name);
                }
              }}
            />
          </form>
        ) : (
          <span className="truncate text-[13px]">{node.name}</span>
        )}

        {!renaming && node.type === 'folder' && (
          <span className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-0.5 rounded hover:bg-bg-tertiary"
              title="New File"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(true);
                setCreating('file');
              }}
            >
              <FilePlus size={13} />
            </button>
            <button
              className="p-0.5 rounded hover:bg-bg-tertiary"
              title="New Folder"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(true);
                setCreating('folder');
              }}
            >
              <FolderPlus size={13} />
            </button>
          </span>
        )}
      </div>

      {/* context menu */}
      {showCtx && (
        <div className="absolute z-50 glass border border-bdr rounded-md shadow-xl py-1 text-sm min-w-[140px]" style={{ marginLeft: depth * 16 + 24 }}>
          <button
            className="w-full text-left px-3 py-1 hover:bg-bg-hover flex items-center gap-2 text-txt-secondary"
            onClick={() => {
              setRenaming(true);
              setNewName(node.name);
            }}
          >
            <Pencil size={13} /> Rename
          </button>
          <button
            className="w-full text-left px-3 py-1 hover:bg-bg-hover flex items-center gap-2 text-red-400"
            onClick={() => deleteFile(node.id)}
          >
            <Trash2 size={13} /> Delete
          </button>
          {node.type === 'folder' && (
            <>
              <div className="border-t border-bdr my-1" />
              <button
                className="w-full text-left px-3 py-1 hover:bg-bg-hover flex items-center gap-2 text-txt-secondary"
                onClick={() => {
                  setExpanded(true);
                  setCreating('file');
                }}
              >
                <FilePlus size={13} /> New File
              </button>
              <button
                className="w-full text-left px-3 py-1 hover:bg-bg-hover flex items-center gap-2 text-txt-secondary"
                onClick={() => {
                  setExpanded(true);
                  setCreating('folder');
                }}
              >
                <FolderPlus size={13} /> New Folder
              </button>
            </>
          )}
        </div>
      )}

      {/* children */}
      {node.type === 'folder' && expanded && (
        <div className="overflow-hidden">
            {creating && (
              <div className="flex items-center gap-1 px-2 py-0.5" style={{ paddingLeft: (depth + 1) * 16 + 8 }}>
                {creating === 'folder' ? <Folder size={14} className="text-yellow-400" /> : <FileText size={14} className="text-accent-blue" />}
                <form
                  className="flex-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    commitCreate();
                  }}
                >
                  <input
                    ref={createRef}
                    className="bg-bg-tertiary text-txt-primary text-sm px-1 rounded w-full border border-accent-blue"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder={creating === 'folder' ? 'folder name' : 'filename.ext'}
                    onBlur={commitCreate}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setCreating(null);
                        setCreateName('');
                      }
                    }}
                  />
                </form>
              </div>
            )}
            {node.children
              ?.slice()
              .sort((a, b) => {
                if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
                return a.name.localeCompare(b.name);
              })
              .map((child) => (
                <TreeNode key={child.id} node={child} depth={depth + 1} />
              ))}
            </div>
          )}
    </div>
  );
};

export const FileTree: React.FC = () => {
  const files = useStore((s) => s.files);
  return (
    <div className="py-1 overflow-y-auto flex-1">
      {files.map((node) => (
        <TreeNode key={node.id} node={node} depth={0} />
      ))}
    </div>
  );
};
