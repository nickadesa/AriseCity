import React, { useRef, useEffect, useState } from 'react';
import { getStudioState, updateStudioSimulation } from '../store/agentStore';
import { ThreeCityEngine } from '../engine/three/ThreeCityEngine';
import { 
  RotateCcw, 
  RotateCw, 
  Plus, 
  Minus, 
  Eye, 
  X
} from 'lucide-react';

interface ThreeStudioCanvasProps {
  onOpenDeskModal: (agentId: string) => void;
  onOpenTaskBoard: () => void;
  onOpenDecisionModal: () => void;
}

export const ThreeStudioCanvas: React.FC<ThreeStudioCanvasProps> = ({
  onOpenDeskModal,
  onOpenTaskBoard,
  onOpenDecisionModal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ThreeCityEngine | null>(null);

  const [isInspectingBuilding, setIsInspectingBuilding] = useState<boolean>(false);
  const [activeFloor, setActiveFloor] = useState<1 | 2 | 3 | 4>(1);

  // Gesture state
  const isDraggingRef = useRef(false);
  const lastPointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointerMap = useRef<Map<number, [number, number]>>(new Map());
  const lastPinchDist = useRef<number | null>(null);

  const callbacksRef = useRef({
    onOpenDeskModal,
    onOpenTaskBoard,
    onOpenDecisionModal,
  });
  callbacksRef.current = {
    onOpenDeskModal,
    onOpenTaskBoard,
    onOpenDecisionModal,
  };

  // Initialize Three.js Engine ONCE on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any previous elements in container
    container.innerHTML = '';

    const engine = new ThreeCityEngine(container, {
      onOpenDeskModal: (id) => callbacksRef.current.onOpenDeskModal(id),
      onOpenTaskBoard: () => callbacksRef.current.onOpenTaskBoard(),
      onOpenDecisionModal: () => callbacksRef.current.onOpenDecisionModal(),
      onBuildingInspectChange: (inspecting) => setIsInspectingBuilding(inspecting),
    });
    engineRef.current = engine;

    // Handle Window Resize
    const handleResize = () => {
      if (!container || !engineRef.current) return;
      engineRef.current.handleResize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Keyboard Shortcuts (Q / E for 90-degree stepped rotation)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'q' || e.key === 'Q') engineRef.current?.cameraRig.rotateLeft();
      if (e.key === 'e' || e.key === 'E') engineRef.current?.cameraRig.rotateRight();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Main 60 FPS Render Loop
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Update AI agents simulation
      updateStudioSimulation(deltaTime * 1000);

      // Access latest state directly without triggering React re-renders!
      const state = getStudioState();
      engine.render(deltaTime, state.timeState, state.agents);

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      engine.destroy();
      engineRef.current = null;
    };
  }, []); // Run ONCE on mount!

  // Pointer & Touch Controls
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    container.setPointerCapture(e.pointerId);

    pointerMap.current.set(e.pointerId, [e.clientX, e.clientY]);
    isDraggingRef.current = false;
    lastPointerPos.current = { x: e.clientX, y: e.clientY };

    if (pointerMap.current.size === 2) {
      const pts = Array.from(pointerMap.current.values());
      lastPinchDist.current = Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const engine = engineRef.current;
    if (!engine) return;

    if (pointerMap.current.size === 1) {
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;
      if (Math.hypot(dx, dy) > 3) {
        isDraggingRef.current = true;
      }
      engine.cameraRig.pan(dx, dy, window.innerHeight);
      lastPointerPos.current = { x: e.clientX, y: e.clientY };
    } else if (pointerMap.current.size === 2) {
      pointerMap.current.set(e.pointerId, [e.clientX, e.clientY]);
      const pts = Array.from(pointerMap.current.values());
      const dist = Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
      if (lastPinchDist.current && lastPinchDist.current > 0) {
        engine.cameraRig.zoomBy(dist / lastPinchDist.current);
      }
      lastPinchDist.current = dist;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerMap.current.delete(e.pointerId);
    if (pointerMap.current.size < 2) {
      lastPinchDist.current = null;
    }

    // If was not a drag, trigger Raycast Click!
    if (!isDraggingRef.current) {
      const engine = engineRef.current;
      if (engine && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        engine.handlePointerClick(
          e.clientX - rect.left,
          e.clientY - rect.top,
          rect.width,
          rect.height
        );
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const engine = engineRef.current;
    if (!engine) return;
    engine.cameraRig.zoomBy(Math.exp(-e.deltaY * 0.0015));
  };

  // Floor switcher
  const selectFloor = (floor: 1 | 2 | 3 | 4) => {
    setActiveFloor(floor);
    engineRef.current?.setFloor(floor);
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-900">
      {/* Three.js WebGL Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Building Cutaway Inspection Banner */}
      {isInspectingBuilding && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-studio-dark/95 border border-catch-yellow/60 shadow-xl backdrop-blur-md animate-in fade-in duration-200">
          <Eye className="w-4 h-4 text-catch-yellow" />
          <span className="text-xs font-semibold text-white">
            Inspecting Arise HQ #BOXSPACES (Cutaway View)
          </span>
          <button
            onClick={() => engineRef.current?.toggleBuildingInspection(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Exit Inspection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Bottom Left Controls: 90° Stepped Rotation & Floor Switcher */}
      <div className="absolute bottom-14 left-4 z-30 flex flex-col space-y-2 pointer-events-auto">
        {/* Floor Selection (1F Ground / 2F Executive / 3F AI Dev Lab / Rooftop) */}
        {isInspectingBuilding && (
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-studio-dark/95 border border-studio-border backdrop-blur-md shadow-lg">
            {(
              [
                { floor: 1, label: '1F Ground' },
                { floor: 2, label: '2F Executive' },
                { floor: 3, label: '3F AI Dev Lab' },
                { floor: 4, label: 'Rooftop' },
              ] as const
            ).map(({ floor, label }) => (
              <button
                key={floor}
                onClick={() => selectFloor(floor)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFloor === floor
                    ? 'bg-catch-yellow text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* 90-Degree Stepped Rotation Controls */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-studio-dark/95 border border-studio-border backdrop-blur-md shadow-lg">
          <button
            onClick={() => engineRef.current?.cameraRig.rotateLeft()}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Rotate Left 90° (Q)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-700" />
          <button
            onClick={() => engineRef.current?.cameraRig.rotateRight()}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Rotate Right 90° (E)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Bottom Right Controls: Zoom + / - */}
      <div className="absolute bottom-14 right-4 z-30 flex flex-col space-y-1.5 pointer-events-auto">
        <div className="flex flex-col p-1 rounded-xl bg-studio-dark/95 border border-studio-border backdrop-blur-md shadow-lg">
          <button
            onClick={() => engineRef.current?.cameraRig.zoomBy(1.25)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="w-full h-px bg-slate-700" />
          <button
            onClick={() => engineRef.current?.cameraRig.zoomBy(0.8)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
