export type AgentRole = 'copilot' | 'lead' | 'frontend' | 'backend' | 'devops' | 'qa';

export type AgentStatus = 
  | 'idle' 
  | 'typing' 
  | 'testing' 
  | 'waiting_decision' 
  | 'review' 
  | 'coffee' 
  | 'resting' 
  | 'walking';

export type Facing = 'se' | 'sw' | 'ne' | 'nw';

export interface SpeechBubble {
  text: string;
  icon?: string;
  expiresAt: number;
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  deskId: number;
  avatarColor: string;
  outfitColor: string;
  hairColor: string;
  currentTaskId?: string;
  terminalLogs: string[];
  cpuUsage: number;
  tokenUsage: number;
  gitBranch: string;
  position: { x: number; y: number; z: number };
  targetPosition?: { x: number; y: number; z: number };
  facing: Facing;
  thought?: string;
  speechBubble?: SpeechBubble;
  modelTier: 'flash' | 'pro' | 'inherit';
  nightOwl: boolean;
  walkSpeed: number;
}

export type NPCType = 'courier' | 'client' | 'technician' | 'cleaner' | 'security' | 'pet';

export interface AmbientNPC {
  id: string;
  name: string;
  type: NPCType;
  position: { x: number; y: number; z: number };
  targetPosition?: { x: number; y: number; z: number };
  facing: Facing;
  schedule: 'day' | 'evening' | 'night' | 'always';
  dialogueLines: string[];
  thought: string;
  speechBubble?: SpeechBubble;
  interactionCount: number;
  isNightOnly?: boolean;
  walkSpeed: number;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId?: string;
  priority: 'high' | 'medium' | 'low';
  diff?: {
    file: string;
    additions: number;
    deletions: number;
    diffContent: string;
  };
  testResults?: {
    passed: number;
    failed: number;
  };
}

export interface DecisionOption {
  label: string;
  action: string;
  description?: string;
  recommended?: boolean;
}

export interface Decision {
  id: string;
  agentId: string;
  agentName: string;
  question: string;
  context: string;
  options: DecisionOption[];
  resolved?: boolean;
}

export type DayNightPhase = 'dawn' | 'day' | 'dusk' | 'night';

export interface TimeState {
  gameHours: number; // 0.00 to 24.00
  dayCount: number;
  timeScale: number; // 0 = pause, 1 = normal, 2 = fast, 5 = ultra
  phase: DayNightPhase;
  isNight: boolean;
  sunAngle: number;
}

export type ClickableTarget = 
  | { type: 'desk'; deskId: number; agentId?: string }
  | { type: 'boss_door' }
  | { type: 'task_board' }
  | { type: 'diff_station' }
  | { type: 'water_cooler' }
  | { type: 'coffee_bar' }
  | { type: 'npc'; npcId: string }
  | { type: 'agent'; agentId: string };
