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
      '--window-size=1600,1000'
    ],
    defaultViewport: { width: 1600, height: 1000 }
  });

  const page = await browser.newPage();
  console.log('Navigating to http://localhost:5173/...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

  console.log('Waiting 5s for 3D robot model to initialize...');
  await new Promise(r => setTimeout(r, 5000));

  const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\be7a1198-7713-4b54-a5d7-8e9a789dff62';

  // 1. Capture Left Wrist & Forearm/Hand junction in Normal View
  console.log('Framing camera on Left Wrist (Normal Assembled View)...');
  await page.evaluate(() => {
    const scene = window.__robotScene;
    if (scene) {
      const wrist = scene.getScene().getObjectByName('LeftWristPivot') || scene.getScene().getObjectByName('LeftHand');
      if (wrist) {
        const target = new wrist.position.constructor();
        wrist.getWorldPosition(target);
        console.log('Wrist world pos:', target.x, target.y, target.z);
        const cam = scene.getCamera();
        // Camera positioned at an elevated 3/4 angle looking at wrist and forearm cuff
        cam.position.set(target.x + 0.05, target.y + 0.03, target.z + 0.28);
        cam.lookAt(target.x, target.y - 0.015, target.z);
        cam.updateProjectionMatrix();
      }
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotWristNormal = path.join(outDir, 'refined_wrist_normal.png');
  await page.screenshot({ path: shotWristNormal, fullPage: false });
  console.log('Saved refined wrist normal view to:', shotWristNormal);

  // 2. Capture Waist, Pelvic Shield & Hips in Normal View
  console.log('Framing camera on Waist & Pelvic Assembly (Normal View)...');
  await page.evaluate(() => {
    const scene = window.__robotScene;
    if (scene) {
      const pelvic = scene.getScene().getObjectByName('PelvicShieldPlate') || scene.getScene().getObjectByName('WaistPivot');
      if (pelvic) {
        const target = new pelvic.position.constructor();
        pelvic.getWorldPosition(target);
        console.log('Pelvic world pos:', target.x, target.y, target.z);
        const cam = scene.getCamera();
        // Step back and frame the entire pelvis, groin shield, inguinal flaps, and bilateral hips
        cam.position.set(0, target.y + 0.04, target.z + 0.38);
        cam.lookAt(0, target.y, target.z);
        cam.updateProjectionMatrix();
      }
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotWaistNormal = path.join(outDir, 'refined_waist_normal.png');
  await page.screenshot({ path: shotWaistNormal, fullPage: false });
  console.log('Saved refined waist normal view to:', shotWaistNormal);

  // 3. Trigger Exploded View
  console.log('Activating Exploded View...');
  await page.evaluate(() => {
    const scene = window.__robotScene;
    if (scene) {
      scene.toggleExplodedView();
    }
  });
  // Wait for smooth animated damp interpolation to reach full exploded extension
  await new Promise(r => setTimeout(r, 2200));

  // 4. Capture Left Wrist in Exploded Open View
  console.log('Framing camera on Left Wrist (Exploded Open View)...');
  await page.evaluate(() => {
    const scene = window.__robotScene;
    if (scene) {
      const wrist = scene.getScene().getObjectByName('LeftWristPivot') || scene.getScene().getObjectByName('LeftHand');
      if (wrist) {
        const target = new wrist.position.constructor();
        wrist.getWorldPosition(target);
        const cam = scene.getCamera();
        cam.position.set(target.x + 0.06, target.y + 0.03, target.z + 0.28);
        cam.lookAt(target.x, target.y - 0.015, target.z);
        cam.updateProjectionMatrix();
      }
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotWristExploded = path.join(outDir, 'refined_wrist_exploded.png');
  await page.screenshot({ path: shotWristExploded, fullPage: false });
  console.log('Saved refined wrist exploded view to:', shotWristExploded);

  // 5. Capture Waist, Pelvic Shield & Hips in Exploded Open View
  console.log('Framing camera on Waist & Pelvic Assembly (Exploded Open View)...');
  await page.evaluate(() => {
    const scene = window.__robotScene;
    if (scene) {
      const pelvic = scene.getScene().getObjectByName('PelvicShieldPlate') || scene.getScene().getObjectByName('WaistPivot');
      if (pelvic) {
        const target = new pelvic.position.constructor();
        pelvic.getWorldPosition(target);
        const cam = scene.getCamera();
        cam.position.set(0, target.y + 0.04, target.z + 0.42);
        cam.lookAt(0, target.y, target.z);
        cam.updateProjectionMatrix();
      }
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotWaistExploded = path.join(outDir, 'refined_waist_exploded.png');
  await page.screenshot({ path: shotWaistExploded, fullPage: false });
  console.log('Saved refined waist exploded view to:', shotWaistExploded);

  // 6. Capture Full Mecha Overview in Exploded View (framed to see torso, arms, waist, and hips)
  console.log('Framing full mecha exploded overview...');
  await page.evaluate(() => {
    const scene = window.__robotScene;
    if (scene) {
      const cam = scene.getCamera();
      cam.position.set(0, 0.15, 1.45);
      cam.lookAt(0, 0.10, 0);
      cam.updateProjectionMatrix();
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotOverviewExploded = path.join(outDir, 'refined_robot_exploded_overview.png');
  await page.screenshot({ path: shotOverviewExploded, fullPage: false });
  console.log('Saved full robot exploded overview to:', shotOverviewExploded);

  // Return to normal assembled view
  await page.evaluate(() => {
    const scene = window.__robotScene;
    if (scene) {
      scene.toggleExplodedView();
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  await browser.close();
  console.log('All screenshots captured successfully!');
}

main().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
