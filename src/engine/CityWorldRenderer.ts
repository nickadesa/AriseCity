import { TimeState, CityLandmark } from '../types/agent';
import { CITY_DISTRICTS } from './CityData';
import { IsometricEngine } from './IsometricEngine';

export class CityWorldRenderer {
  // -------------------------------------------------------------
  // Z0: MACRO CITY VECTOR MAP (Zoom < 0.35)
  // -------------------------------------------------------------
  static renderZ0CityMap(
    ctx: CanvasRenderingContext2D,
    _width: number,
    _height: number,
    timeState: TimeState,
    hoveredDistrictId: string | null,
    _onHoverCheck?: (districtId: string | null) => void
  ) {
    const isNight = timeState.isNight;
    const now = Date.now();

    // 1. Base Sea & Coastal Waters (Deep maritime palette)
    const seaGrad = ctx.createLinearGradient(-400, 100, 800, 800);
    if (isNight) {
      seaGrad.addColorStop(0, '#0a101d');
      seaGrad.addColorStop(0.5, '#0d182b');
      seaGrad.addColorStop(1, '#080d16');
    } else {
      seaGrad.addColorStop(0, '#19334d');
      seaGrad.addColorStop(0.4, '#1b3d5c');
      seaGrad.addColorStop(1, '#13283c');
    }

    ctx.fillStyle = seaGrad;
    ctx.fillRect(-600, -400, 1800, 1400);

    // 2. Animated Shore Wave Ripples
    ctx.save();
    ctx.strokeStyle = isNight ? 'rgba(56, 189, 248, 0.08)' : 'rgba(147, 197, 253, 0.16)';
    ctx.lineWidth = 1.5;
    for (let r = 0; r < 5; r++) {
      const offset = (now * 0.001 + r * 1.2) % 6;
      ctx.beginPath();
      // Wave arc hugging the waterfront
      ctx.ellipse(320, 360 + offset * 8, 380 + r * 30, 160 + r * 15, -0.15, 0, Math.PI);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Shipping Channel & Ferry Navigation Dotted Lines
    ctx.save();
    ctx.setLineDash([8, 8]);
    ctx.lineDashOffset = -(now * 0.02) % 16;
    ctx.strokeStyle = isNight ? 'rgba(245, 186, 49, 0.35)' : 'rgba(245, 186, 49, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(150, 460); // From Grand Ferry Wharf
    ctx.bezierCurveTo(280, 560, 450, 620, 750, 720); // Out to deep sea
    ctx.stroke();
    ctx.restore();

    // 4. District Boundary Polygons (Color-coded Landmasses)
    CITY_DISTRICTS.forEach((d) => {
      const isHovered = hoveredDistrictId === d.id;
      ctx.save();

      // Convert center to Iso coords
      const centerIso = IsometricEngine.worldToIso(d.centerPos.x, d.centerPos.y, 0);

      // District outline footprint (approximated rounded land zone)
      ctx.beginPath();
      let rx = 180;
      let ry = 95;
      if (d.id === 'downtown_waterfront') { rx = 190; ry = 100; }
      if (d.id === 'civic_promenade') { rx = 210; ry = 110; }
      if (d.id === 'port_maritime') { rx = 180; ry = 85; }
      if (d.id === 'sports_wellness') { rx = 160; ry = 90; }
      if (d.id === 'terrace_residential') { rx = 200; ry = 95; }

      ctx.ellipse(centerIso.x, centerIso.y, rx, ry, 0, 0, Math.PI * 2);

      // District Fill
      ctx.fillStyle = isNight ? 'rgba(26, 32, 44, 0.85)' : 'rgba(241, 245, 249, 0.88)';
      ctx.fill();

      // District Tint Overlay
      ctx.fillStyle = isHovered 
        ? `${d.colorHex}35` 
        : `${d.colorHex}18`;
      ctx.fill();

      // Border contour (Hierarchical ink stroke)
      ctx.lineWidth = isHovered ? 3 : 1.5;
      ctx.strokeStyle = isHovered ? d.accentHex : d.colorHex;
      ctx.stroke();

      // 5. District Name Badge in Z0
      ctx.fillStyle = isNight ? '#f8fafc' : '#0f172a';
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${d.icon} ${d.name}`, centerIso.x, centerIso.y - 12);

      ctx.fillStyle = isNight ? '#94a3b8' : '#475569';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(d.nameThai, centerIso.x, centerIso.y + 6);

      ctx.restore();
    });

    // 6. Greenway Ribbon (Rose Kennedy Greenway connecting Downtown to Beach)
    ctx.save();
    ctx.beginPath();
    const p1 = IsometricEngine.worldToIso(150, 180, 0);
    const p2 = IsometricEngine.worldToIso(320, 180, 0);
    const p3 = IsometricEngine.worldToIso(460, 220, 0);
    ctx.moveTo(p1.x, p1.y);
    ctx.bezierCurveTo((p1.x + p2.x)/2, p1.y - 10, (p2.x + p3.x)/2, p2.y + 10, p3.x, p3.y);
    ctx.strokeStyle = isNight ? '#059669' : '#10b981';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Text on Greenway
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🌿 ROSE KENNEDY GREENWAY RIBBON', (p1.x + p3.x)/2, (p1.y + p3.y)/2 - 12);
    ctx.restore();

    // 7. Iconic Landmark Pins (Clickable in Z0)
    CITY_DISTRICTS.forEach((d) => {
      d.landmarks.forEach((lm) => {
        const pinIso = IsometricEngine.worldToIso(lm.worldPos.x, lm.worldPos.y, 0);
        this.renderLandmarkPin(ctx, pinIso.x, pinIso.y, lm, isNight);
      });
    });
  }

  // -------------------------------------------------------------
  // LANDMARK PIN WIDGET (Z0 & Z1)
  // -------------------------------------------------------------
  private static renderLandmarkPin(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    lm: CityLandmark,
    isNight: boolean
  ) {
    ctx.save();

    // Pin shadow
    ctx.beginPath();
    ctx.ellipse(x, y + 4, 10, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();

    // Pin body (Catch Yellow or Marine Cyan)
    const isAriseHQ = lm.id === 'arise_hq';
    const bgCol = isAriseHQ ? '#f5ba31' : '#0f172a';
    const textCol = isAriseHQ ? '#000000' : '#ffffff';

    // Badge pill
    const label = `${lm.icon} ${lm.name.split(' (')[0]}`;
    ctx.font = isAriseHQ ? 'bold 11px sans-serif' : '10px sans-serif';
    const textWidth = ctx.measureText(label).width;
    const paddingX = 8;
    const badgeW = textWidth + paddingX * 2;
    const badgeH = 20;

    ctx.fillStyle = bgCol;
    ctx.strokeStyle = isAriseHQ ? '#ffffff' : (isNight ? '#0ea5e9' : '#38bdf8');
    ctx.lineWidth = isAriseHQ ? 1.5 : 1;
    
    // Draw rounded pill
    ctx.beginPath();
    ctx.roundRect(x - badgeW / 2, y - badgeH - 6, badgeW, badgeH, 10);
    ctx.fill();
    ctx.stroke();

    // Downward arrow pointer
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 6);
    ctx.lineTo(x + 4, y - 6);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fillStyle = bgCol;
    ctx.fill();

    // Text inside pin
    ctx.fillStyle = textCol;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y - badgeH / 2 - 6);

    ctx.restore();
  }

  // -------------------------------------------------------------
  // Z1: DISTRICT VIEW (Zoom 0.35 - 0.75)
  // -------------------------------------------------------------
  static renderZ1DistrictMassing(
    ctx: CanvasRenderingContext2D,
    timeState: TimeState
  ) {
    // 1. Port & Fishermen Wharf Structure (Docks, Piers, Market)
    this.renderMaritimePortZone(ctx, timeState);

    // 2. Central Civic Square & Concentric Fountain Plaza
    this.renderCivicPlazaZone(ctx, timeState);

    // 3. Sports & Padel Club Complex
    this.renderSportsClubZone(ctx, timeState);

    // 4. Clean Energy Facility System 1.0 AIRMADE
    this.renderCleanEnergyPlant(ctx, timeState);

    // 5. Coastal Terrace Green-Roof Villas
    this.renderTerracedVillasZone(ctx, timeState);

    // 6. Waterfront Road Vehicles (Electric Sedans, Delivery Vans, Buses)
    this.renderMovingRoadVehicles(ctx, timeState);
  }

  // -------------------------------------------------------------
  // DISTRICT SUB-SECTIONS (Matching Reference Images 1-28)
  // -------------------------------------------------------------

  // 1. Maritime Port & Fishermen Wharf (Image: Marina Pavilion, Pier, Trawlers)
  private static renderMaritimePortZone(ctx: CanvasRenderingContext2D, time: TimeState) {
    const isNight = time.isNight;
    ctx.save();

    // Wooden Pier Jetty extending into the sea
    ctx.fillStyle = isNight ? '#261c16' : '#6b4f3b';
    ctx.strokeStyle = '#1a110b';
    ctx.lineWidth = 1;

    // Jetty deck (wide wooden boardwalk)
    ctx.beginPath();
    const p1 = IsometricEngine.worldToIso(125, 410, 2);
    const p2 = IsometricEngine.worldToIso(155, 410, 2);
    const p3 = IsometricEngine.worldToIso(155, 520, 2);
    const p4 = IsometricEngine.worldToIso(125, 520, 2);
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wood planks hatching
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    for (let step = 420; step <= 510; step += 15) {
      const pl1 = IsometricEngine.worldToIso(125, step, 2);
      const pl2 = IsometricEngine.worldToIso(155, step, 2);
      ctx.beginPath();
      ctx.moveTo(pl1.x, pl1.y);
      ctx.lineTo(pl2.x, pl2.y);
      ctx.stroke();
    }

    // Moored Vessels (Trawlers & Sailboats bobbing)
    const bob = Math.sin(Date.now() * 0.002) * 2;
    this.renderVessel(ctx, 115, 440, bob, 'sailboat', isNight);
    this.renderVessel(ctx, 165, 470, -bob, 'trawler', isNight);
    this.renderVessel(ctx, 115, 500, bob * 0.7, 'catamaran', isNight);

    // Fishermen Market Hall building
    const mkt = IsometricEngine.worldToIso(240, 420, 0);
    ctx.fillStyle = isNight ? '#1e293b' : '#334155';
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

    // Market sign
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚓ FISH MARKET HALL', mkt.x, mkt.y - 12);

    ctx.restore();
  }

  // Vessel Renderer (Sailboat, Trawler, Catamaran)
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
    // Hull
    ctx.beginPath();
    ctx.ellipse(pos.x, y, 22, 9, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = type === 'sailboat' ? '#f8fafc' : type === 'trawler' ? '#0284c7' : '#f5ba31';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (type === 'sailboat') {
      // Tall mast & white sail
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pos.x, y);
      ctx.lineTo(pos.x, y - 35);
      ctx.stroke();

      // White triangular sail
      ctx.beginPath();
      ctx.moveTo(pos.x, y - 33);
      ctx.lineTo(pos.x + 14, y - 10);
      ctx.lineTo(pos.x, y - 8);
      ctx.closePath();
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
    } else if (type === 'trawler') {
      // Wheelhouse cabin + radar
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(pos.x - 8, y - 16, 16, 12);
      ctx.strokeRect(pos.x - 8, y - 16, 16, 12);
      if (isNight) {
        // Warm cabin window glow
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(pos.x - 5, y - 13, 10, 6);
      }
    }
    ctx.restore();
  }

  // 2. Central Civic Plaza with Concentric Rings & Fountain (Image: 564181a7...)
  private static renderCivicPlazaZone(ctx: CanvasRenderingContext2D, time: TimeState) {
    const isNight = time.isNight;
    ctx.save();

    const plazaCenter = IsometricEngine.worldToIso(420, 150, 0);

    // Outer Plaza Ring
    ctx.beginPath();
    ctx.ellipse(plazaCenter.x, plazaCenter.y, 80, 40, 0, 0, Math.PI * 2);
    ctx.fillStyle = isNight ? '#1e293b' : '#e2e8f0';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Concentric Inner Paving Rings
    for (let r = 60; r >= 20; r -= 20) {
      ctx.beginPath();
      ctx.ellipse(plazaCenter.x, plazaCenter.y, r, r / 2, 0, 0, Math.PI * 2);
      ctx.strokeStyle = isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)';
      ctx.stroke();
    }

    // Center Fountain Pool
    ctx.beginPath();
    ctx.ellipse(plazaCenter.x, plazaCenter.y, 16, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = isNight ? '#0284c7' : '#38bdf8';
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.stroke();

    // Water fountain spray animation
    const sprayH = 12 + Math.sin(Date.now() * 0.005) * 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(plazaCenter.x, plazaCenter.y);
    ctx.lineTo(plazaCenter.x, plazaCenter.y - sprayH);
    ctx.stroke();

    // Fountain Droplets
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
      const angle = (Date.now() * 0.003 + (i * Math.PI) / 2);
      const dx = Math.cos(angle) * 7;
      const dy = Math.sin(angle) * 4;
      ctx.fillRect(plazaCenter.x + dx, plazaCenter.y - sprayH + dy + 2, 2, 2);
    }

    // Plaza Trees in Grates surrounding the circle
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const tx = plazaCenter.x + Math.cos(angle) * 70;
      const ty = plazaCenter.y + Math.sin(angle) * 35;
      this.renderCanopyTree(ctx, tx, ty, isNight);
    }

    ctx.restore();
  }

  // 3. Sports & Padel Club Complex (Image: 70a64e32... & 43acaa82...)
  private static renderSportsClubZone(ctx: CanvasRenderingContext2D, time: TimeState) {
    const isNight = time.isNight;
    ctx.save();

    const sportsPos = IsometricEngine.worldToIso(480, 380, 0);

    // Club Building Base Slab
    ctx.fillStyle = isNight ? '#1e2430' : '#f1f5f9';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(sportsPos.x - 70, sportsPos.y - 35, 140, 70);
    ctx.fill();
    ctx.stroke();

    // 3 Glass Padel Courts (Green & Blue artificial turf)
    for (let i = 0; i < 3; i++) {
      const cx = sportsPos.x - 50 + i * 40;
      const cy = sportsPos.y - 15;

      // Padel Turf
      ctx.fillStyle = i === 1 ? '#0284c7' : '#059669'; // Blue center court, Green side courts
      ctx.fillRect(cx - 15, cy - 10, 30, 20);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(cx - 15, cy - 10, 30, 20);

      // Glass Enclosure walls
      ctx.strokeStyle = isNight ? 'rgba(56, 189, 248, 0.5)' : 'rgba(147, 197, 253, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - 16, cy - 18, 32, 26);

      // Net
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx, cy + 10);
      ctx.stroke();
    }

    // Swimming Pool beside padel courts
    ctx.fillStyle = isNight ? '#0369a1' : '#38bdf8';
    ctx.fillRect(sportsPos.x - 60, sportsPos.y + 12, 60, 16);
    ctx.strokeStyle = '#0284c7';
    ctx.strokeRect(sportsPos.x - 60, sportsPos.y + 12, 60, 16);

    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('🎾 ARISE PADEL CLUB', sportsPos.x - 45, sportsPos.y - 25);

    ctx.restore();
  }

  // 4. System 1.0 AIRMADE Clean Energy Hub (Image: 0ba5367c...)
  private static renderCleanEnergyPlant(ctx: CanvasRenderingContext2D, time: TimeState) {
    const isNight = time.isNight;
    ctx.save();

    const plantPos = IsometricEngine.worldToIso(60, 470, 0);

    // Steel frame industrial structure
    ctx.fillStyle = isNight ? '#111827' : '#1f2937';
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.2;

    // Foundation
    ctx.fillRect(plantPos.x - 30, plantPos.y - 15, 60, 25);
    ctx.strokeRect(plantPos.x - 30, plantPos.y - 15, 60, 25);

    // Twin Cylindrical Hydrogen Storage Tanks
    for (let t = 0; t < 2; t++) {
      const tx = plantPos.x - 18 + t * 24;
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(tx - 8, plantPos.y - 35, 16, 22, [8, 8, 2, 2]);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.stroke();

      // Catch Yellow Band
      ctx.fillStyle = '#f5ba31';
      ctx.fillRect(tx - 8, plantPos.y - 24, 16, 4);
    }

    // Clean exhaust plume (animated subtle vapor)
    const plume = Math.sin(Date.now() * 0.003) * 3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(plantPos.x - 10, plantPos.y - 42 + plume, 4, 0, Math.PI * 2);
    ctx.arc(plantPos.x + 14, plantPos.y - 44 - plume, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 7px monospace';
    ctx.fillText('⚡ AIRMADE 1.0', plantPos.x - 22, plantPos.y + 2);

    ctx.restore();
  }

  // 5. Coastal Terrace Green-Roof Eco-Villas (Image: 8b40f4bd...)
  private static renderTerracedVillasZone(ctx: CanvasRenderingContext2D, time: TimeState) {
    const isNight = time.isNight;
    ctx.save();

    const baseHill = IsometricEngine.worldToIso(300, -60, 0);

    // 3 Stepped Modern Villa volumes
    for (let v = 0; v < 3; v++) {
      const vx = baseHill.x - 40 + v * 35;
      const vy = baseHill.y - v * 20;

      // Villa Black Siding Volume
      ctx.fillStyle = isNight ? '#0f172a' : '#1e293b';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.fillRect(vx, vy, 38, 24);
      ctx.strokeRect(vx, vy, 38, 24);

      // Glass Curtain Wall
      ctx.fillStyle = isNight ? '#fef08a35' : '#38bdf840';
      ctx.fillRect(vx + 4, vy + 6, 30, 14);

      // Sedum Green Roof (Lush turf on roof slab)
      ctx.fillStyle = isNight ? '#2d4734' : '#607264';
      ctx.beginPath();
      ctx.rect(vx - 2, vy - 4, 42, 6);
      ctx.fill();
      ctx.strokeStyle = '#3f5643';
      ctx.stroke();

      // Mini autumn tree beside villa
      this.renderCanopyTree(ctx, vx + 45, vy + 10, isNight, '#d97706');
    }

    ctx.restore();
  }

  // Moving Road Vehicles
  private static renderMovingRoadVehicles(ctx: CanvasRenderingContext2D, time: TimeState) {
    const now = Date.now();
    ctx.save();

    // Road 1: Coastal Arterial Boulevard (x: 80 to 520, y: 260)
    const carProgress1 = ((now * 0.04) % 440) + 80;
    const carPos1 = IsometricEngine.worldToIso(carProgress1, 260, 0);
    this.renderCarSprite(ctx, carPos1.x, carPos1.y, '#f5ba31', 'sedan', time.isNight);

    // Road 2: Downtown Connector (x: 200, y: 50 to 450)
    const busProgress = ((now * 0.025) % 380) + 60;
    const busPos = IsometricEngine.worldToIso(200, busProgress, 0);
    this.renderCarSprite(ctx, busPos.x, busPos.y, '#38bdf8', 'bus', time.isNight);

    ctx.restore();
  }

  // Compact Car Sprite
  private static renderCarSprite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    type: 'sedan' | 'bus',
    isNight: boolean
  ) {
    ctx.save();
    const w = type === 'bus' ? 24 : 14;
    const h = type === 'bus' ? 10 : 7;

    // Car shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, w / 2 + 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = color;
    ctx.fillRect(x - w / 2, y - h, w, h);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - w / 2, y - h, w, h);

    // Headlight cones at night
    if (isNight) {
      ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y - h / 2);
      ctx.lineTo(x + w / 2 + 25, y - h / 2 - 8);
      ctx.lineTo(x + w / 2 + 25, y - h / 2 + 8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Canopy Tree Helper
  private static renderCanopyTree(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isNight: boolean,
    customColor?: string
  ) {
    ctx.save();
    // Trunk
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x - 1.5, y - 10, 3, 10);

    // Foliage sphere
    ctx.beginPath();
    ctx.arc(x, y - 14, 9, 0, Math.PI * 2);
    ctx.fillStyle = customColor 
      ? customColor 
      : isNight ? '#14532d' : '#88a759';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();
  }
}
