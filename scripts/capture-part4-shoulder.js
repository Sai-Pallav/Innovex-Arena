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
        root.position.set(0, -0.42, 0);
        root.scale.setScalar(1.25);
        root.updateMatrixWorld(true);
      }
      scene.getRenderer().render(scene.getScene(), cam);
    }
  });

  const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\4d69c89b-4ca5-4d77-ac4b-db1c32668c8f';

  async function renderAndShoot(filename, setupCamFn) {
    await page.evaluate(setupCamFn);
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(outDir, filename), fullPage: false });
    console.log(`Saved ${filename}`);
  }

  // 1. FRONT VIEW (Tight framing matching Reference 1 "FRONT VIEW")
  console.log('Capturing FRONT VIEW...');
  await renderAndShoot('shot_part4_1_front.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const chest = scene.getScene().getObjectByName('ChestPlate_Central');
    const pos = cam.position.clone();
    chest.getWorldPosition(pos);
    cam.position.set(pos.x, pos.y + 0.015, pos.z + 0.65);
    cam.lookAt(pos.x, pos.y + 0.015, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 2. LEFT 3/4 VIEW (Matching Reference 1 "LEFT 3/4 VIEW")
  console.log('Capturing LEFT 3/4 VIEW...');
  await renderAndShoot('shot_part4_2_left_3_4.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const joint = scene.getScene().getObjectByName('LeftShoulderJoint');
    const pos = cam.position.clone();
    joint.getWorldPosition(pos);
    cam.position.set(pos.x - 0.22, pos.y + 0.05, pos.z + 0.30);
    cam.lookAt(pos.x + 0.05, pos.y - 0.005, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 3. LEFT SIDE VIEW (Matching Reference 1 "LEFT SIDE VIEW": chest on right, shoulder projecting left)
  console.log('Capturing LEFT SIDE VIEW...');
  await renderAndShoot('shot_part4_3_left_side.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const joint = scene.getScene().getObjectByName('LeftShoulderJoint');
    const pos = cam.position.clone();
    joint.getWorldPosition(pos);
    cam.position.set(pos.x - 0.22, pos.y + 0.015, pos.z + 0.15);
    cam.lookAt(pos.x + 0.04, pos.y + 0.01, pos.z - 0.01);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 4. 3/4 FRONT DETAIL (Matching Reference 1 "3/4 FRONT DETAIL": close-up macro)
  console.log('Capturing 3/4 FRONT DETAIL...');
  await renderAndShoot('shot_part4_4_detail.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const joint = scene.getScene().getObjectByName('LeftShoulderJoint');
    const pos = cam.position.clone();
    joint.getWorldPosition(pos);
    cam.position.set(pos.x - 0.15, pos.y + 0.035, pos.z + 0.19);
    cam.lookAt(pos.x + 0.015, pos.y, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 5. REAR VIEW (Matching Reference 1 "REAR VIEW")
  console.log('Capturing REAR VIEW...');
  await renderAndShoot('shot_part4_5_rear.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const joint = scene.getScene().getObjectByName('LeftShoulderJoint');
    const pos = cam.position.clone();
    joint.getWorldPosition(pos);
    cam.position.set(pos.x - 0.18, pos.y + 0.03, pos.z - 0.32);
    cam.lookAt(pos.x + 0.05, pos.y, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 6. RIGHT 3/4 VIEW (Matching Reference 1 symmetry)
  console.log('Capturing RIGHT 3/4 VIEW...');
  await renderAndShoot('shot_part4_6_right_3_4.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const joint = scene.getScene().getObjectByName('RightShoulderJoint');
    const pos = cam.position.clone();
    joint.getWorldPosition(pos);
    cam.position.set(pos.x + 0.22, pos.y + 0.05, pos.z + 0.30);
    cam.lookAt(pos.x - 0.05, pos.y - 0.005, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  await browser.close();
  console.log('All Part 4 views successfully captured!');
}

main().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
