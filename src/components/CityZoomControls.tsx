import React, { useState } from 'react';
import { ZoomTier, DistrictId } from '../types/agent';
import { CITY_DISTRICTS } from '../engine/CityData';
import { 
  ChevronRight, 
  Waves
} from 'lucide-react';

interface CityZoomControlsProps {
  currentZoom: number;
  onSetZoom: (zoom: number) => void;
  onFlyToDistrict: (districtId: DistrictId) => void;
  onRecenterHQ: () => void;
  activeDistrictId: DistrictId;
}

export const CityZoomControls: React.FC<CityZoomControlsProps> = ({
  currentZoom,
  onSetZoom,
  onFlyToDistrict,
  onRecenterHQ,
  activeDistrictId,
}) => {
  const [isDistrictMenuOpen, setIsDistrictMenuOpen] = useState(false);

  // Compute Current Zoom Tier based on zoom ratio
  let currentTier: ZoomTier = 'Z2_STREET';
  let tierLabel = 'Z2 ถนน & สถาปัตยกรรม';
  if (currentZoom < 0.35) {
    currentTier = 'Z0_CITY';
    tierLabel = 'Z0 แผนผังทั้งเมือง';
  } else if (currentZoom < 0.75) {
    currentTier = 'Z1_DISTRICT';
    tierLabel = 'Z1 ย่าน & ชายฝั่ง';
  } else if (currentZoom < 1.25) {
    currentTier = 'Z2_STREET';
    tierLabel = 'Z2 ถนน & สถาปัตยกรรม';
  } else if (currentZoom < 1.85) {
    currentTier = 'Z3_CUTAWAY';
    tierLabel = 'Z3 อาคารตัดขวาง (Cutaway)';
  } else {
    currentTier = 'Z4_INTERIOR';
    tierLabel = 'Z4 ภายในสตูดิโอ (AI Agents)';
  }

  const activeDistrict = CITY_DISTRICTS.find(d => d.id === activeDistrictId) || CITY_DISTRICTS[0];

  return (
    <div className="absolute top-14 sm:top-16 left-2 sm:left-4 z-30 flex flex-col space-y-2 pointer-events-none select-none">
      {/* 1. Breadcrumb Trail & Quick District Switcher */}
      <div className="pointer-events-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-studio-dark/90 border border-studio-border backdrop-blur-md shadow-lg text-xs font-medium">
        <button 
          onClick={() => onSetZoom(0.22)}
          className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
          title="Zoom to Full City View (Z0)"
        >
          <Waves className="w-3.5 h-3.5 text-sky-400" />
          <span>AriseCity</span>
        </button>

        <ChevronRight className="w-3 h-3 text-slate-600" />

        {/* District Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsDistrictMenuOpen(!isDistrictMenuOpen)}
            className="flex items-center space-x-1 px-1.5 py-0.5 rounded-md hover:bg-studio-surface text-slate-200 hover:text-catch-yellow transition-colors"
          >
            <span className="font-semibold">{activeDistrict.name.split(' & ')[0]}</span>
            <span className="text-[10px] text-slate-500">▼</span>
          </button>

          {/* District Dropdown Menu */}
          {isDistrictMenuOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-studio-dark/95 border border-studio-border rounded-xl shadow-2xl p-1.5 backdrop-blur-xl z-50 flex flex-col space-y-1">
              <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-studio-border/50">
                เลือกย่านเมืองริมทะเล (Fly to District)
              </div>
              {CITY_DISTRICTS.map((district) => {
                const isCurrent = district.id === activeDistrictId;
                return (
                  <button
                    key={district.id}
                    onClick={() => {
                      onFlyToDistrict(district.id);
                      setIsDistrictMenuOpen(false);
                    }}
                    className={`flex items-start space-x-2.5 px-2 py-1.5 rounded-lg text-left transition-all ${
                      isCurrent 
                        ? 'bg-studio-surface text-catch-yellow border border-catch-yellow/30' 
                        : 'hover:bg-studio-surface/80 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="text-base mt-0.5">{district.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate">{district.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{district.nameThai}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <ChevronRight className="w-3 h-3 text-slate-600" />

        {/* Specific Room / Landmark context */}
        <button 
          onClick={onRecenterHQ}
          className="text-catch-yellow font-semibold hover:underline"
          title="Center on Arise HQ"
        >
          {currentZoom >= 1.25 ? 'Arise HQ Floor 02' : 'Arise Studio Core'}
        </button>
      </div>

      {/* 2. 5-Scale Zoom Mode Bar (Z0 to Z4) */}
      <div className="pointer-events-auto flex items-center space-x-1 p-1 rounded-xl bg-studio-dark/90 border border-studio-border backdrop-blur-md shadow-lg text-[11px] font-mono">
        <button
          onClick={() => onSetZoom(0.22)}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            currentTier === 'Z0_CITY'
              ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/30'
              : 'text-slate-400 hover:text-white hover:bg-studio-surface'
          }`}
          title="Z0: Macro City Vector Map"
        >
          Z0 ทั้งเมือง
        </button>

        <button
          onClick={() => onSetZoom(0.5)}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            currentTier === 'Z1_DISTRICT'
              ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-studio-surface'
          }`}
          title="Z1: District & Coastal View"
        >
          Z1 ย่าน
        </button>

        <button
          onClick={() => onSetZoom(0.95)}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            currentTier === 'Z2_STREET'
              ? 'bg-catch-yellow text-black font-bold shadow-md shadow-yellow-500/30'
              : 'text-slate-400 hover:text-white hover:bg-studio-surface'
          }`}
          title="Z2: Street & Building Facades"
        >
          Z2 ถนน
        </button>

        <button
          onClick={() => onSetZoom(1.4)}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            currentTier === 'Z3_CUTAWAY'
              ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-studio-surface'
          }`}
          title="Z3: Building Cutaway Peeling"
        >
          Z3 ตัดขวาง
        </button>

        <button
          onClick={() => onSetZoom(2.2)}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            currentTier === 'Z4_INTERIOR'
              ? 'bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-studio-surface'
          }`}
          title="Z4: Interior Workspace & AI Agents"
        >
          Z4 ภายใน
        </button>

        {/* Current Zoom Indicator */}
        <div className="pl-2 pr-1.5 py-0.5 text-[10px] text-slate-400 border-l border-studio-border">
          <span title={tierLabel}>{currentZoom.toFixed(2)}x • {tierLabel.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  );
};
