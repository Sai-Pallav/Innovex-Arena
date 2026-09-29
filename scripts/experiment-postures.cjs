const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\9f13537d-b9eb-4351-a786-cf47dd57df3f\\experiments';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

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
      '--window-size=1600,1200'
    ],
    defaultViewport: { width: 1600, height: 1200 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await new Promise(r => setTimeout(r, 3500));

  // Hide UI text/overlays for clean 3D capture
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      header, nav, footer, h1, h2, h3, p, button, a, .badge, .grid, [class*="hero"], [class*="stats"], [class*="atmosphere"] {
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
  });

  async function applyAndCapture(label, overrides) {
    await page.evaluate((ov) => {
      const sceneObj = window.__robotScene;
      if (!sceneObj) return;
      const scene = sceneObj.getScene();
      const cam = sceneObj.getCamera();

      // Find legs
      const leftHip = scene.getObjectByName('LeftHip');
      const rightHip = scene.getObjectByName('RightHip');
      const leftKnee = scene.getObjectByName('LeftShinPivot');
      const rightKnee = scene.getObjectByName('RightShinPivot');
      const leftAnkle = scene.getObjectByName('LeftFootPivot') || (scene.getObjectByName('LeftShinPivot') ? scene.getObjectByName('LeftShinPivot').getObjectByName('FootPivot_L') : null);
      const rightAnkle = scene.getObjectByName('RightFootPivot') || (scene.getObjectByName('RightShinPivot') ? scene.getObjectByName('RightShinPivot').getObjectByName('FootPivot_R') : null);

      if (leftHip && rightHip) {
        // Left leg (side = -1)
        leftHip.rotation.x = ov.left.hipPitch;
        leftHip.rotation.z = -ov.left.hipRoll;
        leftHip.rotation.y = -ov.left.hipYaw;

        // Right leg (side = 1)
        rightHip.rotation.x = ov.right.hipPitch;
        rightHip.rotation.z = ov.right.hipRoll;
        rightHip.rotation.y = ov.right.hipYaw;
      }

      if (leftKnee && rightKnee) {
        leftKnee.rotation.x = ov.left.kneePitch;
        rightKnee.rotation.x = ov.right.kneePitch;
      }

      // Also frame camera matching uploaded image
      const pelvic = scene.getObjectByName('PelvicShieldPlate');
      let targetY = -0.4;
      if (pelvic) {
        const pos = pelvic.position.clone();
        pelvic.getWorldPosition(pos);
        targetY = pos.y;
      }

      // Position camera matching uploaded image crop
      cam.position.set(0, targetY - 0.11, 1.05);
      cam.lookAt(0, targetY - 0.13, 0);
      cam.updateProjectionMatrix();

      sceneObj.getRenderer().render(scene, cam);
    }, overrides);

    await new Promise(r => setTimeout(r, 600));
    const filePath = path.join(outDir, `${label}.png`);
    await page.screenshot({ path: filePath });
    console.log(`Saved ${label}.png`);
  }

  // 1. Current baseline
  await applyAndCapture('01_baseline', {
    left: { hipPitch: -0.04, hipRoll: 0.05, hipYaw: 0.03, kneePitch: 0.08 },
    right: { hipPitch: -0.04, hipRoll: 0.05, hipYaw: 0.03, kneePitch: 0.08 }
  });

  // 2. Athletic Stance A: Subtle widening, better knee flexion and toe splay
  await applyAndCapture('02_athletic_A', {
    left: { hipPitch: -0.06, hipRoll: 0.08, hipYaw: 0.06, kneePitch: 0.12 },
    right: { hipPitch: -0.06, hipRoll: 0.08, hipYaw: 0.06, kneePitch: 0.12 }
  });

  // 3. Athletic Stance B: Wider heroic A-frame stance (hipRoll 0.10, kneePitch 0.16)
  await applyAndCapture('03_heroic_A_frame', {
    left: { hipPitch: -0.08, hipRoll: 0.10, hipYaw: 0.08, kneePitch: 0.16 },
    right: { hipPitch: -0.08, hipRoll: 0.10, hipYaw: 0.08, kneePitch: 0.16 }
  });

  // 4. Stance C: Camera-compensated bilateral symmetry (root yaw is -10° / -0.174 rad)
  // Left leg yaw compensated so both legs face camera harmoniously
  await applyAndCapture('04_camera_compensated', {
    left: { hipPitch: -0.07, hipRoll: 0.09, hipYaw: 0.04, kneePitch: 0.14 },
    right: { hipPitch: -0.07, hipRoll: 0.09, hipYaw: 0.12, kneePitch: 0.14 }
  });

  // 5. Stance D: Pure straight / aligned stance
  await applyAndCapture('05_clean_aligned', {
    left: { hipPitch: -0.05, hipRoll: 0.07, hipYaw: 0.05, kneePitch: 0.10 },
    right: { hipPitch: -0.05, hipRoll: 0.07, hipYaw: 0.05, kneePitch: 0.10 }
  });

  await browser.close();
  console.log('Experiments completed!');
}

main().catch(console.error);
