import React, { useState } from 'react';
import { Agent, AgentRole } from '../../types/agent';
import { X, UserPlus, Users } from 'lucide-react';

interface AgentRosterModalProps {
  agents: Agent[];
  onClose: () => void;
  onAddAgent: (name: string, role: AgentRole, modelTier: 'flash' | 'pro') => void;
}

export const AgentRosterModal: React.FC<AgentRosterModalProps> = ({
  agents,
  onClose,
  onAddAgent,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<AgentRole>('frontend');
  const [modelTier, setModelTier] = useState<'flash' | 'pro'>('flash');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddAgent(name.trim(), role, modelTier);
    setName('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-studio-card border border-studio-border rounded-xl shadow-modal overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-studio-border bg-studio-dark">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">Developer Team Roster</h3>
              <p className="text-xs text-studio-muted">
                {agents.length} Autonomous Agents configured for AriseBot HQ
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
        <div className="p-6 overflow-y-auto space-y-4 bg-studio-darkest/70 flex-1">
          {/* Agent List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agents.map(agent => (
              <div 
                key={agent.id}
                className="p-3.5 bg-studio-card rounded-lg border border-studio-border flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-mono font-bold text-xs shadow-sm"
                    style={{ backgroundColor: agent.avatarColor }}
                  >
                    {agent.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-sm font-semibold text-slate-100">{agent.name}</h4>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">
                        {agent.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-studio-muted mt-0.5">
                      Desk #{agent.deskId} • Tier: {agent.modelTier.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                    agent.status === 'typing'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Agent Form */}
          {isAdding ? (
            <form onSubmit={handleSubmit} className="p-4 bg-studio-dark rounded-lg border border-studio-border space-y-3 mt-4">
              <h4 className="text-xs font-semibold text-slate-200 uppercase font-mono">
                Onboard New Developer Agent
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-studio-muted block mb-1">NAME</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Phoenix"
                    className="w-full px-3 py-1.5 bg-studio-darkest border border-studio-border rounded text-xs text-white placeholder-slate-600 focus:outline-none focus:border-catch-yellow"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-studio-muted block mb-1">ROLE</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as AgentRole)}
                    className="w-full px-3 py-1.5 bg-studio-darkest border border-studio-border rounded text-xs text-white focus:outline-none focus:border-catch-yellow"
                  >
                    <option value="lead">Lead Architect</option>
                    <option value="frontend">Frontend Engineer</option>
                    <option value="backend">Backend Wizard</option>
                    <option value="devops">DevOps Specialist</option>
                    <option value="qa">QA Tester</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-studio-muted block mb-1">MODEL TIER</label>
                  <select
                    value={modelTier}
                    onChange={e => setModelTier(e.target.value as 'flash' | 'pro')}
                    className="w-full px-3 py-1.5 bg-studio-darkest border border-studio-border rounded text-xs text-white focus:outline-none focus:border-catch-yellow"
                  >
                    <option value="flash">Flash (Fast & Light)</option>
                    <option value="pro">Pro (Deep Reasoning)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-catch-yellow hover:bg-catch-gold text-slate-950 font-semibold text-xs transition-colors"
                >
                  Confirm Onboarding
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 rounded-lg border border-dashed border-studio-border hover:border-slate-500 text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4 text-catch-yellow" />
              <span>Onboard Additional Agent</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-studio-border bg-studio-dark">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
