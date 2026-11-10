import React, { useEffect, useRef, useState } from 'react';
import { FishingEngine, MinigameState } from '../engine/FishingEngine';
import { FishDefinition } from '../types/game';
import { PixelRenderer } from '../engine/PixelRenderer';
import { AlertTriangle, Zap } from 'lucide-react';

interface FishingMinigameProps {
  fish: FishDefinition;
  difficulty: 'easy' | 'normal' | 'hard';
  onCatchSuccess: (fish: FishDefinition) => void;
  onCatchFail: (reason: 'snapped' | 'escaped') => void;
}

export const FishingMinigame: React.FC<FishingMinigameProps> = ({
  fish,
  difficulty,
  onCatchSuccess,
  onCatchFail,
}) => {
  const engineRef = useRef<FishingEngine>(new FishingEngine(difficulty));
  const [gameState, setGameState] = useState<MinigameState | null>(null);
  const [isHoldingInput, setIsHoldingInput] = useState(false);
  const fishCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize encounter
  useEffect(() => {
    engineRef.current.setDifficulty(difficulty);
    const initial = engineRef.current.startEncounter(fish);
    setGameState(initial);
  }, [fish, difficulty]);

  // Main 60 FPS update loop
  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;

    const loop = (currentTime: number) => {
      const dt = currentTime - lastTime;
      lastTime = currentTime;

      const nextState = engineRef.current.update(dt, isHoldingInput);
      if (nextState) {
        setGameState(nextState);

        if (nextState.isCompleted) {
          onCatchSuccess(fish);
          return;
        } else if (nextState.isLineSnapped) {
          onCatchFail('snapped');
          return;
        } else if (nextState.isEscaped) {
          onCatchFail('escaped');
          return;
        }
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isHoldingInput, fish, onCatchSuccess, onCatchFail]);

  // Render fish sprite onto mini canvas
  useEffect(() => {
    const canvas = fishCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const spriteCanvas = PixelRenderer.getFishSprite(fish);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(spriteCanvas, 0, 0, canvas.width, canvas.height);
  }, [fish]);

  // Keyboard controls (Space or Arrow Up/W)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        setIsHoldingInput(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        setIsHoldingInput(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  if (!gameState) return null;

  const isTensionDangerous = gameState.lineTension > 85;

  return (
    <div className="absolute inset-0 z-40 bg-black/65 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="relative bg-[#0d1322] border-2 border-slate-700/80 rounded-2xl shadow-2xl p-6 flex flex-col items-center max-w-sm w-full">
        {/* Boss Phase 2 Alert Ribbon */}
        {gameState.isBossPhase2 && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 border border-red-400 text-white text-[10px] px-3 py-0.5 rounded-full font-pixel uppercase tracking-widest flex items-center gap-1 shadow-lg animate-bounce">
            <Zap className="w-3 h-3 text-yellow-300" />
            PHASE 2: RAGE!
          </div>
        )}

        {/* Fish Header */}
        <div className="text-center mb-4">
          <div className="text-[10px] font-pixel text-slate-400 uppercase tracking-widest">
            HOOKED ENCOUNTER
          </div>
          <h3 className="font-pixel text-base text-amber-300 tracking-wide mt-0.5">
            {fish.name}
          </h3>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-[10px] text-slate-400 capitalize">
              {fish.rarity}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] text-sky-400 capitalize">
              {fish.fightingPattern} Pattern
            </span>
          </div>
        </div>

        {/* Tension & Catch Gauge Assembly */}
        <div className="flex gap-4 items-center justify-center w-full my-2">
          {/* 1. Catch Progress Bar (Left) */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-pixel text-slate-400 mb-1">CATCH</span>
            <div className="w-3.5 h-64 bg-slate-900 border border-slate-700 rounded-full relative overflow-hidden shadow-inner">
              <div
                className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full transition-all duration-75"
                style={{ height: `${gameState.catchProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-pixel text-emerald-400 mt-1.5">
              {Math.round(gameState.catchProgress)}%
            </span>
          </div>

          {/* 2. Main Depth Gauge Tube (Center) */}
          <div className="relative w-20 h-64 bg-gradient-to-b from-[#091c33] to-[#040b15] border-2 border-slate-700/80 rounded-2xl overflow-hidden shadow-inner">
            {/* Glass Tube Specular Reflection */}
            <div className="absolute top-0 left-2 w-1.5 h-full bg-white/10 rounded-full pointer-events-none" />

            {/* Rising Water Bubbles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
              <div className="w-1 h-1 bg-sky-200 rounded-full absolute bottom-4 left-4 animate-ping" />
              <div className="w-1.5 h-1.5 bg-sky-200 rounded-full absolute bottom-12 right-6 animate-pulse" />
            </div>

            {/* Green Sweet-Spot Catch Bar */}
            <div
              className="absolute left-1 right-1 rounded-xl bg-gradient-to-b from-emerald-400/40 via-emerald-500/50 to-emerald-400/40 border-y border-emerald-300 transition-all duration-75 pointer-events-none shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              style={{
                top: `${gameState.barY}%`,
                height: `${gameState.barHeight}%`,
              }}
            >
              <div className="w-full h-full bg-emerald-400/10 animate-pulse rounded-xl" />
            </div>

            {/* Fish Sprite swimming inside */}
            <div
              className="absolute left-1/2 -translate-x-1/2 transition-all duration-100 pointer-events-none"
              style={{
                top: `${gameState.fishY}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <canvas
                ref={fishCanvasRef}
                width={36}
                height={36}
                className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
              />
              {gameState.isFatigued && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] bg-sky-900/90 text-sky-200 px-1 rounded-full font-pixel border border-sky-400/40">
                  Tired!
                </span>
              )}
            </div>
          </div>

          {/* 3. Line Tension Meter (Right) */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-pixel text-slate-400 mb-1">TENSION</span>
            <div className="w-3.5 h-64 bg-slate-900 border border-slate-700 rounded-full relative overflow-hidden shadow-inner">
              <div
                className={`absolute bottom-0 w-full rounded-full transition-all duration-75 ${
                  isTensionDangerous
                    ? 'bg-gradient-to-t from-red-600 to-red-400 animate-pulse'
                    : gameState.lineTension > 50
                    ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                    : 'bg-gradient-to-t from-sky-600 to-sky-400'
                }`}
                style={{ height: `${gameState.lineTension}%` }}
              />
            </div>
            <span className={`text-[10px] font-pixel mt-1.5 ${isTensionDangerous ? 'text-red-400' : 'text-slate-400'}`}>
              {Math.round(gameState.lineTension)}%
            </span>
          </div>
        </div>

        {/* Danger Warning Alert */}
        {isTensionDangerous ? (
          <div className="flex items-center gap-1.5 text-red-400 font-pixel text-[11px] animate-bounce my-1.5">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>RELEASE REEL! LINE BREAKING!</span>
          </div>
        ) : (
          <div className="text-[10px] text-slate-400 my-1.5 font-sans">
            Keep the green bar over the fish to reel in
          </div>
        )}

        {/* Interactive Hold/Reel Button */}
        <button
          onMouseDown={() => setIsHoldingInput(true)}
          onMouseUp={() => setIsHoldingInput(false)}
          onTouchStart={() => setIsHoldingInput(true)}
          onTouchEnd={() => setIsHoldingInput(false)}
          className={`w-full py-3.5 mt-2 rounded-xl font-pixel text-xs tracking-wider transition-all shadow-lg active:scale-98 ${
            isHoldingInput
              ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-inner'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold'
          }`}
        >
          {isHoldingInput ? 'REELING IN...' : 'HOLD TO REEL (OR SPACEBAR)'}
        </button>
      </div>
    </div>
  );
};
