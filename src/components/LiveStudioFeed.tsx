import React, { useState } from 'react';
import { useAgentStore } from '../store/agentStore';
import { 
  X, 
  Sparkles, 
  Send, 
  Radio, 
  Clock 
} from 'lucide-react';

interface LiveStudioFeedProps {
  isOpen: boolean;
  onClose: () => void;
  onFocusAgent?: (agentId: string) => void;
}

export const LiveStudioFeed: React.FC<LiveStudioFeedProps> = ({ isOpen, onClose, onFocusAgent }) => {
  const store = useAgentStore();
  const [filter, setFilter] = useState<'all' | 'chat' | 'standup' | 'git'>('all');
  const [userChatInput, setUserChatInput] = useState('');

  if (!isOpen) return null;

  const activities = store.activityFeed.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatInput.trim()) return;

    const promptText = userChatInput.trim();
    setUserChatInput('');

    // Add user instruction to activity feed
    store.addActivity({
      id: 'usr_' + Date.now(),
      timestamp: Date.now(),
      type: 'chat',
      actorId: 'user',
      actorName: 'You (Director)',
      actorRole: 'copilot',
      actorColor: '#facc15',
      targetId: 'copilot',
      targetName: 'Antigravity',
      content: promptText,
      badge: 'DIRECTOR',
    });

    // Antigravity acknowledges and Orion executes
    setTimeout(() => {
      store.setAgentSpeech('copilot', 'Acknowledged. Planning dispatch.', 'check');
      store.addActivity({
        id: 'cop_' + Date.now(),
        timestamp: Date.now(),
        type: 'standup',
        actorId: 'copilot',
        actorName: 'Antigravity',
        actorRole: 'copilot',
        actorColor: '#38bdf8',
        content: `Co-Pilot dispatching goal: "${promptText.slice(0, 45)}..."`,
        details: `Goal registered in sprint backlog. Lead Orion decomposing tasks.`,
        badge: 'EXECUTIVE',
      });
      store.triggerStandup();
    }, 1200);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-studio-dark/95 backdrop-blur-xl border-l border-studio-border flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-studio-border flex items-center justify-between bg-studio-surface/50">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <span>Studio Live Feed</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-catch-yellow/20 text-catch-yellow font-mono">
                AI BRAIN
              </span>
            </h2>
            <div className="flex items-center space-x-2 text-[11px] text-studio-muted font-mono mt-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{store.timeState.formattedTime || '12:00 PM'} (NYC EDT)</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-studio-surface text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs & Quick Action */}
      <div className="px-4 py-2.5 border-b border-studio-border/60 flex items-center justify-between text-xs bg-studio-darkest/40">
        <div className="flex space-x-1 font-mono text-[11px]">
          {(['all', 'chat', 'standup', 'git'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded-md transition-colors capitalize ${
                filter === tab
                  ? 'bg-studio-surface text-catch-yellow font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => store.triggerStandup()}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 text-[11px] font-mono transition-colors"
          title="Run Autonomous Standup via Gemini/Cloudflare AI"
        >
          <Sparkles className="w-3 h-3" />
          <span>Standup</span>
        </button>
      </div>

      {/* Activity Timeline List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs">
            No activities recorded in current sprint yet.
          </div>
        ) : (
          activities.map(act => (
            <div
              key={act.id}
              onClick={() => onFocusAgent && onFocusAgent(act.actorId)}
              className="p-3 rounded-xl bg-studio-surface/60 border border-studio-border/80 hover:border-slate-600 transition-all cursor-pointer space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: act.actorColor || '#6366f1' }}
                  />
                  <span className="font-semibold text-slate-200">
                    {act.actorName}
                  </span>
                  {act.targetName && (
                    <span className="text-slate-500 text-[11px]">
                      ➔ {act.targetName}
                    </span>
                  )}
                </div>

                {act.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                    {act.badge}
                  </span>
                )}
              </div>

              {/* Message Content */}
              <p className="text-slate-300 leading-relaxed font-sans text-[12px]">
                {act.content}
              </p>

              {/* Technical Details or Terminal Output */}
              {act.details && (
                <div className="p-2 rounded-lg bg-black/40 border border-slate-800/80 font-mono text-[10px] text-slate-400 mt-1 break-all">
                  {act.details}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Director Quick Prompt Input */}
      <form onSubmit={handleSendPrompt} className="p-3 border-t border-studio-border bg-studio-surface/40 flex items-center space-x-2">
        <input
          type="text"
          value={userChatInput}
          onChange={e => setUserChatInput(e.target.value)}
          placeholder="Instruct Chief Co-Pilot Antigravity..."
          className="flex-1 bg-studio-darkest/90 border border-studio-border rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-catch-yellow font-sans"
        />
        <button
          type="submit"
          className="p-2 rounded-lg bg-catch-yellow text-slate-950 hover:bg-yellow-400 transition-colors"
          title="Send goal prompt"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
