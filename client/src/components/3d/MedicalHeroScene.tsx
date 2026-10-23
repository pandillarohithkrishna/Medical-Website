import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';
import { WebGLFallback } from './WebGLFallback';

// Procedural DNA Strand composed of paired nodes and connecting rungs
function MedicalDNAHelix() {
  const groupRef = useRef<THREE.Group>(null);
  const rungCount = 20;
  const radius = 1.1;
  const height = 4.0;

  const rungs = useMemo(() => {
    const items = [];
    for (let i = 0; i < rungCount; i++) {
      const t = (i / rungCount) * Math.PI * 3;
      const y = (i / rungCount) * height - height / 2;
      const x1 = Math.cos(t) * radius;
      const z1 = Math.sin(t) * radius;
      const x2 = Math.cos(t + Math.PI) * radius;
      const z2 = Math.sin(t + Math.PI) * radius;
      items.push({ x1, z1, x2, z2, y, t });
    }
    return items;
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <group ref={groupRef}>
      {rungs.map((rung, i) => (
        <group key={i} position={[0, rung.y, 0]}>
          {/* Node 1 (Teal) */}
          <Sphere position={[rung.x1, 0, rung.z1]} args={[0.09, 16, 16]}>
            <meshStandardMaterial
              color="#0D9488"
              roughness={0.2}
              metalness={0.4}
              emissive="#0D9488"
              emissiveIntensity={0.25}
            />
          </Sphere>

          {/* Node 2 (Blue) */}
          <Sphere position={[rung.x2, 0, rung.z2]} args={[0.09, 16, 16]}>
            <meshStandardMaterial
              color="#2563EB"
              roughness={0.2}
              metalness={0.4}
              emissive="#1E40AF"
              emissiveIntensity={0.25}
            />
          </Sphere>

          {/* Cross Connector Bar */}
          <mesh
            position={[(rung.x1 + rung.x2) / 2, 0, (rung.z1 + rung.z2) / 2]}
            rotation={[0, -rung.t, 0]}
          >
            <cylinderGeometry args={[0.018, 0.018, radius * 2, 8]} />
            <meshStandardMaterial
              color="#E2E8F0"
              roughness={0.3}
              metalness={0.8}
              transparent
              opacity={0.65}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Layered Translucent Healthcare Core Rings & Floating Bio Particles
function HealthcareCoreScene() {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const midRingRef = useRef<THREE.Mesh>(null);
  const particleGroupRef = useRef<THREE.Group>(null);

  // Procedural ambient floating particles
  const particlePositions = useMemo(() => {
    const coords: [number, number, number][] = [];
    for (let i = 0; i < 35; i++) {
      coords.push([
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 4,
      ]);
    }
    return coords;
  }, []);

  useFrame((state, delta) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x += delta * 0.15;
      outerRingRef.current.rotation.y += delta * 0.2;
    }
    if (midRingRef.current) {
      midRingRef.current.rotation.x -= delta * 0.22;
      midRingRef.current.rotation.z += delta * 0.18;
    }
    if (particleGroupRef.current) {
      particleGroupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group>
      {/* Central Frosted Glass Bio-Sphere */}
      <Sphere args={[0.6, 32, 32]}>
        <meshPhysicalMaterial
          color="#CCFBF1"
          transmission={0.88}
          opacity={1}
          transparent
          roughness={0.12}
          ior={1.45}
          thickness={0.8}
        />
      </Sphere>

      {/* Internal Luminous Seed */}
      <Sphere args={[0.24, 16, 16]}>
        <meshStandardMaterial
          color="#14B8A6"
          emissive="#0D9488"
          emissiveIntensity={0.8}
          roughness={0.1}
        />
      </Sphere>

      {/* Rotating Gyroscopic Translucent Rings */}
      <Torus ref={outerRingRef} args={[1.9, 0.035, 16, 64]} rotation={[0.5, 0.2, 0]}>
        <meshStandardMaterial
          color="#38BDF8"
          roughness={0.2}
          metalness={0.6}
          transparent
          opacity={0.6}
        />
      </Torus>

      <Torus ref={midRingRef} args={[1.45, 0.03, 16, 64]} rotation={[-0.4, 0.6, 0.3]}>
        <meshStandardMaterial
          color="#2DD4BF"
          roughness={0.2}
          metalness={0.7}
          transparent
          opacity={0.7}
        />
      </Torus>

      {/* Ambient Floating Micro-Nodes */}
      <group ref={particleGroupRef}>
        {particlePositions.map((pos, idx) => (
          <Sphere key={idx} position={pos} args={[0.035, 8, 8]}>
            <meshBasicMaterial
              color={idx % 2 === 0 ? '#14B8A6' : '#60A5FA'}
              transparent
              opacity={0.6}
            />
          </Sphere>
        ))}
      </group>
    </group>
  );
}

// Composition with mouse parallax and smooth damping
function InteractiveComposition() {
  const containerRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (containerRef.current) {
      // Gentle mouse parallax interpolation
      const targetRotY = state.pointer.x * 0.25;
      const targetRotX = -state.pointer.y * 0.2;
      containerRef.current.rotation.y = THREE.MathUtils.lerp(containerRef.current.rotation.y, targetRotY, 0.05);
      containerRef.current.rotation.x = THREE.MathUtils.lerp(containerRef.current.rotation.x, targetRotX, 0.05);
    }
  });

  return (
    <group ref={containerRef}>
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6}>
        <HealthcareCoreScene />
        <MedicalDNAHelix />
      </Float>
    </group>
  );
}

// Error Boundary for WebGL initialization safety
class SceneErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('[3D Scene] WebGL context fallback triggered:', error);
  }

  render() {
    if (this.state.hasError) {
      return <WebGLFallback />;
    }
    return this.props.children;
  }
}

export const MedicalHeroScene: React.FC = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // Check reduced-motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);

    // Verify basic WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch (e) {
      setHasWebGL(false);
    }

    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  if (prefersReducedMotion || !hasWebGL) {
    return <WebGLFallback />;
  }

  return (
    <SceneErrorBoundary>
      <div className="w-full h-[380px] sm:h-[420px] md:h-[500px] lg:h-[540px] relative select-none cursor-grab active:cursor-grabbing">
        {/* Ambient atmospheric backlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-medteal-400/20 via-medblue-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <Canvas
          camera={{ position: [0, 0, 5.2], fov: 48 }}
          dpr={[1, 1.5]} // Capped DPR for crisp rendering and high performance
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            alpha: true,
          }}
        >
          <ambientLight intensity={0.9} />
          {/* Studio teal key light */}
          <directionalLight position={[4, 5, 4]} intensity={1.5} color="#0D9488" />
          {/* Secondary blue fill light */}
          <directionalLight position={[-4, -3, -2]} intensity={1.1} color="#2563EB" />
          {/* Subtle top rim light */}
          <pointLight position={[0, 4, 2]} intensity={0.8} color="#FFFFFF" />

          <Suspense fallback={null}>
            <InteractiveComposition />
          </Suspense>
        </Canvas>
      </div>
    </SceneErrorBoundary>
  );
};
