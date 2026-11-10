import React from 'react';
import { GameState, PlayerInventoryItem } from '../types/game';
import { gameStore } from '../store/gameStore';
import { X, Backpack, DollarSign, Scissors, Fish, Wrench, Bug, Sparkles } from 'lucide-react';

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

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'fish': return <Fish className="w-5 h-5 text-sky-400" />;
      case 'material': return <Wrench className="w-5 h-5 text-amber-400" />;
      case 'bait': return <Bug className="w-5 h-5 text-emerald-400" />;
      default: return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#0d1322] border-2 border-slate-700/80 rounded-2xl shadow-2xl max-w-xl w-full h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900/80 border-b border-slate-700/60 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Backpack className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-pixel text-sm text-white tracking-wide">
                INVENTORY SATCHEL
              </h2>
              <div className="text-[11px] text-slate-400">
                Capacity: <span className="text-amber-400 font-pixel">{inventory.length}</span> / {maxInventorySlots} slots
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-pixel text-xs text-center">
              <Fish className="w-12 h-12 mb-3 opacity-30" />
              Your inventory is empty.<br />Cast your line into the waters to gather fish & materials!
            </div>
          ) : (
            inventory.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/70 border border-slate-700/70 hover:border-slate-600 rounded-xl p-3.5 flex justify-between items-center gap-3 transition-colors shadow-sm"
              >
                {/* Item Icon & Details */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#070e1b] border border-slate-700/80 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                    {getItemIcon(item.type)}
                  </div>
                  <div>
                    <h4 className="font-pixel text-xs text-white">
                      {item.name} {item.quantity > 1 ? `×${item.quantity}` : ''}
                    </h4>
                    <p className="text-[11px] text-slate-400 capitalize mt-0.5">
                      {item.rarity} {item.type}
                      {item.fishData && ` • ${item.fishData.weightKg.toFixed(1)}kg (${'★'.repeat(item.fishData.stars)})`}
                    </p>
                  </div>
                </div>

                {/* Actions: Sell & 1-Click Fillet */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSell(item)}
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl font-pixel text-[10px] transition-transform active:scale-95 shadow-sm"
                    title="Sell item for Gold"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>{item.value * item.quantity}G</span>
                  </button>

                  {item.type === 'fish' && (
                    <button
                      onClick={() => handleSalvage(item)}
                      className="flex items-center gap-1.5 bg-sky-700 hover:bg-sky-600 text-white px-3 py-2 rounded-xl font-pixel text-[10px] transition-transform active:scale-95 shadow-sm"
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
