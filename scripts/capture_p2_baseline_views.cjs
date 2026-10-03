const puppeteer = require('puppeteer-core');

async function captureViews() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });

  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 20000 });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Full Body (Front 3/4 default)
  await page.screenshot({ path: 'scripts/p2_baseline_fullbody.png' });
  console.log('Saved scripts/p2_baseline_fullbody.png');

  // Helper to adjust camera for closeups
  async function snap(name, camX, camY, camZ, lookX, lookY, lookZ) {
    await page.evaluate(({ cx, cy, cz, lx, ly, lz }) => {
      const cam = window.__robotScene.getCamera();
      cam.position.set(cx, cy, cz);
      cam.lookAt(lx, ly, lz);
      cam.updateProjectionMatrix();
      const renderer = window.__robotScene.getRenderer();
      renderer.render(window.__robotScene.getScene(), cam);
    }, { cx: camX, cy: camY, cz: camZ, lx: lookX, ly: lookY, lz: lookZ });
    await new Promise(r => setTimeout(r, 200));
    await page.screenshot({ path: `scripts/p2_baseline_${name}.png` });
    console.log(`Saved scripts/p2_baseline_${name}.png`);
  }

  // 2. Close-up Head
  await snap('closeup_head', 0, 0.45, 0.75, 0, 0.45, 0);

  // 3. Close-up Hand
  await snap('closeup_hand', 0.35, -0.15, 0.6, 0.30, -0.22, 0);

  // 4. Close-up Arm (shoulder to forearm)
  await snap('closeup_arm', 0.5, 0.15, 0.9, 0.28, 0.1, 0);

  // 5. Front View
  await snap('front', 0, 0.1, 1.8, 0, 0.05, 0);

  // 6. Side View
  await snap('side', 1.6, 0.1, 0.1, 0, 0.05, 0);

  // Restore camera & Exploded View
  await page.evaluate(() => {
    const cam = window.__robotScene.getCamera();
    cam.position.set(0, 0.08, 1.95);
    cam.lookAt(0, 0.08, 0);
    window.__robotScene.toggleExplodedView();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'scripts/p2_baseline_exploded.png' });
  console.log('Saved scripts/p2_baseline_exploded.png');

  // Restore exploded & Wireframe Debug View
  await page.evaluate(() => {
    window.__robotScene.toggleExplodedView();
    window.__robotScene.toggleDebugMode();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'scripts/p2_baseline_debug.png' });
  console.log('Saved scripts/p2_baseline_debug.png');

  await browser.close();
}

captureViews().catch(console.error);
