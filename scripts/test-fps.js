import puppeteer from 'puppeteer-core';

async function testClickAndHover() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false, // visible window or new headless
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });

  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0' });

  // Evaluate FPS and frame timing over 3 seconds of continuous mouse movement and scrolling
  const fpsResult = await page.evaluate(async () => {
    return new Promise(resolve => {
      const frameTimes = [];
      let lastTime = performance.now();
      let animId;

      function onFrame(now) {
        const delta = now - lastTime;
        lastTime = now;
        frameTimes.push(delta);
        if (frameTimes.length < 180) {
          animId = requestAnimationFrame(onFrame);
        } else {
          // Calculate stats
          const avgDelta = frameTimes.reduce((a,b)=>a+b,0)/frameTimes.length;
          const slowFrames = frameTimes.filter(d => d > 20).length; // frames > 20ms (< 50fps)
          const verySlowFrames = frameTimes.filter(d => d > 33.3).length; // frames > 33ms (< 30fps)
          const maxDelta = Math.max(...frameTimes);
          resolve({
            avgFps: (1000 / avgDelta).toFixed(1),
            avgFrameTimeMs: avgDelta.toFixed(2),
            slowFrames,
            verySlowFrames,
            maxFrameTimeMs: maxDelta.toFixed(2),
            totalFrames: frameTimes.length
          });
        }
      }

      animId = requestAnimationFrame(onFrame);

      // Simulate mouse moves and scrolling while measuring FPS
      let scrollPos = 0;
      const interval = setInterval(() => {
        scrollPos = (scrollPos + 100) % 5000;
        window.scrollTo({ top: scrollPos, behavior: 'instant' });
      }, 50);

      setTimeout(() => clearInterval(interval), 3000);
    });
  });

  console.log('Scroll & Motion FPS Baseline on /about:', fpsResult);

  // Now measure on /services
  await page.goto('http://localhost:5173/services', { waitUntil: 'networkidle0' });
  const servicesFps = await page.evaluate(async () => {
    return new Promise(resolve => {
      const frameTimes = [];
      let lastTime = performance.now();

      function onFrame(now) {
        const delta = now - lastTime;
        lastTime = now;
        frameTimes.push(delta);
        if (frameTimes.length < 180) {
          requestAnimationFrame(onFrame);
        } else {
          const avgDelta = frameTimes.reduce((a,b)=>a+b,0)/frameTimes.length;
          const slowFrames = frameTimes.filter(d => d > 20).length;
          const verySlowFrames = frameTimes.filter(d => d > 33.3).length;
          resolve({
            avgFps: (1000 / avgDelta).toFixed(1),
            avgFrameTimeMs: avgDelta.toFixed(2),
            slowFrames,
            verySlowFrames,
            maxFrameTimeMs: Math.max(...frameTimes).toFixed(2)
          });
        }
      }
      requestAnimationFrame(onFrame);

      let scrollPos = 0;
      const interval = setInterval(() => {
        scrollPos = (scrollPos + 100) % 5000;
        window.scrollTo({ top: scrollPos, behavior: 'instant' });
      }, 50);
      setTimeout(() => clearInterval(interval), 3000);
    });
  });

  console.log('Scroll & Motion FPS Baseline on /services:', servicesFps);

  await browser.close();
}

testClickAndHover().catch(console.error);
