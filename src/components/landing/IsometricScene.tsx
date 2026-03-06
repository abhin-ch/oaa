'use client';

import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { FloatingWrapper } from './building-parts/FloatingWrapper';
import { BuildingCore } from './building-parts/BuildingCore';
import { SolarPanels } from './building-parts/SolarPanels';
import { HVACUnit } from './building-parts/HVACUnit';
import { EnergyMeter } from './building-parts/EnergyMeter';
import { DashboardCard } from './building-parts/DashboardCard';
import { SankeyCard } from './building-parts/SankeyCard';
import { FloorPlanCard } from './building-parts/FloorPlanCard';
import { InsulationLayer } from './building-parts/InsulationLayer';

export function IsometricScene() {
  return (
    <Canvas
      gl={{ antialias: true }}
      style={{ width: '100%', height: '100%', background: '#f5f5f5' }}
    >
      <OrthographicCamera makeDefault position={[10, 10, 10]} zoom={55} near={0.1} far={100} />

      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 12, 5]} intensity={0.9} />
      <directionalLight position={[-4, 6, -3]} intensity={0.3} />

      {/* Scene root — slight rotation for better isometric view */}
      <group rotation={[0, -Math.PI / 6, 0]}>
        {/* Central building */}
        <FloatingWrapper delay={0.3} floatAmp={0.05} floatSpeed={0.8}>
          <BuildingCore />
        </FloatingWrapper>

        {/* Solar panels above building */}
        <FloatingWrapper delay={0.6} floatAmp={0.1} floatSpeed={0.7} entryOffset={[0, 2, 0]}>
          <SolarPanels />
        </FloatingWrapper>

        {/* HVAC unit - right side */}
        <FloatingWrapper delay={0.8} floatAmp={0.06} floatSpeed={0.9}>
          <HVACUnit />
        </FloatingWrapper>

        {/* Energy meter card - top left */}
        <FloatingWrapper delay={0.5} floatAmp={0.07} floatSpeed={1.1} entryOffset={[-1.5, 1, 0]}>
          <EnergyMeter />
        </FloatingWrapper>

        {/* Dashboard bar chart - top right */}
        <FloatingWrapper delay={0.7} floatAmp={0.08} floatSpeed={0.9} entryOffset={[1.5, 1, 0]}>
          <DashboardCard />
        </FloatingWrapper>

        {/* Sankey flow diagram - bottom left */}
        <FloatingWrapper delay={0.9} floatAmp={0.06} floatSpeed={1.0} entryOffset={[-1, -1.5, 0]}>
          <SankeyCard />
        </FloatingWrapper>

        {/* Floor plan card - bottom right */}
        <FloatingWrapper delay={1.0} floatAmp={0.07} floatSpeed={0.85} entryOffset={[1, -1.5, 0]}>
          <FloorPlanCard />
        </FloatingWrapper>

        {/* Insulation cross-section - left */}
        <FloatingWrapper delay={0.6} floatAmp={0.06} floatSpeed={1.05} entryOffset={[-2, 0, 0]}>
          <InsulationLayer />
        </FloatingWrapper>
      </group>
    </Canvas>
  );
}
