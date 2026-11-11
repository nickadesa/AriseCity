import * as THREE from 'three';

export class ThreeBuildingManager {
  public group: THREE.Group = new THREE.Group();
  
  // 4 Level Groups (1F Ground, 2F Executive, 3F AI Dev Lab, 4F Rooftop)
  public floor1Group: THREE.Group = new THREE.Group();
  public floor2Group: THREE.Group = new THREE.Group();
  public floor3Group: THREE.Group = new THREE.Group();
  public rooftopGroup: THREE.Group = new THREE.Group();

  public exteriorWalls: Array<{ mesh: THREE.Group; normalX: number; normalZ: number }> = [];

  // Interaction State
  public isInspected: boolean = false;
  public activeFloor: 1 | 2 | 3 | 4 = 1;

  // Clickable targets (Desks, Boss Door, Kanban, Kiosks)
  public interactiveObjects: THREE.Object3D[] = [];

  constructor() {
    this.buildAriseHQ();
    this.group.add(this.floor1Group);
    this.group.add(this.floor2Group);
    this.group.add(this.floor3Group);
    this.group.add(this.rooftopGroup);
  }

  private buildAriseHQ() {
    // 1:1 Metric Scale Dimensions: 28m Width × 18m Depth × 3.2m Floor Height (Total 12.8m with Rooftop)
    const bx = -2;
    const bz = -2;
    const bw = 28;
    const bd = 18;
    const floorH = 3.2;

    // Materials Palette
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.85 });
    const woodFloorMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    const yellowAccent = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4, metalness: 0.2 });

    // =========================================================================
    // 🏢 LEVEL 1: GROUND FLOOR (Creative Public Space & Coastal Cafe)
    // =========================================================================
    const f1Floor = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.18, bd), concreteMat);
    f1Floor.position.set(bx + bw / 2, 0.09, bz + bd / 2);
    f1Floor.receiveShadow = true;
    this.floor1Group.add(f1Floor);

    // 1.1 Grand Reception Counter (Curved front, marble & wood)
    const recCounter = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 1.05, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    );
    recCounter.position.set(bx + 7, 0.525 + 0.18, bz + 14);
    recCounter.castShadow = true;
    const recLogoStrip = new THREE.Mesh(
      new THREE.BoxGeometry(4.22, 0.12, 0.1),
      yellowAccent
    );
    recLogoStrip.position.set(bx + 7, 0.9 + 0.18, bz + 14.6);
    this.floor1Group.add(recCounter, recLogoStrip);

    // 1.2 Interactive AI Kiosks & Innovation Showcase Pedestals
    [-1.8, 0, 1.8].forEach((kx) => {
      const kiosk = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 1.6, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
      );
      kiosk.position.set(bx + 7 + kx, 0.8 + 0.18, bz + 10.5);
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.7, 0.02),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5 })
      );
      screen.position.set(bx + 7 + kx, 1.1 + 0.18, bz + 10.66);
      kiosk.castShadow = true;
      this.floor1Group.add(kiosk, screen);
    });

    // 1.3 Atrium Bleachers (Timber stepped seating for public events)
    for (let s = 0; s < 4; s++) {
      const bleacher = new THREE.Mesh(
        new THREE.BoxGeometry(5.2, 0.36, 0.85),
        new THREE.MeshStandardMaterial({ color: s % 2 === 0 ? 0xd97706 : 0xfde68a, roughness: 0.6 })
      );
      bleacher.position.set(bx + 19, (s + 1) * 0.36 - 0.18 + 0.18, bz + 13 + s * 0.85);
      bleacher.castShadow = bleacher.receiveShadow = true;
      this.floor1Group.add(bleacher);
    }

    // 1.4 Coastal Cafe & Espresso Bar (Right Wing: x = 16 to 26, z = 3 to 10)
    // Wood flooring for cafe area
    const cafeWoodFloor = new THREE.Mesh(
      new THREE.BoxGeometry(11, 0.02, 8.5),
      woodFloorMat
    );
    cafeWoodFloor.position.set(bx + 21.5, 0.19, bz + 7);
    cafeWoodFloor.receiveShadow = true;
    this.floor1Group.add(cafeWoodFloor);

    // Bar Counter (L-shaped)
    const barCounter = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 1.05, 1.0),
      darkWoodMat
    );
    barCounter.position.set(bx + 21, 0.525 + 0.18, bz + 4.5);
    barCounter.castShadow = true;

    // Espresso Machine (Stainless steel with twin dispensers)
    const espressoBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.6, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 })
    );
    espressoBody.position.set(bx + 21.5, 1.05 + 0.3 + 0.18, bz + 4.5);
    this.floor1Group.add(barCounter, espressoBody);

    // Communal Dining Table & High Stools (As seen in Reference Image 1)
    const commTable = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.08, 1.2),
      woodFloorMat
    );
    commTable.position.set(bx + 21, 0.85 + 0.18, bz + 8.5);
    commTable.castShadow = true;
    this.floor1Group.add(commTable);
    // 6 Stools
    [-1.2, 0, 1.2].forEach((tx) => {
      [-0.7, 0.7].forEach((tz) => {
        const stool = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 0.65, 12),
          steelMat
        );
        stool.position.set(bx + 21 + tx, 0.325 + 0.18, bz + 8.5 + tz);
        stool.castShadow = true;
        this.floor1Group.add(stool);
      });
    });

    // 1.5 Restroom cubicles with doors (Left rear corner: x = 2 to 6, z = 2 to 6)
    const restWall = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, floorH, 0.15),
      concreteMat
    );
    restWall.position.set(bx + 4.5, floorH / 2 + 0.18, bz + 6);
    this.floor1Group.add(restWall);

    // 1.6 Exterior Straight Steel Stairs with Railings (matching Reference Images 1 & 2!)
    this.buildStraightExteriorStairs(bx + bw + 0.4, bz + 2, floorH);

    // 1.7 Organized 20-Car Parking Lot (Left exterior: x = -18 to -4, z = 0 to 18)
    this.build20CarParkingLot(bx - 14, bz);

    // =========================================================================
    // 🏢 LEVEL 2: EXECUTIVE & STRATEGY FLOOR (y = 3.2m to 6.4m)
    // =========================================================================
    const f2Floor = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.2, bd), concreteMat);
    f2Floor.position.set(bx + bw / 2, floorH + 0.1, bz + bd / 2);
    f2Floor.receiveShadow = f2Floor.castShadow = true;
    this.floor2Group.add(f2Floor);

    // 2.1 Executive Boss Suite (Left front: x = 2 to 10, z = 8 to 16)
    const bossDesk = this.createExecutiveSuite();
    bossDesk.position.set(bx + 6.5, floorH + 0.2, bz + 12);
    this.floor2Group.add(bossDesk);

    // 2.2 Strategy Boardroom (Right wing: x = 14 to 26, z = 7 to 16)
    const boardroom = this.createBoardroom();
    boardroom.position.set(bx + 20, floorH + 0.2, bz + 12);
    this.floor2Group.add(boardroom);

    // 2.3 Collaboration Pods & Lounge (x = 3 to 12, z = 3 to 7)
    const pods = this.createCollaborationPods();
    pods.position.set(bx + 7, floorH + 0.2, bz + 5);
    this.floor2Group.add(pods);

    // 2.4 Exterior Viewing Balcony (Rear / Waterfront side: z = 0 to 3)
    const balcDeck = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.04, 3.2),
      woodFloorMat
    );
    balcDeck.position.set(bx + 18, floorH + 0.22, bz + 2);
    balcDeck.receiveShadow = true;
    this.floor2Group.add(balcDeck);

    // Second flight of straight stairs up to Level 3
    this.buildStraightExteriorStairs(bx + bw + 0.4, bz + 2, floorH, floorH);

    // =========================================================================
    // 🏢 LEVEL 3: CORE AI DEVELOPER CLUSTER & LAB (y = 6.4m to 9.6m)
    // =========================================================================
    const f3Floor = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.2, bd), concreteMat);
    f3Floor.position.set(bx + bw / 2, 2 * floorH + 0.1, bz + bd / 2);
    f3Floor.receiveShadow = f3Floor.castShadow = true;
    this.floor3Group.add(f3Floor);

    // 3.1 Five Workstations for AI Agents
    const devConfigs = [
      { id: 'desk_0', x: 5, z: 6, name: 'Antigravity (Copilot)', col: 0x38bdf8 },
      { id: 'desk_1', x: 5, z: 12, name: 'Orion (System Architect)', col: 0x6366f1 },
      { id: 'desk_2', x: 12, z: 6, name: 'Nova (Frontend Lead)', col: 0x10b981 },
      { id: 'desk_3', x: 12, z: 12, name: 'Cipher (Backend & DB)', col: 0xf59e0b },
      { id: 'desk_4', x: 18, z: 9, name: 'Vortex (DevOps & QA)', col: 0xec4899 },
    ];
    devConfigs.forEach((cfg) => {
      const desk = this.createDeveloperWorkstation(cfg.id, cfg.name, cfg.col);
      desk.position.set(bx + cfg.x, 2 * floorH + 0.2, bz + cfg.z);
      this.floor3Group.add(desk);
    });

    // 3.2 Neural Network Server Pod (Glass enclosure with blue LED racks)
    const serverPod = this.createMiniServerPod();
    serverPod.position.set(bx + 23, 2 * floorH + 0.2, bz + 5);
    this.floor3Group.add(serverPod);

    // 3.3 Tech Library & Focus Nook (x = 21 to 26, z = 10 to 16)
    const bookshelf = this.createBookshelfWall();
    bookshelf.position.set(bx + 24.5, 2 * floorH + 0.2, bz + 13);
    this.floor3Group.add(bookshelf);

    // 3.4 Developer Pantry (Coffee, fridge, snacks)
    const devPantry = this.createPantryLounge();
    devPantry.position.set(bx + 18, 2 * floorH + 0.2, bz + 4.5);
    this.floor3Group.add(devPantry);

    // 3.5 Kanban Task Board Wall (Clickable)
    const taskBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 2.2, 3.8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    );
    taskBoard.position.set(bx + 14, 2 * floorH + 1.3, bz + 16.5);
    taskBoard.name = 'TASK_BOARD';
    this.floor3Group.add(taskBoard);
    this.interactiveObjects.push(taskBoard);

    // Third flight of straight stairs up to Rooftop
    this.buildStraightExteriorStairs(bx + bw + 0.4, bz + 2, floorH, 2 * floorH);

    // =========================================================================
    // 🏢 LEVEL 4: ROOFTOP TERRACE (Sky Garden & Sunset Lounge, y = 9.6m+)
    // =========================================================================
    const roofSlab = new THREE.Mesh(
      new THREE.BoxGeometry(bw + 0.6, 0.35, bd + 0.6),
      steelMat
    );
    roofSlab.position.set(bx + bw / 2, 3 * floorH + 0.18, bz + bd / 2);
    roofSlab.castShadow = roofSlab.receiveShadow = true;
    this.rooftopGroup.add(roofSlab);

    // 4.1 Wooden Pergola Structure (x: 14 to 24, z: 8 to 15)
    const pergola = this.createPergola();
    pergola.position.set(bx + 18, 3 * floorH + 0.35, bz + 11);
    this.rooftopGroup.add(pergola);

    // 4.2 Outdoor Sectional L-Sofa & Cocktail Bar
    const skyLounge = this.createSkyLounge();
    skyLounge.position.set(bx + 18, 3 * floorH + 0.35, bz + 11);
    this.rooftopGroup.add(skyLounge);

    // 4.3 Sedum Living Green Turf Patches
    const sedumLawn = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.08, 9),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.95 })
    );
    sedumLawn.position.set(bx + 8, 3 * floorH + 0.4, bz + 8);
    this.rooftopGroup.add(sedumLawn);

    // 4.4 Glass Balustrade Perimeter Railings (Height 1.1m)
    this.buildGlassBalustrades(bx, bz, bw, bd, 3 * floorH + 0.35);

    // =========================================================================
    // 🏢 FAÇADE: EXTERIOR WALLS & GLASS CURTAIN PANELS (3 Floors)
    // =========================================================================
    this.buildSegmentedWalls(bx, bz, bw, bd, floorH);
  }

  // Straight Industrial Steel Stairs with Tubular Railings (Matching Photos!)
  private buildStraightExteriorStairs(x: number, z: number, floorH: number, startY: number = 0) {
    const stairGroup = new THREE.Group();
    const steelDark = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const railingMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.5, roughness: 0.2 });

    const numSteps = 16;
    const stepDepth = 0.35;
    const stepHeight = floorH / numSteps;
    const stairWidth = 1.6;

    for (let k = 0; k < numSteps; k++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(stairWidth, 0.08, stepDepth),
        steelDark
      );
      step.position.set(0, (k + 1) * stepHeight, k * stepDepth);
      step.castShadow = true;
      stairGroup.add(step);
    }

    // Railings on both sides
    [-stairWidth / 2, stairWidth / 2].forEach((rx) => {
      const railGeo = new THREE.CylinderGeometry(0.025, 0.025, numSteps * stepDepth * 1.3, 8);
      const rail = new THREE.Mesh(railGeo, railingMat);
      rail.rotation.x = Math.atan2(floorH, numSteps * stepDepth) - Math.PI / 2;
      rail.position.set(rx, floorH / 2 + 0.9, (numSteps * stepDepth) / 2);
      stairGroup.add(rail);
    });

    stairGroup.position.set(x, startY, z);
    this.group.add(stairGroup);
  }

  // 20-Car Parking Lot (2 bays of 10 cars with EV chargers and shade trees)
  private build20CarParkingLot(x: number, z: number) {
    const parkGroup = new THREE.Group();
    const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const chargerMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.4 });

    // Parking Asphalt Slab (12m × 18m)
    const slab = new THREE.Mesh(new THREE.BoxGeometry(11, 0.1, 18), asphaltMat);
    slab.position.set(5.5, 0.05, 9);
    slab.receiveShadow = true;
    parkGroup.add(slab);

    // 20 Parking bay line markings (10 on left bay, 10 on right bay)
    for (let i = 0; i < 10; i++) {
      const pz = 1.2 + i * 1.7;
      // White divider line
      const line = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.02, 0.12), lineMat);
      line.position.set(2.5, 0.11, pz);
      const line2 = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.02, 0.12), lineMat);
      line2.position.set(8.5, 0.11, pz);
      parkGroup.add(line, line2);

      // EV Charging Pillars on every 3rd bay
      if (i % 3 === 0) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, 0.25), chargerMat);
        post.position.set(0.3, 0.7, pz);
        post.castShadow = true;
        parkGroup.add(post);
      }
    }

    parkGroup.position.set(x, 0, z);
    this.floor1Group.add(parkGroup);
  }

  // Executive Boss Suite
  private createExecutiveSuite(): THREE.Group {
    const g = new THREE.Group();
    // Large Mahogany Desk
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.08, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x2e1065, roughness: 0.3 })
    );
    desk.position.y = 0.76;
    desk.castShadow = true;

    // Leather Highback Chair
    const chair = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.95, 0.65),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
    );
    chair.position.set(0, 0.6, -0.65);
    chair.castShadow = true;

    // Open Laptop on desk
    const laptopBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.015, 0.26),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 })
    );
    laptopBase.position.set(0, 0.81, 0.1);
    const laptopScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.24, 0.015),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 })
    );
    laptopScreen.position.set(0, 0.93, -0.02);
    laptopScreen.rotation.x = -0.2;

    // Boss Decision Door Mat (Clickable)
    const mat = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.02, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.7 })
    );
    mat.position.set(0, 0.01, 1.8);
    mat.name = 'BOSS_MAT';
    mat.userData = { type: 'decision_mat' };
    this.interactiveObjects.push(mat);

    g.add(desk, chair, laptopBase, laptopScreen, mat);
    return g;
  }

  // Strategy Boardroom (12-person Conference Table & 98" Display)
  private createBoardroom(): THREE.Group {
    const g = new THREE.Group();
    // Long Conference Table
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.08, 1.5),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 })
    );
    table.position.y = 0.76;
    table.castShadow = true;

    // 10 Swivel Chairs
    [-1.8, -0.9, 0, 0.9, 1.8].forEach((cx) => {
      [-1.0, 1.0].forEach((cz) => {
        const chair = new THREE.Mesh(
          new THREE.BoxGeometry(0.48, 0.6, 0.48),
          new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
        );
        chair.position.set(cx, 0.5, cz);
        chair.castShadow = true;
        g.add(chair);
      });
    });

    // 98" Wall Display Screen
    const wallScreen = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.6, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.5 })
    );
    wallScreen.position.set(0, 1.8, 3.8);

    g.add(table, wallScreen);
    return g;
  }

  // Collaboration Pods & Whiteboard
  private createCollaborationPods(): THREE.Group {
    const g = new THREE.Group();
    // Twin Booth Benches
    [-1.2, 1.2].forEach((bz) => {
      const bench = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.8, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.8 })
      );
      bench.position.set(0, 0.4, bz);
      g.add(bench);
    });
    // Center Table
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.06, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    table.position.y = 0.72;
    g.add(table);
    return g;
  }

  // Developer Workstation (Multi-monitor setups for AI Agents)
  private createDeveloperWorkstation(id: string, name: string, glowColor: number): THREE.Group {
    const g = new THREE.Group();
    // Desk Surface (1.5m × 0.8m × 0.75m)
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.06, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
    );
    desk.position.y = 0.72;
    desk.castShadow = true;

    // Curved / Multi-monitors
    const mon1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.34, 0.02),
      new THREE.MeshStandardMaterial({ color: glowColor, emissive: glowColor, emissiveIntensity: 0.4 })
    );
    mon1.position.set(-0.3, 0.98, -0.25);
    mon1.rotation.y = 0.15;

    const mon2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.34, 0.02),
      new THREE.MeshStandardMaterial({ color: glowColor, emissive: glowColor, emissiveIntensity: 0.4 })
    );
    mon2.position.set(0.3, 0.98, -0.25);
    mon2.rotation.y = -0.15;

    // Ergonomic Mesh Chair
    const chair = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.55, 0.52),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
    );
    chair.position.set(0, 0.45, 0.4);

    // Props: Coffee mug on desk
    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.09, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    );
    mug.position.set(0.6, 0.79, 0.15);

    g.add(desk, mon1, mon2, chair, mug);
    g.name = `DESK_${id}`;
    desk.userData = { id, name, type: 'desk' };
    this.interactiveObjects.push(desk);
    return g;
  }

  // Mini Server Pod
  private createMiniServerPod(): THREE.Group {
    const g = new THREE.Group();
    for (let r = 0; r < 2; r++) {
      const rack = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 2.2, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
      );
      rack.position.set(r * 1.1, 1.1, 0);
      rack.castShadow = true;

      // Glowing LED lights
      const leds = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.8, 0.02),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.8 })
      );
      leds.position.set(r * 1.1, 1.1, 0.46);
      g.add(rack, leds);
    }
    return g;
  }

  // Tall Bookshelf Wall
  private createBookshelfWall(): THREE.Group {
    const g = new THREE.Group();
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 2.4, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
    );
    shelf.position.y = 1.2;
    shelf.castShadow = true;
    g.add(shelf);
    return g;
  }

  // Developer Pantry Lounge
  private createPantryLounge(): THREE.Group {
    const g = new THREE.Group();
    // Counter
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.9, 0.75),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
    );
    counter.position.set(0, 0.45, 0);
    // Water Cooler
    const cooler = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 1.4, 0.45),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0 })
    );
    cooler.position.set(-1.8, 0.7, 0);
    g.add(counter, cooler);
    return g;
  }

  // Timber Pergola on Rooftop
  private createPergola(): THREE.Group {
    const g = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
    // 4 Vertical Posts
    [[-3, -2], [3, -2], [-3, 2], [3, 2]].forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.8, 0.18), woodMat);
      post.position.set(px, 1.4, pz);
      post.castShadow = true;
      g.add(post);
    });
    // Horizontal Rafters (6 slats)
    for (let i = -3; i <= 3; i += 1.2) {
      const rafter = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 4.4), woodMat);
      rafter.position.set(i, 2.8, 0);
      rafter.castShadow = true;
      g.add(rafter);
    }
    return g;
  }

  // Sky Lounge L-Sofa and Bar
  private createSkyLounge(): THREE.Group {
    const g = new THREE.Group();
    // L-shaped sofa
    const sofaMain = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.55, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.85 })
    );
    sofaMain.position.set(0, 0.28, -0.8);
    const sofaReturn = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.55, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.85 })
    );
    sofaReturn.position.set(1.35, 0.28, 0.7);
    g.add(sofaMain, sofaReturn);
    return g;
  }

  // Glass Balustrades on Rooftop
  private buildGlassBalustrades(bx: number, bz: number, bw: number, bd: number, y: number) {
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4, roughness: 0.1 });
    const postMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });

    // 4 Perimeter Glass walls
    const addRailing = (w: number, d: number, px: number, pz: number) => {
      const r = new THREE.Mesh(new THREE.BoxGeometry(w, 1.1, d), glassMat);
      r.position.set(px, y + 0.55, pz);
      this.rooftopGroup.add(r);
    };
    addRailing(bw, 0.08, bx + bw / 2, bz);
    addRailing(bw, 0.08, bx + bw / 2, bz + bd);
    addRailing(0.08, bd, bx, bz + bd / 2);
    addRailing(0.08, bd, bx + bw, bz + bd / 2);

    // 4 Corner structural steel posts
    [[bx, bz], [bx + bw, bz], [bx, bz + bd], [bx + bw, bz + bd]].forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.15, 0.12), postMat);
      post.position.set(px, y + 0.575, pz);
      this.rooftopGroup.add(post);
    });
  }

  // Façade Wall Segments (3 Floors)
  private buildSegmentedWalls(bx: number, bz: number, bw: number, bd: number, floorH: number) {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x181c24, roughness: 0.7 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, transparent: true, opacity: 0.45 });

    const createWallSegment = (x: number, y: number, z: number, w: number, _h: number, d: number, nx: number, nz: number) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);

      // Lower wall (0.7m)
      const lower = new THREE.Mesh(new THREE.BoxGeometry(w, 0.7, d), wallMat);
      lower.position.y = 0.35;
      lower.castShadow = true;

      // Middle glass band (1.6m)
      const glass = new THREE.Mesh(new THREE.BoxGeometry(w, 1.6, d), glassMat);
      glass.position.y = 1.5;

      // Upper wall (0.9m)
      const upper = new THREE.Mesh(new THREE.BoxGeometry(w, 0.9, d), wallMat);
      upper.position.y = 2.75;
      upper.castShadow = true;

      g.add(lower, glass, upper);
      this.group.add(g);
      this.exteriorWalls.push({ mesh: g, normalX: nx, normalZ: nz });
    };

    // Build for Floors 1, 2, and 3
    for (let fl = 0; fl < 3; fl++) {
      const y = fl * floorH;
      // North Wall (back: z = bz)
      createWallSegment(bx + bw / 2, y, bz, bw, floorH, 0.2, 0, -1);
      // West Wall (left: x = bx)
      createWallSegment(bx, y, bz + bd / 2, 0.2, floorH, bd, -1, 0);
      // East Wall (right: x = bx + bw)
      createWallSegment(bx + bw, y, bz + bd / 2, 0.2, floorH, bd, 1, 0);
      // South Wall (front: z = bz + bd) with entrance gap on ground floor
      if (fl === 0) {
        createWallSegment(bx + 5.5, y, bz + bd, 11, floorH, 0.2, 0, 1);
        createWallSegment(bx + 21.5, y, bz + bd, 11, floorH, 0.2, 0, 1);
      } else {
        createWallSegment(bx + bw / 2, y, bz + bd, bw, floorH, 0.2, 0, 1);
      }
    }
  }

  // Update Cutaway and Floor Visibility
  public updateCutaway(cameraAzimuth: number) {
    const fx = Math.sin(cameraAzimuth);
    const fz = Math.cos(cameraAzimuth);

    if (this.isInspected) {
      // Handle Floor Cutaway Visibility:
      // Floor 1: Ground only
      // Floor 2: Ground + Executive
      // Floor 3: Ground + Executive + AI Dev Lab
      // Floor 4: Full Rooftop
      this.floor1Group.visible = true;
      this.floor2Group.visible = this.activeFloor >= 2;
      this.floor3Group.visible = this.activeFloor >= 3;
      this.rooftopGroup.visible = this.activeFloor >= 4;

      // Drop camera-facing walls smoothly to reveal interior props like The Sims!
      this.exteriorWalls.forEach((w) => {
        const isFacingCamera = w.normalX * fx + w.normalZ * fz > 0.25;
        const targetScaleY = isFacingCamera ? 0.08 : 1.0;
        w.mesh.scale.y = THREE.MathUtils.lerp(w.mesh.scale.y, targetScaleY, 0.25);
      });
    } else {
      // Exterior Full Building View
      this.floor1Group.visible = true;
      this.floor2Group.visible = true;
      this.floor3Group.visible = true;
      this.rooftopGroup.visible = true;

      // Restore all exterior walls to full height
      this.exteriorWalls.forEach((w) => {
        w.mesh.scale.y = THREE.MathUtils.lerp(w.mesh.scale.y, 1.0, 0.2);
      });
    }
  }
}

