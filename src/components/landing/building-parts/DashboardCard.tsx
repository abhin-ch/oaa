'use client';

import { COLOR, MAT } from './materials';

export function DashboardCard() {
  const bars = [
    { x: -0.4, h: 0.55, color: COLOR.DARK },
    { x: -0.15, h: 0.4, color: COLOR.DARK_GRAY },
    { x: 0.1, h: 0.65, color: COLOR.MEDIUM },
    { x: 0.35, h: 0.25, color: COLOR.LIGHT_ACCENT },
  ];

  return (
    <group position={[3.2, 2.5, 1.8]}>
      {/* Card */}
      <mesh material={MAT.card}>
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
