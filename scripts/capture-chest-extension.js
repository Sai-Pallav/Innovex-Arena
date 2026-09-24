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

  // Hide all HTML UI text overlays, freeze animation, and set renderer to full 1920x1080
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
      scene.stop(); // Stop requestAnimationFrame loop
      if (scene.resizeObserver) {
        scene.resizeObserver.disconnect();
      }
      scene.getRenderer().setSize(1920, 1080);
      const cam = scene.getCamera();
      cam.aspect = 1920 / 1080;
      cam.updateProjectionMatrix();

      const root = scene.getScene().getObjectByName('RobotRoot');
      if (root) {
        root.rotation.set(0, 0, 0); // Neutral 0 rotation for perfect bilateral symmetry
      }
    }
  });

  const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\4d69c89b-4ca5-4d77-ac4b-db1c32668c8f';

  async function renderAndShoot(filename, setupFn) {
    await page.evaluate(setupFn);
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(outDir, filename), fullPage: false });
    console.log(`Saved ${filename}`);
  }

  // 1. FRONT VIEW (Direct front view matching Reference 1 "FRONT VIEW")
  console.log('Capturing FRONT VIEW...');
  await renderAndShoot('shot_1_front.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const chest = scene.getScene().getObjectByName('ChestPlate_Central');
    const pos = cam.position.clone();
    chest.getWorldPosition(pos);
    cam.position.set(pos.x, pos.y + 0.02, pos.z + 0.88);
    cam.lookAt(pos.x, pos.y + 0.02, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 2. LEFT 3/4 VIEW (Matching Reference 1 "LEFT 3/4 VIEW")
  console.log('Capturing LEFT 3/4 VIEW...');
  await renderAndShoot('shot_2_left_3_4.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const mount = scene.getScene().getObjectByName('LeftShoulderMountPivot');
    const pos = cam.position.clone();
    mount.getWorldPosition(pos);
    cam.position.set(pos.x - 0.36, pos.y + 0.12, pos.z + 0.44);
    cam.lookAt(pos.x + 0.08, pos.y - 0.01, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 3. LEFT SIDE VIEW (Looking purely down X-axis, matching Reference 1 "LEFT SIDE VIEW")
  console.log('Capturing LEFT SIDE VIEW...');
  await renderAndShoot('shot_3_left_side.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const mount = scene.getScene().getObjectByName('LeftShoulderMountPivot');
    const pos = cam.position.clone();
    mount.getWorldPosition(pos);
    cam.position.set(pos.x - 0.52, pos.y, pos.z);
    cam.lookAt(pos.x, pos.y, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 4. RIGHT 3/4 VIEW (Matching Reference 1 "RIGHT 3/4 VIEW")
  console.log('Capturing RIGHT 3/4 VIEW...');
  await renderAndShoot('shot_4_right_3_4.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const mount = scene.getScene().getObjectByName('RightShoulderMountPivot');
    const pos = cam.position.clone();
    mount.getWorldPosition(pos);
    cam.position.set(pos.x + 0.36, pos.y + 0.12, pos.z + 0.44);
    cam.lookAt(pos.x - 0.08, pos.y - 0.01, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 5. MOUNT INTERFACE DETAIL (Matching Reference 1 "MOUNT INTERFACE DETAIL")
  console.log('Capturing MOUNT INTERFACE DETAIL...');
  await renderAndShoot('shot_5_mount_detail.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const mount = scene.getScene().getObjectByName('LeftShoulderMountPivot');
    const pos = cam.position.clone();
    mount.getWorldPosition(pos);
    cam.position.set(pos.x - 0.18, pos.y + 0.05, pos.z + 0.16);
    cam.lookAt(pos.x + 0.01, pos.y, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 6. CHEST-TO-EXTENSION TRANSITION (Matching Reference 1 "CHEST-TO-EXTENSION TRANSITION")
  console.log('Capturing CHEST-TO-EXTENSION TRANSITION...');
  await renderAndShoot('shot_6_transition.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const strip = scene.getScene().getObjectByName('ChestLightStrip_Left');
    const pos = cam.position.clone();
    strip.getWorldPosition(pos);
    cam.position.set(pos.x - 0.10, pos.y + 0.06, pos.z + 0.30);
    cam.lookAt(pos.x - 0.02, pos.y, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 7. UNDERSIDE VIEW (Matching Reference 1 "UNDERSIDE STRUCTURE")
  console.log('Capturing UNDERSIDE VIEW...');
  await renderAndShoot('shot_7_underside.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const mount = scene.getScene().getObjectByName('LeftShoulderMountPivot');
    const pos = cam.position.clone();
    mount.getWorldPosition(pos);
    cam.position.set(pos.x - 0.12, pos.y - 0.22, pos.z + 0.16);
    cam.lookAt(pos.x + 0.06, pos.y - 0.02, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // 8. REAR VIEW (Matching Reference 1 "REAR STRUCTURAL DETAIL")
  console.log('Capturing REAR VIEW...');
  await renderAndShoot('shot_8_rear.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    const mount = scene.getScene().getObjectByName('LeftShoulderMountPivot');
    const pos = cam.position.clone();
    mount.getWorldPosition(pos);
    cam.position.set(pos.x - 0.22, pos.y + 0.06, pos.z - 0.28);
    cam.lookAt(pos.x + 0.06, pos.y, pos.z);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  console.log('All screenshots captured successfully!');
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
