import * as THREE from 'three';

export class ThreeBuildingManager {
  public group: THREE.Group = new THREE.Group();
  
  // Floor groups
  public floor1Group: THREE.Group = new THREE.Group();
  public floor2Group: THREE.Group = new THREE.Group();
  public roofGroup: THREE.Group = new THREE.Group();
  public exteriorWalls: Array<{ mesh: THREE.Group; normalX: number; normalZ: number }> = [];

  // Interaction State
  public isInspected: boolean = false;
  public activeFloor: 1 | 2 = 1;

  // Clickable interactive targets (Desks, Boss Door, Kanban, Diff Station)
  public interactiveObjects: THREE.Object3D[] = [];

  constructor() {
    this.buildAriseHQ();
    this.group.add(this.floor1Group);
    this.group.add(this.floor2Group);
    this.group.add(this.roofGroup);
  }

  private buildAriseHQ() {
    // Arise HQ 1:1 Scale Dimensions: 24m Width × 16m Depth × 7m Height
    const bx = 0;
    const bz = 0;
    const bw = 24;
    const bd = 16;
    const floorH = 3.2;

    // -------------------------------------------------------------
    // 1. GROUND FLOOR (1F: y = 0 to 3.2m)
    // -------------------------------------------------------------
    // White epoxy / terrazzo floor slab
    const f1Floor = new THREE.Mesh(
      new THREE.BoxGeometry(bw, 0.15, bd),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 })
    );
    f1Floor.position.set(bx + bw / 2, 0.075, bz + bd / 2);
    f1Floor.receiveShadow = true;
    this.floor1Group.add(f1Floor);

    // Yellow Structural Column & Elevator Core "Catch 01" (x: 12, z: 4, h: 6.8m)
    const catchColumn = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 6.8, 2.4),
      new THREE.MeshStandardMaterial({ color: 0xf5ba31, roughness: 0.4, metalness: 0.2 })
    );
    catchColumn.position.set(bx + 12, 3.4, bz + 4);
    catchColumn.castShadow = catchColumn.receiveShadow = true;
    this.floor1Group.add(catchColumn);

    // Bleacher Steps with Green Cushions (x: 14 to 20, z: 3 to 6)
    for (let s = 0; s < 4; s++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 0.35, 0.8),
        new THREE.MeshStandardMaterial({ color: s % 2 === 0 ? 0x10b981 : 0xd1fae5, roughness: 0.7 })
      );
      step.position.set(bx + 17, (s + 1) * 0.35 - 0.175, bz + 3.5 + s * 0.8);
      step.castShadow = step.receiveShadow = true;
      this.floor1Group.add(step);
    }

    // 10 Interior Concrete & Steel Stairs rising to Level 2 (x: 8 to 12, z: 2)
    for (let k = 0; k < 10; k++) {
      const stair = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, (k + 1) * (floorH / 10), 1.4),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 })
      );
      stair.position.set(bx + 8 + k * 0.4, ((k + 1) * (floorH / 10)) / 2, bz + 2.5);
      stair.castShadow = stair.receiveShadow = true;
      this.floor1Group.add(stair);
    }

    // 5 Workstation Desks Cluster (Lower Floor Engineering)
    const deskConfigs = [
      { id: 'desk_0', x: 4, z: 8, name: 'Antigravity (Copilot)' },
      { id: 'desk_1', x: 4, z: 12, name: 'Orion (System Architect)' },
      { id: 'desk_2', x: 9, z: 8, name: 'Nova (Frontend Lead)' },
      { id: 'desk_3', x: 9, z: 12, name: 'Cipher (Backend & DB)' },
      { id: 'desk_4', x: 14, z: 10, name: 'Vortex (DevOps & QA)' },
    ];

    deskConfigs.forEach((cfg) => {
      const deskGroup = this.createDeskCluster(cfg.id, cfg.name);
      deskGroup.position.set(bx + cfg.x, 0.15, bz + cfg.z);
      this.floor1Group.add(deskGroup);
    });

    // Kanban Task Board Wall (x: 20, z: 10)
    const taskBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 2.2, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
    );
    taskBoard.position.set(bx + 21, 1.3, bz + 10);
    taskBoard.name = 'TASK_BOARD';
    this.floor1Group.add(taskBoard);
    this.interactiveObjects.push(taskBoard);

    // -------------------------------------------------------------
    // 2. MEZZANINE FLOOR (2F: y = 3.2m to 6.4m)
    // -------------------------------------------------------------
    // Concrete Slab with cutout hole for the staircase
    const slabShape = new THREE.Shape();
    slabShape.moveTo(0, 0);
    slabShape.lineTo(bw, 0);
    slabShape.lineTo(bw, bd);
    slabShape.lineTo(0, bd);
    slabShape.closePath();

    // Staircase Hole Cutout (x: 7.8m to 12.2m, z: 1.8m to 3.4m)
    const stairHole = new THREE.Path();
    stairHole.moveTo(7.8, 1.8);
    stairHole.lineTo(12.2, 1.8);
    stairHole.lineTo(12.2, 3.4);
    stairHole.lineTo(7.8, 3.4);
    stairHole.closePath();
    slabShape.holes.push(stairHole);

    const slabGeo = new THREE.ExtrudeGeometry(slabShape, { depth: 0.2, bevelEnabled: false });
    const slabMesh = new THREE.Mesh(
      slabGeo,
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 })
    );
    slabMesh.rotation.x = Math.PI / 2;
    slabMesh.position.set(bx, floorH + 0.2, bz);
    slabMesh.receiveShadow = slabMesh.castShadow = true;
    this.floor2Group.add(slabMesh);

    // Boss Executive Suite on 2F (x: 2 to 8, z: 2 to 7)
    const bossDesk = this.createExecutiveSuite();
    bossDesk.position.set(bx + 4.5, floorH + 0.2, bz + 4.5);
    this.floor2Group.add(bossDesk);

    // Glass Conference Room on 2F (x: 13 to 22, z: 8 to 14)
    const confRoom = this.createConferenceRoom();
    confRoom.position.set(bx + 17, floorH + 0.2, bz + 11);
    this.floor2Group.add(confRoom);

    // Coffee Bar Pantry & Emerald Curved Sofa (x: 2 to 7, z: 9 to 14)
    const pantry = this.createPantryLounge();
    pantry.position.set(bx + 4.5, floorH + 0.2, bz + 11.5);
    this.floor2Group.add(pantry);

    // -------------------------------------------------------------
    // 3. EXTERIOR WALLS & GLASS CURTAIN FAÇADE
    // -------------------------------------------------------------
    this.buildSegmentedWalls(bx, bz, bw, bd, floorH);

    // -------------------------------------------------------------
    // 4. ROOF STRUCTURE & SOLAR CANOPY
    // -------------------------------------------------------------
    const roofBase = new THREE.Mesh(
      new THREE.BoxGeometry(bw + 0.6, 0.35, bd + 0.6),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
    );
    roofBase.position.set(bx + bw / 2, 2 * floorH + 0.35, bz + bd / 2);
    roofBase.castShadow = roofBase.receiveShadow = true;

    // Green Sedum Turf Patch on Roof
    const greenRoof = new THREE.Mesh(
      new THREE.BoxGeometry(bw * 0.7, 0.08, bd * 0.6),
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.9 })
    );
    greenRoof.position.set(bx + bw / 2, 2 * floorH + 0.55, bz + bd / 2);

    this.roofGroup.add(roofBase, greenRoof);

    // Exterior Steel Staircase in Catch Yellow (#BOXSPACES icon)
    this.buildExteriorYellowStairs(bx + bw + 0.2, bz + bd - 5);
  }

  private buildSegmentedWalls(bx: number, bz: number, bw: number, bd: number, floorH: number) {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x181c24, roughness: 0.7 }); // Charcoal container
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

    // North Wall (back: z = bz)
    createWallSegment(bx + bw / 2, 0, bz, bw, floorH, 0.2, 0, -1);
    createWallSegment(bx + bw / 2, floorH, bz, bw, floorH, 0.2, 0, -1);

    // West Wall (left: x = bx)
    createWallSegment(bx, 0, bz + bd / 2, 0.2, floorH, bd, -1, 0);
    createWallSegment(bx, floorH, bz + bd / 2, 0.2, floorH, bd, -1, 0);

    // East Wall (right: x = bx + bw)
    createWallSegment(bx + bw, 0, bz + bd / 2, 0.2, floorH, bd, 1, 0);
    createWallSegment(bx + bw, floorH, bz + bd / 2, 0.2, floorH, bd, 1, 0);

    // South Wall (front: z = bz + bd) with entrance door gap
    createWallSegment(bx + 4.5, 0, bz + bd, 9, floorH, 0.2, 0, 1);
    createWallSegment(bx + 17.5, 0, bz + bd, 9, floorH, 0.2, 0, 1);
    createWallSegment(bx + bw / 2, floorH, bz + bd, bw, floorH, 0.2, 0, 1);
  }

  private createDeskCluster(id: string, name: string): THREE.Group {
    const g = new THREE.Group();
    // Desk surface (1.4m × 0.7m × 0.75m high)
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.06, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
    );
    desk.position.y = 0.72;
    desk.castShadow = true;

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.72, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    [[-0.6, -0.28], [0.6, -0.28], [-0.6, 0.28], [0.6, 0.28]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 0.36, lz);
      g.add(leg);
    });

    // Dual Monitor Stand
    const monitor1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.3, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.3 })
    );
    monitor1.position.set(-0.25, 0.95, -0.22);
    monitor1.rotation.y = 0.15;

    const monitor2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.3, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.3 })
    );
    monitor2.position.set(0.25, 0.95, -0.22);
    monitor2.rotation.y = -0.15;

    // Ergonomic Chair
    const chair = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
    );
    chair.position.set(0, 0.45, 0.35);

    g.add(desk, monitor1, monitor2, chair);
    g.name = `DESK_${id}`;
    desk.userData = { id, name, type: 'desk' };
    this.interactiveObjects.push(desk);
    return g;
  }

  private createExecutiveSuite(): THREE.Group {
    const g = new THREE.Group();
    // Executive Boss Desk
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.08, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.4 })
    );
    desk.position.y = 0.74;
    desk.castShadow = true;

    // Decision Door Waiting Mat (Clickable for Boss decisions)
    const mat = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.02, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xf5ba31, roughness: 0.8 })
    );
    mat.position.set(0, 0.01, 1.6);
    mat.name = 'BOSS_MAT';
    mat.userData = { type: 'decision_mat' };
    this.interactiveObjects.push(mat);

    g.add(desk, mat);
    return g;
  }

  private createConferenceRoom(): THREE.Group {
    const g = new THREE.Group();
    // Large Meeting Table
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.08, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
    );
    table.position.y = 0.74;
    table.castShadow = true;

    // 6 Meeting Chairs
    [-1.2, 0, 1.2].forEach((x) => {
      [ -0.9, 0.9 ].forEach((z) => {
        const chair = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, 0.5, 0.45),
          new THREE.MeshStandardMaterial({ color: 0x334155 })
        );
        chair.position.set(x, 0.45, z);
        g.add(chair);
      });
    });

    g.add(table);
    return g;
  }

  private createPantryLounge(): THREE.Group {
    const g = new THREE.Group();
    // Coffee Counter
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.9, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
    counter.position.set(0, 0.45, -1.2);

    // Emerald Curved Sofa (Image Reference 1)
    const sofa = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.55, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.8 })
    );
    sofa.position.set(0, 0.35, 1.0);

    g.add(counter, sofa);
    return g;
  }

  private buildExteriorYellowStairs(x: number, z: number) {
    const stairGroup = new THREE.Group();
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf5ba31, metalness: 0.3, roughness: 0.5 });

    // 12 exterior steps leading to 2F balcony
    for (let k = 0; k < 12; k++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.28, 0.4), yellowMat);
      step.position.set(0, (k + 1) * 0.28, -k * 0.4);
      step.castShadow = true;
      stairGroup.add(step);
    }
    stairGroup.position.set(x, 0, z);
    this.group.add(stairGroup);
  }

  public updateCutaway(cameraAzimuth: number) {
    const fx = Math.sin(cameraAzimuth);
    const fz = Math.cos(cameraAzimuth);

    if (this.isInspected) {
      // Hide roof completely when inspecting
      this.roofGroup.visible = false;

      // Handle Floor Visibility
      if (this.activeFloor === 1) {
        this.floor1Group.visible = true;
        this.floor2Group.visible = false;
      } else {
        this.floor1Group.visible = true;
        this.floor2Group.visible = true;
      }

      // Drop camera-facing exterior walls smoothly
      this.exteriorWalls.forEach((w) => {
        const isFacingCamera = w.normalX * fx + w.normalZ * fz > 0.25;
        const targetScaleY = isFacingCamera ? 0.08 : 1.0;
        w.mesh.scale.y = THREE.MathUtils.lerp(w.mesh.scale.y, targetScaleY, 0.25);
      });
    } else {
      // Exterior view: Solid building
      this.roofGroup.visible = true;
      this.floor1Group.visible = true;
      this.floor2Group.visible = true;

      // Restore all walls to full height
      this.exteriorWalls.forEach((w) => {
        w.mesh.scale.y = THREE.MathUtils.lerp(w.mesh.scale.y, 1.0, 0.2);
      });
    }
  }
}
