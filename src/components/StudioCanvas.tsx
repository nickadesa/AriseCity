import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAgentStore, updateStudioSimulation, LOCATIONS } from '../store/agentStore';
import { IsometricRenderer } from '../engine/IsometricRenderer';
import { IsometricEngine } from '../engine/IsometricEngine';
import { Plus, Minus, Maximize2 } from 'lucide-react';

interface StudioCanvasProps {
  onOpenDeskModal: (agentId: string) => void;
  onOpenTaskBoard: () => void;
  onOpenDecisionModal: () => void;
  onOpenDiffReview: () => void;
  onOpenNpcModal: (npcId: string) => void;
}

const getInitialZoom = () => {
  if (typeof window === 'undefined') return 1.0;
  if (window.innerWidth < 640) return 0.7;
  if (window.innerWidth < 1024) return 0.9;
  return 1.15;
};

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  onOpenDeskModal,
  onOpenTaskBoard,
  onOpenDecisionModal,
  onOpenDiffReview,
  onOpenNpcModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const store = useAgentStore();

  // Camera State
  const [zoom, setZoom] = useState(getInitialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastTouchDistanceRef = useRef<number | null>(null);

  // Recenter camera exactly onto the studio
  const recenter = useCallback((targetZoom?: number) => {
    const z = targetZoom ?? zoom;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const centerIso = IsometricEngine.worldToIso(145, 155, 20);
    setPan({
      x: w / 2 - centerIso.x * z,
      y: h / 2 - centerIso.y * z,
    });
    if (targetZoom !== undefined) {
      setZoom(targetZoom);
    }
  }, [zoom]);

  // Initialize camera centered on lower engineering cluster
  useEffect(() => {
    const initZ = getInitialZoom();
    setZoom(initZ);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const centerIso = IsometricEngine.worldToIso(145, 155, 20);
    setPan({
      x: w / 2 - centerIso.x * initZ,
      y: h / 2 - centerIso.y * initZ,
    });

    const handleResize = () => {
      // Keep view centered on resize
      const curW = window.innerWidth;
      const curH = window.innerHeight;
      setPan({
        x: curW / 2 - centerIso.x * zoom,
        y: curH / 2 - centerIso.y * zoom,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const renderLoop = (currentTime: number) => {
      const deltaTime = Math.min(currentTime - lastTime, 100);
      lastTime = currentTime;

      // Update living simulation
      updateStudioSimulation(deltaTime);

      // Handle DPI and canvas dimensions
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Render 2.5D Isometric World
      IsometricRenderer.render(
        ctx,
        displayWidth,
        displayHeight,
        pan.x,
        pan.y,
        zoom,
        store.timeState,
        store.agents,
        store.npcs,
        store.selectedAgentId,
        store.selectedNpcId
      );

      ctx.restore();

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [pan, zoom, store]);

  // Click & Hit Detection
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      // If was dragging significantly, ignore click
      if (Math.hypot(e.movementX, e.movementY) > 3) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Convert click to world coordinates at ground level (z = 0) and mezzanine (z = 48)
      const worldGround = IsometricEngine.screenToWorld(clickX, clickY, pan.x, pan.y, zoom, 0);
      const worldMezzanine = IsometricEngine.screenToWorld(clickX, clickY, pan.x, pan.y, zoom, 48);

      // 1. Check click on Boss Door Waiting Mat
      const bossDist = Math.hypot(
        worldMezzanine.x - LOCATIONS.BOSS_DOOR_WAITING_MAT.x,
        worldMezzanine.y - LOCATIONS.BOSS_DOOR_WAITING_MAT.y
      );
      if (bossDist < 25) {
        onOpenDecisionModal();
        return;
      }

      // 2. Check click on Task Wall (Kanban)
      const taskWallDist = Math.hypot(
        worldGround.x - LOCATIONS.TASK_BOARD.x,
        worldGround.y - LOCATIONS.TASK_BOARD.y
      );
      if (taskWallDist < 30) {
        onOpenTaskBoard();
        return;
      }

      // 3. Check click on Diff Review Station
      const diffDist = Math.hypot(
        worldGround.x - LOCATIONS.DIFF_STATION.x,
        worldGround.y - LOCATIONS.DIFF_STATION.y
      );
      if (diffDist < 25) {
        onOpenDiffReview();
        return;
      }

      // 4. Check click on Agents
      for (const agent of store.agents) {
        const agentDist = Math.hypot(
          worldGround.x - agent.position.x,
          worldGround.y - agent.position.y
        );
        if (agentDist < 20) {
          store.selectAgent(agent.id);
          onOpenDeskModal(agent.id);
          return;
        }
      }

      // 5. Check click on NPCs
      for (const npc of store.npcs) {
        // filter schedule
        if (npc.schedule === 'night' && !store.timeState.isNight) continue;
        if (npc.schedule === 'day' && store.timeState.isNight) continue;

        const checkZ = npc.position.z > 20 ? worldMezzanine : worldGround;
        const npcDist = Math.hypot(checkZ.x - npc.position.x, checkZ.y - npc.position.y);
        if (npcDist < 22) {
          if (npc.type === 'pet') {
            store.petPet(npc.id);
          } else {
            store.interactNpc(npc.id);
          }
          onOpenNpcModal(npc.id);
          return;
        }
      }

      // 6. Check click on Desks 1 to 5
      const deskLocations = [
        { id: 1, agentId: 'orion', loc: LOCATIONS.DESK_1 },
        { id: 2, agentId: 'nova', loc: LOCATIONS.DESK_2 },
        { id: 3, agentId: 'cipher', loc: LOCATIONS.DESK_3 },
        { id: 4, agentId: 'vortex', loc: LOCATIONS.DESK_4 },
        { id: 5, agentId: 'echo', loc: LOCATIONS.DESK_5 },
      ];

      for (const desk of deskLocations) {
        const dDist = Math.hypot(worldGround.x - desk.loc.x, worldGround.y - desk.loc.y);
        if (dDist < 22) {
          store.selectAgent(desk.agentId);
          onOpenDeskModal(desk.agentId);
          return;
        }
      }
    },
    [pan, zoom, store, onOpenDeskModal, onOpenTaskBoard, onOpenDecisionModal, onOpenDiffReview, onOpenNpcModal]
  );

  // Mouse Drag Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(prev => Math.max(0.5, Math.min(2.4, prev * zoomFactor)));
  };

  // Touch Support (Pinch zoom & touch drag)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
      lastTouchDistanceRef.current = null;
    } else if (e.touches.length === 2) {
      isDraggingRef.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistanceRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDraggingRef.current) {
      setPan({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    } else if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const factor = newDist / lastTouchDistanceRef.current;
      setZoom(prev => Math.max(0.5, Math.min(2.4, prev * factor)));
      lastTouchDistanceRef.current = newDist;
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    lastTouchDistanceRef.current = null;
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block touch-none"
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Floating Camera Controls (Bottom Right) */}
      <div className="absolute bottom-14 right-3 z-30 flex flex-col space-y-1.5 bg-studio-dark/90 backdrop-blur-md border border-studio-border rounded-xl p-1 shadow-xl">
        <button
          onClick={() => setZoom(z => Math.min(2.4, Number((z + 0.15).toFixed(2))))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-studio-surface text-slate-300 hover:text-white transition-colors active:scale-95"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.4, Number((z - 0.15).toFixed(2))))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-studio-surface text-slate-300 hover:text-white transition-colors active:scale-95"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => recenter(getInitialZoom())}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-studio-surface text-catch-yellow hover:text-yellow-300 transition-colors active:scale-95"
          title="Recenter Studio View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
