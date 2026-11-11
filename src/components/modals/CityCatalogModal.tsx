import React, { useState, useMemo } from 'react';
import { CatalogService, CatalogItem } from '../../engine/CatalogService';
import { 
  X, 
  Search, 
  Box, 
  Maximize2,
  Palette
} from 'lucide-react';

interface CityCatalogModalProps {
  onClose: () => void;
}

export const CityCatalogModal: React.FC<CityCatalogModalProps> = ({ onClose }) => {
  const categories = useMemo(() => CatalogService.getCategories(), []);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  const totalCount = useMemo(() => CatalogService.getTotalItemCount(), []);

  const filteredItems = useMemo(() => {
    return CatalogService.searchItems(
      searchQuery,
      selectedCategory === 'all' ? undefined : selectedCategory
    );
  }, [searchQuery, selectedCategory]);

  // Set initial selected item if none selected
  const activeItem = selectedItem || filteredItems[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] flex flex-col rounded-2xl bg-studio-dark/95 border border-studio-border shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-studio-border bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-catch-yellow/15 border border-catch-yellow/30 text-catch-yellow">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  AriseCity Asset Catalogs & Architecture Library
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-catch-yellow text-slate-950">
                  {totalCount} Total Items
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full coastal architectural typologies, dimetric furniture, landscape flora, and clean tech infrastructure
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-3 border-b border-studio-border bg-slate-900/30 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-catch-yellow text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              All Assets ({totalCount})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center space-x-1.5 transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-catch-yellow text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.title.split(' ')[0]}</span>
                <span className="text-[10px] opacity-75 font-mono">({cat.count})</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search items, tags, materials..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950/80 border border-studio-border text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-catch-yellow"
            />
          </div>
        </div>

        {/* Content Body: Left Item Grid + Right Item Inspector */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Grid */}
          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 content-start">
            {filteredItems.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                No catalog items found matching "{searchQuery}"
              </div>
            ) : (
              filteredItems.map(item => {
                const isSelected = activeItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800/90 border-catch-yellow shadow-md ring-1 ring-catch-yellow/50'
                        : 'bg-slate-900/40 border-studio-border hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-xs font-semibold text-white line-clamp-1">
                          {item.name}
                        </span>
                        {item.color_hex && (
                          <div 
                            className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0 mt-0.5"
                            style={{ backgroundColor: item.color_hex }}
                            title={`Color: ${item.color_hex}`}
                          />
                        )}
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        {item.id}
                      </div>

                      {item.material && (
                        <div className="text-[11px] text-slate-300 mt-1 flex items-center space-x-1">
                          <span className="text-slate-500">Material:</span>
                          <span className="capitalize">{item.material.replace(/_/g, ' ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                      {item.tile_footprint ? (
                        <span className="font-mono text-sky-400 flex items-center space-x-1">
                          <Maximize2 className="w-2.5 h-2.5" />
                          <span>{item.tile_footprint.width}×{item.tile_footprint.depth} tiles</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 capitalize">{item.category}</span>
                      )}

                      {item.variants && item.variants.length > 0 && (
                        <span className="text-amber-400 font-mono">
                          {item.variants.length} styles
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Inspector Sidebar */}
          {activeItem && (
            <div className="w-80 border-l border-studio-border bg-slate-900/70 p-4 flex flex-col justify-between overflow-y-auto hidden md:flex">
              <div className="space-y-4">
                {/* Visual Preview Box */}
                <div className="w-full h-36 rounded-xl bg-slate-950/80 border border-studio-border flex flex-col items-center justify-center relative overflow-hidden p-3 text-center">
                  {/* Subtle isometric grid preview background */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f5ba31_1px,transparent_1px)] [background-size:12px_12px]" />
                  
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 mb-2"
                    style={{ backgroundColor: activeItem.color_hex || '#38bdf8' }}
                  >
                    <Box className="w-8 h-8 text-white drop-shadow" />
                  </div>

                  <span className="text-xs font-bold text-white relative z-10 px-2 line-clamp-1">
                    {activeItem.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 relative z-10">
                    {activeItem.id}
                  </span>
                </div>

                {/* Specs List */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Category</span>
                    <span className="font-medium text-white capitalize">{activeItem.category.replace(/_/g, ' ')}</span>
                  </div>

                  {activeItem.tile_footprint && (
                    <div className="flex items-center justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Dimetric Footprint</span>
                      <span className="font-mono text-sky-400">
                        {activeItem.tile_footprint.width}w × {activeItem.tile_footprint.depth}d
                        {activeItem.tile_footprint.height_tiles ? ` × ${activeItem.tile_footprint.height_tiles}h` : ''}
                      </span>
                    </div>
                  )}

                  {activeItem.material && (
                    <div className="flex items-center justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Primary Material</span>
                      <span className="font-medium text-emerald-400 capitalize">{activeItem.material.replace(/_/g, ' ')}</span>
                    </div>
                  )}

                  {activeItem.tags && activeItem.tags.length > 0 && (
                    <div className="py-1">
                      <span className="text-slate-400 block mb-1.5">Tags</span>
                      <div className="flex flex-wrap gap-1">
                        {activeItem.tags.map(t => (
                          <span 
                            key={t}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeItem.variants && activeItem.variants.length > 0 && (
                    <div className="py-1">
                      <span className="text-slate-400 block mb-1.5 flex items-center space-x-1">
                        <Palette className="w-3 h-3 text-catch-yellow" />
                        <span>Style Variants ({activeItem.variants.length})</span>
                      </span>
                      <div className="space-y-1.5">
                        {activeItem.variants.map((v, i) => (
                          <div 
                            key={i}
                            className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-[11px]"
                          >
                            <span className="text-slate-200">{v.name}</span>
                            {v.color_hex && (
                              <div 
                                className="w-3 h-3 rounded-full border border-slate-600"
                                style={{ backgroundColor: v.color_hex }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer info in inspector */}
              <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono text-center">
                AriseCity Coastal Masterplan Spec v3.0
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
