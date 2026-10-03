const puppeteer = require('puppeteer-core');

async function measureRemountTable() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 20000 });

  const tableData = await page.evaluate(async () => {
    const { RobotResourceManager } = await import('/src/robot/robot/RobotResourceManager.ts');
    const { RobotScene } = await import('/src/robot/scene/RobotScene.ts');
    const mgr = RobotResourceManager.getInstance();

    const trials = [];
    for (let t = 0; t < 5; t++) {
      // 1. Resource retrieval
      const tResStart = performance.now();
      await mgr.ensureResources();
      const resourceRetrievalMs = performance.now() - tResStart;

      // 2. Robot instance acquisition
      const tAcqStart = performance.now();
      const inst = await mgr.acquireRobotInstanceAsync();
      const instanceAcquisitionMs = performance.now() - tAcqStart;

      // 3. Isolated Robot ready
      const testContainer = document.createElement('div');
      testContainer.style.width = '600px';
      testContainer.style.height = '600px';
      document.body.appendChild(testContainer);

      const tSceneStart = performance.now();
      const scene = new RobotScene({ container: testContainer });
      while (!scene.isReady) {
        await new Promise(r => setTimeout(r, 2));
      }
      const robotReadyMs = performance.now() - tSceneStart;

      // 4. First interactive frame
      const tFrameStart = performance.now();
      scene.getRenderer().render(scene.getScene(), scene.getCamera());
      await new Promise(r => requestAnimationFrame(r));
      const firstInteractiveFrameMs = performance.now() - tFrameStart;

      scene.dispose();
      testContainer.remove();

      // 5. Measure React Unmount
      const tUnmountStart = performance.now();
      document.querySelector('a[href="/about"]').click();
      while (window.__robotScene !== null) {
        await new Promise(r => setTimeout(r, 2));
      }
      const reactUnmountMs = performance.now() - tUnmountStart;

      await new Promise(r => setTimeout(r, 200));

      // 6. Measure React Mount & Full Route Transition (About -> Home)
      const tRouteStart = performance.now();
      document.querySelector('a[href="/"]').click();

      while (window.__robotScene === null) {
        await new Promise(r => setTimeout(r, 2));
      }
      const reactMountMs = performance.now() - tRouteStart;

      while (!window.__robotScene.isReady) {
        await new Promise(r => setTimeout(r, 2));
      }
      const fullRouteTransitionMs = performance.now() - tRouteStart;

      await new Promise(r => requestAnimationFrame(r));
      const fullDomTeardownRemountMs = performance.now() - tRouteStart;

      await new Promise(r => setTimeout(r, 200));

      trials.push({
        reactUnmountMs,
        reactMountMs,
        resourceRetrievalMs,
        instanceAcquisitionMs,
        robotReadyMs,
        firstInteractiveFrameMs,
        fullRouteTransitionMs,
        fullDomTeardownRemountMs
      });
    }

    // Compute averages
    const avg = {};
    const keys = Object.keys(trials[0]);
    for (const k of keys) {
      const vals = trials.map(tr => tr[k]);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      avg[k] = mean.toFixed(2);
    }

    return { trials, avg };
  });

  console.log('REMOUNT TABLE RESULTS:', JSON.stringify(tableData, null, 2));
  await browser.close();
}

measureRemountTable().catch(console.error);
