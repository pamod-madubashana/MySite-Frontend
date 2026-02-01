import { Suspense, useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';
import { easing } from 'maath';

// ============================================
// CONFIGURATION - Tune these values easily
// ============================================
const CONFIG = {
  // Panel starting positions (how far each panel starts from center)
  panelOffsets: {
    front:  { pos: [0, 0, 4],    rot: [0.3, 0, 0.1] },
    back:   { pos: [0, 0, -4],   rot: [-0.2, Math.PI, -0.15] },
    left:   { pos: [-4, 0, 0],   rot: [0.1, -0.3, 0.2] },
    right:  { pos: [4, 0, 0],    rot: [-0.1, 0.4, -0.1] },
    top:    { pos: [0, 4, 0],    rot: [0.2, 0.1, 0.15] },
    bottom: { pos: [0, -4, 0],   rot: [-0.25, -0.1, 0.1] },
  } as Record<string, { pos: number[], rot: number[] }>,
  
  // Animation timing
  introDuration: 1.6,        // Total intro duration in seconds
  phaseARatio: 0.7,          // Phase A (acceleration) takes 70% of intro
  staggerDelay: 0.08,        // Delay between each panel (seconds)
  
  // Easing & overshoot
  overshootAmount: 0.12,     // How much panels overshoot before settling
  settleSpeed: 8,            // Speed of settling after overshoot
  
  // Glow intensity
  baseEmissive: 0.4,
  hoverEmissive: 0.7,
  clickEmissive: 1.2,
  assemblyEmissive: 0.8,     // Glow during assembly animation
  
  // Colors
  baseCyan: '#4fd1ff',
  clickViolet: '#7c5cff',
  
  // Idle animation
  idleRotationSpeed: 0.1,
  floatIntensity: 0.3,
  floatSpeed: 2,
};

// Panel face definitions - positions and rotations for each cube face
const PANEL_FACES = [
  { name: 'front',  finalPos: [0, 0, 1],  finalRot: [0, 0, 0] },
  { name: 'back',   finalPos: [0, 0, -1], finalRot: [0, Math.PI, 0] },
  { name: 'left',   finalPos: [-1, 0, 0], finalRot: [0, -Math.PI / 2, 0] },
  { name: 'right',  finalPos: [1, 0, 0],  finalRot: [0, Math.PI / 2, 0] },
  { name: 'top',    finalPos: [0, 1, 0],  finalRot: [-Math.PI / 2, 0, 0] },
  { name: 'bottom', finalPos: [0, -1, 0], finalRot: [Math.PI / 2, 0, 0] },
];

// Types
interface CubeState {
  isHovered: boolean;
  isClicked: boolean;
  assemblyComplete: boolean;
}

// Color instances
const COLORS = {
  baseCyan: new THREE.Color(CONFIG.baseCyan),
  clickViolet: new THREE.Color(CONFIG.clickViolet),
};

// Scroll hook
function useScrollProgress() {
  const [scroll, setScroll] = useState({ progress: 0, velocity: 0 });
  const lastScrollY = useRef(0);

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min(scrollY / Math.max(maxScroll, 1), 1);
        const velocity = scrollY - lastScrollY.current;
        lastScrollY.current = scrollY;
        setScroll({ progress, velocity: THREE.MathUtils.clamp(velocity / 100, -1, 1) });
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return scroll;
}

// Easing function with overshoot (spring-like)
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Smooth easing for Phase A
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Individual panel component
interface PanelProps {
  face: typeof PANEL_FACES[0];
  index: number;
  cubeState: CubeState;
  globalTime: number;
  onAssemblyComplete: () => void;
}

function CubePanel({ face, index, cubeState, globalTime, onAssemblyComplete }: PanelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  const staggeredDelay = index * CONFIG.staggerDelay;
  const startConfig = CONFIG.panelOffsets[face.name];
  
  // Animation state
  const animState = useRef({
    startPos: new THREE.Vector3(...startConfig.pos),
    startRot: new THREE.Euler(...startConfig.rot),
    currentPos: new THREE.Vector3(...startConfig.pos),
    currentRot: new THREE.Euler(...startConfig.rot),
    emissiveIntensity: 0,
    hasCompletedAssembly: false,
  });

  const currentColor = useRef(COLORS.baseCyan.clone());
  const targetColor = useRef(COLORS.baseCyan.clone());
  const clickFlashTime = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    
    const anim = animState.current;
    const adjustedTime = Math.max(0, globalTime - staggeredDelay);
    const introProgress = Math.min(adjustedTime / CONFIG.introDuration, 1);
    
    // Calculate target position and rotation
    const targetPos = new THREE.Vector3();
    const targetRot = new THREE.Euler();
    
    if (introProgress < 1) {
      // Assembly animation
      const phaseAEnd = CONFIG.phaseARatio;
      
      if (introProgress < phaseAEnd) {
        // Phase A: Fast acceleration toward center
        const phaseAProgress = introProgress / phaseAEnd;
        const eased = easeOutCubic(phaseAProgress);
        
        targetPos.lerpVectors(
          anim.startPos,
          new THREE.Vector3(...face.finalPos),
          eased
        );
        
        targetRot.set(
          THREE.MathUtils.lerp(anim.startRot.x, face.finalRot[0], eased),
          THREE.MathUtils.lerp(anim.startRot.y, face.finalRot[1], eased),
          THREE.MathUtils.lerp(anim.startRot.z, face.finalRot[2], eased)
        );
        
        // Ramp up emissive during movement (motion blur effect)
        const distanceToTarget = targetPos.distanceTo(new THREE.Vector3(...face.finalPos));
        anim.emissiveIntensity = CONFIG.assemblyEmissive * (distanceToTarget / 4);
      } else {
        // Phase B: Overshoot and settle
        const phaseBProgress = (introProgress - phaseAEnd) / (1 - phaseAEnd);
        const settleEased = easeOutBack(phaseBProgress);
        
        // Calculate overshoot direction (away from center, then back)
        const finalPosVec = new THREE.Vector3(...face.finalPos);
        const overshootDir = finalPosVec.clone().normalize();
        const overshootOffset = Math.sin(phaseBProgress * Math.PI) * CONFIG.overshootAmount;
        
        targetPos.copy(finalPosVec).add(overshootDir.multiplyScalar(overshootOffset * (1 - phaseBProgress)));
        
        targetRot.set(
          face.finalRot[0] + Math.sin(phaseBProgress * Math.PI * 2) * 0.05 * (1 - phaseBProgress),
          face.finalRot[1] + Math.cos(phaseBProgress * Math.PI * 2) * 0.03 * (1 - phaseBProgress),
          face.finalRot[2]
        );
        
        // Settle emissive
        anim.emissiveIntensity = THREE.MathUtils.lerp(
          CONFIG.assemblyEmissive,
          CONFIG.baseEmissive,
          settleEased
        );
      }
    } else {
      // Assembly complete - snap to final position
      if (!anim.hasCompletedAssembly) {
        anim.hasCompletedAssembly = true;
        onAssemblyComplete();
      }
      
      targetPos.set(face.finalPos[0], face.finalPos[1], face.finalPos[2]);
      targetRot.set(face.finalRot[0], face.finalRot[1], face.finalRot[2]);
      
      // Base emissive after assembly
      let targetEmissive = CONFIG.baseEmissive;
      
      // Hover effect
      if (cubeState.isHovered) {
        targetEmissive = CONFIG.hoverEmissive;
      }
      
      // Click effect
      if (cubeState.isClicked) {
        clickFlashTime.current = 0.35;
        targetColor.current.copy(COLORS.clickViolet);
      }
      
      if (clickFlashTime.current > 0) {
        clickFlashTime.current -= delta;
        targetEmissive = CONFIG.clickEmissive;
      } else {
        targetColor.current.lerp(COLORS.baseCyan, delta * 4);
      }
      
      anim.emissiveIntensity = THREE.MathUtils.lerp(anim.emissiveIntensity, targetEmissive, delta * 6);
    }
    
    // Smooth interpolation
    easing.damp3(anim.currentPos, targetPos, 0.15, delta);
    
    // Rotation interpolation
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRot.x, delta * CONFIG.settleSpeed);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRot.y, delta * CONFIG.settleSpeed);
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRot.z, delta * CONFIG.settleSpeed);
    
    // Apply position
    meshRef.current.position.copy(anim.currentPos);
    
    // Update material
    currentColor.current.lerp(targetColor.current, delta * 6);
    materialRef.current.emissive.copy(currentColor.current);
    materialRef.current.emissiveIntensity = anim.emissiveIntensity;
  });

  return (
    <mesh ref={meshRef} position={startConfig.pos as [number, number, number]}>
      {/* Thin box for panel with slight depth */}
      <boxGeometry args={[1.98, 1.98, 0.08]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#1a2a3a"
        metalness={0.9}
        roughness={0.15}
        emissive={COLORS.baseCyan}
        emissiveIntensity={0}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
}

// Glowing edges overlay for premium look
function GlowingEdges({ cubeState, globalTime }: { cubeState: CubeState; globalTime: number }) {
  const edgesRef = useRef<THREE.LineSegments>(null);
  const introComplete = globalTime > CONFIG.introDuration + CONFIG.staggerDelay * 6;
  
  const edgesGeometry = useMemo(() => 
    new THREE.EdgesGeometry(new THREE.BoxGeometry(2.02, 2.02, 2.02)), 
  []);

  useFrame((_, delta) => {
    if (!edgesRef.current) return;
    
    const mat = edgesRef.current.material as THREE.LineBasicMaterial;
    let targetOpacity = introComplete ? 0.8 : 0.3;
    
    if (cubeState.isHovered && introComplete) {
      targetOpacity = 1;
    }
    
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 4);
  });

  return (
    <lineSegments ref={edgesRef}>
      <primitive object={edgesGeometry} attach="geometry" />
      <lineBasicMaterial color={CONFIG.baseCyan} transparent opacity={0.3} linewidth={2} />
    </lineSegments>
  );
}

// Spark effect at assembly completion
function AssemblySpark({ trigger }: { trigger: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const [active, setActive] = useState(false);
  const startTime = useRef(0);

  useEffect(() => {
    if (trigger) {
      setActive(true);
      startTime.current = 0;
    }
  }, [trigger]);

  useFrame((_, delta) => {
    if (!lightRef.current || !active) return;
    
    startTime.current += delta;
    const progress = startTime.current / 0.4;
    
    if (progress >= 1) {
      setActive(false);
      lightRef.current.intensity = 0;
      return;
    }
    
    // Quick flash up, slow fade down
    const intensity = progress < 0.2 
      ? progress / 0.2 * 3 
      : 3 * (1 - (progress - 0.2) / 0.8);
    
    lightRef.current.intensity = intensity;
  });

  return <pointLight ref={lightRef} position={[0, 0, 0]} color={CONFIG.baseCyan} intensity={0} distance={5} />;
}

// Click ripple effect
function ClickRipple({ active }: { active: boolean }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const [visible, setVisible] = useState(false);
  const startTime = useRef(0);

  useEffect(() => {
    if (active) {
      setVisible(true);
      startTime.current = 0;
    }
  }, [active]);

  useFrame((_, delta) => {
    if (!ringRef.current || !visible) return;
    
    startTime.current += delta;
    const progress = startTime.current / 0.5;
    
    if (progress >= 1) {
      setVisible(false);
      return;
    }

    const scale = 1 + progress * 2.5;
    const opacity = (1 - progress) * 0.6;
    
    ringRef.current.scale.setScalar(scale);
    (ringRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
  });

  if (!visible) return null;

  return (
    <mesh ref={ringRef} rotation={[0, 0, 0]}>
      <ringGeometry args={[0.9, 1.1, 32]} />
      <meshBasicMaterial color={CONFIG.clickViolet} transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Particle field for atmosphere
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 120;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 12;
      pos[i + 1] = (Math.random() - 0.5) * 12;
      pos[i + 2] = (Math.random() - 0.5) * 12;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color={CONFIG.baseCyan}
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}

// Main cube group with all panels
function AssemblingCube({ cubeState, onHover, onClick, scrollState }: {
  cubeState: CubeState;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
  scrollState: { progress: number; velocity: number };
}) {
  const groupRef = useRef<THREE.Group>(null);
  const globalTime = useRef(0);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [assemblyComplete, setAssemblyComplete] = useState(false);
  const [sparkTrigger, setSparkTrigger] = useState(false);
  const completedPanels = useRef(0);

  const handlePanelComplete = useCallback(() => {
    completedPanels.current += 1;
    if (completedPanels.current >= 6 && !assemblyComplete) {
      setAssemblyComplete(true);
      setSparkTrigger(true);
    }
  }, [assemblyComplete]);

  useFrame((state, delta) => {
    globalTime.current += delta;
    
    if (!groupRef.current) return;
    
    const isComplete = globalTime.current > CONFIG.introDuration + CONFIG.staggerDelay * 6 + 0.3;
    
    if (isComplete) {
      // Idle rotation after assembly
      const idleTime = globalTime.current - CONFIG.introDuration;
      
      // Subtle idle rotation
      const targetRotY = idleTime * CONFIG.idleRotationSpeed + scrollState.progress * 0.5;
      const targetRotX = Math.sin(idleTime * 0.3) * 0.1 + scrollState.progress * 0.2;
      
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 2);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 2);
      
      // Scroll parallax
      const scrollOffset = scrollState.progress * 0.5;
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, scrollOffset, delta * 3);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -scrollOffset * 0.3, delta * 3);
    }
    
    // Hover scale
    const targetScale = cubeState.isHovered && isComplete ? 1.02 : 1;
    
    // Click pulse
    if (cubeState.isClicked && isComplete) {
      const pulseScale = 1.06;
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, pulseScale, delta * 15));
    } else {
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 8));
    }
    
    // Force re-render for time updates
    if (Math.floor(globalTime.current * 60) !== forceUpdate) {
      setForceUpdate(Math.floor(globalTime.current * 60));
    }
  });

  return (
    <Float
      speed={CONFIG.floatSpeed}
      rotationIntensity={0}
      floatIntensity={assemblyComplete ? CONFIG.floatIntensity : 0}
    >
      <group
        ref={groupRef}
        onPointerOver={(e) => { e.stopPropagation(); onHover(true); }}
        onPointerOut={(e) => { e.stopPropagation(); onHover(false); }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        {PANEL_FACES.map((face, index) => (
          <CubePanel
            key={face.name}
            face={face}
            index={index}
            cubeState={cubeState}
            globalTime={globalTime.current}
            onAssemblyComplete={handlePanelComplete}
          />
        ))}
        
        <GlowingEdges cubeState={cubeState} globalTime={globalTime.current} />
        <AssemblySpark trigger={sparkTrigger} />
      </group>
    </Float>
  );
}

// Scene component
function Scene({ onCubeClick }: { onCubeClick?: () => void }) {
  const [cubeState, setCubeState] = useState<CubeState>({
    isHovered: false,
    isClicked: false,
    assemblyComplete: false,
  });
  const [clickTrigger, setClickTrigger] = useState(0);
  const scrollState = useScrollProgress();
  const { gl } = useThree();

  useEffect(() => {
    gl.domElement.style.cursor = cubeState.isHovered ? 'pointer' : 'default';
  }, [cubeState.isHovered, gl]);

  const handleHover = useCallback((hovered: boolean) => {
    setCubeState(prev => ({ ...prev, isHovered: hovered }));
  }, []);

  const handleClick = useCallback(() => {
    setCubeState(prev => ({ ...prev, isClicked: true }));
    setClickTrigger(prev => prev + 1);
    onCubeClick?.();
    
    setTimeout(() => {
      setCubeState(prev => ({ ...prev, isClicked: false }));
    }, 350);
  }, [onCubeClick]);

  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 5, 3]} intensity={0.5} color="#ffffff" />
      <directionalLight position={[-3, 2, -2]} intensity={0.25} color="#7c5cff" />
      <pointLight position={[0, 0, 4]} intensity={0.3} color="#4fd1ff" />

      <PerspectiveCamera makeDefault position={[0, 0, 5.5]} fov={45} />

      <AssemblingCube
        cubeState={cubeState}
        onHover={handleHover}
        onClick={handleClick}
        scrollState={scrollState}
      />
      
      <ClickRipple active={clickTrigger > 0} key={clickTrigger} />
      <ParticleField />
    </>
  );
}

// Loading spinner
function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

// Main exported component
interface HeroCube3DProps {
  className?: string;
  onCubeClick?: () => void;
}

export default function HeroCube3D({ className = '', onCubeClick }: HeroCube3DProps) {
  return (
    <div 
      className={`absolute inset-0 z-0 ${className}`}
      style={{ pointerEvents: 'none' }}
    >
      <div 
        className="w-full h-full"
        style={{ pointerEvents: 'auto' }}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <Canvas
            dpr={[1, 1.5]}
            gl={{ 
              antialias: true, 
              alpha: true,
              powerPreference: 'high-performance',
            }}
            style={{ background: 'transparent' }}
          >
            <Scene onCubeClick={onCubeClick} />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}
