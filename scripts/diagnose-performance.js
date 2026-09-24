import puppeteer from 'puppeteer-core';

async function diagnose() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });

  // Connect CDP session for Performance metrics
  const client = await page.target().createCDPSession();
  await client.send('Performance.enable');

  console.log('--- DIAGNOSING /about ---');
  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0' });

  // Measure initial metrics
  let metrics = await client.send('Performance.getMetrics');
  console.log('About Metrics:');
  const metricsMap = {};
  metrics.metrics.forEach(m => metricsMap[m.name] = m.value);
  console.log({
    JSHeapUsedSize: (metricsMap.JSHeapUsedSize / 1024 / 1024).toFixed(2) + ' MB',
    LayoutCount: metricsMap.LayoutCount,
    RecalcStyleCount: metricsMap.RecalcStyleCount,
    LayoutDuration: (metricsMap.LayoutDuration * 1000).toFixed(1) + ' ms',
    RecalcStyleDuration: (metricsMap.RecalcStyleDuration * 1000).toFixed(1) + ' ms',
    ScriptDuration: (metricsMap.ScriptDuration * 1000).toFixed(1) + ' ms',
    TaskDuration: (metricsMap.TaskDuration * 1000).toFixed(1) + ' ms',
  });

  // Measure hover latency and frame drops during mousemove
  const hoverTest = await page.evaluate(async () => {
    const cards = Array.from(document.querySelectorAll('.scroll-reveal-card, .wope-surface-card, button, a'));
    const start = performance.now();
    let longTasksCount = 0;

    // Observe long tasks if supported
    let maxTaskTime = 0;
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          longTasksCount++;
          if (entry.duration > maxTaskTime) maxTaskTime = entry.duration;
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {}

    // Simulate hovers across 20 elements
    const hoverTimes = [];
    for (let i = 0; i < Math.min(cards.length, 25); i++) {
      const el = cards[i];
      const t0 = performance.now();
      el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      // Force style recalc
      window.getComputedStyle(el).transform;
      const t1 = performance.now();
      hoverTimes.push(t1 - t0);
      el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    }

    // Measure animated layers
    const allElements = document.querySelectorAll('*');
    let willChangeCount = 0;
    let animCount = 0;
    allElements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.willChange && style.willChange !== 'auto') willChangeCount++;
      if (style.animationName && style.animationName !== 'none') animCount++;
    });

    return {
      totalElements: allElements.length,
      willChangeCount,
      animCount,
      avgHoverTimeMs: (hoverTimes.reduce((a,b)=>a+b,0)/hoverTimes.length).toFixed(3),
      maxHoverTimeMs: Math.max(...hoverTimes).toFixed(3),
      totalDuration: (performance.now() - start).toFixed(1)
    };
  });

  console.log('Hover Test Results:', hoverTest);

  console.log('\n--- DIAGNOSING /services ---');
  await page.goto('http://localhost:5173/services', { waitUntil: 'networkidle0' });
  const servicesHoverTest = await page.evaluate(async () => {
    const allElements = document.querySelectorAll('*');
    let willChangeCount = 0;
    let animCount = 0;
    allElements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.willChange && style.willChange !== 'auto') willChangeCount++;
      if (style.animationName && style.animationName !== 'none') animCount++;
    });
    return {
      totalElements: allElements.length,
      willChangeCount,
      animCount
    };
  });
  console.log('Services Test Results:', servicesHoverTest);

  await browser.close();
}

diagnose().catch(console.error);
