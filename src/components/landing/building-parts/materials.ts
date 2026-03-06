import * as THREE from 'three';

/** Shared color palette for isometric building scene. */
export const COLOR = {
  WHITE: '#ffffff',
  LIGHT: '#e5e5e5',
  LIGHT_ACCENT: '#d4d4d4',
  VERY_LIGHT: '#e8e8e8',
  MEDIUM: '#a3a3a3',
  DARK_GRAY: '#525252',
  DARK: '#1a1a1a',
  CHARCOAL: '#252525',
  VERY_DARK: '#111111',
  GLASS: '#d0dce8',
} as const;

/** Shared singleton materials — reusable across components. */
export const MAT = {
  card: new THREE.MeshStandardMaterial({ color: COLOR.WHITE, roughness: 0.9 }),
  light: new THREE.MeshStandardMaterial({ color: COLOR.LIGHT, roughness: 0.85 }),
  dark: new THREE.MeshStandardMaterial({ color: COLOR.DARK, roughness: 0.6, metalness: 0.1 }),
} as const;
