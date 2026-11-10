import React, { useRef, useEffect, useState } from 'react';
import { PixelRenderer } from '../engine/PixelRenderer';

interface GameCanvasProps {
  isCasting: boolean;
  onCast: (targetX: number, targetY: number) => void;
  screenShake: boolean;
}

// Pixel Art Virtual Buffer Specifications:
// Native Resolution: 320x180 (16:9)
// Scaled Output: Fits screen integer-scaled up to 1280x720 / 1920x1080
const VIRTUAL_WIDTH = 320;
const VIRTUAL_HEIGHT = 180;

export const GameCanvas: React.FC<GameCanvasProps> = ({ isCasting, onCast, screenShake }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [bobberPos, setBobberPos] = useState<{ x: number; y: number } | null>(null);

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

      // 1. Draw 16x16 Base Water Tiles across the 320x180 viewport
      const waterA = PixelRenderer.getTileSprite('water', 0);
      const waterB = PixelRenderer.getTileSprite('water', 1);

      for (let x = 0; x < VIRTUAL_WIDTH; x += 16) {
        for (let y = 0; y < VIRTUAL_HEIGHT; y += 16) {
          const isAlt = (Math.floor(x / 16) + Math.floor(y / 16) + Math.floor(tick / 30)) % 2 === 0;
          ctx.drawImage(isAlt ? waterA : waterB, x, y);
        }
      }

      // 2. Draw Shoreline / Grass Land (Left side of screen)
      const grassTile = PixelRenderer.getTileSprite('grass');
      const sandTile = PixelRenderer.getTileSprite('sand');

      for (let x = 0; x < 48; x += 16) {
        for (let y = 0; y < VIRTUAL_HEIGHT; y += 16) {
          ctx.drawImage(grassTile, x, y);
        }
      }
      // Sand border between grass and water
      for (let y = 0; y < VIRTUAL_HEIGHT; y += 16) {
        ctx.drawImage(sandTile, 48, y);
      }

      // 3. Draw Wooden Pier (16x16 Wood Planks extending to center)
      const woodTile = PixelRenderer.getTileSprite('wood');
      const pierLength = 112; // extends from 48 to 160
      const pierTopY = 80;

      for (let x = 48; x < pierLength; x += 16) {
        for (let y = pierTopY; y < pierTopY + 32; y += 16) {
          ctx.drawImage(woodTile, x, y);
        }
      }

      // 4. Draw 16x48 Pier Post with Lamp at the end of the pier
      const pierPost = PixelRenderer.getPierPost16x48();
      ctx.drawImage(pierPost, pierLength - 16, pierTopY - 16);

      // 5. Draw 16x32 Player Character standing at end of pier
      const playerChar = PixelRenderer.getCharacter16x32(isCasting);
      const playerX = pierLength - 28;
      const playerY = pierTopY - 4;
      ctx.drawImage(playerChar, playerX, playerY);

      // 6. Draw Fishing Line & Bobber if cast
      if (bobberPos) {
        const rodTipX = playerX + 16;
        const rodTipY = playerY + 8;

        // Line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rodTipX, rodTipY);
        ctx.quadraticCurveTo(
          (rodTipX + bobberPos.x) / 2,
          Math.min(rodTipY, bobberPos.y) - 10,
          bobberPos.x,
          bobberPos.y
        );
        ctx.stroke();

        // 32x32 / small bobber pixel float
        const bobFloat = Math.sin(tick * 0.1) * 1.5;
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(bobberPos.x - 2, bobberPos.y - 3 + bobFloat, 4, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bobberPos.x - 2, bobberPos.y + bobFloat, 4, 2);

        // Water ripple ring around bobber
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        const rSize = (tick % 40) * 0.3;
        ctx.beginPath();
        ctx.ellipse(bobberPos.x, bobberPos.y + 2, rSize * 1.8, rSize, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isCasting, bobberPos]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Scale client click coordinates into the 320x180 virtual coordinate space
    const scaleX = VIRTUAL_WIDTH / rect.width;
    const scaleY = VIRTUAL_HEIGHT / rect.height;
    const virtualX = (e.clientX - rect.left) * scaleX;
    const virtualY = (e.clientY - rect.top) * scaleY;

    // Only allow casting into water (x > 120)
    if (virtualX > 120) {
      setBobberPos({ x: Math.round(virtualX), y: Math.round(virtualY) });
      onCast(virtualX, virtualY);
    }
  };

  return (
    <div className={`relative w-full h-full flex items-center justify-center bg-black overflow-hidden ${screenShake ? 'animate-bounce' : ''}`}>
      {/* 
        The canvas uses exact 320x180 native internal resolution,
        scaled up with pixelated rendering to 16:9 aspect ratio container!
      */}
      <canvas
        ref={canvasRef}
        width={VIRTUAL_WIDTH}
        height={VIRTUAL_HEIGHT}
        onClick={handleClick}
        className="w-full h-full max-w-[1920px] max-h-[1080px] object-contain cursor-crosshair"
        style={{
          imageRendering: 'pixelated',
        }}
      />

      {/* Guide Banner */}
      {!bobberPos && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none bg-haven-dark/90 px-4 py-2 rounded border border-haven-border shadow-pixel text-haven-gold font-pixel text-xs tracking-wider animate-pulse">
          🎣 Click into the water to cast your line! (Resolution: 320×180 scaled to 1080p)
        </div>
      )}
    </div>
  );
};
