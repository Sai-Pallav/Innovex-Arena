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

  // 1. Capture Left Hand Dorsal Close-up (Dorsal 3D camber, central spine ridge, purple LED slit, knuckles)
  console.log('Framing camera on Left Hand Dorsal view...');
  await page.evaluate(() => {
    const scene = window.__robotScene;
    if (scene) {
      const hand = scene.getScene().getObjectByName('LeftHand');
      if (hand) {
        const target = new hand.position.constructor();
        hand.getWorldPosition(target);
        const cam = scene.getCamera();
        // Camera positioned to catch specular highlights across dorsal shield and knuckle arch
        cam.position.set(target.x + 0.05, target.y - 0.01, target.z + 0.32);
        cam.lookAt(target.x, target.y - 0.035, target.z);
        cam.updateProjectionMatrix();
      }
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotHandLeft = path.join(outDir, 'refined_hand_closeup_left.png');
  await page.screenshot({ path: shotHandLeft, fullPage: false });
  console.log('Saved refined left hand close-up to:', shotHandLeft);

  // 2. Capture Right Hand Close-up (Thumb thenar swivel, knuckle caps, lateral chamfers)
  console.log('Framing camera on Right Hand view...');
  await page.evaluate(() => {
    const scene = window.__robotScene;
    if (scene) {
      const hand = scene.getScene().getObjectByName('RightHand');
      if (hand) {
        const target = new hand.position.constructor();
        hand.getWorldPosition(target);
        const cam = scene.getCamera();
        cam.position.set(target.x - 0.05, target.y - 0.01, target.z + 0.32);
        cam.lookAt(target.x, target.y - 0.035, target.z);
        cam.updateProjectionMatrix();
      }
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotHandRight = path.join(outDir, 'refined_hand_closeup_right.png');
  await page.screenshot({ path: shotHandRight, fullPage: false });
  console.log('Saved refined right hand close-up to:', shotHandRight);

  // 3. Capture Palmar View (Inspecting dark thenar/hypothenar friction pads, tactile sensor domes)
  console.log('Framing camera on Palmar View (viewing from posterior / palmar angle)...');
  await page.evaluate(() => {
    const scene = window.__robotScene;
    if (scene) {
      const hand = scene.getScene().getObjectByName('LeftHand');
      if (hand) {
        const target = new hand.position.constructor();
        hand.getWorldPosition(target);
        const cam = scene.getCamera();
        // Looking at the inner palm from -Z
        cam.position.set(target.x + 0.02, target.y - 0.03, target.z - 0.28);
        cam.lookAt(target.x, target.y - 0.035, target.z);
        cam.updateProjectionMatrix();
      }
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotPalmar = path.join(outDir, 'refined_hand_palmar_view.png');
  await page.screenshot({ path: shotPalmar, fullPage: false });
  console.log('Saved refined palmar view to:', shotPalmar);

  // 4. Exploded View (Showing exploded hand dorsal shield and internal mechanical hierarchy)
  console.log('Activating Exploded View...');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const title = await page.evaluate(el => el.getAttribute('title') || '', btn);
    if (title.toLowerCase().includes('exploded')) {
      console.log('Clicking Exploded view button...');
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 2200));

  await page.evaluate(() => {
    const scene = window.__robotScene;
    if (scene) {
      const hand = scene.getScene().getObjectByName('LeftHand');
      if (hand) {
        const target = new hand.position.constructor();
        hand.getWorldPosition(target);
        const cam = scene.getCamera();
        cam.position.set(target.x + 0.06, target.y - 0.01, target.z + 0.34);
        cam.lookAt(target.x, target.y - 0.035, target.z);
        cam.updateProjectionMatrix();
      }
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotExploded = path.join(outDir, 'refined_hand_exploded.png');
  await page.screenshot({ path: shotExploded, fullPage: false });
  console.log('Saved refined hand exploded view to:', shotExploded);

  // Reset exploded view
  for (const btn of buttons) {
    const title = await page.evaluate(el => el.getAttribute('title') || '', btn);
    if (title.toLowerCase().includes('exploded')) {
      console.log('Restoring Exploded view button...');
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));

  // 5. 3/4 Perspective Beauty Shot of Left Arm & Hand
  console.log('Framing 3/4 Perspective Beauty Shot of Left Arm & Hand...');
  await page.evaluate(() => {
    const scene = window.__robotScene;
    if (scene) {
      const leftHand = scene.getScene().getObjectByName('LeftHand');
      if (leftHand) {
        const target = new leftHand.position.constructor();
        leftHand.getWorldPosition(target);
        const cam = scene.getCamera();
        // 3/4 elevated perspective showing forearm, carpal collar, dorsal shield, knuckles, and cascading fingers
        cam.position.set(target.x + 0.14, target.y + 0.10, target.z + 0.44);
        cam.lookAt(target.x, target.y - 0.03, target.z);
        cam.updateProjectionMatrix();
      }
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotPerspective = path.join(outDir, 'refined_hand_perspective_left.png');
  await page.screenshot({ path: shotPerspective, fullPage: false });
  console.log('Saved refined hand 3/4 perspective to:', shotPerspective);

  // 6. Dual Hands & Lower Limbs Overview shot
  console.log('Framing Dual Hands & Lower Arms Overview...');
  await page.evaluate(() => {
    const scene = window.__robotScene;
    if (scene) {
      const leftHand = scene.getScene().getObjectByName('LeftHand');
      if (leftHand) {
        const target = new leftHand.position.constructor();
        leftHand.getWorldPosition(target);
        const cam = scene.getCamera();
        // Camera centered on midpoint between both hands (x = 0, y = target.y)
        cam.position.set(0, target.y + 0.12, target.z + 1.10);
        cam.lookAt(0, target.y - 0.02, target.z);
        cam.updateProjectionMatrix();
      }
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotOverview = path.join(outDir, 'refined_robot_hands_overview.png');
  await page.screenshot({ path: shotOverview, fullPage: false });
  console.log('Saved refined robot hands overview to:', shotOverview);

  await browser.close();
  console.log('All screenshots captured successfully!');
}

main().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});

