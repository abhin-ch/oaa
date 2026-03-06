'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { COLOR, MAT } from './materials';

export function InsulationLayer() {
  const matStruct = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COLOR.MEDIUM, roughness: 0.8 }),
    [],
  );
  const matLine = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COLOR.LIGHT_ACCENT, roughness: 0.9 }),
    [],
  );

  return (
    <group position={[-3.8, 0.2, 1.8]}>
      {/* Card base */}
      <mesh material={MAT.card}>
        <boxGeometry args={[1.3, 1.6, 0.04]} />
      </mesh>
      {/* Wall layers */}
      <mesh position={[-0.35, 0, 0.03]} material={MAT.dark}>
        <boxGeometry args={[0.1, 1.2, 0.03]} />
      </mesh>
      <mesh position={[-0.15, 0, 0.03]} material={MAT.light}>
        <boxGeometry args={[0.22, 1.2, 0.03]} />
      </mesh>
      <mesh position={[0.05, 0, 0.03]} material={matStruct}>
        <boxGeometry args={[0.1, 1.2, 0.03]} />
      </mesh>
      <mesh position={[0.18, 0, 0.03]} material={MAT.card}>
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
