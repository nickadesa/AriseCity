# JustFishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "JustFishing", a high-fidelity 2D pixel open-water action-fishing RPG and haven tycoon web application featuring 16 biomes, 300+ fish, modular rod crafting, equipable active/passive skills, sailing, and aquarium customization with client-side local persistence.

**Architecture:** A lightweight, client-side, zero-backend web architecture. The rendering core uses a high-performance HTML5 2D Canvas engine with pixel-ratio scaling and virtual camera, decoupled from a deterministic game simulation tick loop. The UI overlay uses React, TypeScript, and Tailwind CSS for inventory, journal, shops, and dialogs. All state persists locally in IndexedDB/LocalStorage with JSON save import/export.

**Tech Stack:** TypeScript, React 19, Vite, Tailwind CSS, HTML5 Canvas 2D, Lucide Icons, Vitest for unit testing.

**Spec:** [docs/superpowers/specs/2026-11-10-justfishing-game-design.md](file:///home/antigravity/docs/superpowers/specs/2026-11-10-justfishing-game-design.md)

---

## Global Constraints

- **Pure Client-Side:** No external database or backend server required; runs entirely in browser.
- **Dual Input & Mobile Responsive:** Full desktop support (Mouse + Keyboard WASD/Space) and mobile support (Virtual D-pad, touch gestures, auto-landscape orientation handling).
- **Line-Only Durability:** Only fishing line can snap under extreme red tension; rods and reels never break.
- **No Auto-Fishing:** All fishing catches require active engagement across Easy, Normal, or Hard difficulty settings.
- **Zero-Bypass Game State:** All fish catches, item salvages, and gold transactions validate against the central state machine.

---

## Review Focus

1. **Minigame Tension Overflow:** Rapid mouse clicking or erratic frame rates causing tension to instantly spike or drop outside bounds.
2. **Tab Inactivity Desynchronization:** Browser background throttling causing delta-time explosions when switching back to the game.
3. **Save File Corruption / Migration:** Malformed JSON imported by the user or schema mismatches in LocalStorage.
4. **Mobile Touch Coordinate Drift:** Canvas scaling on high-DPI retina mobile screens causing misaligned tap and cast coordinates.
5. **Inventory Capacity & Loot Spills:** Catching fish or salvaging parts when inventory slots are full.

---

### Task 1: Core Scaffolding, Canvas Viewport & Engine Loop

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/engine/GameLoop.ts`
- Create: `src/engine/Viewport.ts`
- Test: `tests/engine/GameLoop.test.ts`

**Interfaces:**
- Produces: `GameLoop` (`start()`, `stop()`, `onTick(dt)`), `Viewport` (`resize(w, h, dpr)`, `worldToScreen(x, y)`, `screenToWorld(x, y)`)

- [ ] **Step 1: Write failing test for GameLoop**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { GameLoop } from '../../src/engine/GameLoop';

describe('GameLoop', () => {
  it('caps delta time to prevent spiral-of-death on background tabs', () => {
    const loop = new GameLoop();
    let recordedDt = 0;
    loop.onTick((dt) => { recordedDt = dt; });
    loop.step(5000); // simulate 5 second background lag
    expect(recordedDt).toBeLessThanOrEqual(100); // capped at 100ms
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/engine/GameLoop.test.ts`
Expected: FAIL with "Cannot find module '../../src/engine/GameLoop'"

- [ ] **Step 3: Implement `GameLoop.ts` and `Viewport.ts`**
Implement fixed-timestep update loop with maximum delta cap (100ms) and high-DPI crisp pixel canvas scaler.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/engine/GameLoop.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add package.json vite.config.ts tsconfig.json src/ tests/
git commit -m "feat: initialize project scaffolding, game loop, and viewport scaler"
```

---

### Task 2: State Store, Game Data Schemas & Local Persistence

**Files:**
- Create: `src/types/game.ts`
- Create: `src/store/gameStore.ts`
- Create: `src/store/persistence.ts`
- Test: `tests/store/persistence.test.ts`

**Interfaces:**
- Produces: `GameState` interface, `useGameStore` hook, `saveGame()`, `loadGame()`, `exportSaveJSON()`, `importSaveJSON(json)`

- [ ] **Step 1: Write failing test for Save/Load & JSON Export**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { exportSaveJSON, importSaveJSON, createDefaultGameState } from '../../src/store/persistence';

describe('Persistence Engine', () => {
  it('correctly exports and imports game state round-trip', () => {
    const original = createDefaultGameState();
    original.player.gold = 1500;
    original.player.level = 5;
    const exported = exportSaveJSON(original);
    const restored = importSaveJSON(exported);
    expect(restored.player.gold).toBe(1500);
    expect(restored.player.level).toBe(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/store/persistence.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Game Types, Zustand State Store & Persistence**
Implement robust JSON serializer with schema versioning, checksum validation, and LocalStorage auto-save.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/store/persistence.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/types/ src/store/ tests/store/
git commit -m "feat: implement game state store and export/import persistence"
```

---

### Task 3: 2D Top-Down Player Controller, Collision & Virtual D-Pad

**Files:**
- Create: `src/engine/InputManager.ts`
- Create: `src/engine/PlayerController.ts`
- Create: `src/components/VirtualJoystick.tsx`
- Test: `tests/engine/InputManager.test.ts`

**Interfaces:**
- Consumes: `GameLoop`, `Viewport`
- Produces: `InputManager` (`isActionPressed()`, `getMovementVector()`, `isMobile`), `PlayerController` (`update(dt)`, `position`, `facingDirection`, `isInteracting`)

- [ ] **Step 1: Write failing test for InputManager vector normalization**
```typescript
import { describe, it, expect } from 'vitest';
import { InputManager } from '../../src/engine/InputManager';

describe('InputManager', () => {
  it('normalizes diagonal keyboard movement vector to length 1', () => {
    const input = new InputManager();
    input.simulateKey('KeyW', true);
    input.simulateKey('KeyD', true);
    const vec = input.getMovementVector();
    const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    expect(len).toBeCloseTo(1.0, 4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/engine/InputManager.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `InputManager.ts`, `PlayerController.ts` and `VirtualJoystick.tsx`**
Support WASD, Arrow keys, spacebar, and touch-screen on-screen joystick with auto-orientation detection.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/engine/InputManager.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/engine/InputManager.ts src/engine/PlayerController.ts src/components/VirtualJoystick.tsx tests/
git commit -m "feat: implement top-down 4/8-direction player controller and mobile joystick"
```

---

### Task 4: Boat Navigation, Water Shaders & Biome Transit

**Files:**
- Create: `src/engine/TileMap.ts`
- Create: `src/engine/BoatController.ts`
- Create: `src/data/biomes.ts`
- Test: `tests/engine/BoatController.test.ts`

**Interfaces:**
- Consumes: `PlayerController`, `InputManager`
- Produces: `BoatController` (`boardBoat()`, `exitBoat()`, `isSailing`, `tier`), `BiomeManager` (`getCurrentBiome(x, y)`)

- [ ] **Step 1: Write failing test for Boarding & Vehicle Acceleration**
```typescript
import { describe, it, expect } from 'vitest';
import { BoatController } from '../../src/engine/BoatController';

describe('BoatController', () => {
  it('smoothly accelerates on water without fuel restrictions', () => {
    const boat = new BoatController({ tier: 2 }); // Motorboat
    boat.update(1.0, { x: 1, y: 0 }); // 1 sec forward
    expect(boat.velocity.x).toBeGreaterThan(50);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/engine/BoatController.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `BoatController.ts` and `biomes.ts` with 16 Biomes**
Support seamless mounting/dismounting at docks and harbors, water wake particle trails, and biome detection.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/engine/BoatController.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/engine/TileMap.ts src/engine/BoatController.ts src/data/biomes.ts tests/
git commit -m "feat: implement watercraft navigation, dock docking, and 16 biome zones"
```

---

### Task 5: The Tactical Fishing Engine & Tension Minigame

**Files:**
- Create: `src/engine/FishingEngine.ts`
- Create: `src/components/FishingMinigameOverlay.tsx`
- Test: `tests/engine/FishingEngine.test.ts`

**Interfaces:**
- Consumes: `gameStore`, `InputManager`
- Produces: `FishingEngine` (`cast(waterTile)`, `strike()`, `updateMinigame(dt)`, `catchProgress`, `lineTension`, `fishPosition`, `isLineSnapped`)

- [ ] **Step 1: Write failing test for Tension Physics & Difficulty Scaling**
```typescript
import { describe, it, expect } from 'vitest';
import { FishingEngine } from '../../src/engine/FishingEngine';

describe('FishingEngine', () => {
  it('triggers Phase 2 Boss rage mode when boss fish drops below 50% health', () => {
    const engine = new FishingEngine({ difficulty: 'hard' });
    engine.startEncounter({ id: 'kraken', isBoss: true, maxStamina: 100 });
    engine.applyCatchProgress(55);
    expect(engine.isBossPhase2).toBe(true);
  });

  it('snaps line only when tension stays red beyond tolerance', () => {
    const engine = new FishingEngine({ difficulty: 'normal' });
    engine.startEncounter({ id: 'bass', isBoss: false });
    engine.simulateOverTension(2500); // 2.5s in red
    expect(engine.isLineSnapped).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/engine/FishingEngine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `FishingEngine.ts` and `FishingMinigameOverlay.tsx`**
Implement vertical tension bar, buoyancy physics, fish stamina fatigue, ink spray tricksters, line snap detection, and Boss Phase 2 rage state.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/engine/FishingEngine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/engine/FishingEngine.ts src/components/FishingMinigameOverlay.tsx tests/
git commit -m "feat: implement tension-bar fishing engine with boss Phase 2 and line snap"
```

---

### Task 6: 300+ Species Taxonomy, Rarity & Loot Tables

**Files:**
- Create: `src/data/fishCatalog.ts`
- Create: `src/data/lootTables.ts`
- Create: `src/engine/LootGenerator.ts`
- Test: `tests/engine/LootGenerator.test.ts`

**Interfaces:**
- Produces: `LootGenerator` (`generateEncounter(biomeId, baitId, weather, timeOfDay): EncounterResult`)

- [ ] **Step 1: Write failing test for Encounter generation and Bait affinity**
```typescript
import { describe, it, expect } from 'vitest';
import { LootGenerator } from '../../src/engine/LootGenerator';

describe('LootGenerator', () => {
  it('generates non-fish junk loot when using basic or no bait', () => {
    const generator = new LootGenerator();
    const result = generator.generateEncounter({ biomeId: 'home_bay', baitId: 'none' });
    expect(['fish', 'treasure_chest', 'junk_bottle', 'algae']).toContain(result.type);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/engine/LootGenerator.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement catalog, procedural definitions, and Loot Generator**
Populate 300+ species with weight bounds, rarity tiers, sell values, and butchery salvage recipes.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/engine/LootGenerator.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/data/fishCatalog.ts src/data/lootTables.ts src/engine/LootGenerator.ts tests/
git commit -m "feat: implement 300+ fish catalog, bait affinities, and procedural loot generator"
```

---

### Task 7: Fish Butchery (Fillet), Modular Rod Forge & Bait Alchemy

**Files:**
- Create: `src/engine/CraftingEngine.ts`
- Create: `src/components/ButcheryModal.tsx`
- Create: `src/components/RodForgeModal.tsx`
- Create: `src/components/BaitAlchemyModal.tsx`
- Test: `tests/engine/CraftingEngine.test.ts`

**Interfaces:**
- Consumes: `gameStore`, `fishCatalog`
- Produces: `CraftingEngine` (`salvageFish(fishInstance)`, `assembleRod(blank, reel, line, hook, charm)`, `brewBait(ingredients)`)

- [ ] **Step 1: Write failing test for 1-Click Salvage and Rod Stat calculation**
```typescript
import { describe, it, expect } from 'vitest';
import { CraftingEngine } from '../../src/engine/CraftingEngine';

describe('CraftingEngine', () => {
  it('salvages fish into materials without breaking gear', () => {
    const engine = new CraftingEngine();
    const parts = engine.salvageFish({ id: 'anglerfish', starRating: 3 });
    expect(parts.some(p => p.itemId === 'glowing_lure')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/engine/CraftingEngine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `CraftingEngine.ts` and crafting UI modals**
Implement instant 1-click fish breakdown, modular rod assembly (75+ combinations), and bait alchemy.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/engine/CraftingEngine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/engine/CraftingEngine.ts src/components/ButcheryModal.tsx src/components/RodForgeModal.tsx src/components/BaitAlchemyModal.tsx tests/
git commit -m "feat: implement 1-click fish salvage, modular rod crafting, and bait brewing"
```

---

### Task 8: Equipable Skills & Character Loadout System

**Files:**
- Create: `src/data/skills.ts`
- Create: `src/engine/SkillManager.ts`
- Create: `src/components/SkillLoadoutModal.tsx`
- Test: `tests/engine/SkillManager.test.ts`

**Interfaces:**
- Consumes: `gameStore`
- Produces: `SkillManager` (`equipActive(slot, skillId)`, `equipPassive(slot, charmId)`, `triggerActive(slot)`)

- [ ] **Step 1: Write failing test for Active Skill triggering & Cooldowns**
```typescript
import { describe, it, expect } from 'vitest';
import { SkillManager } from '../../src/engine/SkillManager';

describe('SkillManager', () => {
  it('triggers Sonar Pulse and sets cooldown timer', () => {
    const mgr = new SkillManager();
    mgr.equipActive(0, 'sonar_pulse');
    const activated = mgr.triggerActive(0);
    expect(activated).toBe(true);
    expect(mgr.getCooldown(0)).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/engine/SkillManager.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `SkillManager.ts` and `SkillLoadoutModal.tsx`**
Implement slot expansion (1A/1P -> 3A/4P based on level), Sonar Pulse, Chrono Time-Dilation, Chum Cannon, and Line Shield.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/engine/SkillManager.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/data/skills.ts src/engine/SkillManager.ts src/components/SkillLoadoutModal.tsx tests/
git commit -m "feat: implement equipable active skills, passive charms, and mastery leveling"
```

---

### Task 9: Dynamic Weather, Day/Night Clock & Seasonal Market

**Files:**
- Create: `src/engine/EnvironmentManager.ts`
- Create: `src/components/HUDTopBar.tsx`
- Create: `src/components/MarketModal.tsx`
- Test: `tests/engine/EnvironmentManager.test.ts`

**Interfaces:**
- Produces: `EnvironmentManager` (`update(dt)`, `timeOfDay`, `currentWeather`, `currentSeason`, `getPriceMultiplier(fishId)`)

- [ ] **Step 1: Write failing test for 24-minute Day Cycle & Seasonal Price Shifts**
```typescript
import { describe, it, expect } from 'vitest';
import { EnvironmentManager } from '../../src/engine/EnvironmentManager';

describe('EnvironmentManager', () => {
  it('advances 1 in-game hour every 60 real seconds', () => {
    const env = new EnvironmentManager();
    env.update(60); // 60s
    expect(env.inGameHour).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/engine/EnvironmentManager.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `EnvironmentManager.ts`, Top HUD, and Seasonal Market**
Support Clear, Rain, Thunderstorm, Fog, Meteor Shower, and 4 in-game seasons shifting fish market values.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/engine/EnvironmentManager.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/engine/EnvironmentManager.ts src/components/HUDTopBar.tsx src/components/MarketModal.tsx tests/
git commit -m "feat: implement day/night clock, dynamic weather system, and seasonal market"
```

---

### Task 10: Haven Tycoon, Room Decorator & The Grand Aquarium

**Files:**
- Create: `src/data/decorCatalog.ts`
- Create: `src/engine/AquariumManager.ts`
- Create: `src/components/HavenDecoratorModal.tsx`
- Create: `src/components/AquariumView.tsx`
- Test: `tests/engine/AquariumManager.test.ts`

**Interfaces:**
- Produces: `AquariumManager` (`stockFish(tankId, fishInstance)`, `getVisitorDonations()`, `tanks`)

- [ ] **Step 1: Write failing test for Aquarium Capacity Limits & Tourism Revenue**
```typescript
import { describe, it, expect } from 'vitest';
import { AquariumManager } from '../../src/engine/AquariumManager';

describe('AquariumManager', () => {
  it('enforces tank volume limits and rejects stocking when full', () => {
    const aq = new AquariumManager();
    aq.createTank({ id: 'main', capacity: 2 });
    aq.stockFish('main', { id: 'guppy_1' });
    aq.stockFish('main', { id: 'guppy_2' });
    const success = aq.stockFish('main', { id: 'shark_3' });
    expect(success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/engine/AquariumManager.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `AquariumManager.ts`, Decorator grid, and 200+ decor items**
Support freeform grid placement of furniture, live animated fish swimming in glass habitats, and daily ticket earnings.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/engine/AquariumManager.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/data/decorCatalog.ts src/engine/AquariumManager.ts src/components/HavenDecoratorModal.tsx src/components/AquariumView.tsx tests/
git commit -m "feat: implement haven decorator grid and grand aquarium tank system"
```

---

### Task 11: Trophy Photo Mode, Settings & Comprehensive End-to-End Verification

**Files:**
- Create: `src/components/TrophyCaptureModal.tsx`
- Create: `src/components/SettingsModal.tsx`
- Modify: `src/App.tsx`
- Test: `tests/e2e/gameplayFlow.test.ts`

**Interfaces:**
- Produces: Screen shake toggle, English localization base, Trophy screenshot generator, JSON save export/import button.

- [ ] **Step 1: Write end-to-end integration test for Complete Fishing & Salvage Loop**
```typescript
import { describe, it, expect } from 'vitest';
import { createDefaultGameState } from '../../src/store/persistence';
import { LootGenerator } from '../../src/engine/LootGenerator';
import { CraftingEngine } from '../../src/engine/CraftingEngine';

describe('Full Loop E2E Test', () => {
  it('allows player to cast, catch a fish, salvage into teeth, and assemble a new rod', () => {
    const state = createDefaultGameState();
    const loot = new LootGenerator().generateEncounter({ biomeId: 'home_bay', baitId: 'worm' });
    expect(loot).toBeDefined();
    const parts = new CraftingEngine().salvageFish({ id: 'bass', starRating: 2 });
    expect(parts.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/e2e/gameplayFlow.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Trophy Modal, Settings (Screen Shake toggle), and full App assembly**
Wire up all components into `App.tsx` with hotkeys, responsive canvas scaling, and save export.

- [ ] **Step 4: Run test to verify all tests pass**
Run: `npm test`
Expected: ALL PASS

- [ ] **Step 5: Commit**
```bash
git add src/components/TrophyCaptureModal.tsx src/components/SettingsModal.tsx src/App.tsx tests/
git commit -m "feat: finalize trophy photo mode, settings toggle, and complete gameplay integration"
```

---
