import * as THREE from 'three';

export interface SceneLights {
  group: THREE.Group;
  keyLight: THREE.DirectionalLight;
  fillLight: THREE.DirectionalLight;
  rimLightLeft: THREE.DirectionalLight;
  rimLightRight: THREE.DirectionalLight;
  chestAccentLight: THREE.PointLight;
  ambientLight: THREE.AmbientLight;
  contactShadow: THREE.Mesh;
}

export function createStudioLighting(): SceneLights {
  const group = new THREE.Group();
  group.name = 'StudioLightingGroup';

  // 1. Ambient Light - neutral dark slate-indigo base with rich fill
  const ambientLight = new THREE.AmbientLight(0x282c3f, 1.25);
  group.add(ambientLight);

  // 2. Key Light (Top-Front-Left) - crisp neutral white light highlighting armor contours
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.7);
  keyLight.position.set(-1.8, 3.2, 2.6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.bias = -0.0002;
  group.add(keyLight);

  // 3. Fill Light (Front-Right) - crisp cool-white fill illuminating ceramic arms & titanium joints
  const fillLight = new THREE.DirectionalLight(0xdce7f6, 1.35);
  fillLight.position.set(2.4, 1.6, 2.2);
  group.add(fillLight);

  // 4. Rim Light Left (Back-Left) - subtle cool rim trace
  const rimLightLeft = new THREE.DirectionalLight(0x4338ca, 0.9);
  rimLightLeft.position.set(-2.8, 2.2, -2.0);
  group.add(rimLightLeft);

  // 5. Rim Light Right (Back-Right) - signature crisp neon violet rim trace along helmet, ear & shoulder
  const rimLightRight = new THREE.DirectionalLight(0xb388ff, 2.8);
  rimLightRight.position.set(2.8, 2.4, -1.8);
  group.add(rimLightRight);

  // 6. Chest Accent Light (Point Light) - subtle violet aura
  const chestAccentLight = new THREE.PointLight(0xa855f7, 0.20, 0.6);
  chestAccentLight.position.set(0, 0.76, 0.28);
  group.add(chestAccentLight);

  // 7. Stomach & Midriff Specular Light (Front-Low) - illuminates cybernetic abs, obliques, pistons & waist ring
  const stomachLight = new THREE.DirectionalLight(0xb8b0ec, 1.8);
  stomachLight.position.set(0.8, -0.05, 2.6);
  group.add(stomachLight);

  // 7. Contact Shadow Floor Mesh (Disabled in bust portrait to prevent clipping)
  const contactShadow = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial());
  contactShadow.visible = false;
  contactShadow.name = 'ContactShadowPlane';

  return {
    group,
    keyLight,
    fillLight,
    rimLightLeft,
    rimLightRight,
    chestAccentLight,
    ambientLight,
    contactShadow,
  };
}
