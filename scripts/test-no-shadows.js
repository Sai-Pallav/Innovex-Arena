import puppeteer from 'puppeteer-core';

async function testNoShadows() {
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

  const result = await page.evaluate(async () => {
    const scene = window.__robotScene;
    const renderer = scene.getRenderer();
    const threeScene = scene.getScene();
    const camera = scene.getCamera();

    // Turn off shadowMap
    renderer.shadowMap.enabled = false;
    // Force materials update
    threeScene.traverse(obj => {
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.needsUpdate = true);
        } else {
          obj.material.needsUpdate = true;
        }
      }
    });

    // Warmup 5 frames
    for (let i = 0; i < 5; i++) {
      renderer.render(threeScene, camera);
      await new Promise(r => requestAnimationFrame(r));
    }

    const renderTimes = [];
    for (let i = 0; i < 60; i++) {
      const t0 = performance.now();
      renderer.render(threeScene, camera);
      const t1 = performance.now();
      renderTimes.push(t1 - t0);
      await new Promise(r => requestAnimationFrame(r));
    }

    const avg = arr => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(3);
    const max = arr => Math.max(...arr).toFixed(3);

    return {
      calls: renderer.info.render.calls,
      avgRenderMs: avg(renderTimes),
      maxRenderMs: max(renderTimes)
    };
  });

  console.log('Without Shadow Map:', result);
  await browser.close();
}

testNoShadows().catch(console.error);
