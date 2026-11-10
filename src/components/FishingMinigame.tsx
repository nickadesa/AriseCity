import React, { useEffect, useRef, useState } from 'react';
import { FishingEngine, MinigameState } from '../engine/FishingEngine';
import { FishDefinition } from '../types/game';
import { PixelRenderer } from '../engine/PixelRenderer';

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

  // Render 32x32 or 64x64 fish sprite onto mini canvas
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

  const isTensionHigh = gameState.lineTension > 85;

  return (
    <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-haven-dark border-4 border-haven-border rounded-lg shadow-pixel-lg p-5 flex flex-col items-center max-w-sm w-full select-none">
        {/* Header with Fish Info */}
        <div className="text-center mb-3">
          {gameState.isBossPhase2 && (
            <div className="bg-red-950 border border-red-500 text-red-200 text-xs px-2 py-0.5 font-pixel uppercase tracking-widest mb-1 animate-pulse">
              ⚡ PHASE 2: RAGE MODE!
            </div>
          )}
          <h3 className="font-pixel text-haven-gold text-sm tracking-wide">{fish.name}</h3>
          <p className="text-[10px] text-slate-400 capitalize">{fish.rarity} • {fish.fightingPattern} behavior</p>
        </div>

        {/* Tension & Catch Gauge Assembly */}
        <div className="flex gap-4 items-center justify-center w-full my-2">
          {/* 1. Catch Progress Bar (Left Vertical) */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-pixel text-slate-400 mb-1">CATCH</span>
            <div className="w-4 h-64 bg-slate-900 border-2 border-slate-700 rounded-sm relative overflow-hidden">
              <div
                className="absolute bottom-0 w-full bg-emerald-500 transition-all duration-75"
                style={{ height: `${gameState.catchProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-pixel text-emerald-400 mt-1">
              {Math.round(gameState.catchProgress)}%
            </span>
          </div>

          {/* 2. Main Tension Track (Center Track) */}
          <div className="relative w-20 h-64 bg-ocean-900 border-4 border-haven-border rounded-sm overflow-hidden shadow-inner">
            {/* Background water stripes */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[repeating-linear-gradient(0deg,#2b7cd3_0px,#2b7cd3_4px,#07162c_4px,#07162c_8px)]" />

            {/* Green Sweet-Spot Catch Bar */}
            <div
              className="absolute left-0 right-0 bg-emerald-400/50 border-y-2 border-emerald-300 transition-all duration-75 pointer-events-none"
              style={{
                top: `${gameState.barY}%`,
                height: `${gameState.barHeight}%`,
              }}
            >
              <div className="w-full h-full bg-emerald-500/20 animate-pulse" />
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
                className="drop-shadow-md"
              />
              {gameState.isFatigued && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] bg-sky-900 text-sky-200 px-1 rounded font-pixel">
                  Zzz
                </span>
              )}
            </div>
          </div>

          {/* 3. Line Tension Meter (Right Vertical) */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-pixel text-slate-400 mb-1">TENSION</span>
            <div className="w-4 h-64 bg-slate-900 border-2 border-slate-700 rounded-sm relative overflow-hidden">
              <div
                className={`absolute bottom-0 w-full transition-all duration-75 ${
                  isTensionHigh ? 'bg-red-500 animate-pulse' : gameState.lineTension > 50 ? 'bg-amber-400' : 'bg-sky-400'
                }`}
                style={{ height: `${gameState.lineTension}%` }}
              />
            </div>
            <span className={`text-[10px] font-pixel mt-1 ${isTensionHigh ? 'text-red-400' : 'text-slate-300'}`}>
              {Math.round(gameState.lineTension)}%
            </span>
          </div>
        </div>

        {/* Warning Alert if Red Tension */}
        {isTensionHigh && (
          <div className="text-red-400 font-pixel text-xs animate-bounce my-1">
            ⚠️ RELEASE REEL! LINE SNAPPING!
          </div>
        )}

        {/* Interactive Hold/Reel Button for Mouse & Touch */}
        <button
          onMouseDown={() => setIsHoldingInput(true)}
          onMouseUp={() => setIsHoldingInput(false)}
          onTouchStart={() => setIsHoldingInput(true)}
          onTouchEnd={() => setIsHoldingInput(false)}
          className={`w-full py-4 mt-2 rounded font-pixel text-sm uppercase tracking-wider pixel-btn ${
            isHoldingInput
              ? 'bg-amber-500 text-haven-dark transform translate-y-1'
              : 'bg-haven-gold text-haven-dark hover:bg-amber-400'
          }`}
        >
          {isHoldingInput ? '🎣 REELING IN...' : 'HOLD TO REEL (OR SPACEBAR)'}
        </button>

        <p className="text-[10px] text-slate-400 mt-2 text-center">
          Keep the green bar over the fish to fill the catch meter!
        </p>
      </div>
    </div>
  );
};
