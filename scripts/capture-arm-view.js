import puppeteer from 'puppeteer-core';
import path from 'path';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--window-size=1920,1080'
    ],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  console.log('Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });

  console.log('Waiting 5s for 3D robot model to initialize...');
  await new Promise(r => setTimeout(r, 5000));

  // Hide UI overlays, freeze loop, set neutral orientation
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      header, nav, footer, h1, h2, h3, p, button, a, .badge, .grid, [class*="hero"], [class*="stats"] {
        display: none !important;
      }
      #home-hero > div > div:first-child {
        display: none !important;
      }
      #home-hero > div > div:last-child {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 999999 !important;
      }
    `;
    document.head.appendChild(style);

    const scene = window.__robotScene;
    if (scene) {
      scene.stop();
      if (scene.resizeObserver) {
        scene.resizeObserver.disconnect();
      }
      scene.getRenderer().setSize(1920, 1080);
      const cam = scene.getCamera();
      cam.aspect = 1920 / 1080;
      cam.updateProjectionMatrix();

      const root = scene.getScene().getObjectByName('RobotRoot');
      if (root) {
        root.rotation.set(0, 0, 0);
        root.position.set(0, -0.45, 0);
        root.scale.setScalar(1.0);
        root.updateMatrixWorld(true);
      }
    }
  });

  const outDir = process.env.OUT_DIR || 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\53ee15a5-7a01-4b57-a536-dc135604aa6a';

  async function renderAndShoot(filename, setupCamFn, ...args) {
    await page.evaluate(setupCamFn, ...args);
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(outDir, filename), fullPage: false });
    console.log(`Saved ${filename}`);
  }

  // 1. FRONT VIEW of upper body and arms (matching Image 1 & 2 framing)
  console.log('Capturing FRONT VIEW...');
  await renderAndShoot('current_arms_front.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const chest = scene.getScene().getObjectByName('ChestPlate_Central');
    const pos = cam.position.clone();
    if (chest) {
      chest.getWorldPosition(pos);
    } else {
      pos.set(0, 0.45, 0);
    }
    cam.position.set(0, pos.y - 0.10, pos.z + 0.92);
    cam.lookAt(0, pos.y - 0.10, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 2. 3/4 VIEW
  console.log('Capturing 3/4 VIEW...');
  await renderAndShoot('current_arms_34.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const chest = scene.getScene().getObjectByName('ChestPlate_Central');
    const pos = cam.position.clone();
    if (chest) {
      chest.getWorldPosition(pos);
    } else {
      pos.set(0, 0.45, 0);
    }
    cam.position.set(-0.62, pos.y - 0.04, pos.z + 0.82);
    cam.lookAt(0, pos.y - 0.10, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 3. SIDE VIEW (Right Arm Lateral Profile)
  console.log('Capturing SIDE VIEW...');
  await renderAndShoot('current_arms_side.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const chest = scene.getScene().getObjectByName('ChestPlate_Central');
    const pos = cam.position.clone();
    if (chest) {
      chest.getWorldPosition(pos);
    } else {
      pos.set(0, 0.45, 0);
    }
    cam.position.set(-0.95, pos.y - 0.10, pos.z);
    cam.lookAt(0, pos.y - 0.10, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 4. 3/4 SIDE VIEW (Posterolateral Profile)
  console.log('Capturing 3/4 SIDE VIEW...');
  await renderAndShoot('current_arms_34_side.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const chest = scene.getScene().getObjectByName('ChestPlate_Central');
    const pos = cam.position.clone();
    if (chest) {
      chest.getWorldPosition(pos);
    } else {
      pos.set(0, 0.45, 0);
    }
    cam.position.set(-0.85, pos.y - 0.04, pos.z + 0.45);
    cam.lookAt(0, pos.y - 0.10, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 5. CURRENT WEBSITE CAMERA VIEW (Default Production Framing)
  console.log('Capturing CURRENT WEBSITE CAMERA VIEW...');
  await renderAndShoot('current_arms_website.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    cam.position.set(0, 0.18, 1.45);
    cam.lookAt(0, 0.05, 0);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 6. ELEVATED VIEW
  console.log('Capturing ELEVATED VIEW...');
  await renderAndShoot('current_arms_elevated.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const chest = scene.getScene().getObjectByName('ChestPlate_Central');
    const pos = cam.position.clone();
    if (chest) {
      chest.getWorldPosition(pos);
    } else {
      pos.set(0, 0.45, 0);
    }
    cam.position.set(-0.55, pos.y + 0.35, pos.z + 0.85);
    cam.lookAt(0, pos.y - 0.10, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 7. HAND CLOSE-UP VIEW
  console.log('Capturing HAND CLOSE-UP VIEW...');
  await renderAndShoot('current_hand_closeup.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const hand = scene.getScene().getObjectByName('RightHandRoot') || scene.getScene().getObjectByName('PalmChassis');
    const pos = cam.position.clone();
    if (hand) {
      hand.getWorldPosition(pos);
    } else {
      pos.set(0.28, -0.22, 0.06);
    }
    cam.position.set(pos.x + 0.10, pos.y + 0.04, pos.z + 0.25);
    cam.lookAt(pos.x, pos.y - 0.02, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 5. KINEMATIC TESTS: Articulation across 0°, -17°, -52°, and -86° flexion
  console.log('Capturing KINEMATIC FLEXION TESTS...');
  const poses = [
    { name: 'arm_kinematics_neutral.png', angle: 0.0, label: '0° Neutral' },
    { name: 'arm_kinematics_resting.png', angle: -0.30, label: '-17° Resting' },
    { name: 'arm_kinematics_flexed.png', angle: -0.90, label: '-52° Flexed' },
    { name: 'arm_kinematics_deepflex.png', angle: -1.50, label: '-86° Deep Flex' },
  ];

  for (const pose of poses) {
    console.log(`Capturing ${pose.label} (${pose.name})...`);
    await renderAndShoot(pose.name, (angle) => {
      const scene = window.__robotScene;
      const rightPivot = scene.getScene().getObjectByName('RightForearmPivot');
      const leftPivot = scene.getScene().getObjectByName('LeftForearmPivot');
      if (rightPivot) rightPivot.rotation.x = angle;
      if (leftPivot) leftPivot.rotation.x = angle;

      const cam = scene.getCamera();
      const chest = scene.getScene().getObjectByName('ChestPlate_Central');
      const pos = cam.position.clone();
      if (chest) {
        chest.getWorldPosition(pos);
      } else {
        pos.set(0, 0.45, 0);
      }
      cam.position.set(-0.65, pos.y - 0.06, pos.z + 0.78);
      cam.lookAt(0, pos.y - 0.10, pos.z);
      cam.updateProjectionMatrix();
      scene.getRenderer().render(scene.getScene(), cam);
    }, pose.angle);
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
