import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, GradientTexture, Float } from "@react-three/drei";
import * as THREE from "three";

export const ShinyObject = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.015;
  });

  return (
    <Float speed={3} rotationIntensity={2} floatIntensity={2}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 128, 128]} />
        <MeshDistortMaterial
          speed={2}
          distort={0.4}
          radius={1}
        >
          <GradientTexture
            stops={[0, 0.5, 1]}
            colors={['#ff0080', '#7a00ff', '#00ffcc']}
            size={1024}
          />
        </MeshDistortMaterial>
      </mesh>
    </Float>
  );
};
