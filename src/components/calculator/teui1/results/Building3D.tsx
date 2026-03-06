'use client';

import type { OccupancyType } from '@/schema/building';

interface Building3DProps {
  occupancy: OccupancyType;
  area: number;
  hasEnergy: boolean;
}

export function Building3D({ occupancy, area, hasEnergy }: Building3DProps) {
  const s = Math.min(1, Math.max(0.6, area / 5000));

  return (
    <div className="building-scene" style={{ transform: `scale(${0.7 + s * 0.3})` }}>
      <div className="building-container">
        <BuildingPreset type={occupancy} hasEnergy={hasEnergy} />
      </div>
    </div>
  );
}

/* ------------------------------------------------
   Wire-frame face helper
   ------------------------------------------------ */
interface FaceProps {
  w: number;
  h: number;
  transform: string;
  pattern?: string;
  opacity?: number;
  bg?: string;
}

function Face({ w, h, transform, pattern, opacity, bg }: FaceProps) {
  return (
    <div
      className={`wire-face ${pattern ?? ''}`}
      style={{
        width: w,
        height: h,
        transform,
        opacity: opacity ?? 1,
        background: bg ?? undefined,
      }}
    />
  );
}

/* ------------------------------------------------
   Volume helper — a 3D box with front/back/left/right/top faces
   ------------------------------------------------ */
interface VolumeProps {
  w: number;
  h: number;
  d: number;
  x?: number;
  bottom?: number;
  pattern?: string;
  roofBg?: string;
  showSlabs?: number;
  children?: React.ReactNode;
}

function Volume({
  w,
  h,
  d,
  x = 0,
  bottom = 0,
  pattern,
  roofBg,
  showSlabs = 0,
  children,
}: VolumeProps) {
  const halfD = d / 2;
  const halfW = w / 2;

  const slabs = [];
  if (showSlabs > 0) {
    const spacing = h / (showSlabs + 1);
    for (let i = 1; i <= showSlabs; i++) {
      const offset = h / 2 - i * spacing;
      slabs.push(
        <Face
          key={`slab-${i}`}
          w={w}
          h={d}
          transform={`rotateX(90deg) translateZ(${offset}px)`}
          opacity={0.15}
        />,
      );
    }
  }

  return (
    <div
      className="absolute"
      style={{
        width: w,
        height: h,
        left: `calc(50% - ${w / 2 - x}px)`,
        bottom,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Front */}
      <Face w={w} h={h} transform={`translateZ(${halfD}px)`} pattern={pattern} />
      {/* Back */}
      <Face w={w} h={h} transform={`rotateY(180deg) translateZ(${halfD}px)`} />
      {/* Right */}
      <Face w={d} h={h} transform={`rotateY(90deg) translateZ(${halfW}px)`} pattern={pattern} />
      {/* Left */}
      <Face w={d} h={h} transform={`rotateY(-90deg) translateZ(${halfW}px)`} pattern={pattern} />
      {/* Roof/Top */}
      {roofBg && (
        <Face w={w} h={d} transform={`rotateX(90deg) translateZ(${h / 2}px)`} bg={roofBg} />
      )}
      {slabs}
      {children}
    </div>
  );
}

/* ------------------------------------------------
   Building presets — one per occupancy type
   ------------------------------------------------ */
function BuildingPreset({ type, hasEnergy }: { type: OccupancyType; hasEnergy: boolean }) {
  switch (type) {
    case 'office':
      return <OfficeBuilding hasEnergy={hasEnergy} />;
    case 'retail':
      return <RetailBuilding hasEnergy={hasEnergy} />;
    case 'assembly':
      return <AssemblyBuilding hasEnergy={hasEnergy} />;
    case 'institutional':
      return <InstitutionalBuilding hasEnergy={hasEnergy} />;
    case 'industrial':
      return <IndustrialBuilding hasEnergy={hasEnergy} />;
    case 'mixed':
      return <MixedBuilding hasEnergy={hasEnergy} />;
    case 'residential':
    default:
      return <ResidentialBuilding hasEnergy={hasEnergy} />;
  }
}

/* Office — Tall tower with curtain wall, glass entrance, mechanical penthouse */
function OfficeBuilding({ hasEnergy: _ }: { hasEnergy: boolean }) {
  return (
    <>
      {/* Ground floor entrance (recessed, glass) */}
      <Volume w={120} h={40} d={100} bottom={0} pattern="glass-storefront" />
      {/* Main tower body (curtain wall + floor slabs) */}
      <Volume w={140} h={280} d={140} bottom={40} pattern="curtain-wall" showSlabs={6} />
      {/* Mechanical penthouse (recessed) */}
      <Volume w={100} h={30} d={100} bottom={320} roofBg="var(--bg-sunken)" />
    </>
  );
}

/* Residential — Shorter wider body, residential windows, attic cap */
function ResidentialBuilding({ hasEnergy: _ }: { hasEnergy: boolean }) {
  return (
    <>
      {/* Main body */}
      <Volume w={160} h={140} d={120} bottom={0} pattern="residential-windows" showSlabs={2} />
      {/* Upper floor / attic */}
      <Volume w={140} h={60} d={100} bottom={140} pattern="residential-windows" />
      {/* Roof cap */}
      <Volume w={160} h={12} d={130} bottom={200} roofBg="var(--bg-sunken)" />
    </>
  );
}

/* Retail — Wide, low, large storefront glass + canopy */
function RetailBuilding({ hasEnergy: _ }: { hasEnergy: boolean }) {
  return (
    <>
      {/* Main body */}
      <Volume w={200} h={80} d={140} bottom={0} pattern="glass-storefront" />
      {/* Signage / parapet band */}
      <Volume w={210} h={20} d={145} bottom={80} roofBg="var(--bg-sunken)" />
      {/* Canopy overhang (thin, wider) */}
      <Volume w={220} h={4} d={160} bottom={60} />
    </>
  );
}

/* Assembly — Large hall with tall entrance volume */
function AssemblyBuilding({ hasEnergy: _ }: { hasEnergy: boolean }) {
  return (
    <>
      {/* Main hall */}
      <Volume w={180} h={180} d={160} bottom={0} pattern="curtain-wall" showSlabs={3} />
      {/* Entrance foyer (taller, narrower, projected forward) */}
      <Volume w={80} h={220} d={60} bottom={0} pattern="glass-storefront" />
      {/* Roof cap */}
      <Volume w={190} h={8} d={170} bottom={180} roofBg="var(--bg-sunken)" />
    </>
  );
}

/* Institutional — Symmetric body with colonnade ground floor */
function InstitutionalBuilding({ hasEnergy: _ }: { hasEnergy: boolean }) {
  return (
    <>
      {/* Colonnade base */}
      <Volume w={170} h={50} d={130} bottom={0} pattern="colonnade" />
      {/* Main body */}
      <Volume w={160} h={160} d={120} bottom={50} pattern="institutional-grid" showSlabs={3} />
      {/* Cornice / cap */}
      <Volume w={170} h={14} d={130} bottom={210} roofBg="var(--bg-sunken)" />
      {/* Cupola / penthouse */}
      <Volume w={60} h={40} d={60} bottom={224} roofBg="var(--bg-sunken)" />
    </>
  );
}

/* Industrial — Wide low bay with taller service tower */
function IndustrialBuilding({ hasEnergy: _ }: { hasEnergy: boolean }) {
  return (
    <>
      {/* Main bay (wide, low) */}
      <Volume w={200} h={100} d={160} bottom={0} pattern="industrial-panel" showSlabs={1} />
      {/* Service tower (taller, narrower, offset right) */}
      <Volume w={60} h={180} d={60} x={80} bottom={0} pattern="curtain-wall" />
      {/* Loading dock (front, short) */}
      <Volume w={80} h={50} d={30} x={-50} bottom={0} pattern="glass-storefront" />
      {/* Roof */}
      <Volume w={200} h={6} d={160} bottom={100} roofBg="var(--bg-sunken)" />
    </>
  );
}

/* Mixed Use — Tower + podium */
function MixedBuilding({ hasEnergy: _ }: { hasEnergy: boolean }) {
  return (
    <>
      {/* Podium (retail/commercial base) */}
      <Volume w={180} h={80} d={140} bottom={0} pattern="glass-storefront" showSlabs={1} />
      {/* Tower (residential/office above) */}
      <Volume w={110} h={240} d={100} x={-20} bottom={80} pattern="balcony-module" showSlabs={5} />
      {/* Tower cap */}
      <Volume w={120} h={10} d={110} x={-20} bottom={320} roofBg="var(--bg-sunken)" />
    </>
  );
}
