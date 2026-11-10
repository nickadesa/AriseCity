import { TimeState } from '../types/agent';

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export class IsometricEngine {
  // Convert 3D world coordinates (x, y, z) into 2.5D Isometric Screen Coordinates
  // Standard 2:1 projection
  static worldToIso(x: number, y: number, z: number = 0): Point2D {
    const isoX = (x - y) * 2.0;
    const isoY = (x + y) * 1.0 - z;
    return { x: isoX, y: isoY };
  }

  // Inverse projection: convert screen click coordinates (taking into account pan and zoom) back to world plane
  static screenToWorld(
    screenX: number, 
    screenY: number, 
    panX: number, 
    panY: number, 
    zoom: number, 
    zPlane: number = 0
  ): Point2D {
    const adjustedScreenY = screenY + zPlane * zoom;
    const isoX = (screenX - panX) / zoom;
    const isoY = (adjustedScreenY - panY) / zoom;
    
    const worldX = (isoX / 2.0 + isoY) / 2.0;
    const worldY = (isoY - isoX / 2.0) / 2.0;
    return { x: worldX, y: worldY };
  }

  // Calculate dynamic shadow offset based on time of day and sun position
  static getShadowParameters(timeState: TimeState) {
    const { phase, isNight, gameHours } = timeState;

    if (isNight) {
      // At night: soft, short ambient floor shadows directly below objects
      return {
        offsetX: 2,
        offsetY: 3,
        alpha: 0.45,
        blur: 4,
        color: 'rgba(5, 8, 15, 0.65)'
      };
    }

    // Directional sunlight angle:
    // Dawn (6 AM): Long shadow to the South-East
    // Midday (12 PM): Short crisp shadow directly below
    // Dusk (6 PM): Long shadow to the North-West
    const dayProgress = Math.max(0, Math.min(1, (gameHours - 6) / 13)); // 0 to 1
    const sunAngle = dayProgress * Math.PI; // 0 to PI

    const length = 18 * Math.cos(sunAngle); // long at 0 and PI, 0 at PI/2
    const offsetX = length * 1.5;
    const offsetY = Math.abs(length) * 0.7 + 4;
    const alpha = phase === 'dusk' ? 0.55 : phase === 'dawn' ? 0.45 : 0.4;

    return {
      offsetX,
      offsetY,
      alpha,
      blur: phase === 'day' ? 2 : 5,
      color: phase === 'dusk' ? 'rgba(30, 15, 10, 0.5)' : 'rgba(10, 15, 25, 0.45)'
    };
  }

  // Color grading overlay based on time phase
  static getAtmosphericOverlay(timeState: TimeState) {
    const { phase, gameHours } = timeState;

    switch (phase) {
      case 'dawn': {
        // Soft rose gold / peach amber morning tint
        return {
          color: 'rgba(255, 180, 120, 0.12)',
          blendMode: 'overlay' as GlobalCompositeOperation
        };
      }
      case 'day': {
        // Crisp, clear neutral daylight
        return {
          color: 'rgba(255, 255, 255, 0.02)',
          blendMode: 'source-over' as GlobalCompositeOperation
        };
      }
      case 'dusk': {
        // Dramatic golden hour amber-orange
        return {
          color: 'rgba(251, 146, 60, 0.18)',
          blendMode: 'multiply' as GlobalCompositeOperation
        };
      }
      case 'night': {
        // Deep modern cyberpunk navy blue night tint
        // Varies slightly by midnight depth
        const midnightDepth = Math.sin(((gameHours < 6 ? gameHours + 24 : gameHours) - 20) / 10 * Math.PI);
        const opacity = 0.52 + midnightDepth * 0.18;
        return {
          color: `rgba(10, 14, 26, ${opacity.toFixed(2)})`,
          blendMode: 'multiply' as GlobalCompositeOperation
        };
      }
    }
  }
}
