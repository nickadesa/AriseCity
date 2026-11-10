import React from 'react';
import { GameState, PlayerInventoryItem } from '../types/game';
import { gameStore } from '../store/gameStore';
import { X, Backpack, DollarSign, Scissors } from 'lucide-react';

interface InventoryModalProps {
  state: GameState;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ state, onClose }) => {
  const { inventory, maxInventorySlots } = state;

  const handleSell = (item: PlayerInventoryItem) => {
    gameStore.sellItem(item.id);
  };

  const handleSalvage = (item: PlayerInventoryItem) => {
    gameStore.salvageFish(item.id);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-haven-dark border-4 border-haven-border rounded-lg shadow-pixel-lg max-w-xl w-full h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-haven-panel border-b-2 border-haven-border flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Backpack className="w-5 h-5 text-haven-gold" />
            <h2 className="font-pixel text-sm text-haven-gold tracking-wide">
              INVENTORY BAG ({inventory.length}/{maxInventorySlots})
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-haven-border rounded text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {inventory.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-pixel text-xs">
              Your bag is empty! Cast your line to catch fish and treasure.
            </div>
          ) : (
            inventory.map((item) => (
              <div
                key={item.id}
                className="bg-haven-panel/80 border-2 border-haven-border rounded-lg p-3 flex justify-between items-center gap-3 shadow-pixel"
              >
                {/* Item Icon & Details */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded flex items-center justify-center text-xl shrink-0">
                    {item.type === 'fish' ? '🐟' : item.type === 'material' ? '⚙️' : '🪱'}
                  </div>
                  <div>
                    <h4 className="font-pixel text-xs text-white">
                      {item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}
                    </h4>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {item.rarity} {item.type}
                      {item.fishData && ` • ${item.fishData.weightKg.toFixed(1)}kg (${'★'.repeat(item.fishData.stars)})`}
                    </p>
                  </div>
                </div>

                {/* Actions: Sell & 1-Click Fillet */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSell(item)}
                    className="flex items-center gap-1 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded font-pixel text-[10px] pixel-btn"
                    title="Sell item for Dev Gold"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>{item.value * item.quantity}G</span>
                  </button>

                  {item.type === 'fish' && (
                    <button
                      onClick={() => handleSalvage(item)}
                      className="flex items-center gap-1 bg-sky-700 hover:bg-sky-600 text-white px-3 py-1.5 rounded font-pixel text-[10px] pixel-btn"
                      title="1-Click Fillet into Rod Crafting parts"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>FILLET</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
