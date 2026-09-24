import puppeteer from 'puppeteer-core';

async function profileHomeBreakdown() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-gpu',
      '--use-gl=angle',
      '--ignore-gpu-blocklist'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  const timings = await page.evaluate(async () => {
    const scene = window.__robotScene;
    if (!scene) return { error: 'No robot scene found' };

    const renderer = scene.getRenderer();
    const threeScene = scene.getScene();
    const camera = scene.getCamera();
    const controller = scene.getController();

    // Benchmark 120 frames
    const controllerTimes = [];
    const renderTimes = [];
    const totalTimes = [];

    // Save original loop
    const shadowStatus = renderer.shadowMap.enabled;
    const pixelRatio = renderer.getPixelRatio();
    const canvasSize = { width: renderer.domElement.width, height: renderer.domElement.height };

    for (let i = 0; i < 60; i++) {
      const start = performance.now();
      
      const t0 = performance.now();
      if (controller) {
        controller.update(0.016);
      }
      const t1 = performance.now();

      renderer.render(threeScene, camera);
      const t2 = performance.now();

      controllerTimes.push(t1 - t0);
      renderTimes.push(t2 - t1);
      totalTimes.push(t2 - start);

      await new Promise(r => requestAnimationFrame(r));
    }

    const avg = arr => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(3);
    const max = arr => Math.max(...arr).toFixed(3);

    return {
      shadowEnabled: shadowStatus,
      pixelRatio,
      canvasSize,
      triangles: renderer.info.render.triangles,
      calls: renderer.info.render.calls,
      avgControllerMs: avg(controllerTimes),
      maxControllerMs: max(controllerTimes),
      avgRenderMs: avg(renderTimes),
      maxRenderMs: max(renderTimes),
      avgTotalMs: avg(totalTimes),
      maxTotalMs: max(totalTimes)
    };
  });

  console.log('Home Breakdown Timings:', timings);
  await browser.close();
}

profileHomeBreakdown().catch(console.error);
