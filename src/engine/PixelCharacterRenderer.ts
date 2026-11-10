import { Agent, AmbientNPC, Facing } from '../types/agent';

export class PixelCharacterRenderer {
  // Render an Agent with 4-directional sprites and contextual animations
  static renderAgent(
    ctx: CanvasRenderingContext2D,
    agent: Agent,
    screenX: number,
    screenY: number,
    zoom: number,
    isNight: boolean
  ) {
    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.scale(zoom, zoom);

    const now = Date.now();
    const isMoving = !!agent.targetPosition;
    const isTyping = agent.status === 'typing' || agent.status === 'testing';
    const isResting = agent.status === 'resting';

    // Walk frame: 0, 1, 2, 3
    const walkFrame = isMoving ? Math.floor(now / 140) % 4 : 0;
    const bob = isMoving ? (walkFrame % 2 === 0 ? -1.5 : 0) : Math.sin(now / 400) * 0.5;

    // 1. Draw character drop shadow on floor
    this.drawCharacterShadow(ctx, isMoving, isNight);

    // 2. Draw 4-directional Pixel Character Sprite
    ctx.save();
    ctx.translate(0, bob);
    this.drawPixelHumanoid(
      ctx,
      agent.facing,
      agent.outfitColor,
      agent.avatarColor,
      agent.hairColor,
      isMoving,
      walkFrame,
      isTyping,
      isResting,
      agent.role
    );
    ctx.restore();

    // 3. Monitor light reflection on face if typing at night
    if (isTyping && isNight) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, -18 + bob, 8, 0, Math.PI * 2);
      ctx.fillStyle = agent.role === 'frontend' ? 'rgba(56, 189, 248, 0.22)' : 'rgba(139, 92, 246, 0.22)';
      ctx.fill();
      ctx.restore();
    }

    // 4. Draw Speech Bubble / Emote if active
    if (agent.speechBubble) {
      this.drawSpeechBubble(ctx, agent.speechBubble.text, agent.speechBubble.icon, -36 + bob);
    } else if (agent.status === 'waiting_decision') {
      // Urgent exclamation mark bouncing above head!
      const alertBob = Math.sin(now / 150) * 3;
      this.drawSpeechBubble(ctx, '!', 'alert', -38 + alertBob, '#ef4444');
    }

    // 5. Draw minimal nameplate tag
    this.drawNameTag(ctx, agent.name, agent.avatarColor, -28 + bob);

    ctx.restore();
  }

  // Render an Ambient NPC (Citizen, Courier, Tech, Shiba, Cleaner, Guard)
  static renderNPC(
    ctx: CanvasRenderingContext2D,
    npc: AmbientNPC,
    screenX: number,
    screenY: number,
    zoom: number,
    isNight: boolean
  ) {
    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.scale(zoom, zoom);

    const now = Date.now();
    const isMoving = !!npc.targetPosition;
    const walkFrame = isMoving ? Math.floor(now / 140) % 4 : 0;
    const bob = isMoving ? (walkFrame % 2 === 0 ? -1.5 : 0) : Math.sin(now / 500) * 0.5;

    // Draw shadow
    this.drawCharacterShadow(ctx, isMoving, isNight, npc.type === 'pet' ? 6 : 9);

    ctx.save();
    ctx.translate(0, bob);

    switch (npc.type) {
      case 'pet':
        this.drawPixelShiba(ctx, npc.facing, isMoving, walkFrame, npc.interactionCount);
        break;

      case 'cleaner':
        this.drawPixelCleanerBot(ctx, npc.facing, isMoving, isNight);
        break;

      case 'security':
        this.drawPixelSecurityGuard(ctx, npc.facing, isMoving, walkFrame, isNight);
        break;

      case 'courier':
        this.drawPixelHumanoid(
          ctx,
          npc.facing,
          '#f59e0b', // Yellow delivery jacket
          '#facc15',
          '#1e293b',
          isMoving,
          walkFrame,
          false,
          false,
          'courier'
        );
        break;

      case 'client':
        this.drawPixelHumanoid(
          ctx,
          npc.facing,
          '#f8fafc', // Sophisticated ivory trench coat
          '#64748b',
          '#78350f',
          isMoving,
          walkFrame,
          false,
          false,
          'client'
        );
        break;

      case 'technician':
      default:
        this.drawPixelHumanoid(
          ctx,
          npc.facing,
          '#0284c7', // IT blue jumpsuit
          '#0ea5e9',
          '#475569',
          isMoving,
          walkFrame,
          false,
          false,
          'technician'
        );
        break;
    }
    ctx.restore();

    // Speech bubble
    if (npc.speechBubble) {
      this.drawSpeechBubble(ctx, npc.speechBubble.text, npc.speechBubble.icon, -32 + bob);
    }

    // Name tag
    this.drawNameTag(ctx, npc.name.split(' ')[0], '#94a3b8', -26 + bob);

    ctx.restore();
  }

  // -------------------------------------------------------------
  // PIXEL ART DRAWING ROUTINES (4-Directional Engine)
  // -------------------------------------------------------------

  private static drawPixelHumanoid(
    ctx: CanvasRenderingContext2D,
    facing: Facing,
    outfitColor: string,
    accentColor: string,
    hairColor: string,
    isMoving: boolean,
    walkFrame: number,
    isTyping: boolean,
    isResting: boolean,
    roleOrType: string
  ) {
    const isFront = facing === 'se' || facing === 'sw';
    const isFacingLeft = facing === 'sw' || facing === 'nw';

    ctx.save();
    if (isFacingLeft) {
      ctx.scale(-1, 1); // Flip horizontally for west-facing views!
    }

    // P1: LEGS & SHOES (-6 to 0)
    ctx.fillStyle = '#0f172a'; // dark slate pants
    let legOffsetL = 0;
    let legOffsetR = 0;
    if (isMoving) {
      legOffsetL = walkFrame === 0 ? -3 : walkFrame === 2 ? 3 : 0;
      legOffsetR = walkFrame === 0 ? 3 : walkFrame === 2 ? -3 : 0;
    }

    if (isResting) {
      // Reclined legs
      ctx.fillRect(-6, -4, 12, 4);
    } else {
      // Left leg + shoe
      ctx.fillRect(-4 + legOffsetL, -8, 3, 6);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-5 + legOffsetL, -2, 4, 3);

      // Right leg + shoe
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(1 + legOffsetR, -8, 3, 6);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(1 + legOffsetR, -2, 4, 3);
    }

    // P2: TORSO & OUTFIT (-18 to -8)
    ctx.fillStyle = outfitColor;
    ctx.fillRect(-5, -17, 10, 10);

    // Jacket / Collar / Tie detail
    ctx.fillStyle = accentColor;
    if (isFront) {
      // Front tie or collar accent
      ctx.fillRect(-1, -16, 2, 6);
      // Skin tone neck
      ctx.fillStyle = '#fcd34d';
      ctx.fillRect(-2, -18, 4, 2);
    } else {
      // Back seam
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(-1, -17, 2, 9);
    }

    // P3: ARMS & HANDS
    ctx.fillStyle = outfitColor;
    if (isTyping) {
      // Typing arms extended forward to keyboard
      const armBob = Math.sin(Date.now() / 100) * 1.5;
      ctx.fillRect(3, -15 + armBob, 7, 3);
      // Hands
      ctx.fillStyle = '#fcd34d';
      ctx.fillRect(9, -15 + armBob, 2, 3);
    } else if (isMoving) {
      // Swinging arms
      const armSwing = walkFrame === 0 ? 3 : walkFrame === 2 ? -3 : 0;
      ctx.fillRect(-7, -16 + armSwing, 3, 7);
      ctx.fillRect(4, -16 - armSwing, 3, 7);
    } else {
      // Natural idle arms
      ctx.fillRect(-7, -16, 3, 8);
      ctx.fillRect(4, -16, 3, 8);
      // Hands
      ctx.fillStyle = '#fcd34d';
      ctx.fillRect(-7, -8, 3, 2);
      ctx.fillRect(4, -8, 3, 2);
    }

    // P4: HEAD & HAIR (-26 to -18)
    // Head base (Skin tone)
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(-4, -25, 8, 8);

    // Face / Eyes (Only if facing front SE / SW)
    if (isFront) {
      ctx.fillStyle = '#1e293b'; // Eyes
      ctx.fillRect(1, -22, 2, 2);
      ctx.fillRect(-3, -22, 2, 2);

      // Glasses for Cipher / Echo
      if (roleOrType === 'backend' || roleOrType === 'qa') {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(-4, -23, 4, 3);
        ctx.strokeRect(0, -23, 4, 3);
      }
    }

    // Hair
    ctx.fillStyle = hairColor;
    ctx.fillRect(-5, -28, 10, 5); // top
    if (isFront) {
      ctx.fillRect(-5, -24, 2, 4); // sideburn left
      ctx.fillRect(3, -24, 2, 4); // sideburn right
      ctx.fillRect(-3, -24, 6, 2); // fringe bangs
    } else {
      // Back of head (full hair coverage)
      ctx.fillRect(-5, -25, 10, 7);
    }

    // Special Accessories
    if (roleOrType === 'courier') {
      // Delivery cap & parcel bag
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(-6, -29, 12, 3);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-7, -14, 4, 7); // messenger pouch
    }

    ctx.restore();
  }

  // Sparky the Cyber Shiba Inu
  private static drawPixelShiba(
    ctx: CanvasRenderingContext2D,
    facing: Facing,
    isMoving: boolean,
    walkFrame: number,
    petCount: number
  ) {
    const isFacingLeft = facing === 'sw' || facing === 'nw';
    const now = Date.now();

    ctx.save();
    if (isFacingLeft) ctx.scale(-1, 1);

    // Shiba Body (Golden orange fur #f59e0b)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-6, -8, 12, 6);

    // White belly
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(-4, -4, 8, 3);

    // Legs
    ctx.fillStyle = '#f59e0b';
    const legSwing = isMoving ? (walkFrame % 2 === 0 ? 2 : -2) : 0;
    ctx.fillRect(-5 + legSwing, -2, 2, 3);
    ctx.fillRect(-2 - legSwing, -2, 2, 3);
    ctx.fillRect(2 + legSwing, -2, 2, 3);
    ctx.fillRect(4 - legSwing, -2, 2, 3);

    // Head
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(3, -13, 6, 6);
    // Snout
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(6, -10, 4, 3);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(9, -10, 2, 2); // nose
    // Ears
    ctx.fillStyle = '#d97706';
    ctx.fillRect(4, -16, 2, 3);
    ctx.fillRect(7, -16, 2, 3);
    // Cyber eye
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(5, -12, 2, 2);

    // Animated Curled Tail (Rapid wag if petted recently!)
    const wagSpeed = petCount > 0 ? 80 : 250;
    const tailWag = Math.sin(now / wagSpeed) * 3;
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(-8, -10 + tailWag, 3, 4);

    ctx.restore();
  }

  // MopBot (Night Cleaner Bot)
  private static drawPixelCleanerBot(
    ctx: CanvasRenderingContext2D,
    _facing: Facing,
    isMoving: boolean,
    _isNight: boolean
  ) {
    const now = Date.now();
    // Cylindrical chassis
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-7, -8, 14, 7);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-6, -11, 12, 4);

    // Front sensor visor
    ctx.fillStyle = '#10b981';
    ctx.fillRect(-4, -6, 8, 2);

    // Spinning bottom brush indicator
    const brushSpin = (now / 50) % Math.PI * 2;
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-8 + Math.sin(brushSpin) * 2, -2, 4, 2);
    ctx.fillRect(4 - Math.sin(brushSpin) * 2, -2, 4, 2);

    // Vacuum dust particles
    if (isMoving) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(-10, -3 + Math.sin(now / 100) * 2, 2, 2);
    }
  }

  // Watcher (Night Security Bot) with dynamic flashlight cone!
  private static drawPixelSecurityGuard(
    ctx: CanvasRenderingContext2D,
    facing: Facing,
    _isMoving: boolean,
    _walkFrame: number,
    isNight: boolean
  ) {
    const isFacingLeft = facing === 'sw' || facing === 'nw';

    ctx.save();
    if (isFacingLeft) ctx.scale(-1, 1);

    // Security armor
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-5, -18, 10, 11);
    ctx.fillStyle = '#3b82f6'; // Police badge strip
    ctx.fillRect(-3, -15, 6, 2);

    // Helmet & visor
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, -25, 8, 7);
    ctx.fillStyle = '#ef4444'; // Red scanner visor
    ctx.fillRect(1, -22, 4, 2);

    // Legs
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, -7, 3, 7);
    ctx.fillRect(1, -7, 3, 7);

    // Flashlight in hand
    ctx.fillStyle = '#facc15';
    ctx.fillRect(4, -13, 5, 3);

    // DYNAMIC FLASHLIGHT CONE AT NIGHT!
    if (isNight) {
      ctx.save();
      const beamGrad = ctx.createRadialGradient(9, -11, 2, 35, -5, 50);
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
      beamGrad.addColorStop(0.4, 'rgba(250, 204, 21, 0.25)');
      beamGrad.addColorStop(1, 'rgba(250, 204, 21, 0.0)');

      ctx.beginPath();
      ctx.moveTo(9, -11);
      ctx.lineTo(60, -30);
      ctx.lineTo(65, 15);
      ctx.closePath();
      ctx.fillStyle = beamGrad;
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  // Soft oval drop shadow on the floor
  private static drawCharacterShadow(
    ctx: CanvasRenderingContext2D,
    _isMoving: boolean,
    isNight: boolean,
    radius: number = 8
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, radius * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = isNight ? 'rgba(3, 5, 12, 0.55)' : 'rgba(15, 23, 42, 0.35)';
    ctx.fill();
    ctx.restore();
  }

  // Draw floating speech bubble or emote
  private static drawSpeechBubble(
    ctx: CanvasRenderingContext2D,
    text: string,
    _icon?: string,
    yPos: number = -34,
    badgeColor?: string
  ) {
    ctx.save();
    ctx.font = '500 10px "Inter", sans-serif';
    const textWidth = ctx.measureText(text).width;
    const paddingX = 7;
    const bubbleWidth = Math.max(20, textWidth + paddingX * 2);
    const bubbleHeight = 18;
    const bubbleX = -bubbleWidth / 2;
    const bubbleY = yPos - bubbleHeight;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.roundRect(ctx, bubbleX + 1, bubbleY + 2, bubbleWidth, bubbleHeight, 6);
    ctx.fill();

    // Bubble Body
    ctx.fillStyle = badgeColor || '#1e293b';
    this.roundRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, 6);
    ctx.fill();

    // Border
    ctx.strokeStyle = badgeColor ? '#ffffff' : '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Downward arrow pointer
    ctx.beginPath();
    ctx.moveTo(-3, bubbleY + bubbleHeight);
    ctx.lineTo(0, bubbleY + bubbleHeight + 3);
    ctx.lineTo(3, bubbleY + bubbleHeight);
    ctx.closePath();
    ctx.fillStyle = badgeColor || '#1e293b';
    ctx.fill();

    // Text / Icon
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, bubbleY + bubbleHeight / 2);

    ctx.restore();
  }

  // Draw compact Agent Name Tag
  private static drawNameTag(
    ctx: CanvasRenderingContext2D,
    name: string,
    color: string,
    yPos: number
  ) {
    ctx.save();
    ctx.font = '600 9px "JetBrains Mono", monospace';
    const width = ctx.measureText(name).width + 8;
    const height = 13;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    this.roundRect(ctx, -width / 2, yPos, width, height, 3);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 0, yPos + height / 2 + 0.5);
    ctx.restore();
  }

  // Helper for drawing rounded rectangle
  private static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
