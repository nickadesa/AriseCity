import React, { useRef, useEffect, useState } from 'react';
import { PixelRenderer } from '../engine/PixelRenderer';

interface GameCanvasProps {
  isCasting: boolean;
  onCast: (targetX: number, targetY: number) => void;
  screenShake: boolean;
  hour: number;
}

const VIRTUAL_WIDTH = 320;
const VIRTUAL_HEIGHT = 180;

interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  pulseSpeed: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ isCasting, onCast, screenShake, hour }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [bobberPos, setBobberPos] = useState<{ x: number; y: number } | null>(null);
  const firefliesRef = useRef<Firefly[]>([]);

  // Initialize atmospheric fireflies / embers
  useEffect(() => {
    const list: Firefly[] = [];
    for (let i = 0; i < 18; i++) {
      list.push({
        x: Math.random() * VIRTUAL_WIDTH,
        y: Math.random() * VIRTUAL_HEIGHT,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.1 - Math.random() * 0.2,
        alpha: Math.random(),
        pulseSpeed: 0.03 + Math.random() * 0.04,
      });
    }
    firefliesRef.current = list;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    const render = () => {
      tick++;

      ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      ctx.imageSmoothingEnabled = false;

      // 1. Water Background with Layered Depth Shading
      const waterA = PixelRenderer.getTileSprite('water', 0);
      const waterB = PixelRenderer.getTileSprite('water', 1);

      for (let x = 0; x < VIRTUAL_WIDTH; x += 16) {
        for (let y = 0; y < VIRTUAL_HEIGHT; y += 16) {
          const wavePhase = Math.sin((tick * 0.03) + (x * 0.08) + (y * 0.05));
          const isAlt = wavePhase > 0.2;
          ctx.drawImage(isAlt ? waterB : waterA, x, y);
        }
      }

      // Specular Water Shimmer Streaks
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      for (let i = 0; i < 12; i++) {
        const sx = ((i * 37 + tick * 0.4) % (VIRTUAL_WIDTH - 64)) + 64;
        const sy = (i * 29 + Math.sin(tick * 0.04 + i) * 6) % (VIRTUAL_HEIGHT - 20) + 10;
        ctx.fillRect(Math.floor(sx), Math.floor(sy), 8, 1);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(Math.floor(sx) + 2, Math.floor(sy), 3, 1);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      }

      // 2. Shoreline: Lush Grass Cliff & Warm Sand Beach
      const grass0 = PixelRenderer.getTileSprite('grass', 0);
      const grass1 = PixelRenderer.getTileSprite('grass', 1);
      const grass2 = PixelRenderer.getTileSprite('grass', 2);
      const sand = PixelRenderer.getTileSprite('sand');

      // Grass terrain
      for (let x = 0; x < 48; x += 16) {
        for (let y = 0; y < VIRTUAL_HEIGHT; y += 16) {
          const flowerVariant = (x * 11 + y * 7) % 17 === 0 ? 1 : ((x * 13 + y * 5) % 19 === 0 ? 2 : 0);
          ctx.drawImage(flowerVariant === 1 ? grass1 : flowerVariant === 2 ? grass2 : grass0, x, y);
        }
      }

      // Sand shoreline transition
      for (let y = 0; y < VIRTUAL_HEIGHT; y += 16) {
        ctx.drawImage(sand, 48, y);
      }

      // 3. Wooden Pier (Weathered Planks with Nail Heads)
      const woodTile = PixelRenderer.getTileSprite('wood');
      const pierLength = 120; // 48 to 168
      const pierTopY = 82;

      // Pier pilings in water with subtle reflections
      ctx.fillStyle = '#1c1007';
      ctx.fillRect(60, pierTopY + 28, 6, 26);
      ctx.fillRect(108, pierTopY + 28, 6, 26);
      ctx.fillRect(pierLength - 14, pierTopY + 28, 6, 26);

      // Water reflection of pier posts (wavy)
      ctx.fillStyle = 'rgba(12, 35, 64, 0.7)';
      for (let ry = 0; ry < 12; ry += 2) {
        const rOffset = Math.sin((tick * 0.08) + ry) * 2;
        ctx.fillRect(60 + rOffset, pierTopY + 54 + ry, 6, 1);
        ctx.fillRect(108 + rOffset, pierTopY + 54 + ry, 6, 1);
        ctx.fillRect(pierLength - 14 + rOffset, pierTopY + 54 + ry, 6, 1);
      }

      // Pier Planks
      for (let x = 48; x < pierLength; x += 16) {
        for (let y = pierTopY; y < pierTopY + 32; y += 16) {
          ctx.drawImage(woodTile, x, y);
        }
      }

      // Pier Post with Lantern
      const pierPost = PixelRenderer.getPierPost16x48();
      ctx.drawImage(pierPost, pierLength - 16, pierTopY - 18);

      // 4. Fisherman Character (16x32) with subtle breathing animation
      const playerChar = PixelRenderer.getCharacter16x32(isCasting);
      const playerX = pierLength - 30;
      const playerY = pierTopY - 6 + (Math.sin(tick * 0.06) > 0.6 ? 1 : 0);
      ctx.drawImage(playerChar, playerX, playerY);

      // Fisherman reflection in the water
      ctx.fillStyle = 'rgba(30, 58, 138, 0.35)';
      for (let ry = 0; ry < 8; ry += 2) {
        const rOffset = Math.sin((tick * 0.1) + ry) * 2;
        ctx.fillRect(playerX + 4 + rOffset, pierTopY + 34 + ry, 8, 1);
      }

      // 5. Line & Bobber with Dynamic Splash and Rings
      if (bobberPos) {
        const rodTipX = playerX + 16;
        const rodTipY = playerY + 8;

        // Curved line with sag
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rodTipX, rodTipY);
        ctx.quadraticCurveTo(
          (rodTipX + bobberPos.x) / 2,
          Math.min(rodTipY, bobberPos.y) - 14,
          bobberPos.x,
          bobberPos.y
        );
        ctx.stroke();

        // Bouncing Bobber
        const bobFloat = Math.sin(tick * 0.09) * 1.5;
        // Shadow under bobber
        ctx.fillStyle = 'rgba(7, 22, 44, 0.6)';
        ctx.fillRect(bobberPos.x - 3, bobberPos.y + 2, 6, 2);

        // Bobber body (Red/White with highlights)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(bobberPos.x - 2, bobberPos.y - 3 + bobFloat, 4, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bobberPos.x - 2, bobberPos.y + bobFloat, 4, 2);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(bobberPos.x - 1, bobberPos.y - 2 + bobFloat, 1, 1);

        // Multiple concentric water ripple rings
        for (let ring = 0; ring < 3; ring++) {
          const rTick = (tick + ring * 20) % 60;
          const rRadius = rTick * 0.25;
          const rAlpha = Math.max(0, 1 - rTick / 60);
          ctx.strokeStyle = `rgba(255, 255, 255, ${rAlpha * 0.6})`;
          ctx.beginPath();
          ctx.ellipse(bobberPos.x, bobberPos.y + 2, rRadius * 2, rRadius, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 6. Ambient Atmosphere Particles (Fireflies / Starlight)
      ctx.fillStyle = '#fbbf24';
      firefliesRef.current.forEach((ff) => {
        ff.x += ff.vx;
        ff.y += ff.vy;
        ff.alpha += ff.pulseSpeed;

        if (ff.y < 0) ff.y = VIRTUAL_HEIGHT;
        if (ff.x < 0) ff.x = VIRTUAL_WIDTH;
        if (ff.x > VIRTUAL_WIDTH) ff.x = 0;

        const pulseAlpha = Math.abs(Math.sin(ff.alpha));
        ctx.fillStyle = `rgba(251, 191, 36, ${pulseAlpha * 0.7})`;
        ctx.fillRect(Math.floor(ff.x), Math.floor(ff.y), 2, 2);
      });

      // 7. Dynamic Day/Night Ambient Light Filter (Gradual Tint)
      let ambientColor = 'rgba(0, 0, 0, 0)';
      if (hour >= 20 || hour < 5) {
        // Deep Night: Indigo Moonlight
        ambientColor = 'rgba(10, 15, 45, 0.42)';
      } else if (hour >= 5 && hour < 7) {
        // Dawn: Warm Golden Peach
        ambientColor = 'rgba(251, 146, 60, 0.16)';
      } else if (hour >= 17 && hour < 20) {
        // Sunset: Amber Violet
        ambientColor = 'rgba(168, 85, 247, 0.18)';
      }

      if (ambientColor !== 'rgba(0, 0, 0, 0)') {
        ctx.fillStyle = ambientColor;
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      }

      // Pier Lantern Warm Radial Light Halo
      const lanternX = pierLength - 10;
      const lanternY = pierTopY - 10;
      const lanternGlow = ctx.createRadialGradient(lanternX, lanternY, 2, lanternX, lanternY, 38);
      lanternGlow.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
      lanternGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.12)');
      lanternGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = lanternGlow;
      ctx.beginPath();
      ctx.arc(lanternX, lanternY, 38, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isCasting, bobberPos, hour]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = VIRTUAL_WIDTH / rect.width;
    const scaleY = VIRTUAL_HEIGHT / rect.height;
    const virtualX = (e.clientX - rect.left) * scaleX;
    const virtualY = (e.clientY - rect.top) * scaleY;

    if (virtualX > 120) {
      setBobberPos({ x: Math.round(virtualX), y: Math.round(virtualY) });
      onCast(virtualX, virtualY);
    }
  };

  return (
    <div className={`relative w-full h-full flex items-center justify-center bg-[#070b14] overflow-hidden ${screenShake ? 'animate-bounce' : ''}`}>
      <canvas
        ref={canvasRef}
        width={VIRTUAL_WIDTH}
        height={VIRTUAL_HEIGHT}
        onClick={handleClick}
        className="w-full h-full max-w-[1920px] max-h-[1080px] object-contain cursor-crosshair shadow-2xl"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Atmospheric Hint Pill */}
      {!bobberPos && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 pointer-events-none bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-full border border-amber-500/40 shadow-xl text-amber-300 font-pixel text-[11px] tracking-wide flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          Click anywhere in the ocean waters to cast your line
        </div>
      )}
    </div>
  );
};
