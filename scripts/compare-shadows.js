import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function compareShadows() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // Screenshot 1: With shadow map
  await page.screenshot({ path: 'scripts/robot-with-shadow.png' });

  // Screenshot 2: Without shadow map
  await page.evaluate(() => {
    const scene = window.__robotScene;
    if (scene) {
      const renderer = scene.getRenderer();
      const threeScene = scene.getScene();
      const camera = scene.getCamera();
      renderer.shadowMap.enabled = false;
      threeScene.traverse(obj => {
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.needsUpdate = true);
          else obj.material.needsUpdate = true;
        }
      });
      renderer.render(threeScene, camera);
    }
  });

  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'scripts/robot-without-shadow.png' });

  await browser.close();
  console.log('Screenshots saved to scripts/robot-with-shadow.png and scripts/robot-without-shadow.png');
}

compareShadows().catch(console.error);
