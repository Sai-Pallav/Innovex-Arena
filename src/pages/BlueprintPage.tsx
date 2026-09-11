import React, { useEffect } from 'react';
import {
  Compass,
  Download,
  FileText,
  Layers,
  Cpu,
  Shield,
  Zap,
  Crosshair,
  ExternalLink,
  CheckCircle2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { BlueprintViewer } from '../components/blueprint/BlueprintViewer';
import { BLUEPRINT_METADATA } from '../components/blueprint/BlueprintSpecData';

export const BlueprintPage: React.FC = () => {
  useEffect(() => {
    document.title = 'AAA Robotic Arm Engineering Blueprint (16K CAD Reference) | Innovex Arena';
  }, []);

  const downloadSpecFile = () => {
    window.open('/blueprints/aaa_robot_arm_blueprint_9panels.jpg', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Top Background Cyber Light Lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,rgba(0,240,255,0.15),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto space-y-10">
        {/* Engineering Header Title Section */}
        <div className="space-y-4 border-b border-cyan-500/20 pb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 rounded-full tracking-wider">
              {BLUEPRINT_METADATA.classification}
            </span>
            <span className="px-2.5 py-1 text-xs font-mono bg-slate-900 border border-slate-700 text-slate-300 rounded-full">
              DOC-NO: {BLUEPRINT_METADATA.documentNo}
            </span>
            <span className="px-2.5 py-1 text-xs font-mono bg-violet-500/10 border border-violet-400/30 text-violet-300 rounded-full">
              REV {BLUEPRINT_METADATA.revision}
            </span>
            <span className="px-2.5 py-1 text-xs font-mono bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              16K CAD BLUEPRINT
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-mono">
                AAA Humanoid Robotic Arm <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
                  Mechanical Wireframe Reference
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 font-sans leading-relaxed">
                Production-ready technical engineering blueprint from shoulder to fingertips for humanoid robotics
                manufacturing, precision 3D hard-surface Blender modeling, and WebGL Three.js implementation.
                Benchmarked against Tesla Optimus Gen 2, Apple Robotics, and Figure 02 aerospace architectures.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/blueprints/aaa_robot_arm_blueprint_9panels.jpg"
                download="INX-R9-AAA-ROBOTIC-ARM-BLUEPRINT-16K.jpg"
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-lg shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all font-mono"
              >
                <Download className="w-4 h-4" />
                <span>Export 16K Blueprint</span>
              </a>
              <a
                href="/ROBOTIC_ARM_BLUEPRINT_SPEC.md"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-semibold text-xs sm:text-sm rounded-lg transition-all font-mono"
              >
                <FileText className="w-4 h-4" />
                <span>View Full CAD Spec</span>
              </a>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 font-mono">
            <div className="p-3 bg-[#050C1C] border border-cyan-500/20 rounded-lg">
              <div className="text-[10px] uppercase text-cyan-400/80 font-bold">Total Length</div>
              <div className="text-lg font-bold text-white mt-0.5">{BLUEPRINT_METADATA.totalLength}</div>
              <div className="text-[10px] text-slate-500">Shoulder to tip</div>
            </div>
            <div className="p-3 bg-[#050C1C] border border-cyan-500/20 rounded-lg">
              <div className="text-[10px] uppercase text-cyan-400/80 font-bold">Total Mass</div>
              <div className="text-lg font-bold text-white mt-0.5">{BLUEPRINT_METADATA.totalMass}</div>
              <div className="text-[10px] text-slate-500">Titanium & Aluminum</div>
            </div>
            <div className="p-3 bg-[#050C1C] border border-cyan-500/20 rounded-lg">
              <div className="text-[10px] uppercase text-cyan-400/80 font-bold">Active Articulation</div>
              <div className="text-lg font-bold text-cyan-300 mt-0.5">19 DOF</div>
              <div className="text-[10px] text-slate-500">7 Arm + 12 Hand</div>
            </div>
            <div className="p-3 bg-[#050C1C] border border-cyan-500/20 rounded-lg">
              <div className="text-[10px] uppercase text-cyan-400/80 font-bold">Peak Payload</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">{BLUEPRINT_METADATA.peakPayload}</div>
              <div className="text-[10px] text-slate-500">Full reach extension</div>
            </div>
            <div className="p-3 bg-[#050C1C] border border-cyan-500/20 rounded-lg">
              <div className="text-[10px] uppercase text-cyan-400/80 font-bold">Max Joint Torque</div>
              <div className="text-lg font-bold text-white mt-0.5">120 Nm</div>
              <div className="text-[10px] text-slate-500">Harmonic drive</div>
            </div>
            <div className="p-3 bg-[#050C1C] border border-cyan-500/20 rounded-lg">
              <div className="text-[10px] uppercase text-cyan-400/80 font-bold">Draw Call Budget</div>
              <div className="text-lg font-bold text-violet-300 mt-0.5">&lt; 500 Calls</div>
              <div className="text-[10px] text-slate-500">Optimized WebGL</div>
            </div>
          </div>
        </div>

        {/* The 9-Panel Blueprint Interactive Workstation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crosshair className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
                Interactive 9-Panel CAD Engineering Board
              </h2>
            </div>
            <div className="text-xs text-slate-400 font-mono hidden sm:block">
              Use mouse wheel to zoom (40% - 400%) • Click sub-components to inspect ISO tolerances
            </div>
          </div>

          <BlueprintViewer />
        </div>

        {/* Deep Technical Engineering Documentation Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-cyan-500/20">
          {/* Kinematic Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#050B18] border border-cyan-500/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white font-mono uppercase">
                    Joint Kinematic & Actuator Allocation Matrix
                  </h3>
                </div>
                <span className="text-xs text-cyan-400/80 font-mono">ISO 9283 Robotics Standard</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 font-sans">
                  <thead className="bg-[#071128] text-cyan-300 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Joint Designation</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Angular Range</th>
                      <th className="py-2.5 px-3">Gearbox / Actuator</th>
                      <th className="py-2.5 px-3">Peak Torque</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-500/10">
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">J1 — Shoulder Pitch</td>
                      <td className="py-2.5 px-3">Rotary</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">-60° to +180°</td>
                      <td className="py-2.5 px-3">100:1 Harmonic Drive SHG-25</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">120 Nm</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">J2 — Shoulder Roll</td>
                      <td className="py-2.5 px-3">Rotary</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">-90° to +90°</td>
                      <td className="py-2.5 px-3">100:1 Harmonic Drive SHG-20</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">95 Nm</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">J3 — Shoulder Yaw</td>
                      <td className="py-2.5 px-3">Rotary</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">-45° to +135°</td>
                      <td className="py-2.5 px-3">80:1 Harmonic Drive SHG-20</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">78 Nm</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">J4 — Elbow Flexion</td>
                      <td className="py-2.5 px-3">Hinge</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">0° to 135°</td>
                      <td className="py-2.5 px-3">Double-Clevis Axle + 100:1 Strain Wave</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">78 Nm</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">J5 — Forearm Roll</td>
                      <td className="py-2.5 px-3">Rotary</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">-90° to +90°</td>
                      <td className="py-2.5 px-3">Hollow-Bore Carbon Drive Tube</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">22 Nm</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">J6 — Wrist Pitch</td>
                      <td className="py-2.5 px-3">Pushrod</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">-75° to +75°</td>
                      <td className="py-2.5 px-3">Planetary Roller-Screw Actuator 1</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">28 Nm</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">J7 — Wrist Yaw</td>
                      <td className="py-2.5 px-3">Pushrod</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">-30° to +40°</td>
                      <td className="py-2.5 px-3">Planetary Roller-Screw Actuator 2</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">24 Nm</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">J8-J19 — 5 Digits</td>
                      <td className="py-2.5 px-3">Tendon</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">0° to 90° / joint</td>
                      <td className="py-2.5 px-3">Tungsten-Dyneema Micro Spool Servos (x10)</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">32 N tip</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hard-Surface Modeling Protocol */}
            <div className="bg-[#050B18] border border-cyan-500/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-cyan-500/20 pb-3">
                <Sliders className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white font-mono uppercase">
                  Blender 3D Modeling & Quad Topology Protocol
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 font-sans">
                <div className="p-3.5 bg-slate-900/60 border border-cyan-500/20 rounded-lg space-y-1.5">
                  <div className="font-bold text-cyan-300 font-mono">1. Quad Edge Flow Only</div>
                  <p className="text-slate-400">
                    Zero triangles or non-planar N-gons in sub-d cages. Concentric edge loops around all bearing races,
                    bolt holes, and cylindrical pivot bosses.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-900/60 border border-cyan-500/20 rounded-lg space-y-1.5">
                  <div className="font-bold text-cyan-300 font-mono">2. Double Support Chamfers</div>
                  <p className="text-slate-400">
                    Hard-surface mechanical chamfers must employ twin support loops spaced 0.6 mm apart to hold crisp
                    specular edge reflections without pinching.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-900/60 border border-cyan-500/20 rounded-lg space-y-1.5">
                  <div className="font-bold text-cyan-300 font-mono">3. Physical Panel Thickness</div>
                  <p className="text-slate-400">
                    Never use single-sided zero-thickness polygons for armor shells. Model realistic 2.8 mm wall thickness
                    with interior structural stiffening ribs.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-900/60 border border-cyan-500/20 rounded-lg space-y-1.5">
                  <div className="font-bold text-cyan-300 font-mono">4. Kinematic Clearance Gaps</div>
                  <p className="text-slate-400">
                    Maintain 3.5 mm air gap between floating armor shells and internal CNC chassis. Minimum 1.5 mm joint
                    clearance to avoid mesh self-intersection.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Materials & Manufacturing Stack */}
          <div className="space-y-6">
            <div className="bg-[#050B18] border border-cyan-500/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-cyan-500/20 pb-3">
                <Shield className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white font-mono uppercase">
                  Manufacturing Materials Stack
                </h3>
              </div>

              <div className="space-y-3 text-xs font-sans">
                <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-lg">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-white">7075-T651 Aerospace Aluminum</span>
                    <span className="text-[10px] text-cyan-400">CNC Structural</span>
                  </div>
                  <p className="text-slate-400 mt-1">
                    Machined from solid billet for the upper arm I-beam spar, forearm triangulated truss, and clavicle plate.
                  </p>
                  <div className="mt-2 text-[11px] font-mono text-slate-300">
                    Yield: 503 MPa • Hardness: 150 HB • Density: 2.81 g/cm³
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-lg">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-white">Ti-6Al-4V Grade 5 Titanium</span>
                    <span className="text-[10px] text-cyan-400">High-Stress Pivots</span>
                  </div>
                  <p className="text-slate-400 mt-1">
                    Used on elbow double-clevis forks, wrist pitch/yaw gimbal yoke, and metacarpal hand skeleton.
                  </p>
                  <div className="mt-2 text-[11px] font-mono text-slate-300">
                    Yield: 880 MPa • Tensile: 950 MPa • Density: 4.43 g/cm³
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-lg">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-white">Zirconia Toughened Alumina (ZTA)</span>
                    <span className="text-[10px] text-cyan-400">Ceramic Shells</span>
                  </div>
                  <p className="text-slate-400 mt-1">
                    Ultra-smooth floating exterior armor cowls with satin nano-coat finish, scratch-proof and non-conductive.
                  </p>
                  <div className="mt-2 text-[11px] font-mono text-slate-300">
                    Hardness: 1,450 HV • Fracture Toughness: 8.5 MPa·m½
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-lg">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-white">Tungsten-Dyneema Hybrid Tendons</span>
                    <span className="text-[10px] text-cyan-400">Hand Actuation</span>
                  </div>
                  <p className="text-slate-400 mt-1">
                    High-modulus flexible core routed through Delrin idler pulleys to articulate all 5 phalanges.
                  </p>
                  <div className="mt-2 text-[11px] font-mono text-slate-300">
                    Modulus: 116 GPa • Break Load: 680 N • Elongation: &lt; 0.2%
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="bg-[#050B18] border border-cyan-500/30 rounded-xl p-6 space-y-3">
              <div className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider">
                Manufacturing Quality Audits
              </div>
              <div className="space-y-2 text-xs text-slate-300 font-sans">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>ISO 2768-m General Machining Tolerances verified</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Zero-backlash harmonic drive integration verified</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Cross-roller bearing stack moment load simulated</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Hollow pass-through cable ring verified for 10M roll cycles</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Three.js WebGL draw call budget preserved under 500 calls/frame</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueprintPage;
