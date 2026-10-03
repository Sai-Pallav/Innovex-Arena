const puppeteer = require('puppeteer-core');

async function measureSubtimings() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 20000 });
  console.log('Home loaded, ready for instrumented transition.');

  // Instrument window to capture high-res subtimings without modifying app source code
  await page.evaluate(() => {
    window.__subtimings = {};

    // Monkey-patch RobotScene prototype methods to record timestamps
    const origInit = window.__robotScene.constructor.prototype['initModelAsync'];
    window.__robotScene.constructor.prototype['initModelAsync'] = async function(options) {
      window.__subtimings.initModelAsyncStart = performance.now();
      const res = await origInit.call(this, options);
      window.__subtimings.initModelAsyncEnd = performance.now();
      return res;
    };

    const origCompile = window.__robotScene.getRenderer().compile.bind(window.__robotScene.getRenderer());
    // Also track WebGLRenderer creation if possible
    window.__subtimings.rendererCompileTime = 0;
  });

  // Navigate to About
  await page.evaluate(() => {
    document.querySelector('a[href="/about"]').click();
  });
  await page.waitForFunction(() => !window.__robotScene, { timeout: 5000 });

  // Now navigate to Home and measure detailed subtimings
  const breakdown = await page.evaluate(async () => {
    const marks = {};
    marks.clickHome = performance.now();

    // Hook WebGLRenderer constructor
    const THREE = await import('/node_modules/.vite/deps/three.js?v=d1').catch(() => window.THREE);

    document.querySelector('a[href="/"]').click();

    while (!window.__robotScene) {
      await new Promise(r => setTimeout(r, 1));
    }
    marks.sceneConstructed = performance.now();

    while (!window.__robotScene.isReady) {
      await new Promise(r => setTimeout(r, 1));
    }
    marks.sceneReady = performance.now();

    await new Promise(r => requestAnimationFrame(r));
    marks.firstFramePainted = performance.now();

    const { RobotResourceManager } = await import('/src/robot/robot/RobotResourceManager.ts');
    const mgr = RobotResourceManager.getInstance();

    const tAcqStart = performance.now();
    await mgr.acquireRobotInstanceAsync();
    const tAcqEnd = performance.now();
    marks.isolatedAcquire = tAcqEnd - tAcqStart;

    return {
      totalRemountDuration: (marks.sceneReady - marks.clickHome).toFixed(2),
      routeToSceneConstructor: (marks.sceneConstructed - marks.clickHome).toFixed(2),
      sceneConstructorToReady: (marks.sceneReady - marks.sceneConstructed).toFixed(2),
      readyToFirstFramePainted: (marks.firstFramePainted - marks.sceneReady).toFixed(2),
      isolatedInstanceAcquire: marks.isolatedAcquire.toFixed(2),
      fullRouteToPainted: (marks.firstFramePainted - marks.clickHome).toFixed(2)
    };
  });

  console.log('Forensic Subtiming Breakdown:', breakdown);

  await browser.close();
}

measureSubtimings().catch(console.error);
