const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// Parse CLI args: node benchmark_p4.cjs [label] [--dpr <val>]
const args = process.argv.slice(2);
let label = 'baseline';
let dpr = 1.5;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dpr' && args[i + 1]) {
    dpr = parseFloat(args[i + 1]);
    i++;
  } else if (!args[i].startsWith('--')) {
    label = args[i];
  }
}

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
    if (!rs || rs.__p4Instrumented) return;

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

    rs.__p4Instrumented = true;
  });
}

async function measurePhase(page, phaseName, durationMs = 2500) {
  // Clear metric buffer and enable collection
  await page.evaluate(() => {
    window.__renderSubmitTimes = [];
    window.__isCollectingMetrics = true;
  });

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
          const scene = rs.getScene();

          // Count active lights
          let activeLightCount = 0;
          scene.traverse((obj) => {
            if (obj.isLight && obj.visible) activeLightCount++;
          });

          // Count unique runtime materials
          const materials = new Set();
          scene.traverse((obj) => {
            if (obj.isMesh && obj.visible && obj.material) {
              if (Array.isArray(obj.material)) {
                obj.material.forEach((m) => materials.add(m.uuid));
              } else {
                materials.add(obj.material.uuid);
              }
            }
          });

          // Count active meshes & instanced meshes
          let meshCount = 0;
          let instancedMeshCount = 0;
          let totalInstances = 0;
          scene.traverse((obj) => {
            if (obj.isMesh) {
              meshCount++;
              if (obj.isInstancedMesh) {
                instancedMeshCount++;
                totalInstances += obj.count || 0;
              }
            }
          });

          const gl = renderer.getContext();
          const timerQueryExt = gl.getExtension('EXT_disjoint_timer_query_webgl2');

          resolve({
            frameDeltas,
            renderSubmitTimes: window.__renderSubmitTimes || [],
            drawCalls: renderer.info.render.calls,
            triangles: renderer.info.render.triangles,
            geometries: renderer.info.memory.geometries,
            activeLightCount,
            materialCount: materials.size,
            meshCount,
            instancedMeshCount,
            totalInstances,
            hasTimerQuery: !!timerQueryExt,
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
  const maxSubmit = metrics.renderSubmitTimes.length ? Math.max(...metrics.renderSubmitTimes) : 0;

  return {
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
      max: Math.round(maxSubmit * 100) / 100,
    },
    gpuTimerQueryAvailable: metrics.hasTimerQuery,
    drawCalls: metrics.drawCalls,
    renderedTriangles: metrics.triangles,
    geometries: metrics.geometries,
    materialCount: metrics.materialCount,
    activeLightCount: metrics.activeLightCount,
    meshCount: metrics.meshCount,
    instancedMeshCount: metrics.instancedMeshCount,
    totalInstances: metrics.totalInstances,
    heapMB: metrics.heapMB,
    sampleCount: metrics.frameDeltas.length,
  };
}

async function runBenchmark() {
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
  await page.setViewport({ width: 1536, height: 860, deviceScaleFactor: dpr });
  await page.bringToFront();

  console.log(`[P4 Benchmark] Connecting to http://127.0.0.1:5173/ (label: ${label}, dpr: ${dpr})...`);
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 25000 });
  await new Promise((r) => setTimeout(r, 1200));

  await setupPageInstrument(page);

  console.log('\n--- EXECUTING P4 BENCHMARK SUITE ---');

  // 1. Idle Mode
  console.log('1. Measuring Mode: Idle...');
  await new Promise((r) => setTimeout(r, 600));
  const idle = await measurePhase(page, 'Idle', 2500);
  console.log('   Idle:', idle);

  // 2. Cursor Interaction Mode
  console.log('2. Measuring Mode: Cursor Interaction...');
  await new Promise((r) => setTimeout(r, 600));
  const moveCursorPromise = (async () => {
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 4;
      const x = 768 + Math.cos(angle) * 300;
      const y = 430 + Math.sin(angle) * 200;
      await page.mouse.move(x, y);
      await new Promise((r) => setTimeout(r, 40));
    }
  })();
  const cursor = await measurePhase(page, 'Cursor', 2200);
  await moveCursorPromise;
  console.log('   Cursor:', cursor);

  // 3. Animation Mode
  console.log('3. Measuring Mode: Animation (Kinematics & Idle)...');
  await new Promise((r) => setTimeout(r, 600));
  const animation = await measurePhase(page, 'Animation', 2500);
  console.log('   Animation:', animation);

  // 4. Exploded View Mode
  console.log('4. Measuring Mode: Exploded View...');
  await page.evaluate(() => window.__robotScene.toggleExplodedView());
  await new Promise((r) => setTimeout(r, 1000));
  const exploded = await measurePhase(page, 'Exploded View', 2500);
  console.log('   Exploded View:', exploded);
  await page.evaluate(() => window.__robotScene.toggleExplodedView());
  await new Promise((r) => setTimeout(r, 1000));

  // 5. Debug Mode
  console.log('5. Measuring Mode: Debug Mode...');
  await page.evaluate(() => window.__robotScene.toggleDebugMode());
  await new Promise((r) => setTimeout(r, 600));
  const debug = await measurePhase(page, 'Debug Mode', 2500);
  console.log('   Debug Mode:', debug);
  await page.evaluate(() => window.__robotScene.toggleDebugMode());
  await new Promise((r) => setTimeout(r, 600));

  // Capture verification screenshots after measurements complete
  console.log('Capturing verification screenshots...');
  await page.screenshot({ path: path.join(screenshotsDir, `1_idle_${label}.png`) });

  await page.evaluate(() => window.__robotScene.toggleExplodedView());
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(screenshotsDir, `4_exploded_${label}.png`) });
  await page.evaluate(() => window.__robotScene.toggleExplodedView());
  await new Promise((r) => setTimeout(r, 500));

  await page.evaluate(() => window.__robotScene.toggleDebugMode());
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(screenshotsDir, `5_debug_${label}.png`) });
  await page.evaluate(() => window.__robotScene.toggleDebugMode());
  await new Promise((r) => setTimeout(r, 500));

  // Multi-angle detailed screenshots for visual regression checklist
  console.log('Capturing multi-angle closeups for visual verification...');
  const setCam = async (pos, target) => {
    await page.evaluate(({ p, t }) => {
      const cam = window.__robotScene.getCamera();
      cam.position.set(p.x, p.y, p.z);
      cam.lookAt(t.x, t.y, t.z);
    }, { p: pos, t: target });
    await new Promise((r) => setTimeout(r, 300));
  };

  // Full body / Front
  await setCam({ x: 0, y: 0.0, z: 2.8 }, { x: 0, y: 0.0, z: 0 });
  await page.screenshot({ path: path.join(screenshotsDir, `view_front_${label}.png`) });

  // 3/4 view
  await setCam({ x: 1.8, y: 0.2, z: 2.2 }, { x: 0, y: 0.0, z: 0 });
  await page.screenshot({ path: path.join(screenshotsDir, `view_three_quarter_${label}.png`) });

  // Side view
  await setCam({ x: 2.6, y: 0.0, z: 0.0 }, { x: 0, y: 0.0, z: 0 });
  await page.screenshot({ path: path.join(screenshotsDir, `view_side_${label}.png`) });

  // Close-up Head
  await setCam({ x: 0, y: 0.45, z: 1.1 }, { x: 0, y: 0.42, z: 0 });
  await page.screenshot({ path: path.join(screenshotsDir, `detail_head_${label}.png`) });

  // Close-up Torso
  await setCam({ x: 0, y: 0.05, z: 1.4 }, { x: 0, y: 0.0, z: 0 });
  await page.screenshot({ path: path.join(screenshotsDir, `detail_torso_${label}.png`) });

  // Close-up Arms
  await setCam({ x: 0.65, y: 0.15, z: 1.2 }, { x: 0.5, y: 0.1, z: 0 });
  await page.screenshot({ path: path.join(screenshotsDir, `detail_arms_${label}.png`) });

  // Close-up Hands
  await setCam({ x: 0.7, y: -0.2, z: 0.9 }, { x: 0.55, y: -0.25, z: 0 });
  await page.screenshot({ path: path.join(screenshotsDir, `detail_hands_${label}.png`) });

  // Close-up Legs
  await setCam({ x: 0, y: -0.6, z: 1.7 }, { x: 0, y: -0.65, z: 0 });
  await page.screenshot({ path: path.join(screenshotsDir, `detail_legs_${label}.png`) });

  // Reset Camera to default
  await setCam({ x: 0, y: 0.0, z: 2.8 }, { x: 0, y: 0.0, z: 0 });

  const report = {
    timestamp: new Date().toISOString(),
    label,
    dpr,
    modes: {
      idle,
      cursor,
      animation,
      exploded,
      debug,
    },
  };

  const outputPath = path.join(__dirname, `p4_benchmark_${label}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`\nReport successfully saved to ${outputPath}`);

  await browser.close();
  return report;
}

runBenchmark().catch((err) => {
  console.error('[P4 Benchmark Error]', err);
  process.exit(1);
});
