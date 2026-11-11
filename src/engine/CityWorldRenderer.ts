import { TimeState } from '../types/agent';
import { CITY_DISTRICTS } from './CityData';
import { IsometricEngine } from './IsometricEngine';

export class CityWorldRenderer {
  // -------------------------------------------------------------
  // Z0: SCREEN-SPACE MASTERPLAN VECTOR MAP (Zoom < 0.35)
  // Rendered in crisp 1:1 screen coordinates (0, 0, width, height)
  // -------------------------------------------------------------
  static renderZ0CityMapScreen(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timeState: TimeState,
    hoveredDistrictId: string | null
  ) {
    const isNight = timeState.isNight;
    const now = Date.now();

    // 1. Full-Screen Coastal Ocean Background
    const oceanGrad = ctx.createLinearGradient(0, 0, width, height);
    if (isNight) {
      oceanGrad.addColorStop(0, '#060d17');
      oceanGrad.addColorStop(0.5, '#0b1626');
      oceanGrad.addColorStop(1, '#050a12');
    } else {
      oceanGrad.addColorStop(0, '#0284c7');
      oceanGrad.addColorStop(0.4, '#0ea5e9');
      oceanGrad.addColorStop(1, '#0369a1');
    }
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Nautical Compass & Coordinate Grid Lines (Cartographic Masterplan)
    ctx.save();
    ctx.strokeStyle = isNight ? 'rgba(56, 189, 248, 0.06)' : 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;

    const gridStep = Math.max(60, Math.floor(width / 12));
    for (let x = gridStep; x < width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = gridStep; y < height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Animated Ocean Depth Wave Ripples
    ctx.strokeStyle = isNight ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const waveOffset = (now * 0.0008 + i * 1.5) % 8;
      ctx.beginPath();
      ctx.ellipse(width * 0.35, height * 0.65 + waveOffset * 6, width * 0.45, height * 0.25, -0.2, 0, Math.PI * 1.8);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Stylized AriseCity Peninsula Landmass Polygon
    ctx.save();
    const cx = width * 0.5;
    const cy = height * 0.5;
    const scale = Math.min(width / 900, height / 700);

    // Draw main landmass
    ctx.beginPath();
    ctx.moveTo(cx - 380 * scale, cy - 260 * scale);
    ctx.bezierCurveTo(cx + 80 * scale, cy - 320 * scale, cx + 380 * scale, cy - 200 * scale, cx + 380 * scale, cy - 20 * scale);
    ctx.bezierCurveTo(cx + 390 * scale, cy + 180 * scale, cx + 220 * scale, cy + 280 * scale, cx + 20 * scale, cy + 280 * scale);
    ctx.bezierCurveTo(cx - 160 * scale, cy + 280 * scale, cx - 340 * scale, cy + 200 * scale, cx - 380 * scale, cy + 60 * scale);
    ctx.closePath();

    // Landmass Fill
    ctx.fillStyle = isNight ? '#0f172a' : '#f8fafc';
    ctx.fill();

    // Landmass Border & Coastline Glow
    ctx.lineWidth = 3;
    ctx.strokeStyle = isNight ? '#1e293b' : '#cbd5e1';
    ctx.stroke();

    // Golden Beach Sand Fringe (South-East edge)
    ctx.beginPath();
    ctx.moveTo(cx + 80 * scale, cy + 270 * scale);
    ctx.bezierCurveTo(cx + 220 * scale, cy + 270 * scale, cx + 380 * scale, cy + 170 * scale, cx + 370 * scale, cy + 20 * scale);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 8 * scale;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Rose Kennedy Greenway Ribbon (Emerald Park Corridor across the city)
    ctx.beginPath();
    ctx.moveTo(cx - 220 * scale, cy + 20 * scale);
    ctx.bezierCurveTo(cx - 60 * scale, cy - 40 * scale, cx + 120 * scale, cy - 20 * scale, cx + 260 * scale, cy + 100 * scale);
    ctx.strokeStyle = isNight ? '#059669' : '#10b981';
    ctx.lineWidth = 14 * scale;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Shipping Channel Dotted Navigation Line
    ctx.setLineDash([8, 8]);
    ctx.lineDashOffset = -(now * 0.02) % 16;
    ctx.strokeStyle = '#f5ba31';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 240 * scale, cy + 200 * scale); // Port Wharf
    ctx.bezierCurveTo(cx - 360 * scale, cy + 300 * scale, cx - 200 * scale, cy + 420 * scale, cx + 100 * scale, cy + 480 * scale);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 4. District Card Nodes & Touch-friendly Targets in Z0
    const districtLayouts: Record<string, { x: number; y: number; w: number; h: number }> = {
      terrace_residential: { x: cx - 120 * scale, y: cy - 200 * scale, w: 220 * scale, h: 64 * scale },
      downtown_waterfront: { x: cx - 180 * scale, y: cy - 40 * scale, w: 250 * scale, h: 72 * scale },
      civic_promenade: { x: cx + 130 * scale, y: cy - 70 * scale, w: 240 * scale, h: 68 * scale },
      port_maritime: { x: cx - 210 * scale, y: cy + 130 * scale, w: 230 * scale, h: 68 * scale },
      sports_wellness: { x: cx + 120 * scale, y: cy + 120 * scale, w: 230 * scale, h: 68 * scale },
    };

    CITY_DISTRICTS.forEach((d) => {
      const layout = districtLayouts[d.id];
      if (!layout) return;

      const isHovered = hoveredDistrictId === d.id;
      const isHQ = d.id === 'downtown_waterfront';

      ctx.save();
      // Card Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;

      // Card Background
      ctx.fillStyle = isNight 
        ? (isHovered ? '#1e293b' : '#0f172a') 
        : (isHovered ? '#ffffff' : '#f1f5f9');
      ctx.strokeStyle = isHQ ? '#f5ba31' : (isHovered ? d.accentHex : d.colorHex);
      ctx.lineWidth = isHQ ? 2.5 : (isHovered ? 2 : 1.5);

      const r = 12;
      ctx.beginPath();
      ctx.roundRect(layout.x - layout.w / 2, layout.y - layout.h / 2, layout.w, layout.h, r);
      ctx.fill();
      ctx.stroke();
      ctx.shadowColor = 'transparent';

      // District Icon badge
      ctx.fillStyle = `${d.colorHex}25`;
      ctx.beginPath();
      ctx.roundRect(layout.x - layout.w / 2 + 8, layout.y - 18 * scale, 36 * scale, 36 * scale, 8);
      ctx.fill();

      ctx.font = `${Math.round(18 * scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.icon, layout.x - layout.w / 2 + 26 * scale, layout.y);

      // District Titles
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isNight ? '#f8fafc' : '#0f172a';
      ctx.font = `bold ${Math.max(11, Math.round(13 * scale))}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillText(d.name, layout.x - layout.w / 2 + 50 * scale, layout.y - 10 * scale);

      ctx.fillStyle = isNight ? '#94a3b8' : '#64748b';
      ctx.font = `${Math.max(10, Math.round(11 * scale))}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillText(d.nameThai, layout.x - layout.w / 2 + 50 * scale, layout.y + 10 * scale);

      // Status indicator pill
      const statusX = layout.x + layout.w / 2 - 16 * scale;
      ctx.beginPath();
      ctx.arc(statusX, layout.y, 4 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981'; // Green active dot
      ctx.fill();

      ctx.restore();
    });

    // 5. Header Banner for Z0
    ctx.save();
    ctx.fillStyle = isNight ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#f5ba31';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 180, 18, 360, 44, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isNight ? '#ffffff' : '#0f172a';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌊 ARISECITY COASTAL MASTERPLAN (Z0)', width / 2, 36);

    ctx.fillStyle = isNight ? '#94a3b8' : '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText('CLICK ANY DISTRICT CARD TO FLY IN • NEW YORK EDT (UTC-4)', width / 2, 51);
    ctx.restore();
  }

  // Detect touch/click hit on Z0 district card in screen coordinates
  static getZ0DistrictAtScreen(
    clickX: number,
    clickY: number,
    width: number,
    height: number
  ): string | null {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const scale = Math.min(width / 900, height / 700);

    const districtLayouts: Record<string, { x: number; y: number; w: number; h: number }> = {
      terrace_residential: { x: cx - 120 * scale, y: cy - 200 * scale, w: 220 * scale, h: 64 * scale },
      downtown_waterfront: { x: cx - 180 * scale, y: cy - 40 * scale, w: 250 * scale, h: 72 * scale },
      civic_promenade: { x: cx + 130 * scale, y: cy - 70 * scale, w: 240 * scale, h: 68 * scale },
      port_maritime: { x: cx - 210 * scale, y: cy + 130 * scale, w: 230 * scale, h: 68 * scale },
      sports_wellness: { x: cx + 120 * scale, y: cy + 120 * scale, w: 230 * scale, h: 68 * scale },
    };

    for (const [id, layout] of Object.entries(districtLayouts)) {
      if (
        clickX >= layout.x - layout.w / 2 &&
        clickX <= layout.x + layout.w / 2 &&
        clickY >= layout.y - layout.h / 2 &&
        clickY <= layout.y + layout.h / 2
      ) {
        return id;
      }
    }
    return null;
  }

  // -------------------------------------------------------------
  // CONTINUOUS REGIONAL TERRAIN & ROADS (Z1 - Z4)
  // Replaces the black void with a massive ocean & connected landmass
  // -------------------------------------------------------------
  static renderRegionalTerrain(
    ctx: CanvasRenderingContext2D,
    timeState: TimeState
  ) {
    const isNight = timeState.isNight;
    const now = Date.now();

    // 1. Massive Ocean Water (Covering world -1000 to +1800)
    ctx.save();
    const seaP1 = IsometricEngine.worldToIso(-800, -800, -2);
    const seaP2 = IsometricEngine.worldToIso(1600, -800, -2);
    const seaP3 = IsometricEngine.worldToIso(1600, 1600, -2);
    const seaP4 = IsometricEngine.worldToIso(-800, 1600, -2);

    ctx.beginPath();
    ctx.moveTo(seaP1.x, seaP1.y);
    ctx.lineTo(seaP2.x, seaP2.y);
    ctx.lineTo(seaP3.x, seaP3.y);
    ctx.lineTo(seaP4.x, seaP4.y);
    ctx.closePath();

    // Deep water palette
    if (isNight) {
      ctx.fillStyle = '#091524';
    } else {
      ctx.fillStyle = '#0284c7'; // Vibrant coastal turquoise
    }
    ctx.fill();

    // Animated water surface ripple lines
    ctx.strokeStyle = isNight ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 1.2;
    for (let wy = -400; wy <= 1200; wy += 80) {
      const waveShift = Math.sin(now * 0.002 + wy * 0.02) * 6;
      const w1 = IsometricEngine.worldToIso(-600, wy + waveShift, -1);
      const w2 = IsometricEngine.worldToIso(1400, wy + waveShift, -1);
      ctx.beginPath();
      ctx.moveTo(w1.x, w1.y);
      ctx.lineTo(w2.x, w2.y);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Continental Landmass Polygon (Peninsula where the 5 districts sit)
    ctx.save();
    const landPoints = [
      IsometricEngine.worldToIso(-200, -200, 0),
      IsometricEngine.worldToIso(650, -200, 0),
      IsometricEngine.worldToIso(650, 280, 0),
      IsometricEngine.worldToIso(720, 560, 0), // Towards Sports Beach
      IsometricEngine.worldToIso(380, 680, 0), // South Beach Cove
      IsometricEngine.worldToIso(60, 560, 0),  // Port Maritime Pier zone
      IsometricEngine.worldToIso(-200, 320, 0),
    ];

    ctx.beginPath();
    ctx.moveTo(landPoints[0].x, landPoints[0].y);
    for (let i = 1; i < landPoints.length; i++) {
      ctx.lineTo(landPoints[i].x, landPoints[i].y);
    }
    ctx.closePath();

    // Land base color (Urban Paver / Park ground)
    ctx.fillStyle = isNight ? '#161e2e' : '#e2e8f0';
    ctx.fill();
    ctx.strokeStyle = isNight ? '#1e293b' : '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 3. Sandy Shoreline & Beach (Sports Club & Azure Cove)
    ctx.save();
    const sandPoints = [
      IsometricEngine.worldToIso(360, 380, 0),
      IsometricEngine.worldToIso(680, 380, 0),
      IsometricEngine.worldToIso(700, 540, 0),
      IsometricEngine.worldToIso(380, 620, 0),
    ];
    ctx.beginPath();
    ctx.moveTo(sandPoints[0].x, sandPoints[0].y);
    for (let i = 1; i < sandPoints.length; i++) {
      ctx.lineTo(sandPoints[i].x, sandPoints[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = isNight ? '#3a3424' : '#fef08a'; // Golden sand
    ctx.fill();
    ctx.restore();

    // 4. Interconnecting Road Network (Grand Coastal Boulevard)
    // Linking Terrace -> Downtown -> Civic -> Port -> Sports
    this.renderAvenueBoulevard(ctx, isNight);

    // 5. Rose Kennedy Greenway Grass Park Ribbon
    this.renderGreenwayParkRibbon(ctx, isNight);
  }

  // Paved 4-lane Coastal Boulevard with lane markings & street lamps
  private static renderAvenueBoulevard(ctx: CanvasRenderingContext2D, isNight: boolean) {
    ctx.save();
    const roadColor = isNight ? '#0f172a' : '#334155';
    const markColor = isNight ? '#facc15' : '#ffffff';

    // Segment 1: Downtown to Civic Plaza
    const r1 = IsometricEngine.worldToIso(140, 160, 1);
    const r2 = IsometricEngine.worldToIso(420, 160, 1);
    ctx.strokeStyle = roadColor;
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r1.x, r1.y);
    ctx.lineTo(r2.x, r2.y);
    ctx.stroke();

    // Center dash marking
    ctx.strokeStyle = markColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(r1.x, r1.y);
    ctx.lineTo(r2.x, r2.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Segment 2: Downtown to Port Maritime
    const r3 = IsometricEngine.worldToIso(160, 160, 1);
    const r4 = IsometricEngine.worldToIso(160, 440, 1);
    ctx.strokeStyle = roadColor;
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(r3.x, r3.y);
    ctx.lineTo(r4.x, r4.y);
    ctx.stroke();

    // Center dash
    ctx.strokeStyle = markColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(r3.x, r3.y);
    ctx.lineTo(r4.x, r4.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Segment 3: Civic to Sports Club
    const r5 = IsometricEngine.worldToIso(420, 160, 1);
    const r6 = IsometricEngine.worldToIso(460, 390, 1);
    ctx.strokeStyle = roadColor;
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(r5.x, r5.y);
    ctx.lineTo(r6.x, r6.y);
    ctx.stroke();

    ctx.restore();
  }

  // Linear Greenway Park with Trees and Lawn
  private static renderGreenwayParkRibbon(ctx: CanvasRenderingContext2D, isNight: boolean) {
    ctx.save();
    const g1 = IsometricEngine.worldToIso(220, 120, 1);
    const g2 = IsometricEngine.worldToIso(360, 120, 1);
    const g3 = IsometricEngine.worldToIso(360, 240, 1);
    const g4 = IsometricEngine.worldToIso(220, 240, 1);

    ctx.beginPath();
    ctx.moveTo(g1.x, g1.y);
    ctx.lineTo(g2.x, g2.y);
    ctx.lineTo(g3.x, g3.y);
    ctx.lineTo(g4.x, g4.y);
    ctx.closePath();
    ctx.fillStyle = isNight ? '#064e3b' : '#10b981'; // Emerald grass
    ctx.fill();

    // Coastal Shade Trees along greenway
    const treePositions = [
      { x: 240, y: 140 },
      { x: 280, y: 140 },
      { x: 320, y: 140 },
      { x: 240, y: 220 },
      { x: 280, y: 220 },
      { x: 320, y: 220 },
    ];

    treePositions.forEach(tp => {
      const p = IsometricEngine.worldToIso(tp.x, tp.y, 0);
      // Trunk
      ctx.fillStyle = '#78350f';
      ctx.fillRect(p.x - 2, p.y - 12, 4, 12);
      // Foliage dome
      ctx.beginPath();
      ctx.arc(p.x, p.y - 18, 9, 0, Math.PI * 2);
      ctx.fillStyle = isNight ? '#047857' : '#22c55e';
      ctx.fill();
      ctx.strokeStyle = isNight ? '#064e3b' : '#15803d';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.restore();
  }

  // -------------------------------------------------------------
  // Z1: DISTRICT VIEW (Zoom 0.35 - 0.95)
  // Rich architectural massing for each of the 5 coastal districts
  // -------------------------------------------------------------
  static renderZ1DistrictMassing(
    ctx: CanvasRenderingContext2D,
    timeState: TimeState
  ) {
    // 1. Port Maritime & Fisherman's Wharf
    this.renderMaritimePortZone(ctx, timeState);

    // 2. Central Civic Square & Concentric Fountain Plaza
    this.renderCivicPlazaZone(ctx, timeState);

    // 3. Sports & Padel Club Complex + Beach
    this.renderSportsClubZone(ctx, timeState);

    // 4. Clean Energy Facility System 1.0 AIRMADE
    this.renderCleanEnergyPlant(ctx, timeState);

    // 5. Coastal Terrace Green-Roof Villas
    this.renderTerracedVillasZone(ctx, timeState);

    // 6. Moving Waterfront Vehicles
    this.renderMovingRoadVehicles(ctx, timeState);
  }

  // 1. Maritime Port & Fishermen Wharf
  private static renderMaritimePortZone(ctx: CanvasRenderingContext2D, time: TimeState) {
    const isNight = time.isNight;
    ctx.save();

    // Wooden Pier Jetty extending into the ocean
    ctx.fillStyle = isNight ? '#261c16' : '#854d0e';
    ctx.strokeStyle = '#1a110b';
    ctx.lineWidth = 1;

    // Jetty deck (wide wooden boardwalk)
    ctx.beginPath();
    const p1 = IsometricEngine.worldToIso(110, 400, 2);
    const p2 = IsometricEngine.worldToIso(170, 400, 2);
    const p3 = IsometricEngine.worldToIso(170, 560, 2);
    const p4 = IsometricEngine.worldToIso(110, 560, 2);
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wood plank ribs
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    for (let step = 410; step <= 550; step += 15) {
      const pl1 = IsometricEngine.worldToIso(110, step, 2);
      const pl2 = IsometricEngine.worldToIso(170, step, 2);
      ctx.beginPath();
      ctx.moveTo(pl1.x, pl1.y);
      ctx.lineTo(pl2.x, pl2.y);
      ctx.stroke();
    }

    // Moored vessels bobbing gently
    const bob = Math.sin(Date.now() * 0.002) * 2;
    this.renderVessel(ctx, 95, 430, bob, 'sailboat', isNight);
    this.renderVessel(ctx, 185, 470, -bob, 'trawler', isNight);
    this.renderVessel(ctx, 95, 510, bob * 0.8, 'catamaran', isNight);

    // Fishermen Market Hall building
    const mkt = IsometricEngine.worldToIso(230, 420, 0);
    ctx.fillStyle = isNight ? '#1e293b' : '#475569';
    ctx.fillRect(mkt.x - 35, mkt.y - 25, 70, 30);
    // Timber pitched roof
    ctx.beginPath();
    ctx.moveTo(mkt.x - 40, mkt.y - 25);
    ctx.lineTo(mkt.x, mkt.y - 45);
    ctx.lineTo(mkt.x + 40, mkt.y - 25);
    ctx.closePath();
    ctx.fillStyle = '#b45309';
    ctx.fill();
    ctx.stroke();

    // Market signage
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚓ FISH MARKET HALL', mkt.x, mkt.y - 12);

    ctx.restore();
  }

  // Vessel Renderer
  private static renderVessel(
    ctx: CanvasRenderingContext2D,
    wx: number,
    wy: number,
    bobY: number,
    type: 'sailboat' | 'trawler' | 'catamaran',
    isNight: boolean
  ) {
    const pos = IsometricEngine.worldToIso(wx, wy, 0);
    const y = pos.y + bobY;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(pos.x, y, 22, 9, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = type === 'sailboat' ? '#f8fafc' : type === 'trawler' ? '#0284c7' : '#f5ba31';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (type === 'sailboat') {
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pos.x, y);
      ctx.lineTo(pos.x, y - 35);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pos.x, y - 33);
      ctx.lineTo(pos.x + 14, y - 10);
      ctx.lineTo(pos.x, y - 8);
      ctx.closePath();
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
    } else if (type === 'trawler') {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(pos.x - 8, y - 16, 16, 12);
      ctx.strokeRect(pos.x - 8, y - 16, 16, 12);
      if (isNight) {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(pos.x - 5, y - 13, 10, 6);
      }
    }
    ctx.restore();
  }

  // 2. Central Civic Plaza with Concentric Rings & Fountain
  private static renderCivicPlazaZone(ctx: CanvasRenderingContext2D, time: TimeState) {
    const isNight = time.isNight;
    ctx.save();

    const plazaCenter = IsometricEngine.worldToIso(420, 150, 0);

    // Outer Plaza Ring
    ctx.beginPath();
    ctx.ellipse(plazaCenter.x, plazaCenter.y, 85, 42, 0, 0, Math.PI * 2);
    ctx.fillStyle = isNight ? '#1e293b' : '#e2e8f0';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Concentric Rings
    for (let r = 65; r >= 25; r -= 20) {
      ctx.beginPath();
      ctx.ellipse(plazaCenter.x, plazaCenter.y, r, r / 2, 0, 0, Math.PI * 2);
      ctx.strokeStyle = isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)';
      ctx.stroke();
    }

    // Center Fountain Pool
    ctx.beginPath();
    ctx.ellipse(plazaCenter.x, plazaCenter.y, 18, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = isNight ? '#0284c7' : '#38bdf8';
    ctx.fill();
    ctx.stroke();

    // Animated water fountain spray
    const sprayH = 10 + Math.sin(Date.now() * 0.005) * 3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.ellipse(plazaCenter.x, plazaCenter.y - sprayH, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 3. Sports Club & Beach (2 Blue Padel Courts, Olympic Pool, Beach)
  private static renderSportsClubZone(ctx: CanvasRenderingContext2D, time: TimeState) {
    const isNight = time.isNight;
    ctx.save();

    // Padel Court 1
    const court1 = IsometricEngine.worldToIso(470, 380, 0);
    this.drawPadelCourt(ctx, court1.x, court1.y, isNight);

    // Padel Court 2
    const court2 = IsometricEngine.worldToIso(505, 380, 0);
    this.drawPadelCourt(ctx, court2.x, court2.y, isNight);

    // Olympic Lap Pool
    const pool = IsometricEngine.worldToIso(485, 425, 0);
    ctx.fillStyle = isNight ? '#0369a1' : '#0ea5e9';
    ctx.fillRect(pool.x - 30, pool.y - 12, 60, 24);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pool.x - 30, pool.y - 12, 60, 24);

    // Pool swim lanes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    for (let ly = -6; ly <= 6; ly += 6) {
      ctx.beginPath();
      ctx.moveTo(pool.x - 30, pool.y + ly);
      ctx.lineTo(pool.x + 30, pool.y + ly);
      ctx.stroke();
    }

    // Beach parasols & cabanas
    const parasolColors = ['#f43f5e', '#0ea5e9', '#f59e0b', '#10b981'];
    for (let b = 0; b < 4; b++) {
      const bPos = IsometricEngine.worldToIso(530 + b * 20, 430 + b * 15, 0);
      ctx.beginPath();
      ctx.arc(bPos.x, bPos.y - 6, 6, 0, Math.PI * 2);
      ctx.fillStyle = parasolColors[b % parasolColors.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  private static drawPadelCourt(ctx: CanvasRenderingContext2D, x: number, y: number, isNight: boolean) {
    ctx.save();
    // Blue acrylic playing surface
    ctx.fillStyle = isNight ? '#0c4a6e' : '#0284c7';
    ctx.fillRect(x - 14, y - 24, 28, 48);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 14, y - 24, 28, 48);

    // Center Tennis Net
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 14, y);
    ctx.lineTo(x + 14, y);
    ctx.stroke();

    // Glass Walls
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.strokeRect(x - 15, y - 25, 30, 50);
    ctx.restore();
  }

  // 4. Clean Energy Plant AIRMADE
  private static renderCleanEnergyPlant(ctx: CanvasRenderingContext2D, time: TimeState) {
    const isNight = time.isNight;
    ctx.save();

    const plant = IsometricEngine.worldToIso(60, 480, 0);
    ctx.fillStyle = isNight ? '#0f172a' : '#f8fafc';
    ctx.fillRect(plant.x - 25, plant.y - 20, 50, 30);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(plant.x - 25, plant.y - 20, 50, 30);

    // Spinning DAC Fan
    const rot = (Date.now() * 0.006) % (Math.PI * 2);
    ctx.save();
    ctx.translate(plant.x, plant.y - 6);
    ctx.rotate(rot);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(8, 0);
    ctx.moveTo(0, -8);
    ctx.lineTo(0, 8);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('AIRMADE DAC 1.0', plant.x, plant.y + 16);

    ctx.restore();
  }

  // 5. Coastal Terrace Green-Roof Villas
  private static renderTerracedVillasZone(ctx: CanvasRenderingContext2D, time: TimeState) {
    const isNight = time.isNight;
    ctx.save();

    const villas = [
      { wx: 270, wy: -80, h: 22 },
      { wx: 310, wy: -60, h: 28 },
      { wx: 350, wy: -40, h: 18 },
    ];

    villas.forEach((v) => {
      const p = IsometricEngine.worldToIso(v.wx, v.wy, 0);
      // Modern villa facade
      ctx.fillStyle = isNight ? '#1e293b' : '#f8fafc';
      ctx.fillRect(p.x - 20, p.y - v.h, 40, v.h);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x - 20, p.y - v.h, 40, v.h);

      // Green sedum grass roof
      ctx.fillStyle = isNight ? '#064e3b' : '#22c55e';
      ctx.fillRect(p.x - 22, p.y - v.h - 4, 44, 4);

      // Warm interior window glow
      if (isNight) {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(p.x - 12, p.y - v.h + 5, 10, 8);
      }
    });

    ctx.restore();
  }

  // 6. Moving Waterfront Vehicles
  private static renderMovingRoadVehicles(ctx: CanvasRenderingContext2D, time: TimeState) {
    const isNight = time.isNight;
    const now = Date.now();

    // Vehicle 1: Cruising between Downtown and Civic
    const t1 = (now * 0.0004) % 1;
    const v1x = 160 + t1 * 240;
    const p1 = IsometricEngine.worldToIso(v1x, 160, 2);

    ctx.save();
    ctx.fillStyle = '#f5ba31'; // Yellow EV Sedan
    ctx.beginPath();
    ctx.ellipse(p1.x, p1.y, 10, 5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Headlight cone at night
    if (isNight) {
      ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
      ctx.beginPath();
      ctx.moveTo(p1.x + 8, p1.y + 2);
      ctx.lineTo(p1.x + 24, p1.y - 2);
      ctx.lineTo(p1.x + 24, p1.y + 8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}
