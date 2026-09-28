const puppeteer = require('puppeteer-core');
const path = require('path');

const outDir = 'C:\\Users\\kotas\\.gemini\\antigravity-ide\\brain\\f9e25bc4-8063-4023-9eec-3fe4c89de1cb';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=d3d11', '--window-size=1600,1200'],
    defaultViewport: { width: 1600, height: 1200 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2500));

  await page.evaluate(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      header, nav, footer, h1, h2, h3, p, button, a, .badge, .grid, [class*="hero"], [class*="stats"], [class*="atmosphere"] {
        display: none !important;
      }
      #home-hero > div > div:first-child { display: none !important; }
      #home-hero > div > div:last-child { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 999999 !important; }
    `;
    document.head.appendChild(style);

    const scene = window.__robotScene;
    if (scene) {
      const cam = scene.getCamera();
      cam.aspect = 1600 / 1200;
      cam.updateProjectionMatrix();
      scene.getRenderer().setSize(1600, 1200);
    }
  });

  // Test values of left upper arm yaw: 0.14, 0.24, 0.32, -0.05
  const testYaws = [0.14, 0.22, 0.30, -0.10];
  for (const yaw of testYaws) {
    const info = await page.evaluate((testYaw) => {
      const scene = window.__robotScene;
      if (!scene || !scene.animationController) return null;
      const anim = scene.animationController;
      const lArm = scene.robotNodes.leftArmNodes;

      // Temporarily override left arm upperArm.y
      if (anim.leftPoseOverrides) {
        anim.leftPoseOverrides.upperArm.y = testYaw;
        if (anim.armController) {
          anim.armController.setPoseOverrides('left', anim.leftPoseOverrides);
        }
      }

      // Render one frame
      const cam = scene.getCamera();
      cam.position.set(0, 0.04, 2.16);
      cam.lookAt(0, 0.04, 0);
      cam.updateProjectionMatrix();
      scene.getRenderer().render(scene.getScene(), cam);

      const v = lArm.elbow.group.position.clone().set(1, 0, 0);
      lArm.elbow.group.updateWorldMatrix(true, false);
      v.transformDirection(lArm.elbow.group.matrixWorld);

      return {
        testYaw,
        hingeAxisWorld: { x: +v.x.toFixed(4), y: +v.y.toFixed(4), z: +v.z.toFixed(4) }
      };
    }, yaw);

    await new Promise(r => setTimeout(r, 400));
    const filename = `test_left_yaw_${yaw}.png`;
    await page.screenshot({ path: path.join(outDir, filename) });
    console.log(`Yaw ${yaw}:`, info?.hingeAxisWorld, `Saved ${filename}`);
  }

  await browser.close();
}

main().catch(console.error);
