import React from 'react';
import { GameState } from '../types/game';
import { BookOpen, Backpack, Radio, Shield } from 'lucide-react';

interface HotbarProps {
  state: GameState;
  onOpenInventory: () => void;
  onOpenFishdex: () => void;
}

export const Hotbar: React.FC<HotbarProps> = ({ state, onOpenInventory, onOpenFishdex }) => {
  const { inventory } = state;
  const fishCount = inventory.filter((i) => i.type === 'fish').length;

  return (
    <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 select-none">
      {/* Equipped Rod & Bait Slots */}
      <div className="flex gap-2 bg-haven-dark/95 border-2 border-haven-border p-2 rounded-lg shadow-pixel">
        <div className="w-12 h-12 bg-haven-panel border border-haven-gold/50 rounded flex flex-col items-center justify-center text-[10px] font-pixel text-haven-gold">
          <span>🎣</span>
          <span className="text-[8px] text-slate-300">ROD</span>
        </div>
        <div className="w-12 h-12 bg-haven-panel border border-sky-400/50 rounded flex flex-col items-center justify-center text-[10px] font-pixel text-sky-300">
          <span>🪱</span>
          <span className="text-[8px] text-slate-300">BAIT</span>
        </div>
      </div>

      {/* Active Skill Slots */}
      <div className="flex gap-2 bg-haven-dark/95 border-2 border-haven-border p-2 rounded-lg shadow-pixel">
        <button
          className="w-12 h-12 bg-ocean-800 hover:bg-ocean-700 border border-ocean-500 rounded flex flex-col items-center justify-center text-sky-200 pixel-btn"
          title="Active Skill 1: Sonar Pulse (Key 1)"
        >
          <Radio className="w-5 h-5 text-sky-400" />
          <span className="text-[8px] font-pixel text-slate-400">1</span>
        </button>
        <button
          className="w-12 h-12 bg-ocean-800/50 border border-slate-700 rounded flex flex-col items-center justify-center text-slate-500 cursor-not-allowed"
          title="Slot 2 (Unlocks at Level 5)"
        >
          <Shield className="w-4 h-4 opacity-40" />
          <span className="text-[8px] font-pixel opacity-40">2</span>
        </button>
      </div>

      {/* Modals Quick Access: Inventory & Fishdex */}
      <div className="flex gap-2 bg-haven-dark/95 border-2 border-haven-border p-2 rounded-lg shadow-pixel">
        <button
          onClick={onOpenInventory}
          className="flex items-center gap-2 px-3 h-12 bg-haven-panel hover:bg-haven-border border border-haven-border rounded text-white font-pixel text-xs pixel-btn"
        >
          <Backpack className="w-5 h-5 text-amber-400" />
          <span>BAG ({fishCount})</span>
        </button>
        <button
          onClick={onOpenFishdex}
          className="flex items-center gap-2 px-3 h-12 bg-haven-panel hover:bg-haven-border border border-haven-border rounded text-white font-pixel text-xs pixel-btn"
        >
          <BookOpen className="w-5 h-5 text-sky-400" />
          <span>FISHDEX</span>
        </button>
      </div>
    </footer>
  );
};
