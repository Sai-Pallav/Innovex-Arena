import * as THREE from 'three';

console.log('=== KNEE REFINEMENT DIMENSION AUDIT ===');

const patellaWidth = 0.028;
const patellaHeight = 0.048;
const patellaThickness = 0.010;
const patellaOffsetZ = 0.018;

// Front surface peak of patella:
// Extrude thickness 0.010 centered = [-0.005, +0.005]
// Ridge adds +0.0040 at center x=0, y=0.
// Front surface peak at center = +0.005 + 0.0040 = +0.009.
// Total Z in knee space = patellaOffsetZ + 0.009 = 0.027.
// LED bar at Z = 0.027 + 0.001 = 0.028 (PROUD OF SURFACE BY 1mm, completely visible!)
console.log('Patella front peak Z:', (patellaOffsetZ + 0.009).toFixed(4));
console.log('Patella LED Z:       ', (patellaOffsetZ + 0.0095).toFixed(4));

// Lower neck and shin interface
const lowerNeckWidth = 0.028;
const lowerNeckDepth = 0.022;
const lowerNeckHeight = 0.018;
console.log('Lower neck width:', lowerNeckWidth, 'depth:', lowerNeckDepth);

const shinTopWidth = 0.054;
const shinShoulderHeight = 0.104; // half length
const shinNotchDepth = 0.012;     // central V-dip
console.log('Shin shoulder Y:', shinShoulderHeight, 'Shin central notch Y:', shinShoulderHeight - shinNotchDepth);
