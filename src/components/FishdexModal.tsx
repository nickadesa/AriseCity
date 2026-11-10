import React, { useEffect, useRef } from 'react';
import { GameState, FishDefinition } from '../types/game';
import { INITIAL_FISH_CATALOG } from '../data/fishCatalog';
import { PixelRenderer } from '../engine/PixelRenderer';
import { X, Award, HelpCircle, Trophy, Compass } from 'lucide-react';

interface FishdexModalProps {
  state: GameState;
  onClose: () => void;
}

export const FishdexModal: React.FC<FishdexModalProps> = ({ state, onClose }) => {
  const { fishdexCaughtIds, fishRecords } = state;

  return (
    <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#0d1322] border-2 border-slate-700/80 rounded-2xl shadow-2xl max-w-2xl w-full h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900/80 border-b border-slate-700/60 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-pixel text-sm text-white tracking-wide">
                FISHDEX ENCYCLOPEDIA
              </h2>
              <div className="text-[11px] text-slate-400">
                Discovered: <span className="text-amber-400 font-pixel">{fishdexCaughtIds.length}</span> of {INITIAL_FISH_CATALOG.length} species
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fish Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {INITIAL_FISH_CATALOG.map((fish) => {
            const isCaught = fishdexCaughtIds.includes(fish.id);
            const record = fishRecords[fish.id];

            return (
              <FishCard
                key={fish.id}
                fish={fish}
                isCaught={isCaught}
                record={record}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FishCard: React.FC<{
  fish: FishDefinition;
  isCaught: boolean;
  record?: { maxWeight: number; maxLength: number; count: number };
}> = ({ fish, isCaught, record }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isCaught || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sprite = PixelRenderer.getFishSprite(fish);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite, 0, 0, canvas.width, canvas.height);
  }, [fish, isCaught]);

  const getRarityBadge = (r: string) => {
    switch (r) {
      case 'mythic': return 'bg-purple-900/60 text-purple-200 border-purple-500/50';
      case 'legendary': return 'bg-amber-900/60 text-amber-200 border-amber-500/50';
      case 'epic': return 'bg-pink-900/60 text-pink-200 border-pink-500/50';
      case 'rare': return 'bg-sky-900/60 text-sky-200 border-sky-500/50';
      case 'uncommon': return 'bg-emerald-900/60 text-emerald-200 border-emerald-500/50';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div
      className={`border rounded-xl p-3.5 flex gap-3.5 transition-all ${
        isCaught
          ? 'bg-slate-900/70 border-slate-700/80 shadow-md hover:border-slate-600'
          : 'bg-slate-950/40 border-slate-850 opacity-50'
      }`}
    >
      {/* Sprite Preview Box */}
      <div className="w-16 h-16 bg-[#070e1b] border border-slate-700/60 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
        {isCaught ? (
          <canvas ref={canvasRef} width={44} height={44} className="drop-shadow-md" />
        ) : (
          <HelpCircle className="w-6 h-6 text-slate-700" />
        )}
      </div>

      {/* Info details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-1">
            <h4 className="font-pixel text-xs text-white truncate">
              {isCaught ? fish.name : '??? Undiscovered'}
            </h4>
            <span className={`text-[8px] font-pixel capitalize px-2 py-0.5 rounded-full border shrink-0 ${getRarityBadge(fish.rarity)}`}>
              {fish.rarity}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
            <Compass className="w-3 h-3 text-slate-500" />
            <span className="truncate">{fish.biome}</span>
          </div>

          <p className="text-[11px] text-slate-400/90 mt-1.5 line-clamp-2 italic">
            {isCaught ? `"${fish.description}"` : 'Cast your line into suitable waters to identify this species.'}
          </p>
        </div>

        {isCaught && record && (
          <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] font-pixel text-amber-400">
            <span>Catches: {record.count}</span>
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Record: {record.maxWeight.toFixed(1)} kg
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
