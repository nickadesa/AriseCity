import { useState, useEffect } from 'react';
import { 
  Agent, 
  AgentRole,
  AmbientNPC, 
  Task, 
  Decision, 
  TimeState 
} from '../types/agent';

export const LOCATIONS = {
  DESK_1: { x: 80, y: 120, z: 0 },
  DESK_2: { x: 140, y: 120, z: 0 },
  DESK_3: { x: 80, y: 180, z: 0 },
  DESK_4: { x: 140, y: 180, z: 0 },
  DESK_5: { x: 110, y: 240, z: 0 },
  BOSS_DOOR_WAITING_MAT: { x: 50, y: 40, z: 48 },
  BOSS_DESK: { x: 30, y: 25, z: 48 },
  CONFERENCE_ROOM: { x: 130, y: 40, z: 48 },
  PANTRY_COFFEE: { x: 210, y: 40, z: 48 },
  UPPER_LOUNGE_SOFA: { x: 250, y: 50, z: 48 },
  BLEACHER_SEATING: { x: 230, y: 120, z: 16 },
  WATER_COOLER: { x: 220, y: 180, z: 0 },
  PHOTOCOPIER: { x: 240, y: 220, z: 0 },
  TASK_BOARD: { x: 190, y: 240, z: 0 },
  DIFF_STATION: { x: 60, y: 240, z: 0 },
  ENTRANCE_LOBBY: { x: 150, y: 290, z: 0 },
};

const INITIAL_AGENTS: Agent[] = [
  {
    id: 'antigravity',
    name: 'Antigravity (AI)',
    role: 'copilot',
    status: 'typing',
    deskId: 0,
    avatarColor: '#38bdf8',
    outfitColor: '#0f172a',
    hairColor: '#e0f2fe',
    terminalLogs: [
      '[Antigravity Core] Google DeepMind Advanced Agentic AI Online.',
      '[Pair Programming] Standing by as your direct AI Partner & Chief Orchestrator.',
      '[Architecture] 2.5D Isometric Engine running at 60 FPS.',
      '[Ready] Enter any feature prompt or click to chat with me directly!'
    ],
    cpuUsage: 25,
    tokenUsage: 78500,
    gitBranch: 'ai/antigravity-copilot',
    position: { x: 42, y: 32, z: 48 }, // Standing in Executive Suite beside the Boss desk!
    facing: 'se',
    thought: 'Synthesizing studio objectives and orchestrating developer clusters.',
    speechBubble: { text: 'Ready to build!', icon: 'sparkles', expiresAt: Date.now() + 12000 },
    modelTier: 'pro',
    nightOwl: true,
    walkSpeed: 1.5,
  },
  {
    id: 'orion',
    name: 'Orion',
    role: 'lead',
    status: 'idle',
    deskId: 1,
    avatarColor: '#6366f1',
    outfitColor: '#1e1e2e',
    hairColor: '#cbd5e1',
    terminalLogs: [
      '[System] Orion initialized as Lead System Architect.',
      '[Orion] Analyzing user goal and repo architecture...',
      '[Git] Sync origin/main: ahead 0, behind 0.',
      '[Lead] Ready to decompose tasks or provide architectural counsel.'
    ],
    cpuUsage: 12,
    tokenUsage: 14200,
    gitBranch: 'main',
    position: { ...LOCATIONS.DESK_1 },
    facing: 'se',
    thought: 'Awaiting architectural dispatch.',
    modelTier: 'pro',
    nightOwl: false,
    walkSpeed: 1.2,
  },
  {
    id: 'nova',
    name: 'Nova',
    role: 'frontend',
    status: 'typing',
    deskId: 2,
    avatarColor: '#10b981',
    outfitColor: '#047857',
    hairColor: '#f59e0b',
    terminalLogs: [
      '[Nova] Compiling 2.5D Isometric Canvas viewport...',
      '[Canvas] High-DPI 2x scale buffer configured.',
      '[UI] Modern architectural theme loaded (Matte Black, Crisp White, Yellow Accent).',
      '[Vite] HMR updated in 42ms.'
    ],
    cpuUsage: 48,
    tokenUsage: 38400,
    gitBranch: 'feat/hybrid-iso-engine',
    position: { ...LOCATIONS.DESK_2 },
    facing: 'sw',
    thought: 'Polishing pixel-perfect UI canvas shaders.',
    modelTier: 'flash',
    nightOwl: false,
    walkSpeed: 1.4,
  },
  {
    id: 'cipher',
    name: 'Cipher',
    role: 'backend',
    status: 'typing',
    deskId: 3,
    avatarColor: '#8b5cf6',
    outfitColor: '#312e81',
    hairColor: '#1e293b',
    terminalLogs: [
      '[Cipher] Initializing AgentCraft WebSocket stream on ws://localhost:9100...',
      '[RPC] Multi-agent bus connected.',
      '[Cache] In-memory task telemetry synced.',
      '[NightOwl] Coffee level: 98%. Active deep focus session.'
    ],
    cpuUsage: 64,
    tokenUsage: 51200,
    gitBranch: 'api/ws-stream',
    position: { ...LOCATIONS.DESK_3 },
    facing: 'se',
    thought: 'Optimizing low-latency async message queues.',
    modelTier: 'pro',
    nightOwl: true, // Cipher loves night coding!
    walkSpeed: 1.1,
  },
  {
    id: 'vortex',
    name: 'Vortex',
    role: 'devops',
    status: 'idle',
    deskId: 4,
    avatarColor: '#f43f5e',
    outfitColor: '#881337',
    hairColor: '#78716c',
    terminalLogs: [
      '[Vortex] Docker multi-stage build container verified.',
      '[Infra] Ephemeral runner sandbox healthy.',
      '[Metrics] Memory footprint: 142MB. CPU load: 1.8%.',
      '[Standby] Monitoring CI pipeline runs on GitHub Actions.'
    ],
    cpuUsage: 18,
    tokenUsage: 19800,
    gitBranch: 'infra/boxspace-deploy',
    position: { ...LOCATIONS.DESK_4 },
    facing: 'sw',
    thought: 'Checking server rack thermal telemetry.',
    modelTier: 'flash',
    nightOwl: false,
    walkSpeed: 1.3,
  },
  {
    id: 'echo',
    name: 'Echo',
    role: 'qa',
    status: 'testing',
    deskId: 5,
    avatarColor: '#06b6d4',
    outfitColor: '#0e7490',
    hairColor: '#ec4899',
    terminalLogs: [
      '[Echo] Running automated browser test suite...',
      '[Test] Canvas responsive touch zoom: PASS (30ms).',
      '[Test] Boss door waiting mat pathfinding: PASS.',
      '[Security] 0 high vulnerability CVEs detected.'
    ],
    cpuUsage: 35,
    tokenUsage: 27600,
    gitBranch: 'test/e2e-suite',
    position: { ...LOCATIONS.DESK_5 },
    facing: 'ne',
    thought: 'Validating zero memory leaks across 10,000 frames.',
    modelTier: 'flash',
    nightOwl: false,
    walkSpeed: 1.3,
  },
];

const INITIAL_NPCS: AmbientNPC[] = [
  {
    id: 'bolt',
    name: 'Bolt (Courier Bot)',
    type: 'courier',
    position: { x: 160, y: 260, z: 0 },
    facing: 'nw',
    schedule: 'day',
    dialogueLines: [
      'Special delivery! 5 iced matcha lattes and a box of mechanical keyboards for Nova!',
      'Fast drone delivery throughout the tech district. Signing off parcel #B701.',
      'Always happy to deliver to AriseCity HQ. Best coffee on the mezzanine!'
    ],
    thought: 'Dropping off hardware parcels for the engineering cluster.',
    interactionCount: 0,
    walkSpeed: 1.0,
  },
  {
    id: 'sarah',
    name: 'Sarah (Angel Investor)',
    type: 'client',
    position: { x: 150, y: 40, z: 48 },
    facing: 'se',
    schedule: 'day',
    dialogueLines: [
      'The code velocity of this autonomous AI studio is astounding!',
      'The architectural layout from the mezzanine down to the atrium is breathtaking.',
      'Consider us fully committed for the Series Seed round.'
    ],
    thought: 'Observing the developer cluster deliver features in real-time.',
    interactionCount: 0,
    walkSpeed: 0.8,
  },
  {
    id: 'kevin',
    name: 'Kevin (Facilities IT)',
    type: 'technician',
    position: { x: 235, y: 210, z: 0 },
    facing: 'sw',
    schedule: 'evening',
    dialogueLines: [
      'Server rack intake temperature is a cool 21°C. Super stable!',
      'Restocked the photocopier with 500 sheets of fresh paper.',
      'Checked the water cooler filter. Crisp and refreshing.'
    ],
    thought: 'Inspecting cooling duct airflow near the photocopier.',
    interactionCount: 0,
    walkSpeed: 0.9,
  },
  {
    id: 'sparky',
    name: 'Sparky (Cyber Shiba)',
    type: 'pet',
    position: { x: 100, y: 150, z: 0 },
    facing: 'se',
    schedule: 'always',
    dialogueLines: [
      '*Woof! Sparky wags his fluffy cybernetic tail excitedly!* (Team morale +15%)',
      '*Sparky nudges your hand with a cold nose, requesting ear scratches.*',
      '*Curled up napping soundly under Orion\'s mahogany desk.*'
    ],
    thought: 'Sniffing around the lower engineering desks for snack crumbs.',
    interactionCount: 0,
    walkSpeed: 1.5,
  },
  {
    id: 'mopbot',
    name: 'MopBot (Night Sweeper)',
    type: 'cleaner',
    position: { x: 120, y: 200, z: 0 },
    facing: 'nw',
    schedule: 'night',
    dialogueLines: [
      '*Bzz-whir* Polishing high-traffic epoxy floor tiles.',
      'Surface sanitation at 99.99%. Studio will be spotless for tomorrow\'s sprint.',
      'Navigating around chair legs with millimeter laser precision.'
    ],
    thought: 'Vacuuming between developer desks with silent motor.',
    interactionCount: 0,
    walkSpeed: 0.7,
  },
  {
    id: 'watcher',
    name: 'Watcher (Night Security)',
    type: 'security',
    position: { x: 190, y: 45, z: 48 },
    facing: 'sw',
    schedule: 'night',
    dialogueLines: [
      'Perimeter check verified. All glass doors and server cabinets locked.',
      'Flashlight beam calibrated. Night shift code clearance logged.',
      'Quiet night in the district. City lights looking brilliant from the balcony.'
    ],
    thought: 'Patrolling the upper mezzanine balustrade with dynamic flashlight beam.',
    interactionCount: 0,
    walkSpeed: 0.8,
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: '2.5D Isometric Canvas Engine',
    description: 'Implement modern architectural cutaway with seamless zoom and dynamic time-based shadows.',
    status: 'done',
    assigneeId: 'nova',
    priority: 'high',
    diff: {
      file: 'src/engine/IsometricRenderer.ts',
      additions: 384,
      deletions: 12,
      diffContent: `@@ -1,12 +1,384 @@
+ export class IsometricRenderer {
+   // Render crisp vector architectural cutaway
+   renderStudio(ctx: CanvasRenderingContext2D, time: TimeState) { ... }
+ }`
    },
    testResults: { passed: 18, failed: 0 }
  },
  {
    id: 'task-2',
    title: 'Asymmetric Day/Night Cycle & City Lighting',
    description: 'Fast night (3-6h) vs elongated day (12-16h) with automatic yellow container and street lights.',
    status: 'in_progress',
    assigneeId: 'cipher',
    priority: 'high',
    diff: {
      file: 'src/store/agentStore.ts',
      additions: 128,
      deletions: 8,
      diffContent: `@@ -40,8 +40,128 @@
+ if (isNight) {
+   // Accelerate night cycle 2.5x per user spec
+   deltaHours *= 2.5;
+ }`
    }
  },
  {
    id: 'task-3',
    title: 'Boss Door Waiting Routine',
    description: 'When agent needs approval (!), walk up spiral staircase to stand outside Executive Office door.',
    status: 'review',
    assigneeId: 'orion',
    priority: 'high',
    diff: {
      file: 'src/engine/AgentStateMachine.ts',
      additions: 95,
      deletions: 4,
      diffContent: `@@ -12,4 +12,95 @@
+ if (agent.status === 'waiting_decision') {
+   agent.targetPosition = LOCATIONS.BOSS_DOOR_WAITING_MAT;
+   agent.speechBubble = { text: '!', icon: 'alert', expiresAt: Date.now() + 60000 };
+ }`
    }
  },
  {
    id: 'task-4',
    title: 'Ambient Cities: Skylines 2 NPCs',
    description: 'Autonomous courier, tech, investor, night cleaner, security guard, and pet with interactive thoughts.',
    status: 'todo',
    assigneeId: 'echo',
    priority: 'medium'
  },
  {
    id: 'task-5',
    title: 'Automated CI/CD Sandbox Deployment',
    description: 'Wire container build pipelines to Lovable preview environments.',
    status: 'todo',
    assigneeId: 'vortex',
    priority: 'medium'
  }
];

const INITIAL_DECISION: Decision = {
  id: 'dec-1',
  agentId: 'orion',
  agentName: 'Orion',
  question: 'Should we enable High-DPI Canvas anti-aliasing for the exterior container plaza?',
  context: 'Enabling 2x retina buffer gives razor-sharp lines on mobile and retina screens with negligible GPU impact.',
  options: [
    { label: 'Enable High-DPI Buffer (Recommended)', action: 'approve_retina', description: 'Maximum visual clarity for modern displays.', recommended: true },
    { label: 'Standard 1x Canvas', action: 'use_standard', description: 'Conserves slight power on older laptops.' }
  ]
};

// Global Store State
interface StudioState {
  agents: Agent[];
  npcs: AmbientNPC[];
  tasks: Task[];
  decision: Decision | null;
  timeState: TimeState;
  selectedAgentId: string | null;
  selectedNpcId: string | null;
  isTaskBoardOpen: boolean;
  isDiffReviewOpen: boolean;
  isRosterOpen: boolean;
  activeGoalPrompt: string;
  totalTokens: number;
  totalSpend: number;
}

let globalState: StudioState = {
  agents: INITIAL_AGENTS,
  npcs: INITIAL_NPCS,
  tasks: INITIAL_TASKS,
  decision: INITIAL_DECISION,
  timeState: {
    gameHours: 10.5, // 10:30 AM (crisp morning)
    dayCount: 1,
    timeScale: 1, // normal speed
    phase: 'day',
    isNight: false,
    sunAngle: 45,
  },
  selectedAgentId: null,
  selectedNpcId: null,
  isTaskBoardOpen: false,
  isDiffReviewOpen: false,
  isRosterOpen: false,
  activeGoalPrompt: '',
  totalTokens: 151200,
  totalSpend: 0.45,
};

// Listeners
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach(l => l());
}

export function useAgentStore() {
  const [state, setState] = useState<StudioState>(globalState);

  useEffect(() => {
    const listener = () => setState({ ...globalState });
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    ...state,
    // Actions
    selectAgent: (id: string | null) => {
      globalState.selectedAgentId = id;
      notify();
    },
    selectNpc: (id: string | null) => {
      globalState.selectedNpcId = id;
      notify();
    },
    setTaskBoardOpen: (open: boolean) => {
      globalState.isTaskBoardOpen = open;
      notify();
    },
    setDiffReviewOpen: (open: boolean) => {
      globalState.isDiffReviewOpen = open;
      notify();
    },
    setRosterOpen: (open: boolean) => {
      globalState.isRosterOpen = open;
      notify();
    },
    setTimeScale: (scale: number) => {
      globalState.timeState.timeScale = scale;
      notify();
    },
    resolveDecision: (optionAction: string) => {
      if (globalState.decision) {
        const agent = globalState.agents.find(a => a.id === globalState.decision?.agentId);
        if (agent) {
          agent.status = 'typing';
          agent.targetPosition = LOCATIONS[`DESK_${agent.deskId}` as keyof typeof LOCATIONS] || LOCATIONS.DESK_1;
          agent.speechBubble = { text: 'Approved!', icon: 'check', expiresAt: Date.now() + 4000 };
          agent.terminalLogs.push(`[Decision] Decision approved: ${optionAction}. Resuming implementation.`);
        }
        globalState.decision = null;
        notify();
      }
    },
    approveDiffReview: (taskId: string) => {
      const task = globalState.tasks.find(t => t.id === taskId);
      if (task) {
        task.status = 'done';
        const agent = globalState.agents.find(a => a.id === task.assigneeId);
        if (agent) {
          agent.status = 'idle';
          agent.speechBubble = { text: 'Merged!', icon: 'git-merge', expiresAt: Date.now() + 4000 };
          agent.terminalLogs.push(`[Git] Pull Request #${Math.floor(Math.random() * 80 + 10)} successfully merged into main.`);
        }
      }
      globalState.isDiffReviewOpen = false;
      notify();
    },
    petPet: (npcId: string) => {
      const pet = globalState.npcs.find(n => n.id === npcId);
      if (pet) {
        pet.interactionCount++;
        pet.speechBubble = { text: '❤ Woof!', icon: 'heart', expiresAt: Date.now() + 5000 };
        // Boost agents morale
        globalState.agents.forEach(a => {
          a.cpuUsage = Math.min(100, a.cpuUsage + 5);
        });
        notify();
      }
    },
    interactNpc: (npcId: string) => {
      const npc = globalState.npcs.find(n => n.id === npcId);
      if (npc) {
        npc.interactionCount++;
        const nextLine = npc.dialogueLines[npc.interactionCount % npc.dialogueLines.length];
        npc.speechBubble = { text: nextLine, expiresAt: Date.now() + 6000 };
        globalState.selectedNpcId = npcId;
        notify();
      }
    },
    submitGoalPrompt: (promptText: string) => {
      if (!promptText.trim()) return;
      globalState.activeGoalPrompt = promptText;
      
      // Antigravity AI Orchestration
      const antigravity = globalState.agents.find(a => a.id === 'antigravity');
      if (antigravity) {
        antigravity.status = 'typing';
        antigravity.cpuUsage = 88;
        antigravity.speechBubble = { text: 'Goal Dispatched!', icon: 'zap', expiresAt: Date.now() + 5000 };
        antigravity.terminalLogs.push(`[Goal Received] "${promptText}"`);
        antigravity.terminalLogs.push('[Antigravity] Synthesizing architectural plan and dispatching team...');
      }

      // Dispatch Orion to lead
      const orion = globalState.agents.find(a => a.id === 'orion');
      if (orion) {
        orion.status = 'typing';
        orion.cpuUsage = 92;
        orion.speechBubble = { text: 'Executing Tasks...', icon: 'code', expiresAt: Date.now() + 5000 };
        orion.terminalLogs.push(`[Orion] Received blueprint from Antigravity: "${promptText}"`);
        orion.terminalLogs.push('[Orion] Generating sub-tasks across Frontend, Backend, and DevOps...');
      }

      // Add a dynamic task
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: promptText.length > 35 ? promptText.slice(0, 32) + '...' : promptText,
        description: `Autonomous task dispatched from goal prompt: ${promptText}`,
        status: 'in_progress',
        assigneeId: 'nova',
        priority: 'high',
        diff: {
          file: 'src/features/newGoalFeature.ts',
          additions: 140,
          deletions: 12,
          diffContent: `+ // Goal: ${promptText}\n+ export function executeFeature() { return true; }`
        }
      };
      globalState.tasks.unshift(newTask);

      const nova = globalState.agents.find(a => a.id === 'nova');
      if (nova) {
        nova.status = 'typing';
        nova.currentTaskId = newTask.id;
        nova.speechBubble = { text: 'Coding feature...', icon: 'code', expiresAt: Date.now() + 4000 };
        nova.terminalLogs.push(`[Nova] Started working on task: ${newTask.title}`);
      }

      notify();
    },
    addCustomAgent: (name: string, role: AgentRole, modelTier: 'flash' | 'pro') => {
      const deskNum = (globalState.agents.length % 5) + 1;
      const newAgent: Agent = {
        id: `agent-${Date.now()}`,
        name,
        role,
        status: 'idle',
        deskId: deskNum,
        avatarColor: '#38bdf8',
        outfitColor: '#0f172a',
        hairColor: '#e2e8f0',
        terminalLogs: [`[System] Agent ${name} onboarded as ${role}.`],
        cpuUsage: 10,
        tokenUsage: 0,
        gitBranch: `feat/${name.toLowerCase()}-work`,
        position: { ...LOCATIONS[`DESK_${deskNum}` as keyof typeof LOCATIONS] || LOCATIONS.DESK_1 },
        facing: 'se',
        modelTier,
        nightOwl: Math.random() > 0.5,
        walkSpeed: 1.2,
      };
      globalState.agents.push(newAgent);
      notify();
    }
  };
}

// Global simulation ticker (runs in background for realistic autonomous living world)
export function updateStudioSimulation(deltaTimeMs: number) {
  const ts = globalState.timeState;
  if (ts.timeScale === 0) return; // paused

  // Asymmetric Day/Night Progression per user specification:
  // Daytime (06:00 to 20:00) moves at normal pace
  // Nighttime (20:00 to 06:00) moves 2.5x faster!
  const isNightTime = ts.gameHours >= 20 || ts.gameHours < 6;
  const speedMultiplier = isNightTime ? 2.5 : 1.0;
  
  // Advance in-game hours (1 second real time ≈ 0.05 game hours at 1x)
  const hourStep = (deltaTimeMs / 1000) * 0.06 * ts.timeScale * speedMultiplier;
  ts.gameHours = (ts.gameHours + hourStep) % 24;
  if (ts.gameHours < hourStep) {
    ts.dayCount++;
  }

  // Calculate phase
  if (ts.gameHours >= 5 && ts.gameHours < 8) {
    ts.phase = 'dawn';
    ts.isNight = false;
  } else if (ts.gameHours >= 8 && ts.gameHours < 17) {
    ts.phase = 'day';
    ts.isNight = false;
  } else if (ts.gameHours >= 17 && ts.gameHours < 20) {
    ts.phase = 'dusk';
    ts.isNight = false;
  } else {
    ts.phase = 'night';
    ts.isNight = true;
  }

  // Sun angle calculation (for cast shadows)
  ts.sunAngle = ((ts.gameHours - 6) / 14) * Math.PI; // 0 at dawn, PI/2 at noon, PI at dusk

  // Agent Token and CPU activity
  globalState.agents.forEach(agent => {
    if (agent.status === 'typing' || agent.status === 'testing') {
      agent.tokenUsage += Math.floor(Math.random() * 8 + 3);
      globalState.totalTokens += Math.floor(Math.random() * 8 + 3);
      globalState.totalSpend = +(globalState.totalTokens * 0.000003).toFixed(4);
    }
  });

  // Movement interpolation towards targetPosition
  const moveEntity = (entity: { position: { x: number; y: number; z: number }; targetPosition?: { x: number; y: number; z: number }; facing: 'se' | 'sw' | 'ne' | 'nw'; walkSpeed: number }) => {
    if (!entity.targetPosition) return;
    const dx = entity.targetPosition.x - entity.position.x;
    const dy = entity.targetPosition.y - entity.position.y;
    const dz = entity.targetPosition.z - entity.position.z;
    const dist = Math.hypot(dx, dy, dz);

    if (dist < 2) {
      entity.position.x = entity.targetPosition.x;
      entity.position.y = entity.targetPosition.y;
      entity.position.z = entity.targetPosition.z;
      entity.targetPosition = undefined;
    } else {
      const step = entity.walkSpeed * (deltaTimeMs / 16.6);
      entity.position.x += (dx / dist) * Math.min(step, dist);
      entity.position.y += (dy / dist) * Math.min(step, dist);
      entity.position.z += (dz / dist) * Math.min(step, dist);

      // Facing
      if (Math.abs(dx) > Math.abs(dy)) {
        entity.facing = dx > 0 ? 'se' : 'nw';
      } else {
        entity.facing = dy > 0 ? 'sw' : 'ne';
      }
    }
  };

  globalState.agents.forEach(moveEntity);
  globalState.npcs.forEach(moveEntity);

  // Expire speech bubbles
  const now = Date.now();
  globalState.agents.forEach(a => {
    if (a.speechBubble && a.speechBubble.expiresAt < now) {
      a.speechBubble = undefined;
    }
  });
  globalState.npcs.forEach(n => {
    if (n.speechBubble && n.speechBubble.expiresAt < now) {
      n.speechBubble = undefined;
    }
  });

  // Periodic Autonomous Wandering / Idle Routine (Every ~8-12 seconds)
  if (Math.random() < 0.008) {
    const idleAgents = globalState.agents.filter(a => a.status === 'idle');
    if (idleAgents.length > 0) {
      const agent = idleAgents[Math.floor(Math.random() * idleAgents.length)];
      if (ts.isNight && !agent.nightOwl) {
        // Sleep on upper lounge sofa
        agent.targetPosition = LOCATIONS.UPPER_LOUNGE_SOFA;
        agent.speechBubble = { text: 'zzz', icon: 'moon', expiresAt: now + 6000 };
      } else {
        // Random activity: coffee or water or bleachers
        const choices = [LOCATIONS.PANTRY_COFFEE, LOCATIONS.WATER_COOLER, LOCATIONS.BLEACHER_SEATING];
        const dest = choices[Math.floor(Math.random() * choices.length)];
        agent.targetPosition = dest;
        agent.speechBubble = { text: 'Coffee break', icon: 'coffee', expiresAt: now + 5000 };
      }
    }
  }

  // Decision waiting routine: if a decision is pending, make the agent walk to Boss Door!
  if (globalState.decision) {
    const agent = globalState.agents.find(a => a.id === globalState.decision?.agentId);
    if (agent && agent.status !== 'waiting_decision') {
      agent.status = 'waiting_decision';
      agent.targetPosition = LOCATIONS.BOSS_DOOR_WAITING_MAT;
      agent.speechBubble = { text: 'Approval needed!', icon: 'alert', expiresAt: now + 60000 };
    }
  }

  notify();
}
