import React from 'react';
import { GameState } from '../types/game';
import { Coins, Sun, CloudRain, Zap, CloudFog, Sparkles } from 'lucide-react';

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
      case 'rainy': return <CloudRain className="w-4 h-4 text-sky-400" />;
      case 'stormy': return <Zap className="w-4 h-4 text-amber-300" />;
      case 'foggy': return <CloudFog className="w-4 h-4 text-slate-400" />;
      case 'meteorshower': return <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />;
      default: return <Sun className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-3 flex justify-between items-center pointer-events-none select-none">
      {/* Left: Player Profile & Level */}
      <div className="flex items-center gap-3 bg-haven-dark/90 border-2 border-haven-border rounded-lg p-2 shadow-pixel pointer-events-auto">
        <div className="w-10 h-10 rounded bg-ocean-700 border-2 border-haven-gold flex items-center justify-center text-haven-gold font-pixel text-xs">
          LV.{player.level}
        </div>
        <div>
          <div className="font-pixel text-xs text-white tracking-wide">{player.name}</div>
          <div className="w-28 h-2 bg-slate-900 border border-slate-700 rounded-sm overflow-hidden mt-1">
            <div
              className="h-full bg-haven-gold"
              style={{ width: `${Math.min(100, (player.exp / (player.level * 150)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Center: Clock, Season, Weather */}
      <div className="flex items-center gap-4 bg-haven-dark/90 border-2 border-haven-border rounded-lg px-4 py-2 shadow-pixel pointer-events-auto">
        <div className="flex items-center gap-1.5 text-haven-gold font-pixel text-xs">
          {getWeatherIcon(time.weather)}
          <span className="capitalize">{time.season} Day {time.day}</span>
        </div>
        <div className="h-4 w-px bg-haven-border" />
        <div className="font-pixel text-xs text-slate-200">
          {formatTime(time.hour, time.minute)}
        </div>
      </div>

      {/* Right: Gold & Settings Button */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-2 bg-haven-dark/90 border-2 border-haven-border rounded-lg px-3 py-2 shadow-pixel">
          <Coins className="w-4 h-4 text-haven-gold animate-bounce" />
          <span className="font-pixel text-sm text-haven-gold tracking-wide">
            {player.gold.toLocaleString()} G
          </span>
        </div>
        <button
          onClick={onOpenSettings}
          className="bg-haven-panel hover:bg-haven-border border-2 border-haven-border p-2 rounded-lg text-slate-200 shadow-pixel pixel-btn"
          title="Settings & Save File"
        >
          ⚙️
        </button>
      </div>
    </header>
  );
};
