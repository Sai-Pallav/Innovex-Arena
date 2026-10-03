const puppeteer = require('puppeteer-core');

async function runVerification() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });

  console.log('--- STARTING PRIORITY 1 BENCHMARK & VERIFICATION ---');

  // Track console logs and errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  // TEST 1: Initial Mount & Generation Time
  console.log('\n[TEST 1] Initial Mount & Async Batched Generation...');
  const tStart = Date.now();
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

  // Check if loading overlay appears during preparation
  let spinnerDetected = false;
  try {
    await page.waitForSelector('.animate-spin', { timeout: 800 });
    spinnerDetected = true;
    console.log('  -> Confirmed: Loading spinner rendered and active on main thread!');
  } catch (e) {
    console.log('  -> Note: Spinner did not appear within 800ms (or already finished)');
  }

  // Wait for robot to be ready
  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 20000 });
  const firstRenderTime = Date.now() - tStart;
  console.log(`  -> First Rendered Frame Latency: ${firstRenderTime} ms`);

  // Wait for benchmark to settle
  await new Promise(r => setTimeout(r, 1200));

  // Inspect first visit scene metrics
  const visit1Metrics = await page.evaluate(() => {
    const scene = window.__robotScene;
    const renderer = scene.getRenderer();
    const stats = scene.getDebugStats();
    const heap = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576 * 10) / 10 : null;

    return {
      isReady: scene.isReady,
      source: scene.modelSource,
      meshCount: stats ? stats.meshCount : 0,
      triangleCount: stats ? stats.triangleCount : 0,
      geometryCount: stats ? stats.geometryCount : 0,
      drawCalls: renderer.info.render.calls,
      heapMB: heap,
      hasController: !!scene.getController(),
      hasDebugManager: !!scene.getDebugStats(),
    };
  });
  console.log('  -> Visit 1 Metrics:', JSON.stringify(visit1Metrics, null, 2));

  // TEST 2: Verify Interactive Features on Instance 1
  console.log('\n[TEST 2] Testing Interactive Features...');
  const interactionTest = await page.evaluate(async () => {
    const scene = window.__robotScene;
    const ctrl = scene.getController();

    // 1. Cursor look-at
    ctrl.setLookTarget(0.7, -0.4, 1.5);
    ctrl.update(0.016);
    const headRotX = scene.robotNodes.head.rotation.x;
    const headRotY = scene.robotNodes.head.rotation.y;

    // 2. Hand pose
    ctrl.setHandPose('right', 'pointing', 0.2);
    ctrl.update(0.2);
    const handPose = ctrl.getHandPose('right');

    // 3. Exploded view
    const explodedBefore = scene.isExplodedView();
    const explodedToggled = scene.toggleExplodedView();
    const explodedAfter = scene.isExplodedView();
    scene.toggleExplodedView(); // restore

    // 4. Debug wireframe mode
    const debugBefore = scene.isDebugMode();
    const debugToggled = scene.toggleDebugMode();
    const debugAfter = scene.isDebugMode();
    scene.toggleDebugMode(); // restore

    return {
      headRotated: headRotX !== 0 || headRotY !== 0,
      handPoseApplied: handPose === 'pointing',
      explodedWorked: !explodedBefore && explodedToggled && explodedAfter,
      debugWorked: !debugBefore && debugToggled && debugAfter,
    };
  });
  console.log('  -> Interactive Feature Test:', JSON.stringify(interactionTest, null, 2));

  // Take screenshot of robot on visit 1
  await page.screenshot({ path: 'scripts/p1_visit1_screenshot.png' });
  console.log('  -> Saved screenshot: scripts/p1_visit1_screenshot.png');

  // TEST 3: Navigation away (Unmount)
  console.log('\n[TEST 3] Navigating away to About page (Unmount)...');
  await page.evaluate(() => {
    // Navigate using React Router or pushState
    window.history.pushState({}, '', '/about');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await new Promise(r => setTimeout(r, 600));

  const unmountCheck = await page.evaluate(() => {
    return {
      robotSceneInWindow: !!window.__robotScene,
      url: window.location.pathname,
    };
  });
  console.log('  -> Unmount State:', unmountCheck);

  // TEST 4: Return to Home (Remount)
  console.log('\n[TEST 4] Navigating back to Home page (Remount)...');
  const tRemountStart = Date.now();
  await page.evaluate(() => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 5000 });
  const remountDuration = Date.now() - tRemountStart;
  console.log(`  -> Remount to First Render Duration: ${remountDuration} ms`);

  await new Promise(r => setTimeout(r, 800));

  const visit2Metrics = await page.evaluate(() => {
    const scene = window.__robotScene;
    const renderer = scene.getRenderer();
    const stats = scene.getDebugStats();
    const heap = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576 * 10) / 10 : null;

    return {
      isReady: scene.isReady,
      source: scene.modelSource,
      meshCount: stats ? stats.meshCount : 0,
      triangleCount: stats ? stats.triangleCount : 0,
      geometryCount: stats ? stats.geometryCount : 0,
      drawCalls: renderer.info.render.calls,
      heapMB: heap,
    };
  });
  console.log('  -> Visit 2 Metrics:', JSON.stringify(visit2Metrics, null, 2));

  // Take screenshot of robot on visit 2
  await page.screenshot({ path: 'scripts/p1_visit2_screenshot.png' });
  console.log('  -> Saved screenshot: scripts/p1_visit2_screenshot.png');

  // TEST 5: Repeated Navigation Memory & Stability Test (5 round trips)
  console.log('\n[TEST 5] Repeated Navigation Cycle (5 round trips)...');
  const heapHistory = [visit2Metrics.heapMB];

  for (let i = 1; i <= 5; i++) {
    // Nav to About
    await page.evaluate(() => {
      window.history.pushState({}, '', '/about');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await new Promise(r => setTimeout(r, 300));

    // Nav to Home
    const tCycleStart = Date.now();
    await page.evaluate(() => {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 5000 });
    const cycleMs = Date.now() - tCycleStart;

    const cycleHeap = await page.evaluate(() => {
      return performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576 * 10) / 10 : null;
    });
    heapHistory.push(cycleHeap);
    console.log(`  -> Cycle ${i}: Ready in ${cycleMs} ms | Heap: ${cycleHeap} MB`);
  }

  console.log('\n--- VERIFICATION COMPLETE ---');
  console.log('Console Errors:', consoleErrors.length === 0 ? 'ZERO (Clean)' : consoleErrors);

  const report = {
    firstRenderTimeMs: firstRenderTime,
    remountDurationMs: remountDuration,
    visit1Metrics,
    visit2Metrics,
    interactionTest,
    spinnerDetected,
    heapHistory,
    consoleErrors
  };

  await browser.close();
  return report;
}

runVerification().then(res => {
  console.log('\nFINAL BENCHMARK JSON:');
  console.log(JSON.stringify(res, null, 2));
}).catch(console.error);
