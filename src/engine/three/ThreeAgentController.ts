import * as THREE from 'three';
import { Agent } from '../../types/agent';

interface AgentMeshInstance {
  agent: Agent;
  sprite: THREE.Sprite;
  shadow: THREE.Mesh;
  bubbleSprite?: THREE.Sprite;
  targetPos?: THREE.Vector3;
}

export class ThreeAgentController {
  public group: THREE.Group = new THREE.Group();
  private agentInstances: Map<string, AgentMeshInstance> = new Map();
  private spriteTextureCache: Map<string, THREE.CanvasTexture> = new Map();

  constructor() {}

  public syncAgents(agents: Agent[], _scene: THREE.Scene) {
    agents.forEach((agent) => {
      let inst = this.agentInstances.get(agent.id);
      if (!inst) {
        // Create new 2.5D Pixel Art Sprite in 3D Space
        const texture = this.createPixelAgentTexture(agent);
        const material = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthTest: true,
        });
        const sprite = new THREE.Sprite(material);
        // Real-world 1:1 scale: 1.75m height, 0.9m width
        sprite.scale.set(0.95, 1.75, 1);
        sprite.userData = { id: agent.id, name: agent.name, type: 'agent' };

        // Soft drop shadow beneath feet
        const shadowGeo = new THREE.CircleGeometry(0.35, 12);
        const shadowMat = new THREE.MeshBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0.35,
        });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.rotation.x = -Math.PI / 2;

        inst = { agent, sprite, shadow };
        this.agentInstances.set(agent.id, inst);
        this.group.add(sprite, shadow);
      }

      // Update position based on floor & desk location
      const worldY = agent.position.z > 20 ? 4.1 : 0.88; // 2F mezzanine vs 1F ground floor
      // Map 2D world coords to Three.js coordinates
      const mappedX = agent.position.x * 0.08 + 2;
      const mappedZ = agent.position.y * 0.08 + 4;

      inst.sprite.position.set(mappedX, worldY, mappedZ);
      inst.shadow.position.set(mappedX, worldY - 0.86, mappedZ);

      // Speech bubble sprite if speaking
      if (agent.speechBubble && agent.speechBubble.expiresAt > Date.now()) {
        if (!inst.bubbleSprite) {
          inst.bubbleSprite = this.createSpeechBubbleSprite(agent.speechBubble.text);
          inst.bubbleSprite.position.set(0, 1.25, 0);
          inst.sprite.add(inst.bubbleSprite);
        }
      } else if (inst.bubbleSprite) {
        inst.sprite.remove(inst.bubbleSprite);
        inst.bubbleSprite.material.dispose();
        inst.bubbleSprite = undefined;
      }
    });
  }

  // Generates crisp procedural pixel art sprite texture
  private createPixelAgentTexture(agent: Agent): THREE.CanvasTexture {
    const key = `${agent.id}_${agent.avatarColor}_${agent.hairColor}_${agent.outfitColor}`;
    if (this.spriteTextureCache.has(key)) {
      return this.spriteTextureCache.get(key)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 48;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Draw Pixel Character Body (16x32 grid scaled up)
    // 1. Head & Face (Peach skin: #f0d9c4)
    ctx.fillStyle = '#f0d9c4';
    ctx.fillRect(10, 8, 12, 11);

    // 2. Hair
    ctx.fillStyle = agent.hairColor || '#475569';
    ctx.fillRect(9, 6, 14, 6);
    ctx.fillRect(8, 9, 3, 5);

    // 3. Eyes (Dark slate)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(13, 12, 2, 2);
    ctx.fillRect(18, 12, 2, 2);

    // 4. Torso / Shirt (Outfit Color)
    ctx.fillStyle = agent.outfitColor || '#1e293b';
    ctx.fillRect(10, 19, 12, 13);

    // Accent tie / badge (Catch Yellow)
    ctx.fillStyle = '#f5ba31';
    ctx.fillRect(15, 21, 2, 6);

    // 5. Arms
    ctx.fillStyle = agent.avatarColor || '#38bdf8';
    ctx.fillRect(7, 20, 3, 10);
    ctx.fillRect(22, 20, 3, 10);

    // 6. Legs & Pants (Dark charcoal)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(11, 32, 4, 11);
    ctx.fillRect(17, 32, 4, 11);

    // 7. Shoes (White sneakers)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(10, 43, 5, 3);
    ctx.fillRect(17, 43, 5, 3);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    this.spriteTextureCache.set(key, texture);
    return texture;
  }

  private createSpeechBubbleSprite(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 48;
    const ctx = canvas.getContext('2d')!;

    // Pill background
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(4, 4, 152, 40, 16);
    ctx.fill();
    ctx.stroke();

    // Text inside
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.slice(0, 18), 80, 24);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.6, 0.48, 1);
    return sprite;
  }

  public getClickableSprites(): THREE.Sprite[] {
    return Array.from(this.agentInstances.values()).map((inst) => inst.sprite);
  }

  public update(_deltaTime: number) {
    // Subtle breathing / idle bobbing for living studio effect
    const time = Date.now() * 0.003;
    let idx = 0;
    this.agentInstances.forEach((inst) => {
      inst.sprite.position.y += Math.sin(time + idx * 1.5) * 0.0008;
      idx++;
    });
  }
}
