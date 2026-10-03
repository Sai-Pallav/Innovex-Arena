const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function runForensicAudit() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });

  console.log('================================================================');
  console.log('    P2-V — POST-PRIORITY-2 FORENSIC PERFORMANCE RE-AUDIT        ');
  console.log('================================================================');

  // 1. Capture environment details
  const browserVersion = await browser.version();
  console.log(`Environment: Chrome ${browserVersion}, Viewport 1536x860, DPR 1.0 (Headless new)`);

  // Navigate to app
  console.log('\n>>> Navigating to http://localhost:5173/ ...');
  const tNavStart = performance.now();
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__robotScene && window.__robotScene.isReady, { timeout: 30000 });
  const initialLoadReadyMs = performance.now() - tNavStart;
  console.log(`Initial Load -> Robot Ready: ${initialLoadReadyMs.toFixed(2)} ms`);

  // Wait 1.5s for stabilization
  await new Promise(r => setTimeout(r, 1500));

  // ==============================================================
  // STEP 1: HIERARCHY, MESH, GEOMETRY, MATERIAL & LIGHTING AUDIT
  // ==============================================================
  console.log('\n>>> Step 1: Running Static Scene & Hierarchy Forensic Audit...');
  const sceneAudit = await page.evaluate(() => {
    const scene = window.__robotScene.getScene();
    const renderer = window.__robotScene.getRenderer();
    const camera = window.__robotScene.getCamera();
    const root = window.__robotScene.robotNodes.root;

    let totalObjects = 0;
    let meshCount = 0;
    let groupCount = 0;
    let lightCount = 0;
    let cameraCount = 0;
    let matrixAutoUpdateTrue = 0;
    let matrixAutoUpdateFalse = 0;
    let maxDepth = 0;

    const materialsMap = new Map();
    const geometriesMap = new Map();
    let transparentMeshes = 0;
    let doubleSidedMeshes = 0;
    let emissiveMeshes = 0;
    let totalTriangles = 0;

    const materialTypes = {
      MeshPhysicalMaterial: 0,
      MeshStandardMaterial: 0,
      MeshBasicMaterial: 0,
      ShaderMaterial: 0,
      Other: 0
    };

    function traverseDepth(node, depth) {
      totalObjects++;
      if (depth > maxDepth) maxDepth = depth;

      if (node.matrixAutoUpdate) matrixAutoUpdateTrue++;
      else matrixAutoUpdateFalse++;

      if (node.isMesh) {
        meshCount++;
        const geo = node.geometry;
        if (geo) {
          geometriesMap.set(geo.id, (geometriesMap.get(geo.id) || 0) + 1);
          const tris = geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3;
          totalTriangles += tris;
        }

        const mats = Array.isArray(node.material) ? node.material : [node.material];
        for (const m of mats) {
          if (m) {
            materialsMap.set(m.uuid, m);
            if (m.transparent || m.opacity < 1.0) transparentMeshes++;
            if (m.side === 2) doubleSidedMeshes++; // THREE.DoubleSide === 2
            if (m.emissive && (m.emissive.r > 0 || m.emissive.g > 0 || m.emissive.b > 0 || m.emissiveIntensity > 0)) {
              emissiveMeshes++;
            }

            if (m.type === 'MeshPhysicalMaterial') materialTypes.MeshPhysicalMaterial++;
            else if (m.type === 'MeshStandardMaterial') materialTypes.MeshStandardMaterial++;
            else if (m.type === 'MeshBasicMaterial') materialTypes.MeshBasicMaterial++;
            else if (m.type === 'ShaderMaterial') materialTypes.ShaderMaterial++;
            else materialTypes.Other++;
          }
        }
      } else if (node.isGroup) {
        groupCount++;
      } else if (node.isLight) {
        lightCount++;
      } else if (node.isCamera) {
        cameraCount++;
      }

      for (const child of node.children) {
        traverseDepth(child, depth + 1);
      }
    }

    traverseDepth(scene, 1);

    // Audit Lighting
    const lights = [];
    scene.traverse((obj) => {
      if (obj.isLight) {
        lights.push({
          type: obj.type,
          name: obj.name || 'unnamed',
          color: obj.color ? obj.color.getHexString() : null,
          intensity: obj.intensity,
          castShadow: obj.castShadow,
          position: [obj.position.x, obj.position.y, obj.position.z]
        });
      }
    });

    // Subsystem classification breakdown
    function getSubsystem(obj) {
      let curr = obj;
      while (curr && curr !== root) {
        const name = (curr.name || '').toLowerCase();
        if (name.includes('ringfinger') || name.includes('middlefinger') || name.includes('indexfinger') || name.includes('littlefinger') || name.includes('pinkyfinger') || name.includes('thumb') || name.includes('finger') || name.includes('phalanx')) return 'Fingers';
        if (name.includes('hand') || name.includes('palm') || name.includes('wrist') || name.includes('carpal')) return 'Hands';
        if (name.includes('shoulder') || name.includes('deltoid') || name.includes('clavicle') || name.includes('pauldron')) return 'Shoulders';
        if (name.includes('arm') || name.includes('elbow') || name.includes('forearm') || name.includes('bicep') || name.includes('tricep') || name.includes('brachio')) return 'Arms';
        if (name.includes('head') || name.includes('neck') || name.includes('visor') || name.includes('eye') || name.includes('jaw') || name.includes('ear') || name.includes('cranium')) return 'Head';
        if (name.includes('torso') || name.includes('chest') || name.includes('abdomen') || name.includes('stomach') || name.includes('rib') || name.includes('spine') || name.includes('pectoral') || name.includes('sternum')) return 'Torso';
        if (name.includes('waist') || name.includes('pelvis') || name.includes('hip')) return 'Waist';
        if (name.includes('leg') || name.includes('thigh') || name.includes('shin') || name.includes('knee') || name.includes('femur') || name.includes('tibia') || name.includes('calf') || name.includes('patella')) return 'Legs';
        if (name.includes('foot') || name.includes('feet') || name.includes('ankle') || name.includes('toe') || name.includes('heel') || name.includes('sole') || name.includes('tarsal')) return 'Feet';
        curr = curr.parent;
      }
      return 'Other';
    }

    const subsystemCounts = {};
    scene.traverse((obj) => {
      if (obj.isMesh) {
        const sub = getSubsystem(obj);
        subsystemCounts[sub] = (subsystemCounts[sub] || 0) + 1;
      }
    });

    const info = renderer.info;

    return {
      totalObjects,
      meshCount,
      groupCount,
      lightCount,
      cameraCount,
      maxDepth,
      matrixAutoUpdateTrue,
      matrixAutoUpdateFalse,
      uniqueGeometries: geometriesMap.size,
      uniqueMaterials: materialsMap.size,
      totalTriangles,
      transparentMeshes,
      doubleSidedMeshes,
      emissiveMeshes,
      materialTypes,
      subsystemCounts,
      lights,
      shadowMapEnabled: renderer.shadowMap.enabled,
      renderInfo: {
        calls: info.render.calls,
        triangles: info.render.triangles,
        lines: info.render.lines,
        points: info.render.points,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        programs: info.programs ? info.programs.length : 0
      }
    };
  });

  console.log('Scene Audit Results:');
  console.log(`  Total Object3D nodes: ${sceneAudit.totalObjects}`);
  console.log(`  Meshes: ${sceneAudit.meshCount}`);
  console.log(`  Groups: ${sceneAudit.groupCount}`);
  console.log(`  Lights: ${sceneAudit.lightCount}`);
  console.log(`  Max hierarchy depth: ${sceneAudit.maxDepth}`);
  console.log(`  matrixAutoUpdate = true: ${sceneAudit.matrixAutoUpdateTrue}, false: ${sceneAudit.matrixAutoUpdateFalse}`);
  console.log(`  Unique Geometries: ${sceneAudit.uniqueGeometries}`);
  console.log(`  Unique Materials: ${sceneAudit.uniqueMaterials}`);
  console.log(`  Total Triangles: ${sceneAudit.totalTriangles.toLocaleString()}`);
  console.log(`  Draw Calls (info.render.calls): ${sceneAudit.renderInfo.calls}`);
  console.log(`  Subsystem Breakdown:`, sceneAudit.subsystemCounts);
  console.log(`  Material Types:`, sceneAudit.materialTypes);
  console.log(`  Lighting Setup:`, sceneAudit.lights.map(l => `${l.type} (int: ${l.intensity}, castShadow: ${l.castShadow})`));
  console.log(`  Shadow Map Enabled: ${sceneAudit.shadowMapEnabled}`);

  // ==============================================================
  // STEP 2: CLASSIFICATION SHIFT INVESTIGATION
  // ==============================================================
  console.log('\n>>> Step 2: Investigating Priority 2 Classification Changes...');
  const classificationInvestigation = await page.evaluate(() => {
    const root = window.__robotScene.robotNodes.root;
    const meshDetails = [];

    root.traverse((obj) => {
      if (obj.isMesh) {
        // Collect ancestry path
        const ancestry = [];
        let curr = obj;
        while (curr && curr !== root) {
          ancestry.push(curr.name || 'unnamed');
          curr = curr.parent;
        }
        ancestry.reverse();

        meshDetails.push({
          meshName: obj.name || 'unnamed',
          ancestry: ancestry.join(' -> '),
          parentName: obj.parent ? obj.parent.name : null,
          geometryId: obj.geometry.id
        });
      }
    });

    // Check specific shoulder, hand, arm meshes
    const shoulderMeshes = meshDetails.filter(m => m.ancestry.toLowerCase().includes('shoulder'));
    const armMeshes = meshDetails.filter(m => m.ancestry.toLowerCase().includes('arm') || m.ancestry.toLowerCase().includes('elbow') || m.ancestry.toLowerCase().includes('forearm'));
    const handMeshes = meshDetails.filter(m => m.ancestry.toLowerCase().includes('hand') || m.ancestry.toLowerCase().includes('palm') || m.ancestry.toLowerCase().includes('wrist'));
    const fingerMeshes = meshDetails.filter(m => m.ancestry.toLowerCase().includes('finger') || m.ancestry.toLowerCase().includes('thumb'));

    return {
      totalAudited: meshDetails.length,
      shoulderCount: shoulderMeshes.length,
      armCount: armMeshes.length,
      handCount: handMeshes.length,
      fingerCount: fingerMeshes.length,
      sampleShoulder: shoulderMeshes.slice(0, 5),
      sampleHand: handMeshes.slice(0, 5),
      sampleArm: armMeshes.slice(0, 5)
    };
  });
  console.log('Classification Investigation Findings:');
  console.log(`  Audited ${classificationInvestigation.totalAudited} meshes in robot root.`);
  console.log(`  Shoulder meshes in ancestry: ${classificationInvestigation.shoulderCount}`);
  console.log(`  Arm/Forearm meshes in ancestry: ${classificationInvestigation.armCount}`);
  console.log(`  Hand/Wrist meshes in ancestry: ${classificationInvestigation.handCount}`);
  console.log(`  Finger/Thumb meshes in ancestry: ${classificationInvestigation.fingerCount}`);

  // ==============================================================
  // STEP 3: HIGH-RESOLUTION RUNTIME CPU PER-FRAME PROFILING
  // ==============================================================
  console.log('\n>>> Step 3: Running Micro-Profiling of CPU Controllers & Render Submissions...');
  const cpuProfile = await page.evaluate(async () => {
    const rs = window.__robotScene;
    const ctrl = rs.getController();
    const animCtrl = ctrl.getAnimationController();
    const renderer = rs.getRenderer();
    const scene = rs.getScene();
    const camera = rs.getCamera();

    // Instrument controllers
    const samples = [];
    const NUM_FRAMES = 120; // Profile 120 consecutive frames (~2 seconds)

    for (let f = 0; f < NUM_FRAMES; f++) {
      const dt = 0.016;

      // 1. Measure InputController
      const tInStart = performance.now();
      animCtrl.inputController.update(0.2, -0.1, dt, true, false);
      const inputTime = performance.now() - tInStart;

      // 2. Measure LookController
      const tLookStart = performance.now();
      const gaze = animCtrl.lookController.update(animCtrl.inputController.getState(), dt);
      const lookTime = performance.now() - tLookStart;

      // 3. Measure TorsoWaistController
      const tTorsoStart = performance.now();
      const torsoKin = animCtrl.torsoWaistController.update(gaze, f * dt, dt, 0.005, false);
      const torsoTime = performance.now() - tTorsoStart;

      // 4. Measure ShoulderController
      const tShoulderStart = performance.now();
      const shoulderOff = animCtrl.shoulderController.update(0.1, -0.05, dt, 0.005);
      const shoulderTime = performance.now() - tShoulderStart;

      // 5. Measure ArmElbowController
      const tArmElbowStart = performance.now();
      const armState = animCtrl.armElbowController.update(dt, f * dt, 0.005, 0.1, -0.05, false);
      const armElbowTime = performance.now() - tArmElbowStart;

      // 6. Measure HandFingerController
      const tHandFingerStart = performance.now();
      const handState = animCtrl.handFingerController.update(f * dt, 0.005, false);
      const handFingerTime = performance.now() - tHandFingerStart;

      // 7. Measure ArmAnimationController (if active)
      let armAnimTime = 0;
      const armCtrl = animCtrl.getArmController();
      if (armCtrl) {
        const tArmCtrlStart = performance.now();
        armCtrl.update(dt, 0.005, 0.1, -0.05);
        armAnimTime = performance.now() - tArmCtrlStart;
      }

      // 8. Measure LegAnimationController (if active)
      let legAnimTime = 0;
      const legCtrl = animCtrl.getLegController();
      if (legCtrl) {
        const tLegCtrlStart = performance.now();
        legCtrl.update(dt, 0.005);
        legAnimTime = performance.now() - tLegCtrlStart;
      }

      // 9. Measure IdleSuspensionController
      const tIdleStart = performance.now();
      const idleState = animCtrl.idleSuspensionController.update(f * dt, dt, false);
      const idleTime = performance.now() - tIdleStart;

      // 10. Measure EmissiveController
      const tEmissiveStart = performance.now();
      animCtrl.emissiveController.update(
        f * dt,
        dt,
        1.0,
        false,
        rs.robotNodes.materials,
        rs.robotNodes.eyeLeft,
        rs.robotNodes.eyeRight,
        rs.robotNodes.visorLightBar
      );
      const emissiveTime = performance.now() - tEmissiveStart;

      // 11. Measure Total Controller update
      const tCtrlTotalStart = performance.now();
      ctrl.update(dt);
      const totalControllerTime = performance.now() - tCtrlTotalStart;

      // 12. Measure scene.updateMatrixWorld() transform cost
      const tMatrixStart = performance.now();
      scene.updateMatrixWorld(true);
      const matrixUpdateTime = performance.now() - tMatrixStart;

      // 13. Measure renderer.render() submission cost
      const tRenderStart = performance.now();
      renderer.render(scene, camera);
      const renderSubmissionTime = performance.now() - tRenderStart;

      samples.push({
        inputTime,
        lookTime,
        torsoTime,
        shoulderTime,
        armElbowTime,
        handFingerTime,
        armAnimTime,
        legAnimTime,
        idleTime,
        emissiveTime,
        totalControllerTime,
        matrixUpdateTime,
        renderSubmissionTime
      });

      await new Promise(r => requestAnimationFrame(r));
    }

    // Aggregate statistics
    const keys = Object.keys(samples[0]);
    const summary = {};
    for (const k of keys) {
      const vals = samples.map(s => s[k]);
      vals.sort((a, b) => a - b);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const p50 = vals[Math.floor(vals.length * 0.5)];
      const p95 = vals[Math.floor(vals.length * 0.95)];
      const p99 = vals[Math.floor(vals.length * 0.99)];
      const max = vals[vals.length - 1];

      summary[k] = {
        mean: parseFloat(mean.toFixed(3)),
        p50: parseFloat(p50.toFixed(3)),
        p95: parseFloat(p95.toFixed(3)),
        p99: parseFloat(p99.toFixed(3)),
        max: parseFloat(max.toFixed(3))
      };
    }

    return { samplesCount: samples.length, summary };
  });

  console.log('CPU Profile Summary (ms per frame across 120 frames):');
  console.table(cpuProfile.summary);

  // ==============================================================
  // STEP 4: FRAME-TIME PERCENTILE DISTRIBUTIONS (AVOIDING 60 FPS CEILING)
  // ==============================================================
  console.log('\n>>> Step 4: Collecting Frame-Time Percentiles across 5 Scenarios...');

  async function measureDistribution(scenarioName, prepareFn, runDurationMs = 2500) {
    if (prepareFn) await page.evaluate(prepareFn);
    await new Promise(r => setTimeout(r, 400));

    const result = await page.evaluate((dur) => {
      return new Promise((resolve) => {
        const frameTimes = [];
        let last = performance.now();
        const start = last;

        function step() {
          const now = performance.now();
          frameTimes.push(now - last);
          last = now;

          if (now - start < dur) {
            requestAnimationFrame(step);
          } else {
            frameTimes.sort((a, b) => a - b);
            const sum = frameTimes.reduce((a, b) => a + b, 0);
            const avg = sum / frameTimes.length;
            const min = frameTimes[0];
            const max = frameTimes[frameTimes.length - 1];
            const p50 = frameTimes[Math.floor(frameTimes.length * 0.5)];
            const p90 = frameTimes[Math.floor(frameTimes.length * 0.90)];
            const p95 = frameTimes[Math.floor(frameTimes.length * 0.95)];
            const p99 = frameTimes[Math.floor(frameTimes.length * 0.99)];
            const fps = 1000 / avg;

            const renderer = window.__robotScene.getRenderer();
            resolve({
              fps: parseFloat(fps.toFixed(2)),
              avg: parseFloat(avg.toFixed(2)),
              min: parseFloat(min.toFixed(2)),
              p50: parseFloat(p50.toFixed(2)),
              p90: parseFloat(p90.toFixed(2)),
              p95: parseFloat(p95.toFixed(2)),
              p99: parseFloat(p99.toFixed(2)),
              max: parseFloat(max.toFixed(2)),
              drawCalls: renderer.info.render.calls,
              triangles: renderer.info.render.triangles,
              sampleCount: frameTimes.length
            });
          }
        }
        requestAnimationFrame(step);
      });
    }, runDurationMs);

    return result;
  }

  // 1. Idle
  const idleDist = await measureDistribution('Idle', () => {
    window.__robotScene.getController()?.setIdleState();
  });
  console.log('Idle Distribution:', idleDist);

  // 2. Cursor Active
  const cursorDistPromise = measureDistribution('Cursor Active', null, 2500);
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * Math.PI * 4;
    await page.mouse.move(768 + Math.cos(angle) * 300, 430 + Math.sin(angle) * 200);
    await new Promise(r => setTimeout(r, 50));
  }
  const cursorDist = await cursorDistPromise;
  console.log('Cursor Distribution:', cursorDist);

  // 3. Animation Active
  const animDist = await measureDistribution('Animation Active', () => {
    window.__robotScene.getController()?.setLookTarget(0.6, -0.4, 1.2);
  });
  console.log('Animation Distribution:', animDist);

  // 4. Exploded View
  await page.evaluate(() => { window.__robotScene.toggleExplodedView(); });
  await new Promise(r => setTimeout(r, 600));
  const explodedDist = await measureDistribution('Exploded View', null);
  console.log('Exploded View Distribution:', explodedDist);
  await page.evaluate(() => { window.__robotScene.toggleExplodedView(); });
  await new Promise(r => setTimeout(r, 600));

  // 5. Debug Mode (Wireframe) - Run 3 trials to verify reproducibility
  const debugTrials = [];
  for (let d = 0; d < 3; d++) {
    await page.evaluate(() => { window.__robotScene.toggleDebugMode(); });
    await new Promise(r => setTimeout(r, 500));
    const dist = await measureDistribution(`Debug Mode Trial ${d + 1}`, null, 2000);
    debugTrials.push(dist);
    await page.evaluate(() => { window.__robotScene.toggleDebugMode(); });
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('Debug Mode Trials (3 samples):', debugTrials);

  // ==============================================================
  // STEP 5: 10 ROUTE NAVIGATION MEMORY & LIFECYCLE AUDIT
  // ==============================================================
  console.log('\n>>> Step 5: Executing 10 Route Transitions (Home -> About -> Home)...');
  const routeCycles = [];
  const initialHeap = await page.evaluate(() => performance.memory ? performance.memory.usedJSHeapSize / 1048576 : null);

  for (let cycle = 1; cycle <= 10; cycle++) {
    // Navigate to /about
    const tUnmountStart = performance.now();
    await page.evaluate(() => {
      document.querySelector('a[href="/about"]').click();
    });
    while (await page.evaluate(() => window.__robotScene !== null)) {
      await new Promise(r => setTimeout(r, 5));
    }
    const unmountMs = performance.now() - tUnmountStart;

    await new Promise(r => setTimeout(r, 150));

    // Navigate to / (Home)
    const tRemountStart = performance.now();
    await page.evaluate(() => {
      document.querySelector('a[href="/"]').click();
    });
    while (await page.evaluate(() => !window.__robotScene || !window.__robotScene.isReady)) {
      await new Promise(r => setTimeout(r, 5));
    }
    const remountMs = performance.now() - tRemountStart;

    await new Promise(r => setTimeout(r, 150));

    const cycleStats = await page.evaluate(() => {
      const rs = window.__robotScene;
      const heap = performance.memory ? performance.memory.usedJSHeapSize / 1048576 : null;
      const info = rs.getRenderer().info;
      return {
        heapMB: heap ? parseFloat(heap.toFixed(2)) : null,
        drawCalls: info.render.calls,
        geometries: info.memory.geometries,
        textures: info.memory.textures
      };
    });

    routeCycles.push({
      cycle,
      unmountMs: parseFloat(unmountMs.toFixed(2)),
      remountMs: parseFloat(remountMs.toFixed(2)),
      ...cycleStats
    });

    console.log(`  Cycle ${cycle}: Unmount ${unmountMs.toFixed(1)} ms | Remount ${remountMs.toFixed(1)} ms | Heap: ${cycleStats.heapMB} MB | Geoms: ${cycleStats.geometries} | Calls: ${cycleStats.drawCalls}`);
  }

  // ==============================================================
  // STEP 6: COMPILE COMPLETE FORENSIC REPORT DATA
  // ==============================================================
  const masterReport = {
    timestamp: new Date().toISOString(),
    environment: {
      browser: 'Google Chrome (Headless new)',
      version: browserVersion,
      viewport: '1536x860',
      dpr: 1.0
    },
    initialStartup: {
      initialLoadReadyMs: parseFloat(initialLoadReadyMs.toFixed(2))
    },
    sceneAudit,
    classificationInvestigation,
    cpuProfile,
    distributions: {
      idle: idleDist,
      cursor: cursorDist,
      animation: animDist,
      exploded: explodedDist,
      debugTrials
    },
    routeCycles,
    initialHeapMB: initialHeap ? parseFloat(initialHeap.toFixed(2)) : null,
    finalHeapMB: routeCycles[routeCycles.length - 1].heapMB
  };

  fs.writeFileSync('scripts/forensic_p2_master_report.json', JSON.stringify(masterReport, null, 2));
  console.log('\n================================================================');
  console.log('Master report saved to: scripts/forensic_p2_master_report.json');
  console.log('================================================================');

  await browser.close();
  return masterReport;
}

runForensicAudit().catch(err => {
  console.error('Forensic Audit Failed:', err);
  process.exit(1);
});
