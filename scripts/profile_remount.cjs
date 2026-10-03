const puppeteer = require('puppeteer-core');

async function profileRemount() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // Wait for initial scene to be completely ready
  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 20000 });
  console.log('Initial scene is ready!');

  const breakdown = await page.evaluate(async () => {
    const { RobotResourceManager } = await import('/src/robot/robot/RobotResourceManager.ts');
    const { RobotScene } = await import('/src/robot/scene/RobotScene.ts');

    const mgr = RobotResourceManager.getInstance();
    const mgrState = mgr.getState();

    // 1. Measure acquireRobotInstanceAsync
    const t0 = performance.now();
    const instance = await mgr.acquireRobotInstanceAsync();
    const t1 = performance.now();
    const acquireMs = t1 - t0;

    // 2. Measure RobotScene remount
    const container = document.createElement('div');
    container.style.width = '720px';
    container.style.height = '680px';
    document.body.appendChild(container);

    let tOnLoaded = 0;
    const t2 = performance.now();
    const scene = new RobotScene({
      container,
      onLoaded: () => {
        tOnLoaded = performance.now() - t2;
      }
    });

    // Wait until scene is ready
    while (!scene.isReady) {
      await new Promise(r => setTimeout(r, 10));
    }
    const t3 = performance.now();
    const totalRemountMs = t3 - t2;

    scene.dispose();
    container.remove();

    return {
      mgrState,
      acquireMs: acquireMs.toFixed(2),
      onLoadedMs: tOnLoaded.toFixed(2),
      totalRemountMs: totalRemountMs.toFixed(2)
    };
  });

  console.log('Remount Profile:', breakdown);
  await browser.close();
}

profileRemount().catch(console.error);
