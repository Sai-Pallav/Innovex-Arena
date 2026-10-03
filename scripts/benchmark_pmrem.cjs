/**
 * Phase C: PMREM Environment Resolution Benchmark & Visual Regression
 * Tests 512x512, 256x256 (default), and 128x128.
 * Measures:
 *  - FPS
 *  - Frame Time (avg, p50, p95, p99, min, max)
 *  - Render-Submit Time (avg, p50, p95, p99, max)
 *  - High-res close-ups of visor, chest armor, and full hero
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const URL = 'http://127.0.0.1:5173/';
const SAMPLES = 150;
const RESOLUTIONS = [256, 128, 512];

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

async function runPMREMBenchmark() {
  console.log('[PMREM Benchmark] Launching Chrome via puppeteer-core...');
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

  console.log(`[PMREM Benchmark] Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 30000 });
  console.log('[PMREM Benchmark] RobotScene is ready.');

  // Stabilize initial render
  await new Promise(r => setTimeout(r, 1200));

  const outputDir = path.join(__dirname, 'pmrem_artifacts');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Instrument page
  await page.evaluate(() => {
    const rs = window.__robotScene;
    if (rs && !window.__benchHookInstalled) {
      window.__benchHookInstalled = true;
      const origRender = rs['renderer'].render.bind(rs['renderer']);
      window.__submitTimes = [];
      rs['renderer'].render = function(s, c) {
        const t0 = performance.now();
        origRender(s, c);
        const t1 = performance.now();
        window.__lastRenderSubmitTime = t1 - t0;
      };
    }
  });

  const results = {};

  for (const res of RESOLUTIONS) {
    console.log(`\n--- Testing PMREM Resolution: ${res}x${res} ---`);

    // Change environment resolution
    await page.evaluate((size) => {
      window.__robotScene.setEnvironmentResolution(size);
    }, res);

    // Warmup
    await new Promise(r => setTimeout(r, 1000));

    // Sample performance
    const perfData = await page.evaluate(async (sampleCount) => {
      const frameTimes = [];
      const submitTimes = [];
      let last = performance.now();

      return new Promise((resolve) => {
        function sample(now) {
          const dt = now - last;
          last = now;
          if (dt > 0 && dt < 200) frameTimes.push(dt);

          if (window.__lastRenderSubmitTime !== undefined) {
            submitTimes.push(window.__lastRenderSubmitTime);
          }

          if (frameTimes.length >= sampleCount) {
            frameTimes.sort((a, b) => a - b);
            submitTimes.sort((a, b) => a - b);

            const sumF = frameTimes.reduce((acc, v) => acc + v, 0);
            const sumS = submitTimes.reduce((acc, v) => acc + v, 0);

            resolve({
              fps: +(1000 / (sumF / frameTimes.length)).toFixed(1),
              avgFrameTimeMs: +(sumF / frameTimes.length).toFixed(2),
              minFrameTimeMs: +frameTimes[0].toFixed(1),
              maxFrameTimeMs: +frameTimes[frameTimes.length - 1].toFixed(1),
              p50FrameTimeMs: +frameTimes[Math.floor(frameTimes.length * 0.5)].toFixed(1),
              p95FrameTimeMs: +frameTimes[Math.floor(frameTimes.length * 0.95)].toFixed(1),
              p99FrameTimeMs: +frameTimes[Math.floor(frameTimes.length * 0.99)].toFixed(1),
              renderSubmitTimeMs: {
                avg: +(sumS / submitTimes.length).toFixed(2),
                p50: +submitTimes[Math.floor(submitTimes.length * 0.5)].toFixed(1),
                p95: +submitTimes[Math.floor(submitTimes.length * 0.95)].toFixed(1),
                p99: +submitTimes[Math.floor(submitTimes.length * 0.99)].toFixed(1),
                max: +submitTimes[submitTimes.length - 1].toFixed(1)
              },
              sampleCount: frameTimes.length
            });
          } else {
            requestAnimationFrame(sample);
          }
        }
        requestAnimationFrame(sample);
      });
    }, SAMPLES);

    console.log(`Results for ${res}x${res}:`, perfData);
    results[`res_${res}`] = perfData;

    const setCam = async (pos, target) => {
      await page.evaluate(({ p, t }) => {
        const cam = window.__robotScene.getCamera();
        cam.position.set(p.x, p.y, p.z);
        cam.lookAt(t.x, t.y, t.z);
      }, { p: pos, t: target });
      await new Promise((r) => setTimeout(r, 400));
    };

    // Capture Visor close-up
    await setCam({ x: 0, y: 0.45, z: 1.1 }, { x: 0, y: 0.42, z: 0 });
    await page.screenshot({ path: path.join(outputDir, `pmrem_${res}_visor.png`) });

    // Capture Chest/Armor close-up
    await setCam({ x: 0, y: 0.05, z: 1.4 }, { x: 0, y: 0.0, z: 0 });
    await page.screenshot({ path: path.join(outputDir, `pmrem_${res}_torso.png`) });

    // Reset camera to default hero
    await setCam({ x: 0, y: 0.0, z: 2.8 }, { x: 0, y: 0.0, z: 0 });
    await page.screenshot({ path: path.join(outputDir, `pmrem_${res}_hero.png`) });
  }

  // Restore 256 default
  await page.evaluate(() => {
    window.__robotScene.setEnvironmentResolution(256);
  });

  const reportPath = path.join(__dirname, 'p4_pmrem_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nPMREM report written to ${reportPath}`);

  await browser.close();
}

runPMREMBenchmark().catch(err => {
  console.error('[PMREM Benchmark] Error:', err);
  process.exit(1);
});
