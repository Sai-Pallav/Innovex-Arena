const puppeteer = require('puppeteer-core');

async function testAsyncChunks() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 860 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  const result = await page.evaluate(async () => {
    const { ROBOT_ROTATION } = await import('/src/robot/config.ts');
    const { createRobotMaterials } = await import('/src/robot/materials/RobotMaterials.ts');
    const { createRobotHead } = await import('/src/robot/head/RobotHead.ts');
    const { createRobotArm } = await import('/src/robot/arm/RobotArm.ts');
    const { createRobotTorso } = await import('/src/robot/torso/RobotTorso.ts');
    const { createRobotLeg } = await import('/src/robot/leg/RobotLeg.ts');
    const THREE = await import('/node_modules/.vite/deps/three.js');

    const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

    const chunkTimes = [];
    const tStart = performance.now();

    // Chunk 1: Materials & Root
    let t0 = performance.now();
    const root = new THREE.Group();
    root.name = 'RobotRoot';
    root.rotation.y = ROBOT_ROTATION.yaw;
    root.rotation.x = ROBOT_ROTATION.pitch;
    root.rotation.z = ROBOT_ROTATION.roll;
    const ledMeshes = [];
    const materials = createRobotMaterials();
    chunkTimes.push({ chunk: 'materials_and_root', ms: performance.now() - t0 });
    await yieldToMain();

    // Chunk 2: Torso
    t0 = performance.now();
    const torsoNodes = createRobotTorso(materials);
    root.add(torsoNodes.group);
    const torso = torsoNodes.group;
    const chestLogo = torsoNodes.chestArmor.logo;
    ledMeshes.push(...torsoNodes.ledMeshes);
    chunkTimes.push({ chunk: 'torso', ms: performance.now() - t0 });
    await yieldToMain();

    // Chunk 3: Head
    t0 = performance.now();
    const headAssembly = createRobotHead(materials);
    torsoNodes.upperTorsoFrame.group.add(headAssembly.neck);
    headAssembly.neck.position.set(0, 0.128, 0.004);
    const head = headAssembly.head;
    const neck = headAssembly.neck;
    const faceVisor = headAssembly.visorAssembly.visorMesh;
    const eyeTrackingGroup = headAssembly.visorLight.group;
    const visorLightBar = headAssembly.visorLight.ledMesh;
    const earRingLeftMesh = headAssembly.leftSideModule.emissiveRing;
    const earRingRightMesh = headAssembly.rightSideModule.emissiveRing;
    const eyeLeft = new THREE.Group();
    eyeLeft.name = 'EyeLeft';
    eyeTrackingGroup.add(eyeLeft);
    const eyeRight = new THREE.Group();
    eyeRight.name = 'EyeRight';
    eyeTrackingGroup.add(eyeRight);
    ledMeshes.push(...headAssembly.ledMeshes);
    chunkTimes.push({ chunk: 'head', ms: performance.now() - t0 });
    await yieldToMain();

    // Chunk 4: Left Arm
    t0 = performance.now();
    const leftArmNodes = createRobotArm(-1, materials);
    const leftMount = torsoNodes.shoulderMountLeft.extensionNodes?.armMount || torsoNodes.shoulderMountLeft.group;
    leftMount.add(leftArmNodes.root);
    chunkTimes.push({ chunk: 'left_arm', ms: performance.now() - t0 });
    await yieldToMain();

    // Chunk 5: Right Arm
    t0 = performance.now();
    const rightArmNodes = createRobotArm(1, materials);
    const rightMount = torsoNodes.shoulderMountRight.extensionNodes?.armMount || torsoNodes.shoulderMountRight.group;
    rightMount.add(rightArmNodes.root);
    ledMeshes.push(...leftArmNodes.ledMeshes, ...rightArmNodes.ledMeshes);
    chunkTimes.push({ chunk: 'right_arm', ms: performance.now() - t0 });
    await yieldToMain();

    // Chunk 6: Left Leg
    t0 = performance.now();
    const leftLeg = createRobotLeg(-1, materials);
    leftLeg.root.position.set(0, 0, 0);
    torsoNodes.waist.leftHipPivot.add(leftLeg.root);
    chunkTimes.push({ chunk: 'left_leg', ms: performance.now() - t0 });
    await yieldToMain();

    // Chunk 7: Right Leg
    t0 = performance.now();
    const rightLeg = createRobotLeg(1, materials);
    rightLeg.root.position.set(0, 0, 0);
    torsoNodes.waist.rightHipPivot.add(rightLeg.root);
    ledMeshes.push(...leftLeg.ledMeshes, ...rightLeg.ledMeshes);
    chunkTimes.push({ chunk: 'right_leg', ms: performance.now() - t0 });
    await yieldToMain();

    // Chunk 8: Final assembly
    t0 = performance.now();
    const leftShoulder = torsoNodes.shoulderMountLeft.group;
    const rightShoulder = torsoNodes.shoulderMountRight.group;
    const leftUpperArm = leftArmNodes.upperArm.group;
    const rightUpperArm = rightArmNodes.upperArm.group;
    const leftForearm = leftArmNodes.elbowPivot;
    const rightForearm = rightArmNodes.elbowPivot;
    const leftHand = leftArmNodes.hand?.group ?? leftArmNodes.wristPivot;
    const rightHand = rightArmNodes.hand?.group ?? rightArmNodes.wristPivot;
    const leftFoot = leftLeg.foot.group;
    const rightFoot = rightLeg.foot.group;

    const assembledNodes = {
      root,
      torso,
      torsoNodes,
      chestLogo,
      neck,
      head,
      faceVisor,
      eyeTrackingGroup,
      eyeLeft,
      eyeRight,
      visorLightBar,
      earRingLeft: earRingLeftMesh,
      earRingRight: earRingRightMesh,
      leftShoulder,
      rightShoulder,
      leftUpperArm,
      rightUpperArm,
      leftForearm,
      rightForearm,
      leftHand,
      rightHand,
      leftArmNodes,
      rightArmNodes,
      leftLeg: leftLeg.root,
      rightLeg: rightLeg.root,
      leftFoot,
      rightFoot,
      leftLegNodes: leftLeg,
      rightLegNodes: rightLeg,
      ledMeshes,
      materials: {
        armor: materials.armor,
        joint: materials.joint,
        visor: materials.visor,
        eyeGlow: materials.purpleEmissive,
        earRingGlow: materials.purpleEmissive,
        chestGlow: materials.purpleEmissive,
        accentGlow: materials.purpleEmissive,
      },
    };
    chunkTimes.push({ chunk: 'final_assembly', ms: performance.now() - t0 });

    const totalMs = performance.now() - tStart;
    return {
      chunkTimes,
      totalMs,
      assembledMeshCount: root.getObjectsByProperty('isMesh', true).length
    };
  });

  console.log('Async Chunks Test Results:', JSON.stringify(result, null, 2));
  await browser.close();
}

testAsyncChunks().catch(console.error);
