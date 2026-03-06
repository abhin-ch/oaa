'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import * as THREE from 'three';
import { COLOR, MAT } from './materials';

export function HVACUnit() {
  const fanRef = useRef<Group>(null);
  const matTop = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COLOR.MEDIUM, roughness: 0.8 }),
    [],
  );
  const matFan = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COLOR.DARK_GRAY, roughness: 0.7 }),
    [],
  );

  useFrame((_, delta) => {
    if (fanRef.current) fanRef.current.rotation.z += delta * 3;
  });

  return (
    <group position={[3.5, 1, -1.5]}>
      {/* Body */}
      <mesh material={MAT.light}>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
      </mesh>
      {/* Top accent */}
      <mesh position={[0, 0.31, 0]} material={matTop}>
        <boxGeometry args={[0.7, 0.02, 0.7]} />
      </mesh>
      {/* Fan housing */}
      <mesh position={[0, 0, 0.41]} rotation={[Math.PI / 2, 0, 0]} material={matFan}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 16]} />
      </mesh>
      {/* Fan blades */}
      <group ref={fanRef} position={[0, 0, 0.43]}>
        {[0, Math.PI / 4, Math.PI / 2, (Math.PI * 3) / 4].map((r, i) => (
          <mesh key={`fb${i}`} rotation={[0, 0, r]} material={matTop}>
            <boxGeometry args={[0.3, 0.02, 0.01]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
