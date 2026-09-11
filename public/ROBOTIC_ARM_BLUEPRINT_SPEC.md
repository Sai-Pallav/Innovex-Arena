# AAA Three.js Robotic Arm Blueprint — Mechanical Wireframe Engineering Specification
**Document No:** `INX-R9-ARM-M07`  
**Revision:** `3.2`  
**Classification:** `Restricted / Manufacturing Reference & 3D CAD Specification`  
**Engineering Benchmark:** `Apple Robotics × Tesla Optimus Gen 2 × Figure 02 Standard`  
**Standards:** `ISO 2768-mK / ASME Y14.5M-2018 / ISO 9283 (Manipulating Industrial Robots)`  
**Applicable Subsystems:** `src/robot/arm/ (Shoulder, UpperArm, Elbow, Forearm, Wrist, Hand, Finger)`  

---

## 1. Executive Summary & Design Philosophy

This engineering specification defines the complete mechanical architecture, structural hierarchy, manufacturing tolerances, kinematic parameters, and 3D modeling guidelines for a production-grade humanoid robotic arm (Shoulder to Fingertips).

The design language embodies **minimalist, functional high-tech engineering**:
- **Zero decorative sci-fi panels**: Every bevel, bracket, fastener, vent, and rib serves a quantified load-bearing, thermal, or kinematic purpose.
- **Physical plausibility**: All 19 active degrees of freedom (7 arm DOF + 12 hand DOF) possess realistic gear reducers, crossed-roller bearing races, motor stators, and mechanical hard-stops.
- **Aerospace-grade materials**: 7075-T651 CNC billet aluminum, Ti-6Al-4V Grade 5 titanium, silicon nitride ceramics, and tungsten-Dyneema hybrid tendons.
- **WebGL & Blender compatibility**: Designed for direct 1:1 modeling in Blender with clean quad topology, and optimized for Three.js rendering maintaining WebGL draw calls **< 500 calls/frame** via precision geometry merging.

---

## 2. Master Proportional Dimensions & Kinematic Summary

| Parameter | Specification | Engineering Description |
| :--- | :--- | :--- |
| **Total Reach Length** | `740.0 mm` | Shoulder center to tip of middle finger (Digit III) |
| **Upper Arm Length** | `320.0 mm` | Shoulder center-of-rotation to elbow transverse axle |
| **Forearm Length** | `260.0 mm` | Elbow transverse axle to wrist gimbal virtual center |
| **Hand Length** | `160.0 mm` | Wrist gimbal virtual center to fingertip (Digit III) |
| **Total Arm Mass** | `3.42 kg` | Complete arm assembly including actuators and wiring |
| **Nominal Payload** | `6.50 kg` | Continuous payload capacity at full 740 mm horizontal reach |
| **Peak Payload** | `12.00 kg` | Momentary dynamic grip and lift capacity |
| **Total Active DOF** | `19 DOF` | 7 Arm Actuators + 12 Hand Tendon Spool Drives |
| **Bus Operating Voltage** | `48V DC` | High-density distributed DC bus with EtherCAT bus |

---

## 3. The 9 Technical Engineering Panels

### PANEL 1 — Full Arm Overview
- **Projection**: First-Angle Orthographic Projection (Front View).
- **Architecture**:
  - Proportional division: Shoulder (Ø138 mm envelope), Upper Arm (88 mm bicep chord), Elbow (74 mm clevis width), Forearm (72 mm keel width), Wrist (Ø56 mm virtual sphere), Hand (85 mm metacarpal span).
  - Rotational centerlines indicated with ISO dashed-dotted axis markers (Red `#EF4444`).
  - Total reach radius of 740 mm defining a hemispherical continuous workspace envelope.
- **Three.js File Alignment**: [`src/robot/arm/Shoulder.ts`](file:///c:/Users/kotas/Desktop/mahesh/src/robot/arm/Shoulder.ts), [`src/robot/arm/UpperArm.ts`](file:///c:/Users/kotas/Desktop/mahesh/src/robot/arm/UpperArm.ts), [`src/robot/arm/Elbow.ts`](file:///c:/Users/kotas/Desktop/mahesh/src/robot/arm/Elbow.ts), [`src/robot/arm/Forearm.ts`](file:///c:/Users/kotas/Desktop/mahesh/src/robot/arm/Forearm.ts), [`src/robot/arm/Wrist.ts`](file:///c:/Users/kotas/Desktop/mahesh/src/robot/arm/Wrist.ts), [`src/robot/arm/Hand.ts`](file:///c:/Users/kotas/Desktop/mahesh/src/robot/arm/Hand.ts).

---

### PANEL 2 — Multiple Orthographic Views
- **Projection**: Third-Angle Multi-View (Front, Lateral Side, Rear Dorsal, and Internal Skeleton).
- **Silhouettes**:
  - **Front**: Aerodynamic profile with controlled 0.8 mm parting seams.
  - **Lateral Side**: Exposes the 14 mm negative clearance relief behind the elbow clevis and the 82° wrist conical flexion envelope.
  - **Rear Dorsal**: Triple convective cooling louvers with fine titanium mesh, tricep assist damper anchor boss, and braided conduit gland.
  - **Internal Skeleton**: Strips the ceramic PEEK armor cowls, revealing the 7075-T6 CNC I-beam humerus spar, triangulated forearm spaceframe, and internal motor stators.

---

### PANEL 3 — Shoulder Exploded Assembly
- **Explosion Vector**: Vertical axial explosion (+Y and +Z separation).
- **Sub-Component Stack**:
  1. `SH-EXP-01`: Outer Ceramic Pauldron Cowl (2.8 mm wall thickness, Silicon Nitride ceramic).
  2. `SH-EXP-02`: Inner Acoustic Isolation Liner (Anodized 6061-T6 Aluminum).
  3. `SH-EXP-03`: Crossed-Roller Bearing Dual Race (GCr15 bearing steel, 98 mm OD, 72 mm ID, P4 class).
  4. `SH-EXP-04`: Harmonic Drive Strain-Wave Reducer (100:1 ratio, circular spline, flexspline cup, elliptical wave generator, zero backlash < 10 arcsec).
  5. `SH-EXP-05`: Frameless Brushless DC Motor (Stator 12-slot winding, high-coercivity Neodymium rotor, 320W continuous, central Ø28 mm hollow slip-ring bore).
  6. `SH-EXP-06`: Clavicle Chassis Mounting Flange (8x M4 Grade 12.9 socket head cap screws on PCD Ø112 mm).
  7. `SH-EXP-07`: Dual Silicone Dust Seals (FKM Fluoroelastomer 75 Shore A, IP67 hermetic barrier).

---

### PANEL 4 — Elbow Double Hinge Mechanism
- **Kinematic Class**: 1 Primary Rotary Flexion DOF + 1 Auxiliary Hydraulic Deceleration Damper.
- **Range of Motion**: `0.0°` (Full Anatomical Extension) to `135.0°` (Full Flexion).
- **Mechanical Hardware**:
  - `EL-MECH-01`: Ti-6Al-4V Grade 5 Titanium double-clevis outer structural forks.
  - `EL-MECH-02`: Transverse pivot axle pin (Ø18.00 mm h6 ground bearing steel, 58-62 HRC).
  - `EL-MECH-03`: Paired needle roller bearings absorbing 12.8 kN radial shock loads.
  - `EL-MECH-04`: Integrated shock-absorbing hydraulic fluid damper (420 N·s/m progressive damping).
  - `EL-MECH-05`: CNC positive mechanical hard-stop lug locking at 137.5° to prevent tendon cable impingement.
  - `EL-MECH-06`: Concentric laser-etched rotary protractor bezel with 5° graduation ticks.

---

### PANEL 5 — Forearm Internal Chassis & Actuator Bays
- **Structural Concept**: Aerospace Triangulated Spaceframe Box (7075-T651 CNC Aluminum Billet).
- **Internal Mechanisms**:
  - `FA-SKEL-01`: CNC triangulated truss with 58% mass reduction through pocketing.
  - `FA-ACT-02`: Dual Inverted Planetary Roller-Screws (Class C3 ground alloy steel, 2.0 mm lead pitch, 55.0 mm stroke, 1,450 N peak thrust each, driving wrist pitch and yaw pushrods).
  - `FA-TRN-03`: Central Wrist Roll Transmission Shaft (Carbon fiber hollow tube Ø20 mm OD / Ø14 mm ID pass-through bore).
  - `FA-ARM-04`: Floating Gauntlet Armor Keel (Mounted on 4x CNC elastomeric standoffs maintaining a constant 3.5 mm air gap over the skeleton).
  - `FA-HARN-05`: Braided cybernetic wiring conduit harness (Rated for > 10,000,000 flex cycles).

---

### PANEL 6 — 3-DOF Spherical Wrist Assembly
- **Kinematic Differential**: Virtual Center Decoupled Spherical Gimbal.
  - **Roll (J5)**: `-90°` to `+90°` (Coaxial drive through cycloidal disc reducer, 22 Nm).
  - **Pitch (J6)**: `-75°` to `+75°` (Linear actuator pushrod linkage, 28 Nm).
  - **Yaw (J7)**: `-30°` to `+40°` (Linear actuator pushrod linkage, 24 Nm).
- **Key Safety Hardware**:
  - `WR-RING-04`: Concentric Hollow Cable Routing Ring (Delrin AF low-friction PTFE-filled sleeve, Ø22 mm bore) that isolates hand tendon cables and sensor conductors from rotational shear during continuous wrist roll.
  - `WR-ARM-05`: Lateral and Medial Ceramic Styloid Cowls shielding the gimbal pivot hubs.

---

### PANEL 7 — Complete Articulated Hand
- **Proportion**: Humanoid anthropomorphic scale (160 mm length, 74 mm palm breadth).
- **Structural Hardware**:
  - `HD-PALM-01`: Ti-6Al-4V Metacarpal structural frame housing 10x micro spool servo drives.
  - `HD-PAD-02`: Textured hexagonal silicone palmar grip pads (Dry friction coefficient µ = 1.65).
  - `HD-THM-03`: Opposable Thumb CMC Saddle Joint mounted with a fixed 38° forward opposition cant, enabling true pad-to-pad opposition against all digits.
  - `HD-KNCK-04`: MCP Knuckle Dual-Spindle Bearings permitting 0°-90° flexion and ±12° lateral finger splay.

---

### PANEL 8 — Hand Exploded Disassembly
- **Phalanx Component Breakdown (per Digit)**:
  - `DIG-DIST-05`: Distal Phalanx with integrated 16-point mutual capacitive tactile sensor dome.
  - `DIG-DIP-04`: DIP Precision Axle Hinge Pin (Ø3.0 mm H7/h6 fit).
  - `DIG-MID-03`: Middle Phalanx carbon-fiber reinforced PEEK load frame.
  - `DIG-PIP-02`: PIP Intermediate Hinge with integrated helical torsion return spring (0.045 Nm preload).
  - `DIG-PROX-01`: Proximal Phalanx 7075-T6 CNC aluminum skeletal bone.
  - `DIG-TDN-06`: 7x19 stranded tungsten core Dyneema-jacketed tendon cables (Breaking load 680 N).

---

### PANEL 9 — Single Finger Micro-Engineering Study
- **Magnification**: 200% Detail Study (Front, Lateral, and Longitudinal Section).
- **Internal Mechanics**:
  - Dual Silicon Nitride (Si3N4) micro ceramic idler pulleys (Ø4.5 mm) eliminating tendon guide friction (µ = 0.0015).
  - Dual return springs providing automatic extension when tension relaxes.
  - Compound flexion arc achieving 275° total joint enclosure angle for secure cylindrical power grasp.

---

## 4. Materials & Manufacturing Tolerances Table

| Material | Application Area | Tensile / Yield | Hardness | ISO 2768 Tolerance |
| :--- | :--- | :--- | :--- | :--- |
| **7075-T651 Aluminum** | Humerus Spar, Forearm Truss, Clavicle | `503 MPa` Yield | `150 HB` | `±0.015 mm` |
| **Ti-6Al-4V Gr 5 Titanium** | Elbow Clevis, Wrist Gimbal, Hand Frame | `880 MPa` Yield | `36 HRC` | `±0.008 mm` |
| **GCr15 Bearing Steel** | Crossed-Roller Races, Pivot Axles | `1,617 MPa` Tensile | `60-64 HRC` | `±0.003 mm (P4)` |
| **Silicon Nitride (Si3N4)** | Tendon Pulleys, Knuckle Balls | `850 MPa` Bending | `1,600 HV` | `±0.002 mm` |
| **Ceramic ZTA Polymer** | Outer Armor Pauldron & Gauntlet Cowls | `IK08 Impact` | `Mohs 9` | `±0.030 mm` |
| **Tungsten-Dyneema** | Hand Actuation Tendons | `680 N` Break Load | `116 GPa Modulus` | `±0.020 mm` |

---

## 5. Hard-Surface 3D Modeling Guidelines for Blender Artists

When modeling this robotic arm in Blender for subsequent export to GLTF/GLB or Three.js:

1. **Strict Quad Topology**:
   - Every mesh component must consist 100% of planar quadrilaterals. No triangles in primary deformation zones, zero 5-sided or higher N-gons.
   - Use radial edge loops around bearing cups, motor bores, and bolt counterbores (typically 24 to 36 sides depending on diameter).

2. **Edge Chamfers & Specular Highlights**:
   - Model double support loops around all mechanical hard edges spaced 0.4 mm to 0.8 mm from the corner.
   - Apply sharp markings (`Mark Sharp`) with auto-smooth at 35° to ensure crisp reflections without shading artifacts.

3. **Panel Wall Thickness & Negative Space**:
   - Armor panels must never be single-sided sheets. Apply a solidified 2.8 mm wall thickness with subtle 1.5° draft angles.
   - Emphasize negative space: the 3.5 mm gap between the outer shell and the internal CNC chassis must be cleanly modeled so interior wiring conduits and actuator rods are visible from oblique camera angles.

4. **Hierarchical Pivot Point Placement**:
   - Ensure the origin point of every rotating part is precisely aligned with the physical axle centerline:
     - Shoulder Pitch/Yaw/Roll: Coincident at spherical center `(0, 0, 0)`.
     - Elbow Flexion: Exactly centered on the transverse axle `Ø18 mm`.
     - Wrist Gimbal: Virtual intersection point of Yaw and Pitch axes.
     - Knuckles: Pin centers at the base of each proximal phalanx.

---

## 6. Three.js / WebGL Performance Budget

To maintain seamless 60 FPS performance on all client devices while preserving ultra-fine visual fidelity:

- **Draw Call Target**: `< 500 WebGL draw calls/frame` across the complete robot.
- **Geometry Consolidation**:
  - Non-articulated sub-assemblies (e.g. stator housings, mounting plates, internal chassis ribs, static bearing cups) are merged into single `BufferGeometry` instances using `mergeGeometriesByMaterial()`.
  - Articulated moving components (rotary clevises, linear pushrods, individual finger phalanxes) remain separate nodes in the scene graph to preserve interactive cursor tracking and exploded CAD view animations.
- **PBR Shading**:
  - `materials.armor`: High-gloss white ceramic clearcoat (`roughness: 0.12, metalness: 0.05, clearcoat: 0.85`).
  - `materials.joint`: Industrial titanium anodized finish (`roughness: 0.38, metalness: 0.88`).
  - `materials.purpleEmissive`: Signature glowing accent rings (`emissive: #9055ff, emissiveIntensity: 2.2`).

---

**Approved by:** Advanced Robotics Engineering Group  
**Manufacturing Release:** Active Production Line R9
