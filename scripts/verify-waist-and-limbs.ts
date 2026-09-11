import * as THREE from 'three';
import { createProceduralRobot } from '../src/robot/robot/RobotProceduralFactory';
import { TorsoAnimationController } from '../src/robot/torso/TorsoAnimationController';

console.log('================================================================');
console.log('   ROBOT REFINEMENT VERIFICATION: SHOULDERS, HANDS, FINGERS & WAIST');
console.log('================================================================\n');

const robot = createProceduralRobot();
const torso = robot.torsoNodes!;
const leftArm = robot.leftArmNodes!;
const rightArm = robot.rightArmNodes!;

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
// 1. SHOULDERS TO HANDS REFINEMENT
// ==============================================================
console.log('--- 1. SHOULDERS TO HANDS CHECK ---');
assert(!!leftArm.shoulder.shoulderArmor, 'Left shoulder pauldron shell exists');
assert(!!rightArm.shoulder.shoulderArmor, 'Right shoulder pauldron shell exists');
assert(!!leftArm.shoulder.accentRing, 'Shoulder rotary core has concentric purple emissive ring');
assert(!!leftArm.shoulder.upperArmConnector, 'Shoulder has articulated upper arm connector with clevis');

// Elbow
assert(!!leftArm.elbow.upperHousing, 'Elbow upper housing collar exists');
assert(!!leftArm.elbow.centralPin, 'Elbow central transverse hinge pin exists');
assert(!!leftArm.elbow.lateralDisc && !!leftArm.elbow.medialDisc, 'Elbow dual side rotational discs exist');
assert(!!leftArm.elbow.accentRing && !!leftArm.elbow.medialAccentRing, 'Elbow side discs have concentric purple emissive rings');
assert(!!leftArm.elbow.olecranonArmor, 'Elbow posterior olecranon armor shield exists');

// Forearm & Wrist
assert(!!leftArm.forearm.gauntletBody, 'Forearm athletic gauntlet with saddle contour exists');
assert(!!leftArm.forearm.panelSeam, 'Forearm longitudinal tech groove has purple LED strip');
assert(!!leftArm.wrist.swivelCollar, 'Wrist swivel collar exists');
assert(!!leftArm.wrist.distalClevis, 'Wrist distal clevis yoke clasping carpal base exists');
assert(!!leftArm.wrist.styloidArmorLeft && !!leftArm.wrist.styloidArmorRight, 'Wrist sculpted white ceramic styloid armor cowls exist');
assert(!!leftArm.wrist.dorsalCowl, 'Wrist white ceramic dorsal bridge cowl exists');
assert(!!leftArm.wrist.rotaryCore, 'Wrist cycloidal harmonic drive rotary core exists');

// ==============================================================
// 2. HAND & FINGERS REFINEMENT
// ==============================================================
console.log('\n--- 2. HAND & FINGERS ANATOMICAL CHECK ---');
assert(!!leftArm.hand.palmChassis, 'Palm tapered titanium chassis exists');
assert(!!leftArm.hand.dorsalArmor, 'Sculpted ceramic dorsal shield exists');
assert(leftArm.hand.knuckles.length === 4, '4 MCP knuckle joints along anatomical arch');
assert(leftArm.hand.knuckleCaps.length === 4, '4 ceramic protective knuckle caps exist');
assert(leftArm.hand.palmarPads.length === 6, '6 segmented dark tactile palmar friction pads exist');

// Finger segments
const fingers = [leftArm.hand.indexFinger, leftArm.hand.middleFinger, leftArm.hand.ringFinger, leftArm.hand.littleFinger];
for (let i = 0; i < fingers.length; i++) {
  const f = fingers[i];
  assert(!!f.proximal.armorMesh, `Finger ${i + 1} proximal dorsal armor plate exists`);
  assert(!!f.proximal.padMesh, `Finger ${i + 1} proximal palmar friction pad exists`);
  assert(!!f.proximal.hingeMesh, `Finger ${i + 1} PIP transverse hinge pin exists`);
  assert(!!f.middle.armorMesh, `Finger ${i + 1} middle dorsal armor plate exists`);
  assert(!!f.middle.padMesh, `Finger ${i + 1} middle palmar friction pad exists`);
  assert(!!f.middle.hingeMesh, `Finger ${i + 1} DIP transverse hinge pin exists`);
  assert(!!f.distal.armorMesh, `Finger ${i + 1} distal dorsal armor plate with fingernail hood exists`);
  assert(!!f.distal.padMesh, `Finger ${i + 1} distal palmar friction pad exists`);
  assert(!!f.tipMesh, `Finger ${i + 1} tactile sensor dome tip exists`);
}

// Thumb
assert(!!leftArm.hand.thumb.baseBall, 'Opposable thumb thenar swivel ball exists');
assert(!!leftArm.hand.thumb.proximal.armorMesh, 'Thumb proximal armor plate exists');
assert(!!leftArm.hand.thumb.distal.armorMesh, 'Thumb distal armor plate with fingernail hood exists');
assert(!!leftArm.hand.thumb.tipMesh, 'Thumb tactile sensor dome tip exists');

// ==============================================================
// 3. WAIST ASSEMBLY REFINEMENT
// ==============================================================
console.log('\n--- 3. WAIST ASSEMBLY CHECK ---');
assert(!!torso.waist.upperWaistRing, 'Upper waist collar socket exists');
assert(!!torso.waist.waistCoreHousing, 'Waist core housing exists');
assert(!!torso.waist.rotationalRing, 'Waist rotational bearing race ring exists');
assert(torso.waist.statorTeeth.length === 18, '18 radial stator spline teeth on waist rotational ring');
assert(!!torso.waist.lowerWaistRing, 'Lower waist collar structural ring exists');

// Actuators
assert(!!torso.waist.leftActuator, 'Left hydraulic stabilization actuator exists');
assert(!!torso.waist.rightActuator, 'Right hydraulic stabilization actuator exists');
assert(!!torso.waist.leftActuator.cylinder && !!torso.waist.leftActuator.piston, 'Actuator has cylinder barrel and telescoping chrome piston rod');

// Hips & Iliac Crest Armor Cowls
assert(!!torso.waist.leftHip.rotaryHub && !!torso.waist.rightHip.rotaryHub, 'Left and right hip rotary joint hubs exist');
assert(!!torso.waist.leftHip.accentRing && !!torso.waist.rightHip.accentRing, 'Concentric purple emissive accent rings exist on hip faces');
assert(!!torso.waist.leftHip.iliacCrestArmor && !!torso.waist.rightHip.iliacCrestArmor, 'Sculpted white ceramic Iliac Crest Flank Armor Cowls exist');
assert(!!torso.waist.leftHip.flankLight && !!torso.waist.rightHip.flankLight, 'Lateral violet emissive flank lights exist on iliac crest armor');

// Pelvic Shield Plate, Inguinal Cowls & Sub-Pelvis Cradle
assert(!!torso.waist.pelvicPlate, 'Sculpted multi-faceted pelvic groin shield exists');
assert(!!torso.waist.pelvicAccentLight, 'Horizontal violet emissive LED slit on pelvic shield exists');
assert(!!torso.waist.pelvicIntakePocket, 'Nested dark titanium intake pocket with louvers exists');
assert(!!torso.waist.inguinalFlapLeft && !!torso.waist.inguinalFlapRight, 'Left and right articulated inguinal armor pauldrons exist');
assert(!!torso.waist.subPelvisCradle, 'Sub-pelvic dark titanium mechanical chassis cradle exists');

// ==============================================================
// 4. CENTRALIZED LED SYSTEM
// ==============================================================
console.log('\n--- 4. CENTRALIZED LED SYSTEM CHECK ---');
const totalLeds = robot.ledMeshes.length;
console.log(`Total emissive LED meshes registered in robot: ${totalLeds}`);
assert(totalLeds >= 30, 'Rich cybernetic luminescent mesh count across head, torso, waist, and arms');

// ==============================================================
// 5. EXPLODED VIEW INSPECTION KINEMATICS
// ==============================================================
console.log('\n--- 5. EXPLODED VIEW KINEMATICS ---');
const torsoCtrl = new TorsoAnimationController(torso);
torsoCtrl.setExplodedView(true);
for (let i = 0; i < 10; i++) torsoCtrl.update(0.1); // Step exploded view to full extension

assert(torso.waist.pelvicPlate.position.z > 0.05, 'Pelvic shield separates forward in exploded view');
assert(torso.waist.upperWaistRing.position.y > -0.20, 'Upper waist collar separates upward in +Y in exploded view');
assert(torso.waist.lowerWaistRing.position.y < -0.28, 'Lower waist collar separates downward in -Y in exploded view');
assert(torso.waist.leftHip.group.position.x < -0.096, 'Left hip and iliac crest cowl separate laterally in -X');
assert(torso.waist.rightHip.group.position.x > 0.096, 'Right hip and iliac crest cowl separate laterally in +X');
assert(torso.waist.inguinalFlapLeft!.position.z > 0.05, 'Left inguinal cowl separates forward in +Z');
assert(torso.waist.subPelvisCradle!.position.y < -0.28, 'Sub-pelvis cradle drops downward in -Y');

// Return to normal
torsoCtrl.setExplodedView(false);
for (let i = 0; i < 20; i++) torsoCtrl.update(0.1);
assert(Math.abs(torso.waist.pelvicPlate.position.z - 0.046) < 0.005, 'Pelvic shield cleanly returns to rest position');

console.log('\n================================================================');
console.log(`   ALL ${passedCount}/${totalChecks} REFINEMENT CHECKS PASSED WITH 100% SUCCESS!   `);
console.log('================================================================');
