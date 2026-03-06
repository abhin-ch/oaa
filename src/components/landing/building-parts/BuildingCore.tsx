'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { COLOR, MAT } from './materials';

export function BuildingCore() {
  const matGlass = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COLOR.GLASS, roughness: 0.3, metalness: 0.15 }),
    [],
  );
  const matRoof = useMemo(
    () =>
      new THREE.MeshStandardMaterial({ color: COLOR.CHARCOAL, roughness: 0.55, metalness: 0.1 }),
    [],
  );

  // Gable triangle geometry
  const gableGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const verts = new Float32Array([0, 0, -1.25, 0, 0, 1.25, 0, 0.7, 0]);
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      {/* Foundation */}
      <mesh position={[0, -0.075, 0]} material={MAT.light}>
        <boxGeometry args={[3, 0.15, 2.5]} />
      </mesh>

      {/* Walls */}
      <mesh position={[-1.46, 1, 0]} material={MAT.card}>
        <boxGeometry args={[0.08, 2, 2.5]} />
      </mesh>
      <mesh position={[1.46, 1, 0]} material={MAT.light}>
        <boxGeometry args={[0.08, 2, 2.5]} />
      </mesh>
      <mesh position={[0, 1, -1.21]} material={MAT.card}>
        <boxGeometry args={[3, 2, 0.08]} />
      </mesh>
      <mesh position={[0, 1, 1.21]} material={MAT.light}>
        <boxGeometry args={[3, 2, 0.08]} />
      </mesh>

      {/* Front wall windows */}
      {(
        [
          [-0.8, 1.4],
          [0, 1.4],
          [0.8, 1.4],
        ] as [number, number][]
      ).map(([x, y], i) => (
        <mesh key={`fw${i}`} position={[x, y, 1.25]} material={matGlass}>
          <boxGeometry args={[0.5, 0.6, 0.02]} />
        </mesh>
      ))}
      {(
        [
          [-0.8, 0.6],
          [0.8, 0.6],
        ] as [number, number][]
      ).map(([x, y], i) => (
        <mesh key={`fw2${i}`} position={[x, y, 1.25]} material={matGlass}>
          <boxGeometry args={[0.5, 0.5, 0.02]} />
        </mesh>
      ))}

      {/* Left wall windows */}
      {(
        [
          [-0.4, 1.4],
          [0.4, 1.4],
        ] as [number, number][]
      ).map(([z, y], i) => (
        <mesh key={`lw${i}`} position={[-1.5, y, z]} material={matGlass}>
          <boxGeometry args={[0.02, 0.6, 0.5]} />
        </mesh>
      ))}
      {(
        [
          [-0.4, 0.6],
          [0.4, 0.6],
        ] as [number, number][]
      ).map(([z, y], i) => (
        <mesh key={`lw2${i}`} position={[-1.5, y, z]} material={matGlass}>
          <boxGeometry args={[0.02, 0.5, 0.5]} />
        </mesh>
      ))}

      {/* Door */}
      <mesh position={[0, 0.45, 1.26]} material={MAT.dark}>
        <boxGeometry args={[0.45, 0.9, 0.03]} />
      </mesh>

      {/* Roof - front slope */}
      <mesh position={[0, 2.35, 0.55]} rotation={[-0.35, 0, 0]} material={MAT.dark}>
        <boxGeometry args={[3.2, 0.08, 1.5]} />
      </mesh>
      {/* Roof - back slope */}
      <mesh position={[0, 2.35, -0.55]} rotation={[0.35, 0, 0]} material={matRoof}>
        <boxGeometry args={[3.2, 0.08, 1.5]} />
      </mesh>
      {/* Gable end */}
      <mesh position={[-1.56, 2, 0]} geometry={gableGeo} material={matRoof} />
      {/* Ridge */}
      <mesh position={[0, 2.7, 0]} material={MAT.dark}>
        <boxGeometry args={[3.2, 0.04, 0.04]} />
      </mesh>
    </group>
  );
}
