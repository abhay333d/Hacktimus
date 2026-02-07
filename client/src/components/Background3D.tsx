import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, PerspectiveCamera } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function AnimatedStars() {
  const starsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      starsRef.current.rotation.x = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group ref={starsRef}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

function FloatingShapes() {
    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
             <mesh position={[-5, 2, -10]} rotation={[0, 0.5, 0]}>
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#6366f1" wireframe />
            </mesh>
            <mesh position={[7, -3, -15]} rotation={[0.5, 0, 0]}>
                <octahedronGeometry args={[1.5, 0]} />
                <meshStandardMaterial color="#8b5cf6" wireframe />
            </mesh>
             <mesh position={[0, 5, -20]} rotation={[0.2, 0.2, 0]}>
                <dodecahedronGeometry args={[2, 0]} />
                <meshStandardMaterial color="#3b82f6" wireframe opacity={0.3} transparent />
            </mesh>
        </Float>
    )
}

export function Background3D() {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-b from-gray-900 to-black">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <AnimatedStars />
        <FloatingShapes />
        <fog attach="fog" args={['#111827', 5, 30]} />
      </Canvas>
    </div>
  );
}
