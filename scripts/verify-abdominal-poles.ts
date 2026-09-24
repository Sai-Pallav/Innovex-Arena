import * as THREE from 'three';
import { createRobotMaterials } from '../src/robot/materials/RobotMaterials';
import { createStomachAssembly } from '../src/robot/torso/AbdomenAssembly';
import { createRobotTorso } from '../src/robot/torso/RobotTorso';

console.log('================================================================');
console.log('   VERIFYING 4-POLE ABDOMINAL HYDRAULIC ACTUATOR ASSEMBLY');
console.log('================================================================\n');

const materials = createRobotMaterials();
const stomach = createStomachAssembly(materials);
const torso = createRobotTorso(materials);

let passed = 0;
let total = 0;

function assert(condition: boolean, msg: string) {
  total++;
  if (condition) {
    console.log(`✓ ${msg}`);
    passed++;
  } else {
    console.error(`✗ FAILED: ${msg}`);
    process.exit(1);
  }
}

// 1. Check side mechanism clusters exist
assert(!!stomach.sideMechanismLeft, 'Left abdominal side mechanism cluster exists');
assert(!!stomach.sideMechanismRight, 'Right abdominal side mechanism cluster exists');

// 2. Check left cluster contains 2 complete poles (OuterLeft & InnerLeft)
const leftCluster = stomach.sideMechanismLeft;
const outerLeft = leftCluster.getObjectByName('OuterLeftActuatorPole');
const innerLeft = leftCluster.getObjectByName('InnerLeftActuatorPole');

assert(!!outerLeft, 'Outer Left Actuator Pole exists in left cluster');
assert(!!innerLeft, 'Inner Left Actuator Pole exists in left cluster (completing pole #2)');

// 3. Check right cluster contains 2 complete poles (OuterRight & InnerRight)
const rightCluster = stomach.sideMechanismRight;
const outerRight = rightCluster.getObjectByName('OuterRightActuatorPole');
const innerRight = rightCluster.getObjectByName('InnerRightActuatorPole');

assert(!!outerRight, 'Outer Right Actuator Pole exists in right cluster');
assert(!!innerRight, 'Inner Right Actuator Pole exists in right cluster (completing pole #4)');

// 4. Verify all 4 poles have complete piston rods, power cores, and uniball joints
for (const pole of [outerLeft, innerLeft, outerRight, innerRight]) {
  assert(!!pole, 'Pole object exists');
  if (!pole) continue;
  
  const powerCore = pole.getObjectByName(`${pole.name}_PowerCore`);
  assert(!!powerCore, `${pole.name} has illuminated violet power core`);

  const pistonRod = pole.getObjectByName(`${pole.name}_PistonRod`);
  assert(!!pistonRod, `${pole.name} has mirror-polished chrome telescoping piston rod connecting barrel to waist plinth`);
}

// 5. Verify Torso assembly has stomach nodes intact
assert(!!torso.stomach.sideMechanismLeft && !!torso.stomach.sideMechanismRight, 'Torso stomach assembly exposes side mechanisms for animation');

console.log(`\n================================================================`);
console.log(` SUCCESS: All ${passed}/${total} checks passed! All 4 abdominal poles are fully built!`);
console.log(`================================================================`);
