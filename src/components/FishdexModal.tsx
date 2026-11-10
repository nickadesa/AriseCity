import React, { useEffect, useRef } from 'react';
import { GameState, FishDefinition } from '../types/game';
import { INITIAL_FISH_CATALOG } from '../data/fishCatalog';
import { PixelRenderer } from '../engine/PixelRenderer';
import { X, Award, HelpCircle } from 'lucide-react';

interface FishdexModalProps {
  state: GameState;
  onClose: () => void;
}

export const FishdexModal: React.FC<FishdexModalProps> = ({ state, onClose }) => {
  const { fishdexCaughtIds, fishRecords } = state;

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-haven-dark border-4 border-haven-border rounded-lg shadow-pixel-lg max-w-2xl w-full h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-haven-panel border-b-2 border-haven-border flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-haven-gold" />
            <h2 className="font-pixel text-sm text-haven-gold tracking-wide">
              FISHDEX ENCYCLOPEDIA ({fishdexCaughtIds.length}/{INITIAL_FISH_CATALOG.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-haven-border rounded text-slate-300"
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
    const sprite = fish.spriteResolution === '64x64'
      ? PixelRenderer.getLargeBoss48x64(fish)
      : PixelRenderer.getFish32x32(fish);
    
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite, 0, 0, canvas.width, canvas.height);
  }, [fish, isCaught]);

  return (
    <div
      className={`border-2 rounded-lg p-3 flex gap-3 ${
        isCaught
          ? 'bg-haven-panel/80 border-haven-border shadow-pixel'
          : 'bg-slate-900/40 border-slate-800 opacity-60'
      }`}
    >
      {/* 32x32 / 64x64 Sprite Box */}
      <div className="w-16 h-16 bg-ocean-900 border-2 border-haven-border rounded flex items-center justify-center shrink-0 overflow-hidden">
        {isCaught ? (
          <canvas ref={canvasRef} width={48} height={48} className="drop-shadow" />
        ) : (
          <HelpCircle className="w-6 h-6 text-slate-600" />
        )}
      </div>

      {/* Info details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-pixel text-xs text-white truncate">
            {isCaught ? fish.name : '??? Unknown Fish'}
          </h4>
          <span className="text-[9px] font-pixel capitalize px-1.5 py-0.5 rounded bg-ocean-800 text-sky-300">
            {fish.rarity}
          </span>
        </div>

        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
          {isCaught ? fish.description : 'Explore new waters and cast your line to discover this species.'}
        </p>

        {isCaught && record && (
          <div className="mt-2 pt-1 border-t border-slate-700/50 flex justify-between text-[9px] text-haven-gold font-pixel">
            <span>Caught: {record.count}</span>
            <span>Record: {record.maxWeight.toFixed(1)} kg</span>
          </div>
        )}
      </div>
    </div>
  );
};
