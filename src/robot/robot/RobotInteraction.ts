export interface InteractionState {
  targetX: number;             // Normalized [-1, 1]
  targetY: number;             // Normalized [-1, 1]
  speed: number;               // Current cursor velocity (units/sec)
  isHovered: boolean;
  reducedMotion: boolean;
}

export class RobotInteraction {
  private state: InteractionState = {
    targetX: 0,
    targetY: 0,
    speed: 0,
    isHovered: false,
    reducedMotion: false,
  };

  private container: HTMLElement;
  private lastTime: number = performance.now();
  private lastX: number = 0;
  private lastY: number = 0;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerLeave: () => void;
  private mediaQueryList?: MediaQueryList;

  // Relative anchor position of the robot face within the container [0, 1]
  // Calibrated to the exact 3D projection of the visor/face
  private faceRelX: number = 0.50;
  private faceRelY: number = 0.23;

  constructor(container: HTMLElement) {
    this.container = container;

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.state.reducedMotion = this.mediaQueryList.matches;
      this.mediaQueryList.addEventListener('change', (e) => {
        this.state.reducedMotion = e.matches;
      });
    }

    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerLeave = this.onPointerLeave.bind(this);

    // Track cursor across the ENTIRE window so head follows anywhere on page
    window.addEventListener('pointermove', this.boundPointerMove, { passive: true });
    document.addEventListener('mouseleave', this.boundPointerLeave);
  }

  private onPointerMove(e: PointerEvent): void {
    // Disable cursor tracking on touch devices
    if (e.pointerType === 'touch') {
      return;
    }

    const now = performance.now();
    const dt = Math.max((now - this.lastTime) / 1000, 0.001);

    // Calculate normalized coordinates relative to the robot FACE origin.
    // When cursor is directly on the face, normX = 0 and normY = 0 (looks straight ahead).
    // Moving up looks up, moving down looks down, moving left/right turns left/right.
    const rect = this.container.getBoundingClientRect();
    const robotCenterX = rect.left + rect.width * this.faceRelX;
    const robotCenterY = rect.top + rect.height * this.faceRelY;

    // Use viewport half-width/height for normalization so full-page movement
    // maps to the full [-1, 1] range rather than just the robot container.
    const halfW = window.innerWidth * 0.5;
    const halfH = window.innerHeight * 0.5;

    const normX = (e.clientX - robotCenterX) / halfW;
    // Invert Y so moving cursor up from face gives positive Y (head looks up)
    const normY = -(e.clientY - robotCenterY) / halfH;

    // Clamp to [-1, 1]
    const clampedX = Math.max(-1, Math.min(1, normX));
    const clampedY = Math.max(-1, Math.min(1, normY));

    // Calculate velocity
    const dx = clampedX - this.lastX;
    const dy = clampedY - this.lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const instantSpeed = dist / dt;

    // Smooth speed metric
    this.state.speed = this.state.speed * 0.7 + instantSpeed * 0.3;

    this.state.targetX = clampedX;
    this.state.targetY = clampedY;
    // Always active — head follows cursor everywhere on page
    this.state.isHovered = true;

    this.lastTime = now;
    this.lastX = clampedX;
    this.lastY = clampedY;
  }

  private onPointerLeave(): void {
    // Mouse left the browser window entirely — return to idle (looking straight forward)
    this.state.isHovered = false;
    this.state.targetX = 0;
    this.state.targetY = 0;
    this.state.speed = 0;
  }

  public getState(): Readonly<InteractionState> {
    return this.state;
  }

  public setFacePosition(relX: number, relY: number): void {
    this.faceRelX = Math.max(0.1, Math.min(0.9, relX));
    this.faceRelY = Math.max(0.05, Math.min(0.9, relY));
  }

  public setLookTarget(x: number, y: number): void {
    this.state.targetX = Math.max(-1, Math.min(1, x));
    this.state.targetY = Math.max(-1, Math.min(1, y));
  }

  public dispose(): void {
    window.removeEventListener('pointermove', this.boundPointerMove);
    document.removeEventListener('mouseleave', this.boundPointerLeave);
  }
}
