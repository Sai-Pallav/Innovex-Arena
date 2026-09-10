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

    window.addEventListener('pointermove', this.boundPointerMove, { passive: true });
    document.addEventListener('mouseleave', this.boundPointerLeave);
  }

  private onPointerMove(e: PointerEvent): void {
    // Disable cursor tracking on touch devices per Requirement 16
    if (e.pointerType === 'touch') {
      return;
    }

    const now = performance.now();
    const dt = Math.max((now - this.lastTime) / 1000, 0.001);

    // Calculate viewport-relative coordinates [-1, 1]
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = -(e.clientY / window.innerHeight) * 2 + 1;

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
    this.state.isHovered = true;

    this.lastTime = now;
    this.lastX = clampedX;
    this.lastY = clampedY;
  }

  private onPointerLeave(): void {
    this.state.isHovered = false;
    this.state.targetX = 0;
    this.state.targetY = 0;
    this.state.speed = 0;
  }

  public getState(): Readonly<InteractionState> {
    return this.state;
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
