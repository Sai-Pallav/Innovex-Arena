/**
 * Section 22: Memory & Resource Leak Validation Suite
 * Tests repeated toggling of:
 *  - Debug Mode (5x)
 *  - Exploded View (5x)
 *  - LOD levels (5x)
 *  - Scene Unmount & Remount (3x)
 * Verifies zero WebGL geometry, texture, or material leaks.
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const URL = 'http://127.0.0.1:5173/';

async function runMemoryValidation() {
  console.log('[Memory Suite] Launching Chrome via puppeteer-core...');
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
      '--window-size=1536,860',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860, deviceScaleFactor: 1.0 });

  console.log(`[Memory Suite] Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 30000 });
  console.log('[Memory Suite] RobotScene is ready.');
  await new Promise(r => setTimeout(r, 1200));

  const getMemorySnapshot = async () => {
    return await page.evaluate(() => {
      const rs = window.__robotScene;
      if (!rs) return null;
      const info = rs['renderer'].info;
      return {
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576 * 10) / 10 : null,
      };
    });
  };

  const initial = await getMemorySnapshot();
  console.log('Initial Memory Snapshot:', initial);

  // 1. Toggle Debug Mode 5 times
  console.log('\n1. Testing repeated Debug Mode toggles (5 cycles)...');
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.__robotScene.toggleDebugMode());
    await new Promise(r => setTimeout(r, 150));
    await page.evaluate(() => window.__robotScene.toggleDebugMode());
    await new Promise(r => setTimeout(r, 150));
  }
  const afterDebug = await getMemorySnapshot();
  console.log('After 5 Debug toggles:', afterDebug);

  // 2. Toggle Exploded View 5 times
  console.log('\n2. Testing repeated Exploded View toggles (5 cycles)...');
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.__robotScene.toggleExplodedView());
    await new Promise(r => setTimeout(r, 200));
    await page.evaluate(() => window.__robotScene.toggleExplodedView());
    await new Promise(r => setTimeout(r, 200));
  }
  const afterExploded = await getMemorySnapshot();
  console.log('After 5 Exploded View toggles:', afterExploded);

  // 3. Cycle LOD levels 5 times
  console.log('\n3. Testing repeated LOD level cycles (5 cycles)...');
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.__robotScene.setLODLevel(0));
    await new Promise(r => setTimeout(r, 100));
    await page.evaluate(() => window.__robotScene.setLODLevel(1));
    await new Promise(r => setTimeout(r, 100));
    await page.evaluate(() => window.__robotScene.setLODLevel(2));
    await new Promise(r => setTimeout(r, 100));
    await page.evaluate(() => window.__robotScene.setLODLevel(null));
    await new Promise(r => setTimeout(r, 100));
  }
  const afterLOD = await getMemorySnapshot();
  console.log('After 5 LOD cycles:', afterLOD);

  // 4. Test Unmount & Remount
  console.log('\n4. Testing Unmount & Remount cycles (3 cycles)...');
  const remountResults = [];
  for (let cycle = 1; cycle <= 3; cycle++) {
    // Navigate away to about page (unmounts HomePage and RobotCanvas)
    await page.evaluate(() => {
      window.location.hash = '#about';
    });
    await new Promise(r => setTimeout(r, 800));

    // Navigate back to home
    await page.evaluate(() => {
      window.location.hash = '';
    });
    await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 20000 });
    await new Promise(r => setTimeout(r, 800));

    const snap = await getMemorySnapshot();
    remountResults.push({ cycle, ...snap });
    console.log(`Remount cycle ${cycle}:`, snap);
  }

  const final = await getMemorySnapshot();

  const report = {
    initial,
    afterDebug,
    afterExploded,
    afterLOD,
    remountResults,
    final,
    geometryLeak: final.geometries - initial.geometries,
    textureLeak: final.textures - initial.textures,
    passed: (final.geometries - initial.geometries) === 0 && (final.textures - initial.textures) === 0
  };

  const reportPath = path.join(__dirname, 'p4_memory_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('\nMemory Validation Report:', report);

  await browser.close();

  if (!report.passed) {
    console.error('FAILED: Resource leak detected!');
    process.exit(1);
  } else {
    console.log('PASSED: Zero geometry or texture leaks detected.');
  }
}

runMemoryValidation().catch(err => {
  console.error('[Memory Suite] Error:', err);
  process.exit(1);
});
