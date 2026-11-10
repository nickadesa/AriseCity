// Hi-Bit Pixel Art Specifications:
// - 16x16: Base Tiles (Grass, Dirt, Water, Path)
// - 16x32: Characters & NPCs (Player, Sailors)
// - 16x48 / 16x64: Tall vertical props (Lamp posts, pier posts, banners)
// - 32x32: 2x2 tile objects (Chests, crates, small boats, standard fish)
// - 32x48, 48x64+: Large props (Trees, buildings, mega aquarium, boss leviathans)
// - Native Virtual Buffer: 320x180 or 640x360
// - Scaled Output: 1280x720 / 1920x1080 (Integer 4x/2x scale)

import { FishDefinition } from '../types/game';

export class PixelRenderer {
  private static spriteCache: Map<string, HTMLCanvasElement> = new Map();

  /**
   * Universal Fish Sprite getter (routes to 32x32 or 48x64 based on resolution)
   */
  public static getFishSprite(fish: FishDefinition): HTMLCanvasElement {
    if (fish.spriteResolution === '64x64') {
      return this.getLargeBoss48x64(fish);
    }
    return this.getFish32x32(fish);
  }

  /**
   * Generates a 16x16 Base Tile (Water, Grass, Sand, Wood Plank)
   */
  public static getTileSprite(type: 'water' | 'grass' | 'sand' | 'wood', variant: number = 0): HTMLCanvasElement {
    const key = `tile_${type}_${variant}`;
    if (this.spriteCache.has(key)) return this.spriteCache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    if (type === 'water') {
      ctx.fillStyle = variant === 0 ? '#103965' : '#0d2d52';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#1e5da6';
      ctx.fillRect(2, 4, 6, 1);
      ctx.fillRect(9, 11, 5, 1);
      ctx.fillStyle = '#4da0f0'; // Sparkle
      ctx.fillRect(4, 5, 2, 1);
    } else if (type === 'grass') {
      ctx.fillStyle = '#3e8948';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#265c42';
      ctx.fillRect(3, 4, 2, 3);
      ctx.fillRect(10, 8, 2, 4);
      ctx.fillStyle = '#63c74d';
      ctx.fillRect(3, 3, 2, 1);
    } else if (type === 'sand') {
      ctx.fillStyle = '#e4a672';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#b86f50';
      ctx.fillRect(4, 5, 2, 1);
      ctx.fillRect(11, 10, 2, 1);
    } else if (type === 'wood') {
      ctx.fillStyle = '#63381a';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#522d14';
      ctx.fillRect(0, 14, 16, 2);
      ctx.fillStyle = '#8f563b';
      ctx.fillRect(2, 2, 12, 1);
    }

    this.spriteCache.set(key, canvas);
    return canvas;
  }

  /**
   * Generates a 16x32 Character Sprite (Player / NPCs)
   */
  public static getCharacter16x32(isCasting: boolean): HTMLCanvasElement {
    const key = `char_16x32_${isCasting ? 'casting' : 'idle'}`;
    if (this.spriteCache.has(key)) return this.spriteCache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Fisherman Straw/Beanie Hat
    ctx.fillStyle = '#fbb954';
    ctx.fillRect(4, 4, 8, 3);
    ctx.fillRect(3, 6, 10, 2);

    // Hair
    ctx.fillStyle = '#5a3d28';
    ctx.fillRect(4, 8, 8, 2);

    // Head / Face (6x5)
    ctx.fillStyle = '#ffd199';
    ctx.fillRect(5, 9, 6, 5);
    // Eye
    ctx.fillStyle = '#181425';
    ctx.fillRect(8, 11, 2, 2);

    // Body / Sailor Jacket (8x9)
    ctx.fillStyle = '#1e5da6';
    ctx.fillRect(4, 14, 8, 9);
    // Scarf / Collar
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(5, 14, 6, 2);

    // Legs / Trousers
    ctx.fillStyle = '#262b44';
    ctx.fillRect(5, 23, 3, 5);
    ctx.fillRect(9, 23, 3, 5);

    // Boots
    ctx.fillStyle = '#3a200e';
    ctx.fillRect(4, 28, 4, 3);
    ctx.fillRect(9, 28, 4, 3);

    // Fishing Rod in 16x32 frame
    ctx.fillStyle = '#8f563b';
    if (isCasting) {
      ctx.fillRect(10, 15, 5, 2);
      ctx.fillRect(14, 8, 2, 8);
    } else {
      ctx.fillRect(3, 7, 2, 14);
    }

    this.spriteCache.set(key, canvas);
    return canvas;
  }

  /**
   * Generates a 16x48 Vertical Pier Post with Lamp
   */
  public static getPierPost16x48(): HTMLCanvasElement {
    const key = 'pier_post_16x48';
    if (this.spriteCache.has(key)) return this.spriteCache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 48;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Wooden post column
    ctx.fillStyle = '#3a200e';
    ctx.fillRect(5, 12, 6, 36);
    ctx.fillStyle = '#26140b';
    ctx.fillRect(5, 42, 6, 6);

    // Lantern fixture at top
    ctx.fillStyle = '#181425';
    ctx.fillRect(3, 3, 10, 3);
    ctx.fillRect(4, 6, 8, 6);
    // Lantern light
    ctx.fillStyle = '#fbb954';
    ctx.fillRect(5, 7, 6, 4);

    this.spriteCache.set(key, canvas);
    return canvas;
  }

  /**
   * Generates 32x32 Object (Fish / Chest / Small Boat)
   */
  public static getFish32x32(fish: FishDefinition): HTMLCanvasElement {
    const key = `fish_32x32_${fish.id}`;
    if (this.spriteCache.has(key)) return this.spriteCache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const [p, s, eye, belly, acc] = fish.palette;

    // 32x32 Base Fish Model
    ctx.fillStyle = '#181425'; // Outline
    ctx.fillRect(5, 11, 22, 10);
    ctx.fillRect(7, 9, 18, 14);
    ctx.fillRect(23, 7, 5, 18); // Tail

    // Primary Body
    ctx.fillStyle = p;
    ctx.fillRect(7, 11, 16, 9);
    ctx.fillRect(9, 10, 13, 11);

    // Belly
    ctx.fillStyle = belly;
    ctx.fillRect(8, 15, 13, 4);

    // Fins
    ctx.fillStyle = s;
    ctx.fillRect(11, 7, 6, 3);
    ctx.fillRect(24, 8, 3, 16);

    // Accent pattern
    ctx.fillStyle = acc;
    ctx.fillRect(12, 11, 2, 2);
    ctx.fillRect(16, 12, 2, 2);

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 11, 3, 3);
    ctx.fillStyle = eye;
    ctx.fillRect(9, 12, 2, 2);

    this.spriteCache.set(key, canvas);
    return canvas;
  }

  /**
   * Generates 48x64+ Large Prop (Boss / Whale / Coral Shrine)
   */
  public static getLargeBoss48x64(fish: FishDefinition): HTMLCanvasElement {
    const key = `boss_48x64_${fish.id}`;
    if (this.spriteCache.has(key)) return this.spriteCache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const [p, s, eye, belly, acc] = fish.palette;

    // Heavy outline
    ctx.fillStyle = '#060913';
    ctx.beginPath();
    ctx.ellipse(32, 24, 28, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.ellipse(30, 24, 25, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Underbelly
    ctx.fillStyle = belly;
    ctx.beginPath();
    ctx.ellipse(28, 30, 20, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Massive Tail
    ctx.fillStyle = s;
    ctx.beginPath();
    ctx.moveTo(50, 24);
    ctx.lineTo(62, 8);
    ctx.lineTo(57, 24);
    ctx.lineTo(62, 40);
    ctx.closePath();
    ctx.fill();

    // Scales
    ctx.fillStyle = acc;
    for (let x = 18; x <= 42; x += 6) {
      for (let y = 18; y <= 30; y += 5) {
        ctx.fillRect(x, y, 3, 2);
      }
    }

    // Piercing Eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 18, 6, 6);
    ctx.fillStyle = eye;
    ctx.fillRect(14, 20, 4, 4);

    this.spriteCache.set(key, canvas);
    return canvas;
  }
}
