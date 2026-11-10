import React, { useRef } from 'react';
import { GameState, GameDifficulty } from '../types/game';
import { gameStore } from '../store/gameStore';
import { X, Sliders, Download, Upload, RotateCcw, Smartphone } from 'lucide-react';

interface SettingsModalProps {
  state: GameState;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ state, onClose }) => {
  const { settings } = state;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDifficultyChange = (diff: GameDifficulty) => {
    gameStore.setDifficulty(diff);
  };

  const handleExport = () => {
    const json = gameStore.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `justfishing_save_day${state.time.day}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = gameStore.importJSON(content);
        if (ok) {
          alert('Save data loaded successfully!');
          onClose();
        } else {
          alert('Invalid save file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#0d1322] border-2 border-slate-700/80 rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-700/60 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-pixel text-sm text-white tracking-wide">SETTINGS</h2>
              <div className="text-[10px] text-slate-400 font-pixel">Configuration & Local Saves</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Difficulty Selector */}
        <div className="mb-5">
          <label className="block text-xs font-pixel text-slate-300 mb-2">
            FISHING DIFFICULTY
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'normal', 'hard'] as GameDifficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => handleDifficultyChange(d)}
                className={`py-2.5 px-3 rounded-xl font-pixel text-[10px] uppercase transition-all ${
                  settings.difficulty === d
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-sans">
            {settings.difficulty === 'easy' && '★ Easy: 150% catch bar, relaxed fish swimming speed.'}
            {settings.difficulty === 'normal' && '★★ Normal: Balanced authentic Stardew-style tension.'}
            {settings.difficulty === 'hard' && '★★★ Hard: Tight bar, erratic bursts, rapid line snap!'}
          </p>
        </div>

        {/* 2. Screen Shake & Fullscreen Toggles */}
        <div className="space-y-3 mb-5 py-3 border-y border-slate-800">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-pixel text-xs text-white">SCREEN SHAKE</div>
              <div className="text-[10px] text-slate-400">Impact vibration on hook strike</div>
            </div>
            <button
              onClick={() => gameStore.toggleScreenShake()}
              className={`px-3 py-1.5 rounded-lg font-pixel text-[10px] transition-colors ${
                settings.screenShake ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.screenShake ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="font-pixel text-xs text-white">DISPLAY MODE</div>
              <div className="text-[10px] text-slate-400">Toggle browser full-screen</div>
            </div>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-pixel text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>FULLSCREEN</span>
            </button>
          </div>
        </div>

        {/* 3. Pure Client-Side Save Export / Import */}
        <div className="space-y-2 mb-5">
          <label className="block text-xs font-pixel text-slate-300">
            OFFLINE SAVE FILE
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-1.5 bg-sky-700 hover:bg-sky-600 text-white py-2.5 rounded-xl font-pixel text-[10px] transition-transform active:scale-95 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT JSON</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-2.5 rounded-xl font-pixel text-[10px] transition-transform active:scale-95 shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>IMPORT JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>

        {/* 4. Reset Game */}
        <button
          onClick={() => {
            if (confirm('Reset all progress and start fresh?')) {
              gameStore.resetGame();
              onClose();
            }
          }}
          className="flex items-center justify-center gap-1.5 text-red-400 hover:text-red-300 text-[10px] font-pixel pt-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET GAME PROGRESS</span>
        </button>
      </div>
    </div>
  );
};
