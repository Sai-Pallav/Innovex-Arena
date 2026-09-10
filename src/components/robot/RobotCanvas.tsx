import React, { useEffect, useRef, useState } from 'react';
import { RobotScene } from '../../robot/scene/RobotScene';
import { Sparkles, Eye, Shield, RefreshCw, Cpu, Activity } from 'lucide-react';

interface RobotCanvasProps {
  className?: string;
}

export const RobotCanvas: React.FC<RobotCanvasProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<RobotScene | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [modelSource, setModelSource] = useState<'glb' | 'procedural'>('procedural');
  const [isWireframe, setIsWireframe] = useState(false);
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

    return () => {
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
