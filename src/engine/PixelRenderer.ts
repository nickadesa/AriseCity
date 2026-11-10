// Hi-Bit Pixel Art Engine: 16x16, 16x32, 16x48, 32x32, 64x64
import { FishDefinition } from '../types/game';

export class PixelRenderer {
  private static spriteCache: Map<string, HTMLCanvasElement> = new Map();

  /**
   * Universal Fish Sprite getter (routes to 32x32 or 64x64 based on resolution)
   */
  public static getFishSprite(fish: FishDefinition): HTMLCanvasElement {
    if (fish.spriteResolution === '64x64') {
      return this.getLargeBoss48x64(fish);
    }
    return this.getFish32x32(fish);
  }

  /**
   * Generates a 16x16 Base Tile (Water, Grass, Sand, Wood Plank, Reeds)
   */
  public static getTileSprite(type: 'water' | 'grass' | 'sand' | 'wood' | 'reeds', variant: number = 0): HTMLCanvasElement {
    const key = `tile_${type}_${variant}`;
    if (this.spriteCache.has(key)) return this.spriteCache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    if (type === 'water') {
      // Deep sea navy gradient
      ctx.fillStyle = variant === 0 ? '#0c2340' : '#091c33';
      ctx.fillRect(0, 0, 16, 16);
      
      // Secondary wave currents
      ctx.fillStyle = variant === 0 ? '#133966' : '#0f2f54';
      ctx.fillRect(1, 3, 7, 2);
      ctx.fillRect(9, 10, 6, 2);
      ctx.fillRect(3, 12, 4, 1);

      // Bright foam crests & specular glints
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(3, 4, 3, 1);
      ctx.fillRect(11, 11, 2, 1);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(4, 4, 1, 1);
    } else if (type === 'grass') {
      // Lush coastal emerald grass
      ctx.fillStyle = '#166534';
      ctx.fillRect(0, 0, 16, 16);
      
      // Grass blade highlights
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(3, 3, 1, 3);
      ctx.fillRect(4, 2, 1, 2);
      ctx.fillRect(10, 7, 1, 4);
      ctx.fillRect(11, 6, 1, 3);
      ctx.fillRect(7, 12, 1, 3);

      // Deep shadow blades
      ctx.fillStyle = '#14532d';
      ctx.fillRect(3, 6, 2, 2);
      ctx.fillRect(10, 11, 2, 2);

      // Wildflower specks
      if (variant === 1) {
        ctx.fillStyle = '#fbbf24'; // Yellow buttercup
        ctx.fillRect(6, 5, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7, 5, 1, 1);
      } else if (variant === 2) {
        ctx.fillStyle = '#f43f5e'; // Pink clover
        ctx.fillRect(12, 4, 2, 2);
      }
    } else if (type === 'sand') {
      // Golden coastal sand
      ctx.fillStyle = '#d97706';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, 0, 16, 15);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(1, 1, 14, 13);

      // Sand granules & shell fragments
      ctx.fillStyle = '#b45309';
      ctx.fillRect(4, 4, 1, 1);
      ctx.fillRect(11, 8, 1, 1);
      ctx.fillRect(6, 12, 1, 1);
      ctx.fillStyle = '#fef3c7'; // Shell glint
      ctx.fillRect(12, 5, 2, 1);
    } else if (type === 'wood') {
      // Weathered harbor timber
      ctx.fillStyle = '#451a03'; // Gap shadow
      ctx.fillRect(0, 0, 16, 16);
      
      // Planks
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 1, 16, 6);
      ctx.fillRect(0, 8, 16, 7);

      // Wood grain highlights
      ctx.fillStyle = '#92400e';
      ctx.fillRect(2, 2, 12, 1);
      ctx.fillRect(4, 9, 10, 1);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(3, 3, 8, 1);

      // Iron nails
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, 4, 1, 1);
      ctx.fillRect(13, 4, 1, 1);
      ctx.fillRect(2, 11, 1, 1);
      ctx.fillRect(13, 11, 1, 1);
    }

    this.spriteCache.set(key, canvas);
    return canvas;
  }

  /**
   * Generates a 16x32 Character Sprite (Fisherman with detailed shading)
   */
  public static getCharacter16x32(isCasting: boolean): HTMLCanvasElement {
    const key = `char_16x32_${isCasting ? 'casting' : 'idle'}`;
    if (this.spriteCache.has(key)) return this.spriteCache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Fisherman Cap (Gold/Ochre Beanie)
    ctx.fillStyle = '#d97706';
    ctx.fillRect(4, 3, 8, 4);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(3, 6, 10, 2);
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(5, 4, 4, 1); // Cap highlight

    // Auburn Hair
    ctx.fillStyle = '#451a03';
    ctx.fillRect(4, 8, 8, 2);

    // Face / Skin Tone
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(5, 9, 6, 5);
    ctx.fillStyle = '#f97316'; // Rosy cheek
    ctx.fillRect(5, 12, 1, 1);
    // Expressive Eye
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, 11, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 11, 1, 1);

    // Warm Knitted Scarf (Crimson Red)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(5, 14, 6, 2);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(6, 14, 4, 1);
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(9, 15, 2, 3); // Scarf tail

    // Sailor Wool Peacoat (Navy Blue)
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(4, 16, 8, 8);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(4, 16, 2, 7); // Jacket highlight
    ctx.fillStyle = '#fbbf24'; // Brass buttons
    ctx.fillRect(7, 18, 1, 1);
    ctx.fillRect(7, 21, 1, 1);

    // Trousers (Charcoal Slate)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(5, 24, 3, 5);
    ctx.fillRect(9, 24, 3, 5);

    // Rubber Wading Boots (Dark Brown)
    ctx.fillStyle = '#291809';
    ctx.fillRect(4, 28, 4, 4);
    ctx.fillRect(9, 28, 4, 4);
    ctx.fillStyle = '#5c3317';
    ctx.fillRect(4, 28, 3, 1);
    ctx.fillRect(9, 28, 3, 1);

    // Bamboo Fishing Rod
    ctx.fillStyle = '#b45309';
    if (isCasting) {
      // Cast forward gesture
      ctx.fillRect(10, 16, 5, 2);
      ctx.fillRect(14, 8, 2, 9);
      ctx.fillStyle = '#fef3c7'; // Bamboo nodes
      ctx.fillRect(11, 16, 1, 2);
      ctx.fillRect(14, 12, 2, 1);
    } else {
      // Resting on shoulder
      ctx.fillRect(2, 6, 2, 18);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(2, 10, 2, 1);
      ctx.fillRect(2, 15, 2, 1);
      ctx.fillStyle = '#94a3b8'; // Metal reel
      ctx.fillRect(1, 18, 4, 3);
    }

    this.spriteCache.set(key, canvas);
    return canvas;
  }

  /**
   * Generates a 16x48 Pier Post with Glowing Lantern
   */
  public static getPierPost16x48(): HTMLCanvasElement {
    const key = 'pier_post_16x48';
    if (this.spriteCache.has(key)) return this.spriteCache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 48;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Timber post with grain
    ctx.fillStyle = '#451a03';
    ctx.fillRect(5, 12, 6, 36);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(6, 12, 4, 36);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(6, 14, 2, 32);

    // Green seaweed/barnacles near water base
    ctx.fillStyle = '#15803d';
    ctx.fillRect(4, 40, 8, 3);
    ctx.fillStyle = '#166534';
    ctx.fillRect(5, 43, 6, 5);

    // Black forged iron lamp hanger
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, 2, 8, 3);
    ctx.fillRect(3, 5, 10, 2);
    ctx.fillRect(3, 11, 10, 2);
    ctx.fillRect(3, 7, 2, 4);
    ctx.fillRect(11, 7, 2, 4);

    // Glowing warm amber lantern interior
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(5, 7, 6, 4);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(6, 8, 4, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 8, 2, 1);

    this.spriteCache.set(key, canvas);
    return canvas;
  }

  /**
   * Generates 32x32 Fish Sprite with Rich Highlights & Shading
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

    // Crisp dark shadow outline
    ctx.fillStyle = '#090d16';
    ctx.fillRect(5, 10, 22, 12);
    ctx.fillRect(7, 8, 18, 16);
    ctx.fillRect(23, 6, 6, 20); // Tail fin

    // Primary Torpedo Body
    ctx.fillStyle = p;
    ctx.fillRect(7, 10, 16, 11);
    ctx.fillRect(9, 9, 13, 13);

    // Belly Shading
    ctx.fillStyle = belly;
    ctx.fillRect(8, 15, 13, 5);
    ctx.fillRect(10, 17, 9, 2);

    // Dorsal & Pectoral Fins
    ctx.fillStyle = s;
    ctx.fillRect(11, 6, 7, 3);
    ctx.fillRect(12, 5, 5, 2);
    ctx.fillRect(24, 7, 3, 18);
    ctx.fillRect(26, 5, 2, 22);

    // Lateral scales & Accent pattern
    ctx.fillStyle = acc;
    ctx.fillRect(12, 11, 2, 2);
    ctx.fillRect(16, 12, 2, 2);
    ctx.fillRect(14, 14, 2, 2);
    ctx.fillRect(18, 15, 2, 2);

    // Eye (White glint + expressive pupil)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 10, 4, 4);
    ctx.fillStyle = eye;
    ctx.fillRect(8, 11, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 11, 1, 1);

    // Bioluminescent glow for Abyssal / Cosmic
    if (fish.category === 'abyssal' || fish.category === 'cosmic') {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(4, 6, 3, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, 7, 1, 1);
    }

    this.spriteCache.set(key, canvas);
    return canvas;
  }

  /**
   * Generates 48x64+ Large Prop (Boss Leviathans / Mythics)
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

    // Heavy dark outline
    ctx.fillStyle = '#030712';
    ctx.beginPath();
    ctx.ellipse(32, 24, 28, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body Mass
    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.ellipse(30, 24, 25, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Luminous Underbelly
    ctx.fillStyle = belly;
    ctx.beginPath();
    ctx.ellipse(28, 30, 20, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Giant Dynamic Tail Fin
    ctx.fillStyle = s;
    ctx.beginPath();
    ctx.moveTo(50, 24);
    ctx.lineTo(63, 6);
    ctx.lineTo(57, 24);
    ctx.lineTo(63, 42);
    ctx.closePath();
    ctx.fill();

    // Glowing Armor Scales
    ctx.fillStyle = acc;
    for (let x = 16; x <= 44; x += 6) {
      for (let y = 16; y <= 32; y += 5) {
        ctx.fillRect(x, y, 3, 2);
      }
    }

    // Piercing Leviathan Eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 17, 6, 6);
    ctx.fillStyle = eye;
    ctx.fillRect(13, 19, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(13, 19, 2, 2);

    this.spriteCache.set(key, canvas);
    return canvas;
  }
}
