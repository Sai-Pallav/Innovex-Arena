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
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

  console.log('Waiting for 3D robot model...');
  await new Promise(r => setTimeout(r, 4000));

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
        root.position.set(0, -0.42, 0);
        root.scale.setScalar(1.25);
        root.updateMatrixWorld(true);
      }
      scene.getRenderer().render(scene.getScene(), cam);
    }
  });

  const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\13647c41-0ce1-42a9-acfd-c74581739eff';

  async function shoot(filename, setupFn) {
    await page.evaluate(setupFn);
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, filename), fullPage: false });
    console.log(`Saved ${filename}`);
  }

  // 1. FRONT VIEW (Torso & both shoulders)
  console.log('Shooting 1_front.png...');
  await shoot('1_front.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const chest = scene.getScene().getObjectByName('ChestPlate_Central');
    const pos = cam.position.clone();
    chest.getWorldPosition(pos);
    cam.position.set(pos.x, pos.y + 0.015, pos.z + 0.62);
    cam.lookAt(pos.x, pos.y + 0.015, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 2. LEFT 3/4 VIEW (Close on left shoulder)
  console.log('Shooting 2_left_3_4.png...');
  await shoot('2_left_3_4.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const joint = scene.getScene().getObjectByName('LeftShoulderJoint') || scene.getScene().getObjectByName('LeftShoulderModule');
    const pos = cam.position.clone();
    joint.getWorldPosition(pos);
    cam.position.set(pos.x - 0.22, pos.y + 0.06, pos.z + 0.32);
    cam.lookAt(pos.x + 0.04, pos.y, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 3. RIGHT 3/4 VIEW (Close on right shoulder)
  console.log('Shooting 3_right_3_4.png...');
  await shoot('3_right_3_4.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const joint = scene.getScene().getObjectByName('RightShoulderJoint') || scene.getScene().getObjectByName('RightShoulderModule');
    const pos = cam.position.clone();
    joint.getWorldPosition(pos);
    cam.position.set(pos.x + 0.22, pos.y + 0.06, pos.z + 0.32);
    cam.lookAt(pos.x - 0.04, pos.y, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 4. LEFT SIDE VIEW (Direct side profile of shoulder)
  console.log('Shooting 4_left_side.png...');
  await shoot('4_left_side.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const joint = scene.getScene().getObjectByName('LeftShoulderJoint') || scene.getScene().getObjectByName('LeftShoulderModule');
    const pos = cam.position.clone();
    joint.getWorldPosition(pos);
    cam.position.set(pos.x - 0.38, pos.y, pos.z);
    cam.lookAt(pos.x, pos.y, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 5. REAR VIEW (Back of torso and shoulders)
  console.log('Shooting 5_rear.png...');
  await shoot('5_rear.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const chest = scene.getScene().getObjectByName('ChestPlate_Central');
    const pos = cam.position.clone();
    chest.getWorldPosition(pos);
    cam.position.set(pos.x, pos.y + 0.015, pos.z - 0.62);
    cam.lookAt(pos.x, pos.y + 0.015, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 6. CHEST TRANSITION CLOSEUP (Left shoulder meeting chest)
  console.log('Shooting 6_transition_closeup.png...');
  await shoot('6_transition_closeup.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    // Torso is scaled 1.25 and at (0, -0.42, 0)
    // Left shoulder transition is around X = -0.18 * 1.25 = -0.225, Y = -0.42 + 0.08 * 1.25 = -0.32
    cam.position.set(-0.25, -0.30, 0.40);
    cam.lookAt(-0.20, -0.32, 0.02);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  await browser.close();
  console.log('All views captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
