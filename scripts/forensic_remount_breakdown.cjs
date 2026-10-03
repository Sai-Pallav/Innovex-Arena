const puppeteer = require('puppeteer-core');

async function runForensicRemount() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 20000 });
  console.log('Initial page ready.');

  // Part 1: Measure Isolated Three.js & Resource Manager timings
  const isolatedTimings = await page.evaluate(async () => {
    const { RobotResourceManager, cloneRobotNodes } = await import('/src/robot/robot/RobotResourceManager.ts');
    const { RobotScene } = await import('/src/robot/scene/RobotScene.ts');

    const mgr = RobotResourceManager.getInstance();

    // 1. Measure pure cloneRobotNodes
    const template = mgr['templateNodes'];
    const cloneStart = performance.now();
    const cloned = cloneRobotNodes(template);
    const cloneEnd = performance.now();
    const cloneNodesMs = cloneEnd - cloneStart;

    // 2. Measure acquireRobotInstanceAsync
    const acqStart = performance.now();
    const inst = await mgr.acquireRobotInstanceAsync();
    const acqEnd = performance.now();
    const acquireInstanceMs = acqEnd - acqStart;

    // 3. Measure isolated RobotScene creation (with container in DOM)
    const testDiv = document.createElement('div');
    testDiv.style.width = '600px';
    testDiv.style.height = '600px';
    document.body.appendChild(testDiv);

    let onLoadedDuration = 0;
    const sceneStart = performance.now();
    const scene = new RobotScene({
      container: testDiv,
      onLoaded: () => {
        onLoadedDuration = performance.now() - sceneStart;
      }
    });

    while (!scene.isReady) {
      await new Promise(r => setTimeout(r, 5));
    }
    const sceneEnd = performance.now();
    const sceneReadyMs = sceneEnd - sceneStart;

    // 4. Measure compile & first render
    const cam = scene.getCamera();
    const rend = scene.getRenderer();
    const renderStart = performance.now();
    rend.render(scene.getScene(), cam);
    const renderEnd = performance.now();
    const firstRenderMs = renderEnd - renderStart;

    scene.dispose();
    testDiv.remove();

    return {
      cloneNodesMs: cloneNodesMs.toFixed(2),
      acquireInstanceMs: acquireInstanceMs.toFixed(2),
      sceneReadyMs: sceneReadyMs.toFixed(2),
      onLoadedDuration: onLoadedDuration.toFixed(2),
      firstRenderMs: firstRenderMs.toFixed(2),
    };
  });

  console.log('Isolated Timings:', isolatedTimings);

  // Part 2: Measure Full Route Transition (React + DOM + WebGL)
  // We attach custom performance marks to trace the lifecycle
  await page.evaluate(() => {
    window.__remountTraces = {};
    const origPush = window.history.pushState.bind(window.history);
    window.__traceEvents = [];

    // Observe navigation
    window.addEventListener('popstate', () => {
      window.__traceEvents.push({ event: 'popstate', time: performance.now(), path: window.location.pathname });
    });
  });

  // Navigate to About
  console.log('Navigating to /about...');
  await page.evaluate(() => {
    window.__navToAboutStart = performance.now();
    window.history.pushState({}, '', '/about');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

  // Wait for unmount
  await new Promise(r => setTimeout(r, 500));
  const unmounted = await page.evaluate(() => !window.__robotScene);
  console.log('RobotScene unmounted:', unmounted);

  // Now measure navigating back to Home
  console.log('Navigating back to / (Home)...');
  const routeTransitionTimings = await page.evaluate(async () => {
    const t0 = performance.now();

    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
    const tPopstate = performance.now();

    // Poll for RobotScene creation
    while (!window.__robotScene) {
      await new Promise(r => setTimeout(r, 2));
    }
    const tSceneCreated = performance.now();

    // Poll for scene.isReady
    while (!window.__robotScene.isReady) {
      await new Promise(r => setTimeout(r, 2));
    }
    const tSceneReady = performance.now();

    // Wait for first RAF after ready
    await new Promise(r => requestAnimationFrame(r));
    const tFirstRafPainted = performance.now();

    return {
      t0,
      tPopstate: (tPopstate - t0).toFixed(2),
      routeToSceneCreatedMs: (tSceneCreated - t0).toFixed(2),
      sceneCreatedToReadyMs: (tSceneReady - tSceneCreated).toFixed(2),
      routeToSceneReadyMs: (tSceneReady - t0).toFixed(2),
      routeToFirstRafPaintedMs: (tFirstRafPainted - t0).toFixed(2),
    };
  });

  console.log('Route Transition Timings:', routeTransitionTimings);

  // Multiple repeated navigation cycles
  console.log('\nMeasuring 5 Route Cycles (Home <-> About)...');
  const repeatedCycles = [];
  for (let c = 1; c <= 5; c++) {
    // to About
    await page.evaluate(() => {
      window.history.pushState({}, '', '/about');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await new Promise(r => setTimeout(r, 250));

    // to Home
    const cycleTiming = await page.evaluate(async () => {
      const start = performance.now();
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));

      while (!window.__robotScene || !window.__robotScene.isReady) {
        await new Promise(r => setTimeout(r, 2));
      }
      const ready = performance.now();
      await new Promise(r => requestAnimationFrame(r));
      const painted = performance.now();

      return {
        readyMs: (ready - start).toFixed(2),
        paintedMs: (painted - start).toFixed(2),
        heapMB: performance.memory ? (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2) : null
      };
    });
    repeatedCycles.push({ cycle: c, ...cycleTiming });
    console.log(`  Cycle ${c}:`, cycleTiming);
    await new Promise(r => setTimeout(r, 250));
  }

  const finalReport = {
    isolatedTimings,
    routeTransitionTimings,
    repeatedCycles
  };

  console.log('\n=== FINAL FORENSIC REMOUNT BREAKDOWN ===');
  console.log(JSON.stringify(finalReport, null, 2));

  await browser.close();
}

runForensicRemount().catch(console.error);
