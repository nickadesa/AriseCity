import React from 'react';
import { GameState } from '../types/game';
import { Coins, Sun, CloudRain, Zap, CloudFog, Sparkles, Settings, Compass } from 'lucide-react';

interface HUDProps {
  state: GameState;
  onOpenSettings: () => void;
}

export const HUD: React.FC<HUDProps> = ({ state, onOpenSettings }) => {
  const { player, time } = state;

  const formatTime = (hr: number, min: number) => {
    const period = hr >= 12 ? 'PM' : 'AM';
    const displayHr = hr % 12 === 0 ? 12 : hr % 12;
    const displayMin = min < 10 ? `0${min}` : min;
    return `${displayHr}:${displayMin} ${period}`;
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'rainy': return <CloudRain className="w-3.5 h-3.5 text-sky-400" />;
      case 'stormy': return <Zap className="w-3.5 h-3.5 text-amber-300" />;
      case 'foggy': return <CloudFog className="w-3.5 h-3.5 text-slate-400" />;
      case 'meteorshower': return <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />;
      default: return <Sun className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-center pointer-events-none select-none">
      {/* Left: Player Profile Badge */}
      <div className="flex items-center gap-3 bg-[#0d1322]/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-2.5 shadow-xl pointer-events-auto">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-300 flex items-center justify-center text-slate-950 font-pixel text-[11px] font-bold shadow-inner">
          {player.level}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-pixel text-xs text-white tracking-wide">{player.name}</span>
            <span className="text-[10px] font-pixel text-amber-400/80">Angler</span>
          </div>
          <div className="w-32 h-1.5 bg-slate-900 border border-slate-700/70 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (player.exp / (player.level * 150)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Center: In-Game Clock & World Calendar */}
      <div className="flex items-center gap-3 bg-[#0d1322]/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-4 py-2 shadow-xl pointer-events-auto">
        <div className="flex items-center gap-1.5 text-amber-300 font-pixel text-xs">
          {getWeatherIcon(time.weather)}
          <span className="capitalize">{time.season} Day {time.day}</span>
        </div>
        <div className="h-3.5 w-px bg-slate-700/80" />
        <div className="font-pixel text-xs text-slate-200 tracking-wider">
          {formatTime(time.hour, time.minute)}
        </div>
        <div className="h-3.5 w-px bg-slate-700/80" />
        <div className="flex items-center gap-1 text-[11px] text-sky-400 font-pixel">
          <Compass className="w-3.5 h-3.5" />
          <span>Home Bay</span>
        </div>
      </div>

      {/* Right: Gold & Settings Controls */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        <div className="flex items-center gap-2 bg-[#0d1322]/85 backdrop-blur-md border border-amber-500/40 rounded-xl px-3.5 py-2 shadow-xl">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="font-pixel text-xs text-amber-300 tracking-wide">
            {player.gold.toLocaleString()} G
          </span>
        </div>

        <button
          onClick={onOpenSettings}
          className="bg-[#0d1322]/85 hover:bg-slate-800 backdrop-blur-md border border-slate-700/60 p-2.5 rounded-xl text-slate-300 hover:text-white transition-colors shadow-xl"
          title="Game Settings & Save"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
