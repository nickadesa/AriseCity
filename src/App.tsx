import React, { useState } from 'react';
import { useAgentStore } from './store/agentStore';
import { ThreeStudioCanvas } from './components/ThreeStudioCanvas';
import { StudioHeader } from './components/StudioHeader';
import { AgentDeskModal } from './components/modals/AgentDeskModal';
import { TaskBoardModal } from './components/modals/TaskBoardModal';
import { DecisionModal } from './components/modals/DecisionModal';
import { DiffReviewModal } from './components/modals/DiffReviewModal';
import { AgentRosterModal } from './components/modals/AgentRosterModal';
import { NPCDialogueModal } from './components/modals/NPCDialogueModal';
import { CityCatalogModal } from './components/modals/CityCatalogModal';
import { LiveStudioFeed } from './components/LiveStudioFeed';
import { Zap, HelpCircle } from 'lucide-react';

export const App: React.FC = () => {
  const store = useAgentStore();

  // Modal open states
  const [activeDeskAgentId, setActiveDeskAgentId] = useState<string | null>(null);
  const [isTaskBoardOpen, setIsTaskBoardOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [activeDiffTaskId, setActiveDiffTaskId] = useState<string | null>(null);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

  // Active items
  const deskAgent = store.agents.find(a => a.id === activeDeskAgentId);
  const diffTask = store.tasks.find(t => t.id === activeDiffTaskId);
  const activeNpc = store.npcs.find(n => n.id === activeNpcId);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-studio-darkest text-slate-100 select-none">
      {/* Top Header & Command Bar */}
      <StudioHeader
        onOpenTaskBoard={() => setIsTaskBoardOpen(true)}
        onOpenRoster={() => setIsRosterModalOpen(true)}
        onOpenDecision={() => setIsDecisionModalOpen(true)}
        onOpenFeed={() => store.setFeedOpen(true)}
        onOpenCatalog={() => setIsCatalogModalOpen(true)}
      />

      {/* Main 2.5D Isometric Canvas */}
      <main className="w-full h-full">
        <ThreeStudioCanvas
          onOpenDeskModal={(agentId) => setActiveDeskAgentId(agentId)}
          onOpenTaskBoard={() => setIsTaskBoardOpen(true)}
          onOpenDecisionModal={() => setIsDecisionModalOpen(true)}
        />
      </main>

      {/* Bottom Floating Telemetry & Hint Bar */}
      <footer className="absolute bottom-3 left-4 right-4 z-40 flex items-center justify-between pointer-events-none text-xs">
        {/* Token & Cost Telemetry */}
        <div className="pointer-events-auto flex items-center space-x-3 px-3.5 py-1.5 rounded-lg bg-studio-dark/90 border border-studio-border backdrop-blur-md shadow-md font-mono text-[11px]">
          <div className="flex items-center space-x-1.5 text-catch-yellow">
            <Zap className="w-3.5 h-3.5" />
            <span>{store.totalTokens.toLocaleString()} tokens</span>
          </div>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-semibold">${store.totalSpend.toFixed(4)} spent</span>
        </div>

        {/* Helpful Interaction Hint */}
        <div className="hidden sm:flex pointer-events-auto items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-studio-dark/85 border border-studio-border backdrop-blur-md shadow-md text-studio-muted text-[11px]">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Scroll to Zoom • Drag to Pan • Click Desks, Kanban Wall, Boss Door, or Characters</span>
        </div>
      </footer>

      {/* Pop-up Developer Modals */}
      {deskAgent && (
        <AgentDeskModal
          agent={deskAgent}
          onClose={() => setActiveDeskAgentId(null)}
        />
      )}

      {isTaskBoardOpen && (
        <TaskBoardModal
          tasks={store.tasks}
          agents={store.agents}
          onClose={() => setIsTaskBoardOpen(false)}
          onOpenDiffReview={(taskId) => {
            setIsTaskBoardOpen(false);
            setActiveDiffTaskId(taskId);
          }}
        />
      )}

      {isDecisionModalOpen && (
        <DecisionModal
          decision={store.decision}
          onClose={() => setIsDecisionModalOpen(false)}
          onResolve={(action) => {
            store.resolveDecision(action);
            setIsDecisionModalOpen(false);
          }}
        />
      )}

      {diffTask && (
        <DiffReviewModal
          task={diffTask}
          onClose={() => setActiveDiffTaskId(null)}
          onApproveAndMerge={(taskId) => {
            store.approveDiffReview(taskId);
            setActiveDiffTaskId(null);
          }}
        />
      )}

      {isRosterModalOpen && (
        <AgentRosterModal
          agents={store.agents}
          onClose={() => setIsRosterModalOpen(false)}
          onAddAgent={(name, role, tier) => store.addCustomAgent(name, role, tier)}
        />
      )}

      {activeNpc && (
        <NPCDialogueModal
          npc={activeNpc}
          onClose={() => setActiveNpcId(null)}
          onPet={(npcId) => store.petPet(npcId)}
          onTalk={(npcId) => store.interactNpc(npcId)}
        />
      )}

      {/* City Masterplan Catalog & Asset Library Modal */}
      {isCatalogModalOpen && (
        <CityCatalogModal
          onClose={() => setIsCatalogModalOpen(false)}
        />
      )}

      {/* Live Studio Activity Feed Slide-out Drawer */}
      <LiveStudioFeed
        isOpen={store.isFeedOpen}
        onClose={() => store.setFeedOpen(false)}
        onFocusAgent={(agentId) => setActiveDeskAgentId(agentId)}
      />
    </div>
  );
};

export default App;
