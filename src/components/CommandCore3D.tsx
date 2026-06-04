import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/use-mobile";

const CORE_COLOR = "#00d4ff";
const RING_COLOR = "#3cd7ff";
const SECONDARY_COLOR = "#dcb8ff";

const makeParticleGeometry = () => {
  const particleCount = 1100;
  const positions = new Float32Array(particleCount * 3);

  for (let index = 0; index < particleCount; index += 1) {
    const radius = 1.75 + Math.random() * 2.15;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const stride = index * 3;

    positions[stride] = radius * Math.sin(phi) * Math.cos(theta);
    positions[stride + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[stride + 2] = radius * Math.cos(phi);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return geometry;
};

const makeAmbientParticleGeometry = () => {
  const particleCount = 650;
  const positions = new Float32Array(particleCount * 3);

  for (let index = 0; index < particleCount; index += 1) {
    const stride = index * 3;
    positions[stride] = (Math.random() - 0.5) * 14;
    positions[stride + 1] = (Math.random() - 0.5) * 9;
    positions[stride + 2] = (Math.random() - 0.5) * 8;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return geometry;
};

const randomSpherePoint = (radius: number) => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 2 - 1);

  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );
};

const makeNetworkGeometry = () => {
  const segmentCount = 110;
  const positions = new Float32Array(segmentCount * 2 * 3);

  for (let index = 0; index < segmentCount; index += 1) {
    const start = randomSpherePoint(3.15);
    const end = start.clone().add(randomSpherePoint(1.05)).normalize().multiplyScalar(3.15);
    const stride = index * 6;

    positions[stride] = start.x;
    positions[stride + 1] = start.y;
    positions[stride + 2] = start.z;
    positions[stride + 3] = end.x;
    positions[stride + 4] = end.y;
    positions[stride + 5] = end.z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return geometry;
};

const makeNodeGeometry = () => {
  const nodeCount = 160;
  const positions = new Float32Array(nodeCount * 3);

  for (let index = 0; index < nodeCount; index += 1) {
    const point = randomSpherePoint(3.15 + Math.random() * 0.08);
    const stride = index * 3;
    positions[stride] = point.x;
    positions[stride + 1] = point.y;
    positions[stride + 2] = point.z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return geometry;
};

const makeDataBeamGeometry = () => {
  const beamCount = 42;
  const positions = new Float32Array(beamCount * 2 * 3);

  for (let index = 0; index < beamCount; index += 1) {
    const start = randomSpherePoint(1.35 + Math.random() * 0.8);
    const end = randomSpherePoint(2.75 + Math.random() * 0.55);
    const stride = index * 6;

    positions[stride] = start.x;
    positions[stride + 1] = start.y;
    positions[stride + 2] = start.z;
    positions[stride + 3] = end.x;
    positions[stride + 4] = end.y;
    positions[stride + 5] = end.z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return geometry;
};

const energyRings = [
  { radius: 1.75, rotation: [1.2, 0.2, 0.5], speed: [0.005, 0.008] },
  { radius: 2.18, rotation: [0.25, 1.25, 0.1], speed: [0.008, 0.004] },
  { radius: 2.58, rotation: [1.62, 0.45, 1.1], speed: [0.004, 0.007] },
] satisfies Array<{
  radius: number;
  rotation: [number, number, number];
  speed: [number, number];
}>;

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreference = () => setPrefersReducedMotion(motionQuery.matches);

    handleMotionPreference();
    motionQuery.addEventListener("change", handleMotionPreference);

    return () => motionQuery.removeEventListener("change", handleMotionPreference);
  }, []);

  return prefersReducedMotion;
};

const CommandCoreScene = ({ isActive }: { isActive: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const shieldRef = useRef<THREE.Mesh>(null);
  const outerShellRef = useRef<THREE.Mesh>(null);
  const secondaryShellRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const ambientParticlesRef = useRef<THREE.Points>(null);
  const networkRef = useRef<THREE.LineSegments>(null);
  const nodesRef = useRef<THREE.Points>(null);
  const beamsRef = useRef<THREE.LineSegments>(null);
  const ringRefs = useRef<Array<THREE.Mesh | null>>([]);
  const particleGeometry = useMemo(makeParticleGeometry, []);
  const ambientParticleGeometry = useMemo(makeAmbientParticleGeometry, []);
  const networkGeometry = useMemo(makeNetworkGeometry, []);
  const nodeGeometry = useMemo(makeNodeGeometry, []);
  const dataBeamGeometry = useMemo(makeDataBeamGeometry, []);

  useFrame(({ clock }) => {
    if (!isActive) {
      return;
    }

    const elapsed = clock.getElapsedTime();
    const pulse = 1 + Math.sin(elapsed * 1.5) * 0.045;

    if (groupRef.current) {
      groupRef.current.rotation.y += 0.00045;
    }

    if (coreRef.current) {
      coreRef.current.scale.setScalar(pulse);
      coreRef.current.rotation.y += 0.004;
    }

    if (shieldRef.current) {
      shieldRef.current.rotation.y += 0.004;
      shieldRef.current.rotation.z += 0.002;
    }

    if (outerShellRef.current) {
      outerShellRef.current.rotation.y -= 0.0016;
      outerShellRef.current.rotation.x += 0.0007;
    }

    if (secondaryShellRef.current) {
      secondaryShellRef.current.rotation.y += 0.0022;
      secondaryShellRef.current.rotation.z -= 0.0011;
    }

    if (networkRef.current) {
      networkRef.current.rotation.y += 0.0009;
      networkRef.current.rotation.z += 0.00035;
    }

    if (nodesRef.current) {
      nodesRef.current.rotation.y += 0.0009;
    }

    if (beamsRef.current) {
      beamsRef.current.rotation.y -= 0.0013;
      beamsRef.current.rotation.x += 0.0005;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0012;
      particlesRef.current.rotation.x += 0.0004;
    }

    if (ambientParticlesRef.current) {
      ambientParticlesRef.current.rotation.y += 0.00035;
      ambientParticlesRef.current.rotation.x += 0.00012;
    }

    ringRefs.current.forEach((ring, index) => {
      if (!ring) {
        return;
      }

      ring.rotation.x += energyRings[index].speed[0];
      ring.rotation.y += energyRings[index].speed[1];
    });
  });

  return (
    <>
      <ambientLight intensity={0.18} />
      <pointLight color={CORE_COLOR} intensity={5.2} position={[2.5, 2.5, 3.5]} distance={14} />
      <pointLight color={SECONDARY_COLOR} intensity={1.4} position={[-3, -1.5, -2]} distance={12} />

      <points ref={ambientParticlesRef} geometry={ambientParticleGeometry}>
        <pointsMaterial
          color={RING_COLOR}
          size={0.012}
          transparent
          opacity={0.44}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <group ref={groupRef} scale={1.04}>
        <mesh scale={1.38}>
          <sphereGeometry args={[1.22, 28, 28]} />
          <meshBasicMaterial
            color={CORE_COLOR}
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <mesh scale={1.74}>
          <sphereGeometry args={[1.2, 28, 28]} />
          <meshBasicMaterial
            color={RING_COLOR}
            transparent
            opacity={0.055}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <mesh ref={coreRef}>
          <sphereGeometry args={[1.16, 32, 32]} />
          <meshStandardMaterial
            color={CORE_COLOR}
            emissive="#00677e"
            emissiveIntensity={1.7}
            metalness={1}
            roughness={0.04}
            transparent
            opacity={0.92}
          />
        </mesh>

        <mesh>
          <sphereGeometry args={[1.42, 24, 24]} />
          <meshBasicMaterial
            color={RING_COLOR}
            wireframe
            transparent
            opacity={0.095}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <mesh ref={shieldRef}>
          <icosahedronGeometry args={[2.42, 2]} />
          <meshBasicMaterial
            color={CORE_COLOR}
            wireframe
            transparent
            opacity={0.18}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <mesh ref={outerShellRef}>
          <icosahedronGeometry args={[3.18, 3]} />
          <meshBasicMaterial
            color={RING_COLOR}
            wireframe
            transparent
            opacity={0.135}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <mesh ref={secondaryShellRef}>
          <dodecahedronGeometry args={[2.84, 1]} />
          <meshBasicMaterial
            color={SECONDARY_COLOR}
            wireframe
            transparent
            opacity={0.08}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <lineSegments ref={networkRef} geometry={networkGeometry}>
          <lineBasicMaterial
            color={RING_COLOR}
            transparent
            opacity={0.24}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>

        <points ref={nodesRef} geometry={nodeGeometry}>
          <pointsMaterial
            color={CORE_COLOR}
            size={0.032}
            transparent
            opacity={0.52}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            sizeAttenuation
          />
        </points>

        <lineSegments ref={beamsRef} geometry={dataBeamGeometry}>
          <lineBasicMaterial
            color={SECONDARY_COLOR}
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>

        <points ref={particlesRef} geometry={particleGeometry}>
          <pointsMaterial
            color={RING_COLOR}
            size={0.024}
            transparent
            opacity={0.72}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            sizeAttenuation
          />
        </points>

        {energyRings.map((ring, index) => (
          <mesh
            key={ring.radius}
            ref={(node) => {
              ringRefs.current[index] = node;
            }}
            rotation={ring.rotation}
          >
            <torusGeometry args={[ring.radius, 0.012, 10, 80]} />
            <meshBasicMaterial
              color={index === 1 ? SECONDARY_COLOR : CORE_COLOR}
              transparent
              opacity={index === 1 ? 0.16 : 0.22}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </>
  );
};

const CommandCoreFallback = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="relative aspect-square w-[min(68vw,380px)] opacity-95">
      <div className="absolute inset-[7%] rounded-full border border-primary/35 shadow-[0_0_52px_hsl(var(--primary)/0.22)]" />
      <div className="absolute inset-[16%] rounded-full border border-secondary/30" />
      <div className="absolute inset-[24%] rounded-full bg-primary/20 shadow-[0_0_110px_hsl(var(--primary)/0.5),inset_0_0_46px_hsl(var(--primary)/0.28)]" />
      <div className="absolute inset-[31%] rounded-full bg-cyan-300/45 blur-xl" />
      <div className="absolute inset-[39%] rounded-full border border-primary/70 bg-background/45 shadow-[0_0_58px_hsl(var(--primary)/0.5)]" />
      <div className="absolute inset-[45%] rounded-full bg-primary shadow-[0_0_26px_hsl(var(--primary)/0.9)]" />
      <div className="absolute left-[6%] right-[6%] top-1/2 h-px -rotate-12 bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="absolute left-[12%] right-[12%] top-1/2 h-px rotate-[28deg] bg-gradient-to-r from-transparent via-secondary/55 to-transparent" />
      <div className="absolute left-[18%] right-[18%] top-1/2 h-px rotate-[74deg] bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent" />
      <div className="absolute left-1/2 top-[9%] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_24px_hsl(var(--primary)/0.95)]" />
      <div className="absolute bottom-[16%] left-[21%] h-2 w-2 rounded-full bg-secondary shadow-[0_0_22px_hsl(var(--secondary)/0.9)]" />
      <div className="absolute right-[16%] top-[32%] h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_22px_rgba(165,243,252,0.9)]" />
    </div>
  </div>
);

interface CommandCore3DProps {
  className?: string;
  isActive?: boolean;
}

const CommandCore3D = ({ className = "", isActive = true }: CommandCore3DProps) => {
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <CommandCoreFallback />;
  }

  return (
    <div className={`absolute inset-0 ${className}`}>
      <Suspense fallback={<CommandCoreFallback />}>
        <Canvas
          frameloop={isActive ? "always" : "demand"}
          camera={{ position: [0, 0, isMobile ? 16.5 : 9.8], fov: isMobile ? 46 : 48 }}
          dpr={isMobile ? [1, 1] : [1, 1.15]}
          gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
          performance={{ min: 0.65 }}
        >
          <CommandCoreScene isActive={isActive} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default CommandCore3D;
