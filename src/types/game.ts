export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type GameDifficulty = 'easy' | 'normal' | 'hard';

export type WeatherType = 'sunny' | 'rainy' | 'stormy' | 'foggy' | 'meteorshower';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SalvagePart {
  id: string;
  name: string;
  type: 'fin' | 'tooth' | 'scale' | 'gland' | 'bone' | 'ore';
  quantity: number;
  icon: string;
}

export interface FishDefinition {
  id: string;
  name: string;
  category: 'freshwater' | 'saltwater' | 'abyssal' | 'volcanic' | 'cyber' | 'cosmic';
  biome: string;
  rarity: Rarity;
  minWeightKg: number;
  maxWeightKg: number;
  basePrice: number;
  difficultyRating: number; // 1-100
  stamina: number; // stamina before tired
  fightingPattern: 'steady' | 'dart' | 'diver' | 'thrash' | 'trickster';
  spriteResolution: '32x32' | '64x64';
  palette: string[]; // Primary, Secondary, Eye, Belly, Accent colors
  description: string;
  salvageReward: {
    partId: string;
    partName: string;
    quantity: number;
  };
}

export interface CaughtFishInstance {
  instanceId: string;
  fishId: string;
  name: string;
  rarity: Rarity;
  weightKg: number;
  lengthCm: number;
  stars: 1 | 2 | 3 | 4; // Quality rating
  caughtAt: number;
  value: number;
}

export interface RodDefinition {
  id: string;
  name: string;
  tier: number;
  durabilityType: 'line_only'; // Line can snap, rod never breaks
  maxTensionResistance: number;
  catchBarBonus: number;
  reelSpeed: number;
  specialPerk?: string;
  color: string;
}

export interface PlayerInventoryItem {
  id: string;
  type: 'fish' | 'material' | 'bait' | 'treasure';
  name: string;
  quantity: number;
  rarity: Rarity;
  value: number;
  fishData?: CaughtFishInstance;
  icon?: string;
}

export interface GameSettings {
  difficulty: GameDifficulty;
  screenShake: boolean;
  soundEnabled: boolean;
  language: 'en' | 'th';
}

export interface GameState {
  player: {
    name: string;
    level: number;
    exp: number;
    gold: number;
    havenExpansionTier: number;
    activeRodId: string;
    activeBaitId: string;
    activeSkillSlots: (string | null)[];
    passiveCharmSlots: (string | null)[];
  };
  time: {
    day: number;
    hour: number;
    minute: number;
    season: Season;
    weather: WeatherType;
  };
  inventory: PlayerInventoryItem[];
  maxInventorySlots: number;
  fishdexCaughtIds: string[];
  fishRecords: Record<string, { maxWeight: number; maxLength: number; count: number }>;
  settings: GameSettings;
}
