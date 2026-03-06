'use client';

import { useEffect, useState, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { BuildingCore } from './building-parts/BuildingCore';
import { SolarPanels } from './building-parts/SolarPanels';
import { HVACUnit } from './building-parts/HVACUnit';
import { EnergyMeter } from './building-parts/EnergyMeter';
import { DashboardCard } from './building-parts/DashboardCard';
import { SankeyCard } from './building-parts/SankeyCard';
import { FloorPlanCard } from './building-parts/FloorPlanCard';
import { InsulationLayer } from './building-parts/InsulationLayer';
import { FloatingWrapper } from './building-parts/FloatingWrapper';

function IsometricCamera() {
  const { camera } = useThree();
  const initialized = useRef(false);

  /* eslint-disable react-hooks/immutability -- Three.js camera requires direct mutation */
  if (!initialized.current) {
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 1, 0);
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = 55;
      camera.updateProjectionMatrix();
    }
    initialized.current = true;
  }
  /* eslint-enable react-hooks/immutability */

  return null;
}

export function IsometricBuilding() {
  const [mounted, setMounted] = useState(false);
  /* eslint-disable react-hooks/set-state-in-effect -- client mount guard */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!mounted) return null;

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        orthographic
        gl={{ antialias: true }}
        camera={{ position: [10, 10, 10], zoom: 55, near: 0.1, far: 100 }}
        style={{ width: '100%', height: '100%', background: '#f5f5f5' }}
      >
        <IsometricCamera />
        <ambientLight intensity={0.7} />
        <directionalLight position={[8, 12, 5]} intensity={0.9} />
        <directionalLight position={[-4, 6, -3]} intensity={0.3} />

        <group rotation={[0, -Math.PI / 6, 0]}>
          <FloatingWrapper delay={0.2} floatAmp={0.05} floatSpeed={0.8}>
            <BuildingCore />
          </FloatingWrapper>

          <FloatingWrapper delay={0.5} floatAmp={0.1} floatSpeed={0.7} entryOffset={[0, 2, 0]}>
            <SolarPanels />
          </FloatingWrapper>

          <FloatingWrapper delay={0.7} floatAmp={0.06} floatSpeed={0.9}>
            <HVACUnit />
          </FloatingWrapper>

          <FloatingWrapper delay={0.4} floatAmp={0.07} floatSpeed={1.1} entryOffset={[-1.5, 1, 0]}>
            <EnergyMeter />
          </FloatingWrapper>

          <FloatingWrapper delay={0.6} floatAmp={0.08} floatSpeed={0.9} entryOffset={[1.5, 1, 0]}>
            <DashboardCard />
          </FloatingWrapper>

          <FloatingWrapper delay={0.8} floatAmp={0.06} floatSpeed={1.0} entryOffset={[-1, -1.5, 0]}>
            <SankeyCard />
          </FloatingWrapper>

          <FloatingWrapper delay={0.9} floatAmp={0.07} floatSpeed={0.85} entryOffset={[1, -1.5, 0]}>
            <FloorPlanCard />
          </FloatingWrapper>

          <FloatingWrapper delay={0.5} floatAmp={0.06} floatSpeed={1.05} entryOffset={[-2, 0, 0]}>
            <InsulationLayer />
          </FloatingWrapper>
        </group>
      </Canvas>
    </div>
  );
}
