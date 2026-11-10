import { GameState, CaughtFishInstance, FishDefinition, GameDifficulty } from '../types/game';
import { INITIAL_FISH_CATALOG } from '../data/fishCatalog';

const SAVE_STORAGE_KEY = 'justfishing_save_v1';

export const DEFAULT_STATE: GameState = {
  player: {
    name: 'Captain Fisher',
    level: 1,
    exp: 0,
    gold: 250,
    havenExpansionTier: 1,
    activeRodId: 'bamboo_starter',
    activeBaitId: 'earthworm',
    activeSkillSlots: ['sonar_pulse', null, null],
    passiveCharmSlots: ['iron_wrists', null, null, null],
  },
  time: {
    day: 1,
    hour: 7, // 7 AM dawn
    minute: 0,
    season: 'spring',
    weather: 'sunny',
  },
  inventory: [
    {
      id: 'bait_worm_1',
      type: 'bait',
      name: 'Earthworm Bait',
      quantity: 15,
      rarity: 'common',
      value: 5,
    },
    {
      id: 'mat_driftwood_1',
      type: 'material',
      name: 'Weathered Driftwood',
      quantity: 4,
      rarity: 'common',
      value: 12,
    }
  ],
  maxInventorySlots: 24,
  fishdexCaughtIds: [],
  fishRecords: {},
  settings: {
    difficulty: 'normal',
    screenShake: true,
    soundEnabled: true,
    language: 'en',
  }
};

export class GameStore {
  private state: GameState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadLocalSave() || DEFAULT_STATE;
  }

  public getState(): GameState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
    this.saveLocal();
  }

  // --- SAVE & LOAD ---
  private saveLocal() {
    try {
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }

  private loadLocalSave(): GameState | null {
    try {
      const data = localStorage.getItem(SAVE_STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as GameState;
      }
    } catch (e) {
      console.warn('Could not load localStorage save', e);
    }
    return null;
  }

  public exportJSON(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr) as GameState;
      if (parsed.player && parsed.inventory) {
        this.state = parsed;
        this.notify();
        return true;
      }
    } catch (e) {
      console.error('Invalid save file format', e);
    }
    return false;
  }

  public resetGame() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.notify();
  }

  // --- GAME ACTIONS ---
  public addGold(amount: number) {
    this.state.player.gold += amount;
    this.notify();
  }

  public setDifficulty(diff: GameDifficulty) {
    this.state.settings.difficulty = diff;
    this.notify();
  }

  public toggleScreenShake() {
    this.state.settings.screenShake = !this.state.settings.screenShake;
    this.notify();
  }

  public tickClock(realSecondsDelta: number) {
    // 24 minutes real time = 24 in-game hours (1 real minute = 1 in-game hour)
    // 1 real second = 1 in-game minute
    const inGameMinutesToAdd = Math.floor(realSecondsDelta);
    if (inGameMinutesToAdd <= 0) return;

    let min = this.state.time.minute + inGameMinutesToAdd;
    let hr = this.state.time.hour;
    let day = this.state.time.day;

    while (min >= 60) {
      min -= 60;
      hr += 1;
    }
    while (hr >= 24) {
      hr -= 24;
      day += 1;
    }

    this.state.time.minute = min;
    this.state.time.hour = hr;
    this.state.time.day = day;

    this.notify();
  }

  public recordCatch(fish: FishDefinition, weightKg: number, lengthCm: number): CaughtFishInstance {
    // Determine stars
    const weightRatio = (weightKg - fish.minWeightKg) / (fish.maxWeightKg - fish.minWeightKg);
    let stars: 1 | 2 | 3 | 4 = 1;
    if (weightRatio > 0.85) stars = 4;
    else if (weightRatio > 0.55) stars = 3;
    else if (weightRatio > 0.25) stars = 2;

    const value = Math.round(fish.basePrice * (1 + (stars - 1) * 0.4) * (weightKg / fish.minWeightKg));

    const instance: CaughtFishInstance = {
      instanceId: `catch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fishId: fish.id,
      name: fish.name,
      rarity: fish.rarity,
      weightKg,
      lengthCm,
      stars,
      caughtAt: Date.now(),
      value,
    };

    // Update Fishdex
    if (!this.state.fishdexCaughtIds.includes(fish.id)) {
      this.state.fishdexCaughtIds.push(fish.id);
    }

    // Update records
    const cur = this.state.fishRecords[fish.id] || { maxWeight: 0, maxLength: 0, count: 0 };
    this.state.fishRecords[fish.id] = {
      maxWeight: Math.max(cur.maxWeight, weightKg),
      maxLength: Math.max(cur.maxLength, lengthCm),
      count: cur.count + 1,
    };

    // Add to inventory
    this.state.inventory.push({
      id: instance.instanceId,
      type: 'fish',
      name: fish.name,
      quantity: 1,
      rarity: fish.rarity,
      value,
      fishData: instance,
    });

    // Add EXP
    this.state.player.exp += fish.difficultyRating * 4;
    if (this.state.player.exp >= this.state.player.level * 150) {
      this.state.player.exp -= this.state.player.level * 150;
      this.state.player.level += 1;
    }

    this.notify();
    return instance;
  }

  public sellItem(inventoryItemId: string) {
    const idx = this.state.inventory.findIndex((i) => i.id === inventoryItemId);
    if (idx !== -1) {
      const item = this.state.inventory[idx];
      this.state.player.gold += item.value * item.quantity;
      this.state.inventory.splice(idx, 1);
      this.notify();
    }
  }

  public salvageFish(inventoryItemId: string) {
    const idx = this.state.inventory.findIndex((i) => i.id === inventoryItemId);
    if (idx !== -1) {
      const item = this.state.inventory[idx];
      if (item.type === 'fish' && item.fishData) {
        const def = INITIAL_FISH_CATALOG.find((f) => f.id === item.fishData!.fishId);
        if (def) {
          // Remove fish
          this.state.inventory.splice(idx, 1);
          // Add salvage material
          const existingMat = this.state.inventory.find((i) => i.id === def.salvageReward.partId);
          if (existingMat) {
            existingMat.quantity += def.salvageReward.quantity;
          } else {
            this.state.inventory.push({
              id: def.salvageReward.partId,
              type: 'material',
              name: def.salvageReward.partName,
              quantity: def.salvageReward.quantity,
              rarity: def.rarity,
              value: Math.round(def.basePrice * 0.4),
            });
          }
          this.notify();
        }
      }
    }
  }
}

export const gameStore = new GameStore();
