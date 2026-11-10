import React, { useState } from 'react';
import { useAgentStore } from '../store/agentStore';
import { 
  Sun, 
  Moon, 
  Sunset, 
  Sunrise, 
  Play, 
  Pause, 
  Layers, 
  Users, 
  Crown, 
  Send
} from 'lucide-react';

interface StudioHeaderProps {
  onOpenTaskBoard: () => void;
  onOpenRoster: () => void;
  onOpenDecision: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  onOpenTaskBoard,
  onOpenRoster,
  onOpenDecision,
}) => {
  const store = useAgentStore();
  const [promptInput, setPromptInput] = useState('');

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    store.submitGoalPrompt(promptInput.trim());
    setPromptInput('');
  };

  // Format in-game hours
  const hours = Math.floor(store.timeState.gameHours);
  const minutes = Math.floor((store.timeState.gameHours % 1) * 60);
  const timeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  // Time Phase Icon
  const getPhaseIcon = () => {
    switch (store.timeState.phase) {
      case 'dawn': return <Sunrise className="w-3.5 h-3.5 text-amber-300" />;
      case 'day': return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'dusk': return <Sunset className="w-3.5 h-3.5 text-orange-400" />;
      case 'night': return <Moon className="w-3.5 h-3.5 text-indigo-300" />;
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-40 p-3 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
      {/* Studio Branding & Live Indicator */}
      <div className="flex items-center space-x-3 pointer-events-auto">
        <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-studio-dark/90 border border-studio-border backdrop-blur-md shadow-md">
          <div className="w-2.5 h-2.5 rounded-full bg-catch-yellow animate-pulse" />
          <h1 className="text-xs font-bold tracking-wider font-mono text-slate-100 flex items-center space-x-1.5">
            <span>ARISEBOT HQ</span>
            <span className="text-[10px] text-catch-yellow font-normal px-1 py-0.2 rounded bg-catch-yellow/15">
              #BOXSPACES
            </span>
          </h1>
        </div>

        {/* Day/Night Clock & Speed Controls */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-studio-dark/90 border border-studio-border backdrop-blur-md shadow-md text-xs font-mono text-slate-200">
          <div className="flex items-center space-x-1.5">
            {getPhaseIcon()}
            <span className="font-semibold">{timeFormatted}</span>
            <span className="text-studio-muted text-[10px]">D{store.timeState.dayCount}</span>
          </div>

          <div className="h-3 w-px bg-slate-700" />

          {/* Time Scale Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => store.setTimeScale(store.timeState.timeScale === 0 ? 1 : 0)}
              title={store.timeState.timeScale === 0 ? 'Resume' : 'Pause'}
              className={`p-1 rounded text-xs transition-colors ${
                store.timeState.timeScale === 0 ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {store.timeState.timeScale === 0 ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            </button>
            <button
              onClick={() => store.setTimeScale(1)}
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                store.timeState.timeScale === 1 ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => store.setTimeScale(2)}
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                store.timeState.timeScale === 2 ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              2x
            </button>
            <button
              onClick={() => store.setTimeScale(5)}
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                store.timeState.timeScale === 5 ? 'bg-catch-yellow text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              5x
            </button>
          </div>
        </div>
      </div>

      {/* Goal Prompt Dispatch Bar (Center) */}
      <form 
        onSubmit={handlePromptSubmit}
        className="flex-1 max-w-md pointer-events-auto mx-2"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={promptInput}
            onChange={e => setPromptInput(e.target.value)}
            placeholder=">_ Enter feature goal to dispatch agents..."
            className="w-full pl-3 pr-10 py-1.5 rounded-lg bg-studio-dark/95 border border-studio-border text-xs text-white placeholder-slate-500 font-mono shadow-md focus:outline-none focus:border-catch-yellow backdrop-blur-md"
          />
          <button
            type="submit"
            className="absolute right-1 px-2 py-1 rounded bg-catch-yellow hover:bg-catch-gold text-slate-950 font-bold transition-colors"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </form>

      {/* Quick Action Navigation & Decision Alert */}
      <div className="flex items-center space-x-2 pointer-events-auto">
        {/* Boss Decision Alert Button */}
        {store.decision && (
          <button
            onClick={onOpenDecision}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-catch-yellow text-slate-950 font-bold text-xs shadow-glow-yellow animate-pulse hover:bg-catch-gold transition-all"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Decision Waiting!</span>
          </button>
        )}

        {/* Task Board Trigger */}
        <button
          onClick={onOpenTaskBoard}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-studio-dark/90 border border-studio-border text-slate-200 text-xs font-medium hover:text-white hover:bg-slate-800 backdrop-blur-md transition-colors shadow-md"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Tasks</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
            {store.tasks.length}
          </span>
        </button>

        {/* Team Roster Trigger */}
        <button
          onClick={onOpenRoster}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-studio-dark/90 border border-studio-border text-slate-200 text-xs font-medium hover:text-white hover:bg-slate-800 backdrop-blur-md transition-colors shadow-md"
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>Team ({store.agents.length})</span>
        </button>
      </div>
    </header>
  );
};
