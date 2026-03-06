import { useMemo } from 'react';
import type { Building } from '@/schema/building';
import { calculateTEUI1, ZERO_RESULT, type TEUI1Result } from '@/engine/teui1';

export function useTEUI1(building: Building | null): TEUI1Result {
  return useMemo(() => {
    if (!building) return ZERO_RESULT;
    return calculateTEUI1(building);
  }, [building]);
}
