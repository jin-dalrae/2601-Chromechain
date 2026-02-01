import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, MeshTransmissionMaterial, Float, useHelper } from "@react-three/drei";
import * as THREE from "three";

// 1. MERCURY FLOW (The Silvery Liquid Metal)
const MercuryMaterial = () => (
  <MeshDistortMaterial
    color="#ffffff"
    roughness={0}
    metalness={1}
    bumpScale={0.005}
    clearcoat={1}
    clearcoatRoughness={0}
    radius={1}
    distort={0.4}
    speed={4}
  />
);

// 2. PRISM CORE (The Holographic/Refractive look)
const PrismMaterial = () => (
  <MeshTransmissionMaterial
    backside
    samples={16}
    thickness={1.5}
    chromaticAberration={0.5}
    anisotropy={0.3}
    distortion={0.5}
    distortionScale={0.5}
    temporalDistortion={0.1}
    color="#e0f7ff"
  />
);

// 3. ETHEREAL CHROME (The Iridescent/Holographic Metal)
// This uses a custom shader logic via props
const EtherealMaterial = () => (
  <meshPhysicalMaterial
    color="#ffffff"
    metalness={1}
    roughness={0.1}
    iridescence={1}
    iridescenceIOR={1.5}
    thickness={1}
  />
);

export const AssetGallery = () => {
  return (
    <group>
      {/* Mercury Blob */}
      <Float position={[-3, 0, 0]} speed={2}>
        <mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <MercuryMaterial />
        </mesh>
      </Float>

      {/* Prism Crystal */}
      <Float position={[0, 0, 0]} speed={3}>
        <mesh>
          <icosahedronGeometry args={[1, 15]} />
          <PrismMaterial />
        </mesh>
      </Float>

      {/* Ethereal Chrome Sphere */}
      <Float position={[3, 0, 0]} speed={1.5}>
        <mesh>
          <torusKnotGeometry args={[0.7, 0.2, 128, 32]} />
          <EtherealMaterial />
        </mesh>
      </Float>
    </group>
  );
};
