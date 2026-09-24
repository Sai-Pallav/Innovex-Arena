import puppeteer from 'puppeteer-core';

async function testHomeFps() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  // Wait 1s for robot to settle
  await new Promise(r => setTimeout(r, 1000));

  const result = await page.evaluate(async () => {
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
          const avg = frameDeltas.reduce((a,b)=>a+b,0) / frameDeltas.length;
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

      // Simulate realistic human mouse movements across the screen & buttons
      let angle = 0;
      const interval = setInterval(() => {
        angle += 0.1;
        const x = 768 + Math.cos(angle) * 400;
        const y = 430 + Math.sin(angle) * 300;
        const target = document.elementFromPoint(x, y);
        if (target) {
          target.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: x, clientY: y }));
        }
      }, 16);

      setTimeout(() => clearInterval(interval), 3000);
    });
  });

  console.log('Home Page Realistic Interactive FPS:', result);
  await browser.close();
}

testHomeFps().catch(console.error);
