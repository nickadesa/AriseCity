import * as THREE from 'three';
import { ThreeCameraRig } from './ThreeCameraRig';
import { ThreeLightingSystem } from './ThreeLightingSystem';
import { ThreeTerrainRoads } from './ThreeTerrainRoads';
import { ThreeBuildingManager } from './ThreeBuildingManager';
import { ThreeAgentController } from './ThreeAgentController';
import { Agent, TimeState } from '../../types/agent';

export interface ThreeEngineCallbacks {
  onOpenDeskModal: (agentId: string) => void;
  onOpenTaskBoard: () => void;
  onOpenDecisionModal: () => void;
  onBuildingInspectChange?: (isInspecting: boolean) => void;
}

export class ThreeCityEngine {
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public cameraRig: ThreeCameraRig;
  public lighting: ThreeLightingSystem;
  public terrain: ThreeTerrainRoads;
  public buildings: ThreeBuildingManager;
  public agents: ThreeAgentController;

  private callbacks: ThreeEngineCallbacks;
  private isDestroyed: boolean = false;

  constructor(container: HTMLDivElement, callbacks: ThreeEngineCallbacks) {
    this.callbacks = callbacks;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xe2e8f0);

    // 2. High-DPI WebGL Renderer with Soft Shadow Mapping
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('[ThreeCityEngine] WebGL context lost.');
    });
    container.appendChild(this.renderer.domElement);

    // 3. Camera Rig
    this.cameraRig = new ThreeCameraRig();
    this.cameraRig.handleResize(container.clientWidth, container.clientHeight);

    // 4. Lighting System
    this.lighting = new ThreeLightingSystem(this.scene);

    // 5. Environmental Terrain, Ocean & Roads
    this.terrain = new ThreeTerrainRoads();
    this.scene.add(this.terrain.group);

    // 6. Architectural Building Manager (Arise HQ #BOXSPACES 2-floor cutaway)
    this.buildings = new ThreeBuildingManager();
    this.scene.add(this.buildings.group);

    // 7. Hybrid 2.5D Pixel Agent Controller
    this.agents = new ThreeAgentController();
    this.scene.add(this.agents.group);
  }

  public handleResize(width: number, height: number) {
    this.renderer.setSize(width, height);
    this.cameraRig.handleResize(width, height);
  }

  public handlePointerClick(screenX: number, screenY: number, screenW: number, screenH: number) {
    const raycaster = this.cameraRig.getRaycaster(screenX, screenY, screenW, screenH);

    // 1. Check clicks on Agent Sprites
    const agentSprites = this.agents.getClickableSprites();
    const agentHits = raycaster.intersectObjects(agentSprites, false);
    if (agentHits.length > 0) {
      const hit = agentHits[0].object;
      if (hit.userData?.id) {
        this.callbacks.onOpenDeskModal(hit.userData.id);
        return;
      }
    }

    // 2. Check clicks on Interactive Interior Furniture (Desks, Kanban, Boss Mat)
    const furnitureHits = raycaster.intersectObjects(this.buildings.interactiveObjects, true);
    if (furnitureHits.length > 0) {
      const hit = furnitureHits[0].object;
      if (hit.name === 'TASK_BOARD') {
        this.callbacks.onOpenTaskBoard();
        return;
      }
      if (hit.name === 'BOSS_MAT' || hit.userData?.type === 'decision_mat') {
        this.callbacks.onOpenDecisionModal();
        return;
      }
      if (hit.userData?.type === 'desk' && hit.userData.id) {
        this.callbacks.onOpenDeskModal(hit.userData.id);
        return;
      }
    }

    // 3. Check clicks on Arise HQ Building itself -> Toggle Cutaway Inspection!
    const buildingHits = raycaster.intersectObjects(this.buildings.group.children, true);
    if (buildingHits.length > 0) {
      if (!this.buildings.isInspected) {
        this.toggleBuildingInspection(true);
      }
    }
  }

  public toggleBuildingInspection(inspect?: boolean) {
    const nextState = inspect !== undefined ? inspect : !this.buildings.isInspected;
    this.buildings.isInspected = nextState;
    if (nextState) {
      // Focus camera on center of Arise HQ interior at appropriate altitude
      const floor = this.buildings.activeFloor;
      const targetY = floor === 1 ? 1.5 : floor === 2 ? 4.5 : floor === 3 ? 7.8 : 10.8;
      this.cameraRig.flyTo(12, 8, targetY, 2.8);
    } else {
      // Zoom back out to street view
      this.cameraRig.flyTo(12, 10, 1.5, 1.2);
    }
    this.callbacks.onBuildingInspectChange?.(nextState);
  }

  public setFloor(floor: 1 | 2 | 3 | 4) {
    this.buildings.activeFloor = floor;
    if (this.buildings.isInspected) {
      const targetY = floor === 1 ? 1.5 : floor === 2 ? 4.5 : floor === 3 ? 7.8 : 10.8;
      this.cameraRig.flyTo(12, 8, targetY, 2.8);
    }
  }

  public render(deltaTime: number, timeState: TimeState, agentList: Agent[]) {
    if (this.isDestroyed) return;

    // 1. Update Camera
    this.cameraRig.update(deltaTime);

    // 2. Update Lighting & NYC Time
    this.lighting.update(timeState, this.scene);

    // 3. Update Terrain, Ocean & Moving Vehicles
    this.terrain.update(deltaTime);

    // 4. Update Architectural Cutaway
    this.buildings.updateCutaway(this.cameraRig.az);

    // 5. Update AI Agents
    this.agents.syncAgents(agentList, this.scene, this.buildings.activeFloor, this.buildings.isInspected);
    this.agents.update(deltaTime);

    // 6. WebGL Render Call
    this.renderer.render(this.scene, this.cameraRig.camera);
  }

  public destroy() {
    this.isDestroyed = true;
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
