import React from 'react';
import { Decision } from '../../types/agent';
import { X, Check, Crown } from 'lucide-react';

interface DecisionModalProps {
  decision: Decision | null;
  onClose: () => void;
  onResolve: (action: string) => void;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  decision,
  onClose,
  onResolve,
}) => {
  if (!decision) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div 
          className="w-full max-w-lg bg-studio-card border border-studio-border rounded-xl shadow-modal p-6 text-center"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 mx-auto flex items-center justify-center mb-3">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-100">No Pending Approvals</h3>
          <p className="text-xs text-studio-muted mt-1 mb-5">
            Your Executive Suite is clear. Agents are autonomously executing their sprints without blockers.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 transition-colors"
          >
            Return to Studio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-studio-card border border-catch-yellow/50 rounded-xl shadow-glow-yellow overflow-hidden flex flex-col animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-studio-border bg-studio-dark">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-catch-yellow/20 border border-catch-yellow flex items-center justify-center text-catch-yellow">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-base flex items-center space-x-2">
                <span>Executive Decision Prompt</span>
              </h3>
              <p className="text-xs text-catch-yellow">
                {decision.agentName} is waiting outside your office door
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

        {/* Content */}
        <div className="p-6 space-y-4 bg-studio-darkest/70">
          <div className="p-4 rounded-lg bg-studio-card border border-studio-border">
            <span className="text-[11px] font-mono text-studio-muted uppercase block mb-1">
              REQUESTED BY: {decision.agentName.toUpperCase()}
            </span>
            <h4 className="text-sm font-semibold text-slate-100 leading-snug">
              {decision.question}
            </h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {decision.context}
            </p>
          </div>

          {/* Action Options */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-mono text-studio-muted uppercase block">
              SELECT YOUR INSTRUCTION:
            </span>
            {decision.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => onResolve(opt.action)}
                className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start justify-between group ${
                  opt.recommended
                    ? 'bg-catch-yellow/10 border-catch-yellow hover:bg-catch-yellow/20'
                    : 'bg-studio-card border-studio-border hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-slate-100 group-hover:text-catch-yellow transition-colors">
                      {opt.label}
                    </span>
                    {opt.recommended && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-catch-yellow text-black font-bold uppercase">
                        Recommended
                      </span>
                    )}
                  </div>
                  {opt.description && (
                    <p className="text-xs text-studio-muted mt-1 leading-relaxed">
                      {opt.description}
                    </p>
                  )}
                </div>
                <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center shrink-0 ml-3 group-hover:border-catch-yellow group-hover:bg-catch-yellow/20 transition-all">
                  <Check className="w-3 h-3 text-catch-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-studio-border bg-studio-dark">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Postpone
          </button>
        </div>
      </div>
    </div>
  );
};
