import puppeteer from 'puppeteer-core';

async function auditPerformance() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });

  const client = await page.target().createCDPSession();
  await client.send('Performance.enable');

  const pagesToTest = ['/about', '/services', '/', '/products'];

  for (const route of pagesToTest) {
    console.log(`\n========================================`);
    console.log(`TESTING ROUTE: http://localhost:5173${route}`);
    console.log(`========================================`);

    await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle0' });

    // 1. Measure long tasks and click/hover response
    const perfData = await page.evaluate(async () => {
      const results = {
        totalElements: document.querySelectorAll('*').length,
        backdropFilterCount: 0,
        boxShadowCount: 0,
        animationsRunning: 0,
        clickDelays: [],
        hoverDelays: [],
        longTasks: []
      };

      // Count heavy CSS properties
      const allEls = document.querySelectorAll('*');
      allEls.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.backdropFilter && style.backdropFilter !== 'none') results.backdropFilterCount++;
        if (style.boxShadow && style.boxShadow !== 'none') results.boxShadowCount++;
        if (style.animationName && style.animationName !== 'none') results.animationsRunning++;
      });

      // Long task observer
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            results.longTasks.push({ name: entry.name, duration: entry.duration, startTime: entry.startTime });
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {}

      // Measure hover response on clickable elements (buttons, links, cards)
      const interactives = Array.from(document.querySelectorAll('button, a, .group, [role="button"], .cursor-pointer, .cyber-card, .wope-surface-card'));
      for (let i = 0; i < Math.min(interactives.length, 15); i++) {
        const el = interactives[i];
        const t0 = performance.now();
        el.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('pointermove', { bubbles: true }));
        // Force synchronous style/layout calc to see how long browser takes to apply hover state
        const rect = el.getBoundingClientRect();
        const t1 = performance.now();
        results.hoverDelays.push(t1 - t0);
        el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('pointerout', { bubbles: true }));
      }

      // Measure click response on non-link interactive elements
      const clickables = Array.from(document.querySelectorAll('button, .cyber-card, .wope-surface-card'));
      for (let i = 0; i < Math.min(clickables.length, 10); i++) {
        const el = clickables[i];
        const t0 = performance.now();
        el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        // Force synchronous layout
        const rect = el.getBoundingClientRect();
        const t1 = performance.now();
        results.clickDelays.push(t1 - t0);
      }

      return results;
    });

    console.log(`DOM Elements: ${perfData.totalElements}`);
    console.log(`Elements with backdrop-filter: ${perfData.backdropFilterCount}`);
    console.log(`Elements with box-shadow: ${perfData.boxShadowCount}`);
    console.log(`Active CSS Animations: ${perfData.animationsRunning}`);
    if (perfData.hoverDelays.length > 0) {
      const avgHover = (perfData.hoverDelays.reduce((a, b) => a + b, 0) / perfData.hoverDelays.length).toFixed(3);
      const maxHover = Math.max(...perfData.hoverDelays).toFixed(3);
      console.log(`Hover Latency: avg=${avgHover}ms, max=${maxHover}ms`);
    }
    if (perfData.clickDelays.length > 0) {
      const avgClick = (perfData.clickDelays.reduce((a, b) => a + b, 0) / perfData.clickDelays.length).toFixed(3);
      const maxClick = Math.max(...perfData.clickDelays).toFixed(3);
      console.log(`Click Latency: avg=${avgClick}ms, max=${maxClick}ms`);
    }

    // Scroll performance test (measure dropped frames during scroll + hover)
    const scrollPerf = await page.evaluate(async () => {
      return new Promise(resolve => {
        const frameDeltas = [];
        let last = performance.now();
        let count = 0;

        function step(now) {
          frameDeltas.push(now - last);
          last = now;
          count++;
          if (count < 120) {
            requestAnimationFrame(step);
          } else {
            const avg = frameDeltas.reduce((a, b) => a + b, 0) / frameDeltas.length;
            const drops = frameDeltas.filter(d => d > 20).length;
            resolve({
              avgFrameMs: avg.toFixed(2),
              fps: (1000 / avg).toFixed(1),
              droppedFrames: drops,
              maxFrameMs: Math.max(...frameDeltas).toFixed(2)
            });
          }
        }
        requestAnimationFrame(step);

        let s = 0;
        const interval = setInterval(() => {
          s += 80;
          window.scrollTo(0, s % 3000);
        }, 16);
        setTimeout(() => clearInterval(interval), 2000);
      });
    });

    console.log(`Scroll Performance: FPS=${scrollPerf.fps}, AvgFrame=${scrollPerf.avgFrameMs}ms, MaxFrame=${scrollPerf.maxFrameMs}ms, DroppedFrames=${scrollPerf.droppedFrames}/120`);
  }

  await browser.close();
}

auditPerformance().catch(console.error);
