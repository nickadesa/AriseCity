import React, { useState, useEffect } from 'react';
import { GameState, FishDefinition, CaughtFishInstance } from './types/game';
import { gameStore } from './store/gameStore';
import { INITIAL_FISH_CATALOG } from './data/fishCatalog';
import { GameCanvas } from './components/GameCanvas';
import { FishingMinigame } from './components/FishingMinigame';
import { CatchShowcaseModal } from './components/CatchShowcaseModal';
import { HUD } from './components/HUD';
import { Hotbar } from './components/Hotbar';
import { FishdexModal } from './components/FishdexModal';
import { InventoryModal } from './components/InventoryModal';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(gameStore.getState());
  const [activeModal, setActiveModal] = useState<'inventory' | 'fishdex' | 'settings' | null>(null);
  const [isCasting, setIsCasting] = useState(false);
  const [activeFishEncounter, setActiveFishEncounter] = useState<FishDefinition | null>(null);
  const [recentCatch, setRecentCatch] = useState<{
    fish: FishDefinition;
    instance: CaughtFishInstance;
    isRecord: boolean;
  } | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [screenShakeActive, setScreenShakeActive] = useState(false);

  // Subscribe to central store
  useEffect(() => {
    return gameStore.subscribe(() => {
      setGameState({ ...gameStore.getState() });
    });
  }, []);

  // In-Game Day/Night clock timer (1 real second = 1 in-game minute)
  useEffect(() => {
    const interval = setInterval(() => {
      gameStore.tickClock(1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard Hotkeys (B = Bag, D = Fishdex, Esc = Close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeFishEncounter) return; // Don't trigger shortcuts during minigame

      if (e.code === 'KeyB') {
        setActiveModal((prev) => (prev === 'inventory' ? null : 'inventory'));
      } else if (e.code === 'KeyD') {
        setActiveModal((prev) => (prev === 'fishdex' ? null : 'fishdex'));
      } else if (e.code === 'Escape') {
        setActiveModal(null);
        setRecentCatch(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFishEncounter]);

  const triggerShake = () => {
    if (gameState.settings.screenShake) {
      setScreenShakeActive(true);
      setTimeout(() => setScreenShakeActive(false), 350);
    }
  };

  // Handle Player Casting Line into water
  const handleCast = (_targetX: number, _targetY: number) => {
    if (activeFishEncounter || recentCatch) return;
    setIsCasting(true);

    // Bite delay
    const delay = 1200 + Math.random() * 1400;
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * INITIAL_FISH_CATALOG.length);
      const chosenFish = INITIAL_FISH_CATALOG[randomIndex];
      setActiveFishEncounter(chosenFish);
      triggerShake();
    }, delay);
  };

  // Catch Success -> Open CatchShowcaseModal
  const handleCatchSuccess = (fish: FishDefinition) => {
    setActiveFishEncounter(null);
    setIsCasting(false);
    triggerShake();

    const weight = fish.minWeightKg + Math.random() * (fish.maxWeightKg - fish.minWeightKg);
    const length = Math.round(weight * 7.5 + 16 + Math.random() * 8);

    const prevRecord = gameState.fishRecords[fish.id]?.maxWeight || 0;
    const isRecord = weight > prevRecord;

    const caughtInstance = gameStore.recordCatch(fish, weight, length);

    setRecentCatch({
      fish,
      instance: caughtInstance,
      isRecord,
    });
  };

  // Catch Fail (Line Snapped or Fish Escaped)
  const handleCatchFail = (reason: 'snapped' | 'escaped') => {
    setActiveFishEncounter(null);
    setIsCasting(false);
    triggerShake();

    if (reason === 'snapped') {
      setAlertMessage('💥 LINE SNAPPED! Sustained tension in the red zone.');
    } else {
      setAlertMessage('💨 THE FISH ESCAPED! Better luck on the next cast.');
    }
    setTimeout(() => setAlertMessage(null), 3500);
  };

  return (
    <div className="relative w-screen h-screen bg-[#070b14] overflow-hidden flex flex-col font-sans select-none">
      {/* Top HUD */}
      <HUD state={gameState} onOpenSettings={() => setActiveModal('settings')} />

      {/* Main 2D Pixel Canvas Viewport */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <GameCanvas
          isCasting={isCasting}
          onCast={handleCast}
          screenShake={screenShakeActive}
          hour={gameState.time.hour}
        />

        {/* Fishing Minigame Overlay when fish bites */}
        {activeFishEncounter && (
          <FishingMinigame
            fish={activeFishEncounter}
            difficulty={gameState.settings.difficulty}
            onCatchSuccess={handleCatchSuccess}
            onCatchFail={handleCatchFail}
          />
        )}

        {/* Fullscreen Catch Showcase Celebration Modal */}
        {recentCatch && (
          <CatchShowcaseModal
            fish={recentCatch.fish}
            catchInstance={recentCatch.instance}
            isNewRecord={recentCatch.isRecord}
            onKeep={() => setRecentCatch(null)}
            onQuickSell={() => {
              gameStore.sellItem(recentCatch.instance.instanceId);
              setRecentCatch(null);
            }}
            onQuickSalvage={() => {
              gameStore.salvageFish(recentCatch.instance.instanceId);
              setRecentCatch(null);
            }}
          />
        )}

        {/* Failure / Warning Notification Toast */}
        {alertMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0d1322]/95 border-2 border-red-500/80 px-5 py-2.5 rounded-xl shadow-2xl text-red-300 font-pixel text-xs tracking-wide animate-bounce text-center max-w-sm">
            {alertMessage}
          </div>
        )}
      </main>

      {/* Bottom Hotbar */}
      <Hotbar
        state={gameState}
        onOpenInventory={() => setActiveModal('inventory')}
        onOpenFishdex={() => setActiveModal('fishdex')}
      />

      {/* Pop-up Modals */}
      {activeModal === 'inventory' && (
        <InventoryModal state={gameState} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'fishdex' && (
        <FishdexModal state={gameState} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'settings' && (
        <SettingsModal state={gameState} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
};

export default App;
