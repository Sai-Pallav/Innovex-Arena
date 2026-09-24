import puppeteer from 'puppeteer-core';
import path from 'path';

async function main() {
  console.log('Launching Chrome with WebGL support...');
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
  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type().toUpperCase()}] ${text}`);
    if (msg.type() === 'error') {
      console.error(`Browser Console Error: ${text}`);
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.toString());
    console.error(`Page Error: ${err}`);
  });

  console.log('Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });

  console.log('Waiting 6s for WebGL scene and animations to run...');
  await new Promise(r => setTimeout(r, 6000));

  const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\f66ee6c4-79e8-4781-a668-da45845bcbf7';

  // 1. Capture Full Web Page View (Hero Section with Live Robot)
  console.log('Capturing full webpage hero view...');
  await page.screenshot({ path: path.join(outDir, 'browser_live_hero_view.png'), fullPage: false });
  console.log('Saved browser_live_hero_view.png');

  // 2. Evaluate Scene State and Diagnostics
  const diagnostics = await page.evaluate(() => {
    const scene = window.__robotScene;
    if (!scene) {
      return { loaded: false, error: 'window.__robotScene not found' };
    }

    const threeScene = scene.getScene();
    const renderer = scene.getRenderer();
    const camera = scene.getCamera();
    const root = threeScene.getObjectByName('RobotRoot');

    let totalMeshes = 0;
    let totalLights = 0;
    threeScene.traverse(obj => {
      if (obj.isMesh) totalMeshes++;
      if (obj.isLight) totalLights++;
    });

    const info = renderer.info;

    // Check Right Arm and Left Arm world positions
    const rightArm = threeScene.getObjectByName('RightRobotArmRoot');
    const leftArm = threeScene.getObjectByName('LeftRobotArmRoot');
    const rightHand = threeScene.getObjectByName('RightHandRoot') || threeScene.getObjectByName('PalmChassis');

    const rightForearmPivot = threeScene.getObjectByName('RightForearmPivot');
    const leftForearmPivot = threeScene.getObjectByName('LeftForearmPivot');

    return {
      loaded: true,
      totalMeshes,
      totalLights,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      hasRightArm: !!rightArm,
      hasLeftArm: !!leftArm,
      hasRightHand: !!rightHand,
      rightElbowAngle: rightForearmPivot ? rightForearmPivot.rotation.x : null,
      leftElbowAngle: leftForearmPivot ? leftForearmPivot.rotation.x : null,
      cameraPos: [camera.position.x, camera.position.y, camera.position.z],
    };
  });

  console.log('\n=== BROWSER WEBGL DIAGNOSTICS ===');
  console.log(JSON.stringify(diagnostics, null, 2));

  // 3. Isolated Robot Captures (Heroic Front, 3/4, and Side)
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.id = 'inspect-overlay-hide';
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

  async function renderAndShoot(filename, setupCamFn) {
    await page.evaluate(setupCamFn);
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, filename), fullPage: false });
    console.log(`Saved ${filename}`);
  }

  // A. Front View
  console.log('Capturing verified Front View...');
  await renderAndShoot('browser_verified_front.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    cam.position.set(0, 0.35, 0.95);
    cam.lookAt(0, 0.35, 0);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // B. 3/4 Perspective View
  console.log('Capturing verified 3/4 View...');
  await renderAndShoot('browser_verified_34.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    cam.position.set(-0.62, 0.40, 0.85);
    cam.lookAt(0, 0.35, 0);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // C. Right Arm Close-Up
  console.log('Capturing verified Right Arm Close-up...');
  await renderAndShoot('browser_verified_right_arm.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    cam.position.set(0.28, 0.30, 0.52);
    cam.lookAt(0.26, 0.30, 0);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  // D. Left Arm Close-Up
  console.log('Capturing verified Left Arm Close-up...');
  await renderAndShoot('browser_verified_left_arm.png', () => {
    const scene = window.__robotScene;
    const cam = scene.getCamera();
    cam.position.set(-0.28, 0.30, 0.52);
    cam.lookAt(-0.26, 0.30, 0);
    cam.updateProjectionMatrix();
    scene.getRenderer().render(scene.getScene(), cam);
  });

  console.log('\n=== CONSOLE SUMMARY ===');
  console.log(`Console messages count: ${consoleMessages.length}`);
  console.log(`Page errors count: ${pageErrors.length}`);
  if (pageErrors.length > 0) {
    console.error('Page Errors encountered:', pageErrors);
  }

  await browser.close();
  console.log('Browser verification completed successfully.');
}

main().catch(err => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
