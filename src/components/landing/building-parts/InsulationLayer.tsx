'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

export function InsulationLayer() {
  const matCard = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 }),
    [],
  );
  const matExterior = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.6 }),
    [],
  );
  const matInsul = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#e5e5e5', roughness: 0.85 }),
    [],
  );
  const matStruct = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#a3a3a3', roughness: 0.8 }),
    [],
  );
  const matLine = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#d4d4d4', roughness: 0.9 }),
    [],
  );

  return (
    <group position={[-3.8, 0.2, 1.8]}>
      {/* Card base */}
      <mesh material={matCard}>
        <boxGeometry args={[1.3, 1.6, 0.04]} />
      </mesh>
      {/* Wall layers */}
      <mesh position={[-0.35, 0, 0.03]} material={matExterior}>
        <boxGeometry args={[0.1, 1.2, 0.03]} />
      </mesh>
      <mesh position={[-0.15, 0, 0.03]} material={matInsul}>
        <boxGeometry args={[0.22, 1.2, 0.03]} />
      </mesh>
      <mesh position={[0.05, 0, 0.03]} material={matStruct}>
        <boxGeometry args={[0.1, 1.2, 0.03]} />
      </mesh>
      <mesh position={[0.18, 0, 0.03]} material={matCard}>
        <boxGeometry args={[0.08, 1.2, 0.03]} />
      </mesh>
      {/* Label lines */}
      {[0.3, 0, -0.3].map((y, i) => (
        <mesh key={`ll${i}`} position={[0.4, y, 0.03]} material={matLine}>
          <boxGeometry args={[0.3, 0.02, 0.005]} />
        </mesh>
      ))}
    </group>
  );
}
