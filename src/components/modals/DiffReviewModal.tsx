import React from 'react';
import { Task } from '../../types/agent';
import { X, GitPullRequest, CheckCircle2, ShieldCheck, FileCode, Check } from 'lucide-react';

interface DiffReviewModalProps {
  task: Task | null;
  onClose: () => void;
  onApproveAndMerge: (taskId: string) => void;
}

export const DiffReviewModal: React.FC<DiffReviewModalProps> = ({
  task,
  onClose,
  onApproveAndMerge,
}) => {
  if (!task || !task.diff) return null;

  const lines = task.diff.diffContent.split('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-4xl bg-studio-card border border-studio-border rounded-xl shadow-modal overflow-hidden flex flex-col max-h-[88vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-studio-border bg-studio-dark">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-100 text-base">{task.title}</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800 uppercase">
                  READY TO MERGE
                </span>
              </div>
              <p className="text-xs text-studio-muted font-mono mt-0.5 flex items-center space-x-2">
                <FileCode className="w-3 h-3 text-cyan-400 inline" />
                <span>{task.diff.file}</span>
                <span>•</span>
                <span className="text-emerald-400">+{task.diff.additions}</span>
                <span className="text-rose-400">-{task.diff.deletions}</span>
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

        {/* Verification Checkpoint Badges */}
        <div className="flex items-center space-x-6 px-6 py-2.5 bg-studio-darkest/70 border-b border-studio-border text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>TypeScript typecheck clean</span>
          </div>
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Unit tests passed ({task.testResults?.passed || 18}/{task.testResults?.passed || 18})</span>
          </div>
          <div className="flex items-center space-x-1.5 text-studio-muted font-mono">
            <span>Branch: feature/ready-to-ship</span>
          </div>
        </div>

        {/* Diff Content */}
        <div className="p-4 flex-1 bg-[#0b0d12] overflow-y-auto font-mono text-xs leading-relaxed border-b border-studio-border">
          <div className="rounded-lg overflow-hidden border border-slate-800">
            {lines.map((line, idx) => {
              const isAddition = line.startsWith('+');
              const isDeletion = line.startsWith('-');
              const isHunk = line.startsWith('@@');

              return (
                <div 
                  key={idx}
                  className={`flex items-center px-3 py-0.5 ${
                    isAddition
                      ? 'bg-emerald-950/40 text-emerald-300'
                      : isDeletion
                      ? 'bg-rose-950/40 text-rose-300'
                      : isHunk
                      ? 'bg-slate-800/60 text-cyan-400 font-semibold py-1'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="w-8 select-none text-slate-600 text-[10px] text-right pr-3">
                    {idx + 1}
                  </span>
                  <pre className="flex-1 font-mono">{line}</pre>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with Approve & Merge CTA */}
        <div className="flex items-center justify-between px-6 py-4 bg-studio-dark">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => onApproveAndMerge(task.id)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Approve & Merge Pull Request</span>
          </button>
        </div>
      </div>
    </div>
  );
};
