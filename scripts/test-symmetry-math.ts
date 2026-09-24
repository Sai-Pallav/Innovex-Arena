import * as THREE from 'three';

console.log('=== SYMMETRICAL KNEE ALIGNMENT AUDIT ===');

const yKneePivot = -0.2596; // relative to thigh
const thighArmorCenter = -0.1536;
const thighArchApex = thighArmorCenter - 0.077; // -0.2306 in thigh space

const patellaHeight = 0.046;
const halfPatella = patellaHeight * 0.5; // 0.023

const patellaCenterY = 0.0; // Centered exactly on bearing axis
const patellaTopY = patellaCenterY + halfPatella; // +0.023
const patellaBottomY = patellaCenterY - halfPatella; // -0.023

const thighArchInKneeSpace = thighArchApex - yKneePivot; // -0.2306 - (-0.2596) = +0.029
const topGap = thighArchInKneeSpace - patellaTopY; // +0.029 - 0.023 = 0.006 (6mm)

const yShinMount = -0.018;
const shinArmorCenter = -0.105;
const shinArmorTopNotch = shinArmorCenter + 0.094; // -0.011 in shin space
const shinTopInKneeSpace = yShinMount + shinArmorTopNotch; // -0.018 + (-0.011) = -0.029

const bottomGap = patellaBottomY - shinTopInKneeSpace; // -0.023 - (-0.029) = 0.006 (6mm)

console.log('Patella Center Y in Knee:   ', patellaCenterY.toFixed(4));
console.log('Patella Top Peak in Knee:  ', patellaTopY.toFixed(4));
console.log('Patella Bottom Peak in Knee:', patellaBottomY.toFixed(4));
console.log('Thigh Arch Apex in Knee:   ', thighArchInKneeSpace.toFixed(4));
console.log('Shin Top Notch in Knee:    ', shinTopInKneeSpace.toFixed(4));
console.log('Top Gap (Thigh to Patella):  ', topGap.toFixed(4), 'm (', (topGap * 1000).toFixed(1), 'mm)');
console.log('Bottom Gap (Patella to Shin):', bottomGap.toFixed(4), 'm (', (bottomGap * 1000).toFixed(1), 'mm)');
console.log('Is Perfectly Symmetrical?   ', topGap === bottomGap ? 'YES!' : 'NO');
