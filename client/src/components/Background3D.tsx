import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import earthVertexShader from "./shaders/earth/vertex.glsl?raw";
import earthFragmentShader from "./shaders/earth/fragment.glsl?raw";
import atmosphereVertexShader from "./shaders/atmosphere/vertex.glsl?raw";
import atmosphereFragmentShader from "./shaders/atmosphere/fragment.glsl?raw";


// --- Components ---
function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Load textures
  const [dayTexture, nightTexture, specularCloudsTexture] = useLoader(THREE.TextureLoader, [
    '/earth/day.jpg',
    '/earth/night.jpg',
    '/earth/specularClouds.jpg',
  ]);

  // Configure textures
  useMemo(() => {
    dayTexture.colorSpace = THREE.SRGBColorSpace;
    dayTexture.anisotropy = 16;
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.anisotropy = 16;
    specularCloudsTexture.anisotropy = 16;
  }, [dayTexture, nightTexture, specularCloudsTexture]);

  // Parameters
  const earthParameters = {
    atmosphereDayColor: '#00aaff',
    atmosphereTwilightColor: '#ff6600',
  };

  // Sun
  const sunShpere = new THREE.Spherical(1, Math.PI * 0.5, 0.5);
  const sunDirection = new THREE.Vector3();
  
  // Set sun direction
  sunDirection.setFromSpherical(sunShpere);

  // Uniforms
  const earthUniforms = useMemo(
    () => ({
      uDayTexture: { value: dayTexture },
      uNightTexture: { value: nightTexture },
      uSpecularCloudsTexture: { value: specularCloudsTexture },
      uSunDirection: { value: new THREE.Vector3(0, 0, 1) },
      uAtmosphereDayColor: { value: new THREE.Color(earthParameters.atmosphereDayColor) },
      uAtmosphereTwilightColor: { value: new THREE.Color(earthParameters.atmosphereTwilightColor) },
    }),
    [dayTexture, nightTexture, specularCloudsTexture]
  );

  const atmosphereUniforms = useMemo(
    () => ({
      uSunDirection: { value: new THREE.Vector3(0, 0, 1) },
      uAtmosphereDayColor: { value: new THREE.Color(earthParameters.atmosphereDayColor) },
      uAtmosphereTwilightColor: { value: new THREE.Color(earthParameters.atmosphereTwilightColor) },
    }),
    []
  );

  useFrame((state) => {
    // Rotation
    if (earthRef.current) {
      earthRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }

    earthUniforms.uSunDirection.value.copy(sunDirection);
    atmosphereUniforms.uSunDirection.value.copy(sunDirection);
  });

  return (
    <group>
      <mesh ref={earthRef} geometry={new THREE.SphereGeometry(2, 64, 64)}>
        <shaderMaterial
          vertexShader={earthVertexShader}
          fragmentShader={earthFragmentShader}
          uniforms={earthUniforms}
        />
      </mesh>
      <mesh 
        ref={atmosphereRef} 
        scale={[1.04, 1.04, 1.04]} 
        geometry={new THREE.SphereGeometry(2, 64, 64)}
      >
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={atmosphereUniforms}
          side={THREE.BackSide}
          transparent={true}
        />
      </mesh>
    </group>
  );
}


export function Background3D() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#000005]">
      <Canvas
        camera={{
          fov: 25,
          position: [12, 5, 4],
          near: 0.1,
          far: 1000,
        }}
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
        gl={{
            antialias: true,
        }}
      >
        <OrbitControls enableDamping />
        <Suspense fallback={null}>
          <Earth />
        </Suspense>
        <Stars radius={100} depth={50} count={10000} factor={6} saturation={0} fade speed={2} />
      </Canvas>
    </div>
  );
}
