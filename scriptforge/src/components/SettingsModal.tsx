import React from 'react';
import { useStore } from '../store/useStore';
import { X, Sun, Moon, Map, WrapText, Type } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const open = useStore((s) => s.settingsModalOpen);
  const toggle = useStore((s) => s.toggleSettingsModal);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const toggleTheme = useStore((s) => s.toggleTheme);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={toggle}>
      <div
        className="glass border border-bdr rounded-xl shadow-2xl w-[440px] glow-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-bdr">
          <h2 className="text-lg font-semibold text-txt-primary">Settings</h2>
          <button className="p-1 rounded hover:bg-bg-hover text-txt-muted" onClick={toggle}>
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="px-5 py-4 space-y-5">
          {/* theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.theme === 'dark' ? <Moon size={18} className="text-accent-blue" /> : <Sun size={18} className="text-yellow-400" />}
              <div>
                <p className="text-sm text-txt-primary font-medium">Theme</p>
                <p className="text-xs text-txt-muted">{settings.theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
              </div>
            </div>
            <button
              className="relative w-12 h-6 rounded-full bg-bg-tertiary border border-bdr transition-colors"
              onClick={toggleTheme}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-accent-blue transition-all duration-200"
                style={{ left: settings.theme === 'dark' ? 2 : 22 }}
              />
            </button>
          </div>

          {/* font size */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Type size={18} className="text-accent-blue" />
              <div>
                <p className="text-sm text-txt-primary font-medium">Font Size</p>
                <p className="text-xs text-txt-muted">{settings.fontSize}px</p>
              </div>
            </div>
            <input
              type="range"
              min={10}
              max={24}
              value={settings.fontSize}
              onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
              className="w-full accent-accent-blue"
            />
            <div className="flex justify-between text-[10px] text-txt-muted">
              <span>10px</span>
              <span>24px</span>
            </div>
          </div>

          {/* minimap */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Map size={18} className="text-accent-blue" />
              <div>
                <p className="text-sm text-txt-primary font-medium">Minimap</p>
                <p className="text-xs text-txt-muted">Show code overview on the right</p>
              </div>
            </div>
            <button
              className="relative w-12 h-6 rounded-full bg-bg-tertiary border border-bdr transition-colors"
              onClick={() => updateSettings({ minimap: !settings.minimap })}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-accent-blue transition-all duration-200"
                style={{ left: settings.minimap ? 22 : 2 }}
              />
            </button>
          </div>

          {/* word wrap */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <WrapText size={18} className="text-accent-blue" />
              <div>
                <p className="text-sm text-txt-primary font-medium">Word Wrap</p>
                <p className="text-xs text-txt-muted">Wrap long lines</p>
              </div>
            </div>
            <button
              className="relative w-12 h-6 rounded-full bg-bg-tertiary border border-bdr transition-colors"
              onClick={() => updateSettings({ wordWrap: !settings.wordWrap })}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-accent-blue transition-all duration-200"
                style={{ left: settings.wordWrap ? 22 : 2 }}
              />
            </button>
          </div>
        </div>

        {/* footer */}
        <div className="px-5 py-3 border-t border-bdr flex justify-end">
          <button
            className="px-4 py-1.5 bg-accent-blue text-white rounded-md text-sm hover:bg-accent-hover transition-colors"
            onClick={toggle}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
