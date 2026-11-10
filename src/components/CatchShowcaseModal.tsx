import React, { useEffect, useRef } from 'react';
import { FishDefinition, CaughtFishInstance } from '../types/game';
import { PixelRenderer } from '../engine/PixelRenderer';
import { Sparkles, Trophy, DollarSign, Scissors, Check } from 'lucide-react';

interface CatchShowcaseModalProps {
  fish: FishDefinition;
  catchInstance: CaughtFishInstance;
  isNewRecord: boolean;
  onKeep: () => void;
  onQuickSell: () => void;
  onQuickSalvage: () => void;
}

export const CatchShowcaseModal: React.FC<CatchShowcaseModalProps> = ({
  fish,
  catchInstance,
  isNewRecord,
  onKeep,
  onQuickSell,
  onQuickSalvage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sprite = PixelRenderer.getFishSprite(fish);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite, 0, 0, canvas.width, canvas.height);
  }, [fish]);

  const getRarityBadgeStyle = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'bg-purple-900/80 text-purple-200 border-purple-500';
      case 'legendary': return 'bg-amber-900/80 text-amber-200 border-amber-500';
      case 'epic': return 'bg-pink-900/80 text-pink-200 border-pink-500';
      case 'rare': return 'bg-sky-900/80 text-sky-200 border-sky-500';
      case 'uncommon': return 'bg-emerald-900/80 text-emerald-200 border-emerald-500';
      default: return 'bg-slate-800 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="relative bg-[#0d1322] border-2 border-amber-500/50 rounded-2xl shadow-2xl p-6 max-w-md w-full flex flex-col items-center overflow-hidden">
        {/* Radial Background Spotlight */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Celebration Title */}
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          <span className="font-pixel text-xs uppercase tracking-widest text-amber-400">
            CATCH SUCCESSFUL!
          </span>
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
        </div>

        <h2 className="font-pixel text-lg text-white tracking-wide text-center mt-1 mb-2">
          {fish.name}
        </h2>

        {/* Badges: Rarity & Record */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-pixel uppercase ${getRarityBadgeStyle(fish.rarity)}`}>
            {fish.rarity}
          </span>
          <span className="text-amber-400 font-pixel text-xs tracking-wider">
            {'★'.repeat(catchInstance.stars)}
          </span>
          {isNewRecord && (
            <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/60 px-2 py-0.5 rounded-full text-[10px] font-pixel animate-pulse">
              <Trophy className="w-3 h-3 text-amber-400" />
              RECORD!
            </span>
          )}
        </div>

        {/* Floating Fish Showcase Frame */}
        <div className="relative w-40 h-40 bg-radial from-[#1e293b]/60 to-[#070b14] border border-slate-700/80 rounded-2xl flex items-center justify-center shadow-inner mb-4 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={96}
            height={96}
            className="animate-shimmer drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Fish Stats Matrix */}
        <div className="grid grid-cols-2 gap-2 w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3 mb-4 text-center">
          <div>
            <div className="text-[10px] font-pixel text-slate-400">WEIGHT</div>
            <div className="font-pixel text-sm text-white mt-0.5">
              {catchInstance.weightKg.toFixed(2)} kg
            </div>
          </div>
          <div>
            <div className="text-[10px] font-pixel text-slate-400">MARKET VALUE</div>
            <div className="font-pixel text-sm text-amber-400 mt-0.5">
              {catchInstance.value} G
            </div>
          </div>
        </div>

        {/* Fish Lore Snippet */}
        <p className="text-xs text-slate-400 italic text-center px-2 mb-5 leading-relaxed">
          "{fish.description}"
        </p>

        {/* Action Choice Buttons */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <button
            onClick={onKeep}
            className="flex flex-col items-center justify-center py-2.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-pixel text-[10px] transition-transform active:scale-95 shadow-md"
          >
            <Check className="w-4 h-4 mb-1" />
            <span>KEEP</span>
          </button>

          <button
            onClick={onQuickSell}
            className="flex flex-col items-center justify-center py-2.5 px-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-pixel text-[10px] transition-transform active:scale-95 shadow-md"
          >
            <DollarSign className="w-4 h-4 mb-1" />
            <span>SELL ({catchInstance.value}G)</span>
          </button>

          <button
            onClick={onQuickSalvage}
            className="flex flex-col items-center justify-center py-2.5 px-2 bg-sky-700 hover:bg-sky-600 text-white rounded-xl font-pixel text-[10px] transition-transform active:scale-95 shadow-md"
            title={`Fillet into ${fish.salvageReward.quantity}x ${fish.salvageReward.partName}`}
          >
            <Scissors className="w-4 h-4 mb-1" />
            <span>FILLET</span>
          </button>
        </div>
      </div>
    </div>
  );
};
