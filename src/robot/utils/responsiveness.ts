export interface ViewportDimensions {
  width: number;
  height: number;
  aspect: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function getViewportDimensions(container: HTMLElement): ViewportDimensions {
  const width = Math.max(container.clientWidth, 1);
  const height = Math.max(container.clientHeight, 1);
  const aspect = width / height;

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return {
    width,
    height,
    aspect,
    isMobile,
    isTablet,
    isDesktop,
  };
}

/**
 * Calculates adaptive camera parameters (FOV, distance, height offset)
 * framing the humanoid robot from head down to waist/lower torso (Reference 2 target).
 */
export function calculateCameraFraming(aspect: number): {
  fov: number;
  cameraPosition: [number, number, number];
  targetPosition: [number, number, number];
} {
  const baseFov = 28;
  // Center camera at y = 0.44 so sleek head crown has clean headroom, chest, arms and hands are in prime view, and waist stands firmly behind stats cards
  const targetY = 0.44;
  const halfFovRad = (baseFov / 2) * (Math.PI / 180);

  // Vertical distance framing robot firmly from waist up to head
  const minDistanceVert = 2.44;

  // Horizontal distance to ensure broad shoulders (span ~ 0.55) are framed with generous margins
  const minDistanceHoriz = 0.46 / (aspect * Math.tan(halfFovRad));

  const distance = Math.max(minDistanceVert, minDistanceHoriz);

  return {
    fov: baseFov,
    cameraPosition: [0, targetY + 0.02, distance],
    targetPosition: [0, targetY, 0],
  };
}
