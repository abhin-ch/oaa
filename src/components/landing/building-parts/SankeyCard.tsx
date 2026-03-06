'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

export function SankeyCard() {
  const matCard = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 }),
    [],
  );

  const flows = [
    { y: 0.25, w: 0.5, color: '#1a1a1a' },
    { y: 0.05, w: 0.35, color: '#525252' },
    { y: -0.15, w: 0.22, color: '#a3a3a3' },
  ];

  return (
    <group position={[-2.2, -1.2, 2.5]}>
      {/* Card */}
      <mesh material={matCard}>
        <boxGeometry args={[1.6, 1.1, 0.04]} />
      </mesh>
      {/* Source bars */}
      {flows.map((f, i) => (
        <mesh key={`sb${i}`} position={[-0.55 + f.w / 2, f.y, 0.03]}>
          <boxGeometry args={[f.w, 0.08, 0.02]} />
          <meshStandardMaterial color={f.color} roughness={0.7} />
        </mesh>
      ))}
      {/* Flow connectors */}
      {flows.map((f, i) => (
        <mesh key={`fc${i}`} position={[0.15, f.y, 0.03]}>
          <boxGeometry args={[0.5, 0.015, 0.01]} />
          <meshStandardMaterial color={f.color} roughness={0.7} transparent opacity={0.4} />
        </mesh>
      ))}
      {/* Destination bars */}
      {flows.map((f, i) => (
        <mesh key={`db${i}`} position={[0.55, f.y, 0.03]}>
          <boxGeometry args={[0.2, 0.015, 0.01]} />
          <meshStandardMaterial color="#d4d4d4" />
        </mesh>
      ))}
    </group>
  );
}
