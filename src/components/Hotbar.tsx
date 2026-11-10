import React from 'react';
import { GameState } from '../types/game';
import { BookOpen, Backpack, Radio, Shield, Fish, Bug } from 'lucide-react';

interface HotbarProps {
  state: GameState;
  onOpenInventory: () => void;
  onOpenFishdex: () => void;
}

export const Hotbar: React.FC<HotbarProps> = ({ state, onOpenInventory, onOpenFishdex }) => {
  const { inventory } = state;
  const fishCount = inventory.filter((i) => i.type === 'fish').length;

  return (
    <footer className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 select-none">
      {/* Equipped Rod & Bait Slots */}
      <div className="flex gap-2 bg-[#0d1322]/90 backdrop-blur-md border border-slate-700/70 p-2 rounded-2xl shadow-2xl">
        {/* Rod Slot */}
        <div className="relative w-12 h-12 bg-slate-900/80 border border-amber-500/50 rounded-xl flex flex-col items-center justify-center text-amber-300 shadow-inner group cursor-pointer hover:border-amber-400">
          <Fish className="w-5 h-5 text-amber-400" />
          <span className="text-[7px] font-pixel text-slate-400 uppercase mt-0.5">Bamboo</span>
          <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 font-pixel text-[8px] px-1 rounded-full font-bold">
            T1
          </span>
        </div>

        {/* Bait Slot */}
        <div className="relative w-12 h-12 bg-slate-900/80 border border-sky-500/50 rounded-xl flex flex-col items-center justify-center text-sky-300 shadow-inner group cursor-pointer hover:border-sky-400">
          <Bug className="w-5 h-5 text-sky-400" />
          <span className="text-[7px] font-pixel text-slate-400 uppercase mt-0.5">Worm</span>
          <span className="absolute -top-1.5 -right-1.5 bg-sky-500 text-slate-950 font-pixel text-[8px] px-1 rounded-full font-bold">
            15
          </span>
        </div>
      </div>

      {/* Active Skill Slots */}
      <div className="flex gap-2 bg-[#0d1322]/90 backdrop-blur-md border border-slate-700/70 p-2 rounded-2xl shadow-2xl">
        <button
          className="relative w-12 h-12 bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/40 rounded-xl flex flex-col items-center justify-center text-sky-200 transition-all active:scale-95 group"
          title="Active Skill 1: Sonar Pulse (Press 1)"
        >
          <Radio className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-pixel text-slate-400 mt-0.5">Sonar</span>
          <span className="absolute top-1 right-1.5 text-[8px] font-pixel text-slate-500">1</span>
        </button>

        <button
          className="relative w-12 h-12 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-600 cursor-not-allowed"
          title="Slot 2 (Unlocks at Mastery Level 5)"
        >
          <Shield className="w-4 h-4 opacity-30" />
          <span className="text-[8px] font-pixel opacity-30 mt-0.5">Locked</span>
          <span className="absolute top-1 right-1.5 text-[8px] font-pixel text-slate-700">2</span>
        </button>
      </div>

      {/* Modals Navigation: Bag & Fishdex */}
      <div className="flex gap-2 bg-[#0d1322]/90 backdrop-blur-md border border-slate-700/70 p-2 rounded-2xl shadow-2xl">
        <button
          onClick={onOpenInventory}
          className="flex items-center gap-2.5 px-4 h-12 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/60 rounded-xl text-white font-pixel text-xs transition-all active:scale-95"
        >
          <Backpack className="w-4 h-4 text-amber-400" />
          <span>BAG</span>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] px-1.5 py-0.5 rounded-full">
            {fishCount}
          </span>
        </button>

        <button
          onClick={onOpenFishdex}
          className="flex items-center gap-2 px-4 h-12 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/60 rounded-xl text-white font-pixel text-xs transition-all active:scale-95"
        >
          <BookOpen className="w-4 h-4 text-sky-400" />
          <span>FISHDEX</span>
        </button>
      </div>
    </footer>
  );
};
