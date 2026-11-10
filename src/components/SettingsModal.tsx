import React, { useRef } from 'react';
import { GameState, GameDifficulty } from '../types/game';
import { gameStore } from '../store/gameStore';
import { X, Sliders, Download, Upload, RotateCcw } from 'lucide-react';

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
          alert('Save data successfully loaded!');
          onClose();
        } else {
          alert('Invalid save file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-haven-dark border-4 border-haven-border rounded-lg shadow-pixel-lg max-w-md w-full p-5 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b-2 border-haven-border mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-haven-gold" />
            <h2 className="font-pixel text-sm text-haven-gold">GAME SETTINGS</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-haven-border rounded text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Difficulty Selector */}
        <div className="mb-4">
          <label className="block text-xs font-pixel text-slate-300 mb-2">
            FISHING DIFFICULTY
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'normal', 'hard'] as GameDifficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => handleDifficultyChange(d)}
                className={`py-2 px-3 rounded font-pixel text-[10px] uppercase pixel-btn ${
                  settings.difficulty === d
                    ? 'bg-haven-gold text-haven-dark font-bold'
                    : 'bg-haven-panel text-slate-300 hover:bg-haven-border'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">
            {settings.difficulty === 'easy' && '★ Easy: 150% catch bar, relaxed fish movement.'}
            {settings.difficulty === 'normal' && '★★ Normal: Balanced authentic Stardew-style tension.'}
            {settings.difficulty === 'hard' && '★★★ Hard: Tight bar, erratic fish bursts, fast line snap!'}
          </p>
        </div>

        {/* 2. Screen Shake Toggle */}
        <div className="mb-5 flex justify-between items-center py-2 border-y border-slate-700/60">
          <div>
            <div className="font-pixel text-xs text-white">SCREEN SHAKE</div>
            <div className="text-[10px] text-slate-400">Vibration on strike & heavy line tension</div>
          </div>
          <button
            onClick={() => gameStore.toggleScreenShake()}
            className={`px-3 py-1.5 rounded font-pixel text-[10px] uppercase pixel-btn ${
              settings.screenShake ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
            }`}
          >
            {settings.screenShake ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        {/* 3. Pure Client-Side Save Export / Import */}
        <div className="space-y-2 mb-4">
          <label className="block text-xs font-pixel text-slate-300">
            SAVE FILE DATA (CLIENT-SIDE)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-1.5 bg-sky-700 hover:bg-sky-600 text-white py-2 rounded font-pixel text-[10px] pixel-btn"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT JSON</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 bg-haven-panel hover:bg-haven-border text-white py-2 rounded font-pixel text-[10px] pixel-btn"
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
            if (confirm('Are you sure you want to reset all progress?')) {
              gameStore.resetGame();
              onClose();
            }
          }}
          className="flex items-center justify-center gap-1.5 text-red-400 hover:text-red-300 text-[10px] font-pixel pt-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET TO NEW GAME</span>
        </button>
      </div>
    </div>
  );
};
