'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Edges } from '@react-three/drei';

export function FloorPlanCard() {
  const matCard = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 }),
    [],
  );
  const matGrid = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#e8e8e8', roughness: 0.9 }),
    [],
  );

  return (
    <group position={[2.8, -1.2, 2.2]}>
      {/* Card */}
      <mesh material={matCard}>
        <boxGeometry args={[1.5, 1.2, 0.04]} />
      </mesh>

      {/* Grid lines vertical */}
      {[-0.5, -0.25, 0, 0.25, 0.5].map((x, i) => (
        <mesh key={`gv${i}`} position={[x, 0, 0.03]} material={matGrid}>
          <boxGeometry args={[0.008, 0.9, 0.005]} />
        </mesh>
      ))}
      {/* Grid lines horizontal */}
      {[-0.3, -0.1, 0.1, 0.3].map((y, i) => (
        <mesh key={`gh${i}`} position={[0, y, 0.03]} material={matGrid}>
          <boxGeometry args={[1.2, 0.008, 0.005]} />
        </mesh>
      ))}

      {/* Room outlines */}
      <mesh position={[-0.25, 0.2, 0.035]}>
        <boxGeometry args={[0.55, 0.4, 0.005]} />
        <meshStandardMaterial color="#ffffff" />
        <Edges color="#1a1a1a" threshold={15} />
      </mesh>
      <mesh position={[0.3, 0.25, 0.035]}>
        <boxGeometry args={[0.5, 0.3, 0.005]} />
        <meshStandardMaterial color="#ffffff" />
        <Edges color="#1a1a1a" threshold={15} />
      </mesh>
      <mesh position={[0, -0.2, 0.035]}>
        <boxGeometry args={[1.1, 0.35, 0.005]} />
        <meshStandardMaterial color="#ffffff" />
        <Edges color="#1a1a1a" threshold={15} />
      </mesh>
    </group>
  );
}
