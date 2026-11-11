import * as THREE from 'three';
import { TimeState } from '../../types/agent';

export class ThreeLightingSystem {
  public sun: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public nightLightGroup: THREE.Group = new THREE.Group();
  private streetPointLights: THREE.PointLight[] = [];

  constructor(scene: THREE.Scene) {
    // 1. Ambient Hemisphere Light
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xb8c4cc, 0.75);
    scene.add(this.hemiLight);

    // 2. Main Sun Directional Light with Soft Shadows
    this.sun = new THREE.DirectionalLight(0xffffff, 0.9);
    this.sun.position.set(-15, 45, 30);
    this.sun.target.position.set(12, 0, 8);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0005;

    // Shadow Camera Volume covering the city district
    Object.assign(this.sun.shadow.camera, {
      left: -35,
      right: 35,
      top: 35,
      bottom: -35,
      near: 1,
      far: 140,
    });

    scene.add(this.sun, this.sun.target);

    // 3. Night Lighting (Warm streetlights & Catch 01 glow)
    this.createNightLights(scene);
  }

  private createNightLights(scene: THREE.Scene) {
    // Streetlamp point lights along Coastal Boulevard (z = 21m)
    const lampXPositions = [-10, 6, 22, 38];
    lampXPositions.forEach((x) => {
      const lamp = new THREE.PointLight(0xfef08a, 0, 14, 1.6);
      lamp.position.set(x, 6.8, 20.8);
      this.nightLightGroup.add(lamp);
      this.streetPointLights.push(lamp);
    });

    // Warm Interior Glow in Arise HQ Ground Floor & Boss Suite
    const interiorHQ = new THREE.PointLight(0xf5ba31, 0, 18, 1.4);
    interiorHQ.position.set(12, 2.5, 8);
    this.nightLightGroup.add(interiorHQ);
    this.streetPointLights.push(interiorHQ);

    const mezzanineLight = new THREE.PointLight(0x38bdf8, 0, 14, 1.5);
    mezzanineLight.position.set(6, 5.0, 6);
    this.nightLightGroup.add(mezzanineLight);
    this.streetPointLights.push(mezzanineLight);

    scene.add(this.nightLightGroup);
  }

  public update(timeState: TimeState, scene: THREE.Scene) {
    const { phase, isNight } = timeState;

    if (isNight) {
      // Atmospheric Night Lighting
      scene.background = new THREE.Color(0x0c111a);
      this.hemiLight.color.setHex(0x1e293b);
      this.hemiLight.groundColor.setHex(0x090d16);
      this.hemiLight.intensity = 0.35;

      this.sun.color.setHex(0x38bdf8); // Moonlight
      this.sun.intensity = 0.22;
      this.sun.position.set(-8, 30, 20);

      // Turn on warm street and interior lights
      this.streetPointLights.forEach((light) => {
        light.intensity = THREE.MathUtils.lerp(light.intensity, 1.2, 0.1);
      });
    } else if (phase === 'dusk') {
      // Golden Hour Sunset
      scene.background = new THREE.Color(0x231d28);
      this.hemiLight.color.setHex(0xf472b6);
      this.hemiLight.groundColor.setHex(0x7c2d12);
      this.hemiLight.intensity = 0.65;

      this.sun.color.setHex(0xfb923c);
      this.sun.intensity = 0.85;
      this.sun.position.set(-25, 20, 15);

      this.streetPointLights.forEach((light) => {
        light.intensity = THREE.MathUtils.lerp(light.intensity, 0.4, 0.1);
      });
    } else if (phase === 'dawn') {
      // Crisp Morning
      scene.background = new THREE.Color(0x1e2430);
      this.hemiLight.color.setHex(0xfde68a);
      this.hemiLight.groundColor.setHex(0x334155);
      this.hemiLight.intensity = 0.7;

      this.sun.color.setHex(0xfef08a);
      this.sun.intensity = 0.8;
      this.sun.position.set(25, 25, 20);

      this.streetPointLights.forEach((light) => {
        light.intensity = THREE.MathUtils.lerp(light.intensity, 0.2, 0.1);
      });
    } else {
      // Bright Sunlit Day (Vibrant Mediterranean/California Waterfront)
      scene.background = new THREE.Color(0xe2e8f0);
      this.hemiLight.color.setHex(0xffffff);
      this.hemiLight.groundColor.setHex(0xb8c4cc);
      this.hemiLight.intensity = 0.78;

      this.sun.color.setHex(0xffffff);
      this.sun.intensity = 0.95;
      this.sun.position.set(-15, 45, 30);

      // Turn off artificial point lights during the day
      this.streetPointLights.forEach((light) => {
        light.intensity = THREE.MathUtils.lerp(light.intensity, 0, 0.1);
      });
    }
  }
}
