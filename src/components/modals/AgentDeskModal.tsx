import React from 'react';
import { Agent } from '../../types/agent';
import { X, Terminal, Cpu, GitBranch, Zap } from 'lucide-react';

interface AgentDeskModalProps {
  agent: Agent;
  onClose: () => void;
}

export const AgentDeskModal: React.FC<AgentDeskModalProps> = ({ agent, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-studio-card border border-studio-border rounded-xl shadow-modal overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-studio-border bg-studio-dark">
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-mono font-bold text-sm shadow-md"
              style={{ backgroundColor: agent.avatarColor }}
            >
              {agent.name[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-100 text-base">{agent.name}</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  {agent.role}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono ${
                  agent.status === 'typing' || agent.status === 'testing'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                    : agent.status === 'waiting_decision'
                    ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    agent.status === 'typing' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                  }`} />
                  {agent.status}
                </span>
              </div>
              <p className="text-xs text-studio-muted flex items-center space-x-2 mt-0.5">
                <GitBranch className="w-3 h-3 text-catch-yellow inline" />
                <span>{agent.gitBranch}</span>
                <span>•</span>
                <span>Model: {agent.modelTier.toUpperCase()}</span>
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

        {/* Telemetry Stats Bar */}
        <div className="grid grid-cols-3 gap-3 px-5 py-3 bg-studio-darkest/70 border-b border-studio-border text-xs">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-studio-muted block text-[10px]">CPU USAGE</span>
              <span className="font-mono text-slate-200 font-semibold">{agent.cpuUsage}%</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-catch-yellow" />
            <div>
              <span className="text-studio-muted block text-[10px]">TOKENS CONSUMED</span>
              <span className="font-mono text-slate-200 font-semibold">{agent.tokenUsage.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-studio-muted block text-[10px]">CURRENT FOCUS</span>
              <span className="text-slate-200 truncate block max-w-[140px]">{agent.thought || 'Idle'}</span>
            </div>
          </div>
        </div>

        {/* Live Terminal Stream */}
        <div className="p-4 flex-1 flex flex-col bg-[#0b0d12] overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-studio-muted flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>TERMINAL STREAM // LIVE TTY</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">pty: /dev/pts/3</span>
          </div>

          <div className="flex-1 bg-black/60 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-y-auto space-y-1.5 border border-slate-800/80 shadow-inner">
            {agent.terminalLogs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                <span className="text-slate-600 select-none mr-2 font-mono text-[10px]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={
                  log.includes('[Error]') || log.includes('Failed')
                    ? 'text-rose-400'
                    : log.includes('[Decision]') || log.includes('Goal')
                    ? 'text-catch-yellow'
                    : log.includes('[Git]') || log.includes('Vite')
                    ? 'text-cyan-400'
                    : log.includes('PASS') || log.includes('success')
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }>
                  {log}
                </span>
              </div>
            ))}
            <div className="flex items-center space-x-1 text-emerald-400 pt-1">
              <span>❯</span>
              <span className="w-2 h-3.5 bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-studio-border bg-studio-dark">
          <div className="text-xs text-studio-muted">
            Assigned to Desk #{agent.deskId} • Night Owl: {agent.nightOwl ? 'Yes' : 'No'}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
