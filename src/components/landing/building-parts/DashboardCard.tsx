'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

export function DashboardCard() {
  const matCard = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 }),
    [],
  );
  const bars = [
    { x: -0.4, h: 0.55, color: '#1a1a1a' },
    { x: -0.15, h: 0.4, color: '#525252' },
    { x: 0.1, h: 0.65, color: '#a3a3a3' },
    { x: 0.35, h: 0.25, color: '#d4d4d4' },
  ];

  return (
    <group position={[3.2, 2.5, 1.8]}>
      {/* Card */}
      <mesh material={matCard}>
        <boxGeometry args={[1.4, 1.0, 0.04]} />
      </mesh>
      {/* Bars */}
      {bars.map((b, i) => (
        <mesh key={`bar${i}`} position={[b.x, b.h / 2 - 0.38, 0.03]}>
          <boxGeometry args={[0.18, b.h, 0.02]} />
          <meshStandardMaterial color={b.color} roughness={0.7} />
        </mesh>
      ))}
      {/* Axis line */}
      <mesh position={[0, -0.38, 0.03]}>
        <boxGeometry args={[1.1, 0.01, 0.01]} />
        <meshStandardMaterial color="#d4d4d4" />
      </mesh>
    </group>
  );
}
