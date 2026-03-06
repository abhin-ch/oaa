'use client';

import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { COLOR, MAT } from './materials';

export function EnergyMeter() {
  const matScreen = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COLOR.VERY_DARK, roughness: 0.5 }),
    [],
  );
  const matGauge = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COLOR.LIGHT, roughness: 0.8 }),
    [],
  );
  const matGaugeFill = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COLOR.DARK, roughness: 0.6 }),
    [],
  );

  return (
    <group position={[-3.2, 2.2, -0.8]}>
      {/* Card */}
      <mesh material={MAT.card}>
        <boxGeometry args={[1.1, 1.4, 0.05]} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0.28, 0.03]} material={matScreen}>
        <boxGeometry args={[0.8, 0.45, 0.02]} />
      </mesh>
      {/* Number */}
      <Text
        position={[0, 0.28, 0.06]}
        fontSize={0.28}
        color="#fafafa"
        font="/fonts/GeistMono-Variable.woff2"
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
      >
        142
      </Text>
      {/* Unit label */}
      <Text
        position={[0, -0.05, 0.04]}
        fontSize={0.1}
        color="#a3a3a3"
        anchorX="center"
        anchorY="middle"
      >
        kWh/m²/yr
      </Text>
      {/* Gauge background */}
      <mesh position={[0, -0.35, 0.03]} rotation={[0, 0, 0]} material={matGauge}>
        <ringGeometry args={[0.2, 0.25, 32, 1, 0, Math.PI]} />
      </mesh>
      {/* Gauge fill */}
      <mesh position={[0, -0.35, 0.04]} material={matGaugeFill}>
        <ringGeometry args={[0.2, 0.25, 32, 1, 0, Math.PI * 0.65]} />
      </mesh>
    </group>
  );
}
