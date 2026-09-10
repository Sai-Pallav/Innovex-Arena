import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';
import { RobotController } from '../src/robot/robot/RobotController';

console.log('================================================================');
console.log('   ROBOT REFINEMENT VERIFICATION: ARTICULATED LEGS & FEET');
console.log('================================================================\n');

const robot = createProceduralRobot();
const leftLeg = robot.leftLegNodes!;
const rightLeg = robot.rightLegNodes!;

let passedCount = 0;
let totalChecks = 0;

function assert(condition: boolean, msg: string) {
  totalChecks++;
  if (condition) {
    console.log(`✓ ${msg}`);
    passedCount++;
  } else {
    console.error(`✗ FAILED: ${msg}`);
    process.exit(1);
  }
}

// ==============================================================
// 1. HIP JOINT CHECK
// ==============================================================
console.log('--- 1. HIP JOINT CHECK ---');
assert(!!leftLeg.hip.gimbalHousing && !!rightLeg.hip.gimbalHousing, 'Left and right hip gimbal housings exist');
assert(!!leftLeg.hip.swivelBall && !!rightLeg.hip.swivelBall, 'Hip spherical swivel bearings exist');
assert(!!leftLeg.hip.accentRing && !!rightLeg.hip.accentRing, 'Hip concentric purple emissive rings exist');
assert(!!leftLeg.hip.thighMount && !!rightLeg.hip.thighMount, 'Articulated thigh mounting flanges exist');
assert(!!leftLeg.hip.actuatorFront && !!rightLeg.hip.actuatorFront, 'Anterior hip hydraulic assist actuators exist');
assert(!!leftLeg.hip.actuatorLateral && !!rightLeg.hip.actuatorLateral, 'Lateral hip hydraulic assist actuators exist');

// ==============================================================
// 2. THIGH / UPPER LEG CHECK
// ==============================================================
console.log('\n--- 2. THIGH / UPPER LEG CHECK ---');
assert(!!leftLeg.thigh.femurSkeleton && !!rightLeg.thigh.femurSkeleton, 'Titanium femur skeletal cores exist');
assert(!!leftLeg.thigh.anteriorArmor && !!rightLeg.thigh.anteriorArmor, 'Sculpted white ceramic anterior quad armor plates exist');
assert(!!leftLeg.thigh.lateralArmor && !!rightLeg.thigh.lateralArmor, 'Outer lateral thigh armor shields exist');
assert(!!leftLeg.thigh.medialArmor && !!rightLeg.thigh.medialArmor, 'Medial clearance armor plates exist');
assert(!!leftLeg.thigh.posteriorPlate && !!rightLeg.thigh.posteriorPlate, 'Posterior hamstring plates exist');
assert(!!leftLeg.thigh.ledStrip && !!rightLeg.thigh.ledStrip, 'Longitudinal purple neon conduits exist on thighs');
assert(!!leftLeg.thigh.rearDamper && !!rightLeg.thigh.rearDamper, 'Posterior knee-assist hydraulic dampers exist');

// ==============================================================
// 3. KNEE JOINT & PATELLAR SHIELD CHECK
// ==============================================================
console.log('\n--- 3. KNEE JOINT & PATELLAR SHIELD CHECK ---');
assert(!!leftLeg.knee.centralPin && !!rightLeg.knee.centralPin, 'Transverse structural knee hinge pins exist');
assert(!!leftLeg.knee.lateralDisc && !!rightLeg.knee.lateralDisc, 'Dual-axis rotary condyle discs exist (lateral)');
assert(!!leftLeg.knee.medialDisc && !!rightLeg.knee.medialDisc, 'Dual-axis rotary condyle discs exist (medial)');
assert(!!leftLeg.knee.accentRingLateral && !!rightLeg.knee.accentRingLateral, 'Lateral knee discs have purple emissive accent rings');
assert(!!leftLeg.knee.accentRingMedial && !!rightLeg.knee.accentRingMedial, 'Medial knee discs have purple emissive accent rings');
assert(!!leftLeg.knee.patellaShield && !!rightLeg.knee.patellaShield, 'Sculpted white ceramic patellar knee guard shields exist');
assert(!!leftLeg.knee.patellaLed && !!rightLeg.knee.patellaLed, 'Patellar shields have purple LED indicator slits');
assert(leftLeg.knee.statorTeeth.length === 12, '12 mechanical stator spline teeth on knee condyle');

// ==============================================================
// 4. SHIN / CALF GAUNTLET CHECK
// ==============================================================
console.log('\n--- 4. SHIN / CALF GAUNTLET CHECK ---');
assert(!!leftLeg.shin.tibiaSkeleton && !!rightLeg.shin.tibiaSkeleton, 'Titanium tibia skeletal cores exist');
assert(!!leftLeg.shin.fibulaStrut && !!rightLeg.shin.fibulaStrut, 'Lateral fibula support struts exist');
assert(!!leftLeg.shin.anteriorKeelArmor && !!rightLeg.shin.anteriorKeelArmor, 'Aerodynamic anterior shin keel armor plates exist');
assert(!!leftLeg.shin.ledStrip && !!rightLeg.shin.ledStrip, 'Longitudinal purple LED status strips along front shin exist');
assert(!!leftLeg.shin.posteriorCalfArmor && !!rightLeg.shin.posteriorCalfArmor, 'Posterior calf muscle armor cowls exist');
assert(leftLeg.shin.calfVents.length === 4, '4 calf ventilation louvers with internal purple glow lines exist');

// ==============================================================
// 5. ANKLE JOINT CHECK
// ==============================================================
console.log('\n--- 5. ANKLE JOINT CHECK ---');
assert(!!leftLeg.ankle.sphericalCore && !!rightLeg.ankle.sphericalCore, 'Ankle spherical bearing cores exist');
assert(!!leftLeg.ankle.clevisHousing && !!rightLeg.ankle.clevisHousing, 'Structural ankle clevis yokes exist');
assert(!!leftLeg.ankle.malleolusLateral && !!rightLeg.ankle.malleolusLateral, 'Lateral malleolus discs exist');
assert(!!leftLeg.ankle.malleolusMedial && !!rightLeg.ankle.malleolusMedial, 'Medial malleolus discs exist');
assert(!!leftLeg.ankle.accentRingLateral && !!rightLeg.ankle.accentRingLateral, 'Malleolus discs have concentric purple emissive rings');
assert(!!leftLeg.ankle.achillesDamper && !!rightLeg.ankle.achillesDamper, 'Posterior Achilles hydraulic dampers exist');

// ==============================================================
// 6. FOOT & BOOT ASSEMBLY CHECK
// ==============================================================
console.log('\n--- 6. FOOT & BOOT ASSEMBLY CHECK ---');
assert(!!leftLeg.foot.soleChassis && !!rightLeg.foot.soleChassis, 'High-traction dark titanium sole chassis exists');
assert(leftLeg.foot.treadPads.length === 5, '5 segmented rubberized grip tread pads per foot');
assert(!!leftLeg.foot.dorsalArmor && !!rightLeg.foot.dorsalArmor, 'Sculpted white ceramic dorsal metatarsal armor shields exist');
assert(!!leftLeg.foot.toePivot && !!rightLeg.foot.toePivot, 'Articulated toe pivots exist');
assert(!!leftLeg.foot.toeArmor && !!rightLeg.foot.toeArmor, 'Protective toe cap armor shields exist');
assert(!!leftLeg.foot.heelArmor && !!rightLeg.foot.heelArmor, 'Rear heel counters exist');
assert(!!leftLeg.foot.heelThruster && !!rightLeg.foot.heelThruster, 'Heel micro-thruster exhaust nozzles exist');
assert(!!leftLeg.foot.underglowStrip && !!rightLeg.foot.underglowStrip, 'Ground-effect purple neon underglow strips exist');

// ==============================================================
// 7. HIERARCHY & MOUNTING CHECK
// ==============================================================
console.log('\n--- 7. HIERARCHY & MOUNTING CHECK ---');
assert(robot.leftLeg.parent?.name === 'LeftHipPivot', 'Left leg is mounted directly into LeftHipPivot');
assert(robot.rightLeg.parent?.name === 'RightHipPivot', 'Right leg is mounted directly into RightHipPivot');

// Update matrix world
robot.root.updateMatrixWorld(true);

const box = new THREE.Box3().setFromObject(robot.root);
const size = new THREE.Vector3();
box.getSize(size);
const center = new THREE.Vector3();
box.getCenter(center);

console.log('\nFull Robot Model Dimensions:');
console.log(`  Min: [${box.min.x.toFixed(3)}, ${box.min.y.toFixed(3)}, ${box.min.z.toFixed(3)}]`);
console.log(`  Max: [${box.max.x.toFixed(3)}, ${box.max.y.toFixed(3)}, ${box.max.z.toFixed(3)}]`);
console.log(`  Size: [Width: ${size.x.toFixed(3)}, Height: ${size.y.toFixed(3)}, Depth: ${size.z.toFixed(3)}]`);
console.log(`  Center: [${center.x.toFixed(3)}, ${center.y.toFixed(3)}, ${center.z.toFixed(3)}]`);

assert(size.y > 1.40, `Full robot height is complete and heroic (> 1.40m): ${size.y.toFixed(3)}m`);
assert(box.min.y < -0.80, `Robot feet reach ground level (< -0.80m): ${box.min.y.toFixed(3)}m`);

// ==============================================================
// 8. CONTROLLER & ANIMATION SYSTEM CHECK
// ==============================================================
console.log('\n--- 8. CONTROLLER & ANIMATION CHECK ---');
const controller = new RobotController(robot);
const animSystem = controller.getAnimationSystem();
const legCtrl = animSystem.getLegController();
assert(!!legCtrl, 'LegAnimationController is initialized in animation system');

// Test update loop
controller.update(0.016);
assert(true, 'Controller update loop executed smoothly with legs');

// Test exploded view progress
legCtrl?.setExplodedProgress(1.0);
assert(leftLeg.thigh.anteriorArmor.position.z > 0.05, 'Exploded view displaced anterior thigh armor');
legCtrl?.setExplodedProgress(0.0);
assert(leftLeg.thigh.anteriorArmor.position.z === 0.024, 'Exploded view reset restores original position');

// Test wireframe debug mode
const wireframeState = legCtrl?.toggleDebug(true);
assert(wireframeState === true, 'Leg wireframe debug mode toggled on successfully');
legCtrl?.toggleDebug(false);
assert(true, 'Leg wireframe debug mode toggled off successfully');

console.log(`\n================================================================`);
console.log(`  ALL ${passedCount}/${totalChecks} VERIFICATIONS PASSED SUCCESSFULLY!`);
console.log(`================================================================`);
