import React from 'react';
import { AmbientNPC } from '../../types/agent';
import { X, Heart, MessageSquare, Clock } from 'lucide-react';

interface NPCDialogueModalProps {
  npc: AmbientNPC | null;
  onClose: () => void;
  onPet: (npcId: string) => void;
  onTalk: (npcId: string) => void;
}

export const NPCDialogueModal: React.FC<NPCDialogueModalProps> = ({
  npc,
  onClose,
  onPet,
  onTalk,
}) => {
  if (!npc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-studio-card border border-studio-border rounded-xl shadow-modal overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-studio-border bg-studio-dark">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center font-bold text-sm">
              {npc.type === 'pet' ? '🐕' : npc.type === 'courier' ? '📦' : npc.type === 'client' ? '💼' : npc.type === 'technician' ? '🔧' : npc.type === 'cleaner' ? '🤖' : '🔦'}
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">{npc.name}</h3>
              <p className="text-[11px] text-studio-muted flex items-center space-x-1.5 mt-0.5">
                <Clock className="w-3 h-3 text-catch-yellow inline" />
                <span className="capitalize">Schedule: {npc.schedule}</span>
                <span>•</span>
                <span>Interactions: {npc.interactionCount}</span>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thought & Live Status */}
        <div className="p-5 space-y-4 bg-studio-darkest/70">
          <div className="p-3.5 rounded-lg bg-studio-card border border-studio-border">
            <span className="text-[10px] font-mono text-studio-muted uppercase block mb-1">
              LIVE THOUGHT (CITIES: SKYLINES 2 SIMULATION)
            </span>
            <p className="text-xs text-slate-200 italic leading-relaxed">
              "{npc.thought}"
            </p>
          </div>

          {/* Current Speech / Dialogue */}
          <div className="p-3.5 rounded-lg bg-studio-dark border border-cyan-900/40">
            <span className="text-[10px] font-mono text-cyan-400 uppercase block mb-1">
              CONVERSATION
            </span>
            <p className="text-xs text-slate-100 leading-relaxed font-sans">
              {npc.speechBubble?.text || npc.dialogueLines[0]}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-studio-border bg-studio-dark">
          <button
            onClick={() => onTalk(npc.id)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-catch-yellow" />
            <span>Chat Again</span>
          </button>

          {npc.type === 'pet' ? (
            <button
              onClick={() => onPet(npc.id)}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-semibold text-xs transition-colors shadow-md shadow-rose-500/20"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Pet Sparky (+Morale)</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
