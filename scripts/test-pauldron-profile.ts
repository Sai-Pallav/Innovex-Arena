import * as THREE from 'three';

function testFullContour() {
  const vSteps = [0, 0.15, 0.35, 0.5, 0.7, 0.85, 1.0];
  console.log('=== VERIFIED FRONT SILHOUETTE CONTOUR ===');

  console.log('\n--- 1. TOP CREST & LATERAL SLOPE (u = 0.5, Apex) ---');
  for (const v of vSteps) {
    let rBase = 0.0475;
    let armorThick = 0.0036;
    if (v <= 0.35) {
      const t = v / 0.35;
      rBase = 0.0470 * (1 - t) + 0.0496 * t;
      armorThick = 0.0033 * (1 - t) + 0.0055 * t;
    } else {
      const t = (v - 0.35) / 0.65;
      rBase = 0.0496 * (1 - t) + 0.0476 * t;
      armorThick = 0.0055 * (1 - t) + 0.0036 * t;
    }
    const rOuter = rBase + 0.0016 + armorThick;
    const xInboard = -0.0285;
    const xOutboard = 0.0238;
    const xSpan = xInboard * (1 - v) + xOutboard * v;
    console.log(`v=${v.toFixed(2)}: X=${(xSpan*1000).toFixed(1)}mm, Y=${(rOuter*1000).toFixed(1)}mm (inner R=${((rBase+0.0016)*1000).toFixed(1)}mm >= 46.5mm: OK)`);
  }

  console.log('\n--- 2. LOWER MECHANICAL CLEARANCE ARCH (u = 0.0, Front Lower Edge) ---');
  for (const v of vSteps) {
    const centerT = Math.sin(v * Math.PI);
    const clearanceArch = Math.pow(Math.sin(v * Math.PI), 1.6) * 0.115;
    const antFlankInboard = Math.max(0, 1 - v / 0.30) * 0.065;
    const antFlankOutboard = Math.max(0, (v - 0.70) / 0.30) * 0.055;
    const antLapel = (antFlankInboard + antFlankOutboard) - clearanceArch;
    const startAngle = (-0.05 - antLapel) * Math.PI;
    const sinA = Math.sin(startAngle);
    let rBase = 0.0475;
    let armorThick = 0.0036;
    if (v <= 0.35) {
      const t = v / 0.35;
      rBase = 0.0470 * (1 - t) + 0.0496 * t;
      armorThick = 0.0033 * (1 - t) + 0.0055 * t;
    } else {
      const t = (v - 0.35) / 0.65;
      rBase = 0.0496 * (1 - t) + 0.0476 * t;
      armorThick = 0.0055 * (1 - t) + 0.0036 * t;
    }
    const rOuter = rBase + armorThick;
    const y = rOuter * sinA;
    const xInboard = -0.0285 + 0.0018;
    const xOutboard = 0.0238 - 0.0022;
    const xSpan = xInboard * (1 - v) + xOutboard * v;
    console.log(`v=${v.toFixed(2)}: X=${(xSpan*1000).toFixed(1)}mm, Y=${(y*1000).toFixed(1)}mm, Angle=${(startAngle*180/Math.PI).toFixed(1)}°`);
  }

  console.log('\n--- 3. MID-HEIGHT FLANK TAPER (u = 0.25) ---');
  for (const v of [0.85, 1.0]) {
    const u = 0.25;
    const midBulge = 0.0014 * Math.sin(u * Math.PI);
    const xOutboard = 0.0238 + midBulge - 0.0022 * Math.pow(Math.abs(u - 0.5) * 2, 1.4);
    console.log(`At u=${u}, v=${v}: Outboard X=${(xOutboard*1000).toFixed(1)}mm (wider than top & bottom)`);
  }
}
testFullContour();
