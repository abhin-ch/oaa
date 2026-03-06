'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { COLOR } from './materials';

export function SolarPanels() {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COLOR.DARK, roughness: 0.5, metalness: 0.15 }),
    [],
  );
  const matFrame = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COLOR.DARK_GRAY, roughness: 0.7 }),
    [],
  );

  const positions: [number, number][] = [
    [-0.8, -0.3],
    [0, -0.3],
    [0.8, -0.3],
    [-0.8, 0.3],
    [0, 0.3],
    [0.8, 0.3],
  ];

  return (
    <group position={[0, 4.2, 0]}>
      {positions.map(([x, z], i) => (
        <group key={`sp${i}`} position={[x, 0, z]}>
          <mesh rotation={[-0.3, 0, 0]} material={mat}>
            <boxGeometry args={[0.7, 0.03, 0.45]} />
          </mesh>
          {/* Grid lines on panel */}
          <mesh position={[0, -0.02, 0]} rotation={[-0.3, 0, 0]} material={matFrame}>
            <boxGeometry args={[0.01, 0.04, 0.45]} />
          </mesh>
          <mesh position={[0, -0.02, 0]} rotation={[-0.3, 0, 0]} material={matFrame}>
            <boxGeometry args={[0.7, 0.04, 0.01]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
