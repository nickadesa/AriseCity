import React, { useState, useEffect } from 'react';
import { GameState, FishDefinition } from './types/game';
import { gameStore } from './store/gameStore';
import { INITIAL_FISH_CATALOG } from './data/fishCatalog';
import { GameCanvas } from './components/GameCanvas';
import { FishingMinigame } from './components/FishingMinigame';
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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

  // Trigger temporary screen shake
  const triggerShake = () => {
    if (gameState.settings.screenShake) {
      setScreenShakeActive(true);
      setTimeout(() => setScreenShakeActive(false), 400);
    }
  };

  // Handle Player Casting Line into water
  const handleCast = (_targetX: number, _targetY: number) => {
    if (activeFishEncounter) return;
    setIsCasting(true);

    // Bite delay (1.2 to 2.5 seconds)
    const delay = 1200 + Math.random() * 1300;
    setTimeout(() => {
      // Pick random fish from catalog
      const randomIndex = Math.floor(Math.random() * INITIAL_FISH_CATALOG.length);
      const chosenFish = INITIAL_FISH_CATALOG[randomIndex];
      setActiveFishEncounter(chosenFish);
      triggerShake();
    }, delay);
  };

  // Catch Success
  const handleCatchSuccess = (fish: FishDefinition) => {
    setActiveFishEncounter(null);
    setIsCasting(false);
    triggerShake();

    // Calculate randomized weight & length
    const weight = fish.minWeightKg + Math.random() * (fish.maxWeightKg - fish.minWeightKg);
    const length = Math.round(weight * 8 + 15 + Math.random() * 10);
    const caught = gameStore.recordCatch(fish, weight, length);

    setToastMessage(`🎉 CAUGHT: ${fish.name}! ${caught.weightKg.toFixed(1)}kg (${'★'.repeat(caught.stars)}) +${caught.value}G value!`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Catch Fail (Line Snapped or Fish Escaped)
  const handleCatchFail = (reason: 'snapped' | 'escaped') => {
    setActiveFishEncounter(null);
    setIsCasting(false);
    triggerShake();

    if (reason === 'snapped') {
      setToastMessage('💥 LINE SNAPPED! The fish was pulling too hard in the red zone.');
    } else {
      setToastMessage('💨 THE FISH ESCAPED! Better luck on the next cast.');
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="relative w-screen h-screen bg-haven-dark overflow-hidden flex flex-col font-sans">
      {/* HUD Top Bar */}
      <HUD state={gameState} onOpenSettings={() => setActiveModal('settings')} />

      {/* Main 2D Pixel Canvas Viewport */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <GameCanvas
          isCasting={isCasting}
          onCast={handleCast}
          screenShake={screenShakeActive}
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

        {/* Catch / Alert Banner */}
        {toastMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-haven-dark border-2 border-haven-gold px-4 py-2.5 rounded-lg shadow-pixel text-haven-gold font-pixel text-xs tracking-wide animate-bounce text-center max-w-md">
            {toastMessage}
          </div>
        )}
      </main>

      {/* Hotbar Bottom Controls */}
      <Hotbar
        state={gameState}
        onOpenInventory={() => setActiveModal('inventory')}
        onOpenFishdex={() => setActiveModal('fishdex')}
      />

      {/* Modals */}
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
