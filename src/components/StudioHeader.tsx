import React, { useState } from 'react';
import { useAgentStore } from '../store/agentStore';
import { 
  Sun, 
  Moon, 
  Sunset, 
  Sunrise, 
  Layers, 
  Users, 
  Crown, 
  Send
} from 'lucide-react';

interface StudioHeaderProps {
  onOpenTaskBoard: () => void;
  onOpenRoster: () => void;
  onOpenDecision: () => void;
  onOpenFeed: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  onOpenTaskBoard,
  onOpenRoster,
  onOpenDecision,
  onOpenFeed,
}) => {
  const store = useAgentStore();
  const [promptInput, setPromptInput] = useState('');

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    store.submitGoalPrompt(promptInput.trim());
    setPromptInput('');
  };

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
            <span>ARISECITY HQ</span>
            <span className="text-[10px] text-catch-yellow font-normal px-1 py-0.2 rounded bg-catch-yellow/15">
              #BOXSPACES
            </span>
          </h1>
        </div>

        {/* Real-World New York Time Clock Badge */}
        <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-studio-dark/90 border border-studio-border backdrop-blur-md shadow-md text-xs font-mono text-slate-200">
          <div className="flex items-center space-x-1.5">
            {getPhaseIcon()}
            <span className="font-bold text-catch-yellow">
              {store.timeState.formattedTime || '12:00:00 PM'}
            </span>
          </div>

          <div className="h-3 w-px bg-slate-700" />

          <div className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">NYC EDT</span>
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
            placeholder=">_ Enter goal for Antigravity & AI dev team..."
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

      {/* Quick Action Navigation & Live Feed Button */}
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

        {/* Live Studio Feed Drawer Trigger */}
        <button
          onClick={onOpenFeed}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500/50 text-indigo-200 text-xs font-medium hover:bg-indigo-600/50 backdrop-blur-md transition-colors shadow-md"
          title="Open Live Activity Feed & Dialogue"
        >
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          <span>Live Feed</span>
          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-indigo-950 text-indigo-300">
            {store.activityFeed.length}
          </span>
        </button>

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
