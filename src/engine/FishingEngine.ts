import { FishDefinition, GameDifficulty } from '../types/game';

export interface MinigameState {
  isActive: boolean;
  fish: FishDefinition;
  catchProgress: number; // 0 - 100%
  fishY: number; // 0 (top) to 100 (bottom)
  barY: number; // 0 to 100
  barHeight: number; // Sweet-spot size
  lineTension: number; // 0 to 100 (Red danger > 85)
  timeInRedTension: number; // Milliseconds in red zone
  isLineSnapped: boolean;
  isCompleted: boolean;
  isEscaped: boolean;
  isBossPhase2: boolean;
  staminaRemaining: number;
  isFatigued: boolean;
  fatigueTimer: number;
}

export class FishingEngine {
  private state: MinigameState | null = null;
  private difficulty: GameDifficulty;
  private barVelocity = 0;
  private fishTargetY = 50;
  private fishDecisionTimer = 0;

  constructor(difficulty: GameDifficulty = 'normal') {
    this.difficulty = difficulty;
  }

  public setDifficulty(diff: GameDifficulty) {
    this.difficulty = diff;
  }

  public startEncounter(fish: FishDefinition): MinigameState {
    // Base sweet-spot size modified by difficulty
    let baseBarHeight = 24;
    if (this.difficulty === 'easy') baseBarHeight = 34;
    if (this.difficulty === 'hard') baseBarHeight = 18;

    this.state = {
      isActive: true,
      fish,
      catchProgress: 30, // Start with generous 30% progress
      fishY: 50,
      barY: 50,
      barHeight: baseBarHeight,
      lineTension: 20,
      timeInRedTension: 0,
      isLineSnapped: false,
      isCompleted: false,
      isEscaped: false,
      isBossPhase2: false,
      staminaRemaining: fish.stamina,
      isFatigued: false,
      fatigueTimer: 0
    };

    this.barVelocity = 0;
    this.fishTargetY = 50;
    this.fishDecisionTimer = 0;

    return { ...this.state };
  }

  public getState(): MinigameState | null {
    return this.state ? { ...this.state } : null;
  }

  /**
   * Main game physics tick (called every frame, e.g. 16.6ms)
   */
  public update(dtMs: number, isReelingInput: boolean): MinigameState | null {
    if (!this.state || !this.state.isActive) return null;

    const dt = Math.min(dtMs / 1000, 0.1); // Clamp to max 100ms
    const s = this.state;

    // 1. Check for Boss Phase 2 trigger
    if (s.fish.difficultyRating >= 80 && s.catchProgress >= 65 && !s.isBossPhase2) {
      s.isBossPhase2 = true;
      s.staminaRemaining += 80; // Second wind
    }

    // 2. Fish Stamina & Fatigue cycles
    if (s.isFatigued) {
      s.fatigueTimer -= dtMs;
      if (s.fatigueTimer <= 0) {
        s.isFatigued = false;
        s.staminaRemaining = s.fish.stamina * 0.7;
      }
    } else {
      s.staminaRemaining -= dtMs * 0.08;
      if (s.staminaRemaining <= 0) {
        s.isFatigued = true;
        s.fatigueTimer = 2200; // 2.2 seconds of tired swimming
      }
    }

    // 3. Fish AI movement
    this.fishDecisionTimer -= dt;
    if (this.fishDecisionTimer <= 0) {
      this.fishDecisionTimer = s.isFatigued ? 1.5 : (0.4 + Math.random() * 0.6);
      
      // Calculate new target position
      if (s.isBossPhase2) {
        // Erratic phase 2 jumps
        this.fishTargetY = Math.random() < 0.5 ? 15 : 85;
      } else if (s.fish.fightingPattern === 'dart') {
        this.fishTargetY = Math.random() * 90;
      } else if (s.fish.fightingPattern === 'diver') {
        this.fishTargetY = 60 + Math.random() * 35;
      } else {
        this.fishTargetY = 20 + Math.random() * 60;
      }
    }

    // Smooth fish velocity toward target
    const fishSpeed = s.isFatigued 
      ? 25 
      : (s.isBossPhase2 ? 140 : (40 + s.fish.difficultyRating * 0.9));
    
    const diff = this.fishTargetY - s.fishY;
    s.fishY += Math.sign(diff) * Math.min(Math.abs(diff), fishSpeed * dt);
    s.fishY = Math.max(5, Math.min(95, s.fishY));

    // 4. Player Green Bar Physics (Buoyancy & Gravity)
    const gravity = 220; // pulls down
    const reelLift = -320; // lifts up when input held
    
    if (isReelingInput) {
      this.barVelocity += reelLift * dt;
    } else {
      this.barVelocity += gravity * dt;
    }

    this.barVelocity = Math.max(-180, Math.min(180, this.barVelocity));
    s.barY += this.barVelocity * dt;

    // Bounce off edges
    if (s.barY < 0) {
      s.barY = 0;
      this.barVelocity = -this.barVelocity * 0.3;
    } else if (s.barY > 100 - s.barHeight) {
      s.barY = 100 - s.barHeight;
      this.barVelocity = -this.barVelocity * 0.3;
    }

    // 5. Overlap detection (Is fish inside green sweet-spot bar?)
    const halfFish = 3;
    const isInsideBar = 
      s.fishY + halfFish >= s.barY && 
      s.fishY - halfFish <= s.barY + s.barHeight;

    // 6. Catch Progress & Line Tension Calculation
    if (isInsideBar) {
      const catchRate = this.difficulty === 'easy' ? 24 : (this.difficulty === 'hard' ? 14 : 18);
      s.catchProgress += catchRate * dt;
      // Relieve tension when safely in sweet-spot
      s.lineTension = Math.max(10, s.lineTension - 35 * dt);
    } else {
      const dropRate = this.difficulty === 'easy' ? 8 : (this.difficulty === 'hard' ? 18 : 12);
      s.catchProgress -= dropRate * dt;
      // Building line tension when fighting outside bar
      s.lineTension = Math.min(100, s.lineTension + 45 * dt);
    }

    // 7. Red Zone Line Snap Tolerance
    const redThreshold = 85;
    const snapToleranceMs = this.difficulty === 'easy' ? 3500 : (this.difficulty === 'hard' ? 1300 : 2200);

    if (s.lineTension >= redThreshold) {
      s.timeInRedTension += dtMs;
      if (s.timeInRedTension >= snapToleranceMs) {
        s.isLineSnapped = true;
        s.isActive = false;
        return { ...s };
      }
    } else {
      s.timeInRedTension = Math.max(0, s.timeInRedTension - dtMs * 0.8);
    }

    // 8. Completion & Escape Check
    if (s.catchProgress >= 100) {
      s.catchProgress = 100;
      s.isCompleted = true;
      s.isActive = false;
    } else if (s.catchProgress <= 0) {
      s.catchProgress = 0;
      s.isEscaped = true;
      s.isActive = false;
    }

    return { ...s };
  }
}
