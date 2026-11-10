import { TimeState, Agent, AmbientNPC } from '../types/agent';
import { IsometricEngine } from './IsometricEngine';
import { PixelCharacterRenderer } from './PixelCharacterRenderer';
import { LOCATIONS } from '../store/agentStore';

export class IsometricRenderer {
  // Main Studio Render Loop
  static render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    panX: number,
    panY: number,
    zoom: number,
    timeState: TimeState,
    agents: Agent[],
    npcs: AmbientNPC[],
    selectedAgentId: string | null,
    selectedNpcId: string | null
  ) {
    // 1. Clear background (Atmospheric night/day gradient)
    this.renderBackdrop(ctx, width, height, timeState);

    ctx.save();
    ctx.translate(panX, panY);

    // Zoom transition:
    // If zoom < 0.85: blend into exterior modular container building (#BOXSPACES, Image 1 & 5)
    // If zoom >= 0.85: reveal full high-detail multi-level architectural cutaway interior (Images 1-4)
    const exteriorAlpha = Math.max(0, Math.min(1, (1.0 - zoom) / 0.4));
    const interiorAlpha = 1.0 - exteriorAlpha * 0.85;

    // 2. Render Ground Plane & Concrete Plaza (Image 1)
    this.renderGroundPlaza(ctx, zoom, timeState);

    // 3. Render Architectural Structure (Interior Cutaway + Mezzanine)
    if (interiorAlpha > 0.05) {
      ctx.save();
      ctx.globalAlpha = interiorAlpha;
      this.renderStudioInterior(ctx, zoom, timeState);
      ctx.restore();
    }

    // 4. Render Exterior Container Shell if zoomed out (Images 1 & 5)
    if (exteriorAlpha > 0.05) {
      ctx.save();
      ctx.globalAlpha = exteriorAlpha;
      this.renderExteriorContainerHQ(ctx, zoom, timeState);
      ctx.restore();
    }

    // 5. Render All Characters (Sorted by Isometric Depth Y + X for correct occlusion)
    this.renderDepthSortedEntities(
      ctx,
      zoom,
      timeState,
      agents,
      npcs,
      selectedAgentId,
      selectedNpcId
    );

    // 6. Render Dynamic Lighting, Emissive Glows & Time-of-Day Atmosphere
    this.renderLightingAndAtmosphere(ctx, width, height, panX, panY, zoom, timeState);

    ctx.restore();
  }

  // -------------------------------------------------------------
  // BACKDROP & PLAZA (Images 1 & 5)
  // -------------------------------------------------------------

  private static renderBackdrop(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: TimeState
  ) {
    const { phase, isNight } = time;
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);

    if (isNight) {
      bgGrad.addColorStop(0, '#090b10');
      bgGrad.addColorStop(1, '#0e121a');
    } else if (phase === 'dawn') {
      bgGrad.addColorStop(0, '#1c1b29');
      bgGrad.addColorStop(1, '#2c2538');
    } else if (phase === 'dusk') {
      bgGrad.addColorStop(0, '#1a1924');
      bgGrad.addColorStop(1, '#2a2228');
    } else {
      bgGrad.addColorStop(0, '#12151c');
      bgGrad.addColorStop(1, '#1a1f29');
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
  }

  private static renderGroundPlaza(
    ctx: CanvasRenderingContext2D,
    zoom: number,
    time: TimeState
  ) {
    ctx.save();
    ctx.scale(zoom, zoom);

    // Plaza Floor: Crisp modern textured grid
    const p1 = IsometricEngine.worldToIso(-40, -40, 0);
    const p2 = IsometricEngine.worldToIso(340, -40, 0);
    const p3 = IsometricEngine.worldToIso(340, 340, 0);
    const p4 = IsometricEngine.worldToIso(-40, 340, 0);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();

    ctx.fillStyle = time.isNight ? '#141820' : '#1f242e';
    ctx.fill();

    // Subtle isometric grid lines on plaza
    ctx.strokeStyle = time.isNight ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 300; i += 50) {
      const a = IsometricEngine.worldToIso(i, -20, 0);
      const b = IsometricEngine.worldToIso(i, 320, 0);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  // -------------------------------------------------------------
  // STUDIO INTERIOR CUTAWAY (Images 1-4)
  // -------------------------------------------------------------

  private static renderStudioInterior(
    ctx: CanvasRenderingContext2D,
    zoom: number,
    time: TimeState
  ) {
    ctx.save();
    ctx.scale(zoom, zoom);

    // 1. Lower Engineering Floor (White epoxy / terrazzo floor, Image 2 & 3)
    this.drawIsoPolygon(
      ctx,
      [
        { x: 20, y: 80, z: 0 },
        { x: 280, y: 80, z: 0 },
        { x: 280, y: 280, z: 0 },
        { x: 20, y: 280, z: 0 },
      ],
      time.isNight ? '#222733' : '#f1f5f9', // Crisp clean white epoxy floor
      '#cbd5e1'
    );

    // 2. Yellow Accent Column & Elevator "Catch 01" (Image 3 & 4)
    this.drawYellowElevatorPillar(ctx, time);

    // 3. Bleacher Steps with Green Cushions (Image 1)
    this.drawBleacherSteps(ctx, time);

    // 4. Metal Spiral Staircase (Left, to Boss Suite)
    this.drawSpiralStaircase(ctx, time);

    // 5. Upper Mezzanine Floor (+48px Elevation)
    this.drawMezzanineFloor(ctx, time);

    // 6. Boss Suite (Far Left on Mezzanine)
    this.drawBossSuite(ctx, time);

    // 7. Conference Room (Center on Mezzanine)
    this.drawConferenceRoom(ctx, time);

    // 8. Pantry & Coffee Bar + Emerald Curved Sofa (Right on Mezzanine)
    this.drawUpperLoungeAndPantry(ctx, time);

    // 9. Lower Floor Workstation Desks (5 Dev Clusters)
    this.drawWorkstationDesks(ctx, time);

    // 10. Office Props: Water Cooler, Photocopier, Kanban Board, Diff Station
    this.drawOfficeProps(ctx, time);

    ctx.restore();
  }

  // -------------------------------------------------------------
  // ARCHITECTURAL COMPONENTS
  // -------------------------------------------------------------

  // Yellow Accent Pillar & Elevator Lobby (From Images 3 & 4: "catch 01")
  private static drawYellowElevatorPillar(ctx: CanvasRenderingContext2D, _time: TimeState) {
    const x = 160;
    const y = 80;
    const w = 24;
    const h = 70;

    // Front Face (Catch Vibrant Yellow)
    const p1 = IsometricEngine.worldToIso(x, y, 0);
    const p2 = IsometricEngine.worldToIso(x + w, y, 0);
    const p3 = IsometricEngine.worldToIso(x + w, y, h);
    const p4 = IsometricEngine.worldToIso(x, y, h);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fillStyle = '#facc15';
    ctx.fill();

    // Side Face (Yellow Shadowed)
    const s1 = IsometricEngine.worldToIso(x + w, y, 0);
    const s2 = IsometricEngine.worldToIso(x + w, y + 16, 0);
    const s3 = IsometricEngine.worldToIso(x + w, y + 16, h);
    const s4 = IsometricEngine.worldToIso(x + w, y, h);

    ctx.beginPath();
    ctx.moveTo(s1.x, s1.y);
    ctx.lineTo(s2.x, s2.y);
    ctx.lineTo(s3.x, s3.y);
    ctx.lineTo(s4.x, s4.y);
    ctx.closePath();
    ctx.fillStyle = '#ca8a04';
    ctx.fill();

    // Black Digital Signage "01 ARISECITY" on Pillar (Image 3)
    const signPos = IsometricEngine.worldToIso(x + w + 1, y + 6, 25);
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(signPos.x - 10, signPos.y - 12, 18, 22);

    ctx.fillStyle = '#facc15';
    ctx.font = '700 8px "Inter", sans-serif';
    ctx.fillText('01', signPos.x - 7, signPos.y - 2);
    ctx.font = '600 4px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CITY', signPos.x - 6, signPos.y + 6);
    ctx.restore();
  }

  // Stadium Bleacher Steps with Green Cushions (Image 1)
  private static drawBleacherSteps(ctx: CanvasRenderingContext2D, time: TimeState) {
    const steps = 4;
    const startX = 220;
    const startY = 90;

    for (let i = 0; i < steps; i++) {
      const z = i * 12;
      const x = startX + i * 8;
      const w = 30;
      const d = 16;

      // Bleacher step timber tread
      this.drawIsoPolygon(
        ctx,
        [
          { x, y: startY, z },
          { x: x + w, y: startY, z },
          { x: x + w, y: startY + d, z },
          { x, y: startY + d, z },
        ],
        time.isNight ? '#382b20' : '#854d0e',
        '#713f12'
      );

      // Emerald green sitting cushions (Image 1)
      if (i > 0) {
        this.drawIsoPolygon(
          ctx,
          [
            { x: x + 6, y: startY + 3, z: z + 1 },
            { x: x + 16, y: startY + 3, z: z + 1 },
            { x: x + 16, y: startY + 11, z: z + 1 },
            { x: x + 6, y: startY + 11, z: z + 1 },
          ],
          '#10b981',
          '#059669'
        );
      }
    }
  }

  // Spiral Metal Staircase (Connecting lower floor to Boss Suite)
  private static drawSpiralStaircase(ctx: CanvasRenderingContext2D, _time: TimeState) {
    const centerX = 50;
    const centerY = 65;
    const steps = 6;

    // Central steel pole
    const pBottom = IsometricEngine.worldToIso(centerX, centerY, 0);
    const pTop = IsometricEngine.worldToIso(centerX, centerY, 52);

    ctx.beginPath();
    ctx.moveTo(pBottom.x, pBottom.y);
    ctx.lineTo(pTop.x, pTop.y);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Spiral treads
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 1.5;
      const z = i * 8;
      const tx = centerX + Math.cos(angle) * 14;
      const ty = centerY + Math.sin(angle) * 14;

      const p1 = IsometricEngine.worldToIso(centerX, centerY, z);
      const p2 = IsometricEngine.worldToIso(tx, ty, z);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  // Upper Mezzanine Floor (+48px)
  private static drawMezzanineFloor(ctx: CanvasRenderingContext2D, time: TimeState) {
    // Mezzanine slab
    this.drawIsoPolygon(
      ctx,
      [
        { x: 20, y: 15, z: 48 },
        { x: 280, y: 15, z: 48 },
        { x: 280, y: 75, z: 48 },
        { x: 20, y: 75, z: 48 },
      ],
      time.isNight ? '#1e232e' : '#e2e8f0',
      '#94a3b8'
    );

    // Glass Balustrade along mezzanine edge (Image 1)
    const b1 = IsometricEngine.worldToIso(20, 75, 48);
    const b2 = IsometricEngine.worldToIso(280, 75, 48);
    const bTop1 = IsometricEngine.worldToIso(20, 75, 60);
    const bTop2 = IsometricEngine.worldToIso(280, 75, 60);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(b1.x, b1.y);
    ctx.lineTo(b2.x, b2.y);
    ctx.lineTo(bTop2.x, bTop2.y);
    ctx.lineTo(bTop1.x, bTop1.y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'; // Glass tint
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  // Boss Executive Suite (Far Left on Mezzanine)
  private static drawBossSuite(ctx: CanvasRenderingContext2D, _time: TimeState) {
    const x = 25;
    const y = 20;

    // Executive Mahogany Desk
    this.drawIsoPolygon(
      ctx,
      [
        { x, y, z: 48 },
        { x: x + 24, y, z: 48 },
        { x: x + 24, y: y + 14, z: 48 },
        { x, y: y + 14, z: 48 },
      ],
      '#451a03',
      '#270e02'
    );

    // Boss Laptop & Desk Lamp
    const laptopPos = IsometricEngine.worldToIso(x + 10, y + 6, 56);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(laptopPos.x - 3, laptopPos.y - 4, 6, 4);

    // Glowing Decision Waiting Mat outside Boss Door!
    const mat = LOCATIONS.BOSS_DOOR_WAITING_MAT;
    this.drawIsoPolygon(
      ctx,
      [
        { x: mat.x - 6, y: mat.y - 6, z: 48 },
        { x: mat.x + 6, y: mat.y - 6, z: 48 },
        { x: mat.x + 6, y: mat.y + 6, z: 48 },
        { x: mat.x - 6, y: mat.y + 6, z: 48 },
      ],
      'rgba(250, 204, 21, 0.3)',
      '#facc15'
    );
  }

  // Central Conference Room (Mezzanine Center)
  private static drawConferenceRoom(ctx: CanvasRenderingContext2D, time: TimeState) {
    const cx = 115;
    const cy = 25;

    // Long Timber Conference Table (8 Seats)
    this.drawIsoPolygon(
      ctx,
      [
        { x: cx, y: cy, z: 48 },
        { x: cx + 45, y: cy, z: 48 },
        { x: cx + 45, y: cy + 16, z: 48 },
        { x: cx, y: cy + 16, z: 48 },
      ],
      time.isNight ? '#451a03' : '#78350f',
      '#270e02'
    );

    // Glass wall separation overlooking atrium
    const g1 = IsometricEngine.worldToIso(cx - 5, cy + 22, 48);
    const g2 = IsometricEngine.worldToIso(cx + 50, cy + 22, 48);
    const g3 = IsometricEngine.worldToIso(cx + 50, cy + 22, 68);
    const g4 = IsometricEngine.worldToIso(cx - 5, cy + 22, 68);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(g1.x, g1.y);
    ctx.lineTo(g2.x, g2.y);
    ctx.lineTo(g3.x, g3.y);
    ctx.lineTo(g4.x, g4.y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  // Upper Lounge & Coffee Pantry (Top-Right on Mezzanine)
  private static drawUpperLoungeAndPantry(ctx: CanvasRenderingContext2D, _time: TimeState) {
    // Espresso Counter Bar
    this.drawIsoPolygon(
      ctx,
      [
        { x: 195, y: 22, z: 48 },
        { x: 235, y: 22, z: 48 },
        { x: 235, y: 32, z: 48 },
        { x: 195, y: 32, z: 48 },
      ],
      '#0f172a',
      '#334155'
    );

    // Espresso Machine (Silver chrome + red button)
    const espPos = IsometricEngine.worldToIso(205, 26, 56);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(espPos.x - 4, espPos.y - 6, 8, 7);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(espPos.x - 1, espPos.y - 4, 2, 2);

    // Emerald Curved Sofa Pod (Image 1)
    this.drawIsoPolygon(
      ctx,
      [
        { x: 245, y: 28, z: 48 },
        { x: 275, y: 28, z: 48 },
        { x: 275, y: 55, z: 48 },
        { x: 260, y: 55, z: 48 },
      ],
      '#047857',
      '#065f46'
    );

    // Round Coffee Table
    const tablePos = IsometricEngine.worldToIso(252, 42, 48);
    ctx.beginPath();
    ctx.ellipse(tablePos.x, tablePos.y, 8, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#78350f';
    ctx.fill();
  }

  // Lower Floor Workstations (5 Dev Desks: Orion, Nova, Cipher, Vortex, Echo)
  private static drawWorkstationDesks(ctx: CanvasRenderingContext2D, time: TimeState) {
    const desks = [
      { id: 1, loc: LOCATIONS.DESK_1, name: 'Orion (Lead)', codeColor: '#6366f1' },
      { id: 2, loc: LOCATIONS.DESK_2, name: 'Nova (Frontend)', codeColor: '#10b981' },
      { id: 3, loc: LOCATIONS.DESK_3, name: 'Cipher (Backend)', codeColor: '#8b5cf6' },
      { id: 4, loc: LOCATIONS.DESK_4, name: 'Vortex (DevOps)', codeColor: '#f43f5e' },
      { id: 5, loc: LOCATIONS.DESK_5, name: 'Echo (QA)', codeColor: '#06b6d4' },
    ];

    desks.forEach(desk => {
      const { x, y } = desk.loc;

      // Modern Matte Black Desk Surface
      this.drawIsoPolygon(
        ctx,
        [
          { x: x - 12, y: y - 7, z: 0 },
          { x: x + 12, y: y - 7, z: 0 },
          { x: x + 12, y: y + 7, z: 0 },
          { x: x - 12, y: y + 7, z: 0 },
        ],
        time.isNight ? '#181b22' : '#334155',
        '#0f172a'
      );

      // Dual Monitors with glowing code screens!
      const mon1 = IsometricEngine.worldToIso(x - 4, y - 5, 8);
      const mon2 = IsometricEngine.worldToIso(x + 4, y - 5, 8);

      // Left monitor
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(mon1.x - 5, mon1.y - 7, 10, 7);
      ctx.fillStyle = desk.codeColor;
      ctx.fillRect(mon1.x - 4, mon1.y - 6, 8, 5);

      // Right monitor
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(mon2.x - 5, mon2.y - 7, 10, 7);
      ctx.fillStyle = desk.codeColor;
      ctx.fillRect(mon2.x - 4, mon2.y - 6, 8, 5);

      // Night Screen Glow onto desk surface
      if (time.isNight) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(mon1.x, mon1.y + 4, 12, 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = desk.codeColor === '#10b981' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(139, 92, 246, 0.25)';
        ctx.fill();
        ctx.restore();
      }
    });
  }

  // Office Utility Corner: Water Cooler, Photocopier, Kanban Wall, Diff Station
  private static drawOfficeProps(ctx: CanvasRenderingContext2D, _time: TimeState) {
    // 1. Water Cooler
    const wc = LOCATIONS.WATER_COOLER;
    const wcPos = IsometricEngine.worldToIso(wc.x, wc.y, 0);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(wcPos.x - 4, wcPos.y - 14, 8, 14);
    // Blue water bottle top
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(wcPos.x, wcPos.y - 18, 4, 0, Math.PI * 2);
    ctx.fill();

    // 2. High-speed Photocopier
    const cop = LOCATIONS.PHOTOCOPIER;
    const copPos = IsometricEngine.worldToIso(cop.x, cop.y, 0);
    ctx.fillStyle = '#334155';
    ctx.fillRect(copPos.x - 7, copPos.y - 12, 14, 12);
    // Green power LED
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(copPos.x + 3, copPos.y - 10, 2, 2);

    // 3. Giant Interactive Task Wall (Kanban Board)
    const tb = LOCATIONS.TASK_BOARD;
    const p1 = IsometricEngine.worldToIso(tb.x - 18, tb.y, 0);
    const p2 = IsometricEngine.worldToIso(tb.x + 18, tb.y, 0);
    const p3 = IsometricEngine.worldToIso(tb.x + 18, tb.y, 35);
    const p4 = IsometricEngine.worldToIso(tb.x - 18, tb.y, 35);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Sticky note colored squares on board
    const boardCenter = IsometricEngine.worldToIso(tb.x, tb.y, 18);
    ctx.fillStyle = '#fef08a'; // yellow sticky
    ctx.fillRect(boardCenter.x - 8, boardCenter.y - 6, 4, 4);
    ctx.fillStyle = '#86efac'; // green sticky
    ctx.fillRect(boardCenter.x - 2, boardCenter.y - 6, 4, 4);
    ctx.fillStyle = '#93c5fd'; // blue sticky
    ctx.fillRect(boardCenter.x + 4, boardCenter.y - 6, 4, 4);
    ctx.restore();

    // 4. Merge & Diff Station
    const ds = LOCATIONS.DIFF_STATION;
    this.drawIsoPolygon(
      ctx,
      [
        { x: ds.x - 10, y: ds.y - 8, z: 0 },
        { x: ds.x + 10, y: ds.y - 8, z: 0 },
        { x: ds.x + 10, y: ds.y + 8, z: 0 },
        { x: ds.x - 10, y: ds.y + 8, z: 0 },
      ],
      '#0f172a',
      '#38bdf8'
    );
    const dsPos = IsometricEngine.worldToIso(ds.x, ds.y, 6);
    ctx.fillStyle = '#10b981';
    ctx.font = '700 6px monospace';
    ctx.fillText('GIT PR', dsPos.x - 8, dsPos.y);
  }

  // -------------------------------------------------------------
  // EXTERIOR CONTAINER BUILDING HQ (#BOXSPACES, Image 1 & 5)
  // -------------------------------------------------------------

  private static renderExteriorContainerHQ(
    ctx: CanvasRenderingContext2D,
    zoom: number,
    time: TimeState
  ) {
    ctx.save();
    ctx.scale(zoom, zoom);

    // Modular Charcoal Shipping Containers with Corrugated Texture
    const containers = [
      { x: 30, y: 70, w: 90, d: 45, h: 42, color: '#181c24' },
      { x: 130, y: 70, w: 100, d: 50, h: 42, color: '#13161c' },
      { x: 50, y: 25, w: 170, d: 45, h: 42, color: '#1f242e' },
    ];

    containers.forEach(box => {
      this.drawIsoBox(ctx, box.x, box.y, box.w, box.d, box.h, box.color);
    });

    // Yellow Exterior Staircases & Balcony Railings (From Image 5)
    this.drawYellowExteriorStaircase(ctx, 230, 70, time);

    // #BOXSPACES Brand Signage on Container Face
    const brandPos = IsometricEngine.worldToIso(70, 70, 26);
    ctx.save();
    ctx.fillStyle = '#facc15';
    ctx.font = '800 12px "Inter", sans-serif';
    ctx.fillText('#BOXSPACES', brandPos.x, brandPos.y);
    ctx.font = '600 6px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('ARISECITY HQ // MODULAR TECH CLUSTER', brandPos.x, brandPos.y + 9);
    ctx.restore();

    ctx.restore();
  }

  private static drawYellowExteriorStaircase(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: TimeState
  ) {
    // Vibrant Yellow Steel Framework (Image 5)
    const pBottom = IsometricEngine.worldToIso(x, y, 0);
    const pTop = IsometricEngine.worldToIso(x + 20, y - 20, 48);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pBottom.x, pBottom.y);
    ctx.lineTo(pTop.x, pTop.y);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Night Neon Glow on yellow stair
    if (time.isNight) {
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 15;
      ctx.stroke();
    }
    ctx.restore();
  }

  // -------------------------------------------------------------
  // DEPTH-SORTED ENTITY RENDERING
  // -------------------------------------------------------------

  private static renderDepthSortedEntities(
    ctx: CanvasRenderingContext2D,
    zoom: number,
    time: TimeState,
    agents: Agent[],
    npcs: AmbientNPC[],
    selectedAgentId: string | null,
    selectedNpcId: string | null
  ) {
    // Collect all renderable entities with isometric depth key: (x + y + z * 0.1)
    type EntityItem = 
      | { type: 'agent'; data: Agent; depth: number }
      | { type: 'npc'; data: AmbientNPC; depth: number };

    const items: EntityItem[] = [];

    agents.forEach(agent => {
      items.push({
        type: 'agent',
        data: agent,
        depth: agent.position.x + agent.position.y + agent.position.z * 0.05
      });
    });

    npcs.forEach(npc => {
      // Check schedule filter: night-only vs day-only
      if (npc.schedule === 'night' && !time.isNight) return;
      if (npc.schedule === 'day' && time.isNight) return;

      items.push({
        type: 'npc',
        data: npc,
        depth: npc.position.x + npc.position.y + npc.position.z * 0.05
      });
    });

    // Sort ascending by depth for proper occlusion
    items.sort((a, b) => a.depth - b.depth);

    // Render each entity
    items.forEach(item => {
      if (item.type === 'agent') {
        const agent = item.data;
        const pos = IsometricEngine.worldToIso(agent.position.x, agent.position.y, agent.position.z);
        PixelCharacterRenderer.renderAgent(
          ctx,
          agent,
          pos.x * zoom,
          pos.y * zoom,
          zoom,
          time.isNight
        );

        // Highlight ring if selected
        if (agent.id === selectedAgentId) {
          ctx.save();
          ctx.translate(pos.x * zoom, pos.y * zoom);
          ctx.scale(zoom, zoom);
          ctx.beginPath();
          ctx.ellipse(0, 0, 14, 7, 0, 0, Math.PI * 2);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      } else {
        const npc = item.data;
        const pos = IsometricEngine.worldToIso(npc.position.x, npc.position.y, npc.position.z);
        PixelCharacterRenderer.renderNPC(
          ctx,
          npc,
          pos.x * zoom,
          pos.y * zoom,
          zoom,
          time.isNight
        );

        // Highlight ring if selected
        if (npc.id === selectedNpcId) {
          ctx.save();
          ctx.translate(pos.x * zoom, pos.y * zoom);
          ctx.scale(zoom, zoom);
          ctx.beginPath();
          ctx.ellipse(0, 0, 14, 7, 0, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      }
    });
  }

  // -------------------------------------------------------------
  // DYNAMIC LIGHTING & ATMOSPHERE OVERLAY
  // -------------------------------------------------------------

  private static renderLightingAndAtmosphere(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    _panX: number,
    _panY: number,
    zoom: number,
    time: TimeState
  ) {
    const { isNight } = time;

    // Apply color grading atmospheric overlay
    const overlay = IsometricEngine.getAtmosphericOverlay(time);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // screen space
    ctx.globalCompositeOperation = overlay.blendMode;
    ctx.fillStyle = overlay.color;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // Night Lighting: Emissive Yellow Neon & Spotlight Cookies
    if (isNight) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // 1. Yellow Accent Pillar Glow
      const yp = IsometricEngine.worldToIso(172, 80, 20);
      const yellowGlow = ctx.createRadialGradient(
        yp.x * zoom, yp.y * zoom, 2,
        yp.x * zoom, yp.y * zoom, 90 * zoom
      );
      yellowGlow.addColorStop(0, 'rgba(250, 204, 21, 0.45)');
      yellowGlow.addColorStop(1, 'rgba(250, 204, 21, 0.0)');
      ctx.fillStyle = yellowGlow;
      ctx.beginPath();
      ctx.arc(yp.x * zoom, yp.y * zoom, 90 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // 2. Mezzanine Warm Ceiling Spotlights
      const mezLight = IsometricEngine.worldToIso(140, 45, 48);
      const warmGlow = ctx.createRadialGradient(
        mezLight.x * zoom, mezLight.y * zoom, 5,
        mezLight.x * zoom, mezLight.y * zoom, 120 * zoom
      );
      warmGlow.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
      warmGlow.addColorStop(1, 'rgba(254, 240, 138, 0.0)');
      ctx.fillStyle = warmGlow;
      ctx.beginPath();
      ctx.arc(mezLight.x * zoom, mezLight.y * zoom, 120 * zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // -------------------------------------------------------------
  // ISOMETRIC GEOMETRY HELPERS
  // -------------------------------------------------------------

  private static drawIsoPolygon(
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number; z: number }[],
    fillColor: string,
    strokeColor?: string
  ) {
    if (points.length < 3) return;
    const isoPts = points.map(p => IsometricEngine.worldToIso(p.x, p.y, p.z));

    ctx.beginPath();
    ctx.moveTo(isoPts[0].x, isoPts[0].y);
    for (let i = 1; i < isoPts.length; i++) {
      ctx.lineTo(isoPts[i].x, isoPts[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = fillColor;
    ctx.fill();

    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  private static drawIsoBox(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    d: number,
    h: number,
    topColor: string
  ) {
    // Top face
    this.drawIsoPolygon(
      ctx,
      [
        { x, y, z: h },
        { x: x + w, y, z: h },
        { x: x + w, y: y + d, z: h },
        { x, y: y + d, z: h },
      ],
      topColor,
      'rgba(0, 0, 0, 0.4)'
    );

    // Front-Right face
    this.drawIsoPolygon(
      ctx,
      [
        { x: x + w, y, z: 0 },
        { x: x + w, y: y + d, z: 0 },
        { x: x + w, y: y + d, z: h },
        { x: x + w, y, z: h },
      ],
      '#0f1218',
      'rgba(0, 0, 0, 0.5)'
    );

    // Front-Left face
    this.drawIsoPolygon(
      ctx,
      [
        { x, y: y + d, z: 0 },
        { x: x + w, y: y + d, z: 0 },
        { x: x + w, y: y + d, z: h },
        { x, y: y + d, z: h },
      ],
      '#1a1f28',
      'rgba(0, 0, 0, 0.5)'
    );
  }
}
