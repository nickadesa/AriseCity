import * as THREE from 'three';

export class ThreeTerrainRoads {
  public group: THREE.Group = new THREE.Group();
  private cars: Array<{ mesh: THREE.Group; speed: number; laneZ: number }> = [];
  private oceanWater!: THREE.Mesh;

  constructor() {
    this.createOceanWater();
    this.createLandAndBoulevard();
    this.createParkAndTrees();
    this.createStreetFurniture();
    this.createVehicles();
  }

  private createOceanWater() {
    // Vast Coastal Ocean Plane (at y = -0.45m)
    const oceanGeo = new THREE.PlaneGeometry(160, 80);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant coastal turquoise
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88,
    });
    this.oceanWater = new THREE.Mesh(oceanGeo, oceanMat);
    this.oceanWater.rotation.x = -Math.PI / 2;
    this.oceanWater.position.set(12, -0.45, 55);
    this.oceanWater.receiveShadow = true;
    this.group.add(this.oceanWater);
  }

  private createLandAndBoulevard() {
    // 1. Urban Concrete / Granite Plaza Base (1:1 scale: 64m x 48m, y = 0)
    const plazaGeo = new THREE.BoxGeometry(70, 0.4, 52);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Crisp light architectural concrete
      roughness: 0.9,
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.set(12, -0.2, 10);
    plaza.receiveShadow = true;
    this.group.add(plaza);

    // 2. Coastal Boulevard (Two-lane road: 7.0m wide, z = 22 to 29)
    const roadGeo = new THREE.BoxGeometry(70, 0.04, 7.0);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Dark asphalt
      roughness: 0.85,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(12, 0.02, 25.5);
    road.receiveShadow = true;
    this.group.add(road);

    // Center Road Divider Dashes (0.15m x 1.5m dashes)
    const dashMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.8 });
    for (let x = -22; x <= 46; x += 4) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 0.18), dashMat);
      dash.position.set(x, 0.03, 25.5);
      this.group.add(dash);
    }

    // Pedestrian Zebra Crosswalk at x = 12 (4m wide, 7m deep across road)
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    for (let k = 0; k < 6; k++) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 6.4), stripeMat);
      stripe.position.set(10.5 + k * 0.7, 0.035, 25.5);
      this.group.add(stripe);
    }

    // Granite Sidewalk Curbs (3m wide pedestrian promenade along the water, z = 29 to 32)
    const sidewalkGeo = new THREE.BoxGeometry(70, 0.2, 3.2);
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.85 });
    const promenade = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    promenade.position.set(12, 0.1, 30.6);
    promenade.receiveShadow = true;
    this.group.add(promenade);
  }

  private createParkAndTrees() {
    // Rose Kennedy Greenway Lawn (Emerald green park, x = -20 to 0, z = -12 to 18)
    const lawnGeo = new THREE.BoxGeometry(22, 0.1, 30);
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Emerald green
      roughness: 0.95,
    });
    const lawn = new THREE.Mesh(lawnGeo, lawnMat);
    lawn.position.set(-9, 0.05, 3);
    lawn.receiveShadow = true;
    this.group.add(lawn);

    // 3D Stylized Trees (InstancedMesh: trunk + faceted icosahedron foliage)
    const treePositions = [
      { x: -16, z: -8 }, { x: -10, z: -8 }, { x: -4, z: -8 },
      { x: -16, z: 2 }, { x: -4, z: 2 },
      { x: -16, z: 12 }, { x: -10, z: 12 }, { x: -4, z: 12 },
      { x: 28, z: -6 }, { x: 34, z: -6 },
    ];

    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.25, 2.2, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const foliageGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.85,
      flatShading: true,
    });

    const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, treePositions.length);
    const foliageMesh = new THREE.InstancedMesh(foliageGeo, foliageMat, treePositions.length);
    trunkMesh.castShadow = foliageMesh.castShadow = foliageMesh.receiveShadow = true;

    const m4 = new THREE.Matrix4();
    treePositions.forEach((tp, i) => {
      // Trunk
      m4.makeTranslation(tp.x, 1.1, tp.z);
      trunkMesh.setMatrixAt(i, m4);
      // Foliage dome
      m4.makeTranslation(tp.x, 2.8, tp.z);
      foliageMesh.setMatrixAt(i, m4);
    });

    this.group.add(trunkMesh, foliageMesh);
  }

  private createStreetFurniture() {
    // 1. Modern Streetlamps (7m high along Coastal Boulevard, z = 21.2)
    const lampX = [-12, 4, 20, 36];
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, 6.8, 8);
    const armGeo = new THREE.BoxGeometry(1.4, 0.08, 0.08);
    const headGeo = new THREE.BoxGeometry(0.6, 0.12, 0.3);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.4 });

    lampX.forEach((x) => {
      const lampGroup = new THREE.Group();
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 3.4;
      pole.castShadow = true;

      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.set(0.6, 6.8, 0);

      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(1.2, 6.75, 0);

      lampGroup.position.set(x, 0, 21.2);
      lampGroup.add(pole, arm, head);
      this.group.add(lampGroup);
    });

    // 2. Teak Promenade Benches (1.8m x 0.6m) facing the ocean
    const benchGeo = new THREE.BoxGeometry(1.8, 0.45, 0.6);
    const benchMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
    const benchPositions = [0, 16, 26];
    benchPositions.forEach((bx) => {
      const bench = new THREE.Mesh(benchGeo, benchMat);
      bench.position.set(bx, 0.35, 30.5);
      bench.castShadow = true;
      this.group.add(bench);
    });
  }

  private createVehicles() {
    // Yellow EV Sedan (lane 1: z = 23.8m, speed = 12m/s)
    const sedan = this.buildCarMesh(0xf5ba31, 4.4, 1.8, 1.4);
    sedan.position.set(-15, 0.05, 23.8);
    this.group.add(sedan);
    this.cars.push({ mesh: sedan, speed: 10, laneZ: 23.8 });

    // Teal Commuter Bus (lane 2: z = 27.2m, speed = -8m/s)
    const bus = this.buildBusMesh(0x0ea5e9, 11.5, 2.5, 3.2);
    bus.position.set(35, 0.05, 27.2);
    bus.rotation.y = Math.PI; // Heading opposite direction
    this.group.add(bus);
    this.cars.push({ mesh: bus, speed: -7.5, laneZ: 27.2 });
  }

  private buildCarMesh(colorHex: number, w: number, d: number, h: number): THREE.Group {
    const g = new THREE.Group();
    // Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, h * 0.55, d),
      new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.4, roughness: 0.3 })
    );
    body.position.y = (h * 0.55) / 2 + 0.15;
    body.castShadow = true;

    // Cabin
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.55, h * 0.45, d * 0.85),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
    );
    cabin.position.set(-0.2, (h * 0.55) + (h * 0.45) / 2 + 0.15, 0);
    cabin.castShadow = true;

    g.add(body, cabin);
    return g;
  }

  private buildBusMesh(colorHex: number, w: number, d: number, h: number): THREE.Group {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.2, roughness: 0.5 })
    );
    body.position.y = h / 2 + 0.2;
    body.castShadow = true;

    // Window band
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.95, h * 0.35, d + 0.05),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1 })
    );
    glass.position.y = h * 0.65 + 0.2;

    g.add(body, glass);
    return g;
  }

  public update(deltaTime: number) {
    // 1. Move vehicles along the coastal boulevard
    this.cars.forEach((car) => {
      car.mesh.position.x += car.speed * deltaTime;
      if (car.speed > 0 && car.mesh.position.x > 50) {
        car.mesh.position.x = -25;
      } else if (car.speed < 0 && car.mesh.position.x < -25) {
        car.mesh.position.x = 50;
      }
    });

    // 2. Subtle ocean wave ripple shimmer
    if (this.oceanWater) {
      const time = Date.now() * 0.001;
      this.oceanWater.position.y = -0.45 + Math.sin(time * 1.5) * 0.03;
    }
  }
}
