const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, 'p4_screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

function calculatePercentiles(arr) {
  if (!arr.length) return { p50: 0, p95: 0, p99: 0 };
  const sorted = [...arr].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.50)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  return {
    p50: Math.round(p50 * 100) / 100,
    p95: Math.round(p95 * 100) / 100,
    p99: Math.round(p99 * 100) / 100,
  };
}

async function setupPageInstrument(page) {
  await page.evaluate(() => {
    const rs = window.__robotScene;
    if (!rs || rs.__lodInstrumented) return;

    const renderer = rs.getRenderer();
    const origRender = renderer.render.bind(renderer);

    window.__renderSubmitTimes = [];
    window.__isCollectingMetrics = false;

    renderer.render = function (scene, camera) {
      if (window.__isCollectingMetrics) {
        const t0 = performance.now();
        origRender(scene, camera);
        const t1 = performance.now();
        window.__renderSubmitTimes.push(t1 - t0);
      } else {
        origRender(scene, camera);
      }
    };

    rs.__lodInstrumented = true;
  });
}

async function measureLOD(page, level, durationMs = 2500) {
  await page.evaluate((lvl) => {
    window.__robotScene.setLODLevel(lvl);
    window.__renderSubmitTimes = [];
    window.__isCollectingMetrics = true;
  }, level);

  await new Promise((r) => setTimeout(r, 200));

  const metrics = await page.evaluate((dur) => {
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
          window.__isCollectingMetrics = false;
          const rs = window.__robotScene;
          const renderer = rs.getRenderer();
          const stats = rs.getLODStats();

          resolve({
            frameDeltas,
            renderSubmitTimes: window.__renderSubmitTimes || [],
            drawCalls: renderer.info.render.calls,
            triangles: renderer.info.render.triangles,
            geometries: renderer.info.memory.geometries,
            lodStats: stats,
            heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576 * 10) / 10 : null,
          });
        }
      }
      requestAnimationFrame(step);
    });
  }, durationMs);

  const avgDelta = metrics.frameDeltas.reduce((a, b) => a + b, 0) / metrics.frameDeltas.length;
  const minDelta = Math.min(...metrics.frameDeltas);
  const maxDelta = Math.max(...metrics.frameDeltas);
  const framePercentiles = calculatePercentiles(metrics.frameDeltas);

  const avgSubmit = metrics.renderSubmitTimes.length
    ? metrics.renderSubmitTimes.reduce((a, b) => a + b, 0) / metrics.renderSubmitTimes.length
    : 0;
  const submitPercentiles = calculatePercentiles(metrics.renderSubmitTimes);

  return {
    level,
    fps: Math.round((1000 / avgDelta) * 10) / 10,
    avgFrameTimeMs: Math.round(avgDelta * 100) / 100,
    minFrameTimeMs: Math.round(minDelta * 100) / 100,
    maxFrameTimeMs: Math.round(maxDelta * 100) / 100,
    p50FrameTimeMs: framePercentiles.p50,
    p95FrameTimeMs: framePercentiles.p95,
    p99FrameTimeMs: framePercentiles.p99,
    renderSubmitTimeMs: {
      avg: Math.round(avgSubmit * 100) / 100,
      p50: submitPercentiles.p50,
      p95: submitPercentiles.p95,
      p99: submitPercentiles.p99,
    },
    drawCalls: metrics.drawCalls,
    renderedTriangles: metrics.triangles,
    geometries: metrics.geometries,
    lodStats: metrics.lodStats,
    sampleCount: metrics.frameDeltas.length,
  };
}

async function runLODSuite() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--enable-webgl-draft-extensions',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=CalculateNativeWinOcclusion',
      '--disable-ipc-flooding-protection',
      '--window-size=1536,860',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860, deviceScaleFactor: 1.0 });

  console.log('[LOD Benchmark] Connecting to http://127.0.0.1:5173/...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 25000 });
  await new Promise((r) => setTimeout(r, 1200));

  await setupPageInstrument(page);

  console.log('\n--- MEASURING LOD LEVELS (LOD0, LOD1, LOD2) ---');

  // 1. Measure LOD0
  console.log('1. Measuring LOD 0 (Close / 100% detail)...');
  const lod0 = await measureLOD(page, 0, 2500);
  console.log('   LOD 0 Results:', lod0);
  await page.screenshot({ path: path.join(screenshotsDir, 'lod0_hero.png') });

  // 2. Measure LOD1
  console.log('2. Measuring LOD 1 (Medium / finger sensor jewels & hand telemetry culled)...');
  const lod1 = await measureLOD(page, 1, 2500);
  console.log('   LOD 1 Results:', lod1);
  await page.screenshot({ path: path.join(screenshotsDir, 'lod1_hero.png') });

  // 3. Measure LOD2
  console.log('3. Measuring LOD 2 (Far / sub-pixel knee bezels & micro accent slits culled)...');
  const lod2 = await measureLOD(page, 2, 2500);
  console.log('   LOD 2 Results:', lod2);
  await page.screenshot({ path: path.join(screenshotsDir, 'lod2_hero.png') });

  // 4. Test natural distance-based camera transition & hysteresis
  console.log('\n4. Testing Natural Distance Transitions & Hysteresis...');
  await page.evaluate(() => window.__robotScene.setLODLevel(null)); // restore automatic mode

  const hysteresisTest = await page.evaluate(async () => {
    const rs = window.__robotScene;
    const cam = rs.getCamera();
    const transitions = [];

    const testPoints = [
      { z: 2.2, label: 'Hero close-up (2.2m)', expected: 0 },
      { z: 3.2, label: 'Beyond LOD1 threshold (3.2m)', expected: 1 },
      { z: 2.8, label: 'Inside LOD1 exit hysteresis (2.8m)', expected: 1 },
      { z: 2.5, label: 'Below LOD1 exit threshold (2.5m)', expected: 0 },
      { z: 4.5, label: 'Beyond LOD2 threshold (4.5m)', expected: 2 },
      { z: 3.9, label: 'Inside LOD2 exit hysteresis (3.9m)', expected: 2 },
      { z: 3.5, label: 'Below LOD2 exit threshold (3.5m)', expected: 1 },
      { z: 2.4, label: 'Returned to hero (2.4m)', expected: 0 },
    ];

    for (const pt of testPoints) {
      cam.position.z = pt.z;
      // trigger render/update
      rs.getRenderer().render(rs.getScene(), cam);
      const lvl = rs.getLODLevel();
      const stats = rs.getLODStats();
      transitions.push({
        label: pt.label,
        z: pt.z,
        level: lvl,
        expected: pt.expected,
        passed: lvl === pt.expected,
        stats,
      });
      await new Promise((r) => setTimeout(r, 60));
    }

    // Reset camera to default hero distance
    cam.position.z = 2.16;
    rs.getRenderer().render(rs.getScene(), cam);

    return transitions;
  });

  console.log('   Hysteresis Transitions:', hysteresisTest);

  // Restore automatic LOD and hero camera
  await page.evaluate(() => {
    window.__robotScene.setLODLevel(null);
  });

  const report = {
    timestamp: new Date().toISOString(),
    lod0,
    lod1,
    lod2,
    hysteresisTest,
    deltaLOD0toLOD1: {
      drawCallReduction: lod0.drawCalls - lod1.drawCalls,
      triangleReduction: lod0.renderedTriangles - lod1.renderedTriangles,
      renderSubmitDeltaMs: Math.round((lod1.renderSubmitTimeMs.avg - lod0.renderSubmitTimeMs.avg) * 100) / 100,
    },
    deltaLOD0toLOD2: {
      drawCallReduction: lod0.drawCalls - lod2.drawCalls,
      triangleReduction: lod0.renderedTriangles - lod2.renderedTriangles,
      renderSubmitDeltaMs: Math.round((lod2.renderSubmitTimeMs.avg - lod0.renderSubmitTimeMs.avg) * 100) / 100,
    },
  };

  const outPath = path.join(__dirname, 'p4_lod_report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\nLOD report saved to ${outPath}`);

  await browser.close();
  return report;
}

runLODSuite().catch((err) => {
  console.error('[LOD Benchmark Error]', err);
  process.exit(1);
});
