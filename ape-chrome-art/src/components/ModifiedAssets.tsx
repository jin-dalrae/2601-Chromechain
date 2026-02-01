import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, MeshTransmissionMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * THE LIQUID CHROME CORE
 * High metalness, high distortion, smooth movement.
 */
export const ShinyObject = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.2;
    meshRef.current.rotation.y = t * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 128, 128]} />
        <MeshDistortMaterial
          color="#ffffff"
          metalness={1}
          roughness={0.05}
          distort={0.45}
          speed={3}
          reflectivity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </Float>
  );
};

/**
 * THE HOLOGRAPHIC PRISM
 * Uses transmission and chromatic aberration for a glass-like look.
 */
export const PrismObject = () => {
  return (
    <Float speed={4} rotationIntensity={2}>
      <mesh>
        <icosahedronGeometry args={[1.5, 15]} />
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={2}
          chromaticAberration={0.5}
          anisotropy={0.3}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.1}
          color="#ffffff"
          attenuationDistance={0.5}
          attenuationColor="#ffffff"
        />
      </mesh>
    </Float>
  );
};
