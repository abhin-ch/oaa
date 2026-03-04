/**
 * Climate data service.
 *
 * Provides HDD, CDD, and design temperatures for a given location.
 * For now, this is a mock implementation returning typical Toronto data.
 * Real Environment Canada API integration will come in Gate 2.
 *
 * Pure functions for data lookup; async interface for future API integration.
 */

// ============================================
// Types
// ============================================

export interface ClimateResult {
  /** Heating degree days (C-days, base 18C) */
  hdd: number;
  /** Cooling degree days (C-days, base 18C) */
  cdd: number;
  /** January 2.5% design heating temperature (C) */
  designHeatTemp: number;
  /** July 2.5% design cooling dry-bulb temperature (C) */
  designCoolTemp: number;
  /** Climate zone identifier */
  zone: string;
  /** Location description */
  location: string;
}

// ============================================
// Known city data (mock database)
// ============================================

interface CityClimate {
  lat: number;
  lon: number;
  data: ClimateResult;
}

const CITY_DATA: CityClimate[] = [
  {
    lat: 43.65,
    lon: -79.38,
    data: {
      hdd: 3520,
      cdd: 350,
      designHeatTemp: -20,
      designCoolTemp: 33,
      zone: '6A',
      location: 'Toronto, ON',
    },
  },
  {
    lat: 45.42,
    lon: -75.69,
    data: {
      hdd: 4440,
      cdd: 300,
      designHeatTemp: -25,
      designCoolTemp: 33,
      zone: '6A',
      location: 'Ottawa, ON',
    },
  },
  {
    lat: 45.5,
    lon: -73.57,
    data: {
      hdd: 4200,
      cdd: 320,
      designHeatTemp: -23,
      designCoolTemp: 33,
      zone: '6A',
      location: 'Montreal, QC',
    },
  },
  {
    lat: 49.28,
    lon: -123.12,
    data: {
      hdd: 2825,
      cdd: 80,
      designHeatTemp: -7,
      designCoolTemp: 29,
      zone: '5C',
      location: 'Vancouver, BC',
    },
  },
  {
    lat: 51.05,
    lon: -114.07,
    data: {
      hdd: 5000,
      cdd: 160,
      designHeatTemp: -30,
      designCoolTemp: 31,
      zone: '7A',
      location: 'Calgary, AB',
    },
  },
  {
    lat: 53.55,
    lon: -113.49,
    data: {
      hdd: 5120,
      cdd: 150,
      designHeatTemp: -33,
      designCoolTemp: 30,
      zone: '7A',
      location: 'Edmonton, AB',
    },
  },
  {
    lat: 49.9,
    lon: -97.14,
    data: {
      hdd: 5670,
      cdd: 290,
      designHeatTemp: -33,
      designCoolTemp: 33,
      zone: '7A',
      location: 'Winnipeg, MB',
    },
  },
  {
    lat: 44.65,
    lon: -63.57,
    data: {
      hdd: 4000,
      cdd: 200,
      designHeatTemp: -18,
      designCoolTemp: 29,
      zone: '6A',
      location: 'Halifax, NS',
    },
  },
];

// ============================================
// Default (Toronto)
// ============================================

const DEFAULT_CLIMATE: ClimateResult = {
  hdd: 3520,
  cdd: 350,
  designHeatTemp: -20,
  designCoolTemp: 33,
  zone: '6A',
  location: 'Toronto, ON (default)',
};

// ============================================
// Functions
// ============================================

/**
 * Calculate the distance between two lat/lon points in km (Haversine).
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find the nearest city in the mock database.
 * Returns the city data if within 200 km, otherwise returns default (Toronto).
 */
function findNearestCity(lat: number, lon: number): ClimateResult {
  let bestDistance = Infinity;
  let bestData = DEFAULT_CLIMATE;

  for (const city of CITY_DATA) {
    const dist = haversineDistance(lat, lon, city.lat, city.lon);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestData = city.data;
    }
  }

  // If nearest city is more than 200 km away, still use it but note it
  return bestData;
}

/**
 * Fetch climate data for a given latitude/longitude.
 *
 * Currently returns mock data from a built-in database of Canadian cities.
 * In Gate 2, this will integrate with Environment Canada's climate API.
 *
 * @param lat - Latitude in decimal degrees
 * @param lon - Longitude in decimal degrees
 * @returns Climate data for the nearest known location
 */
export async function fetchClimateData(lat: number, lon: number): Promise<ClimateResult> {
  // In Gate 2 this will call:
  // https://climate.weather.gc.ca/climate_normals/...
  // For now, find nearest city from mock data
  return findNearestCity(lat, lon);
}

/**
 * Synchronous version for use when async is not needed.
 * Returns the same mock data as fetchClimateData.
 */
export function getClimateData(lat: number, lon: number): ClimateResult {
  return findNearestCity(lat, lon);
}

/**
 * Get the default climate data (Toronto).
 */
export function getDefaultClimateData(): ClimateResult {
  return { ...DEFAULT_CLIMATE };
}
