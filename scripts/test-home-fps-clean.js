import puppeteer from 'puppeteer-core';

async function testHomeFpsClean() {
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

  // Benchmark loop
  const fpsPromise = page.evaluate(() => {
    return new Promise(resolve => {
      const frameDeltas = [];
      let lastTime = performance.now();
      let frames = 0;

      function onFrame(now) {
        const delta = now - lastTime;
        lastTime = now;
        frameDeltas.push(delta);
        frames++;

        if (frames < 180) {
          requestAnimationFrame(onFrame);
        } else {
          const avg = frameDeltas.reduce((a, b) => a + b, 0) / frameDeltas.length;
          const slowFrames = frameDeltas.filter(d => d > 20).length;
          const max = Math.max(...frameDeltas);
          resolve({
            avgFps: (1000 / avg).toFixed(1),
            avgFrameTimeMs: avg.toFixed(2),
            slowFrames,
            maxFrameTimeMs: max.toFixed(2)
          });
        }
      }

      requestAnimationFrame(onFrame);
    });
  });

  // Move mouse naturally via Puppeteer CDP protocol
  for (let i = 0; i < 180; i++) {
    const angle = i * 0.1;
    const x = 768 + Math.cos(angle) * 350;
    const y = 430 + Math.sin(angle) * 200;
    await page.mouse.move(x, y);
    await new Promise(r => setTimeout(r, 16));
  }

  const result = await fpsPromise;
  console.log('Clean CDP Mouse Move Home FPS:', result);

  await browser.close();
}

testHomeFpsClean().catch(console.error);
