import React from 'react';
import { Task, Agent } from '../../types/agent';
import { X, FileCode } from 'lucide-react';

interface TaskBoardModalProps {
  tasks: Task[];
  agents: Agent[];
  onClose: () => void;
  onOpenDiffReview: (taskId: string) => void;
}

export const TaskBoardModal: React.FC<TaskBoardModalProps> = ({
  tasks,
  agents,
  onClose,
  onOpenDiffReview,
}) => {
  const columns: { status: Task['status']; title: string; color: string }[] = [
    { status: 'todo', title: 'To Do', color: 'border-slate-600 text-slate-300' },
    { status: 'in_progress', title: 'In Progress', color: 'border-cyan-500 text-cyan-400' },
    { status: 'review', title: 'Review / Merge', color: 'border-catch-yellow text-catch-yellow' },
    { status: 'done', title: 'Merged', color: 'border-emerald-500 text-emerald-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-5xl bg-studio-card border border-studio-border rounded-xl shadow-modal overflow-hidden flex flex-col max-h-[88vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-studio-border bg-studio-dark">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center space-x-2">
              <span>Task Wall // Engineering Kanban</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-studio-muted border border-slate-700 font-mono">
                {tasks.length} Total
              </span>
            </h2>
            <p className="text-xs text-studio-muted mt-0.5">
              Live task orchestration across autonomous developer agents
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Kanban Board Grid */}
        <div className="p-6 overflow-x-auto flex-1 bg-studio-darkest/50">
          <div className="grid grid-cols-4 gap-4 min-w-[800px] h-full">
            {columns.map(col => {
              const colTasks = tasks.filter(t => t.status === col.status);
              return (
                <div key={col.status} className="flex flex-col bg-studio-dark/70 rounded-xl p-3 border border-studio-border/60">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-studio-border/40 mb-3">
                    <span className={`text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 ${col.color}`}>
                      <span className="w-2 h-2 rounded-full bg-current" />
                      <span>{col.title}</span>
                    </span>
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Task Cards */}
                  <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                    {colTasks.length === 0 ? (
                      <div className="h-28 flex items-center justify-center text-xs text-slate-600 italic border border-dashed border-slate-800 rounded-lg">
                        No tasks
                      </div>
                    ) : (
                      colTasks.map(task => {
                        const assignee = agents.find(a => a.id === task.assigneeId);
                        return (
                          <div 
                            key={task.id}
                            className="p-3.5 bg-studio-card/90 rounded-lg border border-studio-border/80 hover:border-slate-600 transition-all shadow-sm group"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <h4 className="text-sm font-medium text-slate-200 line-clamp-2 leading-snug">
                                {task.title}
                              </h4>
                              <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded shrink-0 ${
                                task.priority === 'high' 
                                  ? 'bg-rose-950/70 text-rose-400 border border-rose-900/60' 
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {task.priority}
                              </span>
                            </div>

                            <p className="text-xs text-studio-muted line-clamp-2 mb-3 leading-relaxed">
                              {task.description}
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                              {assignee ? (
                                <div className="flex items-center space-x-1.5">
                                  <div 
                                    className="w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center text-white"
                                    style={{ backgroundColor: assignee.avatarColor }}
                                  >
                                    {assignee.name[0]}
                                  </div>
                                  <span className="text-slate-400 font-mono text-[11px]">
                                    {assignee.name}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-600 italic">Unassigned</span>
                              )}

                              {task.diff && (
                                <button
                                  onClick={() => onOpenDiffReview(task.id)}
                                  className="flex items-center space-x-1 text-catch-yellow hover:text-catch-light transition-colors"
                                >
                                  <FileCode className="w-3.5 h-3.5" />
                                  <span className="font-mono text-[11px]">Review</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
