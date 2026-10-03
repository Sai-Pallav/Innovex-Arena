const puppeteer = require('puppeteer-core');

async function testSceneInitBreakdown() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 20000 });

  const breakdown = await page.evaluate(async () => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const { RoomEnvironment } = await import('/node_modules/.vite/deps/three_examples_jsm_environments_RoomEnvironment__js.js');
    const { createStudioLighting } = await import('/src/robot/scene/lighting.ts');
    const { RobotController } = await import('/src/robot/robot/RobotController.ts');
    const { DebugManager } = await import('/src/robot/arm/DebugManager.ts');
    const { RobotResourceManager } = await import('/src/robot/robot/RobotResourceManager.ts');

    const times = {};
    let t = performance.now();

    // 1. Renderer creation
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(720, 680);
    times.rendererInit = (performance.now() - t).toFixed(2);
    t = performance.now();

    // 2. PMREM Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();
    times.pmrem = (performance.now() - t).toFixed(2);
    t = performance.now();

    // 3. Scene & Lights
    const scene = new THREE.Scene();
    scene.environment = envTexture;
    const lights = createStudioLighting();
    scene.add(lights.group);
    times.lights = (performance.now() - t).toFixed(2);
    t = performance.now();

    // 4. Acquire robot instance
    const nodes = await RobotResourceManager.getInstance().acquireRobotInstanceAsync();
    scene.add(nodes.root);
    times.acquireInstance = (performance.now() - t).toFixed(2);
    t = performance.now();

    // 5. Controller
    const controller = new RobotController(nodes);
    times.controller = (performance.now() - t).toFixed(2);
    t = performance.now();

    // 6. DebugManager
    const debug = new DebugManager(nodes.root);
    times.debugManager = (performance.now() - t).toFixed(2);
    t = performance.now();

    // 7. Camera
    const camera = new THREE.PerspectiveCamera(45, 720 / 680, 0.1, 100);
    camera.position.set(0, 0, 3);
    times.camera = (performance.now() - t).toFixed(2);
    t = performance.now();

    // 8. Shader compilation
    renderer.compile(scene, camera);
    times.shaderCompile = (performance.now() - t).toFixed(2);
    t = performance.now();

    // 9. First render
    renderer.render(scene, camera);
    times.firstRender = (performance.now() - t).toFixed(2);

    renderer.dispose();
    envTexture.dispose();

    return times;
  });

  console.log('Scene Init Step Breakdown:', breakdown);
  await browser.close();
}

testSceneInitBreakdown().catch(console.error);
