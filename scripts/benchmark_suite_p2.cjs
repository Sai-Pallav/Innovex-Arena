const puppeteer = require('puppeteer-core');

async function measurePhase(page, name, durationMs = 2000) {
  return await page.evaluate((dur) => {
    return new Promise((resolve) => {
      const frameDeltas = [];
      let last = performance.now();
      const start = last;

      function step() {
        const now = performance.now();
        frameDeltas.push(now - last);
        last = now;

        if (now - start < dur) {
          requestAnimationFrame(step);
        } else {
          const avgDelta = frameDeltas.reduce((a, b) => a + b, 0) / frameDeltas.length;
          const minDelta = Math.min(...frameDeltas);
          const maxDelta = Math.max(...frameDeltas);
          const fps = 1000 / avgDelta;

          const renderer = window.__robotScene.getRenderer();
          const info = renderer.info;
          const heapMB = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576 * 10) / 10 : null;

          resolve({
            fps: Math.round(fps * 10) / 10,
            avgFrameTimeMs: Math.round(avgDelta * 100) / 100,
            minFrameTimeMs: Math.round(minDelta * 100) / 100,
            maxFrameTimeMs: Math.round(maxDelta * 100) / 100,
            drawCalls: info.render.calls,
            triangles: info.render.triangles,
            geometries: info.memory.geometries,
            heapMB,
            sampleCount: frameDeltas.length
          });
        }
      }
      requestAnimationFrame(step);
    });
  }, durationMs);
}

async function runBenchmarkSuite() {
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
  await new Promise(r => setTimeout(r, 1200));

  console.log('\n--- EXECUTING BASELINE SUITE (PRIORITY 2) ---');

  // Test 1 — Idle
  console.log('Test 1: Measuring Idle...');
  const idleResult = await measurePhase(page, 'Idle', 2500);
  console.log('  Idle:', idleResult);

  // Test 2 — Cursor Interaction
  console.log('Test 2: Measuring Cursor Interaction...');
  // Move cursor continuously in background
  const moveCursorPromise = (async () => {
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 4;
      const x = 768 + Math.cos(angle) * 300;
      const y = 430 + Math.sin(angle) * 200;
      await page.mouse.move(x, y);
      await new Promise(r => setTimeout(r, 40));
    }
  })();
  const cursorResult = await measurePhase(page, 'Cursor', 2200);
  await moveCursorPromise;
  console.log('  Cursor Interaction:', cursorResult);

  // Test 3 — Animation (Kinematics & Breathing Active)
  console.log('Test 3: Measuring Active Animation...');
  const animResult = await measurePhase(page, 'Animation', 2500);
  console.log('  Animation:', animResult);

  // Test 4 — Exploded View
  console.log('Test 4: Measuring Exploded View...');
  await page.evaluate(() => {
    window.__robotScene.toggleExplodedView();
  });
  await new Promise(r => setTimeout(r, 1000));
  const explodedResult = await measurePhase(page, 'Exploded View', 2500);
  console.log('  Exploded View:', explodedResult);
  await page.evaluate(() => {
    window.__robotScene.toggleExplodedView();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Test 5 — Debug Mode (Wireframe)
  console.log('Test 5: Measuring Debug Mode...');
  await page.evaluate(() => {
    window.__robotScene.toggleDebugMode();
  });
  await new Promise(r => setTimeout(r, 600));
  const debugResult = await measurePhase(page, 'Debug Mode', 2500);
  console.log('  Debug Mode:', debugResult);
  await page.evaluate(() => {
    window.__robotScene.toggleDebugMode();
  });
  await new Promise(r => setTimeout(r, 600));

  // Overall Scene Stats
  const sceneStats = await page.evaluate(() => {
    const rs = window.__robotScene;
    const stats = rs.getDebugStats();
    let meshCount = 0;
    rs.getScene().traverse(obj => { if (obj.isMesh) meshCount++; });
    return {
      meshCount,
      uniqueGeometries: stats ? stats.geometryCount : 0,
      triangleCount: stats ? stats.triangleCount : 0,
      materialCount: stats ? stats.materialCount : 0
    };
  });

  const fullReport = {
    timestamp: new Date().toISOString(),
    sceneStats,
    idle: idleResult,
    cursor: cursorResult,
    animation: animResult,
    exploded: explodedResult,
    debug: debugResult
  };

  console.log('\n================ COMPLETE BENCHMARK REPORT ================');
  console.log(JSON.stringify(fullReport, null, 2));

  const fs = require('fs');
  fs.writeFileSync('scripts/baseline_p2_benchmark.json', JSON.stringify(fullReport, null, 2));

  await browser.close();
  return fullReport;
}

runBenchmarkSuite().catch(console.error);
