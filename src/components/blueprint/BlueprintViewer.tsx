import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Download,
  Layers,
  Compass,
  FileText,
  Info,
  CheckCircle,
  Eye,
  Sliders,
  Crosshair,
  Grid,
} from 'lucide-react';
import {
  BLUEPRINT_METADATA,
  BLUEPRINT_PANELS,
  BlueprintComponent,
  BlueprintPanelData,
} from './BlueprintSpecData';

interface BlueprintViewerProps {
  className?: string;
}

export const BlueprintViewer: React.FC<BlueprintViewerProps> = ({ className = '' }) => {
  const [selectedPanel, setSelectedPanel] = useState<number | 'all'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeComponent, setActiveComponent] = useState<BlueprintComponent | null>(null);
  const [viewMode, setViewMode] = useState<'vector' | 'composite' | 'spec'>('vector');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Layer toggles
  const [showWireframe, setShowWireframe] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showExplodedVectors, setShowExplodedVectors] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showMaterials, setShowMaterials] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(400, Math.max(40, prev + delta)));
  };

  const resetZoom = () => {
    setZoomLevel(100);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const downloadSpecFile = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify({ metadata: BLUEPRINT_METADATA, panels: BLUEPRINT_PANELS }, null, 2)], {
      type: 'application/json',
    });
    element.href = URL.createObjectURL(file);
    element.download = 'INX-R9-ARM-M07-CAD-SPEC.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadBlueprintImage = () => {
    const a = document.createElement('a');
    a.href = '/blueprints/aaa_robot_arm_blueprint_9panels.jpg';
    a.download = 'INX-R9-AAA-ROBOTIC-ARM-BLUEPRINT-16K.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col w-full bg-[#050B18] text-[#E0E7FF] border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.08)] select-none font-mono ${className}`}
    >
      {/* Top Engineering CAD Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#070F24] border-b border-cyan-500/30 gap-4 z-30">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-950/80 border border-cyan-400/40 rounded-lg text-cyan-400">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-cyan-400 tracking-wider">DOC: {BLUEPRINT_METADATA.documentNo}</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 rounded">
                REV {BLUEPRINT_METADATA.revision}
              </span>
              <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 rounded font-sans">
                16K CAD READY
              </span>
            </div>
            <h2 className="text-sm md:text-base font-semibold text-white tracking-tight">
              {BLUEPRINT_METADATA.title}
            </h2>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center bg-[#050B18] border border-cyan-500/30 rounded-lg p-1 space-x-1">
          <button
            onClick={() => setViewMode('vector')}
            className={`px-3 py-1 text-xs rounded transition-all ${
              viewMode === 'vector'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vector CAD Grid
          </button>
          <button
            onClick={() => setViewMode('composite')}
            className={`px-3 py-1 text-xs rounded transition-all ${
              viewMode === 'composite'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            16K Orthographic Composite
          </button>
          <button
            onClick={() => setViewMode('spec')}
            className={`px-3 py-1 text-xs rounded transition-all ${
              viewMode === 'spec'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            BOM Spec Sheet
          </button>
        </div>

        {/* CAD Toolbar Actions */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#050B18] border border-cyan-500/30 rounded-lg px-2 py-1 space-x-1">
            <button
              onClick={() => handleZoom(-15)}
              className="p-1 hover:text-cyan-300 transition-colors text-slate-400"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-cyan-400 w-12 text-center">{zoomLevel}%</span>
            <button
              onClick={() => handleZoom(15)}
              className="p-1 hover:text-cyan-300 transition-colors text-slate-400"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={resetZoom}
              className="p-1 hover:text-cyan-300 transition-colors text-slate-400 ml-1 border-l border-cyan-500/30 pl-2"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={downloadBlueprintImage}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 rounded-lg text-xs font-semibold transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export 16K</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-slate-900 border border-slate-700 hover:border-cyan-400/40 text-slate-300 hover:text-white rounded-lg text-xs transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Secondary CAD Control Strip: Panel Filter & Layer Toggles */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#060D1E] border-b border-cyan-500/20 text-xs gap-3 z-20">
        {/* Panel Jump Selector */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-[10px] text-cyan-500/70 uppercase tracking-widest font-bold whitespace-nowrap">PANEL:</span>
          <button
            onClick={() => setSelectedPanel('all')}
            className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition-colors ${
              selectedPanel === 'all'
                ? 'bg-cyan-400 text-slate-950 font-bold'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-cyan-500/20'
            }`}
          >
            All 9 Panels
          </button>
          {BLUEPRINT_PANELS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPanel(p.id)}
              className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap transition-colors ${
                selectedPanel === p.id
                  ? 'bg-cyan-400 text-slate-950 font-bold'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-cyan-500/20'
              }`}
            >
              P{p.id}: {p.title.split('—')[1]?.trim() || p.title}
            </button>
          ))}
        </div>

        {/* Layer Visibility Toggles */}
        {viewMode === 'vector' && (
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-cyan-500/70 uppercase tracking-widest font-bold">LAYERS:</span>
            <button
              onClick={() => setShowWireframe(!showWireframe)}
              className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                showWireframe
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-500 line-through'
              }`}
            >
              Wireframe
            </button>
            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                showDimensions
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-500 line-through'
              }`}
            >
              Dimensions
            </button>
            <button
              onClick={() => setShowAxes(!showAxes)}
              className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                showAxes
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-500 line-through'
              }`}
            >
              Axes
            </button>
            <button
              onClick={() => setShowExplodedVectors(!showExplodedVectors)}
              className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                showExplodedVectors
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-500 line-through'
              }`}
            >
              Exploded
            </button>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                showLabels
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-500 line-through'
              }`}
            >
              Callouts
            </button>
            <button
              onClick={() => setShowMaterials(!showMaterials)}
              className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                showMaterials
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-500 line-through'
              }`}
            >
              Materials
            </button>
          </div>
        )}
      </div>

      {/* Main Blueprint Workspace Canvas Area */}
      <div className="relative flex-1 min-h-[750px] overflow-auto p-6 bg-[#050B18] bg-[radial-gradient(#0A1935_1px,transparent_1px)] [background-size:24px_24px]">
        {/* Fine Engineering Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#00f0ff15_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff15_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* View Mode: 16K Composite Image Mode */}
        {viewMode === 'composite' && (
          <div className="flex flex-col items-center justify-center min-w-full min-h-full py-4">
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="relative transition-transform duration-200 border-2 border-cyan-400/40 rounded-lg shadow-[0_0_60px_rgba(0,240,255,0.15)] overflow-hidden max-w-[1500px]"
            >
              <img
                src="/blueprints/aaa_robot_arm_blueprint_9panels.jpg"
                alt="16K AAA Robotic Arm Engineering Blueprint"
                className="w-full h-auto object-contain block select-none pointer-events-auto cursor-crosshair"
              />
              <div className="absolute bottom-4 right-4 bg-slate-950/80 border border-cyan-400/40 backdrop-blur-md px-3 py-1.5 rounded text-[11px] text-cyan-300">
                16K MASTER BLUEPRINT COMPOSITE • 9-PANEL ORTHOGRAPHIC ARCHITECTURE
              </div>
            </div>
          </div>
        )}

        {/* View Mode: Vector CAD Grid of 9 Panels */}
        {viewMode === 'vector' && (
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="transition-transform duration-200"
          >
            <div
              className={`grid gap-6 ${
                selectedPanel === 'all'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 max-w-5xl mx-auto'
              }`}
            >
              {BLUEPRINT_PANELS.filter((p) => selectedPanel === 'all' || p.id === selectedPanel).map((panel) => (
                <BlueprintPanelCard
                  key={panel.id}
                  panel={panel}
                  isSolo={selectedPanel !== 'all'}
                  showWireframe={showWireframe}
                  showDimensions={showDimensions}
                  showAxes={showAxes}
                  showExplodedVectors={showExplodedVectors}
                  showLabels={showLabels}
                  showMaterials={showMaterials}
                  onSelectComponent={(comp) => setActiveComponent(comp)}
                />
              ))}
            </div>
          </div>
        )}

        {/* View Mode: Bill of Materials & Kinematics Spec Sheet */}
        {viewMode === 'spec' && (
          <div className="max-w-6xl mx-auto py-6 space-y-6">
            <div className="bg-[#07112B] border border-cyan-500/40 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 mb-4">
                <div>
                  <span className="text-xs font-bold text-cyan-400">ENGINEERING BILL OF MATERIALS (BOM)</span>
                  <h3 className="text-xl font-bold text-white">Full Arm Subassembly Directory & ISO Tolerances</h3>
                </div>
                <button
                  onClick={downloadSpecFile}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 rounded text-xs transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download JSON Spec</span>
                </button>
              </div>

              {/* Key Parameters Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-slate-900/80 border border-cyan-500/20 rounded-lg">
                  <div className="text-[10px] text-cyan-400/80 uppercase">Total Weight</div>
                  <div className="text-lg font-bold text-white">{BLUEPRINT_METADATA.totalMass}</div>
                </div>
                <div className="p-3 bg-slate-900/80 border border-cyan-500/20 rounded-lg">
                  <div className="text-[10px] text-cyan-400/80 uppercase">Total Reach</div>
                  <div className="text-lg font-bold text-white">{BLUEPRINT_METADATA.totalLength}</div>
                </div>
                <div className="p-3 bg-slate-900/80 border border-cyan-500/20 rounded-lg">
                  <div className="text-[10px] text-cyan-400/80 uppercase">Nominal Payload</div>
                  <div className="text-lg font-bold text-white">{BLUEPRINT_METADATA.nominalPayload}</div>
                </div>
                <div className="p-3 bg-slate-900/80 border border-cyan-500/20 rounded-lg">
                  <div className="text-[10px] text-cyan-400/80 uppercase">Total Articulated DOF</div>
                  <div className="text-lg font-bold text-cyan-300">{BLUEPRINT_METADATA.totalDof}</div>
                </div>
              </div>

              {/* BOM Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#050B18] text-cyan-400 border-y border-cyan-500/30 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Part Number</th>
                      <th className="py-2.5 px-3">Component Description</th>
                      <th className="py-2.5 px-3">Subassembly</th>
                      <th className="py-2.5 px-3">Material Grade</th>
                      <th className="py-2.5 px-3">Tolerance</th>
                      <th className="py-2.5 px-3">Mass</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-500/10 font-sans">
                    {BLUEPRINT_PANELS.flatMap((p) => p.components).map((comp) => (
                      <tr
                        key={comp.id}
                        onClick={() => setActiveComponent(comp)}
                        className="hover:bg-cyan-500/10 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">{comp.partNumber}</td>
                        <td className="py-2.5 px-3 text-white font-medium">{comp.name}</td>
                        <td className="py-2.5 px-3 text-slate-400">Panel {comp.panelId}</td>
                        <td className="py-2.5 px-3 text-cyan-200/80">{comp.material}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-400">{comp.tolerance}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">{comp.mass}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Component Inspector Modal / Drawer */}
      {activeComponent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#071128] border-2 border-cyan-400 rounded-xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.25)] text-xs font-mono space-y-4">
            <div className="flex items-start justify-between border-b border-cyan-500/30 pb-3">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  PART {activeComponent.partNumber} • PANEL {activeComponent.panelId}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{activeComponent.name}</h3>
              </div>
              <button
                onClick={() => setActiveComponent(null)}
                className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed font-sans">{activeComponent.description}</p>

            <div className="grid grid-cols-2 gap-3 bg-[#050B18] p-3 rounded-lg border border-cyan-500/20">
              <div>
                <div className="text-[10px] text-cyan-500/70 uppercase font-bold">Material Specification</div>
                <div className="text-white font-semibold mt-0.5">{activeComponent.material}</div>
              </div>
              <div>
                <div className="text-[10px] text-cyan-500/70 uppercase font-bold">Manufacturing Tolerance</div>
                <div className="text-emerald-400 font-bold mt-0.5">{activeComponent.tolerance}</div>
              </div>
              <div>
                <div className="text-[10px] text-cyan-500/70 uppercase font-bold">Component Mass</div>
                <div className="text-slate-300 font-semibold mt-0.5">{activeComponent.mass}</div>
              </div>
              <div>
                <div className="text-[10px] text-cyan-500/70 uppercase font-bold">Quality Standard</div>
                <div className="text-cyan-300 font-semibold mt-0.5">{BLUEPRINT_METADATA.standard}</div>
              </div>
            </div>

            {/* Micro Specs */}
            <div>
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-2">Technical Parameters</div>
              <div className="space-y-1.5">
                {Object.entries(activeComponent.specs).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-1 px-2 bg-slate-900/60 rounded border border-cyan-500/10">
                    <span className="text-slate-400">{k}</span>
                    <span className="text-cyan-300 font-bold">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveComponent(null)}
                className="px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded hover:bg-cyan-400 transition-colors"
              >
                Dismiss Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Engineering Metadata Footer */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#040813] border-t border-cyan-500/30 text-[11px] text-slate-400 z-20">
        <div className="flex items-center space-x-4">
          <span className="text-cyan-400 font-bold">SCALE: 1:1 DIRECT CAD</span>
          <span>STANDARD: {BLUEPRINT_METADATA.standard}</span>
          <span>PROJECTION: FIRST ANGLE</span>
        </div>
        <div className="flex items-center space-x-3 text-cyan-400/80">
          <span>INNOVEX ROBOTICS • APPLE ROBOTICS × TESLA OPTIMUS BENCHMARK</span>
          <span className="text-emerald-400 font-bold">● ONLINE READY</span>
        </div>
      </div>
    </div>
  );
};

// Sub-Component: Blueprint Panel Card rendering individual SVG vector artwork
interface BlueprintPanelCardProps {
  panel: BlueprintPanelData;
  isSolo: boolean;
  showWireframe: boolean;
  showDimensions: boolean;
  showAxes: boolean;
  showExplodedVectors: boolean;
  showLabels: boolean;
  showMaterials: boolean;
  onSelectComponent: (comp: BlueprintComponent) => void;
}

const BlueprintPanelCard: React.FC<BlueprintPanelCardProps> = ({
  panel,
  isSolo,
  showWireframe,
  showDimensions,
  showAxes,
  showExplodedVectors,
  showLabels,
  showMaterials,
  onSelectComponent,
}) => {
  return (
    <div className="relative flex flex-col bg-[#071126]/90 border border-cyan-500/30 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.05)] hover:border-cyan-400/60 transition-all group">
      {/* Panel Top Title Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#081532] border-b border-cyan-500/25">
        <div>
          <div className="text-[10px] text-cyan-400 font-bold tracking-wider">{panel.title}</div>
          <div className="text-[11px] text-slate-300 font-sans truncate">{panel.subtitle}</div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
            {panel.scale}
          </span>
        </div>
      </div>

      {/* SVG Canvas for Panel */}
      <div className="relative w-full h-[360px] bg-[#050C1C] flex items-center justify-center overflow-hidden p-2">
        <PanelSvgRenderer
          panelId={panel.id}
          showWireframe={showWireframe}
          showDimensions={showDimensions}
          showAxes={showAxes}
          showExplodedVectors={showExplodedVectors}
        />

        {/* Floating Callout Badges on SVG */}
        {showLabels && (
          <div className="absolute top-2 left-2 flex flex-col space-y-1 pointer-events-none">
            {panel.dimensions.slice(0, 3).map((dim, idx) => (
              <div
                key={idx}
                className="px-1.5 py-0.5 bg-[#050B18]/85 border border-cyan-500/30 rounded text-[9px] text-cyan-300 font-mono"
              >
                {dim.label}: <span className="font-bold text-white">{dim.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Component Interactive Chips */}
      <div className="p-3 bg-[#060E21] border-t border-cyan-500/20 space-y-2">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="uppercase text-cyan-400/80 font-bold">Sub-Components ({panel.components.length})</span>
          <span>Click to Inspect</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {panel.components.map((comp) => (
            <button
              key={comp.id}
              onClick={() => onSelectComponent(comp)}
              className="px-2 py-1 bg-slate-900/80 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400 text-[10px] text-cyan-200 rounded transition-all flex items-center space-x-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="truncate max-w-[150px]">{comp.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// High-Precision SVG Procedural Geometry Generator for each panel
interface PanelSvgRendererProps {
  panelId: number;
  showWireframe: boolean;
  showDimensions: boolean;
  showAxes: boolean;
  showExplodedVectors: boolean;
}

const PanelSvgRenderer: React.FC<PanelSvgRendererProps> = ({
  panelId,
  showWireframe,
  showDimensions,
  showAxes,
  showExplodedVectors,
}) => {
  const strokeColor = '#FFFFFF';
  const wireColor = 'rgba(255, 255, 255, 0.45)';
  const cyanAccent = '#00F0FF';
  const dimColor = '#38BDF8';
  const axisColor = '#EF4444';

  switch (panelId) {
    case 1:
      // PANEL 1: Full Arm Overview (Front Orthographic)
      return (
        <svg viewBox="0 0 500 360" className="w-full h-full">
          {/* Center Rotational Axis */}
          {showAxes && (
            <g stroke={axisColor} strokeWidth="1" strokeDasharray="6,3" opacity="0.6">
              <line x1="250" y1="20" x2="250" y2="340" />
              <circle cx="250" cy="50" r="3" fill="#EF4444" />
              <circle cx="250" cy="160" r="3" fill="#EF4444" />
              <circle cx="250" cy="260" r="3" fill="#EF4444" />
            </g>
          )}

          {/* Shoulder Sphere */}
          <g>
            <circle cx="250" cy="50" r="34" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            {showWireframe && (
              <>
                <ellipse cx="250" cy="50" rx="34" ry="12" fill="none" stroke={wireColor} strokeWidth="0.8" />
                <ellipse cx="250" cy="50" rx="14" ry="34" fill="none" stroke={wireColor} strokeWidth="0.8" />
                <circle cx="250" cy="50" r="22" fill="none" stroke={cyanAccent} strokeWidth="1" strokeDasharray="3,2" />
              </>
            )}
          </g>

          {/* Upper Arm Bicep Cylinder */}
          <g>
            <path d="M 232 78 L 235 140 L 265 140 L 268 78 Z" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            {showWireframe && (
              <>
                <line x1="233" y1="100" x2="267" y2="100" stroke={wireColor} strokeWidth="0.8" />
                <line x1="234" y1="120" x2="266" y2="120" stroke={wireColor} strokeWidth="0.8" />
                <line x1="250" y1="78" x2="250" y2="140" stroke={cyanAccent} strokeWidth="0.8" strokeDasharray="2,2" />
              </>
            )}
          </g>

          {/* Elbow Hinge Disc */}
          <g>
            <circle cx="250" cy="160" r="18" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="250" cy="160" r="9" fill="none" stroke={cyanAccent} strokeWidth="1.2" />
            <circle cx="250" cy="160" r="3" fill={cyanAccent} />
          </g>

          {/* Forearm Tapered Keel */}
          <g>
            <path d="M 236 176 L 240 248 L 260 248 L 264 176 Z" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            {showWireframe && (
              <>
                <line x1="238" y1="200" x2="262" y2="200" stroke={wireColor} strokeWidth="0.8" />
                <line x1="239" y1="225" x2="261" y2="225" stroke={wireColor} strokeWidth="0.8" />
                {/* Linear Actuator Twin Lines */}
                <line x1="244" y1="180" x2="244" y2="245" stroke={cyanAccent} strokeWidth="1" />
                <line x1="256" y1="180" x2="256" y2="245" stroke={cyanAccent} strokeWidth="1" />
              </>
            )}
          </g>

          {/* Wrist Spherical Gimbal */}
          <g>
            <circle cx="250" cy="260" r="12" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <ellipse cx="250" cy="260" rx="12" ry="5" fill="none" stroke={cyanAccent} strokeWidth="0.8" />
          </g>

          {/* Hand & 5 Digits */}
          <g>
            <polygon points="238,272 262,272 266,298 234,298" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            {/* Thumb */}
            <path d="M 234 280 L 222 292 L 216 308" fill="none" stroke={strokeColor} strokeWidth="1.2" />
            {/* 4 Fingers */}
            <line x1="238" y1="298" x2="236" y2="335" stroke={strokeColor} strokeWidth="1.2" />
            <line x1="246" y1="298" x2="246" y2="345" stroke={strokeColor} strokeWidth="1.2" />
            <line x1="254" y1="298" x2="254" y2="340" stroke={strokeColor} strokeWidth="1.2" />
            <line x1="262" y1="298" x2="264" y2="330" stroke={strokeColor} strokeWidth="1.2" />
          </g>

          {/* Dimensions */}
          {showDimensions && (
            <g stroke={dimColor} strokeWidth="1" fill={dimColor} fontSize="9">
              {/* Overall Length Leader */}
              <line x1="295" y1="50" x2="295" y2="345" />
              <line x1="285" y1="50" x2="305" y2="50" />
              <line x1="285" y1="345" x2="305" y2="345" />
              <text x="310" y="200" transform="rotate(90, 310, 200)" textAnchor="middle">
                L = 740 mm
              </text>
            </g>
          )}
        </svg>
      );

    case 2:
      // PANEL 2: Multiple Orthographic Views (Front, Side, Rear, Skeleton)
      return (
        <svg viewBox="0 0 500 360" className="w-full h-full">
          {/* 4 Multi-view sub-columns */}
          {/* Front */}
          <g transform="translate(60, 40) scale(0.65)">
            <text x="0" y="-15" fill={cyanAccent} fontSize="12" textAnchor="middle">
              FRONT
            </text>
            <circle cx="0" cy="20" r="24" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <rect x="-14" y="44" width="28" height="60" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="0" cy="115" r="14" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <polygon points="-12,130 12,130 9,190 -9,190" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="0" cy="202" r="10" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <polygon points="-10,212 10,212 14,240 -14,240" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          </g>

          {/* Lateral Side */}
          <g transform="translate(180, 40) scale(0.65)">
            <text x="0" y="-15" fill={cyanAccent} fontSize="12" textAnchor="middle">
              LATERAL
            </text>
            <ellipse cx="0" cy="20" rx="26" ry="24" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M -10 44 Q 15 70 -8 104 L 8 104" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="0" cy="115" r="14" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M -8 130 Q 18 160 -6 190 L 6 190" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="0" cy="202" r="10" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M -6 212 L 8 235 L 4 255" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          </g>

          {/* Rear Dorsal */}
          <g transform="translate(300, 40) scale(0.65)">
            <text x="0" y="-15" fill={cyanAccent} fontSize="12" textAnchor="middle">
              DORSAL
            </text>
            <circle cx="0" cy="20" r="24" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            {/* Exhaust Louvers */}
            <line x1="-12" y1="12" x2="12" y2="12" stroke={cyanAccent} strokeWidth="1" />
            <line x1="-12" y1="20" x2="12" y2="20" stroke={cyanAccent} strokeWidth="1" />
            <line x1="-12" y1="28" x2="12" y2="28" stroke={cyanAccent} strokeWidth="1" />
            <rect x="-14" y="44" width="28" height="60" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="0" cy="115" r="14" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <polygon points="-12,130 12,130 9,190 -9,190" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          </g>

          {/* Internal Skeleton View */}
          <g transform="translate(420, 40) scale(0.65)">
            <text x="0" y="-15" fill="#10B981" fontSize="12" textAnchor="middle">
              SKELETON
            </text>
            {/* Exposed Motor & Bearings */}
            <circle cx="0" cy="20" r="18" fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3,2" />
            <rect x="-4" y="38" width="8" height="66" fill="none" stroke="#10B981" strokeWidth="1.5" />
            <circle cx="0" cy="115" r="10" fill="none" stroke="#10B981" strokeWidth="1.5" />
            {/* Spaceframe Truss */}
            <line x1="-8" y1="130" x2="8" y2="150" stroke="#10B981" strokeWidth="1" />
            <line x1="8" y1="150" x2="-8" y2="170" stroke="#10B981" strokeWidth="1" />
            <line x1="-8" y1="170" x2="8" y2="190" stroke="#10B981" strokeWidth="1" />
            <circle cx="0" cy="202" r="8" fill="none" stroke="#10B981" strokeWidth="1.5" />
          </g>
        </svg>
      );

    case 3:
      // PANEL 3: Shoulder Exploded Assembly
      return (
        <svg viewBox="0 0 500 360" className="w-full h-full">
          {/* Vertical Exploded Axis */}
          {showExplodedVectors && (
            <line x1="250" y1="30" x2="250" y2="330" stroke={cyanAccent} strokeWidth="1" strokeDasharray="4,2" />
          )}

          {/* Part 1: Outer Pauldron Cowl */}
          <g transform="translate(0, 10)">
            <ellipse cx="250" cy="40" rx="46" ry="16" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M 204 40 Q 250 18 296 40" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <text x="310" y="42" fill={cyanAccent} fontSize="9">
              01. Pauldron Shell
            </text>
          </g>

          {/* Part 2: Silicone O-Ring Dust Seal */}
          <g transform="translate(0, 50)">
            <ellipse cx="250" cy="50" rx="38" ry="12" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="3,2" />
            <text x="310" y="52" fill="#10B981" fontSize="9">
              02. Dust Seal Ring
            </text>
          </g>

          {/* Part 3: Crossed Roller Bearing Dual Race */}
          <g transform="translate(0, 95)">
            <ellipse cx="250" cy="60" rx="36" ry="12" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <ellipse cx="250" cy="65" rx="36" ry="12" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <ellipse cx="250" cy="60" rx="26" ry="9" fill="none" stroke={cyanAccent} strokeWidth="1" />
            <text x="310" y="65" fill={cyanAccent} fontSize="9">
              03. Cross-Roller Bearing
            </text>
          </g>

          {/* Part 4: Harmonic Drive Circular Spline */}
          <g transform="translate(0, 150)">
            <ellipse cx="250" cy="65" rx="32" ry="10" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <ellipse cx="250" cy="74" rx="32" ry="10" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <line x1="218" y1="65" x2="218" y2="74" stroke={strokeColor} strokeWidth="1.5" />
            <line x1="282" y1="65" x2="282" y2="74" stroke={strokeColor} strokeWidth="1.5" />
            <text x="310" y="72" fill={cyanAccent} fontSize="9">
              04. Harmonic Spline
            </text>
          </g>

          {/* Part 5: Brushless Motor Stator / Rotor */}
          <g transform="translate(0, 210)">
            <ellipse cx="250" cy="70" rx="28" ry="9" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <ellipse cx="250" cy="85" rx="28" ry="9" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <ellipse cx="250" cy="70" rx="14" ry="5" fill="none" stroke={cyanAccent} strokeWidth="1" />
            <text x="310" y="80" fill={cyanAccent} fontSize="9">
              05. BLDC Torque Stator
            </text>
          </g>

          {/* Part 6: Clavicle Chassis Plate */}
          <g transform="translate(0, 275)">
            <ellipse cx="250" cy="60" rx="44" ry="14" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="215" cy="58" r="2.5" fill={cyanAccent} />
            <circle cx="285" cy="58" r="2.5" fill={cyanAccent} />
            <circle cx="250" cy="48" r="2.5" fill={cyanAccent} />
            <circle cx="250" cy="72" r="2.5" fill={cyanAccent} />
            <text x="310" y="62" fill={cyanAccent} fontSize="9">
              06. Chassis Interface
            </text>
          </g>
        </svg>
      );

    case 4:
      // PANEL 4: Elbow Double Hinge Mechanism
      return (
        <svg viewBox="0 0 500 360" className="w-full h-full">
          {/* Clevis Forks Section */}
          <g transform="translate(50, 40)">
            {/* Upper Arm Clevis Fork */}
            <path d="M 80 40 L 140 40 L 180 80 L 160 120 L 80 120 Z" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            {/* Forearm Interface Clevis Fork */}
            <path d="M 180 80 L 260 160 L 230 190 L 160 120 Z" fill="none" stroke={strokeColor} strokeWidth="1.5" />

            {/* Central Pin Axle Ø 18mm */}
            <circle cx="170" cy="100" r="22" fill="none" stroke={strokeColor} strokeWidth="2" />
            <circle cx="170" cy="100" r="14" fill="none" stroke={cyanAccent} strokeWidth="1.5" />
            <circle cx="170" cy="100" r="5" fill="#EF4444" />

            {/* Hydraulic Damper Piston */}
            <line x1="110" y1="115" x2="205" y2="145" stroke={strokeColor} strokeWidth="3" />
            <line x1="205" y1="145" x2="230" y2="152" stroke="#10B981" strokeWidth="2" />

            {/* Rotation Arrow Arc: 0° to 135° */}
            {showAxes && (
              <g stroke={cyanAccent} fill="none">
                <path d="M 210 100 A 40 40 0 0 1 142 135" strokeWidth="1.5" strokeDasharray="3,2" />
                <polygon points="142,135 148,130 152,138" fill={cyanAccent} />
                <text x="215" y="85" fill={cyanAccent} fontSize="10" stroke="none">
                  θ = 135° Flexion
                </text>
              </g>
            )}

            {/* Mechanical Hard-Stop Lug */}
            <rect x="182" y="70" width="10" height="12" fill={strokeColor} stroke="#EF4444" strokeWidth="1" />
            <text x="195" y="75" fill="#EF4444" fontSize="8">
              135° CNC Stop
            </text>
          </g>
        </svg>
      );

    case 5:
      // PANEL 5: Forearm Internal Chassis & Actuator Bays
      return (
        <svg viewBox="0 0 500 360" className="w-full h-full">
          {/* Spaceframe Outer Contour */}
          <path d="M 70 80 L 410 110 L 410 240 L 70 270 Z" fill="none" stroke={strokeColor} strokeWidth="1.5" />

          {/* Triangulated Spaceframe Truss Members */}
          {showWireframe && (
            <g stroke={wireColor} strokeWidth="1">
              <line x1="120" y1="85" x2="180" y2="258" />
              <line x1="180" y1="258" x2="240" y2="98" />
              <line x1="240" y1="98" x2="300" y2="250" />
              <line x1="300" y1="250" x2="360" y2="108" />
            </g>
          )}

          {/* Dual Inverted Roller Screw Actuators */}
          <g>
            {/* Actuator 1 */}
            <rect x="130" y="125" width="180" height="20" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <line x1="310" y1="135" x2="390" y2="135" stroke={cyanAccent} strokeWidth="2.5" />
            {/* Actuator 2 */}
            <rect x="130" y="195" width="180" height="20" rx="3" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <line x1="310" y1="205" x2="390" y2="205" stroke={cyanAccent} strokeWidth="2.5" />
          </g>

          {/* Floating Gauntlet Standoff Markers */}
          {showExplodedVectors && (
            <g stroke="#10B981" strokeWidth="1" strokeDasharray="3,2">
              <line x1="70" y1="55" x2="70" y2="80" />
              <line x1="410" y1="85" x2="410" y2="110" />
              <text x="240" y="65" fill="#10B981" fontSize="9" textAnchor="middle">
                3.5 mm Armor Air-Gap Standoff
              </text>
            </g>
          )}
        </svg>
      );

    case 6:
      // PANEL 6: 3-DOF Spherical Wrist Assembly
      return (
        <svg viewBox="0 0 500 360" className="w-full h-full">
          {/* Forearm Interface Collar */}
          <ellipse cx="140" cy="180" rx="20" ry="40" fill="none" stroke={strokeColor} strokeWidth="1.5" />

          {/* Gimbal Yoke */}
          <path d="M 140 150 L 230 150 L 270 170 L 270 190 L 230 210 L 140 210" fill="none" stroke={strokeColor} strokeWidth="1.5" />

          {/* Roll, Pitch, Yaw Axes */}
          {showAxes && (
            <g stroke={cyanAccent} fill="none">
              {/* Roll Axis */}
              <line x1="80" y1="180" x2="380" y2="180" stroke="#EF4444" strokeWidth="1.2" strokeDasharray="5,2" />
              <ellipse cx="360" cy="180" rx="10" ry="24" stroke={cyanAccent} strokeWidth="1.2" />
              <text x="380" y="165" fill={cyanAccent} fontSize="10">
                Roll ±90°
              </text>

              {/* Pitch Axis */}
              <line x1="250" y1="80" x2="250" y2="280" stroke="#3B82F6" strokeWidth="1.2" strokeDasharray="5,2" />
              <text x="255" y="95" fill="#3B82F6" fontSize="10">
                Pitch ±75°
              </text>

              {/* Yaw Axis */}
              <text x="180" y="125" fill="#10B981" fontSize="10">
                Yaw -30°/+40°
              </text>
            </g>
          )}

          {/* Concentric Cable Routing Ring (Protects Wires from Twist) */}
          <circle cx="250" cy="180" r="18" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="3,2" />
          <text x="250" y="215" fill="#10B981" fontSize="8" textAnchor="middle">
            Tendon Pass-Through Ring
          </text>
        </svg>
      );

    case 7:
      // PANEL 7: Complete Articulated Hand
      return (
        <svg viewBox="0 0 500 360" className="w-full h-full">
          {/* Metacarpal Palm Chassis */}
          <polygon points="180,180 300,180 315,260 165,260" fill="none" stroke={strokeColor} strokeWidth="1.5" />

          {/* Thumb CMC Saddle Joint at 38° Abduction */}
          <g transform="translate(165, 220) rotate(-38)">
            <circle cx="0" cy="0" r="8" fill="none" stroke={cyanAccent} strokeWidth="1.5" />
            <line x1="0" y1="0" x2="-28" y2="0" stroke={strokeColor} strokeWidth="3" />
            <circle cx="-28" cy="0" r="6" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <line x1="-28" y1="0" x2="-52" y2="0" stroke={strokeColor} strokeWidth="2.5" />
          </g>

          {/* 4 Knuckle MCP Dual Bearings */}
          <circle cx="195" cy="180" r="7" fill="none" stroke={cyanAccent} strokeWidth="1.5" />
          <circle cx="225" cy="180" r="7" fill="none" stroke={cyanAccent} strokeWidth="1.5" />
          <circle cx="255" cy="180" r="7" fill="none" stroke={cyanAccent} strokeWidth="1.5" />
          <circle cx="285" cy="180" r="7" fill="none" stroke={cyanAccent} strokeWidth="1.5" />

          {/* Fingers Extended (Digit II - V) */}
          {/* Digit II Index */}
          <g transform="translate(195, 180)">
            <line x1="0" y1="0" x2="-4" y2="-45" stroke={strokeColor} strokeWidth="2.5" />
            <circle cx="-4" cy="-45" r="4" fill="none" stroke={cyanAccent} strokeWidth="1.2" />
            <line x1="-4" y1="-45" x2="-7" y2="-80" stroke={strokeColor} strokeWidth="2" />
            <circle cx="-7" cy="-80" r="3" fill="none" stroke={cyanAccent} strokeWidth="1.2" />
            <line x1="-7" y1="-80" x2="-9" y2="-105" stroke={strokeColor} strokeWidth="1.8" />
          </g>

          {/* Digit III Middle */}
          <g transform="translate(225, 180)">
            <line x1="0" y1="0" x2="0" y2="-52" stroke={strokeColor} strokeWidth="2.5" />
            <circle cx="0" cy="-52" r="4" fill="none" stroke={cyanAccent} strokeWidth="1.2" />
            <line x1="0" y1="-52" x2="0" y2="-92" stroke={strokeColor} strokeWidth="2" />
            <circle cx="0" cy="-92" r="3" fill="none" stroke={cyanAccent} strokeWidth="1.2" />
            <line x1="0" y1="-92" x2="0" y2="-120" stroke={strokeColor} strokeWidth="1.8" />
          </g>

          {/* Digit IV Ring */}
          <g transform="translate(255, 180)">
            <line x1="0" y1="0" x2="4" y2="-46" stroke={strokeColor} strokeWidth="2.5" />
            <circle cx="4" cy="-46" r="4" fill="none" stroke={cyanAccent} strokeWidth="1.2" />
            <line x1="4" y1="-46" x2="6" y2="-82" stroke={strokeColor} strokeWidth="2" />
            <circle cx="6" cy="-82" r="3" fill="none" stroke={cyanAccent} strokeWidth="1.2" />
            <line x1="6" y1="-82" x2="7" y2="-108" stroke={strokeColor} strokeWidth="1.8" />
          </g>

          {/* Digit V Little */}
          <g transform="translate(285, 180)">
            <line x1="0" y1="0" x2="8" y2="-36" stroke={strokeColor} strokeWidth="2.5" />
            <circle cx="8" cy="-36" r="4" fill="none" stroke={cyanAccent} strokeWidth="1.2" />
            <line x1="8" y1="-36" x2="14" y2="-64" stroke={strokeColor} strokeWidth="2" />
            <circle cx="14" cy="-64" r="3" fill="none" stroke={cyanAccent} strokeWidth="1.2" />
            <line x1="14" y1="-64" x2="18" y2="-86" stroke={strokeColor} strokeWidth="1.8" />
          </g>
        </svg>
      );

    case 8:
      // PANEL 8: Hand Exploded Disassembly
      return (
        <svg viewBox="0 0 500 360" className="w-full h-full">
          {/* Vertical Exploded Finger Segments */}
          <g transform="translate(250, 40)">
            {/* Distal Phalanx & Sensor Dome */}
            <rect x="-10" y="10" width="20" height="26" rx="6" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="0" cy="18" r="3" fill={cyanAccent} />
            <text x="30" y="24" fill={cyanAccent} fontSize="9">
              01. Distal Phalanx & Tactile Dome
            </text>

            {/* DIP Hinge Pin */}
            <line x1="-16" y1="52" x2="16" y2="52" stroke="#EF4444" strokeWidth="2" />
            <text x="30" y="55" fill="#EF4444" fontSize="9">
              02. DIP Precision Axle Pin
            </text>

            {/* Middle Phalanx */}
            <rect x="-12" y="70" width="24" height="38" rx="4" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            <text x="30" y="90" fill={cyanAccent} fontSize="9">
              03. Middle Phalanx Load Frame
            </text>

            {/* PIP Hinge Pin & Torsion Spring */}
            <line x1="-18" y1="124" x2="18" y2="124" stroke="#EF4444" strokeWidth="2" />
            <circle cx="0" cy="124" r="4" fill="none" stroke="#10B981" strokeWidth="1.5" />
            <text x="30" y="127" fill="#10B981" fontSize="9">
              04. PIP Hinge & Return Spring
            </text>

            {/* Proximal Phalanx */}
            <rect x="-14" y="145" width="28" height="52" rx="4" fill="none" stroke={strokeColor} strokeWidth="1.5" />
            {/* Tendon Guide Conduit Lines */}
            <line x1="-6" y1="145" x2="-6" y2="197" stroke={cyanAccent} strokeWidth="1" strokeDasharray="2,2" />
            <line x1="6" y1="145" x2="6" y2="197" stroke={cyanAccent} strokeWidth="1" strokeDasharray="2,2" />
            <text x="30" y="172" fill={cyanAccent} fontSize="9">
              05. Proximal Phalanx Bone
            </text>

            {/* MCP Dual-Axis Bearing Spindle */}
            <circle cx="0" cy="225" r="12" fill="none" stroke={cyanAccent} strokeWidth="1.5" />
            <circle cx="0" cy="225" r="5" fill="#3B82F6" />
            <text x="30" y="228" fill="#3B82F6" fontSize="9">
              06. MCP Knuckle Bearing
            </text>
          </g>
        </svg>
      );

    case 9:
      // PANEL 9: Single Finger Micro-Engineering Study
      return (
        <svg viewBox="0 0 500 360" className="w-full h-full">
          {/* Magnified Finger Sectional Study */}
          <g transform="translate(100, 40)">
            {/* Front Silhouette */}
            <g transform="translate(40, 0)">
              <text x="25" y="15" fill={cyanAccent} fontSize="11" textAnchor="middle">
                FRONT
              </text>
              <rect x="15" y="30" width="20" height="240" rx="6" fill="none" stroke={strokeColor} strokeWidth="1.5" />
              <line x1="15" y1="100" x2="35" y2="100" stroke={cyanAccent} strokeWidth="1" />
              <line x1="15" y1="175" x2="35" y2="175" stroke={cyanAccent} strokeWidth="1" />
            </g>

            {/* Lateral Cutaway Section with Tendon Pulley Routing */}
            <g transform="translate(180, 0)">
              <text x="35" y="15" fill={cyanAccent} fontSize="11" textAnchor="middle">
                CROSS-SECTION
              </text>
              {/* Outer Finger Flesh & Armor */}
              <path d="M 20 30 Q 35 15 50 30 L 50 260 L 20 260 Z" fill="none" stroke={strokeColor} strokeWidth="1.5" />

              {/* Internal Tendon Idler Pulleys */}
              <circle cx="28" cy="95" r="4" fill="none" stroke="#EF4444" strokeWidth="1.5" />
              <circle cx="28" cy="170" r="4" fill="none" stroke="#EF4444" strokeWidth="1.5" />

              {/* Flexor Tendon Cable Routing (Tungsten Wire) */}
              <path d="M 28 35 L 28 95 L 32 170 L 32 260" fill="none" stroke="#00F0FF" strokeWidth="1.8" />

              {/* Fingertip Sensor Array */}
              <ellipse cx="35" cy="32" rx="10" ry="6" fill="none" stroke="#10B981" strokeWidth="1.5" />
              <text x="75" y="36" fill="#10B981" fontSize="9">
                Sensory Matrix
              </text>
              <text x="75" y="100" fill="#EF4444" fontSize="9">
                PIP Pulley Ø 4.5mm
              </text>
              <text x="75" y="175" fill="#EF4444" fontSize="9">
                DIP Pulley Ø 4.5mm
              </text>
              <text x="75" y="240" fill={cyanAccent} fontSize="9">
                Tungsten Cable Ø 1.1mm
              </text>
            </g>
          </g>
        </svg>
      );

    default:
      return null;
  }
};
