import React, { useEffect, useRef, useState } from 'react';
import { RobotScene } from '../../robot/scene/RobotScene';
import { DebugStats } from '../../robot/arm/DebugManager';
import { Sparkles, Eye, Shield, RefreshCw, Cpu, Activity, Layers } from 'lucide-react';

interface RobotCanvasProps {
  className?: string;
}

export const RobotCanvas: React.FC<RobotCanvasProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<RobotScene | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [modelSource, setModelSource] = useState<'glb' | 'procedural'>('procedural');
  const [isWireframe, setIsWireframe] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [debugStats, setDebugStats] = useState<DebugStats | null>(null);
  const [isInteractive, setIsInteractive] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new RobotScene({
      container: containerRef.current,
      // Load procedural engine directly with full MeshPhysicalMaterial clearcoat & bloom
      onLoaded: (source) => {
        setIsLoading(false);
        setModelSource(source);
      },
      onError: (err) => {
        console.error('Robot initialization error:', err);
        setIsLoading(false);
        setLoadError('WebGL context or 3D engine failed to initialize');
      },
    });

    sceneRef.current = scene;
    (window as any).__robotScene = scene;

    return () => {
      (window as any).__robotScene = null;
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}
    >
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-crosshair z-10" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#030014]/80 backdrop-blur-md transition-opacity duration-500">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin" />
            <Cpu className="w-6 h-6 text-violet-400 absolute" />
          </div>
          <div className="mt-4 flex flex-col items-center space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-violet-300 font-medium">
              Initializing 3D Core...
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Calibrating PBR Shaders & Kinematics
            </span>
          </div>
        </div>
      )}

      {/* Developer Debug Toggle (Section 9) — Positioned discreetly away from robot silhouette */}
      {!isLoading && !loadError && (
        <div className="absolute top-6 right-4 sm:right-6 z-20 flex items-center space-x-2 pointer-events-auto opacity-70 hover:opacity-100 transition-opacity">
          {isWireframe && debugStats && (
            <div className="px-2.5 py-1 rounded-md bg-purple-950/80 border border-purple-500/40 text-[10px] font-mono text-purple-300 backdrop-blur-sm shadow-lg">
              {debugStats.armTriangleCount
                ? `${debugStats.armTriangleCount.toLocaleString()} Triangles / Arm (~${Math.round(debugStats.triangleCount / 1000)}k Total)`
                : `${debugStats.triangleCount.toLocaleString()} Triangles`} • Low-Poly Hierarchy
            </div>
          )}
          <button
            onClick={() => {
              if (sceneRef.current) {
                const active = sceneRef.current.toggleExplodedView();
                setIsExploded(active);
              }
            }}
            title="Toggle Exploded Inspection View (Section 31)"
            className={`p-2 rounded-lg border backdrop-blur-md transition-all duration-300 ${
              isExploded
                ? 'bg-violet-600/40 border-violet-400 text-violet-200 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'bg-[#09061a]/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (sceneRef.current) {
                const active = sceneRef.current.toggleDebugMode();
                setIsWireframe(active);
                setDebugStats(sceneRef.current.getDebugStats());
              }
            }}
            title="Toggle Developer Debug Mode (Wireframe & Joint Axes)"
            className={`p-2 rounded-lg border backdrop-blur-md transition-all duration-300 ${
              isWireframe
                ? 'bg-purple-600/30 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'bg-[#09061a]/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Activity className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Fallback Banner */}
      {loadError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#060317]/95">
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 max-w-sm">
            <p className="text-sm font-medium">{loadError}</p>
            <p className="text-xs text-zinc-400 mt-2">
              Please verify your browser supports WebGL 2.0 with hardware acceleration.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RobotCanvas;
